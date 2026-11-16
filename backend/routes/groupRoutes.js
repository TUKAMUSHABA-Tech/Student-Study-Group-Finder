const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken } = require('../middleware/auth');

// Public or optionally authenticated
router.get('/', groupController.getAllGroups);
router.get('/my-groups', authenticateToken, groupController.getMyGroups);
router.get('/:id', (req, res, next) => {
  // Optional auth middleware execution
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, groupController.getGroupById);

// Protected routes
router.post('/', authenticateToken, groupController.createGroup);
router.put('/:id', authenticateToken, groupController.updateGroup);
router.delete('/:id', authenticateToken, groupController.deleteGroup);

module.exports = router;
