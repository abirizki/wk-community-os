/**
 * src/db/init.js
 * Database Schema Initialization Script for WK Community OS.
 * Creates core tables (users, warga) if they do not exist.
 * Run via: npm run db:init
 */

require('dotenv').config();

const pool = require('./pool');

const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  role ENUM('admin', 'operator', 'warga') NOT NULL DEFAULT 'warga',
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_WARGA_TABLE = `
CREATE TABLE IF NOT EXISTS warga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  nik VARCHAR(16) NOT NULL UNIQUE,
  no_kk VARCHAR(16) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  tempat_lahir VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  agama VARCHAR(20) NOT NULL DEFAULT 'Islam',
  status_perkawinan ENUM('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati') NOT NULL DEFAULT 'Belum Kawin',
  pekerjaan VARCHAR(100) DEFAULT NULL,
  alamat TEXT NOT NULL,
  rt VARCHAR(5) NOT NULL,
  rw VARCHAR(5) NOT NULL,
  kelurahan VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
  kecamatan VARCHAR(100) NOT NULL DEFAULT 'Andir',
  kota VARCHAR(100) NOT NULL DEFAULT 'Bandung',
  provinsi VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
  no_telepon VARCHAR(20) DEFAULT NULL,
  status_kependudukan ENUM('Tetap', 'Sementara', 'Pindah') NOT NULL DEFAULT 'Tetap',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_warga_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_KK_TABLE = `
CREATE TABLE IF NOT EXISTS kartu_keluarga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_kk VARCHAR(32) NOT NULL UNIQUE,
  kepala_keluarga VARCHAR(150),
  alamat TEXT,
  rt VARCHAR(10),
  rw VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function initDatabase() {
  console.log('\n======================================================');
  console.log('  WK COMMUNITY OS — DATABASE SCHEMA INITIALIZATION');
  console.log('======================================================\n');

  let connection;
  try {
    connection = await pool.getConnection();
    console.log('[INIT] Connected to MySQL successfully.');

    console.log('[INIT] Creating table: users ...');
    await connection.query(CREATE_USERS_TABLE);
    console.log('[INIT] ✓ Table "users" ready.');

    console.log('[INIT] Creating table: kartu_keluarga ...');
    await connection.query(CREATE_KK_TABLE);
    console.log('[INIT] ✓ Table "kartu_keluarga" ready.');

    console.log('[INIT] Creating table: warga ...');
    await connection.query(CREATE_WARGA_TABLE);
    console.log('[INIT] ✓ Table "warga" ready.');

    console.log('\n======================================================');
    console.log('  DATABASE SCHEMA INITIALIZATION COMPLETED');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[INIT] ✗ Schema initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
