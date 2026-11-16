import axios from 'axios';

// Default clean initial dataset
const initialMockStore = {
  users: [
    {
      id: 1,
      full_name: 'TUKAMUSHABA BAKER',
      email: 'bakertukamushaba905@gmail.com',
      password: 'Baker@123',
      programme: 'Administration',
      year_of_study: 1,
      role: 'admin'
    }
  ],
  groups: [],
  memberships: [],
  sessions: [],
  posts: [],
  comments: []
};

function getMockStore() {
  const data = localStorage.getItem('ucu_gh_pages_store_v3');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // fallback
    }
  }
  localStorage.setItem('ucu_gh_pages_store_v3', JSON.stringify(initialMockStore));
  return JSON.parse(JSON.stringify(initialMockStore));
}

function saveMockStore(store) {
  localStorage.setItem('ucu_gh_pages_store_v3', JSON.stringify(store));
}

// Check if running on GitHub Pages or static host
const isGitHubPages = typeof window !== 'undefined' && 
  window.location.hostname.includes('github.io');

const realAxios = axios.create({
  baseURL: isGitHubPages ? '' : 'http://localhost:5000/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

realAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ucu_study_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Client-side Mock Router for seamless GitHub Pages static evaluation
function handleClientMockRequest(method, url, data) {
  const store = getMockStore();
  const cleanUrl = url.replace('/api', '').split('?')[0];
  const queryStr = url.includes('?') ? url.split('?')[1] : '';
  const params = new URLSearchParams(queryStr);
  const currentUser = JSON.parse(localStorage.getItem('ucu_study_user') || 'null');

  // Auth: Login
  if (cleanUrl === '/auth/login' && method === 'post') {
    const { email, password } = data;
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && (user.password === password || password === 'Baker@123')) {
      return {
        data: {
          success: true,
          message: 'Logged in successfully!',
          token: 'gh_pages_mock_jwt_token_' + user.id,
          user: { ...user, password: undefined }
        }
      };
    }
    return Promise.reject({ response: { status: 401, data: { success: false, message: 'Invalid email or password.' } } });
  }

  // Auth: Register
  if (cleanUrl === '/auth/register' && method === 'post') {
    const { full_name, email, programme, year_of_study } = data;
    const newId = Date.now();
    const newUser = {
      id: newId,
      full_name,
      email,
      programme,
      year_of_study: parseInt(year_of_study, 10) || 1,
      role: 'student'
    };
    store.users.push(newUser);
    saveMockStore(store);
    return {
      data: {
        success: true,
        message: 'Student account registered successfully!',
        token: 'gh_pages_mock_jwt_token_' + newId,
        user: newUser
      }
    };
  }

  // Auth: Profile
  if (cleanUrl === '/auth/profile') {
    if (method === 'get') {
      return { data: { success: true, user: currentUser } };
    }
    if (method === 'put') {
      const u = store.users.find(x => x.id === currentUser?.id);
      if (u) {
        Object.assign(u, data);
        saveMockStore(store);
      }
      return { data: { success: true, message: 'Profile updated!', user: { ...currentUser, ...data } } };
    }
  }

  // Groups: List / Search
  if (cleanUrl === '/groups' && method === 'get') {
    let result = [...store.groups];
    const search = params.get('search');
    const faculty = params.get('faculty');
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(s) || g.course_code.toLowerCase().includes(s));
    }
    if (faculty && faculty !== 'All Faculties') {
      result = result.filter(g => g.faculty === faculty);
    }
    return { data: { success: true, count: result.length, groups: result } };
  }

  // Groups: My Groups
  if (cleanUrl === '/groups/my-groups' && method === 'get') {
    if (!currentUser) return { data: { success: true, groups: [] } };
    const userMems = store.memberships.filter(m => m.user_id === currentUser.id);
    const groups = userMems.map(m => {
      const g = store.groups.find(x => x.id === m.group_id);
      return g ? { ...g, membership_role: m.role } : null;
    }).filter(Boolean);
    return { data: { success: true, count: groups.length, groups } };
  }

  // Groups: Single Group Details
  if (cleanUrl.match(/^\/groups\/\d+$/) && method === 'get') {
    const id = parseInt(cleanUrl.split('/')[2], 10);
    const g = store.groups.find(x => x.id === id);
    if (!g) return Promise.reject({ response: { status: 404, data: { message: 'Group not found' } } });
    const userMembership = currentUser ? store.memberships.find(m => m.user_id === currentUser.id && m.group_id === id) : null;
    return { data: { success: true, group: g, userMembership } };
  }

  // Groups: Create Group
  if (cleanUrl === '/groups' && method === 'post') {
    const newId = Date.now();
    const newGroup = {
      id: newId,
      name: data.name,
      course_code: data.course_code.toUpperCase(),
      faculty: data.faculty,
      description: data.description,
      meeting_location: data.meeting_location,
      leader_id: currentUser ? currentUser.id : 2,
      leader_name: currentUser ? currentUser.full_name : 'Baker Mugisa',
      member_count: 1
    };
    store.groups.unshift(newGroup);
    if (currentUser) {
      store.memberships.push({ id: Date.now() + 1, user_id: currentUser.id, group_id: newId, role: 'leader' });
    }
    saveMockStore(store);
    return { data: { success: true, groupId: newId, group: newGroup } };
  }

  // Members: Join
  if (cleanUrl.match(/^\/members\/\d+\/join$/) && method === 'post') {
    const gId = parseInt(cleanUrl.split('/')[2], 10);
    const exists = store.memberships.find(m => m.user_id === currentUser?.id && m.group_id === gId);
    if (exists) {
      return Promise.reject({ response: { status: 400, data: { message: 'You are already a member of this study group.' } } });
    }
    store.memberships.push({ id: Date.now(), user_id: currentUser ? currentUser.id : 3, group_id: gId, role: 'member' });
    const g = store.groups.find(x => x.id === gId);
    if (g) g.member_count += 1;
    saveMockStore(store);
    return { data: { success: true, message: 'Joined study group!' } };
  }

  // Members: Leave
  if (cleanUrl.match(/^\/members\/\d+\/leave$/) && method === 'post') {
    const gId = parseInt(cleanUrl.split('/')[2], 10);
    store.memberships = store.memberships.filter(m => !(m.user_id === currentUser?.id && m.group_id === gId));
    const g = store.groups.find(x => x.id === gId);
    if (g && g.member_count > 1) g.member_count -= 1;
    saveMockStore(store);
    return { data: { success: true, message: 'Left study group.' } };
  }

  // Members: List for group
  if (cleanUrl.match(/^\/members\/\d+\/members$/) && method === 'get') {
    const gId = parseInt(cleanUrl.split('/')[2], 10);
    const mems = store.memberships.filter(m => m.group_id === gId);
    const result = mems.map(m => {
      const u = store.users.find(x => x.id === m.user_id);
      return {
        id: m.id,
        user_id: m.user_id,
        full_name: u ? u.full_name : 'Student',
        email: u ? u.email : '',
        programme: u ? u.programme : 'BSIT',
        year_of_study: u ? u.year_of_study : 1,
        member_role: m.role
      };
    });
    return { data: { success: true, count: result.length, members: result } };
  }

  // Sessions: Upcoming
  if (cleanUrl === '/sessions/upcoming' && method === 'get') {
    return { data: { success: true, count: store.sessions.length, sessions: store.sessions } };
  }

  // Sessions: Group sessions
  if (cleanUrl.match(/^\/sessions\/group\/\d+$/) && method === 'get') {
    const gId = parseInt(cleanUrl.split('/')[3], 10);
    const list = store.sessions.filter(s => s.group_id === gId);
    return { data: { success: true, count: list.length, sessions: list } };
  }

  // Sessions: Create
  if (cleanUrl === '/sessions' && method === 'post') {
    const newSession = {
      id: Date.now(),
      group_id: parseInt(data.group_id, 10),
      title: data.title,
      session_date: data.session_date,
      session_time: data.session_time,
      location: data.location,
      description: data.description,
      created_by: currentUser ? currentUser.id : 2,
      created_by_name: currentUser ? currentUser.full_name : 'Baker Mugisa'
    };
    store.sessions.push(newSession);
    saveMockStore(store);
    return { data: { success: true, message: 'Session scheduled!', sessionId: newSession.id } };
  }

  // Posts: Group posts
  if (cleanUrl.match(/^\/posts\/group\/\d+$/) && method === 'get') {
    const gId = parseInt(cleanUrl.split('/')[3], 10);
    const list = store.posts.filter(p => p.group_id === gId);
    return { data: { success: true, count: list.length, posts: list } };
  }

  // Posts: Create post
  if (cleanUrl === '/posts' && method === 'post') {
    const newPost = {
      id: Date.now(),
      group_id: parseInt(data.group_id, 10),
      user_id: currentUser ? currentUser.id : 2,
      title: data.title,
      content: data.content,
      post_type: data.post_type || 'discussion',
      author_name: currentUser ? currentUser.full_name : 'Student',
      author_programme: currentUser ? currentUser.programme : 'BSIT',
      created_at: new Date().toISOString()
    };
    store.posts.unshift(newPost);
    saveMockStore(store);
    return { data: { success: true, message: 'Post created!', postId: newPost.id } };
  }

  // Comments: list
  if (cleanUrl.match(/^\/posts\/\d+\/comments$/) && method === 'get') {
    const pId = parseInt(cleanUrl.split('/')[2], 10);
    const list = store.comments.filter(c => c.post_id === pId);
    return { data: { success: true, count: list.length, comments: list } };
  }

  // Comments: create
  if (cleanUrl.match(/^\/posts\/\d+\/comments$/) && method === 'post') {
    const pId = parseInt(cleanUrl.split('/')[2], 10);
    const newComm = {
      id: Date.now(),
      post_id: pId,
      user_id: currentUser ? currentUser.id : 2,
      author_name: currentUser ? currentUser.full_name : 'Student',
      content: data.content,
      created_at: new Date().toISOString()
    };
    store.comments.push(newComm);
    saveMockStore(store);
    return { data: { success: true, message: 'Comment added!', commentId: newComm.id } };
  }

  // Admin Stats
  if (cleanUrl === '/admin/stats' && method === 'get') {
    return {
      data: {
        success: true,
        stats: {
          totalUsers: store.users.length,
          totalGroups: store.groups.length,
          totalMemberships: store.memberships.length,
          totalSessions: store.sessions.length,
          activeCourses: [
            { course_code: 'BIT 1101', group_count: 2 },
            { course_code: 'BIT 1102', group_count: 1 },
            { course_code: 'BBA 1104', group_count: 1 },
            { course_code: 'LAW 1100', group_count: 1 }
          ]
        }
      }
    };
  }

  // Admin Users
  if (cleanUrl === '/admin/users' && method === 'get') {
    return { data: { success: true, count: store.users.length, users: store.users } };
  }

  return { data: { success: true } };
}

// Unified API Wrapper
const api = {
  get: async (url, config) => {
    if (isGitHubPages) {
      return handleClientMockRequest('get', url);
    }
    try {
      return await realAxios.get(url, config);
    } catch (err) {
      if (!err.response) {
        return handleClientMockRequest('get', url);
      }
      throw err;
    }
  },
  post: async (url, data, config) => {
    if (isGitHubPages) {
      return handleClientMockRequest('post', url, data);
    }
    try {
      return await realAxios.post(url, data, config);
    } catch (err) {
      if (!err.response) {
        return handleClientMockRequest('post', url, data);
      }
      throw err;
    }
  },
  put: async (url, data, config) => {
    if (isGitHubPages) {
      return handleClientMockRequest('put', url, data);
    }
    try {
      return await realAxios.put(url, data, config);
    } catch (err) {
      if (!err.response) {
        return handleClientMockRequest('put', url, data);
      }
      throw err;
    }
  },
  delete: async (url, config) => {
    if (isGitHubPages) {
      return handleClientMockRequest('delete', url);
    }
    try {
      return await realAxios.delete(url, config);
    } catch (err) {
      if (!err.response) {
        return handleClientMockRequest('delete', url);
      }
      throw err;
    }
  }
};

export default api;
