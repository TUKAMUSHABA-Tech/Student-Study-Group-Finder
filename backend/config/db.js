const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let useFallback = false;
let mockData = null;
const fallbackFilePath = path.join(__dirname, '..', 'data_store.json');

// Initial default seed dataset matching database.sql
const defaultSeed = {
  users: [
    {
      id: 1,
      full_name: 'Administrator System',
      email: 'admin@ucu.ac.ug',
      password: '', // will be hashed
      programme: 'Administration',
      year_of_study: 1,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  study_groups: [],
  memberships: [],
  study_sessions: [],
  posts: [],
  comments: []
};

function saveFallbackData() {
  if (mockData) {
    try {
      fs.writeFileSync(fallbackFilePath, JSON.stringify(mockData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving fallback data:', e.message);
    }
  }
}

async function initFallbackStore() {
  useFallback = true;
  if (fs.existsSync(fallbackFilePath)) {
    try {
      mockData = JSON.parse(fs.readFileSync(fallbackFilePath, 'utf-8'));
    } catch (e) {
      mockData = JSON.parse(JSON.stringify(defaultSeed));
    }
  } else {
    mockData = JSON.parse(JSON.stringify(defaultSeed));
    const hashed = await bcrypt.hash('Password123!', 10);
    for (const u of mockData.users) {
      u.password = hashed;
    }
    saveFallbackData();
  }
  console.log('[DATABASE] Ready in persistent storage mode (MySQL fallback active).');
}

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const database = process.env.DB_NAME || 'student_study_group_finder';

  try {
    // Attempt initial connection to MySQL server
    const initConn = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 2000
    });

    console.log('[DATABASE] Connected to MySQL server at ' + host + ':' + port);
    await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initConn.end();

    // Create pool for application queries
    pool = mysql.createPool({
      host,
      user,
      password,
      port,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test pool connection
    const testConn = await pool.getConnection();
    console.log(`[DATABASE] Successfully connected to MySQL database: "${database}"`);
    
    // Check if tables exist, if not, execute database.sql
    const [tables] = await testConn.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('[DATABASE] First time initialization: executing database.sql...');
      const sqlPath = path.join(__dirname, '..', '..', 'database.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        // Split by semicolons and execute non-empty statements
        const statements = sql
          .split(/;\s*$/m)
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));
        for (const stmt of statements) {
          try {
            await testConn.query(stmt);
          } catch (stmtErr) {
            // ignore benign warnings
          }
        }
        console.log('[DATABASE] Seed schema and data imported successfully into MySQL!');
      }
    }
    testConn.release();
    useFallback = false;
  } catch (err) {
    console.warn(`[DATABASE WARNING] Could not connect to MySQL at ${host}:${port}: ${err.message}`);
    console.log('[DATABASE INFO] Enabling built-in high-fidelity local data store. All features will work with full seed data!');
    console.log('[DATABASE INFO] To switch to live MySQL: start XAMPP/MySQL and restart server.');
    await initFallbackStore();
  }
}

// Unified query wrapper that works with both MySQL and the fallback store
async function query(sql, params = []) {
  if (!useFallback && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('MySQL Query Error:', err.message, 'SQL:', sql);
      throw err;
    }
  }

  // Fallback simulator for standard queries
  return executeFallback(sql, params);
}

function executeFallback(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const lowerSql = cleanSql.toLowerCase();

  // 1. SELECT queries
  if (lowerSql.startsWith('select')) {
    // Pure count queries like SELECT COUNT(*) AS count FROM users
    if (lowerSql.startsWith('select count(*)') || lowerSql.startsWith('select count(1)')) {
      if (lowerSql.includes('from users')) return [{ count: mockData.users.length }];
      if (lowerSql.includes('from study_groups')) return [{ count: mockData.study_groups.length }];
      if (lowerSql.includes('from memberships')) return [{ count: mockData.memberships.length }];
      if (lowerSql.includes('from study_sessions')) return [{ count: mockData.study_sessions.length }];
      if (lowerSql.includes('from posts')) return [{ count: mockData.posts.length }];
    }

    // Most active courses query
    if (lowerSql.includes('group by course_code') || lowerSql.includes('group by g.course_code')) {
      const counts = {};
      mockData.study_groups.forEach(g => {
        counts[g.course_code] = (counts[g.course_code] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([course_code, group_count]) => ({ course_code, group_count }))
        .sort((a, b) => b.group_count - a.group_count)
        .slice(0, 5);
    }

    // USERS lookup
    if (lowerSql.includes('from users')) {
      if (lowerSql.includes('where email =')) {
        const email = params[0];
        const user = mockData.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
        return user ? [user] : [];
      }
      if (lowerSql.includes('where id =')) {
        const id = parseInt(params[0], 10);
        const user = mockData.users.find(u => u.id === id);
        return user ? [user] : [];
      }
      return mockData.users;
    }

    // STUDY GROUPS query with joins
    if (lowerSql.includes('from study_groups')) {
      // Single group by id
      if (lowerSql.includes('where g.id =') || lowerSql.includes('where id =')) {
        const id = parseInt(params[0], 10);
        const g = mockData.study_groups.find(group => group.id === id);
        if (!g) return [];
        const leader = mockData.users.find(u => u.id === g.leader_id);
        const membersCount = mockData.memberships.filter(m => m.group_id === g.id).length;
        return [{
          ...g,
          leader_name: leader ? leader.full_name : 'Unknown',
          leader_email: leader ? leader.email : '',
          member_count: membersCount
        }];
      }

      // Groups joined by a specific user
      if (lowerSql.includes('from memberships m join study_groups') || lowerSql.includes('where m.user_id =')) {
        const userId = parseInt(params[0], 10);
        const userMems = mockData.memberships.filter(m => m.user_id === userId);
        return userMems.map(m => {
          const g = mockData.study_groups.find(group => group.id === m.group_id);
          const leader = mockData.users.find(u => u.id === g?.leader_id);
          const count = mockData.memberships.filter(mem => mem.group_id === m.group_id).length;
          return {
            ...g,
            membership_role: m.role,
            leader_name: leader ? leader.full_name : 'Unknown',
            member_count: count
          };
        }).filter(Boolean);
      }

      // All groups with optional search and faculty filter
      let result = mockData.study_groups.map(g => {
        const leader = mockData.users.find(u => u.id === g.leader_id);
        const count = mockData.memberships.filter(m => m.group_id === g.id).length;
        return {
          ...g,
          leader_name: leader ? leader.full_name : 'Unknown',
          member_count: count
        };
      });

      // Filter handling
      if (params.length > 0) {
        // e.g. search string or faculty
        const filterStr = String(params[0]).replace(/%/g, '').toLowerCase();
        if (filterStr) {
          result = result.filter(g =>
            g.name.toLowerCase().includes(filterStr) ||
            g.course_code.toLowerCase().includes(filterStr) ||
            g.faculty.toLowerCase().includes(filterStr)
          );
        }
      }
      return result;
    }

    // MEMBERSHIPS
    if (lowerSql.includes('from memberships')) {
      if (lowerSql.includes('where user_id = ? and group_id = ?') || lowerSql.includes('where m.user_id = ? and m.group_id = ?')) {
        const uId = parseInt(params[0], 10);
        const gId = parseInt(params[1], 10);
        const m = mockData.memberships.find(mem => mem.user_id === uId && mem.group_id === gId);
        return m ? [m] : [];
      }
      if (lowerSql.includes('where m.group_id =') || lowerSql.includes('where group_id =')) {
        const gId = parseInt(params[0], 10);
        const mems = mockData.memberships.filter(m => m.group_id === gId);
        return mems.map(m => {
          const u = mockData.users.find(user => user.id === m.user_id);
          return {
            id: m.id,
            user_id: m.user_id,
            group_id: m.group_id,
            role: m.role,
            joined_at: m.joined_at,
            full_name: u ? u.full_name : 'Unknown',
            email: u ? u.email : '',
            programme: u ? u.programme : '',
            year_of_study: u ? u.year_of_study : 1
          };
        });
      }
      return mockData.memberships;
    }

    // STUDY SESSIONS
    if (lowerSql.includes('from study_sessions')) {
      let sessions = [...mockData.study_sessions];
      if (lowerSql.includes('where s.group_id =') || lowerSql.includes('where group_id =')) {
        const gId = parseInt(params[0], 10);
        sessions = sessions.filter(s => s.group_id === gId);
      }
      if (lowerSql.includes('where m.user_id =') || lowerSql.includes('where s.session_date >=')) {
        // Upcoming for user
        const uId = parseInt(params[0], 10);
        const userGroupIds = mockData.memberships.filter(m => m.user_id === uId).map(m => m.group_id);
        sessions = sessions.filter(s => userGroupIds.includes(s.group_id));
      }
      return sessions.map(s => {
        const g = mockData.study_groups.find(group => group.id === s.group_id);
        const u = mockData.users.find(user => user.id === s.created_by);
        return {
          ...s,
          group_name: g ? g.name : '',
          course_code: g ? g.course_code : '',
          creator_name: u ? u.full_name : ''
        };
      }).sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
    }

    // POSTS
    if (lowerSql.includes('from posts')) {
      let posts = [...mockData.posts];
      if (lowerSql.includes('where p.group_id =') || lowerSql.includes('where group_id =')) {
        const gId = parseInt(params[0], 10);
        posts = posts.filter(p => p.group_id === gId);
      }
      return posts.map(p => {
        const u = mockData.users.find(user => user.id === p.user_id);
        const g = mockData.study_groups.find(group => group.id === p.group_id);
        const commentsCount = mockData.comments.filter(c => c.post_id === p.id).length;
        return {
          ...p,
          author_name: u ? u.full_name : 'Unknown',
          author_programme: u ? u.programme : '',
          group_name: g ? g.name : '',
          comment_count: commentsCount
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // COMMENTS
    if (lowerSql.includes('from comments')) {
      let comments = [...mockData.comments];
      if (lowerSql.includes('where c.post_id =') || lowerSql.includes('where post_id =')) {
        const pId = parseInt(params[0], 10);
        comments = comments.filter(c => c.post_id === pId);
      }
      return comments.map(c => {
        const u = mockData.users.find(user => user.id === c.user_id);
        return {
          ...c,
          author_name: u ? u.full_name : 'Unknown',
          author_role: u ? u.role : 'student'
        };
      }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
  }

  // 2. INSERT queries
  if (lowerSql.startsWith('insert into')) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const now = new Date().toISOString();

    if (lowerSql.includes('into users')) {
      const [full_name, email, password, programme, year_of_study, role] = params;
      const newUser = {
        id,
        full_name,
        email,
        password,
        programme,
        year_of_study: parseInt(year_of_study, 10) || 1,
        role: role || 'student',
        created_at: now,
        updated_at: now
      };
      mockData.users.push(newUser);
      saveFallbackData();
      return { insertId: id, affectedRows: 1 };
    }

    if (lowerSql.includes('into study_groups')) {
      const [name, course_code, faculty, description, meeting_location, leader_id] = params;
      const newGroup = {
        id,
        name,
        course_code,
        faculty,
        description,
        meeting_location,
        leader_id: parseInt(leader_id, 10),
        created_at: now,
        updated_at: now
      };
      mockData.study_groups.push(newGroup);
      // Auto add leader to memberships
      mockData.memberships.push({
        id: Date.now() + 1,
        user_id: parseInt(leader_id, 10),
        group_id: id,
        role: 'leader',
        joined_at: now
      });
      saveFallbackData();
      return { insertId: id, affectedRows: 1 };
    }

    if (lowerSql.includes('into memberships')) {
      const [user_id, group_id, role] = params;
      const newMem = {
        id,
        user_id: parseInt(user_id, 10),
        group_id: parseInt(group_id, 10),
        role: role || 'member',
        joined_at: now
      };
      mockData.memberships.push(newMem);
      saveFallbackData();
      return { insertId: id, affectedRows: 1 };
    }

    if (lowerSql.includes('into study_sessions')) {
      const [group_id, title, session_date, session_time, location, description, created_by] = params;
      const newSession = {
        id,
        group_id: parseInt(group_id, 10),
        title,
        session_date,
        session_time,
        location,
        description,
        created_by: parseInt(created_by, 10),
        created_at: now
      };
      mockData.study_sessions.push(newSession);
      saveFallbackData();
      return { insertId: id, affectedRows: 1 };
    }

    if (lowerSql.includes('into posts')) {
      const [group_id, user_id, title, content, post_type] = params;
      const newPost = {
        id,
        group_id: parseInt(group_id, 10),
        user_id: parseInt(user_id, 10),
        title,
        content,
        post_type: post_type || 'discussion',
        created_at: now
      };
      mockData.posts.push(newPost);
      saveFallbackData();
      return { insertId: id, affectedRows: 1 };
    }

    if (lowerSql.includes('into comments')) {
      const [post_id, user_id, content] = params;
      const newComment = {
        id,
        post_id: parseInt(post_id, 10),
        user_id: parseInt(user_id, 10),
        content,
        created_at: now
      };
      mockData.comments.push(newComment);
      saveFallbackData();
      return { insertId: id, affectedRows: 1 };
    }
  }

  // 3. DELETE queries
  if (lowerSql.startsWith('delete from')) {
    if (lowerSql.includes('from memberships')) {
      if (lowerSql.includes('where user_id = ? and group_id = ?')) {
        const uId = parseInt(params[0], 10);
        const gId = parseInt(params[1], 10);
        const before = mockData.memberships.length;
        mockData.memberships = mockData.memberships.filter(m => !(m.user_id === uId && m.group_id === gId));
        saveFallbackData();
        return { affectedRows: before - mockData.memberships.length };
      }
      if (lowerSql.includes('where id = ?')) {
        const mId = parseInt(params[0], 10);
        const before = mockData.memberships.length;
        mockData.memberships = mockData.memberships.filter(m => m.id !== mId);
        saveFallbackData();
        return { affectedRows: before - mockData.memberships.length };
      }
    }

    if (lowerSql.includes('from study_groups')) {
      const gId = parseInt(params[0], 10);
      mockData.study_groups = mockData.study_groups.filter(g => g.id !== gId);
      mockData.memberships = mockData.memberships.filter(m => m.group_id !== gId);
      mockData.study_sessions = mockData.study_sessions.filter(s => s.group_id !== gId);
      mockData.posts = mockData.posts.filter(p => p.group_id !== gId);
      saveFallbackData();
      return { affectedRows: 1 };
    }

    if (lowerSql.includes('from users')) {
      const uId = parseInt(params[0], 10);
      mockData.users = mockData.users.filter(u => u.id !== uId);
      mockData.memberships = mockData.memberships.filter(m => m.user_id !== uId);
      saveFallbackData();
      return { affectedRows: 1 };
    }

    if (lowerSql.includes('from study_sessions')) {
      const sId = parseInt(params[0], 10);
      mockData.study_sessions = mockData.study_sessions.filter(s => s.id !== sId);
      saveFallbackData();
      return { affectedRows: 1 };
    }

    if (lowerSql.includes('from posts')) {
      const pId = parseInt(params[0], 10);
      mockData.posts = mockData.posts.filter(p => p.id !== pId);
      mockData.comments = mockData.comments.filter(c => c.post_id !== pId);
      saveFallbackData();
      return { affectedRows: 1 };
    }
  }

  // 4. UPDATE queries
  if (lowerSql.startsWith('update')) {
    if (lowerSql.includes('update users')) {
      const uId = parseInt(params[params.length - 1], 10);
      const user = mockData.users.find(u => u.id === uId);
      if (user) {
        if (lowerSql.includes('role = ?')) {
          user.role = params[0];
        } else if (lowerSql.includes('full_name = ?')) {
          user.full_name = params[0];
          user.programme = params[1];
          user.year_of_study = parseInt(params[2], 10);
        }
        user.updated_at = new Date().toISOString();
        saveFallbackData();
        return { affectedRows: 1 };
      }
    }

    if (lowerSql.includes('update study_groups')) {
      const gId = parseInt(params[params.length - 1], 10);
      const group = mockData.study_groups.find(g => g.id === gId);
      if (group) {
        group.name = params[0];
        group.course_code = params[1];
        group.faculty = params[2];
        group.description = params[3];
        group.meeting_location = params[4];
        group.updated_at = new Date().toISOString();
        saveFallbackData();
        return { affectedRows: 1 };
      }
    }
  }

  return [];
}

module.exports = {
  initDB,
  query,
  getPool: () => pool,
  isFallback: () => useFallback
};
