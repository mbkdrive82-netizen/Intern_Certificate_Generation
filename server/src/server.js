const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Connect to MongoDB Database
connectDB();

// Express Middlewares & Universal CORS Configuration
const corsOptions = {
  origin: (origin, callback) => callback(null, true), // Supports custom domain https://intern.thesmgroups.com and localhost
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Disposition']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Explicit fallback headers to ensure preflight OPTIONS never fails
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Asset Directories & Dynamic On-Demand Certificate Delivery
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Dynamic On-Demand PDF handler if file does not exist on disk
app.get('/certificates/:filename', async (req, res, next) => {
  const filePath = path.join(__dirname, '../certificates', req.params.filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  try {
    const filename = req.params.filename;
    const match = filename.match(/SMG-\d+-\d+/i);
    const Certificate = require('./models/Certificate');
    const { generateStudentCertificate } = require('./services/certificateService');

    let cert = null;
    if (match) {
      cert = await Certificate.findOne({ certificateId: new RegExp(`^${match[0]}$`, 'i') });
    }
    if (!cert) {
      cert = await Certificate.findOne({ filePath: new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
    }

    if (cert && cert.studentId) {
      await generateStudentCertificate(cert.studentId, { regenerate: true });
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }
  } catch (err) {
    console.error('[On-demand PDF generator error]:', err);
  }
  next();
});

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
