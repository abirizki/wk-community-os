-- =======================================================================
-- BUMI WARGA - DATABASE SEED SCRIPT (DML)
-- Owner / Author: Jabar Pintar Digital
-- Lokasi Layanan: Kelurahan Kebonjati, Kec. Andir, Kota Bandung
-- Default Password Semua Akun: BumiWarga@2025
-- Hash Bcrypt (Salt 10): $2a$10$xJwGe3Q5KZrQEQFKYFzpJOkD7kPwVmGnDpkQ3.WTtVQJ4KJQH3rAC
-- =======================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @default_hash = '$2a$10$xJwGe3Q5KZrQEQFKYFzpJOkD7kPwVmGnDpkQ3.WTtVQJ4KJQH3rAC';

-- -----------------------------------------------------------------------
-- 1. SEED: users
-- -----------------------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password_hash`, `nama`, `role`, `status`) VALUES
  (1, '3273010101900001', @default_hash, 'Admin Kelurahan Kebonjati', 'admin', 'active'),
  (2, '3273010101900002', @default_hash, 'Operator Pelayanan RT 001', 'operator', 'active'),
  (3, '3273010203850003', @default_hash, 'Budi Santoso', 'warga', 'active'),
  (4, '3273014504900004', @default_hash, 'Siti Rahayu', 'warga', 'active'),
  (5, '3273021505850005', @default_hash, 'Ahmad Fauzi', 'warga', 'active')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `role` = VALUES(`role`);

-- -----------------------------------------------------------------------
-- 2. SEED: kartu_keluarga
-- -----------------------------------------------------------------------
INSERT INTO `kartu_keluarga` (`id`, `no_kk`, `kepala_keluarga`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`) VALUES
  (1, '3273010101900001', 'Budi Santoso', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat'),
  (2, '3273014504900002', 'Siti Rahayu', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat'),
  (3, '3273021505850003', 'Ahmad Fauzi', 'Jl. Kebonjati No. 88', '001', '002', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat')
ON DUPLICATE KEY UPDATE `kepala_keluarga` = VALUES(`kepala_keluarga`), `alamat` = VALUES(`alamat`);

-- -----------------------------------------------------------------------
-- 3. SEED: warga
-- -----------------------------------------------------------------------
INSERT INTO `warga` (`id`, `user_id`, `nik`, `no_kk`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `status_perkawinan`, `pekerjaan`, `pendidikan_terakhir`, `golongan_darah`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`, `kode_pos`, `no_telepon`, `email`, `status_kependudukan`) VALUES
  (1, 3, '3273010203850003', '3273010101900001', 'Budi Santoso', 'L', 'Bandung', '1985-03-02', 'Islam', 'Kawin', 'Karyawan Swasta', 'S1', 'O', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081234567890', 'budi.santoso@gmail.com', 'Tetap'),
  (2, 4, '3273014504900004', '3273014504900002', 'Siti Rahayu', 'P', 'Bandung', '1990-04-05', 'Islam', 'Kawin', 'Ibu Rumah Tangga', 'SMA/SMK', 'A', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '082345678901', 'siti.rahayu@gmail.com', 'Tetap'),
  (3, 5, '3273021505850005', '3273021505850003', 'Ahmad Fauzi', 'L', 'Sumedang', '1985-05-15', 'Islam', 'Belum Kawin', 'Wiraswasta', 'S1', 'B', 'Jl. Kebonjati No. 88', '001', '002', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '083456789012', 'ahmad.fauzi@gmail.com', 'Tetap'),
  (4, NULL, '3273010203900010', '3273010101900001', 'Dewi Santoso', 'P', 'Bandung', '1990-03-10', 'Islam', 'Kawin', 'Guru Honorer', 'S1', 'AB', 'Jl. Kebonjati No. 12', '001', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', '081298765432', 'dewi.santoso@gmail.com', 'Tetap'),
  (5, NULL, '3273014504921011', '3273014504900002', 'Rizki Rahayu', 'L', 'Bandung', '2021-09-21', 'Islam', 'Belum Kawin', NULL, 'Tidak/Belum Sekolah', 'Tidak Tahu', 'Jl. Garuda No. 45', '002', '001', 'Kebonjati', 'Andir', 'Bandung', 'Jawa Barat', '40181', NULL, NULL, 'Tetap')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `pekerjaan` = VALUES(`pekerjaan`), `no_telepon` = VALUES(`no_telepon`);

-- -----------------------------------------------------------------------
-- 4. SEED: pengaduan
-- -----------------------------------------------------------------------
INSERT INTO `pengaduan` (`id`, `nik_pelapor`, `judul`, `deskripsi`, `kategori`, `status`, `catatan_admin`) VALUES
  (1, '3273010203850003', 'Lampu penerangan jalan RT 001 mati', 'Lampu jalan utama di depan gang RT 001/RW 001 Jl. Kebonjati padam sejak 3 hari lalu. Suasana malam sangat gelap dan rawan kecelakaan.', 'Infrastruktur', 'PENDING', NULL),
  (2, '3273014504900004', 'Saluran drainase tersumbat tumpukan sampah', 'Saluran drainase di perbatasan RT 002 dan RT 001 tersumbat sampah ranting pohon, menyebabkan luapan air saat hujan deras kemarin sore.', 'Lingkungan', 'PROCESSING', 'Laporan diteruskan ke tim kebersihan RW 001 untuk kerja bakti pekan ini.'),
  (3, '3273021505850005', 'Jalan berlubang cukup dalam di dekat gapura', 'Ada 2 lubang jalan berdiameter sekitar 40cm dengan kedalaman 10cm di dekat gapura masuk RW 002. Sangat membahayakan pengendara motor roda dua.', 'Infrastruktur', 'RESOLVED', 'Sudah ditambal aspal dingin sementara oleh satgas kelurahan pada 05 September 2025.')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`), `status` = VALUES(`status`), `catatan_admin` = VALUES(`catatan_admin`);

-- -----------------------------------------------------------------------
-- 5. SEED: pbb
-- -----------------------------------------------------------------------
INSERT INTO `pbb` (`id`, `nop`, `nik_warga`, `tahun`, `njop`, `nominal`, `denda`, `status_pembayaran`, `tanggal_jatuh_tempo`, `tanggal_bayar`, `channel_pembayaran`) VALUES
  (1, '32.73.010.001.001-0001.0', '3273010203850003', 2025, 350000000.00, 525000.00, 0.00, 'PAID', '2025-08-31', '2025-07-15', 'QRIS Mandiri'),
  (2, '32.73.010.001.001-0001.0', '3273010203850003', 2026, 365000000.00, 547500.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL),
  (3, '32.73.010.002.001-0002.0', '3273014504900004', 2025, 280000000.00, 420000.00, 0.00, 'PAID', '2025-08-31', '2025-08-01', 'VA BJB'),
  (4, '32.73.010.002.001-0002.0', '3273014504900004', 2026, 295000000.00, 442500.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL),
  (5, '32.73.010.001.002-0003.0', '3273021505850005', 2026, 420000000.00, 630000.00, 0.00, 'UNPAID', '2026-08-31', NULL, NULL)
ON DUPLICATE KEY UPDATE `nominal` = VALUES(`nominal`), `status_pembayaran` = VALUES(`status_pembayaran`);

-- -----------------------------------------------------------------------
-- 6. SEED: posyandu
-- -----------------------------------------------------------------------
INSERT INTO `posyandu` (`id`, `nik_warga`, `nama_anak`, `tanggal_lahir_anak`, `jenis_kelamin_anak`, `umur_bulan`, `berat_badan_kg`, `tinggi_badan_cm`, `lingkar_kepala_cm`, `status_gizi`, `imunisasi`, `tanggal_pemeriksaan`, `petugas`, `catatan_kesehatan`) VALUES
  (1, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 46, 14.20, 97.50, 49.00, 'Normal', 'DPT Booster', '2025-07-10', 'Bdn. Imas Rohayati', 'Tumbuh kembang baik, aktif dan nafsu makan normal.'),
  (2, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 47, 14.50, 98.50, 49.20, 'Normal', NULL, '2025-08-12', 'Bdn. Imas Rohayati', 'Kenaikan berat badan 300 gram. Berikan variasi protein hewani.'),
  (3, '3273014504900004', 'Rizki Rahayu', '2021-09-21', 'L', 48, 14.80, 99.00, 49.50, 'Normal', 'Vitamin A Merah', '2025-09-09', 'Bdn. Imas Rohayati', 'Pemberian kapsul vitamin A merah berhasil. Kondisi fisik sehat.'),
  (4, '3273010203850003', 'Zahra Santoso', '2023-07-15', 'P', 24, 10.50, 83.00, 46.50, 'Normal', 'Campak Rubella (MR 2)', '2025-07-15', 'Bdn. Imas Rohayati', 'Imunisasi MR 2 sudah diberikan. Motorik kasar dan bicara lancar.')
ON DUPLICATE KEY UPDATE `berat_badan_kg` = VALUES(`berat_badan_kg`), `tinggi_badan_cm` = VALUES(`tinggi_badan_cm`);

SET FOREIGN_KEY_CHECKS = 1;

