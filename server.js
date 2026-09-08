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
const { checkDatabase } = require('./src/db/check');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CORS CONFIGURATION (EXTRA SECURITY LAYER)
// ==========================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['https://bumiwarga.simetrikami.com', 'http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like same-origin, mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

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
// Mount real API routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/warga', require('./src/routes/warga.routes'));
app.use('/api/kk', require('./src/routes/kk.routes'));
app.use('/api/pengaduan', require('./src/routes/pengaduan.routes'));
app.use('/api/pbb', require('./src/routes/pbb.routes'));

if (process.env.NODE_ENV !== 'production') {
  console.log('[WK Community OS] Running in DEVELOPMENT mode. Using Mock API routes.');

  app.get('/api/posyandu', (req, res) => {
    res.json([
      { date: '12 Okt 2026', name: 'Budi (Balita)', service: 'Imunisasi Polio', status: 'Normal' },
      { date: '12 Sep 2026', name: 'Budi (Balita)', service: 'Timbang Berat Badan', status: 'Stunting Warning' },
    ]);
  });

  app.get('/api/complaints', (req, res) => {
    res.json([
      { date: '10 Okt 2026', title: 'Lampu jalan mati', category: 'Infrastruktur', status: 'Menunggu' },
      { date: '08 Okt 2026', title: 'Ronda malam tidak aktif', category: 'Keamanan', status: 'Diproses' },
      { date: '01 Okt 2026', title: 'Pembuatan KK lambat', category: 'Layanan', status: 'Selesai' },
    ]);
  });
} else {
  console.log('[WK Community OS] Running in PRODUCTION mode. Connecting to MySQL routes.');
  try {
    // Ensuring database connection utilizes environment variables
    // e.g., process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME
    // Mount production API routes when connected
    // app.use('/api', require('./routes/api'));
  } catch (e) {
    console.error('Failed to load production API routes:', e.message);
  }
}

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

// SPA Fallback Route - MUST be the last route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`[WK Community OS] Monolith server is running on http://localhost:${PORT}`);
});
