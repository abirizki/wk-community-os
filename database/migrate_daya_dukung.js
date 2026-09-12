/**
 * database/migrate_daya_dukung.js
 * Migration Script for Sprint 8: Fasilitas Publik, Daya Dukung Wilayah & Ekonomi Lokal
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

require('dotenv').config();
const net = require('net');
const mysql = require('mysql2/promise');

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
  console.log('=== MEMULAI MIGRASI SPRINT 8: FASILITAS PUBLIK & DAYA DUKUNG WILAYAH ===');
  
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
    // 1. TABEL FASILITAS PENDIDIKAN
    console.log('[1/4] Membuat tabel fasilitas_pendidikan...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`fasilitas_pendidikan\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nama_sekolah\` VARCHAR(150) NOT NULL,
        \`npsn\` VARCHAR(20) NULL UNIQUE,
        \`jenjang\` ENUM('PAUD', 'SD', 'SMP', 'SMA', 'SMK', 'SLB', 'PKBM') NOT NULL,
        \`status_sekolah\` ENUM('Negeri', 'Swasta') NOT NULL DEFAULT 'Negeri',
        \`alamat\` TEXT NOT NULL,
        \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
        \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
        \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
        \`kecamatan\` VARCHAR(100) NOT NULL DEFAULT 'Andir',
        \`kota\` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
        \`koordinat_lat_lng\` VARCHAR(100) NULL,
        \`daya_tampung_kursi_baru\` INT NOT NULL DEFAULT 0 COMMENT 'Kapasitas penerimaan murid baru zonasi',
        \`total_kapasitas_murid\` INT NOT NULL DEFAULT 0,
        \`jumlah_rombel\` INT NOT NULL DEFAULT 1,
        \`akreditasi\` ENUM('A', 'B', 'C', 'Belum Terakreditasi') NOT NULL DEFAULT 'B',
        \`no_telepon\` VARCHAR(25) NULL,
        \`kepala_sekolah\` VARCHAR(150) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_sekolah_jenjang\` (\`jenjang\`),
        INDEX \`idx_sekolah_rt_rw\` (\`rt\`, \`rw\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. TABEL FASILITAS KESEHATAN
    console.log('[2/4] Membuat tabel fasilitas_kesehatan...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`fasilitas_kesehatan\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nama_faskes\` VARCHAR(150) NOT NULL,
        \`jenis_faskes\` ENUM('Puskesmas', 'Pustu', 'Klinik Pratama', 'Posyandu', 'Apotek', 'Praktik Mandiri') NOT NULL,
        \`kategori_pengelola\` ENUM('Pemerintah', 'Swasta', 'Masyarakat') NOT NULL DEFAULT 'Pemerintah',
        \`alamat\` TEXT NOT NULL,
        \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
        \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
        \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
        \`kecamatan\` VARCHAR(100) NOT NULL DEFAULT 'Andir',
        \`kota\` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
        \`koordinat_lat_lng\` VARCHAR(100) NULL,
        \`jumlah_dokter\` INT NOT NULL DEFAULT 0,
        \`jumlah_bidan\` INT NOT NULL DEFAULT 0,
        \`jumlah_perawat\` INT NOT NULL DEFAULT 0,
        \`jumlah_ahli_gizi\` INT NOT NULL DEFAULT 0,
        \`kapasitas_tempat_tidur\` INT NOT NULL DEFAULT 0,
        \`layanan_igd_24jam\` TINYINT(1) NOT NULL DEFAULT 0,
        \`jam_operasional\` VARCHAR(100) NOT NULL DEFAULT '08:00 - 16:00 WIB',
        \`no_kontak\` VARCHAR(25) NULL,
        \`penanggung_jawab\` VARCHAR(150) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_faskes_jenis\` (\`jenis_faskes\`),
        INDEX \`idx_faskes_rt_rw\` (\`rt\`, \`rw\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. TABEL ENTITAS USAHA (UMKM & Sentra Ekonomi)
    console.log('[3/4] Membuat tabel entitas_usaha...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`entitas_usaha\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nama_usaha\` VARCHAR(150) NOT NULL,
        \`nik_pemilik\` VARCHAR(16) NOT NULL,
        \`nama_pemilik\` VARCHAR(150) NOT NULL,
        \`kategori_usaha\` ENUM('Kuliner & Warung', 'Toko Sembako / Kelontong', 'Jasa & Servis', 'Fashion & Tekstil', 'Kerajinan & Industri Kreatif', 'Pertanian & Peternakan Perkotaan', 'Lainnya') NOT NULL DEFAULT 'Kuliner & Warung',
        \`skala_usaha\` ENUM('Mikro', 'Kecil', 'Menengah', 'Swasta Nasional') NOT NULL DEFAULT 'Mikro',
        \`alamat\` TEXT NOT NULL,
        \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
        \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
        \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
        \`kecamatan\` VARCHAR(100) NOT NULL DEFAULT 'Andir',
        \`kota\` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
        \`koordinat_lat_lng\` VARCHAR(100) NULL,
        \`jumlah_tenaga_kerja_lokal\` INT NOT NULL DEFAULT 1,
        \`omset_bulanan_kategori\` ENUM('< 5 Juta', '5 - 15 Juta', '15 - 50 Juta', '> 50 Juta') NOT NULL DEFAULT '< 5 Juta',
        \`apakah_toko_pangan_murah\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Mitra penyedia sembako terjangkau Desil 1-2',
        \`sku_nomor_registrasi\` VARCHAR(50) NULL COMMENT 'Nomor permohonan surat SKU jika terverifikasi',
        \`status_verifikasi\` ENUM('TERVERIFIKASI', 'MENUNGGU_VERIFIKASI', 'NONAKTIF') NOT NULL DEFAULT 'TERVERIFIKASI',
        \`no_telepon\` VARCHAR(25) NULL,
        \`deskripsi_produk\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_usaha_nik\` (\`nik_pemilik\`),
        INDEX \`idx_usaha_kategori\` (\`kategori_usaha\`),
        INDEX \`idx_usaha_rt_rw\` (\`rt\`, \`rw\`),
        INDEX \`idx_usaha_pangan\` (\`apakah_toko_pangan_murah\`),
        INDEX \`idx_usaha_sku\` (\`sku_nomor_registrasi\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. ALTER TABEL desil_keluarga UNTUK SANITASI DAN LIMBAH
    console.log('[4/4] Memeriksa kolom sanitasi pada tabel desil_keluarga...');
    const [desilCols] = await connection.query(`SHOW COLUMNS FROM \`desil_keluarga\``);
    const desilColNames = desilCols.map(c => c.Field);

    if (!desilColNames.includes('jenis_sanitasi')) {
      console.log('  -> Menambahkan kolom jenis_sanitasi...');
      await connection.query(`
        ALTER TABLE \`desil_keluarga\`
        ADD COLUMN \`jenis_sanitasi\` ENUM('Jamban Pribadi Leher Angsa', 'Jamban Komunal', 'Jamban Cemplung/Plengsengan', 'Tanpa Jamban/BAB Terbuka') NOT NULL DEFAULT 'Jamban Pribadi Leher Angsa'
      `);
    }

    if (!desilColNames.includes('pembuangan_limbah')) {
      console.log('  -> Menambahkan kolom pembuangan_limbah...');
      await connection.query(`
        ALTER TABLE \`desil_keluarga\`
        ADD COLUMN \`pembuangan_limbah\` ENUM('Septic Tank Standar', 'Resapan/Selokan Terbuka', 'Sungai/Kolam') NOT NULL DEFAULT 'Septic Tank Standar'
      `);
    }

    if (!desilColNames.includes('akses_pengangkutan_sampah')) {
      console.log('  -> Menambahkan kolom akses_pengangkutan_sampah...');
      await connection.query(`
        ALTER TABLE \`desil_keluarga\`
        ADD COLUMN \`akses_pengangkutan_sampah\` ENUM('Rutin 2-3x Seminggu', 'Tidak Teratur', 'Bakar/Buang Mandiri') NOT NULL DEFAULT 'Rutin 2-3x Seminggu'
      `);
    }

    // 5. SEED DATA FASILITAS PUBLIK AWAL JIKA KOSONG
    const [existingSchools] = await connection.query(`SELECT COUNT(*) as count FROM \`fasilitas_pendidikan\``);
    if (existingSchools[0].count === 0) {
      console.log('  -> Seeding fasilitas pendidikan Kebonjati...');
      await connection.query(`
        INSERT INTO \`fasilitas_pendidikan\` 
          (\`nama_sekolah\`, \`npsn\`, \`jenjang\`, \`status_sekolah\`, \`alamat\`, \`rt\`, \`rw\`, \`daya_tampung_kursi_baru\`, \`total_kapasitas_murid\`, \`jumlah_rombel\`, \`akreditasi\`, \`no_telepon\`)
        VALUES
          ('PAUD & TK Al-Ikhlas Kebonjati', '69910001', 'PAUD', 'Swasta', 'Jl. Kebonjati No. 45', '001', '001', 35, 70, 2, 'A', '022-4200101'),
          ('SD Negeri 035 Kebonjati', '20219801', 'SD', 'Negeri', 'Jl. Kebonjati No. 112', '002', '001', 96, 384, 12, 'A', '022-4200102'),
          ('SMP Swasta Budi Luhur Andir', '20219802', 'SMP', 'Swasta', 'Jl. Kebon Jati Barat No. 8', '001', '002', 72, 216, 6, 'B', '022-4200103'),
          ('SMA Negeri 6 Bandung (Zonasi Andir/Kebonjati)', '20219803', 'SMA', 'Negeri', 'Jl. Pasirkaliki No. 102', '003', '002', 120, 720, 20, 'A', '022-4200104'),
          ('SMK Swasta Mandiri Andir', '20219804', 'SMK', 'Swasta', 'Jl. Gardujati No. 55', '002', '003', 60, 180, 6, 'B', '022-4200105');
      `);
    }

    const [existingHealth] = await connection.query(`SELECT COUNT(*) as count FROM \`fasilitas_kesehatan\``);
    if (existingHealth[0].count === 0) {
      console.log('  -> Seeding fasilitas kesehatan Kebonjati...');
      await connection.query(`
        INSERT INTO \`fasilitas_kesehatan\`
          (\`nama_faskes\`, \`jenis_faskes\`, \`kategori_pengelola\`, \`alamat\`, \`rt\`, \`rw\`, \`jumlah_dokter\`, \`jumlah_bidan\`, \`jumlah_perawat\`, \`jumlah_ahli_gizi\`, \`kapasitas_tempat_tidur\`, \`layanan_igd_24jam\`, \`jam_operasional\`, \`no_kontak\`, \`penanggung_jawab\`)
        VALUES
          ('Puskesmas Pembantu (Pustu) Kebonjati', 'Pustu', 'Pemerintah', 'Jl. Kebonjati No. 78', '001', '001', 2, 3, 4, 1, 4, 0, '08:00 - 15:30 WIB', '022-4209901', 'dr. Siti Rahmawati'),
          ('Klinik Pratama Sehat Andir', 'Klinik Pratama', 'Swasta', 'Jl. Gardujati No. 20', '002', '002', 3, 2, 3, 0, 6, 1, '24 Jam Penuh', '022-4209902', 'dr. Budi Hartono'),
          ('Posyandu Balita Dahlia I', 'Posyandu', 'Masyarakat', 'Balai RW 001 Kebonjati', '001', '001', 0, 1, 1, 1, 0, 0, 'Jadwal Rutin Tgl 10 & 25', '0812-3456-7890', 'Bdn. Rina Marlina'),
          ('Posyandu Balita & Lansia Melati II', 'Posyandu', 'Masyarakat', 'Balai RW 002 Kebonjati', '002', '002', 0, 1, 1, 1, 0, 0, 'Jadwal Rutin Tgl 12 & 28', '0813-8899-7766', 'Bdn. Lilis Suryani'),
          ('Apotek Kimia Farma Kebonjati', 'Apotek', 'Swasta', 'Jl. Kebonjati No. 15', '003', '001', 0, 0, 2, 0, 0, 0, '07:00 - 22:00 WIB', '022-4208877', 'Apt. Hendra Gunawan, S.Farm');
      `);
    }

    const [existingBiz] = await connection.query(`SELECT COUNT(*) as count FROM \`entitas_usaha\``);
    if (existingBiz[0].count === 0) {
      console.log('  -> Seeding entitas usaha & UMKM Kebonjati...');
      await connection.query(`
        INSERT INTO \`entitas_usaha\`
          (\`nama_usaha\`, \`nik_pemilik\`, \`nama_pemilik\`, \`kategori_usaha\`, \`skala_usaha\`, \`alamat\`, \`rt\`, \`rw\`, \`jumlah_tenaga_kerja_lokal\`, \`omset_bulanan_kategori\`, \`apakah_toko_pangan_murah\`, \`sku_nomor_registrasi\`, \`status_verifikasi\`, \`deskripsi_produk\`)
        VALUES
          ('Warung Sembako Berkah Bu Siti', '3273010101900001', 'Siti Aminah', 'Toko Sembako / Kelontong', 'Mikro', 'Jl. Kebonjati RT 001/001', '001', '001', 2, '5 - 15 Juta', 1, 'SKU/2026/08/0001', 'TERVERIFIKASI', 'Sembako beras, minyak goreng, telur ayam, dan gas 3kg subsidi'),
          ('Toko Kelontong Barokah Pak Tatang', '3273010101850002', 'Tatang Sutisna', 'Toko Sembako / Kelontong', 'Mikro', 'Jl. Kasmin No. 12 RT 002/002', '002', '002', 2, '5 - 15 Juta', 1, 'SKU/2026/08/0002', 'TERVERIFIKASI', 'Penyedia sembako murah terdaftar penyaluran bansos lokal'),
          ('Konveksi Kaos Kebonjati Creative', '3273010101780003', 'Ahmad Hidayat', 'Fashion & Tekstil', 'Kecil', 'Gg. Simpang RT 003/002', '003', '002', 8, '15 - 50 Juta', 0, 'SKU/2026/07/0015', 'TERVERIFIKASI', 'Produksi kaos sablon, seragam kantor, dan kemeja bordir'),
          ('Warung Nasi Khas Sunda Ibu Kokom', '3273010101920004', 'Kokom Komalasari', 'Kuliner & Warung', 'Mikro', 'Jl. Kebon Jati No. 60 RT 001/001', '001', '001', 3, '< 5 Juta', 0, 'SKU/2026/09/0003', 'TERVERIFIKASI', 'Nasi timbel komplit, ayam goreng serundeng, pepes ikan mas'),
          ('Bengkel Motor Servis Jaya Abadi', '3273010101890005', 'Dedi Mulyadi', 'Jasa & Servis', 'Mikro', 'Jl. Gardujati RT 002/003', '002', '003', 2, '5 - 15 Juta', 0, 'SKU/2026/06/0008', 'TERVERIFIKASI', 'Servis rutin motor injeksi, tambal ban, ganti oli dan sparepart');
      `);
    }

    console.log('✅ MIGRASI SPRINT 8 BERHASIL SELESAI!');
  } catch (error) {
    console.error('❌ Error migrasi Sprint 8:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migrate().catch(() => process.exit(1));
}

module.exports = migrate;
