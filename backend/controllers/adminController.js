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
