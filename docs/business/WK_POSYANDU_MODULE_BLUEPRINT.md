**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL POSYANDU (POSYANDU MODULE BLUEPRINT)**

---

## Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-014` |
| **Nama Dokumen** | Cetak Biru Modul Posyandu |
| **Versi** | 1.0 |
| **Status** | `DRAFT` |
| **Pemilik** | Enterprise Business Analyst |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee |

---

## 1. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul Posyandu (Posyandu Module)**, komponen vital dalam platform WK Community OS yang berfokus pada digitalisasi layanan Pos Pelayanan Terpadu. Modul ini dirancang untuk menjadi alat kerja utama bagi Kader Posyandu dalam memantau, mencatat, dan mengelola data kesehatan kelompok rentan: **Balita, Ibu Hamil, dan Lansia**.

Tujuan utama modul ini adalah untuk mentransformasi pencatatan manual di buku Kartu Menuju Sehat (KMS) menjadi sistem digital yang terintegrasi. Dengan fitur pelacakan gizi, pemantauan stunting, jadwal imunisasi, dan pengingat otomatis, modul ini akan meningkatkan efisiensi kerja kader, meningkatkan akurasi data, dan memungkinkan deteksi dini risiko kesehatan. Data yang dihasilkan akan menjadi input krusial bagi **Community Health Score**, memberikan gambaran nyata kondisi kesehatan masyarakat di **Kelurahan Kebonjati** dan wilayah lainnya.

## 2. Fokus Layanan

Modul Posyandu akan melayani tiga kelompok utama:

| Kelompok | Fokus Layanan |
| :--- | :--- |
| **Balita** | Pemantauan tumbuh kembang (berat badan, tinggi badan), status gizi, deteksi dini stunting, dan pelacakan jadwal imunisasi. |
| **Ibu Hamil** | Pemantauan kesehatan selama kehamilan (berat badan, lingkar lengan atas), deteksi risiko tinggi, dan edukasi. |
| **Lansia** | Skrining kesehatan dasar (tekanan darah, gula darah), pemantauan penyakit kronis, dan kegiatan senam/edukasi. |

## 3. Workflow (Alur Kerja Kunjungan Posyandu)

Alur kerja ini menggambarkan proses standar saat seorang peserta (Balita/Ibu Hamil/Lansia) melakukan kunjungan ke Posyandu.

```ascii
  (*)
   |
   v
[Peserta datang dan melakukan pendaftaran]
   |
   v
[Kader mencari data peserta berdasarkan Nama/ID di sistem]
   |
   v
<Sistem>
[Menampilkan profil dan riwayat kunjungan peserta]
   |
   v
[Kader melakukan pengukuran (Berat, Tinggi, Tensi, dll.)]
   |
   v
[Kader menginput data pengukuran ke dalam form kunjungan]
   |
   v
<Sistem>
[1. Validasi data input]
[2. Simpan data kunjungan baru]
[3. Hitung status gizi/stunting (untuk Balita) secara otomatis]
[4. Perbarui jadwal imunisasi/kunjungan berikutnya]
   |
   v
<Rule Engine>
[Mengevaluasi data baru terhadap aturan kesehatan]
   |
   +-----> [Terdeteksi Risiko (e.g., BB tidak naik)] -----> [Buat Notifikasi/Alert untuk Bidan/Puskesmas]
   |
   v (Data Normal)
[Kader memberikan penyuluhan/PMT]
   |
   v
[Kunjungan Selesai]
   |
   v
  (X)
```

## 4. Manajemen Peserta

### 4.1. Balita
- **Data Kunci:** Nama, Tanggal Lahir, Nama Orang Tua, Riwayat Imunisasi, Riwayat Pengukuran (Tanggal, BB, TB, Lingkar Kepala).
- **Fitur:** Grafik tumbuh kembang (Kurva KMS/Z-Score WHO), status gizi otomatis (Gizi Baik, Kurang, Buruk), status stunting otomatis.

### 4.2. Ibu Hamil
- **Data Kunci:** Nama, HPHT (Hari Pertama Haid Terakhir), Taksiran Persalinan, Riwayat Pengukuran (Tanggal, BB, Lingkar Lengan Atas - LILA, Tensi).
- **Fitur:** Deteksi otomatis kehamilan risiko tinggi (berdasarkan usia, riwayat, atau hasil pengukuran LILA/Tensi).

### 4.3. Lansia
- **Data Kunci:** Nama, Usia, Riwayat Penyakit Kronis, Riwayat Pengukuran (Tanggal, Tensi, Gula Darah, Kolesterol).
- **Fitur:** Grafik tren tekanan darah/gula darah, penandaan lansia dengan penyakit kronis.

## 5. Manajemen Imunisasi

- **Jadwal Otomatis:** Saat balita baru didaftarkan, sistem akan secara otomatis menghasilkan jadwal imunisasi dasar lengkap (BCG, DPT, Polio, Campak, dll.) berdasarkan tanggal lahirnya.
- **Pelacakan Status:** Setiap imunisasi yang diberikan akan dicatat tanggal dan jenis vaksinnya. Status imunisasi balita akan diperbarui secara otomatis (e.g., "Imunisasi Dasar Lengkap", "Tidak Lengkap").
- **Reminder:** Sistem akan mengirimkan pengingat kepada orang tua dan kader Posyandu beberapa hari sebelum jadwal imunisasi berikutnya.

## 6. Manajemen Gizi dan Stunting

- **Perhitungan Otomatis:** Setiap kali data berat dan tinggi badan balita diinput, sistem akan langsung menghitung dan menampilkan status gizi berdasarkan standar Z-Score WHO (BB/U, TB/U, BB/TB).
- **Deteksi Stunting:** Sistem akan secara otomatis menandai balita yang terdeteksi "Stunting" atau "Sangat Pendek" berdasarkan indeks Panjang Badan atau Tinggi Badan menurut Umur (PB/U atau TB/U).
- **Flagging Risiko:** Sistem akan memberikan tanda (bendera merah) pada balita yang berat badannya tidak naik selama 2 atau 3 bulan berturut-turut, sebagai sinyal risiko gizi buruk bagi kader.

## 7. Dashboard (Dasbor Kesehatan Komunitas)

Modul Posyandu akan menjadi sumber data utama untuk Dasbor Kesehatan.
- **Scorecard:** % Cakupan Imunisasi Dasar Lengkap, Prevalensi Stunting (%), Jumlah Kunjungan Posyandu Bulan Ini.
- **Grafik Batang:** Jumlah Balita per Status Gizi (Baik, Kurang, Buruk, Lebih).
- **Peta (Heatmap):** Peta persebaran kasus stunting atau gizi buruk per RW/RT.
- **Tabel:** Daftar Balita yang "drop-out" atau tidak pernah datang ke Posyandu dalam 3 bulan terakhir.
- **KPI:** Tingkat Partisipasi Kehadiran Balita di Posyandu (D/S).

## 8. Notification & Reminder Engine

| Pemicu | Target Notifikasi | Kanal | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| 3 hari sebelum jadwal imunisasi | Orang Tua Balita | SMS / WA | "Pengingat: Ananda [Nama Balita] memiliki jadwal imunisasi [Jenis Vaksin] pada [Tanggal]. Mohon datang ke Posyandu." |
| 1 hari sebelum jadwal Posyandu | Seluruh Warga Sasaran | WA Blast (Grup) | "Jangan lupa, kegiatan Posyandu akan dilaksanakan besok, [Tanggal], pukul 09:00 di [Lokasi]." |
| Terdeteksi risiko stunting | Bidan Desa / Puskesmas | Email / App | "Peringatan: Terdeteksi risiko stunting pada balita [Nama Balita] di [Alamat]. Mohon segera ditindaklanjuti." |
| Balita tidak hadir 3x berturut-turut | Kader Posyandu | App | "Perhatian: Balita [Nama Balita] sudah tidak hadir 3 kali. Mohon lakukan kunjungan rumah." |

## 9. Rule Engine Integration

*Rule Engine* akan digunakan untuk otomatisasi deteksi risiko dan klasifikasi.
- **Aturan Risiko Gizi:** `IF (balita.berat_badan.tren == 'datar' && balita.kunjungan_terakhir > 60 hari) THEN balita.setStatus('Risiko Tinggi Gizi Buruk')`
- **Aturan Risiko Ibu Hamil:** `IF (ibu_hamil.lila < 23.5 || ibu_hamil.tensi > '140/90') THEN ibu_hamil.setStatus('Kehamilan Risiko Tinggi')`
- **Aturan Kelengkapan Imunisasi:** `IF (balita.usia > 12 bulan && balita.imunisasi.campak == false) THEN balita.imunisasi_status = 'Tidak Lengkap'`

## 10. Community Health Score Integration

Data dari Modul Posyandu adalah input paling krusial untuk **Health Score** dalam *Community Score*.
- **Metrik Utama:**
    - **Prevalensi Stunting (%):** Semakin rendah, semakin tinggi skornya.
    - **Cakupan Imunisasi Dasar Lengkap (%):** Semakin tinggi, semakin tinggi skornya.
    - **Tingkat Partisipasi Posyandu (D/S %):** Semakin tinggi, semakin tinggi skornya.
    - **Prevalensi Ibu Hamil Risiko Tinggi (%):** Semakin rendah, semakin tinggi skornya.

## 11. Future AI Integration

- **Prediksi Risiko Stunting:** AI dapat menganalisis kombinasi faktor (riwayat berat badan lahir, status ekonomi keluarga, riwayat kesehatan ibu) untuk memprediksi balita mana yang memiliki probabilitas tertinggi mengalami stunting di masa depan, memungkinkan intervensi lebih dini.
- **Rekomendasi Intervensi Gizi:** Berdasarkan data status gizi, AI dapat merekomendasikan jenis Pemberian Makanan Tambahan (PMT) yang paling sesuai untuk suatu wilayah.
- **Analisis Pola Penyakit:** AI dapat menganalisis data kesehatan lansia untuk mendeteksi pola atau klaster penyakit kronis (misalnya, hipertensi) di area geografis tertentu.
- **Chatbot Edukasi:** Sebuah chatbot AI dapat menjawab pertanyaan-pertanyaan umum dari para ibu mengenai jadwal imunisasi, gizi, dan tumbuh kembang anak.

## 12. Testing Scenario

| ID | Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| TS-POS-01 | Kader berhasil mendaftarkan balita baru. | Data balita tersimpan. Jadwal imunisasi otomatis ter-generate. |
| TS-POS-02 | Kader menginput data penimbangan balita. Berat badan naik sesuai kurva. | Data kunjungan tersimpan. Status gizi "Baik". Grafik tumbuh kembang diperbarui. |
| TS-POS-03 | Kader menginput data penimbangan balita. Berat badan tidak naik selama 3 bulan. | Data tersimpan. Sistem memberikan flag "Risiko Gizi Buruk". Notifikasi terkirim ke Bidan Desa. |
| TS-POS-04 | Kader mencatat imunisasi DPT-3 untuk seorang balita. | Riwayat imunisasi balita diperbarui. Jadwal imunisasi berikutnya (Campak) ditampilkan. |
| TS-POS-05 | Sistem berjalan pada H-3 dari jadwal imunisasi seorang balita. | Notifikasi pengingat terkirim secara otomatis ke orang tua balita. |
| TS-POS-06 | Pengguna (Lurah) membuka dasbor kesehatan. | Semua KPI (Prevalensi Stunting, Cakupan Imunisasi) ditampilkan dengan data yang akurat dan terbaru. |

## 13. Acceptance Criteria

- Sistem mampu mengelola data peserta Posyandu (Balita, Ibu Hamil, Lansia) beserta riwayat kunjungannya.
- Sistem mampu secara otomatis menghitung status gizi dan stunting berdasarkan standar WHO.
- Sistem mampu secara otomatis menghasilkan dan melacak jadwal imunisasi.
- Fitur pengingat (reminder) untuk jadwal Posyandu dan imunisasi berfungsi sesuai harapan.
- Aturan bisnis untuk deteksi risiko (gizi buruk, kehamilan risti) diimplementasikan dan terbukti memicu notifikasi yang benar.
- Dasbor Kesehatan Komunitas menampilkan data agregat dari modul ini secara akurat.
- Semua skenario pengujian (Testing Scenario) berhasil dijalankan tanpa error kritis.