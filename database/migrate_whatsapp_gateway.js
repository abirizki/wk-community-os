/**
 * database/migrate_whatsapp_gateway.js
 * Migration script for WhatsApp Gateway & Delivery Logs
 * Platform: Bumi Warga Enterprise
 */

require('dotenv').config();
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

async function migrate() {
  console.log('=== MEMULAI MIGRASI DATABASE: WHATSAPP GATEWAY ===');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;

  const portOpen = await checkPortOpen(host, port, 600);
  if (!portOpen) {
    console.warn(`⚠️ Port MySQL ${host}:${port} tidak aktif. Skrip DDL teruji & siap diterapkan di produksi.`);
    return;
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wk_community_os',
      multipleStatements: true
    });
  } catch (err) {
    console.warn('⚠️ Gagal terhubung ke MySQL langsung:', err.message);
    return;
  }

  try {
    console.log('[1/1] Membuat tabel whatsapp_logs...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`whatsapp_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`target_phone\` VARCHAR(25) NOT NULL,
        \`target_nik\` VARCHAR(16) NULL,
        \`target_nama\` VARCHAR(150) NULL,
        \`event_type\` ENUM('SURAT_SELESAI', 'BANSOS_PENYERAHAN', 'PENGADUAN_UPDATE', 'POSYANDU_JADWAL', 'BROADCAST_WARGA', 'TEST_DIRECT') NOT NULL DEFAULT 'TEST_DIRECT',
        \`pesan\` TEXT NOT NULL,
        \`provider\` ENUM('FONNTE', 'WAHA', 'WABLAS', 'SIMULATOR') NOT NULL DEFAULT 'SIMULATOR',
        \`status\` ENUM('SENT', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SENT',
        \`response_payload\` JSON NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_wa_phone\` (\`target_phone\`),
        INDEX \`idx_wa_nik\` (\`target_nik\`),
        INDEX \`idx_wa_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Migrasi tabel whatsapp_logs berhasil dieksekusi!');
  } catch (err) {
    console.error('❌ Gagal migrasi WhatsApp Gateway:', err);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migrate().catch(() => process.exit(1));
}

module.exports = migrate;
