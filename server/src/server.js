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

// Express Middlewares & Full CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

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

// Root endpoint - API Status & Frontend Link
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TN SKILLS Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #38bdf8; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          .badge { display: inline-block; background: #065f46; color: #34d399; font-weight: bold; font-size: 0.8rem; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1.25rem; }
          a.btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; font-size: 0.9rem; transition: background 0.2s; margin-top: 1rem; }
          a.btn:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">● API Online (Port 5000)</span>
          <h1>TN SKILLS Backend API</h1>
          <p>The backend server is running and ready. The web application interface is hosted on port 3000.</p>
          <a href="http://localhost:3000" class="btn">Open Web Application (localhost:3000) →</a>
        </div>
      </body>
    </html>
  `);
});

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
