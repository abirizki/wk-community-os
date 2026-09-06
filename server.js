const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CORS CONFIGURATION (HEADLESS API)
// CORS CONFIGURATION (EXTRA SECURITY LAYER)
// ==========================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['https://bumiwarga.simetrikami.com'];
  : ['https://bumiwarga.simetrikami.com', 'http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
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

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WK Community OS - Headless API Server',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ==========================================
// API ROUTES CONFIGURATION
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  console.log('[WK Community OS] Running in DEVELOPMENT mode. Using Mock API routes.');
  

  app.post('/api/auth/login', (req, res) => {
    res.json({ user: { nik: req.body.nik } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
  });

  app.get('/api/pbb', (req, res) => {
    res.json([
      { year: 2026, nop: '320101234567890123', amount: 150000, status: 'PAID' },
      { year: 2027, nop: '320101234567890123', amount: 150000, status: 'UNPAID' }
      { year: 2027, nop: '320101234567890123', amount: 150000, status: 'UNPAID' },
    ]);
  });

  app.get('/api/posyandu', (req, res) => {
    res.json([
      { date: '12 Okt 2026', name: 'Budi (Balita)', service: 'Imunisasi Polio', status: 'Normal' },
      { date: '12 Sep 2026', name: 'Budi (Balita)', service: 'Timbang Berat Badan', status: 'Stunting Warning' }
      { date: '12 Sep 2026', name: 'Budi (Balita)', service: 'Timbang Berat Badan', status: 'Stunting Warning' },
    ]);
  });

  app.get('/api/complaints', (req, res) => {
    res.json([
      { date: '10 Okt 2026', title: 'Lampu jalan mati', category: 'Infrastruktur', status: 'Menunggu' },
      { date: '08 Okt 2026', title: 'Ronda malam tidak aktif', category: 'Keamanan', status: 'Diproses' },
      { date: '01 Okt 2026', title: 'Pembuatan KK lambat', category: 'Layanan', status: 'Selesai' }
      { date: '01 Okt 2026', title: 'Pembuatan KK lambat', category: 'Layanan', status: 'Selesai' },
    ]);
  });
} else {
  console.log('[WK Community OS] Running in PRODUCTION mode. Connecting to MySQL routes.');
  try {
    // Ensuring database connection utilizes environment variables
    // e.g., process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME
    
    // Mount the real production API 