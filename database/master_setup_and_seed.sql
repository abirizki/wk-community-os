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
DROP TABLE IF EXISTS `partner_webhook_logs`;
DROP TABLE IF EXISTS `partner_api_keys`;
DROP TABLE IF EXISTS `dukcapil_verifikasi_log`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifikasi`;
DROP TABLE IF EXISTS `dokumen_request`;
DROP TABLE IF EXISTS `posyandu_lansia_pemeriksaan`;
DROP TABLE IF EXISTS `posyandu_lansia`;
DROP TABLE IF EXISTS `posyandu`;
DROP TABLE IF EXISTS `pbb`;
DROP TABLE IF EXISTS `pengaduan`;
DROP TABLE IF EXISTS `entitas_usaha`;
DROP TABLE IF EXISTS `fasilitas_kesehatan`;
DROP TABLE IF EXISTS `fasilitas_pendidikan`;
DROP TABLE IF EXISTS `warga`;
DROP TABLE IF EXISTS `kartu_keluarga`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `wilayah_kelurahan`;
DROP TABLE IF EXISTS `wilayah_kecamatan`;

-- -----------------------------------------------------------------------
-- 0a. TABEL: wilayah_kecamatan (Master 7 Kecamatan Kota Sukabumi)
-- -----------------------------------------------------------------------
CREATE TABLE `wilayah_kecamatan` (
  `kode_kecamatan` VARCHAR(10) PRIMARY KEY,
  `nama_kecamatan` VARCHAR(100) NOT NULL,
  `kode_kota` VARCHAR(10) NOT NULL DEFAULT '32.72',
  `nama_kota` VARCHAR(100) NOT NULL DEFAULT 'Kota Sukabumi',
  `provinsi` VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 0b. TABEL: wilayah_kelurahan (Master 33 Kelurahan Kota Sukabumi)
-- -----------------------------------------------------------------------
CREATE TABLE `wilayah_kelurahan` (
  `kode_kelurahan` VARCHAR(15) PRIMARY KEY,
  `kode_kecamatan` VARCHAR(10) NOT NULL,
  `nama_kelurahan` VARCHAR(100) NOT NULL,
  `jumlah_rw` INT NOT NULL DEFAULT 10,
  `jumlah_rt` INT NOT NULL DEFAULT 40,
  `luas_wilayah_km2` DECIMAL(5,2) NULL,
  `koordinat_lat_lng` VARCHAR(100) NULL,
  `nama_lurah` VARCHAR(150) NULL,
  `kontak_kelurahan` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_kel_kecamatan` (`kode_kecamatan`),
  CONSTRAINT `fk_kelurahan_kecamatan` FOREIGN KEY (`kode_kecamatan`) REFERENCES `wilayah_kecamatan` (`kode_kecamatan`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 1. TABEL: users (Autentikasi & Akun Sistem Bertingkat Multi-Tenant)
-- -----------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'NIK warga, No KK, atau username petugas/admin',
  `password_hash` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `role` ENUM('superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga') NOT NULL DEFAULT 'warga',
  `kode_kecamatan` VARCHAR(10) NOT NULL DEFAULT '32.72.03',
  `kode_kelurahan` VARCHAR(15) NOT NULL DEFAULT '32.72.03.1004',
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
  `jenis_sanitasi` ENUM('Jamban Pribadi Leher Angsa', 'Jamban Komunal', 'Jamban Cemplung/Plengsengan', 'Tanpa Jamban/BAB Terbuka') NOT NULL DEFAULT 'Jamban Pribadi Leher Angsa',
  `pembuangan_limbah` ENUM('Septic Tank Standar', 'Resapan/Selokan Terbuka', 'Sungai/Kolam') NOT NULL DEFAULT 'Septic Tank Standar',
  `akses_pengangkutan_sampah` ENUM('Rutin 2-3x Seminggu', 'Tidak Teratur', 'Bakar/Buang Mandiri') NOT NULL DEFAULT 'Rutin 2-3x Seminggu',
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
-- 9d. TABEL: fasilitas_pendidikan (Daya Tampung Kursi PPDB & Sekolah)
-- -----------------------------------------------------------------------
CREATE TABLE `fasilitas_pendidikan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_sekolah` VARCHAR(150) NOT NULL,
  `npsn` VARCHAR(20) NULL UNIQUE,
  `jenjang` ENUM('PAUD', 'SD', 'SMP', 'SMA', 'SMK', 'SLB', 'PKBM') NOT NULL,
  `status_sekolah` ENUM('Negeri', 'Swasta') NOT NULL DEFAULT 'Negeri',
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) NOT NULL DEFAULT '001',
  `rw` VARCHAR(5) NOT NULL DEFAULT '001',
  `kelurahan` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
  `kecamatan` VARCHAR(100) NOT NULL DEFAULT 'Andir',
  `kota` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
  `koordinat_lat_lng` VARCHAR(100) NULL,
  `daya_tampung_kursi_baru` INT NOT NULL DEFAULT 0 COMMENT 'Kapasitas penerimaan murid baru zonasi',
  `total_kapasitas_murid` INT NOT NULL DEFAULT 0,
  `jumlah_rombel` INT NOT NULL DEFAULT 1,
  `akreditasi` ENUM('A', 'B', 'C', 'Belum Terakreditasi') NOT NULL DEFAULT 'B',
  `no_telepon` VARCHAR(25) NULL,
  `kepala_sekolah` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sekolah_jenjang` (`jenjang`),
  INDEX `idx_sekolah_rt_rw` (`rt`, `rw`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9e. TABEL: fasilitas_kesehatan (Daya Dukung Medis & Faskes Kelurahan)
-- -----------------------------------------------------------------------
CREATE TABLE `fasilitas_kesehatan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_faskes` VARCHAR(150) NOT NULL,
  `jenis_faskes` ENUM('Puskesmas', 'Pustu', 'Klinik Pratama', 'Posyandu', 'Apotek', 'Praktik Mandiri') NOT NULL,
  `kategori_pengelola` ENUM('Pemerintah', 'Swasta', 'Masyarakat') NOT NULL DEFAULT 'Pemerintah',
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) NOT NULL DEFAULT '001',
  `rw` VARCHAR(5) NOT NULL DEFAULT '001',
  `kelurahan` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
  `kecamatan` VARCHAR(100) NOT NULL DEFAULT 'Andir',
  `kota` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
  `koordinat_lat_lng` VARCHAR(100) NULL,
  `jumlah_dokter` INT NOT NULL DEFAULT 0,
  `jumlah_bidan` INT NOT NULL DEFAULT 0,
  `jumlah_perawat` INT NOT NULL DEFAULT 0,
  `jumlah_ahli_gizi` INT NOT NULL DEFAULT 0,
  `kapasitas_tempat_tidur` INT NOT NULL DEFAULT 0,
  `layanan_igd_24jam` TINYINT(1) NOT NULL DEFAULT 0,
  `jam_operasional` VARCHAR(100) NOT NULL DEFAULT '08:00 - 16:00 WIB',
  `no_kontak` VARCHAR(25) NULL,
  `penanggung_jawab` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_faskes_jenis` (`jenis_faskes`),
  INDEX `idx_faskes_rt_rw` (`rt`, `rw`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9f. TABEL: entitas_usaha (UMKM & Sentra Ekonomi Warga - Terhubung SKU)
-- -----------------------------------------------------------------------
CREATE TABLE `entitas_usaha` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_usaha` VARCHAR(150) NOT NULL,
  `nik_pemilik` VARCHAR(16) NOT NULL,
  `nama_pemilik` VARCHAR(150) NOT NULL,
  `kategori_usaha` ENUM('Kuliner & Warung', 'Toko Sembako / Kelontong', 'Jasa & Servis', 'Fashion & Tekstil', 'Kerajinan & Industri Kreatif', 'Pertanian & Peternakan Perkotaan', 'Lainnya') NOT NULL DEFAULT 'Kuliner & Warung',
  `skala_usaha` ENUM('Mikro', 'Kecil', 'Menengah', 'Swasta Nasional') NOT NULL DEFAULT 'Mikro',
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) NOT NULL DEFAULT '001',
  `rw` VARCHAR(5) NOT NULL DEFAULT '001',
  `kelurahan` VARCHAR(100) NOT NULL DEFAULT 'Kebonjati',
  `kecamatan` VARCHAR(100) NOT NULL DEFAULT 'Andir',
  `kota` VARCHAR(100) NOT NULL DEFAULT 'Bandung',
  `koordinat_lat_lng` VARCHAR(100) NULL,
  `jumlah_tenaga_kerja_lokal` INT NOT NULL DEFAULT 1,
  `omset_bulanan_kategori` ENUM('< 5 Juta', '5 - 15 Juta', '15 - 50 Juta', '> 50 Juta') NOT NULL DEFAULT '< 5 Juta',
  `apakah_toko_pangan_murah` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Mitra penyedia sembako terjangkau Desil 1-2',
  `sku_nomor_registrasi` VARCHAR(50) NULL COMMENT 'Nomor permohonan surat SKU jika terverifikasi',
  `status_verifikasi` ENUM('TERVERIFIKASI', 'MENUNGGU_VERIFIKASI', 'NONAKTIF') NOT NULL DEFAULT 'TERVERIFIKASI',
  `no_telepon` VARCHAR(25) NULL,
  `deskripsi_produk` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_usaha_nik` (`nik_pemilik`),
  INDEX `idx_usaha_kategori` (`kategori_usaha`),
  INDEX `idx_usaha_rt_rw` (`rt`, `rw`),
  INDEX `idx_usaha_pangan` (`apakah_toko_pangan_murah`),
  INDEX `idx_usaha_sku` (`sku_nomor_registrasi`)
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

-- -----------------------------------------------------------------------
-- 12. TABEL: dukcapil_verifikasi_log (Audit UU PDP No. 27/2022 - Zero Data Hoarding)
-- -----------------------------------------------------------------------
CREATE TABLE `dukcapil_verifikasi_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_diminta` VARCHAR(16) NOT NULL,
  `nama_diminta` VARCHAR(150) NULL,
  `jenis_verifikasi` ENUM('NIK_MATCHING', 'BIOMETRIC_FACE', 'STATUS_KEMATIAN') NOT NULL,
  `is_matched` TINYINT(1) NOT NULL,
  `similarity_score` DECIMAL(5,2) NULL COMMENT 'Persentase kemiripan wajah 0-100%',
  `keterangan` VARCHAR(255) NULL,
  `requestor_user_id` INT NULL,
  `ip_address` VARCHAR(45) NULL,
  `integrity_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash log untuk anti-tampering UU PDP',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_dukcapil_nik` (`nik_diminta`),
  INDEX `idx_dukcapil_tgl` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 13. TABEL: partner_api_keys (Gateway Kredensial Sapawarga & Satu Data Jabar)
-- -----------------------------------------------------------------------
CREATE TABLE `partner_api_keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partner_name` VARCHAR(100) NOT NULL UNIQUE,
  `api_key` VARCHAR(64) NOT NULL UNIQUE,
  `api_secret_hash` VARCHAR(255) NOT NULL,
  `scopes` JSON NOT NULL COMMENT 'Daftar endpoint diizinkan: read:surat, read:bansos, push:satudata',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_partner_key` (`api_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 14. TABEL: partner_webhook_logs (Audit Pengiriman Event ke Server Mitra)
-- -----------------------------------------------------------------------
CREATE TABLE `partner_webhook_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partner_name` VARCHAR(100) NOT NULL,
  `event_type` ENUM('SURAT_APPROVED', 'SURAT_REJECTED', 'BANSOS_DISBURSED', 'DESIL_UPDATED') NOT NULL,
  `target_url` VARCHAR(255) NOT NULL,
  `payload` JSON NOT NULL,
  `response_code` INT NULL,
  `status` ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SUCCESS',
  `retry_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_webhook_event` (`event_type`),
  INDEX `idx_webhook_partner` (`partner_name`)
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

-- SEED 10: fasilitas_pendidikan
INSERT INTO `fasilitas_pendidikan` (`id`, `nama_sekolah`, `npsn`, `jenjang`, `status_sekolah`, `alamat`, `rt`, `rw`, `daya_tampung_kursi_baru`, `total_kapasitas_murid`, `jumlah_rombel`, `akreditasi`, `no_telepon`) VALUES
  (1, 'PAUD & TK Al-Ikhlas Kebonjati', '69910001', 'PAUD', 'Swasta', 'Jl. Kebonjati No. 45', '001', '001', 35, 70, 2, 'A', '022-4200101'),
  (2, 'SD Negeri 035 Kebonjati', '20219801', 'SD', 'Negeri', 'Jl. Kebonjati No. 112', '002', '001', 96, 384, 12, 'A', '022-4200102'),
  (3, 'SMP Swasta Budi Luhur Andir', '20219802', 'SMP', 'Swasta', 'Jl. Kebon Jati Barat No. 8', '001', '002', 72, 216, 6, 'B', '022-4200103'),
  (4, 'SMA Negeri 6 Bandung (Zonasi Andir/Kebonjati)', '20219803', 'SMA', 'Negeri', 'Jl. Pasirkaliki No. 102', '003', '002', 120, 720, 20, 'A', '022-4200104'),
  (5, 'SMK Swasta Mandiri Andir', '20219804', 'SMK', 'Swasta', 'Jl. Gardujati No. 55', '002', '003', 60, 180, 6, 'B', '022-4200105')
ON DUPLICATE KEY UPDATE `nama_sekolah` = VALUES(`nama_sekolah`), `daya_tampung_kursi_baru` = VALUES(`daya_tampung_kursi_baru`);

-- SEED 11: fasilitas_kesehatan
INSERT INTO `fasilitas_kesehatan` (`id`, `nama_faskes`, `jenis_faskes`, `kategori_pengelola`, `alamat`, `rt`, `rw`, `jumlah_dokter`, `jumlah_bidan`, `jumlah_perawat`, `jumlah_ahli_gizi`, `kapasitas_tempat_tidur`, `layanan_igd_24jam`, `jam_operasional`, `no_kontak`, `penanggung_jawab`) VALUES
  (1, 'Puskesmas Pembantu (Pustu) Kebonjati', 'Pustu', 'Pemerintah', 'Jl. Kebonjati No. 78', '001', '001', 2, 3, 4, 1, 4, 0, '08:00 - 15:30 WIB', '022-4209901', 'dr. Siti Rahmawati'),
  (2, 'Klinik Pratama Sehat Andir', 'Klinik Pratama', 'Swasta', 'Jl. Gardujati No. 20', '002', '002', 3, 2, 3, 0, 6, 1, '24 Jam Penuh', '022-4209902', 'dr. Budi Hartono'),
  (3, 'Posyandu Balita Dahlia I', 'Posyandu', 'Masyarakat', 'Balai RW 001 Kebonjati', '001', '001', 0, 1, 1, 1, 0, 0, 'Jadwal Rutin Tgl 10 & 25', '0812-3456-7890', 'Bdn. Rina Marlina'),
  (4, 'Posyandu Balita & Lansia Melati II', 'Posyandu', 'Masyarakat', 'Balai RW 002 Kebonjati', '002', '002', 0, 1, 1, 1, 0, 0, 'Jadwal Rutin Tgl 12 & 28', '0813-8899-7766', 'Bdn. Lilis Suryani'),
  (5, 'Apotek Kimia Farma Kebonjati', 'Apotek', 'Swasta', 'Jl. Kebonjati No. 15', '003', '001', 0, 0, 2, 0, 0, 0, '07:00 - 22:00 WIB', '022-4208877', 'Apt. Hendra Gunawan, S.Farm')
ON DUPLICATE KEY UPDATE `nama_faskes` = VALUES(`nama_faskes`), `jumlah_dokter` = VALUES(`jumlah_dokter`);

-- SEED 12: entitas_usaha
INSERT INTO `entitas_usaha` (`id`, `nama_usaha`, `nik_pemilik`, `nama_pemilik`, `kategori_usaha`, `skala_usaha`, `alamat`, `rt`, `rw`, `jumlah_tenaga_kerja_lokal`, `omset_bulanan_kategori`, `apakah_toko_pangan_murah`, `sku_nomor_registrasi`, `status_verifikasi`, `deskripsi_produk`) VALUES
  (1, 'Warung Sembako Berkah Bu Siti', '3273010101900001', 'Siti Aminah', 'Toko Sembako / Kelontong', 'Mikro', 'Jl. Kebonjati RT 001/001', '001', '001', 2, '5 - 15 Juta', 1, 'SKU/2026/08/0001', 'TERVERIFIKASI', 'Sembako beras, minyak goreng, telur ayam, dan gas 3kg subsidi'),
  (2, 'Toko Kelontong Barokah Pak Tatang', '3273010101850002', 'Tatang Sutisna', 'Toko Sembako / Kelontong', 'Mikro', 'Jl. Kasmin No. 12 RT 002/002', '002', '002', 2, '5 - 15 Juta', 1, 'SKU/2026/08/0002', 'TERVERIFIKASI', 'Penyedia sembako murah terdaftar penyaluran bansos lokal'),
  (3, 'Konveksi Kaos Kebonjati Creative', '3273010101780003', 'Ahmad Hidayat', 'Fashion & Tekstil', 'Kecil', 'Gg. Simpang RT 003/002', '003', '002', 8, '15 - 50 Juta', 0, 'SKU/2026/07/0015', 'TERVERIFIKASI', 'Produksi kaos sablon, seragam kantor, dan kemeja bordir'),
  (4, 'Warung Nasi Khas Sunda Ibu Kokom', '3273010101920004', 'Kokom Komalasari', 'Kuliner & Warung', 'Mikro', 'Jl. Kebon Jati No. 60 RT 001/001', '001', '001', 3, '< 5 Juta', 0, 'SKU/2026/09/0003', 'TERVERIFIKASI', 'Nasi timbel komplit, ayam goreng serundeng, pepes ikan mas'),
  (5, 'Bengkel Motor Servis Jaya Abadi', '3273010101890005', 'Dedi Mulyadi', 'Jasa & Servis', 'Mikro', 'Jl. Gardujati RT 002/003', '002', '003', 2, '5 - 15 Juta', 0, 'SKU/2026/06/0008', 'TERVERIFIKASI', 'Servis rutin motor injeksi, tambal ban, ganti oli dan sparepart')
ON DUPLICATE KEY UPDATE `nama_usaha` = VALUES(`nama_usaha`), `jumlah_tenaga_kerja_lokal` = VALUES(`jumlah_tenaga_kerja_lokal`);

-- SEED 13: wilayah_kecamatan (7 Kecamatan Kota Sukabumi)
INSERT INTO `wilayah_kecamatan` (`kode_kecamatan`, `nama_kecamatan`) VALUES
  ('32.72.01', 'Gunungpuyuh'),
  ('32.72.02', 'Warudoyong'),
  ('32.72.03', 'Cikole'),
  ('32.72.04', 'Citamiang'),
  ('32.72.05', 'Baros'),
  ('32.72.06', 'Cibeureum'),
  ('32.72.07', 'Lembursitu')
ON DUPLICATE KEY UPDATE `nama_kecamatan` = VALUES(`nama_kecamatan`);

-- SEED 14: wilayah_kelurahan (33 Kelurahan Kota Sukabumi)
INSERT INTO `wilayah_kelurahan` (`kode_kelurahan`, `kode_kecamatan`, `nama_kelurahan`, `jumlah_rw`, `jumlah_rt`, `nama_lurah`) VALUES
  ('32.72.01.1001', '32.72.01', 'Gunungpuyuh', 11, 44, 'H. Dedi Supriyadi, S.Sos'),
  ('32.72.01.1002', '32.72.01', 'Karamat', 10, 38, 'Dra. Hj. Nunung Rohanah'),
  ('32.72.01.1003', '32.72.01', 'Karangtengah', 9, 36, 'Asep Saepulloh, S.IP'),
  ('32.72.01.1004', '32.72.01', 'Sriwidari', 12, 48, 'Rina Kusmayanti, M.Si'),
  ('32.72.02.1001', '32.72.02', 'Benteng', 8, 32, 'Herman Sutisna, S.AP'),
  ('32.72.02.1002', '32.72.02', 'Dayeuhluhur', 13, 52, 'Yudi Pratama, S.Sos'),
  ('32.72.02.1003', '32.72.02', 'Nyomplong', 7, 28, 'H. Tatang Rustandi'),
  ('32.72.02.1004', '32.72.02', 'Sukakarya', 10, 40, 'Bambang Irawan, S.IP'),
  ('32.72.02.1005', '32.72.02', 'Warudoyong', 11, 42, 'Drs. Iwan Setiawan'),
  ('32.72.03.1001', '32.72.03', 'Cikole', 12, 50, 'Mochammad Iqbal, S.STP'),
  ('32.72.03.1002', '32.72.03', 'Cisarua', 14, 56, 'Hj. Elis Maryati, S.Pd'),
  ('32.72.03.1003', '32.72.03', 'Gunungparang', 8, 34, 'Irvan Nurhidayat, M.Si'),
  ('32.72.03.1004', '32.72.03', 'Kebonjati', 10, 40, 'Ahmad Sofyan, S.IP'),
  ('32.72.03.1005', '32.72.03', 'Selabatu', 11, 45, 'Dr. Hendra Saputra'),
  ('32.72.03.1006', '32.72.03', 'Subangjaya', 13, 52, 'Ferry Hermawan, S.Sos'),
  ('32.72.04.1001', '32.72.04', 'Cikondang', 9, 36, 'Rudi Haryanto, S.AP'),
  ('32.72.04.1002', '32.72.04', 'Citamiang', 10, 40, 'H. Cecep Mulyadi'),
  ('32.72.04.1003', '32.72.04', 'Danalumpue', 8, 30, 'Agus Gunawan, S.IP'),
  ('32.72.04.1004', '32.72.04', 'Gedongpanjang', 12, 48, 'Dedi Kurniawan, S.STP'),
  ('32.72.04.1005', '32.72.04', 'Nanggeleng', 11, 44, 'Hj. Siti Rohmah, M.Pd'),
  ('32.72.05.1001', '32.72.05', 'Baros', 10, 40, 'Wawan Gunawan, S.Sos'),
  ('32.72.05.1002', '32.72.05', 'Jayaraksa', 8, 32, 'Endang Suhendar'),
  ('32.72.05.1003', '32.72.05', 'Jayamekar', 9, 36, 'Asep Munandar, S.IP'),
  ('32.72.05.1004', '32.72.05', 'Sudajaya Hilir', 11, 44, 'Kurniawan, S.AP'),
  ('32.72.06.1001', '32.72.06', 'Babakan', 10, 40, 'Rahmat Hidayat, S.Sos'),
  ('32.72.06.1002', '32.72.06', 'Cibeureumhilir', 9, 35, 'H. Anwar Sanusi'),
  ('32.72.06.1003', '32.72.06', 'Limusnunggal', 11, 44, 'Deden Solihin, S.IP'),
  ('32.72.06.1004', '32.72.06', 'Sindangpalay', 8, 30, 'Encep Supriatna'),
  ('32.72.07.1001', '32.72.07', 'Cikundul', 10, 38, 'Agus Supriatna, S.AP'),
  ('32.72.07.1002', '32.72.07', 'Cipanengah', 9, 36, 'Dra. Yati Maryati'),
  ('32.72.07.1003', '32.72.07', 'Lembursitu', 12, 48, 'Maman Suratman, S.IP'),
  ('32.72.07.1004', '32.72.07', 'Sindangsari', 8, 32, 'Usep Hendra, S.Sos'),
  ('32.72.07.1005', '32.72.07', 'Situmekar', 9, 35, 'H. Tatang Mulyadi')
ON DUPLICATE KEY UPDATE `nama_kelurahan` = VALUES(`nama_kelurahan`);

-- SEED 15: partner_api_keys (Sapawarga & Satu Data Jabar Official API Keys)
INSERT INTO `partner_api_keys` (`id`, `partner_name`, `api_key`, `api_secret_hash`, `scopes`, `is_active`) VALUES
  (1, 'SAPAWARGA_JABAR', 'bw_live_spw_77a9c812d45e0f19b882', SHA2('bw_live_spw_77a9c812d45e0f19b882_secret_salt', 256), '["read:surat", "read:bansos", "webhook:listener"]', 1),
  (2, 'SATU_DATA_JABAR', 'bw_live_sdj_33f81e01a9b4c67d82e1', SHA2('bw_live_sdj_33f81e01a9b4c67d82e1_secret_salt', 256), '["push:satudata", "read:demography_aggregate"]', 1),
  (3, 'DISKOMINFO_SUKABUMI', 'bw_live_dsk_55b29f04e1c78a90123d', SHA2('bw_live_dsk_55b29f04e1c78a90123d_secret_salt', 256), '["read:command_center", "read:all_stats"]', 1)
ON DUPLICATE KEY UPDATE `scopes` = VALUES(`scopes`);

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE = @OLD_SQL_MODE;
