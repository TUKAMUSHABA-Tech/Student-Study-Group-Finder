const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticateToken } = require('../middleware/auth');

router.post('/:groupId/join', authenticateToken, memberController.joinGroup);
router.post('/:groupId/leave', authenticateToken, memberController.leaveGroup);
router.get('/:groupId/members', authenticateToken, memberController.getGroupMembers);
router.delete('/:groupId/members/:userId', authenticateToken, memberController.removeMember);

module.exports = router;
