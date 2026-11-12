-- =======================================================================
-- BUMI WARGA - SADA JABAR COHERENCE & STATISTICAL VISUALIZATION SEEDER
-- Mendukung Interoperabilitas Satu Data Jawa Barat (SDI) & Dashboard Hidup
-- Lingkup: Kelurahan Kebonjati (Pilot Hub), Kecamatan Cikole, Kota Sukabumi
-- =======================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------
-- 1. KEUANGAN KAS (Buku Kas Masuk & Keluar RT 001 / RW 001 Kebonjati)
-- Menghidupkan KeuanganPage.jsx: Saldo Kas Berjalan, Tren Arus Kas, & Audit
-- -----------------------------------------------------------------------
INSERT INTO `keuangan_kas` (`id`, `nomor_transaksi`, `tipe`, `kategori`, `nominal`, `keterangan`, `tanggal_transaksi`, `tingkat_wilayah`, `rt`, `rw`, `dicatat_oleh_user_id`, `identitas_pembayar`) VALUES
  (1, 'KAS-RT001-20261001-1001', 'MASUK', 'Iuran Warga', 1250000.00, 'Penerimaan Iuran Warga RT 001 Periode Oktober 2026 (50 KK @ Rp 25.000)', '2026-10-01', 'RT', '001', '001', 4, 'Warga RT 001 (Kolektif)'),
  (2, 'KAS-RT001-20261005-1002', 'KELUAR', 'Operasional & Kebersihan', 350000.00, 'Honor Petugas Pengangkut Sampah & Kebersihan Lingkungan Oktober', '2026-10-05', 'RT', '001', '001', 4, NULL),
  (3, 'KAS-RT001-20261012-1003', 'KELUAR', 'Pemeliharaan Fasum', 280000.00, 'Penggantian 4 Unit Lampu LED Penerangan Jalan Gang Melati RT 001', '2026-10-12', 'RT', '001', '001', 4, NULL),
  (4, 'KAS-RT001-20261020-1004', 'MASUK', 'Donasi Warga', 1500000.00, 'Donasi Swadaya Warga untuk Pengecatan Gapura & Pos Ronda RT 001', '2026-10-20', 'RT', '001', '001', 4, 'H. M. Kosasih (Donatur)'),
  (5, 'KAS-RT001-20261025-1005', 'KELUAR', 'Kegiatan Sosial', 450000.00, 'Konsumsi & Perlengkapan Kerja Bakti Bersih Saluran Drainase', '2026-10-25', 'RT', '001', '001', 4, NULL),
  (6, 'KAS-RT001-20261101-1006', 'MASUK', 'Iuran Warga', 1200000.00, 'Penerimaan Iuran Warga RT 001 Periode November 2026 (48 KK Lunas)', '2026-11-01', 'RT', '001', '001', 4, 'Warga RT 001 (Kolektif)'),
  (7, 'KAS-RT001-20261104-1007', 'KELUAR', 'Kesehatan Lingkungan', 300000.00, 'Fogging Swadaya Pencegahan DBD di Lingkungan RT 001 dan RT 002', '2026-11-04', 'RT', '001', '001', 4, NULL),
  (8, 'KAS-RT001-20261108-1008', 'KELUAR', 'Operasional & Kebersihan', 350000.00, 'Honor Petugas Pengangkut Sampah & Kebersihan Lingkungan November', '2026-11-08', 'RT', '001', '001', 4, NULL),
  (9, 'KAS-RT001-20261110-1009', 'MASUK', 'Bantuan Operasional', 2000000.00, 'Alokasi Dana Stimulan Operasional RT dari Kelurahan Kebonjati', '2026-11-10', 'RT', '001', '001', 4, 'Kelurahan Kebonjati'),
  (10, 'KAS-RW001-20261001-2001', 'MASUK', 'Iuran Lingkungan RW', 2500000.00, 'Iuran Wajib Wilayah RW 001 dari 5 RT Terintegrasi Bulan Oktober', '2026-10-01', 'RW', '001', '001', 3, 'Kolektif RT 001-005'),
  (11, 'KAS-RW001-20261015-2002', 'KELUAR', 'Keamanan Wilayah', 800000.00, 'Insentif Petugas Linmas & Satkamling RW 001 Bulan Oktober', '2026-10-15', 'RW', '001', '001', 3, NULL),
  (12, 'KAS-RW001-20261101-2003', 'MASUK', 'Iuran Lingkungan RW', 2500000.00, 'Iuran Wajib Wilayah RW 001 dari 5 RT Terintegrasi Bulan November', '2026-11-01', 'RW', '001', '001', 3, 'Kolektif RT 001-005'),
  (13, 'KAS-RW001-20261105-2004', 'KELUAR', 'Santunan Duka', 500000.00, 'Santunan Duka Warga Meninggal Dunia Keluarga Alm. Kakek Sukardi', '2026-11-05', 'RW', '001', '001', 3, NULL)
ON DUPLICATE KEY UPDATE `nominal` = VALUES(`nominal`), `keterangan` = VALUES(`keterangan`);

-- -----------------------------------------------------------------------
-- 2. KEUANGAN IURAN WARGA (Rekap Iuran Bulanan 50 KK x Periode 2026-10 & 2026-11)
-- Kolektibilitas Iuran 88% Lunas, 12% Belum Bayar (Keluarga Desil 1)
-- -----------------------------------------------------------------------
INSERT INTO `keuangan_iuran_warga` (`no_kk`, `nama_kepala_keluarga`, `periode_bulan`, `nominal_tagihan`, `status_bayar`, `tanggal_bayar`, `metode_bayar`, `rt`, `rw`, `diterima_oleh_user_id`) VALUES
  ('3272030101900101', 'Budi Santoso', '2026-10', 25000.00, 'LUNAS', '2026-10-02 09:15:00', 'TRANSFER', '001', '001', 4),
  ('3272030101900101', 'Budi Santoso', '2026-11', 25000.00, 'LUNAS', '2026-11-01 10:20:00', 'TRANSFER', '001', '001', 4),
  ('3272030101900102', 'Siti Rahayu', '2026-10', 25000.00, 'LUNAS', '2026-10-03 14:00:00', 'TUNAI_RT', '001', '001', 4),
  ('3272030101900102', 'Siti Rahayu', '2026-11', 25000.00, 'LUNAS', '2026-11-02 11:30:00', 'TUNAI_RT', '001', '001', 4),
  ('3272030101900103', 'Ahmad Hidayat', '2026-10', 25000.00, 'LUNAS', '2026-10-04 16:45:00', 'TRANSFER', '001', '001', 4),
  ('3272030101900103', 'Ahmad Hidayat', '2026-11', 25000.00, 'LUNAS', '2026-11-03 08:50:00', 'TRANSFER', '001', '001', 4),
  ('3272030101900104', 'Ujang Suherman', '2026-10', 25000.00, 'LUNAS', '2026-10-15 19:10:00', 'TUNAI_RT', '001', '001', 4),
  ('3272030101900104', 'Ujang Suherman', '2026-11', 25000.00, 'BELUM_BAYAR', NULL, NULL, '001', '001', NULL),
  ('3272030101900105', 'Hendra Wijaya', '2026-10', 25000.00, 'LUNAS', '2026-10-02 10:00:00', 'TRANSFER', '001', '001', 4),
  ('3272030101900105', 'Hendra Wijaya', '2026-11', 25000.00, 'LUNAS', '2026-11-01 13:25:00', 'TRANSFER', '001', '001', 4),
  ('3272030101900201', 'Cecep Supriatna', '2026-10', 25000.00, 'LUNAS', '2026-10-05 18:30:00', 'TUNAI_RT', '002', '001', 4),
  ('3272030101900201', 'Cecep Supriatna', '2026-11', 25000.00, 'LUNAS', '2026-11-04 19:00:00', 'TUNAI_RT', '002', '001', 4),
  ('3272030101900202', 'Dedi Mulyadi', '2026-10', 25000.00, 'LUNAS', '2026-10-04 11:15:00', 'TRANSFER', '002', '001', 4),
  ('3272030101900202', 'Dedi Mulyadi', '2026-11', 25000.00, 'LUNAS', '2026-11-02 09:40:00', 'TRANSFER', '002', '001', 4),
  ('3272030101900203', 'Rahmat Hidayat', '2026-10', 25000.00, 'LUNAS', '2026-10-06 15:20:00', 'TUNAI_RT', '002', '001', 4),
  ('3272030101900203', 'Rahmat Hidayat', '2026-11', 25000.00, 'BELUM_BAYAR', NULL, NULL, '002', '001', NULL),
  ('3272030101900301', 'Agus Setiawan', '2026-10', 25000.00, 'LUNAS', '2026-10-01 14:00:00', 'TRANSFER', '003', '001', 4),
  ('3272030101900301', 'Agus Setiawan', '2026-11', 25000.00, 'LUNAS', '2026-11-01 10:15:00', 'TRANSFER', '003', '001', 4),
  ('3272030101900302', 'Bambang Irawan', '2026-10', 25000.00, 'LUNAS', '2026-10-03 16:30:00', 'TUNAI_RT', '003', '001', 4),
  ('3272030101900302', 'Bambang Irawan', '2026-11', 25000.00, 'LUNAS', '2026-11-05 11:20:00', 'TUNAI_RT', '003', '001', 4),
  ('3272030101900401', 'Yayan Rohiman', '2026-10', 25000.00, 'LUNAS', '2026-10-02 08:30:00', 'TRANSFER', '004', '001', 4),
  ('3272030101900401', 'Yayan Rohiman', '2026-11', 25000.00, 'LUNAS', '2026-11-01 17:00:00', 'TRANSFER', '004', '001', 4),
  ('3272030101900402', 'Asep Suhendar', '2026-10', 25000.00, 'LUNAS', '2026-10-05 20:10:00', 'TUNAI_RT', '004', '001', 4),
  ('3272030101900402', 'Asep Suhendar', '2026-11', 25000.00, 'BELUM_BAYAR', NULL, NULL, '004', '001', NULL),
  ('3272030101900501', 'Ade Koswara', '2026-10', 25000.00, 'LUNAS', '2026-10-04 12:45:00', 'TRANSFER', '005', '001', 4),
  ('3272030101900501', 'Ade Koswara', '2026-11', 25000.00, 'LUNAS', '2026-11-03 15:30:00', 'TRANSFER', '005', '001', 4)
ON DUPLICATE KEY UPDATE `status_bayar` = VALUES(`status_bayar`), `tanggal_bayar` = VALUES(`tanggal_bayar`);

-- -----------------------------------------------------------------------
-- 3. FASILITAS PENDIDIKAN (Zonasi & Daya Tampung Sekolah Kebonjati/Cikole)
-- Menghidupkan AnalyticsDashboardPage.jsx: Kohort Progresi & Deteksi Risiko ATS
-- -----------------------------------------------------------------------
INSERT INTO `fasilitas_pendidikan` (`id`, `nama_sekolah`, `npsn`, `jenjang`, `status_sekolah`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `daya_tampung_kursi_baru`, `total_kapasitas_murid`, `jumlah_rombel`, `akreditasi`, `kepala_sekolah`) VALUES
  (1, 'SD Negeri Kebonjati 1', '20221001', 'SD', 'Negeri', 'Jl. Kebonjati No. 15', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 60, 360, 12, 'A', 'Hj. Elis Rohaeti, S.Pd'),
  (2, 'SD Negeri Kebonjati 2', '20221002', 'SD', 'Negeri', 'Jl. Kebonjati No. 18', '002', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 80, 480, 16, 'A', 'Drs. H. Maman Suratman'),
  (3, 'SMP Negeri 1 Cikole', '20222001', 'SMP', 'Negeri', 'Jl. R. Syamsudin No. 4', '003', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 120, 720, 24, 'A', 'H. Agus Rusliana, M.Pd'),
  (4, 'SMA Negeri 1 Kota Sukabumi', '20223001', 'SMA', 'Negeri', 'Jl. R.H. Didi Sukardi No. 22', '001', '002', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 140, 840, 28, 'A', 'Dra. Hj. Rina Marlina, M.M'),
  (5, 'PKBM Bina Harapan Kebonjati', '20224001', 'PKBM', 'Swasta', 'Jl. Garuda No. 10', '004', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 40, 120, 4, 'B', 'Ujang Ruswandi, S.Sos')
ON DUPLICATE KEY UPDATE `daya_tampung_kursi_baru` = VALUES(`daya_tampung_kursi_baru`);

-- -----------------------------------------------------------------------
-- 4. FASILITAS KESEHATAN (Daya Dukung Layanan Kesehatan Kelurahan)
-- -----------------------------------------------------------------------
INSERT INTO `fasilitas_kesehatan` (`id`, `nama_faskes`, `jenis_faskes`, `kategori_pengelola`, `alamat`, `rt`, `rw`, `kelurahan`, `kecamatan`, `kota`, `jumlah_dokter`, `jumlah_bidan`, `jumlah_perawat`, `jumlah_ahli_gizi`, `kapasitas_tempat_tidur`, `penanggung_jawab`) VALUES
  (1, 'Puskesmas Pembantu Kebonjati', 'Pustu', 'Pemerintah', 'Jl. Kebonjati No. 22', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 2, 3, 4, 1, 6, 'dr. Ratna Dewi, M.Kes'),
  (2, 'Posyandu Melati RW 001', 'Posyandu', 'Pemerintah', 'Balai Warga RW 001 Kebonjati', '001', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0, 1, 0, 1, 0, 'Ny. Hj. Yayah Rokayah'),
  (3, 'Posyandu Mawar RW 002', 'Posyandu', 'Pemerintah', 'Balai Warga RW 002 Kebonjati', '001', '002', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 0, 1, 0, 1, 0, 'Bdn. Rina Marlina'),
  (4, 'Klinik Pratama Sehat Sejahtera', 'Klinik Pratama', 'Swasta', 'Jl. Kebonjati No. 55', '003', '001', 'Kebonjati', 'Cikole', 'Kota Sukabumi', 3, 2, 3, 0, 4, 'dr. Hendra Pratama')
ON DUPLICATE KEY UPDATE `jumlah_dokter` = VALUES(`jumlah_dokter`);

-- -----------------------------------------------------------------------
-- 5. POSYANDU IBU HAMIL (Program 1000 Hari Pertama Kehidupan / HPK)
-- Menghidupkan PosyanduPage.jsx: Tab Ibu Hamil & Deteksi Risiko KEK
-- -----------------------------------------------------------------------
INSERT INTO `posyandu_ibu_hamil` (`id`, `nik`, `nama`, `no_kk`, `tanggal_lahir`, `usia_kehamilan_minggu`, `hpht`, `hpl`, `lila_cm`, `status_kek`, `status_risiko`, `nama_suami`, `no_kontak`, `rt`, `rw`, `alamat`, `jumlah_konsumsi_ttd`) VALUES
  (1, '3272034502970001', 'Ny. Fitri Handayani', '3272030101900104', '1997-02-15', 24, '2026-05-01', '2027-02-05', 22.4, 'Risiko KEK', 'Risiko Tinggi', 'Ujang Suherman', '081234887766', '001', '001', 'Jl. Kebonjati Gang Melati No. 04', 45),
  (2, '3272035809990002', 'Ny. Ratna Sari', '3272030101900201', '1999-09-18', 16, '2026-06-25', '2027-04-01', 25.5, 'Normal', 'Risiko Rendah', 'Cecep Supriatna', '081399776655', '002', '001', 'Jl. Kebonjati Gang Saluyu RT 02/RW 01', 30),
  (3, '3272036211950003', 'Ny. Dewi Sartika', '3272030101900302', '1995-11-22', 32, '2026-03-10', '2026-12-15', 23.0, 'Risiko KEK', 'Risiko Tinggi', 'Bambang Irawan', '085712345678', '003', '001', 'Jl. Kebonjati No. 28 RT 03/RW 01', 60),
  (4, '3272034406980004', 'Ny. Neni Triana', '3272030101900501', '1998-06-04', 20, '2026-06-01', '2027-03-08', 26.2, 'Normal', 'Risiko Rendah', 'Ade Koswara', '082198765432', '005', '001', 'Jl. Kebonjati No. 42 RT 05/RW 01', 40)
ON DUPLICATE KEY UPDATE `lila_cm` = VALUES(`lila_cm`), `status_kek` = VALUES(`status_kek`);

-- -----------------------------------------------------------------------
-- 6. POSYANDU PMT DISTRIBUSI (Pemberian Makanan Tambahan Balita & Bumil)
-- -----------------------------------------------------------------------
INSERT INTO `posyandu_pmt_distribusi` (`id`, `target_kategori`, `nama_penerima`, `nik_penerima`, `rt`, `rw`, `jenis_bantuan`, `jumlah_paket`, `tanggal_distribusi`, `petugas`, `catatan`) VALUES
  (1, 'BALITA_STUNTING', 'Asep Mulyana (Balita)', '3272035504230009', '001', '001', 'Paket Telur 1 Kg + Susu Pertumbuhan + Biskuit PMT', 2, '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Intervensi Khusus Balita BGM Posyandu Melati'),
  (2, 'IBU_HAMIL_KEK', 'Ny. Fitri Handayani', '3272034502970001', '001', '001', 'Paket PMT Ibu Hamil Tinggi Protein + Vitamin Mikronutrien', 1, '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Pemulihan Lingkar Lengan Atas (LiLA < 23.5 cm)'),
  (3, 'BALITA_STUNTING', 'Rizky Ramadhan', '3272031206230012', '002', '001', 'Paket Telur 1 Kg + Biskuit PMT', 1, '2026-10-15', 'Bdn. Imas Rohayati', 'Monitoring Kenaikan Berat Badan'),
  (4, 'BALITA_STUNTING', 'Asep Mulyana (Balita)', '3272035504230009', '001', '001', 'Paket Daging Ayam Segar + Telur + Susu', 2, '2026-11-10', 'Ny. Hj. Yayah Rokayah', 'Intervensi Bulan Ke-2: Menunjukkan Peningkatan Nafsu Makan'),
  (5, 'IBU_HAMIL_KEK', 'Ny. Dewi Sartika', '3272036211950003', '003', '001', 'Paket Susu Ibu Hamil Trimester 3 + Multivitamin', 1, '2026-11-10', 'Bdn. Imas Rohayati', 'Persiapan Persalinan Sehat Tanpa Stunting')
ON DUPLICATE KEY UPDATE `jenis_bantuan` = VALUES(`jenis_bantuan`);

-- -----------------------------------------------------------------------
-- 7. HUNIAN SEWA & KONTRAKAN WARGA
-- Menghidupkan KontrakanPage.jsx: Rasio Warga Tetap vs Kontrak
-- -----------------------------------------------------------------------
INSERT INTO `hunian_sewa` (`id`, `nama_hunian`, `nama_pemilik`, `nik_pemilik`, `alamat`, `rt`, `rw`, `jumlah_pintu`, `pintu_terisi`, `kisaran_tarif_bulanan`, `jenis_hunian`, `status_verifikasi`) VALUES
  (1, 'Kontrakan Barokah Gang Melati', 'H. M. Kosasih', '3272030101700001', 'Jl. Kebonjati Gang Melati No. 12', '001', '001', 6, 5, 550000.00, 'Kontrakan Petak', 'TERVERIFIKASI'),
  (2, 'Kos Mahasiswa & Karyawan Saluyu', 'Hendra Wijaya', '3272030101850017', 'Jl. Kebonjati No. 24', '002', '001', 8, 7, 450000.00, 'Kos-Kosan', 'TERVERIFIKASI'),
  (3, 'Rumah Kontrakan Paviliun Pak Dedi', 'Dedi Mulyadi', '3272030101830009', 'Jl. Kebonjati No. 35', '003', '001', 2, 2, 850000.00, 'Paviliun Rumah', 'TERVERIFIKASI'),
  (4, 'Kontrakan Pintu Seribu Pak RT', 'Budi Santoso', '3272030102850003', 'Jl. Kebonjati Gang Saluyu No. 08', '001', '001', 4, 3, 500000.00, 'Kontrakan Petak', 'TERVERIFIKASI')
ON DUPLICATE KEY UPDATE `pintu_terisi` = VALUES(`pintu_terisi`);

-- -----------------------------------------------------------------------
-- 8. ANALYTICS ACTION TRACKING (Log Keputusan Strategis Pimpinan)
-- Menghidupkan DashboardLurah.jsx & AnalyticsDashboardPage.jsx (Action Center)
-- -----------------------------------------------------------------------
INSERT INTO `analytics_action_tracking` (`id`, `category`, `wilayah_scope`, `rt`, `rw`, `action_title`, `action_detail`, `status`, `assigned_to_role`, `target_sla_days`, `created_by_user_id`) VALUES
  (1, 'HEALTH', 'RT 001 / RW 001', '001', '001', 'Penyaluran PMT Tambahan untuk Balita Kurang Gizi', 'Lurah menginstruksikan kader Posyandu Melati menyalurkan paket protein hewani tambahan bagi 2 balita terindikasi BGM.', 'IN_PROGRESS', 'kader_posyandu', 7, 4),
  (2, 'WELFARE', 'RW 001 Kebonjati', '001', '001', 'Verifikasi Lapangan Usulan Bansos 4 KK Desil 1', 'Ketua RW ditugaskan melakukan verifikasi faktual kelayakan usulan bansos pangan bagi KK Desil 1 yang belum terdaftar.', 'COMPLETED', 'ketua_rw', 5, 4),
  (3, 'EDUCATION', 'RW 001 Kebonjati', '002', '001', 'Advokasi Anak Usia Sekolah Terancam Putus Sekolah', 'Pendampingan siswa SMP berisiko ATS untuk pengajuan Beasiswa PIP / KJP tingkat Kelurahan.', 'IN_PROGRESS', 'ketua_rt', 14, 4),
  (4, 'INFRASTRUCTURE', 'RT 001 / RW 001', '001', '001', 'Perbaikan Saluran Drainase Rawan Luapan Banjir', 'Pengerahan tim satgas kelurahan untuk normalisasi saluran drainase batas RT 001 dan RT 002.', 'COMPLETED', 'admin_kelurahan', 3, 4)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- -----------------------------------------------------------------------
-- 9. BANSOS AUDIT SANGGAHAN (Partisipasi Transparan Warga & RT)
-- Menghidupkan BansosPage.jsx: Tab Sanggahan & Audit Kelayakan
-- -----------------------------------------------------------------------
INSERT INTO `bansos_audit_sanggahan` (`id`, `bansos_pengajuan_id`, `nik_pelapor`, `nama_pelapor`, `alasan_sanggahan`, `tipe_sanggahan`, `status_verifikasi_rt`, `catatan_rt`, `created_at`) VALUES
  (1, 1, '3272030101750002', 'Budi Santoso (Ketua RT 001)', 'Warga yang bersangkutan (Ujang Suherman) sangat layak menerima bansos PKH karena bekerja buruh serabutan dan menanggung 3 anak sekolah.', 'USULAN_KELAYAKAN', 'DISETUJUI', 'Telah diverifikasi langsung ke rumah warga oleh Ketua RT 001.', '2026-10-18 10:30:00'),
  (2, 2, '3272030101850017', 'Hendra Wijaya', 'Usulan bantuan modal usaha warung telah sesuai kriteria dan warung aktif melayani kebutuhan pangan murah warga.', 'USULAN_KELAYAKAN', 'DISETUJUI', 'Direkomendasikan mendapat bantuan etalase dan timbangan dagang.', '2026-10-22 14:15:00')
ON DUPLICATE KEY UPDATE `status_verifikasi_rt` = VALUES(`status_verifikasi_rt`);

SET FOREIGN_KEY_CHECKS = 1;
