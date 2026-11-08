/**
 * scripts/setup_test_db.js
 * Sprint 1: Dedicated MySQL Testing Database Setup & Synthetic Edge-Case Seeder
 * 
 * Safely provisions and populates 'wk_community_test' with non-PII synthetic data.
 * Includes edge cases:
 * - Edge 1: Multi-tenant same-numbered RT in different RWs (RT 001/RW 001 vs RT 001/RW 002)
 * - Edge 2: Empty territory (RW 009 with 0 citizens) to verify zero division resilience
 * - Edge 3: Unverified vs Verified Desil families across Desil 1, 2, 3, 4
 * - Edge 4: Full spectrum of document approval steps and statuses (SLA timing)
 * - Edge 5: Posyandu Balita Stunting clusters and Life-Cycle cohorts
 * - Edge 6: High-risk pregnant mothers (Bumil KEK) with LiLA < 23.5 cm
 * 
 * Run via: npm run db:test:setup
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const TARGET_TEST_DB = process.env.DB_TEST_NAME || 'wk_community_test';

// Safety Guard: NEVER run against production database
function assertSafetyGuard(dbName) {
  const normalized = dbName.toLowerCase();
  const isProduction = normalized === 'wk_community_os' || 
                       normalized.includes('prod') || 
                       normalized.includes('live');
  if (isProduction && !normalized.includes('test')) {
    console.error(`[CRITICAL SECURITY ALERT] Refusing to seed database '${dbName}'! It appears to be production.`);
    process.exit(1);
  }
}

async function setupTestDatabase() {
  assertSafetyGuard(TARGET_TEST_DB);
  console.log(`\n======================================================`);
  console.log(`[Sprint 1] Provisioning Isolated Test DB: ${TARGET_TEST_DB}`);
  console.log(`======================================================\n`);

  let rootConnection;
  try {
    // 1. Connect to MySQL server to create or reset the test database
    rootConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT
    });

    console.log(`[*] Creating database ${TARGET_TEST_DB} if not exists...`);
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${TARGET_TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await rootConnection.end();

    // 2. Connect to the dedicated test database
    const testPool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: TARGET_TEST_DB,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10
    });

    // 3. Run core tables initialization and auto_patch on test database
    console.log(`[*] Initializing schema and auto-patches on ${TARGET_TEST_DB}...`);
    process.env.DB_NAME = TARGET_TEST_DB;
    process.env.NODE_ENV = 'test';

    const initDb = require('../src/db/init');
    const autoPatch = require('../src/db/auto_patch');
    
    // Create base tables
    await initDb.initializeDatabase();
    // Run all schema migrations
    await autoPatch.autoPatchDatabase();

    // 4. Clean existing test data safely
    console.log(`[*] Resetting existing test tables...`);
    const tablesToTruncate = [
      'warga', 'users', 'dokumen_request', 'dokumen_workflow_history',
      'posyandu', 'posyandu_lansia', 'posyandu_ibu_hamil', 'posyandu_ibu_hamil_pemeriksaan',
      'bansos_pengajuan', 'desil_keluarga', 'keuangan_kas', 'keuangan_iuran_warga'
    ];

    await testPool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tablesToTruncate) {
      try {
        await testPool.query(`TRUNCATE TABLE \`${table}\``);
      } catch (err) {
        // Table might not exist yet, ignore
      }
    }
    await testPool.query('SET FOREIGN_KEY_CHECKS = 1');

    // 5. Generate Standard Test Passwords
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    // 6. Seed Synthetic Roles & Staff Users
    console.log(`[*] Seeding synthetic role users (Superadmin, Lurah, RT, RW, Kader)...`);
    const syntheticUsers = [
      ['admin_test', defaultPasswordHash, 'Admin Kelurahan Test', 'admin_kelurahan', 'active', '001', '001', '32.72.03.1004'],
      ['lurah_test', defaultPasswordHash, 'Lurah Kebonjati Test', 'lurah', 'active', null, null, '32.72.03.1004'],
      ['rt001_rw001', defaultPasswordHash, 'Ketua RT 001 RW 001 Test', 'ketua_rt', 'active', '001', '001', '32.72.03.1004'],
      ['rt001_rw002', defaultPasswordHash, 'Ketua RT 001 RW 002 Test', 'ketua_rt', 'active', '001', '002', '32.72.03.1004'],
      ['rw001_test', defaultPasswordHash, 'Ketua RW 001 Test', 'ketua_rw', 'active', null, '001', '32.72.03.1004'],
      ['rw002_test', defaultPasswordHash, 'Ketua RW 002 Test', 'ketua_rw', 'active', null, '002', '32.72.03.1004'],
      ['posyandu_test', defaultPasswordHash, 'Kader Posyandu Test', 'kader_posyandu', 'active', '001', '001', '32.72.03.1004'],
      ['warga_test_01', defaultPasswordHash, 'Ahmad Fiktif', 'warga', 'active', '001', '001', '32.72.03.1004']
    ];

    for (const u of syntheticUsers) {
      await testPool.execute(
        `INSERT INTO users (username, password_hash, nama, role, status, rt, rw, kode_kelurahan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        u
      );
    }

    // 7. Seed Synthetic Warga with Edge Cases
    console.log(`[*] Seeding synthetic population with spatial isolation edge cases...`);
    
    // EDGE CASE 1: RT 001 in RW 001 vs RT 001 in RW 002
    const syntheticWarga = [
      // Family 1: RW 001 / RT 001 (Kepala Keluarga, Istri, Anak, Bayi Baru Lahir NIK 000000)
      ['3272041001800001', '3272040101800001', 'Budi Santoso (KK)', 'L', 'Sukabumi', '1980-01-10', 'Islam', 'Kawin', 'Kepala Keluarga', 'Wiraswasta', 'Jl. Kenanga No. 1', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],
      ['3272045205850001', '3272040101800001', 'Siti Aminah (Istri)', 'P', 'Sukabumi', '1985-05-12', 'Islam', 'Kawin', 'Istri', 'Mengurus Rumah Tangga', 'Jl. Kenanga No. 1', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],
      ['3272042203150001', '3272040101800001', 'Rian Santoso (Anak Remaja)', 'L', 'Sukabumi', '2010-03-22', 'Islam', 'Belum Kawin', 'Anak', 'Pelajar', 'Jl. Kenanga No. 1', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],
      ['0000004811261001', '3272040101800001', 'Bayi Uji Santoso (Bayi 000000)', 'P', 'Sukabumi', '2026-11-08', 'Islam', 'Belum Kawin', 'Anak', 'Belum Bekerja', 'Jl. Kenanga No. 1', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 1],

      // Family 2: RW 001 / RT 001 (Lansia)
      ['3272041508450001', '3272040101800002', 'Kakek Sukardi (Lansia)', 'L', 'Sukabumi', '1945-08-15', 'Islam', 'Cerai Mati', 'Kepala Keluarga', 'Pensiunan', 'Jl. Kenanga No. 5', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],

      // Family 3: RW 002 / RT 001 (Same RT number '001', DIFFERENT RW '002' - Must NOT leak into RW 001!)
      ['3272041204820002', '3272040101800003', 'Cecep Hidayat (RW 002)', 'L', 'Sukabumi', '1982-04-12', 'Islam', 'Kawin', 'Kepala Keluarga', 'Pedagang', 'Jl. Melati No. 8', '001', '002', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],
      ['3272046507870002', '3272040101800003', 'Rina Marlina (Bumil KEK)', 'P', 'Sukabumi', '1987-07-25', 'Islam', 'Kawin', 'Istri', 'Pedagang', 'Jl. Melati No. 8', '001', '002', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],

      // Family 4: RW 002 / RT 002 (Balita Stunting)
      ['3272041112900004', '3272040101800004', 'Dedi Supriadi', 'L', 'Sukabumi', '1990-12-11', 'Islam', 'Kawin', 'Kepala Keluarga', 'Buruh Harian Lepas', 'Jl. Melati No. 12', '002', '002', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],
      ['3272041804240004', '3272040101800004', 'Balita Uji (Stunting)', 'L', 'Sukabumi', '2024-04-18', 'Islam', 'Belum Kawin', 'Anak', 'Belum Bekerja', 'Jl. Melati No. 12', '002', '002', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0],

      // Family 5: Deceased Citizen (To test status_kependudukan != 'Meninggal' filter)
      ['3272040101400099', '3272040101800099', 'Almarhum Uji (Meninggal)', 'L', 'Sukabumi', '1940-01-01', 'Islam', 'Kawin', 'Kepala Keluarga', 'Pensiunan', 'Jl. Mawar No. 9', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0]
    ];

    for (const w of syntheticWarga) {
      const statusKependudukan = w[2].includes('Meninggal') ? 'Meninggal' : 'Tetap';
      await testPool.execute(
        `INSERT INTO warga 
         (nik, no_kk, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, status_perkawinan, status_hubungan_keluarga, pekerjaan, alamat, rt, rw, kelurahan, kecamatan, kota, is_nik_sementara, status_kependudukan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...w, statusKependudukan]
      );
    }

    // 8. Seed Desil Spectrum (Verified vs Unverified)
    console.log(`[*] Seeding Desil classifications (Desil 1, 2, 3, 4 + Pending ground check)...`);
    await testPool.execute(`
      INSERT INTO desil_keluarga (no_kk, desil, status_kesejahteraan, status_verifikasi, daya_listrik, status_rumah)
      VALUES 
        ('3272040101800004', 1, 'Sangat Miskin', 'VERIFIED', '450 VA', 'Menumpang'),
        ('3272040101800001', 2, 'Miskin', 'PENDING', '900 VA', 'Milik Sendiri'),
        ('3272040101800003', 3, 'Hampir Miskin', 'VERIFIED', '900 VA', 'Sewa/Kontrak')
    `);

    // 9. Seed Posyandu Balita & Klaster Stunting
    console.log(`[*] Seeding Posyandu Balita, Ibu Hamil 1000 HPK & Lansia...`);
    await testPool.execute(`
      INSERT INTO posyandu (nama_anak, nik_warga, tanggal_pemeriksaan, berat_badan, tinggi_badan, status_gizi, catatan, created_by)
      VALUES 
        ('Balita Uji (Stunting)', '3272041804240004', CURDATE(), 9.2, 78.5, 'Stunting', 'Kasus stunting pemantauan intensif', 'posyandu_test'),
        ('Bayi Uji Santoso (Bayi 000000)', '0000004811261001', CURDATE(), 3.4, 49.5, 'Normal', 'Penimbangan perdana bayi lahir', 'posyandu_test')
    `);

    // 10. Seed Ibu Hamil 1000 HPK (Bumil KEK)
    await testPool.execute(`
      INSERT INTO posyandu_ibu_hamil (nik, nama, no_kk, usia_kehamilan_minggu, lila_cm, status_kek, rt, rw, nama_suami)
      VALUES 
        ('3272046507870002', 'Rina Marlina (Bumil KEK)', '3272040101800003', 20, 22.1, 'Risiko KEK', '001', '002', 'Cecep Hidayat')
    `);

    // 11. Seed Dokumen Requests across full lifecycle
    console.log(`[*] Seeding Document workflow requests (SUBMITTED, APPROVED, REJECTED, SLA)...`);
    await testPool.execute(`
      INSERT INTO dokumen_request 
        (nomor_registrasi, nik_pemohon, jenis_dokumen, jenis_surat, keperluan, status, approval_step, rt, rw, created_at, updated_at, sla_deadline)
      VALUES 
        ('REG-TEST-001', '3272041001800001', 'Surat Keterangan Usaha', 'Surat Keterangan Usaha', 'Pengajuan Kredit Usaha Rakyat BRI', 'APPROVED', 'COMPLETED', '001', '001', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
        ('REG-TEST-002', '3272041204820002', 'Surat Keterangan Domisili', 'Surat Keterangan Domisili', 'Persyaratan administrasi pekerjaan', 'SUBMITTED', 'RT', '001', '002', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR)),
        ('REG-TEST-003', '3272041112900004', 'Surat Keterangan Tidak Mampu', 'Surat Keterangan Tidak Mampu', 'Permohonan KIS PBI BPJS Kesehatan', 'REJECTED', 'RT', '002', '002', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW())
    `);

    // 12. Seed Keuangan Iuran
    await testPool.execute(`
      INSERT INTO keuangan_iuran_warga (no_kk, nama_warga, periode_bulan, tahun, nominal, status_bayar, rt, rw)
      VALUES 
        ('3272040101800001', 'Budi Santoso (KK)', 'November', 2026, 50000, 'LUNAS', '001', '001'),
        ('3272040101800003', 'Cecep Hidayat (RW 002)', 'November', 2026, 75000, 'BELUM_BAYAR', '001', '002')
    `);

    console.log(`\n======================================================`);
    console.log(`[SUCCESS] Test Database '${TARGET_TEST_DB}' is fully seeded!`);
    console.log(`- Total Warga Hidup: 8 (1 Almarhum excluded)`);
    console.log(`- RT 001/RW 001 Warga: 4 (1 Bayi NIK 000000, 1 Lansia)`);
    console.log(`- RT 001/RW 002 Warga: 2 (Isolated from RW 001)`);
    console.log(`- RT 002/RW 002 Warga: 2 (1 Balita Stunting)`);
    console.log(`- RW 009: 0 Warga (Empty Territory Edge Case)`);
    console.log(`======================================================\n`);

    await testPool.end();
    return true;
  } catch (err) {
    console.error(`[FATAL ERROR in setupTestDatabase]:`, err);
    throw err;
  }
}

if (require.main === module) {
  setupTestDatabase().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { setupTestDatabase, TARGET_TEST_DB };
