/**
 * database/migrate_desil.js
 * Migration Script for Sprint 6: Modul DESIL Kesejahteraan (DTSEN BPS & Kemensos)
 * + Penyaluran Bansos Lapangan (Point of Disbursement)
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  console.log('=== MEMULAI MIGRASI SPRINT 6: DESIL KELUARGA & PENYALURAN BANSOS ===');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wk_community_os',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    multipleStatements: true
  });

  try {
    // 1. Buat Tabel desil_keluarga jika belum ada
    console.log('[1/3] Membuat tabel desil_keluarga...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`desil_keluarga\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`no_kk\` VARCHAR(16) NOT NULL UNIQUE,
        \`desil_saat_ini\` TINYINT NULL COMMENT '1 s/d 10 (Resmi disahkan kelurahan)',
        \`desil_usulan\` TINYINT NOT NULL DEFAULT 4 COMMENT '1 s/d 10 (Kalkulasi kuesioner PMT)',
        
        -- Indikator Sosial Ekonomi DTSEN BPS
        \`daya_listrik\` ENUM('450 VA', '900 VA', '1300 VA', '> 1300 VA', 'Tanpa Meteran') NOT NULL DEFAULT '900 VA',
        \`status_rumah\` ENUM('Milik Sendiri', 'Sewa/Kontrak', 'Menumpang', 'Bebas Sewa') NOT NULL DEFAULT 'Milik Sendiri',
        \`sumber_air\` ENUM('PDAM/Leding', 'Sumur Terlindung', 'Sumur Tidak Terlindung', 'Air Kemasan/Isi Ulang') NOT NULL DEFAULT 'PDAM/Leding',
        \`luas_lantai_kategori\` ENUM('< 8 m2 (Padat)', '8 - 14 m2', '> 14 m2') NOT NULL DEFAULT '8 - 14 m2',
        \`bahan_bakar_memasak\` ENUM('Gas 3kg', 'Gas > 3kg', 'Minyak/Kayu', 'Listrik') NOT NULL DEFAULT 'Gas 3kg',
        \`kepemilikan_motor\` ENUM('0 unit', '1 unit', '>= 2 unit') NOT NULL DEFAULT '1 unit',
        \`kepemilikan_mobil\` TINYINT(1) NOT NULL DEFAULT 0,
        \`ada_disabilitas_lansia_tunggal\` TINYINT(1) NOT NULL DEFAULT 0,
        \`ada_anak_sekolah_pip\` TINYINT(1) NOT NULL DEFAULT 0,
        
        -- Dokumen Bukti & Sinkronisasi Kementerian
        \`id_dtks_kemensos\` VARCHAR(50) NULL COMMENT 'ID DTKS jika sudah terdaftar di Kemensos',
        \`bukti_kementerian_url\` VARCHAR(255) NULL COMMENT 'Foto/PDF tangkapan layar Cek Bansos / DTSEN BPS',
        \`nomor_referensi_bukti\` VARCHAR(100) NULL,
        
        -- Alur Verifikasi Kelurahan
        \`status_verifikasi\` ENUM('DRAFT_USULAN', 'MENUNGGU_VERIFIKASI_KELURAHAN', 'VERIFIED_KELURAHAN', 'REJECTED') NOT NULL DEFAULT 'DRAFT_USULAN',
        \`catatan_verifikasi\` TEXT NULL,
        \`diajukan_oleh_user_id\` INT NULL,
        \`diajukan_oleh_role\` ENUM('warga', 'ketua_rt', 'ketua_rw') NOT NULL DEFAULT 'warga',
        \`diverifikasi_oleh_user_id\` INT NULL,
        \`tanggal_pengajuan\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`tanggal_verifikasi\` TIMESTAMP NULL DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX \`idx_desil_kk\` (\`no_kk\`),
        INDEX \`idx_desil_status\` (\`status_verifikasi\`),
        INDEX \`idx_desil_saat_ini\` (\`desil_saat_ini\`),
        CONSTRAINT \`fk_desil_kk\` FOREIGN KEY (\`no_kk\`) REFERENCES \`kartu_keluarga\` (\`no_kk\`) ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Modifikasi tabel bansos_pengajuan untuk kolom Penyaluran Lapangan (Proof of Disbursement)
    console.log('[2/3] Menambahkan kolom bukti penyaluran lapangan pada bansos_pengajuan...');
    
    // Periksa kolom foto_penyerahan_url
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bansos_pengajuan' AND COLUMN_NAME = 'foto_penyerahan_url'
    `);

    if (cols.length === 0) {
      await connection.query(`
        ALTER TABLE \`bansos_pengajuan\`
        ADD COLUMN \`foto_penyerahan_url\` VARCHAR(255) NULL AFTER \`catatan_verifikasi\`,
        ADD COLUMN \`koordinat_lat_lng\` VARCHAR(100) NULL AFTER \`foto_penyerahan_url\`,
        ADD COLUMN \`tanda_tangan_penerima_url\` LONGTEXT NULL AFTER \`koordinat_lat_lng\`,
        ADD COLUMN \`diserahkan_oleh_user_id\` INT NULL AFTER \`tanda_tangan_penerima_url\`,
        ADD COLUMN \`tanggal_penyerahan\` TIMESTAMP NULL DEFAULT NULL AFTER \`diserahkan_oleh_user_id\`,
        MODIFY COLUMN \`status\` ENUM('PENDING_RT', 'PENDING_RW', 'PENDING_KELURAHAN', 'APPROVED', 'DISBURSED', 'REJECTED') NOT NULL DEFAULT 'PENDING_RT';
      `);
      console.log('Kolom bukti penyaluran berhasil ditambahkan!');
    } else {
      console.log('Kolom penyaluran sudah ada pada tabel bansos_pengajuan.');
    }

    // 3. Seed data awal desil keluarga dari Kartu Keluarga yang ada
    console.log('[3/3] Inisialisasi data awal desil untuk KK yang terdaftar...');
    const [kkRows] = await connection.query(`SELECT no_kk FROM kartu_keluarga`);
    
    for (const kk of kkRows) {
      await connection.query(`
        INSERT IGNORE INTO \`desil_keluarga\` 
        (\`no_kk\`, \`desil_saat_ini\`, \`desil_usulan\`, \`daya_listrik\`, \`status_rumah\`, \`sumber_air\`, \`status_verifikasi\`)
        VALUES (?, 2, 2, '900 VA', 'Milik Sendiri', 'PDAM/Leding', 'VERIFIED_KELURAHAN')
      `, [kk.no_kk]);
    }

    console.log(`Berhasil inisialisasi desil untuk ${kkRows.length} Kartu Keluarga.`);
    console.log('=== MIGRASI SPRINT 6 SELESAI DENGAN SUKSES ===');
  } catch (error) {
    console.error('Migrasi Gagal:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { migrate };

