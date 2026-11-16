const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, sessionController.createSession);
router.get('/upcoming', authenticateToken, sessionController.getUpcomingSessions);
router.get('/group/:groupId', authenticateToken, sessionController.getGroupSessions);
router.delete('/:id', authenticateToken, sessionController.deleteSession);

module.exports = router;
