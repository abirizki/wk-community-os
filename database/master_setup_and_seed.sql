-- =======================================================================
-- BUMI WARGA - CLEAN PRODUCTION DATABASE RE-INITIALIZATION & SEED
-- Owner / Author: Jabar Pintar Digital
-- Target Database: MySQL 8.x (Hostinger: u466444476_bumiwarga)
-- Versi: 2.0-Enterprise (Multi-Tier RBAC, KK-Centric, Posyandu Lansia)
-- =======================================================================

SET NAMES utf8mb4;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------------------------
-- DROP TABLES IF EXIST (Hierarki Reverse Dependency)
-- -----------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifikasi`;
DROP TABLE IF EXISTS `dokumen_request`;
DROP TABLE IF EXISTS `posyandu_lansia_pemeriksaan`;
DROP TABLE IF EXISTS `posyandu_lansia`;
DROP TABLE IF EXISTS `posyandu`;
DROP TABLE IF EXISTS `pbb`;
DROP TABLE IF EXISTS `pengaduan`;
DROP TABLE IF EXISTS `warga`;
DROP TABLE IF EXISTS `kartu_keluarga`;
DROP TABLE IF EXISTS `users`;

-- -----------------------------------------------------------------------
-- 1. TABEL: users (Autentikasi & Akun Sistem Bertingkat)
-- -----------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'NIK warga, No KK, atau username petugas/admin',
  `password_hash` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `role` ENUM('superadmin', 'admin_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga') NOT NULL DEFAULT 'warga',
  `rt` VARCHAR(5) NULL COMMENT 'Scope RT (khusus ketua_rt / warga)',
  `rw` VARCHAR(5) NULL COMMENT 'Scope RW (khusus ketua_rw, admin_rw, kader, RT)',
  `created_by_user_id` INT NULL COMMENT 'ID user pimpinan pembuat akun',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_scope` (`rt`, `rw`),
  INDEX `idx_users_status` (`status`),
  CONSTRAINT `fk_users_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 2. TABEL: kartu_keluarga (Data Induk KK)
-- -----------------------------------------------------------------------
CREATE TABLE `kartu_keluarga` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_kk` VARCHAR(16) NOT NULL UNIQUE,
  `kepala_keluarga` VARCHAR(150) NOT NULL,
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) NOT NULL,
  `rw` VARCHAR(5) NOT NULL,
  `kelurahan` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
  `kecamatan` VARCHAR(100) NOT NULL DEFAULT 'Andir',
  `kota` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
  `provinsi` VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_kk_rt_rw` (`rt`, `rw`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 3. TABEL: warga (Data Kependudukan Lengkap)
-- -----------------------------------------------------------------------
CREATE TABLE `warga` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `nik` VARCHAR(16) NOT NULL UNIQUE,
  `no_kk` VARCHAR(16) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `tempat_lahir` VARCHAR(100) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `agama` ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya') NOT NULL DEFAULT 'Islam',
  `status_perkawinan` ENUM('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati') NOT NULL DEFAULT 'Belum Kawin',
  `status_hubungan_keluarga` ENUM('Kepala Keluarga', 'Suami', 'Istri', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Lainnya') NOT NULL DEFAULT 'Anak',
  `pekerjaan` VARCHAR(100) DEFAULT NULL,
  `pendidikan_terakhir` ENUM('Tidak/Belum Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3') DEFAULT 'SMA/SMK',
  `golongan_darah` ENUM('A', 'B', 'AB', 'O', 'Tidak Tahu') DEFAULT 'Tidak Tahu',
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) NOT NULL,
  `rw` VARCHAR(5) NOT NULL,
  `kelurahan` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
  `kecamatan` VARCHAR(100) NOT NULL DEFAULT 'Andir',
  `kota` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
  `provinsi` VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
  `kode_pos` VARCHAR(10) DEFAULT '40181',
  `no_telepon` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `status_kependudukan` ENUM('Tetap', 'Sementara', 'Pindah', 'Meninggal') NOT NULL DEFAULT 'Tetap',
  `foto_url` VARCHAR(255) DEFAULT NULL,
  `skor_kelengkapan` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Persentase kelengkapan profil 0-100%',
  `rincian_kelengkapan` JSON NULL COMMENT 'Cache rincian 4 pilar dan missing fields',
  `terakhir_dihitung_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_warga_nik` (`nik`),
  INDEX `idx_warga_kk` (`no_kk`),
  INDEX `idx_warga_rt_rw` (`rt`, `rw`),
  INDEX `idx_warga_skor` (`skor_kelengkapan`),
  CONSTRAINT `fk_warga_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_warga_kk` FOREIGN KEY (`no_kk`) REFERENCES `kartu_keluarga` (`no_kk`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 4. TABEL: pengaduan (Aspirasi & Laporan Fasilitas)
-- -----------------------------------------------------------------------
CREATE TABLE `pengaduan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_pelapor` VARCHAR(16) NOT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `kategori` ENUM('Infrastruktur', 'Kebersihan', 'Keamanan', 'Kesehatan', 'Sosial', 'Lingkungan', 'Lainnya') NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `catatan_admin` TEXT DEFAULT NULL,
  `foto_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pengaduan_pelapor` (`nik_pelapor`),
  INDEX `idx_pengaduan_status` (`status`),
  CONSTRAINT `fk_pengaduan_warga` FOREIGN KEY (`nik_pelapor`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 5. TABEL: pbb (Retribusi Pajak Bumi & Bangunan)
-- -----------------------------------------------------------------------
CREATE TABLE `pbb` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nop` VARCHAR(30) NOT NULL COMMENT 'Nomor Objek Pajak',
  `nik_warga` VARCHAR(16) NOT NULL,
  `tahun` INT NOT NULL,
  `njop` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `nominal` DECIMAL(12,2) NOT NULL,
  `denda` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status_pembayaran` ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
  `tanggal_jatuh_tempo` DATE NOT NULL,
  `tanggal_bayar` TIMESTAMP NULL DEFAULT NULL,
  `channel_pembayaran` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_nop_tahun` (`nop`, `tahun`),
  INDEX `idx_pbb_warga` (`nik_warga`),
  INDEX `idx_pbb_status` (`status_pembayaran`),
  CONSTRAINT `fk_pbb_warga` FOREIGN KEY (`nik_warga`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 6. TABEL: posyandu (Kesehatan Anak / Balita)
-- -----------------------------------------------------------------------
CREATE TABLE `posyandu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_warga` VARCHAR(16) NOT NULL COMMENT 'NIK Orang Tua/Pelapor',
  `nama_anak` VARCHAR(100) NOT NULL,
  `tanggal_lahir_anak` DATE NOT NULL,
  `jenis_kelamin_anak` ENUM('L', 'P') NOT NULL,
  `umur_bulan` INT NOT NULL,
  `berat_badan_kg` DECIMAL(5,2) NOT NULL,
  `tinggi_badan_cm` DECIMAL(5,2) NOT NULL,
  `lingkar_kepala_cm` DECIMAL(5,2) DEFAULT NULL,
  `status_gizi` ENUM('Gizi Buruk', 'Gizi Kurang', 'Normal', 'Risiko Lebih', 'Gizi Lebih', 'Obesitas') NOT NULL DEFAULT 'Normal',
  `imunisasi` VARCHAR(100) DEFAULT NULL,
  `tanggal_pemeriksaan` DATE NOT NULL,
  `petugas` VARCHAR(100) NOT NULL,
  `catatan_kesehatan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_posyandu_warga` (`nik_warga`),
  INDEX `idx_posyandu_tanggal` (`tanggal_pemeriksaan`),
  CONSTRAINT `fk_posyandu_warga` FOREIGN KEY (`nik_warga`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 7. TABEL: posyandu_lansia & posyandu_lansia_pemeriksaan (Integrasi Layanan Primer Lansia)
-- -----------------------------------------------------------------------
CREATE TABLE `posyandu_lansia` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik` VARCHAR(16) NOT NULL UNIQUE,
  `nama` VARCHAR(150) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) NOT NULL,
  `rw` VARCHAR(5) NOT NULL,
  `status_tinggal` ENUM('Bersama Keluarga', 'Sebatang Kara') NOT NULL DEFAULT 'Bersama Keluarga',
  `riwayat_penyakit` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_lansia_rt_rw` (`rt`, `rw`),
  CONSTRAINT `fk_lansia_warga` FOREIGN KEY (`nik`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `posyandu_lansia_pemeriksaan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `posyandu_lansia_id` INT NOT NULL,
  `tanggal_pemeriksaan` DATE NOT NULL,
  `tensi_sistolik` INT NOT NULL COMMENT 'mmHg',
  `tensi_diastolik` INT NOT NULL COMMENT 'mmHg',
  `gula_darah_sewaktu` INT NULL COMMENT 'mg/dL',
  `kolesterol` INT NULL COMMENT 'mg/dL',
  `asam_urat` DECIMAL(4,1) NULL COMMENT 'mg/dL',
  `berat_badan_kg` DECIMAL(5,2) NOT NULL,
  `tinggi_badan_cm` DECIMAL(5,2) NOT NULL,
  `imt` DECIMAL(4,1) NULL COMMENT 'Indeks Massa Tubuh',
  `skor_kemandirian_adl` ENUM('Mandiri', 'Ketergantungan Ringan', 'Ketergantungan Sedang', 'Ketergantungan Berat') NOT NULL DEFAULT 'Mandiri',
  `keluhan` TEXT NULL,
  `tindakan_petugas` TEXT NULL,
  `petugas` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pemeriksaan_lansia_id` (`posyandu_lansia_id`),
  INDEX `idx_pemeriksaan_lansia_tgl` (`tanggal_pemeriksaan`),
  CONSTRAINT `fk_lansia_pemeriksaan` FOREIGN KEY (`posyandu_lansia_id`) REFERENCES `posyandu_lansia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 8. TABEL: dokumen_request (Pelayanan Surat Kelurahan)
-- -----------------------------------------------------------------------
CREATE TABLE `dokumen_request` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nomor_registrasi` VARCHAR(50) NOT NULL UNIQUE,
  `nik_pemohon` VARCHAR(16) NOT NULL,
  `jenis_surat` VARCHAR(100) NOT NULL,
  `keperluan` TEXT NOT NULL,
  `status` ENUM('SUBMITTED', 'VERIFYING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
  `approval_step` ENUM('RT', 'RW', 'KELURAHAN', 'COMPLETED') NOT NULL DEFAULT 'RT',
  `catatan_petugas` TEXT NULL,
  `approved_by_rt` INT NULL,
  `approved_by_rw` INT NULL,
  `approved_by_kelurahan` INT NULL,
  `trigger_executed` TINYINT(1) NOT NULL DEFAULT 0,
  `is_auto_filled_by_ai` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'True jika permohonan surat diisi via AI auto-fill',
  `file_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dokumen_pemohon` (`nik_pemohon`),
  INDEX `idx_dokumen_status` (`status`),
  CONSTRAINT `fk_dokumen_warga` FOREIGN KEY (`nik_pemohon`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9. TABEL: notifikasi (Sistem Pemberitahuan Warga)
-- -----------------------------------------------------------------------
CREATE TABLE `notifikasi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_target` VARCHAR(16) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `pesan` TEXT NOT NULL,
  `tipe` ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `link` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifikasi_target` (`nik_target`),
  INDEX `idx_notifikasi_read` (`is_read`),
  CONSTRAINT `fk_notifikasi_warga` FOREIGN KEY (`nik_target`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9b. TABEL: bansos_pengajuan (Bantuan Sosial Berjenjang RT -> RW -> Kelurahan)
-- -----------------------------------------------------------------------
CREATE TABLE `bansos_pengajuan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nomor_pengajuan` VARCHAR(50) NOT NULL UNIQUE,
  `no_kk` VARCHAR(16) NOT NULL,
  `nik_penerima` VARCHAR(16) NOT NULL,
  `nama_penerima` VARCHAR(150) NOT NULL,
  `jenis_bansos` ENUM('PKH', 'BPNT', 'BLT BBM', 'Bantuan Lansia', 'Bantuan Balita Stunting', 'SKTM') NOT NULL,
  `alasan_pengajuan` TEXT NOT NULL,
  `nominal_bantuan` DECIMAL(12,2) NULL DEFAULT 0.00,
  `status` ENUM('PENDING_RT', 'PENDING_RW', 'PENDING_KELURAHAN', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_RT',
  `status` ENUM('PENDING_RT', 'PENDING_RW', 'PENDING_KELURAHAN', 'APPROVED', 'DISBURSED', 'REJECTED') NOT NULL DEFAULT 'PENDING_RT',
  `approval_step` ENUM('RT', 'RW', 'KELURAHAN', 'COMPLETED') NOT NULL DEFAULT 'RT',
  `rt` VARCHAR(5) NOT NULL,
  `rw` VARCHAR(5) NOT NULL,
  `diajukan_oleh_user_id` INT NULL,
  `diverifikasi_oleh_user_id` INT NULL,
  `disahkan_oleh_user_id` INT NULL,
  `catatan_verifikasi` TEXT NULL,
  `foto_penyerahan_url` VARCHAR(255) NULL,
  `koordinat_lat_lng` VARCHAR(100) NULL,
  `tanda_tangan_penerima_url` LONGTEXT NULL,
  `diserahkan_oleh_user_id` INT NULL,
  `tanggal_penyerahan` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bansos_kk` (`no_kk`),
  INDEX `idx_bansos_nik` (`nik_penerima`),
  INDEX `idx_bansos_rt_rw` (`rt`, `rw`),
  INDEX `idx_bansos_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9c. TABEL: desil_keluarga (Data Tunggal Sosial dan Ekonomi Nasional / DTSEN)
-- -----------------------------------------------------------------------
CREATE TABLE `desil_keluarga` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_kk` VARCHAR(16) NOT NULL UNIQUE,
  `desil_saat_ini` TINYINT NULL COMMENT '1 s/d 10 (Resmi disahkan kelurahan)',
  `desil_usulan` TINYINT NOT NULL DEFAULT 4 COMMENT '1 s/d 10 (Kalkulasi kuesioner PMT)',
  `daya_listrik` ENUM('450 VA', '900 VA', '1300 VA', '> 1300 VA', 'Tanpa Meteran') NOT NULL DEFAULT '900 VA',
  `status_rumah` ENUM('Milik Sendiri', 'Sewa/Kontrak', 'Menumpang', 'Bebas Sewa') NOT NULL DEFAULT 'Milik Sendiri',
  `sumber_air` ENUM('PDAM/Leding', 'Sumur Terlindung', 'Sumur Tidak Terlindung', 'Air Kemasan/Isi Ulang') NOT NULL DEFAULT 'PDAM/Leding',
  `luas_lantai_kategori` ENUM('< 8 m2 (Padat)', '8 - 14 m2', '> 14 m2') NOT NULL DEFAULT '8 - 14 m2',
  `bahan_bakar_memasak` ENUM('Gas 3kg', 'Gas > 3kg', 'Minyak/Kayu', 'Listrik') NOT NULL DEFAULT 'Gas 3kg',
  `kepemilikan_motor` ENUM('0 unit', '1 unit', '>= 2 unit') NOT NULL DEFAULT '1 unit',
  `kepemilikan_mobil` TINYINT(1) NOT NULL DEFAULT 0,
  `ada_disabilitas_lansia_tunggal` TINYINT(1) NOT NULL DEFAULT 0,
  `ada_anak_sekolah_pip` TINYINT(1) NOT NULL DEFAULT 0,
  `id_dtks_kemensos` VARCHAR(50) NULL,
  `bukti_kementerian_url` VARCHAR(255) NULL,
  `nomor_referensi_bukti` VARCHAR(100) NULL,
  `status_verifikasi` ENUM('DRAFT_USULAN', 'MENUNGGU_VERIFIKASI_KELURAHAN', 'VERIFIED_KELURAHAN', 'REJECTED') NOT NULL DEFAULT 'DRAFT_USULAN',
  `catatan_verifikasi` TEXT NULL,
  `diajukan_oleh_user_id` INT NULL,
  `diajukan_oleh_role` ENUM('warga', 'ketua_rt', 'ketua_rw') NOT NULL DEFAULT 'warga',
  `diverifikasi_oleh_user_id` INT NULL,
  `tanggal_pengajuan` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `tanggal_verifikasi` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_desil_kk` (`no_kk`),
  INDEX `idx_desil_status` (`status_verifikasi`),
  INDEX `idx_desil_saat_ini` (`desil_saat_ini`),
  CONSTRAINT `fk_desil_kk` FOREIGN KEY (`no_kk`) REFERENCES `kartu_keluarga` (`no_kk`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 10. TABEL: audit_logs (Enterprise Audit Trail & Compliance)
-- -----------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `username` VARCHAR(50) NULL,
  `action` VARCHAR(100) NOT NULL COMMENT 'LOGIN, CREATE_ADUAN, BAYAR_PBB, APPROVE_DOC, etc.',
  `entity_name` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(50) NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- SEED DATA (DML) - Multi-Tier RBAC & Akun Lengkap
-- =======================================================================

SET @default_hash = '$2a$10$xJwGe3Q5KZrQEQFKYFzpJOkD7kPwVmGnDpkQ3.WTtVQJ4KJQH3rAC';

-- SEED 1: users (Multi-Tier Hierarchical Roles)
INSERT INTO `users` (`id`, `username`, `password_hash`, `nama`, `role`, `rt`, `rw`, `created_by_user_id`, `status`) VALUES
  (1, 'superadmin', @default_hash, 'Super Admin Jabar Pintar', 'superadmin', NULL, NULL, NULL, 'active'),
  (2, 'admin', @default_hash, 'Admin Kelurahan Kebonjati', 'admin_kelurahan', NULL, NULL, 1, 'active'),
  (3, 'rw001', @default_hash, 'Ketua RW 001 Kebonjati', 'ketua_rw', NULL, '001', 2, 'active'),
  (4, 'rt001rw001', @default_hash, 'Ketua RT 001 RW 001', 'ketua_rt', '001', '001', 3, 'active'),
  (5, 'kader_melati', @default_hash, 'Bdn. Imas Rohayati', 'kader_posyandu', NULL, '001', 2, 'active'),
  (6, '3273010203850003', @default_hash, 'Budi Santoso', 'warga', '001', '001', 4, 'active'),
  (7, '3273014504900004', @default_hash, 'Siti Rahayu', 'warga', '002', '001', 4, 'active'),
  (8, '3273021505850005', @default_hash, 'Ahmad Fauzi', 'warga', '001', '002', 3, 'active'),
  (9, '3273010101900001', @default_hash, 'Keluarga Budi Santoso', 'warga', '001', '001', 4, 'active')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `role` = VALUES(`role`), `rt` = VALUES(`rt`), `rw` = VALUES(`rw`);

-- SEED 2: kartu_keluarga
INSERT INTO `kartu_keluarga` (`id`, `no_kk`, `kepala_keluarga`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`) VALUES
  (1, '3273010101900001', 'Budi Santoso', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat'),
  (2, '3273014504900002', 'Siti Rahayu', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat'),
  (3, '3273021505850003', 'Ahmad Fauzi', 'Jl. Kebonjati No. 88', '001', '002', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat')
ON DUPLICATE KEY UPDATE `kepala_keluarga` = VALUES(`kepala_keluarga`), `alamat` = VALUES(`alamat`);

-- SEED 3: warga (Termasuk Lansia & Relasi Keluarga)
INSERT INTO `warga` (`id`, `user_id`, `nik`, `no_kk`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `status_perkawinan`, `status_hubungan_keluarga`, `pekerjaan`, `pendidikan_terakhir`, `golongan_darah`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`, `kode_pos`, `no_telepon`, `email`, `status_kependudukan`) VALUES
  (1, 6, '3273010203850003', '3273010101900001', 'Budi Santoso', 'L', 'Bandung', '1985-03-02', 'Islam', 'Kawin', 'Kepala Keluarga', 'Karyawan Swasta', 'S1', 'O', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081234567890', 'budi.santoso@gmail.com', 'Tetap'),
  (2, 7, '3273014504900004', '3273014504900002', 'Siti Rahayu', 'P', 'Bandung', '1990-04-05', 'Islam', 'Kawin', 'Kepala Keluarga', 'Ibu Rumah Tangga', 'SMA/SMK', 'A', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '082345678901', 'siti.rahayu@gmail.com', 'Tetap'),
  (3, 8, '3273021505850005', '3273021505850003', 'Ahmad Fauzi', 'L', 'Sumedang', '1985-05-15', 'Islam', 'Belum Kawin', 'Kepala Keluarga', 'Wiraswasta', 'S1', 'B', 'Jl. Kebonjati No. 88', '001', '002', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '083456789012', 'ahmad.fauzi@gmail.com', 'Tetap'),
  (4, NULL, '3273010203900010', '3273010101900001', 'Dewi Santoso', 'P', 'Bandung', '1990-03-10', 'Islam', 'Kawin', 'Istri', 'Guru Honorer', 'S1', 'AB', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081298765432', 'dewi.santoso@gmail.com', 'Tetap'),
  (5, NULL, '3273014504921011', '3273014504900002', 'Rizki Rahayu', 'L', 'Bandung', '2021-09-21', 'Islam', 'Belum Kawin', 'Anak', NULL, 'Tidak/Belum Sekolah', 'Tidak Tahu', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', NULL, NULL, 'Tetap'),
  (6, NULL, '3273011005500012', '3273010101900001', 'H. Soleh Santoso', 'L', 'Bandung', '1950-05-10', 'Islam', 'Cerai Mati', 'Orang Tua', 'Pensiunan', 'SMA/SMK', 'O', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081234567899', NULL, 'Tetap'),
  (7, NULL, '3273011208530015', '3273014504900002', 'Hj. Aminah', 'P', 'Bandung', '1953-08-12', 'Islam', 'Cerai Mati', 'Orang Tua', 'Tidak Bekerja', 'SMP', 'B', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', NULL, NULL, 'Tetap')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `status_hubungan_keluarga` = VALUES(`status_hubungan_keluarga`);

-- SEED 4: posyandu_lansia & pemeriksaan
INSERT INTO `posyandu_lansia` (`id`, `nik`, `nama`, `tanggal_lahir`, `jenis_kelamin`, `alamat`, `rt`, `rw`, `status_tinggal`, `riwayat_penyakit`) VALUES
  (1, '3273011005500012', 'H. Soleh Santoso', '1950-05-10', 'L', 'Jl. Kebonjati No. 12', '001', '001', 'Bersama Keluarga', 'Hipertensi Ringan'),
  (2, '3273011208530015', 'Hj. Aminah', '1953-08-12', 'P', 'Jl. Garuda No. 45', '002', '001', 'Bersama Keluarga', 'Diabetes Melitus Tipe 2')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `riwayat_penyakit` = VALUES(`riwayat_penyakit`);

INSERT INTO `posyandu_lansia_pemeriksaan` (`id`, `posyandu_lansia_id`, `tanggal_pemeriksaan`, `tensi_sistolik`, `tensi_diastolik`, `gula_darah_sewaktu`, `kolesterol`, `asam_urat`, `berat_badan_kg`, `tinggi_badan_cm`, `imt`, `skor_kemandirian_adl`, `keluhan`, `tindakan_petugas`, `petugas`) VALUES
  (1, 1, '2026-08-10', 135, 85, 140, 195, 6.2, 65.0, 165.0, 23.9, 'Mandiri', 'Pusing sesekali saat bangun tidur', 'Edukasi kurangi konsumsi garam berlebih, kontrol tensi rutin', 'Bdn. Imas Rohayati'),
  (2, 2, '2026-08-10', 145, 90, 210, 220, 5.8, 58.0, 152.0, 25.1, 'Ketergantungan Ringan', 'Kaki sering kesemutan dan cepat lelah', 'Rujuk ke Puskesmas Andir untuk evaluasi obat diabetes', 'Bdn. Imas Rohayati')
ON DUPLICATE KEY UPDATE `tensi_sistolik` = VALUES(`tensi_sistolik`), `gula_darah_sewaktu` = VALUES(`gula_darah_sewaktu`);

-- SEED 5: pengaduan
INSERT INTO `pengaduan` (`id`, `nik_pelapor`, `judul`, `deskripsi`, `kategori`, `status`, `catatan_admin`) VALUES
  (1, '3273010203850003', 'Lampu penerangan jalan RT 001 mati', 'Lampu jalan utama di depan gang RT 001/RW 001 Jl. Kebonjati padam sejak 3 hari lalu. Suasana malam sangat gelap dan rawan kecelakaan.', 'Infrastruktur', 'PENDING', NULL),
  (2, '3273014504900004', 'Saluran drainase tersumbat tumpukan sampah', 'Saluran drainase di perbatasan RT 002 dan RT 001 tersumbat sampah ranting pohon, menyebabkan luapan air saat hujan deras kemarin sore.', 'Lingkungan', 'PROCESSING', 'Laporan diteruskan ke tim kebersihan RW 001 untuk kerja bakti pekan ini.'),
  (3, '3273021505850005', 'Jalan berlubang cukup dalam di dekat gapura', 'Ada 2 lubang jalan berdiameter sekitar 40cm dengan kedalaman 10cm di dekat gapura masuk RW 002. Sangat membahayakan pengendara motor roda dua.', 'Infrastruktur', 'RESOLVED', 'Sudah ditambal aspal dingin sementara oleh satgas kelurahan pada 05 September 2025.')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`), `status` = VALUES(`status`), `catatan_admin` = VALUES(`catatan_admin`);

-- SEED 6: pbb
INSERT INTO `pbb` (`id`, `nop`, `nik_warga`, `tahun`, `njop`, `nominal`, `denda`, `status_pembayaran`, `tanggal_jatuh_tempo`, `tanggal_bayar`, `channel_pembayaran`) VALUES
  (1, '32.73.010.001.001-0001.0', '3273010203850003', 2025, 350000000.00, 525000.00, 0.00, 'PAID', '2025-08-31', '2025-07-15', 'QRIS Mandiri'),
  (2, '32.73.010.001.001-0001.0', '3273010203850003', 2026, 365000000.00, 547500.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL),
  (3, '32.73.010.002.001-0002.0', '3273014504900004', 2025, 280000000.00, 420000.00, 0.00, 'PAID', '2025-08-31', '2025-08-01', 'VA BJB'),
  (4, '32.73.010.002.001-0002.0', '3273014504900004', 2026, 295000000.00, 442500.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL),
  (5, '32.73.010.001.002-0003.0', '3273021505850005', 2026, 420000000.00, 630000.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL)
ON DUPLICATE KEY UPDATE `nominal` = VALUES(`nominal`), `status_pembayaran` = VALUES(`status_pembayaran`);

-- SEED 7: posyandu (Balita)
INSERT INTO `posyandu` (`id`, `nik_warga`, `nama_anak`, `tanggal_lahir_anak`, `jenis_kelamin_anak`, `umur_bulan`, `berat_badan_kg`, `tinggi_badan_cm`, `lingkar_kepala_cm`, `status_gizi`, `imunisasi`, `tanggal_pemeriksaan`, `petugas`, `catatan_kesehatan`) VALUES
  (1, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 46, 14.20, 97.50, 49.00, 'Normal', 'DPT Booster', '2025-07-10', 'Bdn. Imas Rohayati', 'Tumbuh kembang baik, aktif dan nafsu makan normal.'),
  (2, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 47, 14.50, 98.50, 49.20, 'Normal', NULL, '2025-08-12', 'Bdn. Imas Rohayati', 'Kenaikan berat badan 300 gram. Berikan variasi protein hewani.'),
  (3, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 48, 14.80, 99.00, 49.50, 'Normal', 'Vitamin A Merah', '2025-09-09', 'Bdn. Imas Rohayati', 'Pemberian kapsul vitamin A merah berhasil. Kondisi fisik sehat.')
ON DUPLICATE KEY UPDATE `berat_badan_kg` = VALUES(`berat_badan_kg`), `tinggi_badan_cm` = VALUES(`tinggi_badan_cm`);

-- SEED 8: notifikasi
INSERT INTO `notifikasi` (`id`, `nik_target`, `judul`, `pesan`, `tipe`, `is_read`, `link`) VALUES
  (1, '3273010203850003', 'Tagihan PBB 2026 Tersedia', 'Tagihan PBB-P2 tahun pajak 2026 untuk NOP 32.73.010.001.001-0001.0 telah terbit. Silakan lakukan pembayaran sebelum 31 Agustus 2026.', 'warning', 0, '/dashboard/pbb'),
  (2, '3273014504900004', 'Jadwal Posyandu Balita Bulan Depan', 'Pemeriksaan Posyandu Melati RW 001 akan dilaksanakan pada tanggal 12 Oktober 2026 di Balai Warga.', 'info', 0, '/dashboard/posyandu')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`), `pesan` = VALUES(`pesan`);

-- SEED 9: bansos_pengajuan
INSERT INTO `bansos_pengajuan` (`id`, `nomor_pengajuan`, `no_kk`, `nik_penerima`, `nama_penerima`, `jenis_bansos`, `alasan_pengajuan`, `nominal_bantuan`, `status`, `approval_step`, `rt`, `rw`, `catatan_verifikasi`) VALUES
  (1, 'BS-2026-001', '3273010101900001', '3273011005500012', 'H. Soleh Santoso', 'Bantuan Lansia', 'Warga lansia berumur 76 tahun dengan riwayat hipertensi memerlukan asupan nutrisi tambahan dan obat berkala.', 600000.00, 'APPROVED', 'COMPLETED', '001', '001', 'Disetujui berdasarkan data posyandu lansia dan kondisi ekonomi keluarga.'),
  (2, 'BS-2026-002', '3273014504900002', '3273014504900004', 'Siti Rahayu', 'Bantuan Balita Stunting', 'Pengajuan PMT (Pemberian Makanan Tambahan) pemulihan gizi protein hewani untuk balita.', 450000.00, 'PENDING_RW', 'RW', '002', '001', 'Diusulkan oleh Ketua RT 002.')
ON DUPLICATE KEY UPDATE `nama_penerima` = VALUES(`nama_penerima`);

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE = @OLD_SQL_MODE;
