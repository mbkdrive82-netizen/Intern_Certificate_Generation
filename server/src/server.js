const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tnskillsRoutes = require('./routes/tnskillsRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Connect Database
connectDB();

// Express Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Asset Directories
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/certificates', express.static(path.join(__dirname, '../certificates')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tnskills', tnskillsRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/student', studentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TN SKILLS Backend API is running smoothly' });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 TN SKILLS Express Server running on port ${PORT}`);
  console.log(`===============================================`);
});
