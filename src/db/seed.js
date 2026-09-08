/**
 * src/db/seed.js
 * Automated MySQL Seeder for Bumi Warga (Jabar Pintar Digital).
 * Reads database/seed.sql and executes queries in transaction via connection pool.
 * Run via: npm run db:seed
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('  BUMI WARGA — AUTOMATED DATABASE SEEDER (MYSQL)');
  console.log('  Jabar Pintar Digital · Lingkup: Kebonjati, Andir');
  console.log('======================================================\n');

  const seedFilePath = path.join(__dirname, '../../database/seed.sql');

  if (!fs.existsSync(seedFilePath)) {
    console.error(`[SEED ERROR] File not found: ${seedFilePath}`);
    process.exit(1);
  }

  const seedSql = fs.readFileSync(seedFilePath, 'utf8');

  // Pisahkan statement SQL berdasarkan semicolon
  const statements = seedSql
    .split(/;\s*$/m)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  let connection;
  try {
    connection = await pool.getConnection();
    console.log('[SEED] Connected to MySQL successfully.');
    console.log(`[SEED] Executing ${statements.length} seed statements...\n`);

    await connection.beginTransaction();

    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      if (sql) {
        await connection.query(sql);
      }
    }

    await connection.commit();
    console.log('[SEED] ✓ ALL SEED DATA INSERTED SUCCESSFULLY INTO MYSQL!\n');
    console.log('======================================================');
    console.log('  Summary Data Ter-Insert:');
    console.log('  - users (Admin, Operator, 3 Warga)');
    console.log('  - kartu_keluarga (3 KK Kebonjati)');
    console.log('  - warga (5 Anggota Keluarga & Kependudukan)');
    console.log('  - pengaduan (3 Aspirasi Realistis)');
    console.log('  - pbb (5 Riwayat Pajak 2025-2026)');
    console.log('  - posyandu (4 Rekam Medis Tumbuh Kembang Anak)');
    console.log('======================================================\n');
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[SEED ERROR] Failed to seed MySQL database:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };

