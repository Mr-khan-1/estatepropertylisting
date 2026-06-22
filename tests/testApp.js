// tests/testApp.js
// Creates the Express app with in-memory session store (no MongoDB needed)
// Used ONLY by api.test.js and e2e.test.js — production app.js is unchanged.

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

require('../config/passport')(passport);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MemoryStore — works without any DB connection
app.use(session({
  secret: process.env.SESSION_SECRET || 'test_secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: 86400000 }),
  cookie: { maxAge: 86400000 },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.GOOGLE_MAPS_API_KEY = '';
  next();
});

const { getHome } = require('../controllers/propertyController');
app.get('/', getHome);

app.use('/auth', require('../routes/auth'));
app.use('/properties', require('../routes/properties'));
app.use('/agent', require('../routes/agent'));
app.use('/admin', require('../routes/admin'));

app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found' }));

module.exports = app;
