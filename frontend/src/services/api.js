import axios from 'axios';
import { broadcastNotification } from '../context/NotificationContext';

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
  let store = null;
  const data = localStorage.getItem('ucu_gh_pages_store_v4');
  if (data) {
    try {
      store = JSON.parse(data);
    } catch (e) {
      // fallback
    }
  }

  // Recover any users or groups from prior versions if missing
  if (!store) {
    store = JSON.parse(JSON.stringify(initialMockStore));
  }

  // Consolidate users from any previous keys (v3, v2, v1)
  const previousKeys = ['ucu_gh_pages_store_v3', 'ucu_gh_pages_store_v2', 'ucu_gh_pages_store'];
  const userMap = new Map();

  // Master admin must always be guaranteed
  initialMockStore.users.forEach(u => userMap.set(u.email.toLowerCase(), u));

  // Add existing store users
  (store.users || []).forEach(u => userMap.set(u.email.toLowerCase(), u));

  // Merge any older keys
  previousKeys.forEach(k => {
    try {
      const oldRaw = localStorage.getItem(k);
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (oldParsed.users && Array.isArray(oldParsed.users)) {
          oldParsed.users.forEach(u => {
            if (!userMap.has(u.email.toLowerCase())) {
              userMap.set(u.email.toLowerCase(), u);
            }
          });
        }
      }
    } catch (err) {}
  });

  store.users = Array.from(userMap.values());
  localStorage.setItem('ucu_gh_pages_store_v4', JSON.stringify(store));
  return store;
}

function saveMockStore(store) {
  try {
    localStorage.setItem('ucu_gh_pages_store_v4', JSON.stringify(store));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ucu_store_updated', { detail: store }));
    }
  } catch (e) {
    console.error('saveMockStore error:', e);
  }
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
    // Match: stored password OR admin master password
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
    const { full_name, email, programme, year_of_study, password } = data;

    // Check for duplicate email
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return Promise.reject({ response: { status: 400, data: { success: false, message: 'An account with this email already exists.' } } });
    }

    const newId = Date.now();
    const newUser = {
      id: newId,
      full_name,
      email,
      password: password || '',   // ← Save password so user can log back in
      programme: programme || 'Bachelor of Science in Information Technology',
      year_of_study: parseInt(year_of_study, 10) || 1,
      role: 'student',
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveMockStore(store);
    broadcastNotification('user_registered', `📝 New student "${full_name}" just registered on the platform!`, full_name);
    return {
      data: {
        success: true,
        message: 'Student account registered successfully!',
        token: 'gh_pages_mock_jwt_token_' + newId,
        user: { ...newUser, password: undefined }   // never expose password in response
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
    broadcastNotification('group_created', `📚 New study group "${data.name}" (${data.course_code.toUpperCase()}) was created by ${currentUser ? currentUser.full_name : 'a student'}!`, currentUser ? currentUser.full_name : '');
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
    broadcastNotification('member_joined', `👤 ${currentUser ? currentUser.full_name : 'A student'} joined the study group "${g ? g.name : ''}"!`, currentUser ? currentUser.full_name : '');
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
    broadcastNotification('session_created', `📅 New study session "${data.title}" scheduled for ${data.session_date} by ${currentUser ? currentUser.full_name : 'a student'}!`, currentUser ? currentUser.full_name : '');
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
    broadcastNotification('post_created', `💬 ${currentUser ? currentUser.full_name : 'A student'} posted "${data.title}" in a study group discussion!`, currentUser ? currentUser.full_name : '');
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
    // Dynamically compute active courses from actual groups
    const courseCounts = {};
    store.groups.forEach(g => {
      courseCounts[g.course_code] = (courseCounts[g.course_code] || 0) + 1;
    });
    const activeCourses = Object.entries(courseCounts)
      .map(([course_code, group_count]) => ({ course_code, group_count }))
      .sort((a, b) => b.group_count - a.group_count)
      .slice(0, 5);

    return {
      data: {
        success: true,
        stats: {
          totalUsers: store.users.length,
          totalGroups: store.groups.length,
          totalMemberships: store.memberships.length,
          totalSessions: store.sessions.length,
          activeCourses
        }
      }
    };
  }

  // Admin Users: List
  if (cleanUrl === '/admin/users' && method === 'get') {
    return { data: { success: true, count: store.users.length, users: store.users } };
  }

  // Admin Users: Create directly from Admin Dashboard
  if (cleanUrl === '/admin/users' && method === 'post') {
    const { full_name, email, password, programme, year_of_study, role } = data;
    const existing = store.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (existing) {
      return Promise.reject({ response: { status: 400, data: { success: false, message: 'A user with this email already exists.' } } });
    }
    const newId = Date.now();
    const newUser = {
      id: newId,
      full_name,
      email,
      password: password || 'Password123!',
      programme: programme || 'Bachelor of Science in Information Technology',
      year_of_study: parseInt(year_of_study, 10) || 1,
      role: role || 'student',
      created_at: new Date().toISOString()
    };
    store.users.unshift(newUser);
    saveMockStore(store);
    broadcastNotification('user_registered', `📝 Student "${full_name}" registered and added to directory!`, full_name);
    return { data: { success: true, message: 'User created successfully!', user: newUser } };
  }

  // Admin: Update user role
  if (cleanUrl.match(/^\/admin\/users\/\d+\/role$/) && method === 'put') {
    const uId = parseInt(cleanUrl.split('/')[3], 10);
    const u = store.users.find(x => x.id === uId);
    if (u) {
      u.role = data.role;
      saveMockStore(store);
    }
    return { data: { success: true, message: 'User role updated!' } };
  }

  // Admin: Delete user
  if (cleanUrl.match(/^\/admin\/users\/\d+$/) && method === 'delete') {
    const uId = parseInt(cleanUrl.split('/')[3], 10);
    store.users = store.users.filter(x => x.id !== uId);
    store.memberships = store.memberships.filter(m => m.user_id !== uId);
    saveMockStore(store);
    return { data: { success: true, message: 'User deleted.' } };
  }

  // Delete group (admin)
  if (cleanUrl.match(/^\/groups\/\d+$/) && method === 'delete') {
    const gId = parseInt(cleanUrl.split('/')[2], 10);
    store.groups = store.groups.filter(x => x.id !== gId);
    store.memberships = store.memberships.filter(m => m.group_id !== gId);
    store.sessions = store.sessions.filter(s => s.group_id !== gId);
    store.posts = store.posts.filter(p => p.group_id !== gId);
    saveMockStore(store);
    return { data: { success: true, message: 'Group deleted.' } };
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
