const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, postController.createPost);
router.get('/group/:groupId', authenticateToken, postController.getGroupPosts);
router.post('/:postId/comments', authenticateToken, postController.createComment);
router.get('/:postId/comments', authenticateToken, postController.getPostComments);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
