const db = require('../config/db');

// Create a new study group
exports.createGroup = async (req, res) => {
  try {
    const { name, course_code, faculty, description, meeting_location } = req.body;
    const leader_id = req.user.id;

    if (!name || !course_code || !faculty || !description || !meeting_location) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, course_code, faculty, description, meeting_location.'
      });
    }

    // Insert new group
    const result = await db.query(
      'INSERT INTO study_groups (name, course_code, faculty, description, meeting_location, leader_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), course_code.trim().toUpperCase(), faculty.trim(), description.trim(), meeting_location.trim(), leader_id]
    );

    const groupId = result.insertId;

    // Automatically create membership for creator as 'leader'
    await db.query(
      'INSERT INTO memberships (user_id, group_id, role) VALUES (?, ?, ?)',
      [leader_id, groupId, 'leader']
    );

    // If user's global role is 'student', upgrade to 'leader'
    if (req.user.role === 'student') {
      await db.query('UPDATE users SET role = ? WHERE id = ?', ['leader', leader_id]);
    }

    return res.status(201).json({
      success: true,
      message: 'Study group created successfully! You are now the group leader.',
      groupId,
      group: {
        id: groupId,
        name: name.trim(),
        course_code: course_code.trim().toUpperCase(),
        faculty: faculty.trim(),
        description: description.trim(),
        meeting_location: meeting_location.trim(),
        leader_id
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating study group.' });
  }
};

// Get all study groups with optional search and faculty filter
exports.getAllGroups = async (req, res) => {
  try {
    const { search, faculty } = req.query;

    let sql = `
      SELECT 
        g.id, g.name, g.course_code, g.faculty, g.description, g.meeting_location, g.leader_id, g.created_at,
        u.full_name AS leader_name,
        COUNT(m.id) AS member_count
      FROM study_groups g
      JOIN users u ON g.leader_id = u.id
      LEFT JOIN memberships m ON g.id = m.group_id
    `;

    const whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(g.name LIKE ? OR g.course_code LIKE ? OR g.description LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (faculty && faculty !== 'All Faculties') {
      whereClauses.push('g.faculty = ?');
      params.push(faculty.trim());
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY g.id ORDER BY g.created_at DESC';

    const groups = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    console.error('Get groups error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving study groups.' });
  }
};

// Get single study group details
exports.getGroupById = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);

    const sql = `
      SELECT 
        g.id, g.name, g.course_code, g.faculty, g.description, g.meeting_location, g.leader_id, g.created_at,
        u.full_name AS leader_name, u.email AS leader_email,
        COUNT(m.id) AS member_count
      FROM study_groups g
      JOIN users u ON g.leader_id = u.id
      LEFT JOIN memberships m ON g.id = m.group_id
      WHERE g.id = ?
      GROUP BY g.id
    `;

    const groups = await db.query(sql, [groupId]);

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    const group = groups[0];

    // Check if current requesting user is a member/leader
    let userMembership = null;
    if (req.user) {
      const membershipRows = await db.query(
        'SELECT * FROM memberships WHERE user_id = ? AND group_id = ?',
        [req.user.id, groupId]
      );
      if (membershipRows.length > 0) {
        userMembership = membershipRows[0];
      }
    }

    return res.status(200).json({
      success: true,
      group,
      userMembership
    });
  } catch (error) {
    console.error('Get group details error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving group details.' });
  }
};

// Get study groups joined or created by the logged-in student
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        g.id, g.name, g.course_code, g.faculty, g.description, g.meeting_location, g.leader_id,
        m.role AS membership_role, m.joined_at,
        u.full_name AS leader_name,
        (SELECT COUNT(*) FROM memberships WHERE group_id = g.id) AS member_count
      FROM memberships m
      JOIN study_groups g ON m.group_id = g.id
      JOIN users u ON g.leader_id = u.id
      WHERE m.user_id = ?
      ORDER BY m.joined_at DESC
    `;

    const groups = await db.query(sql, [userId]);

    return res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving your groups.' });
  }
};

// Update group details (Leader of group or Admin only)
exports.updateGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const { name, course_code, faculty, description, meeting_location } = req.body;

    const groupRows = await db.query('SELECT leader_id FROM study_groups WHERE id = ?', [groupId]);
    if (groupRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    const group = groupRows[0];

    // Authorization: only group leader or platform admin can update
    if (group.leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the group leader or admin can edit group details.' });
    }

    await db.query(
      'UPDATE study_groups SET name = ?, course_code = ?, faculty = ?, description = ?, meeting_location = ? WHERE id = ?',
      [name.trim(), course_code.trim().toUpperCase(), faculty.trim(), description.trim(), meeting_location.trim(), groupId]
    );

    return res.status(200).json({
      success: true,
      message: 'Study group updated successfully!'
    });
  } catch (error) {
    console.error('Update group error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating study group.' });
  }
};

// Delete study group
exports.deleteGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);

    const groupRows = await db.query('SELECT leader_id FROM study_groups WHERE id = ?', [groupId]);
    if (groupRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    const group = groupRows[0];

    if (group.leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this group.' });
    }

    await db.query('DELETE FROM study_groups WHERE id = ?', [groupId]);

    return res.status(200).json({
      success: true,
      message: 'Study group deleted successfully.'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting study group.' });
  }
};
