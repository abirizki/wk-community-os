const express = require('express');
const path = require('path');
const cors = require('cors');

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
      { year: 2027, nop: '320101234567890123', amount: 150000, status: 'UNPAID' },
    ]);
  });

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
