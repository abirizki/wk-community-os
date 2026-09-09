-- =======================================================================
-- BUMI WARGA - CLEAN PRODUCTION DATABASE RE-INITIALIZATION & SEED
-- Owner / Author: Jabar Pintar Digital
-- Target Database: MySQL 8.x (Hostinger: u466444476_bumiwarga)
-- =======================================================================

SET NAMES utf8mb4;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------------------------
-- DROP OLD TABLES IF EXIST (Mencegah konflik skema parsial terdahulu)
-- -----------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifikasi`;
DROP TABLE IF EXISTS `dokumen_request`;
DROP TABLE IF EXISTS `posyandu`;
DROP TABLE IF EXISTS `pbb`;
DROP TABLE IF EXISTS `pengaduan`;
DROP TABLE IF EXISTS `warga`;
DROP TABLE IF EXISTS `kartu_keluarga`;
DROP TABLE IF EXISTS `users`;

-- -----------------------------------------------------------------------
-- 1. TABEL: users (Autentikasi & Akun Sistem)
-- -----------------------------------------------------------------------
CREATE TABLE `users` (
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

-- -----------------------------------------------------------------------
-- 4. TABEL: pengaduan (Aspirasi & Laporan Warga)
-- -----------------------------------------------------------------------
CREATE TABLE `pengaduan` (
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

-- -----------------------------------------------------------------------
-- 5. TABEL: pbb (Pajak Bumi dan Bangunan)
-- -----------------------------------------------------------------------
CREATE TABLE `pbb` (
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

-- -----------------------------------------------------------------------
-- 6. TABEL: posyandu (Rekam Kesehatan Balita & Ibu)
-- -----------------------------------------------------------------------
CREATE TABLE `posyandu` (
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

-- -----------------------------------------------------------------------
-- 7. TABEL: dokumen_request (Pengajuan Dokumen Kelurahan)
-- -----------------------------------------------------------------------
CREATE TABLE `dokumen_request` (
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

-- -----------------------------------------------------------------------
-- 8. TABEL: notifikasi (Sistem Pemberitahuan Warga)
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
-- 9. TABEL: audit_logs (Enterprise Audit Trail & Compliance)
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
-- SEED DATA (DML)
-- =======================================================================

SET @default_hash = '$2a$10$xJwGe3Q5KZrQEQFKYFzpJOkD7kPwVmGnDpkQ3.WTtVQJ4KJQH3rAC';

-- SEED 1: users
INSERT INTO `users` (`id`, `username`, `password_hash`, `nama`, `role`, `status`) VALUES
  (1, '3273010101900001', @default_hash, 'Admin Kelurahan Kebonjati', 'admin', 'active'),
  (2, '3273010101900002', @default_hash, 'Operator Pelayanan RT 001', 'operator', 'active'),
  (3, '3273010203850003', @default_hash, 'Budi Santoso', 'warga', 'active'),
  (4, '3273014504900004', @default_hash, 'Siti Rahayu', 'warga', 'active'),
  (5, '3273021505850005', @default_hash, 'Ahmad Fauzi', 'warga', 'active')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `role` = VALUES(`role`);

-- SEED 2: kartu_keluarga
INSERT INTO `kartu_keluarga` (`id`, `no_kk`, `kepala_keluarga`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`) VALUES
  (1, '3273010101900001', 'Budi Santoso', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat'),
  (2, '3273014504900002', 'Siti Rahayu', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat'),
  (3, '3273021505850003', 'Ahmad Fauzi', 'Jl. Kebonjati No. 88', '001', '002', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat')
ON DUPLICATE KEY UPDATE `kepala_keluarga` = VALUES(`kepala_keluarga`), `alamat` = VALUES(`alamat`);

-- SEED 3: warga
INSERT INTO `warga` (`id`, `user_id`, `nik`, `no_kk`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `status_perkawinan`, `pekerjaan`, `pendidikan_terakhir`, `golongan_darah`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`, `kode_pos`, `no_telepon`, `email`, `status_kependudukan`) VALUES
  (1, 3, '3273010203850003', '3273010101900001', 'Budi Santoso', 'L', 'Bandung', '1985-03-02', 'Islam', 'Kawin', 'Karyawan Swasta', 'S1', 'O', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081234567890', 'budi.santoso@gmail.com', 'Tetap'),
  (2, 4, '3273014504900004', '3273014504900002', 'Siti Rahayu', 'P', 'Bandung', '1990-04-05', 'Islam', 'Kawin', 'Ibu Rumah Tangga', 'SMA/SMK', 'A', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '082345678901', 'siti.rahayu@gmail.com', 'Tetap'),
  (3, 5, '3273021505850005', '3273021505850003', 'Ahmad Fauzi', 'L', 'Sumedang', '1985-05-15', 'Islam', 'Belum Kawin', 'Wiraswasta', 'S1', 'B', 'Jl. Kebonjati No. 88', '001', '002', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '083456789012', 'ahmad.fauzi@gmail.com', 'Tetap'),
  (4, NULL, '3273010203900010', '3273010101900001', 'Dewi Santoso', 'P', 'Bandung', '1990-03-10', 'Islam', 'Kawin', 'Guru Honorer', 'S1', 'AB', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081298765432', 'dewi.santoso@gmail.com', 'Tetap'),
  (5, NULL, '3273014504921011', '3273014504900002', 'Rizki Rahayu', 'L', 'Bandung', '2021-09-21', 'Islam', 'Belum Kawin', NULL, 'Tidak/Belum Sekolah', 'Tidak Tahu', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', NULL, NULL, 'Tetap')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `pekerjaan` = VALUES(`pekerjaan`), `no_telepon` = VALUES(`no_telepon`);

-- SEED 4: pengaduan
INSERT INTO `pengaduan` (`id`, `nik_pelapor`, `judul`, `deskripsi`, `kategori`, `status`, `catatan_admin`) VALUES
  (1, '3273010203850003', 'Lampu penerangan jalan RT 001 mati', 'Lampu jalan utama di depan gang RT 001/RW 001 Jl. Kebonjati padam sejak 3 hari lalu. Suasana malam sangat gelap dan rawan kecelakaan.', 'Infrastruktur', 'PENDING', NULL),
  (2, '3273014504900004', 'Saluran drainase tersumbat tumpukan sampah', 'Saluran drainase di perbatasan RT 002 dan RT 001 tersumbat sampah ranting pohon, menyebabkan luapan air saat hujan deras kemarin sore.', 'Lingkungan', 'PROCESSING', 'Laporan diteruskan ke tim kebersihan RW 001 untuk kerja bakti pekan ini.'),
  (3, '3273021505850005', 'Jalan berlubang cukup dalam di dekat gapura', 'Ada 2 lubang jalan berdiameter sekitar 40cm dengan kedalaman 10cm di dekat gapura masuk RW 002. Sangat membahayakan pengendara motor roda dua.', 'Infrastruktur', 'RESOLVED', 'Sudah ditambal aspal dingin sementara oleh satgas kelurahan pada 05 September 2025.')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`), `status` = VALUES(`status`), `catatan_admin` = VALUES(`catatan_admin`);

-- SEED 5: pbb
INSERT INTO `pbb` (`id`, `nop`, `nik_warga`, `tahun`, `njop`, `nominal`, `denda`, `status_pembayaran`, `tanggal_jatuh_tempo`, `tanggal_bayar`, `channel_pembayaran`) VALUES
  (1, '32.73.010.001.001-0001.0', '3273010203850003', 2025, 350000000.00, 525000.00, 0.00, 'PAID', '2025-08-31', '2025-07-15', 'QRIS Mandiri'),
  (2, '32.73.010.001.001-0001.0', '3273010203850003', 2026, 365000000.00, 547500.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL),
  (3, '32.73.010.002.001-0002.0', '3273014504900004', 2025, 280000000.00, 420000.00, 0.00, 'PAID', '2025-08-31', '2025-08-01', 'VA BJB'),
  (4, '32.73.010.002.001-0002.0', '3273014504900004', 2026, 295000000.00, 442500.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL),
  (5, '32.73.010.001.002-0003.0', '3273021505850005', 2026, 420000000.00, 630000.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL)
ON DUPLICATE KEY UPDATE `nominal` = VALUES(`nominal`), `status_pembayaran` = VALUES(`status_pembayaran`);

-- SEED 6: posyandu
INSERT INTO `posyandu` (`id`, `nik_warga`, `nama_anak`, `tanggal_lahir_anak`, `jenis_kelamin_anak`, `umur_bulan`, `berat_badan_kg`, `tinggi_badan_cm`, `lingkar_kepala_cm`, `status_gizi`, `imunisasi`, `tanggal_pemeriksaan`, `petugas`, `catatan_kesehatan`) VALUES
  (1, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 46, 14.20, 97.50, 49.00, 'Normal', 'DPT Booster', '2025-07-10', 'Bdn. Imas Rohayati', 'Tumbuh kembang baik, aktif dan nafsu makan normal.'),
  (2, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 47, 14.50, 98.50, 49.20, 'Normal', NULL, '2025-08-12', 'Bdn. Imas Rohayati', 'Kenaikan berat badan 300 gram. Berikan variasi protein hewani.'),
  (3, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 48, 14.80, 99.00, 49.50, 'Normal', 'Vitamin A Merah', '2025-09-09', 'Bdn. Imas Rohayati', 'Pemberian kapsul vitamin A merah berhasil. Kondisi fisik sehat.'),
  (4, '3273010203850003', 'Zahra Santoso', '2023-07-15', 'P', 24, 10.50, 83.00, 46.50, 'Normal', 'Campak Rubella (MR 2)', '2025-07-15', 'Bdn. Imas Rohayati', 'Imunisasi MR 2 sudah diberikan. Motorik kasar dan bicara lancar.')
ON DUPLICATE KEY UPDATE `berat_badan_kg` = VALUES(`berat_badan_kg`), `tinggi_badan_cm` = VALUES(`tinggi_badan_cm`);

-- SEED 7: notifikasi
INSERT INTO `notifikasi` (`id`, `nik_target`, `judul`, `pesan`, `tipe`, `is_read`, `link`) VALUES
  (1, '3273010203850003', 'Tagihan PBB 2026 Tersedia', 'Tagihan PBB-P2 tahun pajak 2026 untuk NOP 32.73.010.001.001-0001.0 telah terbit. Silakan lakukan pembayaran sebelum 31 Agustus 2026.', 'warning', 0, '/dashboard/pbb'),
  (2, '3273014504900004', 'Jadwal Posyandu Balita Bulan Depan', 'Pemeriksaan Posyandu Melati RW 001 akan dilaksanakan pada tanggal 12 Oktober 2026 di Balai Warga.', 'info', 0, '/dashboard/posyandu')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`), `pesan` = VALUES(`pesan`);

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE = @OLD_SQL_MODE;
