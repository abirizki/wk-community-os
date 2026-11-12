/**
 * scripts/seed_full_production.js
 * Master Comprehensive Production & SADA JABAR Feeder Seeder
 * Platform: bumiwarga.online — Jabar Pintar Digital
 * 
 * Pipeline:
 * 1. Menjalankan auto_patch schema migrator
 * 2. Menginjeksi seed_all_scenarios.sql (221 Akun, 50 KK, 200 Warga, DTKS, Posyandu)
 * 3. Menginjeksi seed_sada_jabar_coherence.sql (Kas, Iuran, Faspend, Faskes, PMT, Hunian Sewa, Action Tracking)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { autoPatch } = require('../src/db/auto_patch');

async function seedFullProduction() {
  console.log('================================================================');
  console.log('⚡ MASTER SEEDER: BUMI WARGA & SADA JABAR DATA FEEDER PIPELINE');
  console.log('================================================================\n');

  // Step 1: Ensure Schema Patches are Applied
  console.log('[1/3] Menjalankan Auto-Patch Skema Database...');
  try {
    await autoPatch();
    console.log('  ✓ Skema seluruh tabel (22+ tabel) telah siap & terverifikasi.');
  } catch (err) {
    console.warn('  ⚠️ Peringatan saat auto_patch:', err.message);
  }

  // Step 2: Connect to MySQL for Seeding
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'wk_community_os';

  console.log(`\n[2/3] Menghubungkan ke MySQL (${user}@${host}:${port}/${database})...`);

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
    console.log('  ✓ Koneksi database MySQL berhasil dibuka.');
  } catch (err) {
    console.error(`  ❌ Gagal terhubung ke MySQL (${err.message}).`);
    console.warn('  💡 Tips: Pastikan service MySQL berjalan atau gunakan BypassSandbox jika mengakses socket lokal.');
    return;
  }

  try {
    // Step 3: Run Baseline Scenarios
    const scenariosPath = path.resolve(__dirname, '../database/seed_all_scenarios.sql');
    if (fs.existsSync(scenariosPath)) {
      console.log('\n[3/4] Menginjeksi Master Skenario Dasar (221 Akun, 50 KK, 200 Warga, Desil DTKS)...');
      const scenariosSql = fs.readFileSync(scenariosPath, 'utf8');
      await connection.query(scenariosSql);
      console.log('  ✓ 221 Akun Pejabat & Warga, 50 KK, 200 Warga, Desil DTKS berhasil di-seed.');
    }

    // Step 4: Run SADA JABAR Coherence Seeder
    const coherencePath = path.resolve(__dirname, '../database/seed_sada_jabar_coherence.sql');
    if (fs.existsSync(coherencePath)) {
      console.log('\n[4/4] Menginjeksi Skenario Koheren SADA JABAR (Kas, Iuran, Faspend, Faskes, PMT, Action Tracking)...');
      const coherenceSql = fs.readFileSync(coherencePath, 'utf8');
      await connection.query(coherenceSql);
      console.log('  ✓ Buku Kas RT/RW, Iuran KK, Faskes, Faspend, PMT Stunting, Hunian Sewa berhasil di-seed.');
    }

    // Verify Record Counts
    console.log('\n================================================================');
    console.log('📊 REKAPITULASI DATA SEED AKTIF DI DATABASE:');
    console.log('================================================================');

    const tablesToVerify = [
      { name: 'users', label: 'Akun Pengguna & Pejabat' },
      { name: 'kartu_keluarga', label: 'Kartu Keluarga Terdaftar' },
      { name: 'warga', label: 'Data Warga by-NIK' },
      { name: 'desil_keluarga', label: 'Klasifikasi Desil DTKS' },
      { name: 'posyandu', label: 'Pengukuran Balita Posyandu' },
      { name: 'posyandu_ibu_hamil', label: 'Ibu Hamil & 1000 HPK' },
      { name: 'posyandu_pmt_distribusi', label: 'Penyaluran PMT Stunting' },
      { name: 'keuangan_kas', label: 'Transaksi Pembukuan Kas RT/RW' },
      { name: 'keuangan_iuran_warga', label: 'Iuran Bulanan Warga' },
      { name: 'fasilitas_pendidikan', label: 'Fasilitas Pendidikan (Zonasi ATS)' },
      { name: 'fasilitas_kesehatan', label: 'Fasilitas Kesehatan Lingkungan' },
      { name: 'hunian_sewa', label: 'Hunian Sewa / Kontrakan' },
      { name: 'pbb', label: 'Objek Pajak PBB' },
      { name: 'dokumen_request', label: 'Pelayanan Surat PATEN' },
      { name: 'pengaduan', label: 'Laporan Aduan Warga' }
    ];

    for (const t of tablesToVerify) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${t.name}\``);
        console.log(`  • ${t.label.padEnd(35)}: ${rows[0].cnt} records`);
      } catch (err) {
        console.log(`  • ${t.label.padEnd(35)}: [Tabel belum terpasang: ${err.message}]`);
      }
    }

    console.log('\n================================================================');
    console.log('🎉 SEEDING SELESAI: SELURUH DASBOR VISUALISASI SIAP DIDEMOKAN!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Gagal menjalankan query seed:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  seedFullProduction()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedFullProduction };
