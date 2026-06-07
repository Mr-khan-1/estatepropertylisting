module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/auth/login');
  },
  ensureAgent: (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'agent' || req.user.role === 'admin')) return next();
    req.flash('error_msg', 'Access denied. Agent account required.');
    res.redirect('/');
  },
  ensureAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    req.flash('error_msg', 'Access denied. Admin account required.');
    res.redirect('/');
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
  }
};
