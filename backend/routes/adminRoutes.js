const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// All admin routes strictly require role: 'admin'
router.use(authenticateToken);
router.use(requireRoles(['admin']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
