import axios from 'axios';
import { broadcastNotification } from '../context/NotificationContext';

// Primary admin account definition
const PRIMARY_ADMIN = {
  id: 1,
  full_name: 'TUKAMUSHABA BAKER',
  email: 'bakertukamushaba905@gmail.com',
  password: 'Baker@123',
  programme: 'Administration',
  year_of_study: 1,
  role: 'admin',
  created_at: '2026-11-16T16:26:15.085Z'
};

// Default clean initial dataset - strictly ONLY primary admin
const initialMockStore = {
  users: [PRIMARY_ADMIN],
  groups: [],
  memberships: [],
  sessions: [],
  posts: [],
  comments: []
};

// Demo/default emails to purge permanently from all client stores
const DEMO_EMAILS = [
  'admin@ucu.ac.ug',
  'grace@ucu.ac.ug',
  'baker@ucu.ac.ug',
  'student@ucu.ac.ug',
  'leader@ucu.ac.ug'
];

function isDemoUser(u) {
  if (!u) return false;
  const email = (u.email || '').toLowerCase().trim();
  const name = (u.full_name || '').toLowerCase().trim();
  if (DEMO_EMAILS.includes(email)) return true;
  if (name === 'administrator system' || name === 'demo user') return true;
  return false;
}

function getMockStore() {
  // 1. Purge legacy obsolete store keys so they never resurrect old demo accounts
  if (typeof localStorage !== 'undefined') {
    ['ucu_gh_pages_store_v3', 'ucu_gh_pages_store_v2', 'ucu_gh_pages_store', 'ucu_gh_pages_store_v1'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  let store = null;
  const data = typeof localStorage !== 'undefined' ? localStorage.getItem('ucu_gh_pages_store_v4') : null;
  if (data) {
    try {
      store = JSON.parse(data);
    } catch (e) {
      store = null;
    }
  }

  if (!store || !Array.isArray(store.users)) {
    store = JSON.parse(JSON.stringify(initialMockStore));
  }

  // 2. Filter out ALL demo/default accounts completely
  store.users = (store.users || []).filter(u => !isDemoUser(u));

  // 3. Guarantee primary admin is always present and has admin role
  const adminIndex = store.users.findIndex(u => (u.email || '').toLowerCase() === PRIMARY_ADMIN.email.toLowerCase());
  if (adminIndex === -1) {
    store.users.unshift({ ...PRIMARY_ADMIN });
  } else {
    store.users[adminIndex].role = 'admin';
    store.users[adminIndex].full_name = 'TUKAMUSHABA BAKER';
  }

  // Ensure collections exist
  if (!Array.isArray(store.groups)) store.groups = [];
  if (!Array.isArray(store.memberships)) store.memberships = [];
  if (!Array.isArray(store.sessions)) store.sessions = [];
  if (!Array.isArray(store.posts)) store.posts = [];
  if (!Array.isArray(store.comments)) store.comments = [];

  // Persist cleaned store
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('ucu_gh_pages_store_v4', JSON.stringify(store));
    } catch (e) {}
  }

  return store;
}

function saveMockStore(store) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ucu_gh_pages_store_v4', JSON.stringify(store));
      window.dispatchEvent(new CustomEvent('ucu_store_updated', { detail: store }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'ucu_gh_pages_store_v4' }));
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
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ucu_study_token') : null;
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
  const currentUser = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('ucu_study_user') || 'null') : null;

  // Auth: Login
  if (cleanUrl === '/auth/login' && method === 'post') {
    const { email, password } = data;
    const user = store.users.find(u => (u.email || '').toLowerCase() === String(email || '').trim().toLowerCase());
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
    const existing = store.users.find(u => (u.email || '').toLowerCase() === String(email).trim().toLowerCase());
    if (existing) {
      return Promise.reject({ response: { status: 400, data: { success: false, message: 'An account with this email already exists.' } } });
    }

    const newId = Date.now();
    const newUser = {
      id: newId,
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password || '',   // Save password so user can log back in
      programme: programme || 'Bachelor of Science in Information Technology',
      year_of_study: parseInt(year_of_study, 10) || 1,
      role: 'student',
      created_at: new Date().toISOString()
    };
    // Prepend new user so it appears at top of All Registered Users list
    store.users.unshift(newUser);
    saveMockStore(store);

    // Broadcast instant notification for admin and platform
    broadcastNotification(
      'user_registered',
      `👤 New student registered: ${newUser.full_name} (${newUser.email}) - Added to All Registered Users`,
      newUser.full_name
    );

    return {
      data: {
        success: true,
        message: 'Student account registered successfully!',
        token: 'gh_pages_mock_jwt_token_' + newId,
        user: { ...newUser, password: undefined }
      }
    };
  }

  // Auth: Profile
  if (cleanUrl === '/auth/profile') {
    if (method === 'get') {
      return { data: { success: true, user: currentUser } };
    }
    if (method === 'put') {
      const u = store.users.find(x => String(x.id) === String(currentUser?.id));
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
    const userMems = store.memberships.filter(m => String(m.user_id) === String(currentUser.id));
    const groups = userMems.map(m => {
      const g = store.groups.find(x => String(x.id) === String(m.group_id));
      return g ? { ...g, membership_role: m.role } : null;
    }).filter(Boolean);
    return { data: { success: true, count: groups.length, groups } };
  }

  // Groups: Single Group Details
  if (cleanUrl.match(/^\/groups\/\d+$/) && method === 'get') {
    const id = cleanUrl.split('/')[2];
    const g = store.groups.find(x => String(x.id) === String(id));
    if (!g) return Promise.reject({ response: { status: 404, data: { message: 'Group not found' } } });
    const userMembership = currentUser ? store.memberships.find(m => String(m.user_id) === String(currentUser.id) && String(m.group_id) === String(id)) : null;
    return { data: { success: true, group: g, userMembership } };
  }

  // Groups: Create Group
  if (cleanUrl === '/groups' && method === 'post') {
    const newId = Date.now();
    const newGroup = {
      id: newId,
      name: data.name,
      course_code: (data.course_code || '').toUpperCase(),
      faculty: data.faculty,
      description: data.description,
      meeting_location: data.meeting_location,
      leader_id: currentUser ? currentUser.id : 1,
      leader_name: currentUser ? currentUser.full_name : 'TUKAMUSHABA BAKER',
      member_count: 1
    };
    store.groups.unshift(newGroup);
    if (currentUser) {
      store.memberships.push({ id: Date.now() + 1, user_id: currentUser.id, group_id: newId, role: 'leader' });
    }
    saveMockStore(store);
    broadcastNotification('group_created', `📚 New study group "${data.name}" (${(data.course_code || '').toUpperCase()}) was created!`, currentUser ? currentUser.full_name : '');
    return { data: { success: true, groupId: newId, group: newGroup } };
  }

  // Members: Join
  if (cleanUrl.match(/^\/members\/\d+\/join$/) && method === 'post') {
    const gId = cleanUrl.split('/')[2];
    const exists = store.memberships.find(m => String(m.user_id) === String(currentUser?.id) && String(m.group_id) === String(gId));
    if (exists) {
      return Promise.reject({ response: { status: 400, data: { message: 'You are already a member of this study group.' } } });
    }
    store.memberships.push({ id: Date.now(), user_id: currentUser ? currentUser.id : 1, group_id: parseInt(gId, 10), role: 'member' });
    const g = store.groups.find(x => String(x.id) === String(gId));
    if (g) g.member_count += 1;
    saveMockStore(store);
    broadcastNotification('member_joined', `👤 ${currentUser ? currentUser.full_name : 'A student'} joined the study group "${g ? g.name : ''}"!`, currentUser ? currentUser.full_name : '');
    return { data: { success: true, message: 'Joined study group!' } };
  }

  // Members: Leave
  if (cleanUrl.match(/^\/members\/\d+\/leave$/) && method === 'post') {
    const gId = cleanUrl.split('/')[2];
    store.memberships = store.memberships.filter(m => !(String(m.user_id) === String(currentUser?.id) && String(m.group_id) === String(gId)));
    const g = store.groups.find(x => String(x.id) === String(gId));
    if (g && g.member_count > 1) g.member_count -= 1;
    saveMockStore(store);
    return { data: { success: true, message: 'Left study group.' } };
  }

  // Members: List for group
  if (cleanUrl.match(/^\/members\/\d+\/members$/) && method === 'get') {
    const gId = cleanUrl.split('/')[2];
    const mems = store.memberships.filter(m => String(m.group_id) === String(gId));
    const result = mems.map(m => {
      const u = store.users.find(x => String(x.id) === String(m.user_id));
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
    const gId = cleanUrl.split('/')[3];
    const list = store.sessions.filter(s => String(s.group_id) === String(gId));
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
      created_by: currentUser ? currentUser.id : 1,
      created_by_name: currentUser ? currentUser.full_name : 'TUKAMUSHABA BAKER'
    };
    store.sessions.push(newSession);
    saveMockStore(store);
    broadcastNotification('session_created', `📅 New study session "${data.title}" scheduled for ${data.session_date}!`, currentUser ? currentUser.full_name : '');
    return { data: { success: true, message: 'Session scheduled!', sessionId: newSession.id } };
  }

  // Posts: Group posts
  if (cleanUrl.match(/^\/posts\/group\/\d+$/) && method === 'get') {
    const gId = cleanUrl.split('/')[3];
    const list = store.posts.filter(p => String(p.group_id) === String(gId));
    return { data: { success: true, count: list.length, posts: list } };
  }

  // Posts: Create post
  if (cleanUrl === '/posts' && method === 'post') {
    const newPost = {
      id: Date.now(),
      group_id: parseInt(data.group_id, 10),
      user_id: currentUser ? currentUser.id : 1,
      title: data.title,
      content: data.content,
      post_type: data.post_type || 'discussion',
      author_name: currentUser ? currentUser.full_name : 'Student',
      author_programme: currentUser ? currentUser.programme : 'BSIT',
      created_at: new Date().toISOString()
    };
    store.posts.unshift(newPost);
    saveMockStore(store);
    broadcastNotification('post_created', `💬 ${currentUser ? currentUser.full_name : 'A student'} posted "${data.title}"!`, currentUser ? currentUser.full_name : '');
    return { data: { success: true, message: 'Post created!', postId: newPost.id } };
  }

  // Comments: list
  if (cleanUrl.match(/^\/posts\/\d+\/comments$/) && method === 'get') {
    const pId = cleanUrl.split('/')[2];
    const list = store.comments.filter(c => String(c.post_id) === String(pId));
    return { data: { success: true, count: list.length, comments: list } };
  }

  // Comments: create
  if (cleanUrl.match(/^\/posts\/\d+\/comments$/) && method === 'post') {
    const pId = cleanUrl.split('/')[2];
    const newComm = {
      id: Date.now(),
      post_id: parseInt(pId, 10),
      user_id: currentUser ? currentUser.id : 1,
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
    const existing = store.users.find(u => (u.email || '').toLowerCase() === String(email).trim().toLowerCase());
    if (existing) {
      return Promise.reject({ response: { status: 400, data: { success: false, message: 'A user with this email already exists.' } } });
    }
    const newId = Date.now();
    const newUser = {
      id: newId,
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password || 'Password123!',
      programme: programme || 'Bachelor of Science in Information Technology',
      year_of_study: parseInt(year_of_study, 10) || 1,
      role: role || 'student',
      created_at: new Date().toISOString()
    };
    store.users.unshift(newUser);
    saveMockStore(store);

    broadcastNotification(
      'user_registered',
      `👤 New student registered: ${newUser.full_name} (${newUser.email}) - Added to All Registered Users`,
      newUser.full_name
    );

    return { data: { success: true, message: 'User created successfully!', user: newUser } };
  }

  // Admin: Update user role
  if (cleanUrl.startsWith('/admin/users/') && cleanUrl.endsWith('/role') && method === 'put') {
    const uId = cleanUrl.split('/')[3];
    const u = store.users.find(x => String(x.id) === String(uId));
    if (u) {
      u.role = data.role;
      saveMockStore(store);
    }
    return { data: { success: true, message: 'User role updated!' } };
  }

  // Admin: Delete user
  if (cleanUrl.startsWith('/admin/users/') && !cleanUrl.endsWith('/role') && method === 'delete') {
    const uId = cleanUrl.split('/')[3];
    // Protect primary admin from deletion
    store.users = store.users.filter(x => {
      if (String(x.id) === String(uId)) {
        if ((x.email || '').toLowerCase() === PRIMARY_ADMIN.email.toLowerCase()) {
          return true; // Protected primary admin cannot be deleted
        }
        return false;
      }
      return true;
    });
    store.memberships = store.memberships.filter(m => String(m.user_id) !== String(uId));
    saveMockStore(store);
    return { data: { success: true, message: 'User deleted successfully.' } };
  }

  // Delete group (admin)
  if (cleanUrl.match(/^\/groups\/\d+$/) && method === 'delete') {
    const gId = cleanUrl.split('/')[2];
    store.groups = store.groups.filter(x => String(x.id) !== String(gId));
    store.memberships = store.memberships.filter(m => String(m.group_id) !== String(gId));
    store.sessions = store.sessions.filter(s => String(s.group_id) !== String(gId));
    store.posts = store.posts.filter(p => String(p.group_id) !== String(gId));
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
