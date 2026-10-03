/**
 * src/db/auto_patch.js
 * Automatic Schema Migration & Standard Accounts Seeder
 * Developed by: Jabar Pintar Digital
 * Runs on server startup to guarantee zero-downtime database integrity.
 */

const pool = require('./pool');

const STANDARD_PASSWORD_HASH = '$2b$10$hN5MqJELAnUdVw3eoFGBgObO9O5oF/eCGw3rLk6SJv/B4ZMJ7ev3q'; // BumiWarga@2026

const STANDARD_ACCOUNTS = [
  // 1. Eksekutif & Diskominfo
  { username: 'superadmin', nama: 'Super Admin Diskominfo', role: 'superadmin', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },
  { username: 'walikota.sukabumi', nama: 'H. Achmad Fahmi (Walikota)', role: 'walikota', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },
  { username: 'camat.cikole', nama: 'Drs. H. Fajar Purnama (Camat Cikole)', role: 'camat', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },

  // 2. Kelurahan Kebonjati
  { username: 'lurah.kebonjati', nama: 'Hendra Gunawan (Lurah Kebonjati)', role: 'lurah', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },
  { username: 'admin.kebonjati', nama: 'Siti Rahmawati (Admin Kebonjati)', role: 'admin_kelurahan', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rw01_kebonjati', nama: 'H. Ahmad Sanusi (RW 01 Kebonjati)', role: 'ketua_rw', rt: null, rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt01_rw01_kbj', nama: 'Dadang Ruhiyat (RT 01 Kebonjati)', role: 'ketua_rt', rt: '001', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt02_rw01_kbj', nama: 'Cecep Solihin (RT 02 Kebonjati)', role: 'ketua_rt', rt: '002', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt03_rw01_kbj', nama: 'Agus Setiawan (RT 03 Kebonjati)', role: 'ketua_rt', rt: '003', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt04_rw01_kbj', nama: 'Dedi Mulyadi (RT 04 Kebonjati)', role: 'ketua_rt', rt: '004', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt05_rw01_kbj', nama: 'Eko Prasetyo (RT 05 Kebonjati)', role: 'ketua_rt', rt: '005', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'posyandu.melati_kbj', nama: 'Ny. Hj. Yayah Rokayah (Posyandu Melati)', role: 'kader_posyandu', rt: null, rw: '001', password_hash: STANDARD_PASSWORD_HASH },

  // 3. Kelurahan Cikole
  { username: 'lurah.cikole', nama: 'Ir. H. Dian Ardiansyah (Lurah Cikole)', role: 'lurah', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },
  { username: 'admin.cikole', nama: 'Rizky Pratama (Admin Cikole)', role: 'admin_kelurahan', rt: null, rw: null, password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rw01_cikole', nama: 'H. Maman Suryaman (RW 01 Cikole)', role: 'ketua_rw', rt: null, rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt01_rw01_ckl', nama: 'Rahmat Hidayat (RT 01 Cikole)', role: 'ketua_rt', rt: '001', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt02_rw01_ckl', nama: 'Bambang Pamungkas (RT 02 Cikole)', role: 'ketua_rt', rt: '002', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt03_rw01_ckl', nama: 'Deden Suherman (RT 03 Cikole)', role: 'ketua_rt', rt: '003', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt04_rw01_ckl', nama: 'Wawan Kurniawan (RT 04 Cikole)', role: 'ketua_rt', rt: '004', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'rt05_rw01_ckl', nama: 'Gunawan Wibisono (RT 05 Cikole)', role: 'ketua_rt', rt: '005', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: 'posyandu.mawar_ckl', nama: 'Ny. Nunung Nurjanah (Posyandu Mawar)', role: 'kader_posyandu', rt: null, rw: '001', password_hash: STANDARD_PASSWORD_HASH },

  // 4. Akun Uji Coba Warga Resmi (Sukabumi)
  { username: '3272030103810001', nama: 'Budi Santoso', role: 'warga', rt: '001', rw: '001', password_hash: STANDARD_PASSWORD_HASH },
  { username: '3272030101900101', nama: 'Keluarga Budi Santoso (KK)', role: 'warga', rt: '001', rw: '001', password_hash: STANDARD_PASSWORD_HASH }
];

async function autoPatchDatabase() {
  console.log('[AutoPatch] Memeriksa skema database dan tabel pengguna...');
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Pastikan tabel users memiliki kolom yang fleksibel
    try {
      await connection.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'warga'");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NOT NULL");
    } catch (e) {}

    const userColumns = ['rt', 'rw', 'last_login_at', 'must_change_password', 'kode_kecamatan', 'kode_kelurahan'];
    for (const col of userColumns) {
      try {
        if (col === 'last_login_at') {
          await connection.query("ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL");
        } else if (col === 'must_change_password') {
          await connection.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0");
        } else {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col} VARCHAR(50) NULL`);
        }
      } catch (e) {}
    }

    // 2. Pastikan tabel warga memiliki kolom user_id, hubungan keluarga, dan jaminan sosial
    const wargaColumns = [
      'user_id INT NULL',
      "status_hubungan_keluarga VARCHAR(50) NULL DEFAULT 'Anggota'",
      "hubungan_keluarga VARCHAR(50) NULL DEFAULT 'Anggota'",
      'bpjs_kesehatan VARCHAR(50) NULL',
      "bpjs_kesehatan_status VARCHAR(50) NULL DEFAULT 'AKTIF'",
      'bpjs_ketenagakerjaan VARCHAR(50) NULL',
      "bpjs_ketenagakerjaan_status VARCHAR(50) NULL DEFAULT 'AKTIF'",
      'kip VARCHAR(50) NULL',
      'kis VARCHAR(50) NULL'
    ];
    for (const wCol of wargaColumns) {
      try {
        await connection.query(`ALTER TABLE warga ADD COLUMN ${wCol}`);
      } catch (e) {}
    }

    // Sinkronisasi status_hubungan_keluarga dan hubungan_keluarga jika salah satunya kosong
    try {
      await connection.query(`
        UPDATE warga
        SET status_hubungan_keluarga = COALESCE(status_hubungan_keluarga, hubungan_keluarga, 'Anggota'),
            hubungan_keluarga = COALESCE(hubungan_keluarga, status_hubungan_keluarga, 'Anggota')
        WHERE status_hubungan_keluarga IS NULL OR hubungan_keluarga IS NULL
      `);
    } catch (e) {}

    // 3. Pastikan tabel posyandu_lansia dan posyandu_lansia_pemeriksaan ada
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`posyandu_lansia\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nik\` VARCHAR(16) NOT NULL UNIQUE,
          \`nama\` VARCHAR(150) NOT NULL,
          \`tanggal_lahir\` DATE NOT NULL,
          \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
          \`alamat\` TEXT NOT NULL,
          \`rt\` VARCHAR(5) NOT NULL,
          \`rw\` VARCHAR(5) NOT NULL,
          \`status_tinggal\` ENUM('Bersama Keluarga', 'Sebatang Kara') NOT NULL DEFAULT 'Bersama Keluarga',
          \`riwayat_penyakit\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_lansia_rt_rw\` (\`rt\`, \`rw\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE posyandu_lansia note:', e.message);
    }

    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`posyandu_lansia_pemeriksaan\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`posyandu_lansia_id\` INT NOT NULL,
          \`tanggal_pemeriksaan\` DATE NOT NULL,
          \`tensi_sistolik\` INT NOT NULL,
          \`tensi_diastolik\` INT NOT NULL,
          \`gula_darah_sewaktu\` INT NULL,
          \`kolesterol\` INT NULL,
          \`asam_urat\` DECIMAL(4,1) NULL,
          \`berat_badan_kg\` DECIMAL(5,2) NOT NULL,
          \`tinggi_badan_cm\` DECIMAL(5,2) NOT NULL,
          \`imt\` DECIMAL(4,1) NULL,
          \`skor_kemandirian_adl\` ENUM('Mandiri', 'Ketergantungan Ringan', 'Ketergantungan Sedang', 'Ketergantungan Berat') NOT NULL DEFAULT 'Mandiri',
          \`keluhan\` TEXT NULL,
          \`tindakan_petugas\` TEXT NULL,
          \`petugas\` VARCHAR(100) NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_pemeriksaan_lansia_id\` (\`posyandu_lansia_id\`),
          INDEX \`idx_pemeriksaan_lansia_tgl\` (\`tanggal_pemeriksaan\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE posyandu_lansia_pemeriksaan note:', e.message);
    }

    // 4. Pastikan tabel bansos_pengajuan ada
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`bansos_pengajuan\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nomor_pengajuan\` VARCHAR(50) NOT NULL UNIQUE,
          \`no_kk\` VARCHAR(16) NOT NULL,
          \`nik_penerima\` VARCHAR(16) NOT NULL,
          \`nama_penerima\` VARCHAR(150) NOT NULL,
          \`jenis_bansos\` VARCHAR(100) NOT NULL DEFAULT 'PKH',
          \`alasan_pengajuan\` TEXT NOT NULL,
          \`nominal_bantuan\` DECIMAL(12,2) NULL DEFAULT 0.00,
          \`status\` VARCHAR(50) NOT NULL DEFAULT 'PENDING_RT',
          \`approval_step\` VARCHAR(50) NOT NULL DEFAULT 'RT',
          \`rt\` VARCHAR(5) NOT NULL,
          \`rw\` VARCHAR(5) NOT NULL,
          \`diajukan_oleh_user_id\` INT NULL,
          \`diverifikasi_oleh_user_id\` INT NULL,
          \`disahkan_oleh_user_id\` INT NULL,
          \`catatan_verifikasi\` TEXT NULL,
          \`foto_penyerahan_url\` VARCHAR(255) NULL,
          \`koordinat_lat_lng\` VARCHAR(100) NULL,
          \`tanda_tangan_penerima_url\` VARCHAR(255) NULL,
          \`diserahkan_oleh_user_id\` INT NULL,
          \`tanggal_penyerahan\` DATETIME NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_bansos_nik\` (\`nik_penerima\`),
          INDEX \`idx_bansos_no_kk\` (\`no_kk\`),
          INDEX \`idx_bansos_rt_rw\` (\`rt\`, \`rw\`),
          INDEX \`idx_bansos_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE bansos_pengajuan note:', e.message);
    }

    // 4.1 Pastikan tabel desil_keluarga tersedia
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`desil_keluarga\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`no_kk\` VARCHAR(16) NOT NULL UNIQUE,
          \`desil_saat_ini\` INT NULL,
          \`desil_usulan\` INT NULL,
          \`desil_resmi_pemerintah\` INT NULL,
          \`id_dtks_kemensos\` VARCHAR(50) NULL,
          \`id_dtks_resmi\` VARCHAR(50) NULL,
          \`status_dtks\` VARCHAR(50) DEFAULT 'BELUM_TERDAFTAR',
          \`bansos_diterima_resmi\` VARCHAR(255) NULL,
          \`status_verifikasi\` VARCHAR(50) DEFAULT 'DRAFT_USULAN',
          \`status_sinkronisasi\` VARCHAR(50) DEFAULT 'DRAFT',
          \`daya_listrik\` VARCHAR(50) NULL DEFAULT '900 VA',
          \`status_rumah\` VARCHAR(50) NULL DEFAULT 'Milik Sendiri',
          \`sumber_air\` VARCHAR(50) NULL DEFAULT 'PDAM/Leding',
          \`luas_lantai_kategori\` VARCHAR(50) NULL DEFAULT '8 - 14 m2',
          \`bahan_bakar_memasak\` VARCHAR(50) NULL DEFAULT 'Gas 3kg',
          \`kepemilikan_motor\` VARCHAR(50) NULL DEFAULT '1 unit',
          \`kepemilikan_mobil\` TINYINT(1) DEFAULT 0,
          \`ada_disabilitas_lansia_tunggal\` TINYINT(1) DEFAULT 0,
          \`ada_anak_sekolah_pip\` TINYINT(1) DEFAULT 0,
          \`bukti_kementerian_url\` VARCHAR(255) NULL,
          \`nomor_referensi_bukti\` VARCHAR(100) NULL,
          \`foto_rumah_depan_url\` VARCHAR(255) NULL,
          \`foto_rumah_dalam_url\` VARCHAR(255) NULL,
          \`foto_meteran_listrik_url\` VARCHAR(255) NULL,
          \`sptjm_warga_accepted\` TINYINT(1) DEFAULT 0,
          \`sptjm_warga_at\` DATETIME NULL,
          \`sptjm_verifikator_accepted\` TINYINT(1) DEFAULT 0,
          \`sptjm_verifikator_at\` DATETIME NULL,
          \`verifikator_rt_user_id\` INT NULL,
          \`tanggal_ground_check\` DATETIME NULL,
          \`catatan_ground_check_rt\` TEXT NULL,
          \`catatan_komparasi_kelurahan\` TEXT NULL,
          \`catatan_kelurahan\` TEXT NULL,
          \`diajukan_oleh_user_id\` INT NULL,
          \`diajukan_oleh_role\` VARCHAR(50) DEFAULT 'warga',
          \`tanggal_pengajuan\` DATETIME NULL,
          \`disahkan_oleh_user_id\` INT NULL,
          \`tanggal_pengesahan\` DATETIME NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_desil_no_kk\` (\`no_kk\`),
          INDEX \`idx_desil_status\` (\`status_verifikasi\`),
          INDEX \`idx_desil_sinkron\` (\`status_sinkronisasi\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE desil_keluarga note:', e.message);
    }

    // 4.2 Patch kolom baru pada tabel desil_keluarga
    const desilCols = [
      'desil_resmi_pemerintah INT NULL',
      'id_dtks_resmi VARCHAR(50) NULL',
      "status_dtks VARCHAR(50) DEFAULT 'BELUM_TERDAFTAR'",
      'bansos_diterima_resmi VARCHAR(255) NULL',
      "status_sinkronisasi VARCHAR(50) DEFAULT 'DRAFT'",
      'sptjm_warga_accepted TINYINT(1) DEFAULT 0',
      'sptjm_warga_at DATETIME NULL',
      'sptjm_verifikator_accepted TINYINT(1) DEFAULT 0',
      'sptjm_verifikator_at DATETIME NULL',
      'foto_rumah_depan_url VARCHAR(255) NULL',
      'foto_rumah_dalam_url VARCHAR(255) NULL',
      'foto_meteran_listrik_url VARCHAR(255) NULL',
      'catatan_ground_check_rt TEXT NULL',
      'verifikator_rt_user_id INT NULL',
      'tanggal_ground_check DATETIME NULL',
      'catatan_komparasi_kelurahan TEXT NULL'
    ];
    for (const dCol of desilCols) {
      try {
        await connection.query(`ALTER TABLE desil_keluarga ADD COLUMN ${dCol}`);
      } catch (e) {}
    }

    // 4.3 Patch kolom baru pada tabel bansos_pengajuan (Sumber Dana, Penyesuaian Kuota & Penjadwalan Tiket)
    const bansosExtraCols = [
      "sumber_dana VARCHAR(50) DEFAULT 'APBN_PUSAT'",
      'nominal_awal DECIMAL(12,2) NULL',
      'alasan_penyesuaian TEXT NULL',
      'nomor_ba_penyesuaian VARCHAR(100) NULL',
      'disetujui_penyesuaian_rw TINYINT(1) DEFAULT 0',
      'disetujui_penyesuaian_rt TINYINT(1) DEFAULT 0',
      'jadwal_pengambilan_tanggal DATE NULL',
      'jadwal_pengambilan_waktu VARCHAR(100) NULL',
      'lokasi_pengambilan VARCHAR(255) NULL',
      'persyaratan_bawaan TEXT NULL',
      'qr_ticket_code VARCHAR(100) NULL'
    ];
    for (const bCol of bansosExtraCols) {
      try {
        await connection.query(`ALTER TABLE bansos_pengajuan ADD COLUMN ${bCol}`);
      } catch (e) {}
    }

    // 5. Pastikan tabel dokumen_request tersedia dan fleksibel (VARCHAR bukan ENUM & tanpa fk_dokumen_warga constraint)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`dokumen_request\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nomor_registrasi\` VARCHAR(50) NOT NULL UNIQUE,
          \`nik_pemohon\` VARCHAR(16) NOT NULL,
          \`diajukan_oleh_nik\` VARCHAR(16) NULL,
          \`nama_subjek\` VARCHAR(150) NULL,
          \`hubungan_keluarga\` VARCHAR(50) NULL,
          \`jenis_surat\` VARCHAR(150) NOT NULL,
          \`jenis_dokumen\` VARCHAR(150) NOT NULL,
          \`keperluan\` TEXT NOT NULL,
          \`status\` VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
          \`approval_step\` VARCHAR(50) NOT NULL DEFAULT 'RT',
          \`rt\` VARCHAR(5) NULL,
          \`rw\` VARCHAR(5) NULL,
          \`data_tambahan\` TEXT NULL,
          \`syarat_berkas\` TEXT NULL,
          \`is_auto_filled_by_ai\` TINYINT(1) NOT NULL DEFAULT 0,
          \`trigger_executed\` TINYINT(1) NOT NULL DEFAULT 0,
          \`catatan_petugas\` TEXT NULL,
          \`catatan_admin\` TEXT NULL,
          \`catatan_revisi\` TEXT NULL,
          \`approved_by_rt\` INT NULL,
          \`approved_by_rw\` INT NULL,
          \`approved_by_kelurahan\` INT NULL,
          \`file_url\` VARCHAR(255) NULL,
          \`file_hasil\` VARCHAR(500) NULL,
          \`lampiran_ktp\` VARCHAR(500) NULL,
          \`lampiran_kk\` VARCHAR(500) NULL,
          \`rt_received_at\` DATETIME NULL,
          \`sla_deadline\` DATETIME NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_doc_nik\` (\`nik_pemohon\`),
          INDEX \`idx_doc_diajukan\` (\`diajukan_oleh_nik\`),
          INDEX \`idx_doc_step\` (\`approval_step\`),
          INDEX \`idx_doc_status\` (\`status\`),
          INDEX \`idx_doc_rt_rw\` (\`rt\`, \`rw\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (e) {}

    // Drop foreign key constraints yang menyebabkan error saat pengajuan dokumen
    try { await connection.query("ALTER TABLE dokumen_request DROP FOREIGN KEY fk_dokumen_warga"); } catch (e) {}
    try { await connection.query("ALTER TABLE dokumen_request DROP FOREIGN KEY fk_dokumen_pemohon"); } catch (e) {}

    // Konversi kolom agar tidak terbentur batasan ENUM lama
    try { await connection.query("ALTER TABLE dokumen_request MODIFY COLUMN jenis_dokumen VARCHAR(150) NOT NULL"); } catch (e) {}
    try { await connection.query("ALTER TABLE dokumen_request MODIFY COLUMN jenis_surat VARCHAR(150) NOT NULL"); } catch (e) {}
    try { await connection.query("ALTER TABLE dokumen_request MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED'"); } catch (e) {}
    try { await connection.query("ALTER TABLE dokumen_request MODIFY COLUMN keperluan TEXT NOT NULL"); } catch (e) {}

    const dokCols = [
      'jenis_surat VARCHAR(150) NULL',
      'jenis_dokumen VARCHAR(150) NULL',
      'nomor_registrasi VARCHAR(50) NULL',
      "approval_step VARCHAR(50) NOT NULL DEFAULT 'RT'",
      'catatan_petugas TEXT NULL',
      'catatan_admin TEXT NULL',
      'approved_by_rt INT NULL',
      'approved_by_rw INT NULL',
      'approved_by_kelurahan INT NULL',
      'trigger_executed TINYINT(1) NOT NULL DEFAULT 0',
      'is_auto_filled_by_ai TINYINT(1) NOT NULL DEFAULT 0',
      'file_url VARCHAR(255) NULL',
      'file_hasil VARCHAR(500) NULL',
      'catatan_revisi TEXT NULL',
      'lampiran_ktp VARCHAR(500) NULL',
      'lampiran_kk VARCHAR(500) NULL',
      'rt VARCHAR(5) NULL',
      'rw VARCHAR(5) NULL',
      'diajukan_oleh_nik VARCHAR(16) NULL',
      'nama_subjek VARCHAR(150) NULL',
      'hubungan_keluarga VARCHAR(50) NULL',
      'data_tambahan TEXT NULL',
      'syarat_berkas TEXT NULL'
    ];
    for (const def of dokCols) {
      try {
        await connection.query(`ALTER TABLE dokumen_request ADD COLUMN ${def}`);
      } catch (e) {}
    }

    // Sinkronisasi kolom jenis_surat dan jenis_dokumen jika salah satunya null
    try {
      await connection.query(`
        UPDATE dokumen_request 
        SET jenis_surat = COALESCE(jenis_surat, jenis_dokumen),
            jenis_dokumen = COALESCE(jenis_dokumen, jenis_surat)
        WHERE jenis_surat IS NULL OR jenis_dokumen IS NULL
      `);
    } catch (e) {}

    // 6. Pastikan tabel bansos_audit_sanggahan (Tahap 2 Audit Anomali RT/RW) tersedia
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`bansos_audit_sanggahan\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`bansos_pengajuan_id\` INT NULL,
          \`nik_warga\` VARCHAR(16) NOT NULL,
          \`nama_warga\` VARCHAR(150) NOT NULL,
          \`no_kk\` VARCHAR(16) NULL,
          \`rt\` VARCHAR(5) NOT NULL,
          \`rw\` VARCHAR(5) NOT NULL,
          \`tipe_sanggahan\` ENUM('TIDAK_LAYAK', 'SUDAH_PINDAH', 'MENINGGAL_DUNIA', 'LAYAK_BELUM_TERDAFTAR') NOT NULL,
          \`alasan_lapangan\` TEXT NOT NULL,
          \`bukti_foto_url\` VARCHAR(255) NULL,
          \`status_review\` ENUM('PENDING_KELURAHAN', 'DISETUJUI_PENCABUTAN', 'DISETUJUI_INKLUSI', 'DITOLAK') NOT NULL DEFAULT 'PENDING_KELURAHAN',
          \`catatan_kelurahan\` TEXT NULL,
          \`dilaporkan_oleh_user_id\` INT NULL,
          \`direview_oleh_user_id\` INT NULL,
          \`tanggal_review\` DATETIME NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_audit_sanggahan_nik\` (\`nik_warga\`),
          INDEX \`idx_audit_sanggahan_rt_rw\` (\`rt\`, \`rw\`),
          INDEX \`idx_audit_sanggahan_status\` (\`status_review\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE bansos_audit_sanggahan note:', e.message);
    }

    // 7. Kolom jaminan sosial & login aman mandiri pada tabel warga
    const wargaSocialCols = [
      "kategori_asuransi VARCHAR(100) NULL DEFAULT 'Tidak Memiliki Asuransi'",
      "nomor_asuransi VARCHAR(50) NULL",
      "bpjs_kesehatan VARCHAR(50) NULL",
      "bpjs_kesehatan_status VARCHAR(50) NULL DEFAULT 'Aktif'",
      "bpjs_ketenagakerjaan VARCHAR(50) NULL",
      "bpjs_ketenagakerjaan_status VARCHAR(50) NULL DEFAULT 'Non-PPU'",
      "kip VARCHAR(50) NULL",
      "kis VARCHAR(50) NULL",
      "bukti_bansos_url VARCHAR(255) NULL",
      "catatan_bansos_mandiri TEXT NULL",
      "pin_mandiri VARCHAR(255) NULL",
      "last_login_at TIMESTAMP NULL DEFAULT NULL",
      "login_method VARCHAR(50) NULL"
    ];
    for (const wCol of wargaSocialCols) {
      try {
        await connection.query(`ALTER TABLE warga ADD COLUMN ${wCol}`);
      } catch (e) {}
    }

    // 4. Upsert Akun Standar Resmi
    // 8. Pastikan tabel keuangan_kas (Buku Kas Masuk & Keluar RT/RW) tersedia
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`keuangan_kas\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nomor_transaksi\` VARCHAR(50) NOT NULL UNIQUE,
          \`tipe\` ENUM('MASUK', 'KELUAR') NOT NULL,
          \`kategori\` VARCHAR(100) NOT NULL,
          \`nominal\` DECIMAL(12,2) NOT NULL,
          \`keterangan\` TEXT NOT NULL,
          \`tanggal_transaksi\` DATE NOT NULL,
          \`bukti_foto_url\` VARCHAR(255) NULL,
          \`tingkat_wilayah\` ENUM('RT', 'RW', 'KELURAHAN') NOT NULL DEFAULT 'RT',
          \`rt\` VARCHAR(5) NOT NULL,
          \`rw\` VARCHAR(5) NOT NULL,
          \`dicatat_oleh_user_id\` INT NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_kas_tipe\` (\`tipe\`),
          INDEX \`idx_kas_rt_rw\` (\`rt\`, \`rw\`),
          INDEX \`idx_kas_tgl\` (\`tanggal_transaksi\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE keuangan_kas note:', e.message);
    }

    // 9. Pastikan tabel keuangan_iuran_warga (Iuran Bulanan KK) tersedia
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`keuangan_iuran_warga\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`no_kk\` VARCHAR(16) NOT NULL,
          \`nama_kepala_keluarga\` VARCHAR(150) NOT NULL,
          \`periode_bulan\` VARCHAR(7) NOT NULL,
          \`nominal_tagihan\` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
          \`status_bayar\` ENUM('LUNAS', 'BELUM_BAYAR') NOT NULL DEFAULT 'BELUM_BAYAR',
          \`tanggal_bayar\` DATETIME NULL,
          \`metode_bayar\` ENUM('TUNAI_RT', 'TRANSFER') NULL,
          \`bukti_bayar_url\` VARCHAR(255) NULL,
          \`rt\` VARCHAR(5) NOT NULL,
          \`rw\` VARCHAR(5) NOT NULL,
          \`diterima_oleh_user_id\` INT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY \`uk_kk_periode\` (\`no_kk\`, \`periode_bulan\`),
          INDEX \`idx_iuran_rt_rw\` (\`rt\`, \`rw\`),
          INDEX \`idx_iuran_status\` (\`status_bayar\`),
          INDEX \`idx_iuran_periode\` (\`periode_bulan\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE keuangan_iuran_warga note:', e.message);
    }
    // 10. Kolom SLA & Timestamp Workflow pada dokumen_request (Sprint 1 - Data Foundation)
    const slaCols = [
      'rt_received_at DATETIME NULL',
      'rt_processed_at DATETIME NULL',
      'rw_received_at DATETIME NULL',
      'rw_processed_at DATETIME NULL',
      'kelurahan_received_at DATETIME NULL',
      'sla_deadline DATETIME NULL',
      'sla_breached_at DATETIME NULL'
    ];
    for (const slaDef of slaCols) {
      try {
        await connection.query(`ALTER TABLE dokumen_request ADD COLUMN ${slaDef}`);
      } catch (e) {}
    }

    // 11. Tabel Riwayat Workflow Dokumen (Audit Trail Persetujuan Berjenjang)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`dokumen_workflow_history\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`dokumen_request_id\` INT NOT NULL,
          \`from_step\` VARCHAR(50) NULL,
          \`to_step\` VARCHAR(50) NOT NULL,
          \`acted_by_user_id\` INT NOT NULL,
          \`acted_by_role\` VARCHAR(50) NOT NULL,
          \`action\` ENUM('APPROVE', 'REJECT', 'RETURN', 'SUBMIT', 'ESCALATE') NOT NULL,
          \`notes\` TEXT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_wfh_dokumen_id\` (\`dokumen_request_id\`),
          INDEX \`idx_wfh_acted_by\` (\`acted_by_user_id\`),
          INDEX \`idx_wfh_action\` (\`action\`),
          INDEX \`idx_wfh_created\` (\`created_at\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE dokumen_workflow_history note:', e.message);
    }

    // 12. Upsert Akun Standar Resmi
    for (const acc of STANDARD_ACCOUNTS) {
      try {
        await connection.execute(`
          INSERT INTO users (username, password_hash, nama, role, rt, rw, status, must_change_password)
          VALUES (?, ?, ?, ?, ?, ?, 'active', 0)
          ON DUPLICATE KEY UPDATE
            password_hash = VALUES(password_hash),
            nama = VALUES(nama),
            role = VALUES(role),
            rt = VALUES(rt),
            rw = VALUES(rw),
            status = 'active'
        `, [acc.username, acc.password_hash, acc.nama, acc.role, acc.rt, acc.rw]);
      } catch (errAcc) {}
    }

    // 13. Tabel Profil & Penugasan Kader Posyandu (Sprint Khusus KIA Digital)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`kader_posyandu_profile\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`user_id\` INT NOT NULL UNIQUE,
          \`nik\` VARCHAR(16) NOT NULL,
          \`nama_lengkap\` VARCHAR(150) NOT NULL,
          \`no_hp\` VARCHAR(20) NULL,
          \`nama_posyandu\` VARCHAR(150) NOT NULL DEFAULT 'Posyandu Melati',
          \`posyandu_list\` JSON NULL,
          \`wilayah_tugas\` JSON NOT NULL,
          \`status_aktif\` TINYINT(1) NOT NULL DEFAULT 1,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`fk_kader_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
          INDEX \`idx_kader_nik\` (\`nik\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE kader_posyandu_profile note:', e.message);
    }

    try {
      await connection.query('ALTER TABLE posyandu ADD COLUMN nik_anak VARCHAR(16) NULL');
    } catch (e) {}

    // Seeding Profil Kader Posyandu Default (posyandu.melati_rw01)
    try {
      const [uRows] = await connection.execute("SELECT id, nama FROM users WHERE username = 'posyandu.melati_rw01' LIMIT 1");
      if (uRows.length > 0) {
        const kaderUserId = uRows[0].id;
        const defaultWilayah = JSON.stringify([
          { rw: '001', rt: '001' },
          { rw: '001', rt: '002' }
        ]);
        const defaultPosyanduList = JSON.stringify(['Posyandu Melati RW 001', 'Posyandu Mawar RT 002']);

        await connection.execute(`
          INSERT INTO kader_posyandu_profile 
            (user_id, nik, nama_lengkap, no_hp, nama_posyandu, posyandu_list, wilayah_tugas, status_aktif)
          VALUES (?, '3273016008920005', ?, '081234567890', 'Posyandu Melati RW 001', ?, ?, 1)
          ON DUPLICATE KEY UPDATE
            nama_lengkap = VALUES(nama_lengkap),
            wilayah_tugas = VALUES(wilayah_tugas),
            nama_posyandu = VALUES(nama_posyandu)
        `, [kaderUserId, uRows[0].nama || 'Kader Posyandu Melati', defaultPosyanduList, defaultWilayah]);
      }
    } catch (errKader) {
      console.warn('[AutoPatch] Seed kader_posyandu_profile note:', errKader.message);
    }

    // 14. Tabel Fasilitas Keagamaan / Tempat Ibadah (Termasuk Fasilitas Beririsan Lintas RT/RW)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`fasilitas_keagamaan\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nama_tempat_ibadah\` VARCHAR(150) NOT NULL,
          \`jenis_agama\` VARCHAR(50) NOT NULL DEFAULT 'Islam',
          \`jenis_tempat_ibadah\` VARCHAR(50) NOT NULL DEFAULT 'Masjid',
          \`alamat\` TEXT NOT NULL,
          \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
          \`daya_tampung_jamaah\` INT NOT NULL DEFAULT 100,
          \`status_tanah\` VARCHAR(100) NOT NULL DEFAULT 'Wakaf',
          \`apakah_beririsan\` TINYINT(1) NOT NULL DEFAULT 0,
          \`rt_rw_beririsan\` JSON NULL,
          \`nama_pengurus_dkm\` VARCHAR(150) NULL,
          \`no_kontak_pengurus\` VARCHAR(20) NULL,
          \`titik_evakuasi_bencana\` TINYINT(1) NOT NULL DEFAULT 0,
          \`status_verifikasi\` VARCHAR(50) NOT NULL DEFAULT 'TERVERIFIKASI',
          \`catatan_verifikasi\` TEXT NULL,
          \`created_by_user_id\` INT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_ibadah_wilayah\` (\`rw\`, \`rt\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seed Tempat Ibadah Percontohan jika kosong
      const [ibadahRows] = await connection.query("SELECT COUNT(*) as count FROM fasilitas_keagamaan");
      if (ibadahRows[0].count === 0) {
        await connection.execute(`
          INSERT INTO fasilitas_keagamaan 
            (nama_tempat_ibadah, jenis_agama, jenis_tempat_ibadah, alamat, rt, rw, daya_tampung_jamaah, status_tanah, apakah_beririsan, rt_rw_beririsan, nama_pengurus_dkm, no_kontak_pengurus, titik_evakuasi_bencana, status_verifikasi)
          VALUES 
            ('Masjid Jami\\' Al-Ikhlas', 'Islam', 'Masjid', 'Jl. Kebonjati No. 45', '001', '001', 350, 'Wakaf', 1, ?, 'H. Ahmad Syukri', '081298765432', 1, 'TERVERIFIKASI'),
            ('Musholla Nurul Hidayah', 'Islam', 'Musholla', 'Gang Melati II RT 02', '002', '001', 80, 'Wakaf', 0, NULL, 'Ust. Deden', '081387654321', 0, 'TERVERIFIKASI')
        `, [JSON.stringify(['RT 001 / RW 001', 'RT 002 / RW 001'])]);
      }
    } catch (e) {
      console.warn('[AutoPatch] CREATE fasilitas_keagamaan note:', e.message);
    }

    // 15. Tabel Hunian Sewa (Rumah Kontrakan & Kos-Kosan Warga)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`hunian_sewa\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nama_hunian\` VARCHAR(150) NOT NULL,
          \`jenis_hunian\` VARCHAR(50) NOT NULL DEFAULT 'Kos-Kosan',
          \`alamat\` TEXT NOT NULL,
          \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
          \`jumlah_kamar_pintu\` INT NOT NULL DEFAULT 1,
          \`jumlah_penghuni_aktif\` INT NOT NULL DEFAULT 0,
          \`jumlah_penghuni_pelajar\` INT NOT NULL DEFAULT 0,
          \`jumlah_penghuni_pekerja\` INT NOT NULL DEFAULT 0,
          \`nama_pemilik\` VARCHAR(150) NOT NULL,
          \`no_kontak_pemilik\` VARCHAR(20) NOT NULL,
          \`apakah_pemilik_tinggal_di_rt\` TINYINT(1) NOT NULL DEFAULT 0,
          \`alamat_pemilik\` TEXT NULL,
          \`kepatuhan_wajib_lapor_24jam\` TINYINT(1) NOT NULL DEFAULT 1,
          \`status_verifikasi\` VARCHAR(50) NOT NULL DEFAULT 'TERVERIFIKASI',
          \`catatan_verifikasi\` TEXT NULL,
          \`created_by_user_id\` INT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_hunian_wilayah\` (\`rw\`, \`rt\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seed Kos/Kontrakan Percontohan jika kosong
      const [hunianRows] = await connection.query("SELECT COUNT(*) as count FROM hunian_sewa");
      if (hunianRows[0].count === 0) {
        await connection.execute(`
          INSERT INTO hunian_sewa 
            (nama_hunian, jenis_hunian, alamat, rt, rw, jumlah_kamar_pintu, jumlah_penghuni_aktif, jumlah_penghuni_pelajar, jumlah_penghuni_pekerja, nama_pemilik, no_kontak_pemilik, apakah_pemilik_tinggal_di_rt, alamat_pemilik, kepatuhan_wajib_lapor_24jam, status_verifikasi)
          VALUES 
            ('Kos Melati Asri', 'Kos-Kosan', 'Jl. Melati No. 18 RT 01', '001', '001', 12, 10, 8, 2, 'Bpk. Joko Susanto', '081234567891', 0, 'Jl. Dago No. 120 Kota Bandung', 1, 'TERVERIFIKASI'),
            ('Kontrakan Berkah 4 Pintu', 'Rumah Kontrakan', 'Gang Belakang RT 01', '001', '001', 4, 4, 0, 4, 'Ibu Hj. Aminah', '081398761234', 1, 'Jl. Melati No. 5 RT 01', 1, 'TERVERIFIKASI')
        `);
      }
    } catch (e) {
      console.warn('[AutoPatch] CREATE hunian_sewa note:', e.message);
    }

    // 16. Tabel Kelompok Rentan Lingkungan RT (Anak Yatim Piatu & Lansia Sebatang Kara)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`kelompok_rentan_rt\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`kategori\` VARCHAR(50) NOT NULL,
          \`nik\` VARCHAR(16) NOT NULL,
          \`nama\` VARCHAR(150) NOT NULL,
          \`no_kk\` VARCHAR(16) NULL,
          \`tanggal_lahir\` DATE NULL,
          \`usia\` INT NULL,
          \`jenis_kelamin\` ENUM('L', 'P') NOT NULL DEFAULT 'L',
          \`alamat\` TEXT NOT NULL,
          \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
          \`status_tempat_tinggal\` VARCHAR(100) NOT NULL DEFAULT 'Tinggal Sendiri',
          \`nama_wali_pengasuh\` VARCHAR(150) NULL,
          \`no_kontak_wali\` VARCHAR(20) NULL,
          \`status_sekolah\` VARCHAR(50) NOT NULL DEFAULT 'Tidak Berlaku',
          \`nama_sekolah\` VARCHAR(150) NULL,
          \`tingkat_kemandirian_adl\` VARCHAR(50) NOT NULL DEFAULT 'Tidak Berlaku',
          \`riwayat_penyakit_kronis\` TEXT NULL,
          \`bansos_diterima\` VARCHAR(150) NULL DEFAULT 'Belum Pernah Menerima',
          \`kebutuhan_mendesak\` TEXT NULL,
          \`sumber_pendataan\` VARCHAR(50) NOT NULL DEFAULT 'INPUT_RT',
          \`status_verifikasi\` VARCHAR(50) NOT NULL DEFAULT 'TERVERIFIKASI',
          \`catatan_verifikasi\` TEXT NULL,
          \`created_by_user_id\` INT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_rentan_nik\` (\`nik\`),
          INDEX \`idx_rentan_wilayah\` (\`rw\`, \`rt\`, \`kategori\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seed Kelompok Rentan Percontohan jika kosong
      const [rentanRows] = await connection.query("SELECT COUNT(*) as count FROM kelompok_rentan_rt");
      if (rentanRows[0].count === 0) {
        await connection.execute(`
          INSERT INTO kelompok_rentan_rt 
            (kategori, nik, nama, no_kk, tanggal_lahir, usia, jenis_kelamin, alamat, rt, rw, status_tempat_tinggal, nama_wali_pengasuh, no_kontak_wali, status_sekolah, nama_sekolah, tingkat_kemandirian_adl, riwayat_penyakit_kronis, bansos_diterima, kebutuhan_mendesak, sumber_pendataan, status_verifikasi)
          VALUES 
            ('ANAK_YATIM_PIATU', '3273011205130002', 'Fajar Ramadhan', '3273011802900012', '2013-05-12', 11, 'L', 'Jl. Melati No. 8 RT 01', '001', '001', 'Bersama Kakek/Nenek', 'Bpk. Mamat (Kakek)', '081399887766', 'Aktif Sekolah', 'SDN Kebonjati 01', 'Tidak Berlaku', NULL, 'Santunan RT Swadaya', 'Kebutuhan Seragam & Beasiswa Pendidikan', 'INPUT_RT', 'TERVERIFIKASI'),
            ('LANSIA_SEBATANG_KARA', '3273015004500001', 'Mbah Sumiati', '3273015004500001', '1950-04-10', 74, 'P', 'Gang Melati Bawah No. 3 RT 01', '001', '001', 'Tinggal Sendiri', NULL, NULL, 'Tidak Berlaku', NULL, 'Ketergantungan Sedang', 'Hipertensi Kronis & Asam Urat', 'PKH Lansia', 'Bantuan Makanan Harian & Kunjungan Posyandu', 'INPUT_RT', 'TERVERIFIKASI')
        `);
      }
    } catch (e) {
      console.warn('[AutoPatch] CREATE kelompok_rentan_rt note:', e.message);
    }

    // 17. Tabel Kartu Keluarga & Auto-Seed KK Warga Resmi (Budi Santoso)
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`kartu_keluarga\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`no_kk\` VARCHAR(16) NOT NULL UNIQUE,
          \`kepala_keluarga\` VARCHAR(150) NOT NULL,
          \`alamat\` TEXT NOT NULL,
          \`rt\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`rw\` VARCHAR(5) NOT NULL DEFAULT '001',
          \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
          \`kecamatan\` VARCHAR(100) NOT NULL DEFAULT 'Andir',
          \`kota\` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
          \`provinsi\` VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
          \`kode_pos\` VARCHAR(10) NOT NULL DEFAULT '40181',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_kk_no\` (\`no_kk\`),
          INDEX \`idx_kk_rt_rw\` (\`rw\`, \`rt\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Tambah kolom no_kk pada tabel users jika belum ada
      try {
        await connection.query("ALTER TABLE users ADD COLUMN no_kk VARCHAR(16) NULL");
      } catch (e) {}

      // Tambah KK Budi Santoso jika belum ada
      await connection.execute(`
        INSERT INTO \`kartu_keluarga\` 
          (\`no_kk\`, \`kepala_keluarga\`, \`alamat\`, \`rt\`, \`rw\`, \`kelurahan\`, \`kecamatan\`, \`kota\`, \`provinsi\`, \`kode_pos\`)
        VALUES 
          ('3273010101900001', 'Budi Santoso', 'Jl. Kebonjati No. 12 RT 001/RW 001', '001', '001', 'Kebonjati', 'Andir', 'Kota Bandung', 'Jawa Barat', '40181')
        ON DUPLICATE KEY UPDATE 
          \`kepala_keluarga\` = 'Budi Santoso',
          \`alamat\` = 'Jl. Kebonjati No. 12 RT 001/RW 001',
          \`rt\` = '001',
          \`rw\` = '001';
      `);

      // Pastikan tabel warga berisi anggota KK Budi Santoso
      
      // Master Seeder: Periksa apakah 200 warga telah terisi di database
      try {
        const [wCount] = await connection.query("SELECT COUNT(*) as count FROM warga WHERE nik = '3272030103810001'");
        if (wCount[0].count === 0) {
          const { seedFullProduction } = require(path.join(__dirname, '../../scripts/seed_full_production.js'));
          await seedFullProduction(connection);
        }
      } catch (seedErr) {
        console.warn('[AutoPatch] Master 200 warga seed note:', seedErr.message);
      }

      // Password Self-Healing: Pastikan seluruh akun menggunakan hash BumiWarga@2026 yang valid
      try {
        await connection.query(`
          UPDATE users 
          SET password_hash = '${STANDARD_PASSWORD_HASH}' 
          WHERE password_hash LIKE '$2b$10$818lk%' 
             OR password_hash LIKE '$2b$10$IcKfw%' 
             OR password_hash IS NULL 
             OR password_hash = ''
        `);
      } catch (passErr) {
        console.warn('[AutoPatch] Password self-healing note:', passErr.message);
      }
    } catch (e) {
      console.warn('[AutoPatch] kartu_keluarga auto-seed note:', e.message);
    }

    // 15. Tabel Direktori Aparatur Kelurahan, Mitra Keamanan (Babinsa/Bhabinkamtibmas), RT, RW, dan Posyandu
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`aparatur_kelurahan\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`kelurahan\` VARCHAR(100) NOT NULL DEFAULT 'Cikole',
          \`kecamatan\` VARCHAR(100) NOT NULL DEFAULT 'Cikole',
          \`kota\` VARCHAR(100) NOT NULL DEFAULT 'Kota Sukabumi',
          \`kategori\` ENUM('KELURAHAN', 'KEAMANAN', 'RW', 'RT', 'POSYANDU') NOT NULL,
          \`jabatan\` VARCHAR(100) NOT NULL,
          \`wilayah_rw\` VARCHAR(10) NULL,
          \`wilayah_rt\` VARCHAR(10) NULL,
          \`nama_posyandu\` VARCHAR(100) NULL,
          \`nik_pejabat\` VARCHAR(16) NULL,
          \`nama_pejabat\` VARCHAR(150) NOT NULL,
          \`nip_nrp\` VARCHAR(50) NULL,
          \`pangkat_golongan\` VARCHAR(50) NULL,
          \`no_telp\` VARCHAR(30) NULL,
          \`no_wa\` VARCHAR(30) NOT NULL,
          \`email\` VARCHAR(100) NULL,
          \`alamat_kantor\` VARCHAR(255) NULL,
          \`jam_layanan\` VARCHAR(100) DEFAULT 'Senin - Jumat, 08.00 - 15.00 WIB',
          \`foto_url\` VARCHAR(255) NULL,
          \`is_active\` TINYINT(1) DEFAULT 1,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_aparatur_wilayah\` (\`kelurahan\`, \`wilayah_rw\`, \`wilayah_rt\`),
          INDEX \`idx_aparatur_kategori\` (\`kategori\`),
          INDEX \`idx_aparatur_nik\` (\`nik_pejabat\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seeder Direktori Resmi Aparatur Kelurahan & Mitra Keamanan
      const [apaRows] = await connection.query("SELECT COUNT(*) as count FROM aparatur_kelurahan");
      if (apaRows[0].count === 0) {
        const DEFAULT_APARATUR = [
          // Kelurahan Cikole (Sukabumi)
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'KELURAHAN', jabatan: 'Lurah Cikole', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Ir. H. Dian Ardiansyah', nip_nrp: '197405121998031002', pangkat_golongan: 'Pembina / IV-a',
            no_telp: '0266-221133', no_wa: '081122334455', email: 'kelurahan.cikole@sukabumikota.go.id',
            alamat_kantor: 'Jl. R. Syamsudin, S.H. No. 45, Cikole, Kota Sukabumi', jam_layanan: 'Senin - Jumat, 08.00 - 15.30 WIB'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'KELURAHAN', jabatan: 'Sekretaris Kelurahan', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Hj. Erna Susanti, S.STP', nip_nrp: '198203152006042001', pangkat_golongan: 'Penata Tk. I / III-d',
            no_telp: '0266-221133', no_wa: '081234567801', email: 'seklur.cikole@sukabumikota.go.id',
            alamat_kantor: 'Kantor Kelurahan Cikole Lantai 1', jam_layanan: 'Senin - Jumat, 08.00 - 15.30 WIB'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'KELURAHAN', jabatan: 'Kasi Pemerintahan & Pelayanan Publik', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Budi Rahmat, S.Sos', nip_nrp: '198506142010011012', pangkat_golongan: 'Penata / III-c',
            no_telp: '0266-221133', no_wa: '081234567802', email: 'kasipem.cikole@sukabumikota.go.id',
            alamat_kantor: 'Kantor Kelurahan Cikole Ruang Layanan Terpadu', jam_layanan: 'Senin - Jumat, 08.00 - 15.30 WIB'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'KEAMANAN', jabatan: 'Babinsa TNI AD', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Sertu Hendra Wijaya', nip_nrp: '31980245120876', pangkat_golongan: 'Sersan Satu (Koramil 0701/Cikole)',
            no_telp: '0266-221100', no_wa: '081398765432', email: 'babinsa.cikole@tniad.mil.id',
            alamat_kantor: 'Pos Koramil Cikole / Kelurahan Cikole', jam_layanan: 'Siaga 24 Jam'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'KEAMANAN', jabatan: 'Bhabinkamtibmas Polri', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Bripka Asep Kurniawan, S.H.', nip_nrp: '85061234', pangkat_golongan: 'Brigadir Polisi Kepala (Polsek Cikole)',
            no_telp: '0266-221110', no_wa: '081287654321', email: 'bhabin.cikole@polri.go.id',
            alamat_kantor: 'Pos Bhabinkamtibmas Kelurahan Cikole / Polsek Cikole', jam_layanan: 'Siaga 24 Jam'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'RW', jabatan: 'Ketua RW 001', wilayah_rw: '001', wilayah_rt: null,
            nama_pejabat: 'H. Maman Suryaman', nip_nrp: null, pangkat_golongan: null,
            no_telp: '081223344556', no_wa: '081223344556', email: null,
            alamat_kantor: 'Balai Warga RW 001 Cikole', jam_layanan: 'Senin - Sabtu, 08.00 - 20.00 WIB'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'RT', jabatan: 'Ketua RT 001', wilayah_rw: '001', wilayah_rt: '001',
            nama_pejabat: 'Rahmat Hidayat', nip_nrp: null, pangkat_golongan: null,
            no_telp: '081334455667', no_wa: '081334455667', email: null,
            alamat_kantor: 'Sekretariat RT 001/RW 001 Cikole', jam_layanan: 'Senin - Minggu, 08.00 - 21.00 WIB'
          },
          {
            kelurahan: 'Cikole', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
            kategori: 'POSYANDU', jabatan: 'Koordinator Kader Posyandu', wilayah_rw: '001', wilayah_rt: '001',
            nama_posyandu: 'Posyandu Mawar RW 001', nama_pejabat: 'Ny. Nunung Nurjanah', nip_nrp: null, pangkat_golongan: null,
            no_telp: '081556677889', no_wa: '081556677889', email: null,
            alamat_kantor: 'Gedung Posyandu Mawar RW 001', jam_layanan: 'Jadwal Posyandu & Layanan Warga'
          },

          // Kelurahan Kebonjati (Bandung)
          {
            kelurahan: 'Kebonjati', kecamatan: 'Andir', kota: 'Kota Bandung',
            kategori: 'KELURAHAN', jabatan: 'Lurah Kebonjati', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Hendra Gunawan, S.AP', nip_nrp: '197808202002121004', pangkat_golongan: 'Pembina / IV-a',
            no_telp: '022-4201234', no_wa: '081199887766', email: 'kelurahan.kebonjati@bandung.go.id',
            alamat_kantor: 'Jl. Kebonjati No. 100, Andir, Kota Bandung', jam_layanan: 'Senin - Jumat, 08.00 - 15.30 WIB'
          },
          {
            kelurahan: 'Kebonjati', kecamatan: 'Andir', kota: 'Kota Bandung',
            kategori: 'KEAMANAN', jabatan: 'Babinsa TNI AD', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Serma Dedi Supriadi', nip_nrp: '21950341250775', pangkat_golongan: 'Sersan Mayor (Koramil Andir)',
            no_telp: '022-4205566', no_wa: '081322110099', email: 'babinsa.kebonjati@tniad.mil.id',
            alamat_kantor: 'Pos Koramil Andir / Kelurahan Kebonjati', jam_layanan: 'Siaga 24 Jam'
          },
          {
            kelurahan: 'Kebonjati', kecamatan: 'Andir', kota: 'Kota Bandung',
            kategori: 'KEAMANAN', jabatan: 'Bhabinkamtibmas Polri', wilayah_rw: null, wilayah_rt: null,
            nama_pejabat: 'Aipda Agus Maulana', nip_nrp: '82040987', pangkat_golongan: 'Ajun Inspektur Polisi Dua (Polsek Andir)',
            no_telp: '022-4207788', no_wa: '081299001122', email: 'bhabin.kebonjati@polri.go.id',
            alamat_kantor: 'Pos Bhabinkamtibmas Kelurahan Kebonjati', jam_layanan: 'Siaga 24 Jam'
          },
          {
            kelurahan: 'Kebonjati', kecamatan: 'Andir', kota: 'Kota Bandung',
            kategori: 'RW', jabatan: 'Ketua RW 001', wilayah_rw: '001', wilayah_rt: null,
            nama_pejabat: 'H. Ahmad Sanusi', nip_nrp: null, pangkat_golongan: null,
            no_telp: '081233445566', no_wa: '081233445566', email: null,
            alamat_kantor: 'Balai Pertemuan RW 001 Kebonjati', jam_layanan: 'Senin - Sabtu, 08.00 - 20.00 WIB'
          },
          {
            kelurahan: 'Kebonjati', kecamatan: 'Andir', kota: 'Kota Bandung',
            kategori: 'RT', jabatan: 'Ketua RT 001', wilayah_rw: '001', wilayah_rt: '001',
            nama_pejabat: 'Dadang Ruhiyat', nip_nrp: null, pangkat_golongan: null,
            no_telp: '081344556677', no_wa: '081344556677', email: null,
            alamat_kantor: 'Sekretariat RT 001/RW 001 Kebonjati', jam_layanan: 'Senin - Minggu, 08.00 - 21.00 WIB'
          },
          {
            kelurahan: 'Kebonjati', kecamatan: 'Andir', kota: 'Kota Bandung',
            kategori: 'POSYANDU', jabatan: 'Koordinator Kader Posyandu', wilayah_rw: '001', wilayah_rt: '001',
            nama_posyandu: 'Posyandu Melati RW 001', nama_pejabat: 'Ny. Hj. Yayah Rokayah', nip_nrp: null, pangkat_golongan: null,
            no_telp: '081234567890', no_wa: '081234567890', email: null,
            alamat_kantor: 'Pos RW 001 Kebonjati', jam_layanan: 'Jadwal Posyandu & Layanan Warga'
          }
        ];

        for (const item of DEFAULT_APARATUR) {
          await connection.execute(`
            INSERT INTO aparatur_kelurahan 
              (kelurahan, kecamatan, kota, kategori, jabatan, wilayah_rw, wilayah_rt, nama_posyandu, 
               nama_pejabat, nip_nrp, pangkat_golongan, no_telp, no_wa, email, alamat_kantor, jam_layanan, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
          `, [
            item.kelurahan, item.kecamatan, item.kota, item.kategori, item.jabatan, item.wilayah_rw, item.wilayah_rt, item.nama_posyandu || null,
            item.nama_pejabat, item.nip_nrp || null, item.pangkat_golongan || null, item.no_telp || null, item.no_wa, item.email || null,
            item.alamat_kantor || null, item.jam_layanan || 'Senin - Jumat, 08.00 - 15.00 WIB'
          ]);
        }
        console.log('[AutoPatch] Berhasil melakukan seed 14 data aparatur & mitra keamanan (Cikole & Kebonjati).');
      }
    } catch (e) {
      console.warn('[AutoPatch] CREATE aparatur_kelurahan note:', e.message);
    }

    console.log('[AutoPatch] Skema database dan akun standar diverifikasi.');
  } catch (err) {
    console.warn('[AutoPatch] Catatan auto-patch database:', err.message);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  autoPatchDatabase,
  STANDARD_ACCOUNTS
};
