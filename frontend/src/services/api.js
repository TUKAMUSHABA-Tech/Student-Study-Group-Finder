import axios from 'axios';

// Default initial dataset for live GitHub Pages preview mode
const initialMockStore = {
  users: [
    {
      id: 1,
      full_name: 'Administrator System',
      email: 'admin@ucu.ac.ug',
      password: 'Password123!',
      programme: 'Administration',
      year_of_study: 1,
      role: 'admin'
    },
    {
      id: 2,
      full_name: 'Baker Mugisa',
      email: 'baker@ucu.ac.ug',
      password: 'Password123!',
      programme: 'Bachelor of Science in Information Technology',
      year_of_study: 1,
      role: 'leader'
    },
    {
      id: 3,
      full_name: 'Grace Atuhaire',
      email: 'grace@ucu.ac.ug',
      password: 'Password123!',
      programme: 'Bachelor of Science in Information Technology',
      year_of_study: 1,
      role: 'student'
    },
    {
      id: 4,
      full_name: 'Emmanuel Kigozi',
      email: 'emmanuel@ucu.ac.ug',
      password: 'Password123!',
      programme: 'Bachelor of Business Administration',
      year_of_study: 2,
      role: 'student'
    },
    {
      id: 5,
      full_name: 'Sarah Nambatya',
      email: 'sarah@ucu.ac.ug',
      password: 'Password123!',
      programme: 'Bachelor of Laws',
      year_of_study: 1,
      role: 'student'
    }
  ],
  groups: [
    {
      id: 1,
      name: 'Web Development Mastery Group',
      course_code: 'BIT 1101',
      faculty: 'Faculty of Science and Technology',
      description: 'Dedicated group for Year One IT students mastering HTML5, CSS3, JavaScript, React.js and Express backend concepts.',
      meeting_location: 'Main Library Discussion Room 3 & Zoom',
      leader_id: 2,
      leader_name: 'Baker Mugisa',
      member_count: 3
    },
    {
      id: 2,
      name: 'Structured C++ Programming Hub',
      course_code: 'BIT 1102',
      faculty: 'Faculty of Science and Technology',
      description: 'Collaborative peer code reviews, debugging pointers, arrays, functions, and exam prep for C++.',
      meeting_location: 'Tech Lab 2 (Nkoyoyo Hall)',
      leader_id: 2,
      leader_name: 'Baker Mugisa',
      member_count: 2
    },
    {
      id: 3,
      name: 'Business Accounting & Finance Study Pod',
      course_code: 'BBA 1104',
      faculty: 'Faculty of Business and Administration',
      description: 'Weekly practice group balancing ledgers, financial statements, cashflow modeling, and mid-semester revision.',
      meeting_location: 'Ham Mukasa Library Ground Floor',
      leader_id: 4,
      leader_name: 'Emmanuel Kigozi',
      member_count: 2
    },
    {
      id: 4,
      name: 'Constitutional Law Forum',
      course_code: 'LAW 1100',
      faculty: 'Faculty of Law',
      description: 'Analysis of landmark Ugandan constitutional cases, moot court preparations, and essay writing discussions.',
      meeting_location: 'Bishop Tucker Hall Room 12',
      leader_id: 5,
      leader_name: 'Sarah Nambatya',
      member_count: 1
    }
  ],
  memberships: [
    { id: 1, user_id: 2, group_id: 1, role: 'leader' },
    { id: 2, user_id: 3, group_id: 1, role: 'member' },
    { id: 3, user_id: 4, group_id: 1, role: 'member' },
    { id: 4, user_id: 2, group_id: 2, role: 'leader' },
    { id: 5, user_id: 3, group_id: 2, role: 'member' },
    { id: 6, user_id: 4, group_id: 3, role: 'leader' },
    { id: 7, user_id: 3, group_id: 3, role: 'member' },
    { id: 8, user_id: 5, group_id: 4, role: 'leader' }
  ],
  sessions: [
    {
      id: 1,
      group_id: 1,
      group_name: 'Web Development Mastery Group',
      course_code: 'BIT 1101',
      title: 'React State Management & Props Review',
      session_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      session_time: '15:00:00',
      location: 'Library Discussion Room 3',
      description: 'Hands-on session covering useState, useEffect, and passing data between components.',
      created_by: 2,
      created_by_name: 'Baker Mugisa'
    },
    {
      id: 2,
      group_id: 1,
      group_name: 'Web Development Mastery Group',
      course_code: 'BIT 1101',
      title: 'Express.js & MySQL Integration Lab',
      session_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      session_time: '16:30:00',
      location: 'Online via Zoom (link in group chat)',
      description: 'Connecting backend controllers to MySQL using mysql2 pool with parameterized queries.',
      created_by: 2,
      created_by_name: 'Baker Mugisa'
    },
    {
      id: 3,
      group_id: 2,
      group_name: 'Structured C++ Programming Hub',
      course_code: 'BIT 1102',
      title: 'C++ Pointers and Dynamic Memory Workshop',
      session_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      session_time: '14:00:00',
      location: 'Tech Lab 2',
      description: 'Tackling past exam questions on memory allocation, structs, and linked lists.',
      created_by: 2,
      created_by_name: 'Baker Mugisa'
    }
  ],
  posts: [
    {
      id: 1,
      group_id: 1,
      user_id: 2,
      title: 'Welcome to the Web & Mobile App Study Pod!',
      content: 'Hello everyone! Let us use this group to share code snippets, organize revision meetings, and help each other debug our assignments.',
      post_type: 'announcement',
      author_name: 'Baker Mugisa',
      author_programme: 'BSIT',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      group_id: 1,
      user_id: 3,
      title: 'Question about React useEffect dependency array',
      content: 'Could someone explain why omitting dependencies in useEffect causes infinite re-renders? Looking forward to our next meeting!',
      post_type: 'question',
      author_name: 'Grace Atuhaire',
      author_programme: 'BSIT',
      created_at: new Date().toISOString()
    }
  ],
  comments: [
    {
      id: 1,
      post_id: 2,
      user_id: 2,
      author_name: 'Baker Mugisa',
      content: 'Great question Grace! If you omit the dependency array completely, the effect runs after every single render.',
      created_at: new Date().toISOString()
    }
  ]
};

function getMockStore() {
  const data = localStorage.getItem('ucu_gh_pages_store');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // fallback
    }
  }
  localStorage.setItem('ucu_gh_pages_store', JSON.stringify(initialMockStore));
  return JSON.parse(JSON.stringify(initialMockStore));
}

function saveMockStore(store) {
  localStorage.setItem('ucu_gh_pages_store', JSON.stringify(store));
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
    if (user && (user.password === password || password === 'Password123!')) {
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
