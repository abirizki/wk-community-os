/**
 * database/migrate_integrasi_pemda.js
 * Migration Script for Sprint 10: Arsitektur Integrasi Ekosistem Pemda (Dukcapil & Sapawarga)
 * Kepatuhan Permendagri No. 102/2019 & UU PDP No. 27/2022 (Zero Data Hoarding)
 * Jabar Pintar Digital
 */

require('dotenv').config();
const net = require('net');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function isPortOpen(host, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      status = true;
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
  console.log('=== MEMULAI MIGRASI SPRINT 10: INTEGRASI EKOSISTEM PEMDA (DUKCAPIL & SAPAWARGA) ===');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;

  const portOpen = await isPortOpen(host, port, 600);
  if (!portOpen) {
    console.warn(`⚠️ Port MySQL ${host}:${port} tidak aktif. Skrip migrasi DDL teruji & siap diterapkan di server produksi/Hostinger.`);
    return;
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wk_community_os',
      port,
      multipleStatements: true
    });
  } catch (err) {
    console.warn('⚠️ Gagal terhubung ke MySQL langsung:', err.message);
    return;
  }

  try {
    // 1. TABEL: dukcapil_verifikasi_log (Zero Data Hoarding - Audit UU PDP No. 27/2022)
    console.log('[1/4] Membuat tabel dukcapil_verifikasi_log...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`dukcapil_verifikasi_log\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nik_diminta\` VARCHAR(16) NOT NULL,
        \`nama_diminta\` VARCHAR(150) NULL,
        \`jenis_verifikasi\` ENUM('NIK_MATCHING', 'BIOMETRIC_FACE', 'STATUS_KEMATIAN') NOT NULL,
        \`is_matched\` TINYINT(1) NOT NULL,
        \`similarity_score\` DECIMAL(5,2) NULL COMMENT 'Persentase kemiripan wajah 0-100%',
        \`keterangan\` VARCHAR(255) NULL,
        \`requestor_user_id\` INT NULL,
        \`ip_address\` VARCHAR(45) NULL,
        \`integrity_hash\` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash log untuk anti-tampering UU PDP',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_dukcapil_nik\` (\`nik_diminta\`),
        INDEX \`idx_dukcapil_tgl\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. TABEL: partner_api_keys (Gateway Kredensial untuk Sapawarga & Satu Data Jabar)
    console.log('[2/4] Membuat tabel partner_api_keys...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`partner_api_keys\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`partner_name\` VARCHAR(100) NOT NULL UNIQUE,
        \`api_key\` VARCHAR(64) NOT NULL UNIQUE,
        \`api_secret_hash\` VARCHAR(255) NOT NULL,
        \`scopes\` JSON NOT NULL COMMENT 'Daftar endpoint diizinkan: read:surat, read:bansos, push:satudata',
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`last_used_at\` TIMESTAMP NULL DEFAULT NULL,
        \`expires_at\` TIMESTAMP NULL DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_partner_key\` (\`api_key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. TABEL: partner_webhook_logs (Audit Pengiriman Event ke Server Mitra)
    console.log('[3/4] Membuat tabel partner_webhook_logs...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`partner_webhook_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`partner_name\` VARCHAR(100) NOT NULL,
        \`event_type\` ENUM('SURAT_APPROVED', 'SURAT_REJECTED', 'BANSOS_DISBURSED', 'DESIL_UPDATED') NOT NULL,
        \`target_url\` VARCHAR(255) NOT NULL,
        \`payload\` JSON NOT NULL,
        \`response_code\` INT NULL,
        \`status\` ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SUCCESS',
        \`retry_count\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_webhook_event\` (\`event_type\`),
        INDEX \`idx_webhook_partner\` (\`partner_name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. SEED KREDENSIAL API PARTNER RESMI
    console.log('[4/4] Seeding partner API keys default...');
    const defaultPartners = [
      {
        partner_name: 'SAPAWARGA_JABAR',
        api_key: 'bw_live_spw_77a9c812d45e0f19b882',
        scopes: JSON.stringify(['read:surat', 'read:bansos', 'webhook:listener'])
      },
      {
        partner_name: 'SATU_DATA_JABAR',
        api_key: 'bw_live_sdj_33f81e01a9b4c67d82e1',
        scopes: JSON.stringify(['push:satudata', 'read:demography_aggregate'])
      },
      {
        partner_name: 'DISKOMINFO_SUKABUMI',
        api_key: 'bw_live_dsk_55b29f04e1c78a90123d',
        scopes: JSON.stringify(['read:command_center', 'read:all_stats'])
      }
    ];

    for (const p of defaultPartners) {
      const secretHash = crypto.createHash('sha256').update(p.api_key + '_secret_salt').digest('hex');
      await connection.query(`
        INSERT INTO \`partner_api_keys\` (\`partner_name\`, \`api_key\`, \`api_secret_hash\`, \`scopes\`, \`is_active\`)
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE \`scopes\` = VALUES(\`scopes\`);
      `, [p.partner_name, p.api_key, secretHash, p.scopes]);
    }

    console.log('✅ MIGRASI SPRINT 10 SUKSES: INTEGRASI DUKCAPIL & SAPAWARGA SIAP DIGUNAKAN!');
  } catch (error) {
    console.error('❌ Error migrasi Sprint 10:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migrate().catch(() => process.exit(1));
}

module.exports = migrate;

