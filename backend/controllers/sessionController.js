const db = require('../config/db');

// Create a new study session (Group leader or Admin only)
exports.createSession = async (req, res) => {
  try {
    const { group_id, title, session_date, session_time, location, description } = req.body;
    const userId = req.user.id;

    if (!group_id || !title || !session_date || !session_time || !location) {
      return res.status(400).json({
        success: false,
        message: 'group_id, title, session_date, session_time, and location are required.'
      });
    }

    // Verify creator is leader of this group or platform admin
    const groups = await db.query('SELECT leader_id FROM study_groups WHERE id = ?', [group_id]);
    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    const group = groups[0];
    if (group.leader_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the group leader or administrator can schedule study sessions.'
      });
    }

    const result = await db.query(
      'INSERT INTO study_sessions (group_id, title, session_date, session_time, location, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [group_id, title.trim(), session_date, session_time, location.trim(), description ? description.trim() : '', userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Study session scheduled successfully!',
      sessionId: result.insertId
    });
  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({ success: false, message: 'Server error scheduling study session.' });
  }
};

// Get all sessions for a specific group
exports.getGroupSessions = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    const sql = `
      SELECT 
        s.id, s.group_id, s.title, s.session_date, s.session_time, s.location, s.description, s.created_at,
        u.full_name AS created_by_name
      FROM study_sessions s
      JOIN users u ON s.created_by = u.id
      WHERE s.group_id = ?
      ORDER BY s.session_date ASC, s.session_time ASC
    `;

    const sessions = await db.query(sql, [groupId]);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get group sessions error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving sessions.' });
  }
};

// Get upcoming sessions for groups joined by current user (for dashboard & study sessions page)
exports.getUpcomingSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        s.id, s.group_id, s.title, s.session_date, s.session_time, s.location, s.description,
        g.name AS group_name, g.course_code,
        u.full_name AS created_by_name
      FROM study_sessions s
      JOIN study_groups g ON s.group_id = g.id
      JOIN memberships m ON g.id = m.group_id
      JOIN users u ON s.created_by = u.id
      WHERE m.user_id = ? AND s.session_date >= CURDATE()
      ORDER BY s.session_date ASC, s.session_time ASC
    `;

    const sessions = await db.query(sql, [userId]);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get upcoming sessions error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving upcoming sessions.' });
  }
};

// Delete a study session
exports.deleteSession = async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const sessionRows = await db.query(
      `SELECT s.created_by, g.leader_id 
       FROM study_sessions s
       JOIN study_groups g ON s.group_id = g.id
       WHERE s.id = ?`,
      [sessionId]
    );

    if (sessionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    const session = sessionRows[0];
    if (session.created_by !== userId && session.leader_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this session.' });
    }

    await db.query('DELETE FROM study_sessions WHERE id = ?', [sessionId]);

    return res.status(200).json({
      success: true,
      message: 'Study session cancelled and removed.'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting session.' });
  }
};
