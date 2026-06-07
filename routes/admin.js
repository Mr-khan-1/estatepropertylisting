const express = require('express');
const router = express.Router();
const { getDashboard, getPendingProperties, approveProperty, rejectProperty, getAllProperties, getFlaggedProperties, clearFlag, getUsers, toggleUser, deleteUser } = require('../controllers/adminController');
const { ensureAdmin } = require('../middleware/auth');

router.get('/dashboard', ensureAdmin, getDashboard);
router.get('/pending', ensureAdmin, getPendingProperties);
router.post('/approve/:id', ensureAdmin, approveProperty);
router.post('/reject/:id', ensureAdmin, rejectProperty);
router.get('/properties', ensureAdmin, getAllProperties);
router.get('/flagged', ensureAdmin, getFlaggedProperties);
router.post('/clear-flag/:id', ensureAdmin, clearFlag);
router.get('/users', ensureAdmin, getUsers);
router.post('/toggle-user/:id', ensureAdmin, toggleUser);
router.delete('/user/:id', ensureAdmin, deleteUser);

module.exports = router;
