-- =======================================================================
-- BUMI WARGA - MASTER COMPREHENSIVE VISUAL DATA SEEDER
-- Mengisi seluruh data input transaksi agar dashboard visual data di semua role
-- (Lurah, Camat, Walikota, Ketua RW, Ketua RT, Posyandu, Admin Kelurahan, Warga)
-- Tampil hidup, dinamis, memiliki grafik tren historis, dan analitik mendalam.
-- Lingkup: Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi
-- =======================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------
-- 1. POSYANDU BALITA: DATA LONGITUDINAL 4 BULAN (AGUSTUS - NOVEMBER 2026)
-- Menghidupkan PosyanduPage.jsx, Dashboard Posyandu, dan Analitik Stunting
-- Menampilkan tren kenaikan BB/TB, klaster status gizi (Normal, Stunting, Kurang, Lebih)
-- -----------------------------------------------------------------------
INSERT INTO `posyandu` (`id`, `nik_warga`, `nama_anak`, `tanggal_lahir_anak`, `jenis_kelamin_anak`, `umur_bulan`, `berat_badan_kg`, `tinggi_badan_cm`, `lingkar_kepala_cm`, `status_gizi`, `imunisasi`, `tanggal_pemeriksaan`, `petugas`, `catatan_kesehatan`) VALUES
  -- Bulan Agustus 2026 (Sesi 1)
  (101, '3272034506870006', 'Balita Faris', '2024-02-14', 'L', 30, 11.20, 86.5, 47.0, 'Normal', 'Lengkap (DPT-HB-Hib 3, Polio 4, Campak)', '2026-08-15', 'Ny. Hj. Yayah Rokayah', 'Tumbuh kembang optimal, nafsu makan baik, konsumsi vitamin A merah.'),
  (102, '3272034506920026', 'Balita Alif', '2024-03-10', 'L', 29, 9.80, 82.0, 45.5, 'Kurang', 'Lengkap', '2026-08-15', 'Ny. Hj. Yayah Rokayah', 'Berat badan di bawah garis merah (BGM), direkomendasikan paket PMT telur & susu.'),
  (103, '3272034506870046', 'Balita Aditya', '2024-01-20', 'L', 31, 9.50, 80.2, 45.0, 'Stunting', 'Lengkap', '2026-08-15', 'Bdn. Imas Rohayati', 'Tinggi badan di bawah -2 SD standar WHO, intervensi khusus gizi protein hewani 1000 HPK.'),
  (104, '3272034506920066', 'Balita Arkan', '2024-05-12', 'L', 27, 12.00, 88.0, 48.0, 'Normal', 'Lengkap', '2026-08-15', 'Ny. Hj. Yayah Rokayah', 'Pertumbuhan fisik sangat baik, aktif dan lincah.'),
  (105, '3272034506870086', 'Balita Fauzan', '2024-04-05', 'L', 28, 14.50, 87.0, 48.5, 'Lebih', 'Lengkap', '2026-08-15', 'Bdn. Imas Rohayati', 'Indeks massa tubuh di atas ambang +2 SD, edukasi variasi porsi makanan seimbang.'),
  (106, '3272034506920106', 'Balita Kayla', '2024-06-18', 'P', 26, 10.50, 84.0, 46.0, 'Normal', 'Lengkap', '2026-08-15', 'Ny. Hj. Yayah Rokayah', 'Tumbuh kembang sesuai kurva KMS.'),
  (107, '3272034506870126', 'Balita Zahra', '2024-07-22', 'P', 25, 9.20, 80.5, 45.0, 'Kurang', 'Lengkap', '2026-08-15', 'Bdn. Imas Rohayati', 'Nafsu makan menurun pasca batuk pilek, pendampingan kader posyandu.'),
  (108, '3272034506920146', 'Balita Danu', '2024-02-28', 'L', 30, 10.00, 81.5, 45.8, 'Stunting', 'Lengkap', '2026-08-15', 'Ny. Hj. Yayah Rokayah', 'TB di bawah batas normal usia 30 bulan, masuk daftar monitoring ketat Zero Stunting.'),

  -- Bulan September 2026 (Sesi 2 - Evaluasi Bulan Ke-2)
  (109, '3272034506870006', 'Balita Faris', '2024-02-14', 'L', 31, 11.50, 87.2, 47.2, 'Normal', 'Lengkap', '2026-09-15', 'Ny. Hj. Yayah Rokayah', 'BB naik 300 gram, tinggi bertambah 0.7 cm.'),
  (110, '3272034506920026', 'Balita Alif', '2024-03-10', 'L', 30, 10.20, 83.1, 46.0, 'Normal', 'Lengkap', '2026-09-15', 'Ny. Hj. Yayah Rokayah', 'Graduasi dari BGM ke status Normal pasca intervensi PMT hewani.'),
  (111, '3272034506870046', 'Balita Aditya', '2024-01-20', 'L', 32, 9.90, 81.4, 45.3, 'Stunting', 'Lengkap', '2026-09-15', 'Bdn. Imas Rohayati', 'Kenaikan TB +1.2 cm, tetap dilanjutkan PMT pemulihan bulan ke-2.'),
  (112, '3272034506920066', 'Balita Arkan', '2024-05-12', 'L', 28, 12.30, 88.8, 48.2, 'Normal', 'Lengkap', '2026-09-15', 'Ny. Hj. Yayah Rokayah', 'Tumbuh kembang stabil di garis hijau KMS.'),
  (113, '3272034506870086', 'Balita Fauzan', '2024-04-05', 'L', 29, 14.60, 87.8, 48.6, 'Lebih', 'Lengkap', '2026-09-15', 'Bdn. Imas Rohayati', 'Aktivitas fisik ditingkatkan, berat badan terkendali.'),
  (114, '3272034506920106', 'Balita Kayla', '2024-06-18', 'P', 27, 10.80, 84.8, 46.3, 'Normal', 'Lengkap', '2026-09-15', 'Ny. Hj. Yayah Rokayah', 'Kondisi kesehatan prima.'),
  (115, '3272034506870126', 'Balita Zahra', '2024-07-22', 'P', 26, 9.70, 81.6, 45.5, 'Normal', 'Lengkap', '2026-09-15', 'Bdn. Imas Rohayati', 'Nafsu makan kembali normal, BB naik 500 gram.'),
  (116, '3272034506920146', 'Balita Danu', '2024-02-28', 'L', 31, 10.30, 82.3, 46.0, 'Stunting', 'Lengkap', '2026-09-15', 'Ny. Hj. Yayah Rokayah', 'Progres positif, TB bertambah 0.8 cm.'),

  -- Bulan Oktober 2026 (Sesi 3 - Evaluasi Bulan Ke-3)
  (117, '3272034506870006', 'Balita Faris', '2024-02-14', 'L', 32, 11.80, 88.0, 47.5, 'Normal', 'Lengkap', '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Perkembangan motorik halus dan kasar sangat baik.'),
  (118, '3272034506920026', 'Balita Alif', '2024-03-10', 'L', 31, 10.50, 84.0, 46.2, 'Normal', 'Lengkap', '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Konsisten berada di jalur hijau.'),
  (119, '3272034506870046', 'Balita Aditya', '2024-01-20', 'L', 33, 10.20, 82.5, 45.6, 'Stunting', 'Lengkap', '2026-10-15', 'Bdn. Imas Rohayati', 'Respons intervensi nutrisi hewani membaik, TB meningkat total 2.3 cm.'),
  (120, '3272034506920066', 'Balita Arkan', '2024-05-12', 'L', 29, 12.60, 89.5, 48.5, 'Normal', 'Lengkap', '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Sehat dan ceria.'),
  (121, '3272034506870086', 'Balita Fauzan', '2024-04-05', 'L', 30, 14.70, 88.5, 48.8, 'Lebih', 'Lengkap', '2026-10-15', 'Bdn. Imas Rohayati', 'Pola makan seimbang berhasil diterapkan orang tua.'),
  (122, '3272034506920106', 'Balita Kayla', '2024-06-18', 'P', 28, 11.10, 85.5, 46.5, 'Normal', 'Lengkap', '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Sangat baik, berat badan sesuai usia.'),
  (123, '3272034506870126', 'Balita Zahra', '2024-07-22', 'P', 27, 10.00, 82.5, 45.8, 'Normal', 'Lengkap', '2026-10-15', 'Bdn. Imas Rohayati', 'KMS stabil di pita hijau.'),
  (124, '3272034506920146', 'Balita Danu', '2024-02-28', 'L', 32, 10.60, 83.2, 46.3, 'Stunting', 'Lengkap', '2026-10-15', 'Ny. Hj. Yayah Rokayah', 'Laju penambahan tinggi badan konsisten mendekati median.'),

  -- Bulan November 2026 (Sesi 4 - Data Terbaru Berjalan)
  (125, '3272034506870006', 'Balita Faris', '2024-02-14', 'L', 33, 12.00, 88.8, 47.7, 'Normal', 'Lengkap', '2026-11-12', 'Ny. Hj. Yayah Rokayah', 'Status gizi optimal menjelang usia 3 tahun.'),
  (126, '3272034506920026', 'Balita Alif', '2024-03-10', 'L', 32, 10.80, 84.8, 46.5, 'Normal', 'Lengkap', '2026-11-12', 'Ny. Hj. Yayah Rokayah', 'Pertumbuhan mantap di kategori Normal.'),
  (127, '3272034506870046', 'Balita Aditya', '2024-01-20', 'L', 34, 10.60, 83.6, 46.0, 'Normal', 'Lengkap', '2026-11-12', 'Bdn. Imas Rohayati', 'Lolos dari ambang stunting (TB/U mencapai -1.8 SD). Sukses Intervensi Zero Stunting!'),
  (128, '3272034506920066', 'Balita Arkan', '2024-05-12', 'L', 30, 12.90, 90.2, 48.7, 'Normal', 'Lengkap', '2026-11-12', 'Ny. Hj. Yayah Rokayah', 'Pertumbuhan sangat memuaskan.'),
  (129, '3272034506870086', 'Balita Fauzan', '2024-04-05', 'L', 31, 14.80, 89.2, 49.0, 'Normal', 'Lengkap', '2026-11-12', 'Bdn. Imas Rohayati', 'TB bertambah signifikan sehingga rasio BB/TB normal kembali.'),
  (130, '3272034506920106', 'Balita Kayla', '2024-06-18', 'P', 29, 11.40, 86.2, 46.8, 'Normal', 'Lengkap', '2026-11-12', 'Ny. Hj. Yayah Rokayah', 'Tumbuh kembang anak sangat baik.'),
  (131, '3272034506870126', 'Balita Zahra', '2024-07-22', 'P', 28, 10.30, 83.3, 46.0, 'Normal', 'Lengkap', '2026-11-12', 'Bdn. Imas Rohayati', 'Status gizi sehat dan cerdas.'),
  (132, '3272034506920146', 'Balita Danu', '2024-02-28', 'L', 33, 10.90, 84.1, 46.5, 'Stunting', 'Lengkap', '2026-11-12', 'Ny. Hj. Yayah Rokayah', 'Masih memerlukan intervensi telur & susu hingga evaluasi Desember 2026.')
ON DUPLICATE KEY UPDATE 
  `berat_badan_kg` = VALUES(`berat_badan_kg`),
  `tinggi_badan_cm` = VALUES(`tinggi_badan_cm`),
  `status_gizi` = VALUES(`status_gizi`),
  `catatan_kesehatan` = VALUES(`catatan_kesehatan`);

-- -----------------------------------------------------------------------
-- 2. POSYANDU LANSIA: SKRINING KESEHATAN GERIATRI TERPADU
-- Menghidupkan Tab Lansia di PosyanduPage.jsx & Radar Komorbid
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `posyandu_lansia_pemeriksaan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik` VARCHAR(16) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `rt` VARCHAR(5) NOT NULL,
  `rw` VARCHAR(5) NOT NULL,
  `tanggal_pemeriksaan` DATE NOT NULL,
  `tekanan_darah_sistol` INT NOT NULL,
  `tekanan_darah_diastol` INT NOT NULL,
  `gula_darah_sewaktu` INT NOT NULL,
  `kolesterol` INT NULL,
  `asam_urat` DECIMAL(4,1) NULL,
  `kategori_kemandirian` ENUM('Mandiri (A)', 'Ketergantungan Ringan (B)', 'Ketergantungan Sedang/Berat (C)') NOT NULL DEFAULT 'Mandiri (A)',
  `keluhan_utama` TEXT NULL,
  `diagnosa_risiko` VARCHAR(150) NULL,
  `petugas_pemeriksa` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_lansia_nik` (`nik`),
  INDEX `idx_lansia_rt_rw` (`rt`, `rw`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `posyandu_lansia_pemeriksaan` (`id`, `nik`, `nama`, `tanggal_lahir`, `jenis_kelamin`, `rt`, `rw`, `tanggal_pemeriksaan`, `tekanan_darah_sistol`, `tekanan_darah_diastol`, `gula_darah_sewaktu`, `kolesterol`, `asam_urat`, `kategori_kemandirian`, `keluhan_utama`, `diagnosa_risiko`, `petugas_pemeriksa`) VALUES
  (1, '3272031208550016', 'Mak Euis Komariah', '1955-08-12', 'P', '001', '001', '2026-11-08', 145, 90, 138, 225, 6.8, 'Mandiri (A)', 'Pegal linu pada persendian lutut di pagi hari.', 'Hipertensi Grade 1 & Hiperkolesterolemia Ringan', 'Bdn. Imas Rohayati'),
  (2, '3272031208530036', 'H. Anwar Sanusi', '1953-08-12', 'L', '002', '001', '2026-11-08', 130, 85, 110, 185, 5.4, 'Mandiri (A)', 'Kondisi fisik bugar, rutin jalan pagi santai.', 'Terkontrol / Normal Lansia Sehat', 'dr. Ratna Dewi, M.Kes'),
  (3, '3272031208550056', 'Mak Siti Fatimah', '1955-08-12', 'P', '003', '001', '2026-11-08', 150, 95, 165, 240, 7.2, 'Ketergantungan Ringan (B)', 'Sering pusing jika terlambat tidur, nyeri sendi.', 'Hipertensi Grade 2 & Hiperurisemia', 'Bdn. Imas Rohayati'),
  (4, '3272031208530076', 'Kakek Sukardi', '1953-08-12', 'L', '004', '001', '2026-11-08', 125, 80, 105, 175, 5.0, 'Mandiri (A)', 'Tidak ada keluhan berarti, penglihatan sedikit berkurang.', 'Lansia Sehat Prima', 'dr. Ratna Dewi, M.Kes'),
  (5, '3272031208550096', 'Mak Omoh Rohanah', '1955-08-12', 'P', '005', '001', '2026-11-08', 160, 95, 210, 255, 6.5, 'Ketergantungan Ringan (B)', 'Cepat lelah, sering haus malam hari, kebas di ujung kaki.', 'Diabetes Melitus Tipe 2 & Hipertensi Terkontrol', 'dr. Hendra Pratama')
ON DUPLICATE KEY UPDATE 
  `tekanan_darah_sistol` = VALUES(`tekanan_darah_sistol`),
  `gula_darah_sewaktu` = VALUES(`gula_darah_sewaktu`),
  `diagnosa_risiko` = VALUES(`diagnosa_risiko`);

-- -----------------------------------------------------------------------
-- 3. PBB (PAJAK BUMI DAN BANGUNAN): LENGKAP RT, RW, DAN VERIFIKASI LAPANGAN
-- Menghidupkan PBBPage.jsx, Dashboard RT, Dashboard RW, Dashboard Lurah
-- -----------------------------------------------------------------------
-- Pastikan kolom rt, rw, nama_wajib_pajak, alamat_objek_pajak, verifikasi_rt ada di pbb
ALTER TABLE `pbb` 
  ADD COLUMN IF NOT EXISTS `rt` VARCHAR(5) NULL,
  ADD COLUMN IF NOT EXISTS `rw` VARCHAR(5) NULL,
  ADD COLUMN IF NOT EXISTS `nama_wajib_pajak` VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS `alamat_objek_pajak` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `verifikasi_rt` VARCHAR(50) DEFAULT 'BELUM_VERIFIKASI',
  ADD COLUMN IF NOT EXISTS `catatan_verifikasi_rt` TEXT NULL;

-- Perbarui data PBB Kebonjati dengan RT dan status verifikasi lapangan
UPDATE `pbb` SET `rt` = '001', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Budi Santoso', `alamat_objek_pajak` = 'Jl. Kebonjati Gang Saluyu No. 04' WHERE `id` = 2 OR `id` = 3;
UPDATE `pbb` SET `rt` = '001', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Asep Saepulloh', `alamat_objek_pajak` = 'Jl. Kebonjati Gang Saluyu No. 06' WHERE `id` = 4 OR `id` = 5;
UPDATE `pbb` SET `rt` = '001', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Dedi Mulyadi', `alamat_objek_pajak` = 'Jl. Kebonjati Gang Melati No. 08' WHERE `id` = 6 OR `id` = 7;
UPDATE `pbb` SET `rt` = '001', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Ahmad Fauzi', `alamat_objek_pajak` = 'Jl. Kebonjati Gang Melati No. 10' WHERE `id` = 8 OR `id` = 9;
UPDATE `pbb` SET `rt` = '001', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Hendra Gunawan', `alamat_objek_pajak` = 'Jl. Kebonjati Gang Melati No. 12' WHERE `id` = 10 OR `id` = 11;

UPDATE `pbb` SET `rt` = '002', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Tatang Sutisna', `alamat_objek_pajak` = 'Jl. Kebonjati Barat No. 15' WHERE `id` = 12 OR `id` = 13;
UPDATE `pbb` SET `rt` = '002', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Cecep Supriatna', `alamat_objek_pajak` = 'Jl. Kebonjati Barat No. 17' WHERE `id` = 14 OR `id` = 15;
UPDATE `pbb` SET `rt` = '002', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Wawan Setiawan', `alamat_objek_pajak` = 'Jl. Kebonjati Barat No. 19' WHERE `id` = 16 OR `id` = 17;
UPDATE `pbb` SET `rt` = '002', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Agus Pratama', `alamat_objek_pajak` = 'Jl. Kebonjati Barat No. 21' WHERE `id` = 18 OR `id` = 19;
UPDATE `pbb` SET `rt` = '002', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Ujang Suherman', `alamat_objek_pajak` = 'Jl. Kebonjati Barat No. 23' WHERE `id` = 20 OR `id` = 21;

UPDATE `pbb` SET `rt` = '003', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Dadang Hidayat', `alamat_objek_pajak` = 'Jl. Kebonjati Timur No. 01' WHERE `id` = 22 OR `id` = 23;
UPDATE `pbb` SET `rt` = '003', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Yudi Permana', `alamat_objek_pajak` = 'Jl. Kebonjati Timur No. 03' WHERE `id` = 24 OR `id` = 25;
UPDATE `pbb` SET `rt` = '003', `rw` = '001', `verifikasi_rt` = 'VALID', `nama_wajib_pajak` = 'Iwan Ridwan', `alamat_objek_pajak` = 'Jl. Kebonjati Timur No. 05' WHERE `id` = 26 OR `id` = 27;

-- -----------------------------------------------------------------------
-- 4. PENGADUAN WARGA: VARIASI KATEGORI, STATUS, DAN SLA PENANGANAN
-- Menghidupkan PengaduanPage.jsx, Widget Aduan di Dashboard RT/RW/Lurah
-- -----------------------------------------------------------------------
INSERT INTO `pengaduan` (`id`, `nik_pelapor`, `judul`, `deskripsi`, `kategori`, `status`, `catatan_admin`, `resolved_at`) VALUES
  (101, '3272030103810001', 'Perbaikan Lampu LED Penerangan Jalan Gang Saluyu RT 001', 'Dua unit lampu PJU mati menyebabkan gang gelap saat malam hari.', 'Infrastruktur', 'RESOLVED', 'Petugas Linmas dan Ketua RT 001 telah mengganti lampu LED 40W baru.', '2026-11-05 14:30:00'),
  (102, '3272030103820005', 'Penumpukan Sampah Liar Dekat Batas Rel Kereta Api', 'Ada pihak luar yang membuang karung sampah di lahan kosong perbatasan RT 001 dan RT 002.', 'Lingkungan', 'RESOLVED', 'Kerja bakti pembersihan telah dilaksanakan bersama Dinas Lingkungan Hidup.', '2026-11-08 11:00:00'),
  (103, '3272030103860021', 'Genangan Air Akibat Drainase Tersumbat Sampah Plastik', 'Air meluap ke badan jalan saat hujan deras kemarin sore di Gang Saluyu RT 002.', 'Infrastruktur', 'PROCESSING', 'Telah dijadwalkan pengerukan sedimen lumpur drainase oleh tim Satgas Kelurahan.', NULL),
  (104, '3272030103910041', 'Permohonan Pengasapan / Fogging Nyamuk DBD', 'Ditemukan jentik nyamuk di beberapa bak penampungan air warga RT 003.', 'Lingkungan', 'RESOLVED', 'Puskesmas Pembantu Kebonjati telah melaksanakan fogging massal serentak.', '2026-11-06 09:30:00'),
  (105, '3272030103850017', 'Pengaduan Parkir Liar Menghalangi Akses Ambulans', 'Mobil bongkar muat parkir paralel di mulut gang sempit RT 001.', 'Keamanan', 'RESOLVED', 'Ketua RT 001 dan Babinsa telah menegur pemilik kendaraan dan memasang rambu larangan.', '2026-11-04 16:20:00'),
  (106, '3272030103830009', 'Laporan Pohon Rimbun Mengenai Kabel Listrik PLN', 'Dahan pohon mangga tua di depan musholla sudah melilit kabel tegangan rendah.', 'Infrastruktur', 'PENDING', 'Sedang menunggu koordinasi tim perompesan pohon dari Dinas Pertamanan & PLN.', NULL)
ON DUPLICATE KEY UPDATE 
  `judul` = VALUES(`judul`),
  `deskripsi` = VALUES(`deskripsi`),
  `status` = VALUES(`status`),
  `catatan_admin` = VALUES(`catatan_admin`),
  `resolved_at` = VALUES(`resolved_at`);

-- -----------------------------------------------------------------------
-- 5. DOKUMEN REQUEST: ALUR LENGKAP PELAYANAN SURAT (PATEN)
-- Meliputi status READY_TTE (Menunggu TTE Lurah), APPROVED (Disetujui & Siap Unduh)
-- Lengkap dengan nomor surat resmi standar Jawa Barat / Kemendagri
-- -----------------------------------------------------------------------
INSERT INTO `dokumen_request` (
  `id`, `nomor_registrasi`, `nik_pemohon`, `diajukan_oleh_nik`, `nama_subjek`, `hubungan_keluarga`, 
  `jenis_surat`, `jenis_dokumen`, `keperluan`, `status`, `approval_step`, `rt`, `rw`, 
  `catatan_petugas`, `approved_by_rt`, `approved_by_rw`, `approved_by_kelurahan`, `created_at`
) VALUES
  -- 1. Surat Siap TTE oleh Lurah (Status: READY_TTE)
  (101, 'SKTM/2026/11/0101', '3272030103810001', '3272030103810001', 'Budi Santoso', 'Kepala Keluarga', 
   'Surat Keterangan Tidak Mampu (SKTM)', 'SKTM', 'Persyaratan keringanan biaya rumah sakit RSUD R. Syamsudin, SH.', 
   'READY_TTE', 'LURAH', '001', '001', 
   'Data desil kemiskinan ekstrem DTSEN Desil 1 terkonfirmasi valid oleh Admin Kelurahan.', 21, 6, NULL, '2026-11-14 08:30:00'),

  (102, 'DOM/2026/11/0102', '3272030103850017', '3272030103850017', 'Hendra Gunawan', 'Kepala Keluarga', 
   'Surat Keterangan Domisili Usaha', 'DOMISILI', 'Persyaratan pembukaan rekening bank operasional UMKM.', 
   'READY_TTE', 'LURAH', '001', '001', 
   'Usaha mikro kuliner aktif dan alamat tempat usaha telah diverifikasi lapangan.', 21, 6, NULL, '2026-11-14 09:15:00'),

  -- 2. Surat yang Sudah Disahkan Lurah (Status: APPROVED / COMPLETED)
  (103, 'SKTM/2026/11/0099', '3272030103900037', '3272030103900037', 'Ujang Suherman', 'Kepala Keluarga', 
   'Surat Keterangan Tidak Mampu (SKTM)', 'SKTM', 'Pengajuan Beasiswa Program Indonesia Pintar (PIP) tingkat SMA.', 
   'APPROVED', 'COMPLETED', '002', '001', 
   'TTE Lurah terverifikasi BSrE BSSN. Dokumen resmi dapat diunduh.', 22, 6, 4, '2026-11-12 10:00:00'),

  (104, 'KEM/2026/11/0088', '3272030103860021', '3272030103860021', 'Tatang Sutisna', 'Kepala Keluarga', 
   'Surat Keterangan Kematian', 'KEMATIAN', 'Pelaporan resmi kematian warga alm. Kakek Sukardi untuk pengurusan akta kematian Disdukcapil.', 
   'APPROVED', 'COMPLETED', '002', '001', 
   'Surat pengantar RT dan surat keterangan dokter puskesmas lengkap. Disahkan Lurah.', 22, 6, 4, '2026-11-05 13:45:00'),

  (105, 'NIK/2026/11/0077', '3272031505090003', '3272030103810001', 'Aisyah Putri', 'Anak', 
   'Surat Pengantar Nikah (N1-N4)', 'PENGANTAR_NIKAH', 'Pendaftaran pernikahan di Kantor Urusan Agama (KUA) Cikole.', 
   'APPROVED', 'COMPLETED', '001', '001', 
   'Berkas KTP, KK, akta kelahiran, dan surat persetujuan orang tua telah lengkap diverifikasi.', 21, 6, 4, '2026-11-01 11:20:00'),

  -- 3. Surat Menunggu Verifikasi RT (Status: SUBMITTED)
  (106, 'SKU/2026/11/0105', '3272030103860021', '3272030103860021', 'Cecep Supriatna', 'Kepala Keluarga', 
   'Surat Keterangan Usaha (SKU)', 'SKU', 'Pengajuan tambahan modal usaha Kredit Usaha Rakyat (KUR) Bank BJB.', 
   'SUBMITTED', 'RT', '002', '001', 
   'Permohonan baru masuk dari aplikasi mandiri warga.', NULL, NULL, NULL, '2026-11-15 14:10:00')
ON DUPLICATE KEY UPDATE 
  `status` = VALUES(`status`),
  `approval_step` = VALUES(`approval_step`),
  `catatan_petugas` = VALUES(`catatan_petugas`),
  `approved_by_kelurahan` = VALUES(`approved_by_kelurahan`);

-- -----------------------------------------------------------------------
-- 6. KEUANGAN KAS: TAMBAHAN DATA BULAN AGUSTUS & SEPTEMBER 2026
-- Memastikan grafik tren 4 bulan (Agustus, September, Oktober, November)
-- di Pusat Analitik & Keuangan tampil berundak dan dinamis
-- -----------------------------------------------------------------------
INSERT INTO `keuangan_kas` (`id`, `nomor_transaksi`, `tipe`, `kategori`, `nominal`, `keterangan`, `tanggal_transaksi`, `tingkat_wilayah`, `rt`, `rw`, `dicatat_oleh_user_id`, `identitas_pembayar`) VALUES
  (21, 'KAS-RT001-20260801-0801', 'MASUK', 'Iuran Warga', 1200000.00, 'Penerimaan Iuran Warga RT 001 Periode Agustus 2026 (48 KK Lunas)', '2026-08-01', 'RT', '001', '001', 4, 'Warga RT 001 (Kolektif)'),
  (22, 'KAS-RT001-20260817-0802', 'KELUAR', 'Kegiatan Warga', 950000.00, 'Peringatan HUT RI ke-81 dan Lomba Lingkungan RT 001', '2026-08-17', 'RT', '001', '001', 4, NULL),
  (23, 'KAS-RT001-20260901-0901', 'MASUK', 'Iuran Warga', 1250000.00, 'Penerimaan Iuran Warga RT 001 Periode September 2026 (50 KK Lunas)', '2026-09-01', 'RT', '001', '001', 4, 'Warga RT 001 (Kolektif)'),
  (24, 'KAS-RT001-20260910-0902', 'KELUAR', 'Operasional & Kebersihan', 350000.00, 'Honor Petugas Pengangkut Sampah & Kebersihan Lingkungan September', '2026-09-10', 'RT', '001', '001', 4, NULL),
  (25, 'KAS-RT001-20260925-0903', 'KELUAR', 'Pemeliharaan Fasum', 180000.00, 'Perbaikan Kunci Pos Kamling & Pembelian Senter Ronda', '2026-09-25', 'RT', '001', '001', 4, NULL)
ON DUPLICATE KEY UPDATE 
  `nominal` = VALUES(`nominal`), 
  `keterangan` = VALUES(`keterangan`);

SET FOREIGN_KEY_CHECKS = 1;
