require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./models');
const { authenticate } = require('./middleware/auth.middleware');

const app = express();

// Sync database
db.sequelize.sync().then(() => console.log('Database synced'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'lifepulse-secret', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, '../../public')));


// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/register', (req, res) => res.render('register'));
app.post('/api/donors/register', require('./controllers/donor.controller').register);
app.get('/login', (req, res) => res.render('login'));
app.post('/api/auth/login', require('./controllers/auth.controller').login);
app.get('/hospital/login', (req, res) => res.render('hospital-login'));
app.post('/api/hospital/login', require('./controllers/hospital.controller').login);

// Protected routes
app.get('/api/donors/profile', authenticate, require('./controllers/donor.controller').getProfile);
app.put('/api/donors/profile', authenticate, require('./controllers/donor.controller').updateProfile);
app.get('/api/donors/notifications', authenticate, require('./controllers/donor.controller').getNotifications);
app.post('/api/donors/respond', authenticate, require('./controllers/donor.controller').respondToRequest);

app.get('/api/hospital/dashboard', authenticate, require('./controllers/hospital.controller').getDashboardStats);
app.get('/api/hospital/pending-donors', authenticate, require('./controllers/hospital.controller').getPendingDonors);
app.post('/api/hospital/approve/:id', authenticate, require('./controllers/hospital.controller').approveDonor);
app.post('/api/hospital/reject/:id', authenticate, require('./controllers/hospital.controller').rejectDonor);
app.get('/api/hospital/donors', authenticate, require('./controllers/hospital.controller').getAllDonors);

// Dashboard redirects (for session-based, but now API)
app.get('/donor/dashboard', (req, res) => res.render('donor-dashboard'));
app.get('/hospital/dashboard', (req, res) => res.render('hospital-dashboard'));

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

module.exports = app;