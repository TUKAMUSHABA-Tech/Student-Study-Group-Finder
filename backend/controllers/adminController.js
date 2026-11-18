const db = require('../config/db');

// Get overall platform analytics and metrics
exports.getStats = async (req, res) => {
  try {
    // 1. Total registered users
    const userCountRows = await db.query('SELECT COUNT(*) AS count FROM users');
    const totalUsers = userCountRows[0]?.count || 0;

    // 2. Total study groups
    const groupCountRows = await db.query('SELECT COUNT(*) AS count FROM study_groups');
    const totalGroups = groupCountRows[0]?.count || 0;

    // 3. Total memberships
    const memCountRows = await db.query('SELECT COUNT(*) AS count FROM memberships');
    const totalMemberships = memCountRows[0]?.count || 0;

    // 4. Total sessions
    const sessionCountRows = await db.query('SELECT COUNT(*) AS count FROM study_sessions');
    const totalSessions = sessionCountRows[0]?.count || 0;

    // 5. Total discussions/posts
    const postCountRows = await db.query('SELECT COUNT(*) AS count FROM posts');
    const totalPosts = postCountRows[0]?.count || 0;

    // 6. Most active courses
    const activeCourses = await db.query(`
      SELECT 
        g.course_code, 
        COUNT(g.id) AS group_count,
        COUNT(DISTINCT m.user_id) AS total_students
      FROM study_groups g
      LEFT JOIN memberships m ON g.id = m.group_id
      GROUP BY g.course_code
      ORDER BY group_count DESC, total_students DESC
      LIMIT 5
    `);

    // 7. Recent platform activities (latest users, latest groups, latest sessions)
    const recentUsers = await db.query(
      'SELECT id, full_name, email, programme, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    const recentGroups = await db.query(
      'SELECT id, name, course_code, faculty, created_at FROM study_groups ORDER BY created_at DESC LIMIT 5'
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalGroups,
        totalMemberships,
        totalSessions,
        totalPosts,
        activeCourses,
        recentUsers,
        recentGroups
      }
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics.' });
  }
};

// Get all users for admin management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, full_name, email, programme, year_of_study, role, created_at FROM users ORDER BY created_at DESC'
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Admin getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving users list.' });
  }
};

// Create a new student/user directly from admin dashboard
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, programme, year_of_study, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role && ['student', 'leader', 'admin'].includes(role) ? role : 'student';
    const year = parseInt(year_of_study, 10) || 1;

    const result = await db.query(
      'INSERT INTO users (full_name, email, password, programme, year_of_study, role) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name.trim(), email.trim().toLowerCase(), hashedPassword, (programme || 'General Studies').trim(), year, assignedRole]
    );

    const newUser = {
      id: result.insertId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      programme: (programme || 'General Studies').trim(),
      year_of_study: year,
      role: assignedRole,
      created_at: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'New user registered and added to directory successfully!',
      user: newUser
    });
  } catch (error) {
    console.error('Admin createUser error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating user.' });
  }
};

// Update user role (e.g. promote to leader or admin)
exports.updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['student', 'leader', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`
    });
  } catch (error) {
    console.error('Admin updateUserRole error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating user role.' });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'User removed from platform successfully.'
    });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
};
