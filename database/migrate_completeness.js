/**
 * database/migrate_completeness.js
 * Migration Script for Sprint 7: Sistem Skor Kelengkapan Data Profil Warga & Pemanfaatan AI Lintas Peran
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  console.log('=== MEMULAI MIGRASI SPRINT 7: SKOR KELENGKAPAN DATA & AI LINTAS PERAN ===');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wk_community_os',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    multipleStatements: true
  });

  try {
    // 1. Periksa kolom pada tabel warga
    console.log('[1/3] Memeriksa dan memperbarui tabel warga...');
    const [wargaCols] = await connection.query(`SHOW COLUMNS FROM \`warga\``);
    const wargaColNames = wargaCols.map(c => c.Field);

    if (!wargaColNames.includes('skor_kelengkapan')) {
      console.log('  -> Menambahkan kolom skor_kelengkapan...');
      await connection.query(`
        ALTER TABLE \`warga\`
        ADD COLUMN \`skor_kelengkapan\` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Persentase kelengkapan profil 0-100%',
        ADD INDEX \`idx_warga_skor\` (\`skor_kelengkapan\`)
      `);
    } else {
      console.log('  -> Kolom skor_kelengkapan sudah ada.');
    }

    if (!wargaColNames.includes('rincian_kelengkapan')) {
      console.log('  -> Menambahkan kolom rincian_kelengkapan...');
      await connection.query(`
        ALTER TABLE \`warga\`
        ADD COLUMN \`rincian_kelengkapan\` JSON NULL COMMENT 'Cache rincian 4 pilar dan missing fields'
      `);
    } else {
      console.log('  -> Kolom rincian_kelengkapan sudah ada.');
    }

    if (!wargaColNames.includes('terakhir_dihitung_at')) {
      console.log('  -> Menambahkan kolom terakhir_dihitung_at...');
      await connection.query(`
        ALTER TABLE \`warga\`
        ADD COLUMN \`terakhir_dihitung_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    } else {
      console.log('  -> Kolom terakhir_dihitung_at sudah ada.');
    }

    // 2. Periksa kolom pada tabel dokumen_request
    console.log('[2/3] Memeriksa dan memperbarui tabel dokumen_request...');
    const [dokCols] = await connection.query(`SHOW COLUMNS FROM \`dokumen_request\``);
    const dokColNames = dokCols.map(c => c.Field);

    if (!dokColNames.includes('is_auto_filled_by_ai')) {
      console.log('  -> Menambahkan kolom is_auto_filled_by_ai...');
      await connection.query(`
        ALTER TABLE \`dokumen_request\`
        ADD COLUMN \`is_auto_filled_by_ai\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'True jika permohonan surat diisi via AI auto-fill'
      `);
    } else {
      console.log('  -> Kolom is_auto_filled_by_ai sudah ada.');
    }

    console.log('[3/3] Migrasi skema database Sprint 7 berhasil.');
    console.log('=== SELESAI MIGRASI SPRINT 7 ===');
  } catch (error) {
    console.error('ERROR Migrasi Sprint 7:', error);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;

