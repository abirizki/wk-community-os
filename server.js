/**
 * server.js
 * WK Community OS - Unified Monolith Server (Express.js)
 * Serves backend API routes and static React frontend with SPA fallback.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { checkDatabase } = require('./src/db/check');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust 1 level of proxy (Hostinger reverse proxy)
app.set('trust proxy', 1);

// ==========================================
// SECURITY CONFIGURATION (HELMET)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_ORIGIN || "http://localhost:5173", "http://localhost:3000"]
    }
  }
}));

// ==========================================
// RATE LIMITING
// ==========================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login yang gagal, coba lagi nanti.' }
});

// Apply global limiter to all routes
app.use(globalLimiter);

// ==========================================
// CORS CONFIGURATION (STRICT POLICY)
// ==========================================
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow same-origin requests (undefined/null origin) or matching FRONTEND_ORIGIN.
      // In a monolith, the React frontend is served from the same domain so origin is often absent.
      if (!origin || origin === process.env.FRONTEND_ORIGIN || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ==========================================
// SESSION CONFIGURATION
// ==========================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'wk-community-os-super-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// ==========================================
// API ROUTES CONFIGURATION
// ==========================================
// Mount auth limit specifically for login
app.use('/api/auth/login', authLimiter);

// Mount real API routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/warga', require('./src/routes/warga.routes'));
app.use('/api/kk', require('./src/routes/kk.routes'));
app.use('/api/pengaduan', require('./src/routes/pengaduan.routes'));
app.use('/api/pbb', require('./src/routes/pbb.routes'));
app.use('/api/posyandu', require('./src/routes/posyandu.routes'));
app.use('/api/dokumen', require('./src/routes/dokumen.routes'));
app.use('/api/bansos', require('./src/routes/bansos.routes'));
app.use('/api/desil', require('./src/routes/desil.routes'));
app.use('/api/completeness', require('./src/routes/completeness.routes'));
app.use('/api/fasilitas', require('./src/routes/fasilitas.routes'));
app.use('/api/notifikasi', require('./src/routes/notifikasi.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/wilayah', require('./src/routes/wilayah.routes'));
app.use('/api/analytics', require('./src/routes/analytics.routes'));
const integrasiRoutes = require('./src/routes/integrasi.routes');
app.use('/api/integrasi', integrasiRoutes);
app.use('/api/v1/partner', integrasiRoutes.partnerRouter);

// Pure MySQL REST Routes (No hardcoded mock data)
console.log(`[Bumi Warga] API routes mounted cleanly. Connected to MySQL database.`);

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
app.get('/health', async (req, res) => {
  const dbStatus = await checkDatabase();
  res.json({
    status: 'ok',
    service: 'WK Community OS',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    database: dbStatus,
  });
});

// ==========================================
// STATIC FRONTEND SERVING (MONOLITH)
// ==========================================
// Serve compiled Vite frontend from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// SPA Fallback Route - MUST be the last route before error handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // Skip SPA fallback for missing API endpoints
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.message);
  
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Terjadi kesalahan pada server.' 
      : (err.message || 'Terjadi kesalahan pada server.')
  };

  // Only expose stack trace in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// Start Server
app.listen(PORT, () => {
  console.log(`[WK Community OS] Monolith server is running on http://localhost:${PORT}`);
});
