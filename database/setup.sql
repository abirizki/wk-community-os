-- =======================================================================
-- BUMI WARGA - DATABASE SETUP SCRIPT (DDL)
-- Owner / Author: Jabar Pintar Digital
-- Lokasi Layanan: Kelurahan Kebonjati, Kec. Andir, Kota Bandung
-- Target Engine: MySQL 8.0+ (InnoDB, utf8mb4)
-- =======================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel users (Autentikasi & Akun Sistem)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(16) NOT NULL UNIQUE COMMENT 'NIK 16 digit warga atau username admin',
  `password_hash` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `role` ENUM('admin', 'operator', 'warga') NOT NULL DEFAULT 'warga',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel kartu_keluarga (Data Induk KK)
CREATE TABLE IF NOT EXISTS `kartu_keluarga` (
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

-- 3. Tabel warga (Data Kependudukan Lengkap)
CREATE TABLE IF NOT EXISTS `warga` (
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
  `status_kependudukan` ENUM('Tetap', 'Sementara', 'Pindah') NOT NULL DEFAULT 'Tetap',
  `foto_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_warga_no_kk` (`no_kk`),
  INDEX `idx_warga_nama` (`nama`),
  CONSTRAINT `fk_warga_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_warga_kk` FOREIGN KEY (`no_kk`) REFERENCES `kartu_keluarga` (`no_kk`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel pengaduan (Aspirasi & Laporan Warga)
CREATE TABLE IF NOT EXISTS `pengaduan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_pelapor` VARCHAR(16) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `kategori` ENUM('Infrastruktur', 'Keamanan', 'Layanan', 'Lingkungan', 'Lainnya') NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `lampiran_url` VARCHAR(500) NULL,
  `catatan_admin` TEXT NULL,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pengaduan_nik` (`nik_pelapor`),
  INDEX `idx_pengaduan_status` (`status`),
  CONSTRAINT `fk_pengaduan_warga` FOREIGN KEY (`nik_pelapor`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel pbb (Pajak Bumi dan Bangunan)
CREATE TABLE IF NOT EXISTS `pbb` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nop` VARCHAR(30) NOT NULL COMMENT 'Nomor Objek Pajak',
  `nik_warga` VARCHAR(16) NOT NULL,
  `tahun` YEAR NOT NULL,
  `njop` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `nominal` DECIMAL(15,2) NOT NULL,
  `denda` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `status_pembayaran` ENUM('UNPAID', 'PAID', 'EXEMPT') NOT NULL DEFAULT 'UNPAID',
  `tanggal_jatuh_tempo` DATE NOT NULL,
  `tanggal_bayar` DATE NULL DEFAULT NULL,
  `channel_pembayaran` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_pbb_nop_tahun` (`nop`, `tahun`),
  INDEX `idx_pbb_nik` (`nik_warga`),
  INDEX `idx_pbb_status` (`status_pembayaran`),
  CONSTRAINT `fk_pbb_warga` FOREIGN KEY (`nik_warga`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel posyandu (Rekam Kesehatan Balita & Ibu)
CREATE TABLE IF NOT EXISTS `posyandu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_warga` VARCHAR(16) NOT NULL COMMENT 'NIK orang tua / wali',
  `nama_anak` VARCHAR(150) NOT NULL,
  `nik_anak` VARCHAR(16) NULL,
  `tanggal_lahir_anak` DATE NULL,
  `jenis_kelamin_anak` ENUM('L', 'P') NULL,
  `umur_bulan` INT NOT NULL,
  `berat_badan_kg` DECIMAL(5,2) NOT NULL,
  `tinggi_badan_cm` DECIMAL(5,2) NOT NULL,
  `lingkar_kepala_cm` DECIMAL(5,2) NULL,
  `status_gizi` ENUM('Normal', 'Kurang', 'Lebih', 'Stunting') NOT NULL DEFAULT 'Normal',
  `imunisasi` VARCHAR(100) NULL,
  `tanggal_pemeriksaan` DATE NOT NULL,
  `petugas` VARCHAR(100) NULL,
  `catatan_kesehatan` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_posyandu_nik` (`nik_warga`),
  INDEX `idx_posyandu_tgl` (`tanggal_pemeriksaan`),
  CONSTRAINT `fk_posyandu_warga` FOREIGN KEY (`nik_warga`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel dokumen_request (Pengajuan Dokumen Kelurahan - Persiapan Modul Baru)
CREATE TABLE IF NOT EXISTS `dokumen_request` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik_pemohon` VARCHAR(16) NOT NULL,
  `jenis_dokumen` ENUM('Surat Keterangan Domisili', 'Surat Pengantar KTP', 'Surat Keterangan Tidak Mampu', 'Surat Keterangan Usaha', 'Surat Keterangan Lahir', 'Surat Keterangan Meninggal', 'Lainnya') NOT NULL,
  `keperluan` VARCHAR(255) NOT NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'VERIFYING', 'APPROVED', 'REJECTED', 'READY_PICKUP') NOT NULL DEFAULT 'SUBMITTED',
  `catatan_admin` TEXT NULL,
  `file_hasil` VARCHAR(500) NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dokumen_pemohon` (`nik_pemohon`),
  INDEX `idx_dokumen_status` (`status`),
  CONSTRAINT `fk_dokumen_warga` FOREIGN KEY (`nik_pemohon`) REFERENCES `warga` (`nik`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

