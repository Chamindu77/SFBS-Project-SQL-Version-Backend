
// app.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { mysqlSequelize, postgresSequelize } = require('./config/db'); 
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Middleware setup
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session setup
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Choose which Sequelize instance to use based on the environment
const dbType = process.env.DB_TYPE === 'mysql' ? 'MySQL' : 'PostgreSQL';
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

console.log(`Attempting to connect to ${dbType} database...`);

// Sync Sequelize models and create tables if they don't exist
sequelize.sync({ force: false })
  .then(() => {
    console.log(`${dbType} database connected and models synchronized.`);
  })
  .catch(err => {
    console.error(`Error syncing ${dbType} database:`, err);
  });

// Google OAuth Strategy and Routes setup
require('./config/passport')(passport);  // Separate Passport config

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Route setup
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/facilities', require('./routes/facilityRoutes'));
app.use('/api/v1/equipment', require('./routes/equipmentRoutes'));
app.use('/api/v1/equipment-booking', require('./routes/equipmentBookingRoutes'));
app.use('/api/v1/facility-booking', require('./routes/facilityBookingRoutes'));
app.use('/api/v1/coach-profile', require('./routes/coachProfileRoutes'));
app.use('/api/v1/session', require('./routes/sessionRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
