const db = require('../config/db');

// Join a study group
exports.joinGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const userId = req.user.id;

    // Check if group exists
    const groups = await db.query('SELECT id, leader_id FROM study_groups WHERE id = ?', [groupId]);
    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    // Check for duplicate membership
    const existing = await db.query(
      'SELECT id FROM memberships WHERE user_id = ? AND group_id = ?',
      [userId, groupId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this study group.'
      });
    }

    // Insert membership
    await db.query(
      'INSERT INTO memberships (user_id, group_id, role) VALUES (?, ?, ?)',
      [userId, groupId, 'member']
    );

    return res.status(201).json({
      success: true,
      message: 'You have successfully joined the study group!'
    });
  } catch (error) {
    console.error('Join group error:', error);
    return res.status(500).json({ success: false, message: 'Server error joining study group.' });
  }
};

// Leave a study group
exports.leaveGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const userId = req.user.id;

    // Check if user is the leader
    const groups = await db.query('SELECT leader_id FROM study_groups WHERE id = ?', [groupId]);
    if (groups.length > 0 && groups[0].leader_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'As the group leader, you cannot leave your own group. Transfer leadership or delete the group.'
      });
    }

    // Delete membership
    const result = await db.query(
      'DELETE FROM memberships WHERE user_id = ? AND group_id = ?',
      [userId, groupId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'You are not a member of this group.' });
    }

    return res.status(200).json({
      success: true,
      message: 'You have left the study group.'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    return res.status(500).json({ success: false, message: 'Server error leaving group.' });
  }
};

// View group members
exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    const sql = `
      SELECT 
        m.id AS membership_id, m.role AS member_role, m.joined_at,
        u.id AS user_id, u.full_name, u.email, u.programme, u.year_of_study
      FROM memberships m
      JOIN users u ON m.user_id = u.id
      WHERE m.group_id = ?
      ORDER BY m.role DESC, m.joined_at ASC
    `;

    const members = await db.query(sql, [groupId]);

    return res.status(200).json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    console.error('Get members error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving members.' });
  }
};

// Remove a member (by group leader or admin)
exports.removeMember = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const memberUserId = parseInt(req.params.userId, 10);

    // Verify requesting user is group leader or platform admin
    const groups = await db.query('SELECT leader_id FROM study_groups WHERE id = ?', [groupId]);
    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    const group = groups[0];
    if (group.leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the group leader or administrator can remove members.'
      });
    }

    // Leader cannot remove themselves
    if (group.leader_id === memberUserId) {
      return res.status(400).json({
        success: false,
        message: 'The group leader cannot be removed from the member list.'
      });
    }

    await db.query(
      'DELETE FROM memberships WHERE user_id = ? AND group_id = ?',
      [memberUserId, groupId]
    );

    return res.status(200).json({
      success: true,
      message: 'Member removed from the study group successfully.'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ success: false, message: 'Server error removing member.' });
  }
};
