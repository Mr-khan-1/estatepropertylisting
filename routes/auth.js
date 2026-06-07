const express = require('express');
const router = express.Router();
const { getRegister, postRegister, getLogin, postLogin, logout } = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth');

router.get('/register', forwardAuthenticated, getRegister);
router.post('/register', forwardAuthenticated, postRegister);
router.get('/login', forwardAuthenticated, getLogin);
router.post('/login', postLogin);
router.get('/logout', logout);

module.exports = router;
