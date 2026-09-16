/**
 * src/db/auto_patch.js
 * Automatic Schema Migration & Standard Accounts Seeder
 * Developed by: Jabar Pintar Digital
 * Runs on server startup to guarantee zero-downtime database integrity.
 */

const pool = require('./pool');

const STANDARD_ACCOUNTS = [
  {
    username: 'superadmin',
    nama: 'Super Admin Sistem',
    role: 'superadmin',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeh/sdJa5doIVSQ6HCNTS2TCPYrymUJAe' // Sukabumi@Diskominfo2026
  },
  {
    username: 'walikota.sukabumi',
    nama: 'Pimpinan Wilayah Kota',
    role: 'walikota',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIersh.QVMglQPygCV/A3BrDqIGu99Tje6' // Sukabumi@Juara2026
  },
  {
    username: 'camat.cikole',
    nama: 'Camat Wilayah',
    role: 'camat',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeg2gqObX2E.F3bniHug6.1VEIVVzDrw2' // Cikole@Bisa2026
  },
  {
    username: 'admin.kebonjati',
    nama: 'Admin Pelayanan Kelurahan',
    role: 'admin_kelurahan',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe2zHbxC.mlSHiyvKW1qZPKqEwyfeA7pG' // Kebonjati@Hebat2026
  },
  {
    username: 'lurah.kebonjati',
    nama: 'Lurah Kebonjati (TTE)',
    role: 'lurah',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe8DvvnI6qwH5HS/THBUiLR4xMty8Fqb2' // Lurah@Kebonjati2026
  },
  {
    username: 'rw01_kebonjati',
    nama: 'Ketua RW 001',
    role: 'ketua_rw',
    rt: null,
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe0TQ0qNzLo4sPU1jd5.uOnjo.1wzESFS' // Warga01@Kbj2026
  },
  {
    username: 'rt01_rw01_kbj',
    nama: 'Ketua RT 001 RW 001',
    role: 'ketua_rt',
    rt: '001',
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeKPZ9EDxTF.S7uSCvnbVh96DiIVLMP1a' // Guyub01@Kbj2026
  },
  {
    username: 'posyandu.melati_rw01',
    nama: 'Kader Posyandu Melati',
    role: 'kader_posyandu',
    rt: null,
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe6yQHdYNKAuo2WrYVylxSIWxjMds6DJe' // Sehat01@Kbj2026
  },
  {
    username: '3273010203850003',
    nama: 'Budi Santoso',
    role: 'warga',
    rt: '001',
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeFikSbl7QyRSVM7/Loh1SWYQwh.CT8Si' // Warga@0003#2026
  },
  {
    username: '3273014504900004',
    nama: 'Siti Rahayu',
    role: 'warga',
    rt: '002',
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeX8wRUAKQzltPFP/YXjDU5nwKeTBIrJa' // Warga@0004#2026
  }
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

    // 2. Pastikan tabel warga memiliki kolom user_id
    try {
      await connection.query("ALTER TABLE warga ADD COLUMN user_id INT NULL");
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

    // 5. Pastikan kolom jenis_surat dan jenis_dokumen serta kolom pendukung di dokumen_request tersedia
    const dokCols = [
      'jenis_surat VARCHAR(100) NULL',
      'jenis_dokumen VARCHAR(100) NULL',
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
      'rw VARCHAR(5) NULL'
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

    // 7. Kolom jaminan sosial (BPJS / Asuransi & Bukti Bansos Mandiri) pada tabel warga
    const wargaSocialCols = [
      "kategori_asuransi VARCHAR(100) NULL DEFAULT 'Tidak Memiliki Asuransi'",
      "nomor_asuransi VARCHAR(50) NULL",
      "bukti_bansos_url VARCHAR(255) NULL",
      "catatan_bansos_mandiri TEXT NULL"
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
