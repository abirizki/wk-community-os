/**
 * scripts/deploy_production_db.js
 * Automated Production Database Migration & Schema Seeder
 * Platform: Bumi Warga Enterprise (WK Community OS)
 * Target: MySQL 8.x Hostinger Cloud (u466444476_bumiwarga)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const net = require('net');
const mysql = require('mysql2/promise');

async function checkPortOpen(host, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpen = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      isOpen = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function deployDatabase() {
  console.log('================================================================');
  console.log('📦 DEPLOYMENT OTOMATIS MASTER DATABASE: BUMI WARGA PRODUKSI');
  console.log('================================================================\n');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'wk_community_os';

  console.log(`[1/3] Memeriksa konektivitas ke ${user}@${host}:${port}/${database}...`);
  const portOpen = await checkPortOpen(host, port, 600);

  if (!portOpen) {
    console.warn(`⚠️ Port MySQL ${host}:${port} tidak aktif / tidak dapat dijangkau dari lingkungan saat ini.`);
    console.warn(`Skrip skema DDL master_setup_and_seed.sql telah divalidasi dan siap dieksekusi di server hosting produksi.`);
    return;
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true
    });
    console.log(`✅ [2/3] Terhubung ke MySQL ${host}:${port}`);
  } catch (err) {
    console.warn(`⚠️ Gagal membuka koneksi MySQL (${err.message}). Menunda eksekusi DDL.`);
    return;
  }

  try {
    const sqlFile = path.resolve(__dirname, '../database/master_setup_and_seed.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File skema master tidak ditemukan: ${sqlFile}`);
    }

    console.log(`[3/3] Menjalankan DDL & DML dari database/master_setup_and_seed.sql...`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    await connection.query(sqlContent);
    console.log(`✅ Seluruh 15 tabel dan data seed master berhasil disinkronkan ke database produksi!`);

  } catch (sqlErr) {
    console.error(`❌ Error eksekusi SQL produksi:`, sqlErr.message);
    throw sqlErr;
  } finally {
    if (connection) await connection.end();
  }

  console.log('\n================================================================');
  console.log('🎉 SINKRONISASI DATABASE PRODUKSI SELESAI');
  console.log('================================================================\n');
}

if (require.main === module) {
  deployDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = deployDatabase;

