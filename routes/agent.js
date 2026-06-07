const express = require('express');
const router = express.Router();
const { getDashboard, getAddProperty, postAddProperty, getEditProperty, postEditProperty, deleteProperty, getInquiries, getNotifications } = require('../controllers/agentController');
const { ensureAgent } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/dashboard', ensureAgent, getDashboard);
router.get('/add-property', ensureAgent, getAddProperty);
router.post('/add-property', ensureAgent, upload.array('images', 10), postAddProperty);
router.get('/edit-property/:id', ensureAgent, getEditProperty);
router.post('/edit-property/:id', ensureAgent, upload.array('images', 10), postEditProperty);
router.delete('/property/:id', ensureAgent, deleteProperty);
router.get('/inquiries', ensureAgent, getInquiries);
router.get('/notifications', ensureAgent, getNotifications);

module.exports = router;
