const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

exports.getRegister = (req, res) => res.render('auth/register', { title: 'Register' });

exports.postRegister = async (req, res) => {
  const { name, email, password, password2, role, phone } = req.body;
  let errors = [];
  if (!name || !email || !password || !password2) errors.push({ msg: 'Please fill all fields' });
  if (password !== password2) errors.push({ msg: 'Passwords do not match' });
  if (password && password.length < 6) errors.push({ msg: 'Password must be at least 6 characters' });
  if (errors.length > 0) return res.render('auth/register', { title: 'Register', errors, name, email });
  try {
    const existing = await User.findOne({ email });
    if (existing) { errors.push({ msg: 'Email already registered' }); return res.render('auth/register', { title: 'Register', errors, name, email }); }
    const userRole = (role === 'agent') ? 'agent' : 'user';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashed, role: userRole, phone: phone || '' });
    await user.save();
    req.flash('success_msg', 'Registration successful! Please login.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { title: 'Register', errors: [{ msg: 'Server error, try again' }] });
  }
};

exports.getLogin = (req, res) => res.render('auth/login', { title: 'Login' });

exports.postLogin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/auth/login');
  });
};
