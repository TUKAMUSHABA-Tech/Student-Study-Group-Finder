const db = require('../config/db');

// Helper to check if user is a member of the group
async function isGroupMember(userId, groupId, role) {
  if (role === 'admin') return true;
  const rows = await db.query(
    'SELECT id FROM memberships WHERE user_id = ? AND group_id = ?',
    [userId, groupId]
  );
  return rows.length > 0;
}

// Create a new post in a group
exports.createPost = async (req, res) => {
  try {
    const { group_id, title, content, post_type } = req.body;
    const userId = req.user.id;

    if (!group_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'group_id, title, and content are required.'
      });
    }

    // Only group members or admin can participate
    const authorized = await isGroupMember(userId, group_id, req.user.role);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Only registered members of this study group can post discussions or questions.'
      });
    }

    const type = ['discussion', 'announcement', 'question'].includes(post_type) ? post_type : 'discussion';

    const result = await db.query(
      'INSERT INTO posts (group_id, user_id, title, content, post_type) VALUES (?, ?, ?, ?, ?)',
      [group_id, userId, title.trim(), content.trim(), type]
    );

    return res.status(201).json({
      success: true,
      message: 'Post shared with group successfully!',
      postId: result.insertId
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating post.' });
  }
};

// Get all posts for a group
exports.getGroupPosts = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const userId = req.user.id;

    // Verify membership
    const authorized = await isGroupMember(userId, groupId, req.user.role);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Join this study group to access private academic discussions and resources.'
      });
    }

    const sql = `
      SELECT 
        p.id, p.group_id, p.user_id, p.title, p.content, p.post_type, p.created_at,
        u.full_name AS author_name, u.role AS author_role, u.programme AS author_programme,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.group_id = ?
      ORDER BY p.created_at DESC
    `;

    const posts = await db.query(sql, [groupId]);

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving posts.' });
  }
};

// Add a comment to a post
exports.createComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    // Verify post exists and find its group_id
    const postRows = await db.query('SELECT group_id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const groupId = postRows[0].group_id;
    const authorized = await isGroupMember(userId, groupId, req.user.role);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the group to comment.'
      });
    }

    const result = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully!',
      commentId: result.insertId
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating comment.' });
  }
};

// Get comments for a specific post
exports.getPostComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);

    const sql = `
      SELECT 
        c.id, c.post_id, c.user_id, c.content, c.created_at,
        u.full_name AS author_name, u.role AS author_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;

    const comments = await db.query(sql, [postId]);

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving comments.' });
  }
};

// Delete a post (Author, Group Leader, or Admin only)
exports.deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const postRows = await db.query(
      `SELECT p.user_id, g.leader_id 
       FROM posts p
       JOIN study_groups g ON p.group_id = g.id
       WHERE p.id = ?`,
      [postId]
    );

    if (postRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = postRows[0];
    if (post.user_id !== userId && post.leader_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post.' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully.'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting post.' });
  }
};
