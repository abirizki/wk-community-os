**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL ADUAN (COMPLAINT MODULE BLUEPRINT)**

---

## Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-012` |
| **Nama Dokumen** | Cetak Biru Modul Aduan |
| **Versi** | 1.0 |
| **Status** | `DRAFT` |
| **Pemilik** | Enterprise Business Analyst |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee |

---

## 1. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul Aduan (Complaint Module)**, komponen yang dirancang untuk menjadi kanal utama partisipasi warga dalam pengawasan dan perbaikan layanan serta infrastruktur publik di platform WK Community OS. Modul ini memfasilitasi proses pelaporan, pelacakan, dan penyelesaian aduan dari masyarakat secara transparan dan terstruktur.

Tujuan utama modul ini adalah mengubah penanganan aduan dari proses yang reaktif dan tidak terukur menjadi sistem yang proaktif, responsif, dan berbasis data. Dengan mengimplementasikan alur kerja yang jelas, Service Level Agreement (SLA), dan sistem notifikasi otomatis, modul ini akan meningkatkan kepercayaan publik dan memberikan data berharga bagi pimpinan di **Kelurahan Kebonjati** untuk mengidentifikasi masalah-masalah prioritas di lingkungannya.

## 2. Kategori Aduan

Untuk memastikan perutean dan penanganan yang tepat, setiap aduan akan diklasifikasikan ke dalam kategori-kategori berikut:

| Kode Kategori | Nama Kategori | Deskripsi | Contoh Aduan |
| :--- | :--- | :--- | :--- |
| **INFRA** | Infrastruktur | Kerusakan atau masalah terkait fasilitas fisik publik. | Jalan berlubang, jembatan retak. |
| **LING** | Lingkungan | Masalah terkait kebersihan, keindahan, dan kesehatan lingkungan. | Tumpukan sampah liar, polusi suara. |
| **SOS** | Sosial | Masalah sosial kemasyarakatan yang memerlukan intervensi. | Gelandangan, konflik antar warga. |
| **AMAN** | Keamanan | Gangguan keamanan dan ketertiban masyarakat (kamtibmas). | Aksi premanisme, balap liar. |
| **PJU** | Penerangan Jalan | Masalah terkait lampu penerangan jalan umum. | Lampu PJU mati, pemasangan baru. |
| **DRAIN** | Drainase | Masalah terkait saluran air dan gorong-gorong. | Drainase tersumbat, banjir lokal. |
| **SAMPAH** | Persampahan | Masalah terkait layanan pengangkutan sampah. | Jadwal angkut tidak teratur, TPS liar. |

## 3. Workflow (Alur Kerja)

Alur kerja penanganan aduan dirancang untuk memastikan setiap laporan diterima, diverifikasi, dan ditindaklanjuti oleh pihak yang berwenang.

```ascii
  (*)
   |
   v
[Warga Membuat Aduan via Portal]
   |
   v
<Sistem>
[Status: Baru]
   |
   v
[Aparat Kelurahan melakukan verifikasi validitas & kelengkapan aduan]
   |
   +-----> [Tolak/Tidak Valid] -----> (X)
   |
   v (Valid)
<Sistem>
[Status: Diverifikasi, Menunggu Penugasan]
[Sistem menentukan Prioritas & SLA berdasarkan Kategori & Aturan]
   |
   v
[Aparat Kelurahan meneruskan (route) aduan ke Dinas/Petugas Terkait]
   |
   v
<Sistem>
[Status: Dalam Pengerjaan]
   |
   v
[Dinas/Petugas Terkait melakukan penanganan di lapangan]
   |
   v
[Dinas/Petugas Terkait melaporkan hasil pengerjaan (beserta bukti foto)]
   |
   v
<Sistem>
[Status: Menunggu Konfirmasi Pelapor]
   |
   v
[Warga Pelapor memberikan konfirmasi (Setuju/Tidak Setuju)]
   |
   +-----> [Tidak Setuju] -----> [Status: Dibuka Kembali] -> [Dalam Pengerjaan]
   |
   v (Setuju atau tidak ada respons > 7 hari)
<Sistem>
[Status: Selesai]
   |
   v
  (X)
```

## 4. Prioritas, Status, dan SLA

### 4.1. Prioritas

| Level | Kriteria (Contoh) |
| :--- | :--- |
| **Tinggi** | - Berpotensi membahayakan keselamatan jiwa (e.g., kabel listrik putus).<br>- Mengganggu hajat hidup orang banyak (e.g., pipa air utama pecah). |
| **Sedang** | - Mengganggu kenyamanan publik secara signifikan (e.g., jalan utama berlubang).<br>- Berpotensi menimbulkan masalah kesehatan (e.g., tumpukan sampah besar). |
| **Rendah** | - Gangguan minor yang tidak mendesak (e.g., lampu taman mati).<br>- Aduan bersifat permintaan/saran. |

### 4.2. Status

`Baru`, `Diverifikasi`, `Dalam Pengerjaan`, `Menunggu Konfirmasi Pelapor`, `Selesai`, `Ditolak`, `Dibuka Kembali`.

### 4.3. Service Level Agreement (SLA)

| Prioritas | Waktu Respons Awal | Target Waktu Penyelesaian |
| :--- | :--- | :--- |
| **Tinggi** | < 4 Jam Kerja | 1 - 3 Hari Kerja |
| **Sedang** | < 8 Jam Kerja | 3 - 7 Hari Kerja |
| **Rendah** | < 24 Jam Kerja | 7 - 14 Hari Kerja |

## 5. Dashboard (Dasbor)

Modul Aduan akan menjadi sumber data utama untuk Dasbor Kinerja Layanan Publik.
- **Scorecard:** Total Aduan Masuk, % Aduan Selesai, % Aduan Melebihi SLA.
- **Grafik Batang:** Jumlah Aduan per Kategori.
- **Peta (Heatmap):** Peta persebaran titik aduan, menunjukkan area dengan masalah terbanyak.
- **Tabel:** Daftar Aduan dengan Prioritas Tinggi yang Belum Selesai.
- **KPI:** Rata-rata Waktu Penyelesaian Aduan (per kategori).

## 6. Notification (Notifikasi)

| Pemicu | Target Notifikasi | Kanal | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| Aduan baru masuk | Aparat Kelurahan (Piket) | Email / App | "Aduan baru kategori [Kategori] telah masuk dari [Nama Warga]." |
| Aduan diteruskan | Dinas/Petugas Terkait | Email / App | "Anda mendapatkan tugas baru untuk menangani aduan #[ID Aduan] tentang [Judul Aduan]." |
| Status berubah | Warga Pelapor | Email | "Status aduan Anda #[ID Aduan] telah diperbarui menjadi: [Status Baru]." |
| Mendekati SLA | Petugas Penanggung Jawab | Email / App | "Peringatan: Aduan #[ID Aduan] akan melewati batas SLA dalam 24 jam." |
| Aduan selesai | Warga Pelapor | Email | "Aduan Anda telah ditangani. Mohon berikan konfirmasi penyelesaian." |

## 7. Rule Engine Integration

*Rule Engine* akan mengotomatiskan proses awal penanganan aduan.
- **Aturan Prioritas Otomatis:** `IF (aduan.kategori == 'PJU' && aduan.deskripsi.includes('kabel putus')) THEN aduan.setPrioritas('Tinggi')`
- **Aturan Perutean Otomatis:** `IF (aduan.kategori == 'SAMPAH') THEN aduan.routeTo('Dinas Lingkungan Hidup')`
- **Aturan Eskalasi Otomatis:** `IF (aduan.status == 'Diverifikasi' && aduan.last_update > 48 jam) THEN escalateTo('Lurah')`

## 8. Community Score Integration

Data dari Modul Aduan akan memberikan pengaruh signifikan pada beberapa sub-indeks *Community Score*.
- **Governance Score:** Sangat dipengaruhi oleh KPI `% Aduan Selesai Tepat Waktu` dan `Rata-rata Waktu Penyelesaian`. Semakin baik penanganan aduan, semakin tinggi skor tata kelola.
- **Infrastructure Score:** Jumlah aduan yang tinggi pada kategori `INFRA`, `PJU`, dan `DRAIN` di suatu wilayah akan menjadi faktor penurun skor infrastruktur wilayah tersebut, mengindikasikan perlunya perbaikan.
- **Participation Score:** Jumlah aduan yang masuk dapat menjadi salah satu indikator positif dari tingkat kepedulian dan partisipasi warga.

## 9. AI Recommendation (Future)

Di masa depan, AI akan meningkatkan kecerdasan modul ini.
- **Klasifikasi Otomatis:** AI akan secara otomatis membaca deskripsi aduan dan menentukan kategori serta prioritasnya dengan akurasi tinggi, mengurangi pekerjaan verifikasi manual.
- **Prediksi Hotspot:** Dengan menganalisis data historis dan spasial, AI dapat memprediksi "hotspot" atau area yang berpotensi memiliki banyak aduan di masa depan (misalnya, area drainase yang sering tersumbat saat musim hujan).
- **Analisis Akar Masalah:** AI dapat menganalisis kumpulan aduan untuk menemukan akar masalah yang sebenarnya. Contoh: Banyaknya aduan lampu PJU mati di area tertentu mungkin bukan karena lampunya rusak, tetapi karena masalah pada jaringan listrik di area tersebut.

## 10. Testing Scenario

| ID | Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| TS-CMP-01 | Warga berhasil mengirimkan aduan kategori "Infrastruktur" dengan foto. | Aduan tersimpan dengan status "Baru". Notifikasi terkirim ke piket Kelurahan. |
| TS-CMP-02 | Aparat Kelurahan memverifikasi dan meneruskan aduan ke Dinas PU. | Status aduan berubah menjadi "Dalam Pengerjaan". Notifikasi terkirim ke Dinas PU dan warga. |
| TS-CMP-03 | Sebuah aduan tidak ditangani dan melewati batas waktu SLA. | Sistem secara otomatis mengirimkan notifikasi eskalasi ke atasan penanggung jawab. |
| TS-CMP-04 | Petugas lapangan menyelesaikan pekerjaan dan mengunggah foto hasil. | Status aduan berubah menjadi "Menunggu Konfirmasi Pelapor". Notifikasi terkirim ke warga. |
| TS-CMP-05 | Warga tidak setuju dengan hasil pengerjaan dan menekan tombol "Buka Kembali". | Status aduan kembali menjadi "Dalam Pengerjaan". Notifikasi terkirim kembali ke petugas. |
| TS-CMP-06 | Warga setuju dengan hasil pengerjaan. | Status aduan berubah menjadi "Selesai". Aduan ditutup. |

## 11. Acceptance Criteria

- Sistem mampu menerima, menyimpan, dan menampilkan aduan dari warga sesuai kategori yang ditentukan.
- Alur kerja aduan dari status "Baru" hingga "Selesai" berfungsi sesuai dengan diagram.
- Sistem prioritas dan SLA berjalan secara otomatis berdasarkan aturan yang ditetapkan.
- Notifikasi terkirim ke pihak yang tepat pada setiap tahapan alur kerja.
- Data aduan teragregasi dengan benar di dasbor, termasuk KPI kinerja.
- Pengguna (aparat) dapat meneruskan aduan ke pihak lain yang relevan.
- Warga (pelapor) dapat memberikan umpan balik atau konfirmasi atas penyelesaian aduan.
- Semua skenario pengujian (Testing Scenario) berhasil dijalankan tanpa error kritis.