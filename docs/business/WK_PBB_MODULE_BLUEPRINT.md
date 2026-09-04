**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL PBB (PAJAK BUMI DAN BANGUNAN)**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-016` |
| **Nama Dokumen** | Cetak Biru Modul PBB |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Enterprise Business Analyst, Public Finance Consultant |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee, Bapenda (Badan Pendapatan Daerah) |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul PBB (Pajak Bumi dan Bangunan)**, sebuah komponen strategis dalam platform WK Community OS. Modul ini dirancang untuk mentransformasi pengelolaan PBB dari sekadar proses administratif penagihan dan pencatatan menjadi sebuah sistem intelijen pendapatan daerah.

Tujuan utamanya adalah menyediakan alat bagi pemerintah daerah, mulai dari tingkat RT hingga pimpinan daerah, untuk memonitor kepatuhan wajib pajak secara *real-time*, menganalisis tren pendapatan, dan mengidentifikasi potensi fiskal wilayah. Dengan fitur dasbor analitik, sistem notifikasi berjenjang, dan integrasi dengan *Community Score*, modul ini akan menjadi instrumen kunci dalam meningkatkan Pendapatan Asli Daerah (PAD), mendorong kesadaran pajak, dan menyediakan data fundamental untuk perencanaan infrastruktur di **Kelurahan Kebonjati, Kota Sukabumi**.

## 3. Business Objective

- **Meningkatkan Tingkat Kepatuhan:** Meningkatkan persentase pelunasan PBB di wilayah implementasi melalui monitoring proaktif dan pengingat otomatis.
- **Mempercepat Rekonsiliasi Data:** Menyediakan platform tunggal bagi aparat RT, RW, dan Kelurahan untuk memvalidasi dan memantau status pembayaran PBB di lingkungannya.
- **Menyediakan Proyeksi Pendapatan:** Memberikan data yang akurat kepada pimpinan daerah untuk memproyeksikan realisasi pendapatan dari sektor PBB.
- **Menjadi Dasar Perencanaan:** Menggunakan data kepatuhan dan nilai PBB sebagai salah satu dasar untuk menentukan prioritas pembangunan infrastruktur di suatu wilayah.

## 4. Business Scope

| Kategori | Deskripsi |
| :--- | :--- |
| **In Scope** | - Impor dan pengelolaan data master SPPT (Surat Pemberitahuan Pajak Terutang).<br>- Pencatatan dan validasi bukti pembayaran PBB.<br>- Monitoring status pembayaran (Lunas/Belum Lunas) per NOP (Nomor Objek Pajak).<br>- Sistem notifikasi dan eskalasi berjenjang untuk tunggakan.<br>- Dasbor analitik untuk memvisualisasikan data kepatuhan dan pendapatan.<br>- Analisis tren pembayaran tahunan. |
| **Out of Scope**| - Proses pembayaran PBB secara langsung melalui platform (pada v1.0).<br>- Perhitungan dan penetapan nilai NJOP (Nilai Jual Objek Pajak).<br>- Integrasi API *real-time* dengan sistem inti Bapenda (pada v1.0).<br>- Penerbitan SPPT baru. |

## 5. Stakeholder

| Stakeholder | Peran dalam Konteks Modul PBB |
| :--- | :--- |
| **Warga (Wajib Pajak)** | Pihak yang berkewajiban membayar PBB dan melakukan konfirmasi pembayaran. |
| **Ketua RT** | Agen monitoring primer; memantau dan mengingatkan warganya yang menunggak. |
| **Ketua RW** | Koordinator monitoring; memantau kinerja kepatuhan RT di wilayahnya. |
| **Aparat Kelurahan** | Administrator dan verifikator; memvalidasi data pembayaran dan memantau kepatuhan tingkat kelurahan. |
| **Bapenda** | Sumber data SPPT dan penerima akhir data realisasi pembayaran. |
| **Pemerintah Daerah** | Pengguna data analitik untuk perencanaan anggaran dan pembangunan. |

## 6. Master Data

| Field | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `nop_id` (PK) | String | Nomor Objek Pajak yang unik (18 digit). | `32.72.010.001.001.0123.0` |
| `wajib_pajak_id` (FK)| String | NIK Wajib Pajak yang terhubung ke Modul Warga. | `327201...` |
| `nama_wajib_pajak`| String | Nama Wajib Pajak sesuai SPPT. | `Budi Santoso` |
| `alamat_objek_pajak`| String | Alamat lokasi tanah/bangunan. | `Jl. Merdeka No. 10` |
| `rt_id` (FK) | String | Kode wilayah RT. | `327201001001` |
| `rw_id` (FK) | String | Kode wilayah RW. | `327201001` |
| `luas_tanah` | Integer | Luas tanah dalam meter persegi. | `150` |
| `luas_bangunan` | Integer | Luas bangunan dalam meter persegi. | `90` |
| `njop` | BigInt | Nilai Jual Objek Pajak total. | `250000000` |
| `sppt_id` (PK) | String | ID unik untuk SPPT tahunan (e.g., `NOP-Tahun`). | `32...0-2026` |
| `tahun_pajak` | Integer | Tahun pajak yang berlaku untuk SPPT. | `2026` |
| `nominal_pajak` | BigInt | Jumlah PBB yang harus dibayar. | `250000` |
| `tanggal_jatuh_tempo`| Date | Batas akhir pembayaran. | `2026-09-30` |
| `status_pembayaran`| Enum | `LUNAS`, `BELUM LUNAS`, `MENUNGGAK`. | `BELUM LUNAS` |
| `tanggal_bayar` | Date | Tanggal saat pembayaran dilakukan. | `2026-08-17` |
| `jumlah_tunggakan` | BigInt | Akumulasi tunggakan dari tahun-tahun sebelumnya. | `500000` |
| `kategori_objek` | Enum | `PERUMAHAN`, `KOMERSIAL`, `INDUSTRI`. | `PERUMAHAN` |

## 7. Business Process

```ascii
  (Bapenda)
      |
      v
[1. Distribusi SPPT (Manual/Impor Data)]
      |
      v
<Sistem WK OS>
[2. Monitoring Kepatuhan via Dashboard]
      |
      +------------------------------------------------+
      |                                                |
      v                                                v
[Warga Melakukan Pembayaran]                       [Sistem Menjalankan Eskalasi]
(via Bank/Loket)                                   (Reminder Otomatis)
      |                                                |
      v                                                |
[Warga Mengunggah Bukti Bayar]                         |
      |                                                |
      v                                                |
[3. Aparat RT/Kelurahan Melakukan Validasi] <----------+
      |
      v (Valid)
<Sistem>
[4. Update Status menjadi "LUNAS"]
      |
      v
[5. Perbarui Data di Dashboard Real-time]
      |
      v
[6. Pimpinan Melakukan Analisis Kinerja]
      |
      v
     (X)
```

## 8. Business Rules

| Rule ID | Trigger Event | Kondisi | Aksi |
| :--- | :--- | :--- | :--- |
| PBB-REM-01 | Pengecekan Harian | `sppt.status == 'BELUM LUNAS'` AND `sppt.jatuh_tempo - 30 hari` | `Notification.send(warga, 'Reminder Pembayaran PBB')` |
| PBB-ESC-01 | Pengecekan Harian | `sppt.status == 'BELUM LUNAS'` AND `now() > sppt.jatuh_tempo + 30 hari` | `Notification.send(ketua_rt, 'Warga Menunggak PBB')` & `Task.create(ketua_rt, 'Lakukan penagihan')` |
| PBB-ESC-02 | Pengecekan Mingguan | `sppt.status == 'BELUM LUNAS'` AND `now() > sppt.jatuh_tempo + 90 hari` | `Dashboard.flag(sppt.nop_id, 'RED')` & `Notification.send(lurah, 'Tunggakan PBB Kritis')` |
| PBB-SCORE-01| Pembayaran Divalidasi | `sppt.status` berubah menjadi `LUNAS` | `CommunityScore.update('governance', wilayah.id, +1)` |
| PBB-SCORE-02| Jatuh Tempo Terlewat | `sppt.status` berubah menjadi `MENUNGGAK` | `CommunityScore.update('governance', wilayah.id, -2)` |

## 9. Dashboard

Setiap level pemerintahan memiliki dasbor PBB yang disesuaikan.

| Dashboard | Widget Utama |
| :--- | :--- |
| **Dashboard RT** | - Daftar warga yang belum lunas.<br>- Persentase kepatuhan RT. |
| **Dashboard RW** | - Peringkat kepatuhan RT di wilayahnya.<br>- Grafik tren pembayaran mingguan.<br>- Peta wilayah RT dengan kode warna kepatuhan. |
| **Dashboard Kelurahan**| - Peringkat kepatuhan RW.<br>- Total realisasi pendapatan vs target.<br>- Peta sebaran tunggakan terbesar. |
| **Dashboard Kecamatan/Kota**| - Perbandingan kinerja antar kelurahan.<br>- Analisis pendapatan PBB tahunan.<br>- Proyeksi pendapatan berdasarkan data historis. |

## 10. Notification

| Nama Notifikasi | Target | Pemicu | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| **Reminder Pembayaran** | Warga | 30 hari sebelum jatuh tempo. | "Yth. Bapak/Ibu [Nama], tagihan PBB Anda sebesar [Nominal] akan jatuh tempo pada [Tanggal]. Mohon segera lakukan pembayaran." |
| **Notifikasi Tunggakan ke RT**| Ketua RT | 30 hari setelah jatuh tempo. | "Perhatian: Warga Anda, [Nama Warga] di [Alamat], tercatat menunggak PBB tahun [Tahun]. Mohon untuk ditindaklanjuti." |
| **Laporan Tunggakan ke RW** | Ketua RW | Setiap awal bulan. | "Laporan Kepatuhan PBB: RT 01 (95%), RT 02 (80%), RT 03 (98%). Terdapat [Jumlah] tunggakan kritis di wilayah Anda." |
| **Eskalasi ke Kelurahan** | Lurah | Tunggakan > 90 hari. | "Eskalasi: Objek Pajak [NOP] dengan tunggakan sebesar [Nominal] telah melewati 90 hari. Perlu penanganan khusus." |

## 11. Community Score Integration

Kepatuhan pembayaran PBB adalah salah satu indikator utama untuk **Governance Score** dan **Economy Score** dalam *Community Score*.
- **Governance Score:** Diukur dari persentase pelunasan PBB tepat waktu. Wilayah dengan kepatuhan tinggi menunjukkan tata kelola dan kesadaran warga yang baik.
- **Economy Score:** Total nilai PBB yang terkumpul di suatu wilayah dapat menjadi proksi dari aktivitas dan nilai ekonomi di wilayah tersebut.

## 12. Rule Engine Integration

Seluruh aturan bisnis pada Bab 8 akan diimplementasikan menggunakan *Rule Engine*.
- **Proses:** Sebuah *scheduler* (misalnya, *time-driven trigger* di Apps Script) akan berjalan setiap hari untuk mengevaluasi semua SPPT yang aktif.
- **Evaluasi:** `RuleEngine.evaluate('pbb.daily_check', all_sppt_data)`.
- **Aksi:** Jika kondisi aturan terpenuhi, *Rule Engine* akan memanggil `NotificationService` atau `TaskService` untuk melakukan aksi yang telah didefinisikan.

## 13. AI Recommendation (Future)

- **Prediksi Kepatuhan:** AI akan menganalisis profil wajib pajak (histori pembayaran, jenis properti, lokasi) untuk memprediksi probabilitas mereka membayar tepat waktu.
- **Prediksi Tunggakan:** Mengidentifikasi NOP yang berisiko tinggi menjadi penunggak, bahkan sebelum jatuh tempo.
- **Prediksi Pendapatan:** Memberikan proyeksi realisasi pendapatan PBB yang lebih akurat dengan memperhitungkan probabilitas kepatuhan.
- **Analisis Wilayah:** Mengidentifikasi klaster geografis dengan tingkat tunggakan tertinggi untuk dianalisis lebih lanjut (misalnya, apakah ada masalah infrastruktur atau sosial di area tersebut?).
- **Prioritas Sosialisasi:** Merekomendasikan wilayah (RT/RW) yang paling membutuhkan sosialisasi perpajakan berdasarkan tingkat kepatuhan yang rendah.
- **Rekomendasi Penagihan:** Menyarankan metode penagihan yang paling efektif untuk profil wajib pajak tertentu (misalnya, pengingat via WA, kunjungan langsung oleh RT, atau surat resmi).

## 14. KPI

| ID | KPI | Deskripsi | Target Awal |
| :--- | :--- | :--- | :--- |
| PBB-KPI-01 | **Tingkat Kepatuhan (Compliance Rate)** | Persentase SPPT yang lunas pada akhir tahun pajak. | > 95% |
| PBB-KPI-02 | **Realisasi Pendapatan** | Total nominal PBB yang diterima dibandingkan target. | > 98% dari Target |
| PBB-KPI-03 | **Rasio Tunggakan** | Persentase jumlah tunggakan terhadap total potensi PBB. | < 5% |
| PBB-KPI-04 | **Tren Kepatuhan Tahunan** | Perbandingan tingkat kepatuhan dari tahun ke tahun. | Tren Positif |
| PBB-KPI-05 | **RT/RW Terbaik** | Peringkat RT/RW dengan tingkat kepatuhan tertinggi. | Mendorong kompetisi sehat |

## 15. Sequence Diagram (ASCII)

**Skenario: Validasi Pembayaran oleh Aparat RT**

```ascii
  Aparat RT         :UI/Frontend          :PBBController         :PBBService          :PBBRepository
      |                   |                      |                    |                    |
      | Cari NOP &        |                      |                    |                    |
      | Unggah Bukti Bayar|                      |                    |                    |
      |------------------>|                      |                    |                    |
      |                   | validatePayment(data)|                      |                    |
      |                   |--------------------->|                      |                    |
      |                   |                      | validatePayment()  |                    |
      |                   |                      |------------------->|                    |
      |                   |                      |                    | updateStatus()     |
      |                   |                      |                    |------------------->|
      |                   |                      |                    |                    | (DB Update)
      |                   |                      |                    |<-------------------|
      |                   |                      |                    | returns success    |
      |                   |                      |<-------------------|                    |
      |                   |                      |                    |                    |
      |                   | returns successMsg   |                    |                    |
      |                   |<---------------------|                    |                    |
      |                   |                      |                    |                    |
      | Tampilkan Status  |                      |                    |                    |
      | "LUNAS"           |                      |                    |                    |
      |<------------------|                      |                    |                    |
      |                   |                      |                    |                    |
```

## 16. Activity Diagram (ASCII)

**Skenario: Monitoring dan Eskalasi Tunggakan**

```ascii
      (*)
       |
       v
<Scheduler: Daily>
[Get all SPPT with status 'BELUM LUNAS']
       |
       v
For each SPPT:
[Check Due Date]
       |
       +-----> [Jatuh Tempo > 30 hari?] --(No)--> [End Loop]
       |
       v (Yes)
[Check Last Reminder]
       |
       +-----> [Reminder terkirim < 30 hari lalu?] --(Yes)--> [End Loop]
       |
       v (No)
<Sistem>
[Kirim Notifikasi Reminder ke Warga]
       |
       v
[Check Tunggakan > 30 hari?] --(No)--> [End Loop]
       |
       v (Yes)
<Sistem>
[Kirim Notifikasi & Tugas ke Ketua RT]
       |
       v
      (X)
```

## 17. CRUD Matrix

| Entitas | Bapenda | Aparat Kelurahan | Ketua RW | Ketua RT | Warga |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SPPT** | C R | R | R | R | R(own) |
| **Pembayaran**| R | C R U | R | C R U | C R(own) |

**Legenda:** C=Create, R=Read, U=Update, (own)=Hanya data milik sendiri.

## 18. Permission Matrix

| Aksi | Admin | Bapenda | Kelurahan | RW | RT | Warga |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **pbb.import_sppt** | ✓ | ✓ | | | | |
| **pbb.view.all** | ✓ | ✓ | ✓ | | | |
| **pbb.view.kecamatan**| ✓ | ✓ | ✓ | | | |
| **pbb.view.kelurahan**| ✓ | ✓ | ✓ | ✓ | | |
| **pbb.view.rw** | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **pbb.view.rt** | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **pbb.view.own** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **pbb.confirm_payment**| ✓ | | ✓ | | ✓ | ✓ |
| **pbb.update_status** | ✓ | | ✓ | | ✓ | |

## 19. Testing Scenario

1.  **TS-PBB-01:** Admin berhasil mengimpor data SPPT dari file CSV.
2.  **TS-PBB-02:** Warga berhasil melihat data SPPT miliknya untuk tahun berjalan.
3.  **TS-PBB-03:** Warga berhasil mengunggah bukti bayar dan melakukan konfirmasi.
4.  **TS-PBB-04:** Ketua RT menerima notifikasi konfirmasi dan berhasil memvalidasi pembayaran warganya.
5.  **TS-PBB-05:** Setelah divalidasi RT, status SPPT berubah menjadi "LUNAS".
6.  **TS-PBB-06:** Dasbor RT menunjukkan peningkatan persentase kepatuhan setelah validasi.
7.  **TS-PBB-07:** Sistem mengirimkan reminder pembayaran H-30 kepada warga yang belum bayar.
8.  **TS-PBB-08:** Sistem mengirimkan notifikasi tunggakan ke Ketua RT untuk warga yang menunggak > 30 hari.
9.  **TS-PBB-09:** Dasbor Kelurahan menandai NOP dengan warna merah untuk tunggakan > 90 hari.
10. **TS-PBB-10:** Pengguna dengan peran "Warga" tidak dapat melihat data PBB milik tetangganya.
11. **TS-PBB-11:** Ketua RT hanya dapat melihat data PBB warganya sendiri, tidak bisa melihat data RT lain.
12. **TS-PBB-12:** Ketua RW dapat melihat data rekapitulasi semua RT di wilayahnya.
13. **TS-PBB-13:** Mencoba mengimpor SPPT dengan NOP yang tidak valid (format salah). Sistem menolak.
14. **TS-PBB-14:** Warga mencoba melakukan konfirmasi pembayaran untuk NOP milik orang lain. Sistem menolak.
15. **TS-PBB-15:** Data tren tahunan di dasbor Kecamatan menampilkan data yang akurat.
16. **TS-PBB-16:** Peta PBB di dasbor Kelurahan menampilkan kode warna yang benar sesuai tingkat kepatuhan per RW.
17. **TS-PBB-17:** KPI Persentase Lunas di dasbor utama ter-update secara real-time.
18. **TS-PBB-18:** Notifikasi eskalasi ke Lurah terkirim untuk tunggakan kritis.
19. **TS-PBB-19:** Pengguna dengan peran "RT" tidak bisa mengubah data master SPPT (misalnya, luas tanah).
20. **TS-PBB-20:** Setelah pembayaran divalidasi, Community Score untuk wilayah terkait menunjukkan sedikit peningkatan.

## 20. Acceptance Criteria

1.  Sistem mampu mengelola data master SPPT, termasuk impor data massal.
2.  Alur kerja konfirmasi dan validasi pembayaran berfungsi sesuai diagram proses.
3.  Status pembayaran (`LUNAS`, `BELUM LUNAS`, `MENUNGGAK`) ter-update secara akurat.
4.  Dasbor untuk setiap level (RT, RW, Kelurahan, Kecamatan) menampilkan data yang relevan dan akurat.
5.  Widget peringkat RT/RW berdasarkan kepatuhan PBB berfungsi dengan benar.
6.  Peta kepatuhan PBB menampilkan visualisasi data spasial dengan benar.
7.  Sistem notifikasi pengingat pembayaran ke warga berjalan otomatis.
8.  Sistem notifikasi eskalasi tunggakan ke aparat (RT, RW, Lurah) berjalan sesuai aturan.
9.  Aturan bisnis yang didefinisikan di *Rule Engine* terimplementasi dengan benar.
10. Matriks CRUD dan Perizinan Pengguna diterapkan secara ketat.
11. Data PBB menjadi input yang valid untuk perhitungan *Community Score*.
12. Pengguna dapat mencari data SPPT berdasarkan NOP, Nama Wajib Pajak, atau Alamat.
13. Sistem dapat menampilkan riwayat pembayaran PBB untuk sebuah NOP dalam beberapa tahun terakhir.
14. Semua KPI yang didefinisikan dapat diukur dan ditampilkan di dasbor pimpinan.
15. Performa sistem tetap optimal saat mengelola data untuk satu kelurahan penuh.
16. Antarmuka untuk konfirmasi pembayaran mudah digunakan oleh warga dan aparat RT.
17. Log audit mencatat semua aktivitas perubahan status pembayaran.
18. Dokumentasi pengguna untuk proses konfirmasi pembayaran tersedia dan jelas.
19. Modul berhasil melewati semua skenario pengujian yang didefinisikan.
20. Pelatihan telah diberikan kepada aparat Kelurahan Kebonjati mengenai cara menggunakan modul ini.

## 21. Future Roadmap

| Versi | Fokus | Fitur Utama |
| :--- | :--- | :--- |
| **v1.5** | **Integrasi & Kemudahan** | - Integrasi API dengan Bapenda untuk sinkronisasi data SPPT & pembayaran.<br>- Pembubuhan QR Code pada bukti lunas untuk verifikasi cepat. |
| **v2.0** | **Pembayaran Digital** | - Integrasi dengan *Payment Gateway* untuk memungkinkan pembayaran PBB langsung dari platform WK OS. |
| **v2.5** | **Analitik Spasial** | - Integrasi GIS untuk analisis yang lebih mendalam, misalnya korelasi antara nilai NJOP dengan kondisi infrastruktur sekitar. |
| **v3.0** | **Digital Twin** | - Data PBB menjadi salah satu layer fundamental dalam *Digital Twin*, memungkinkan simulasi dampak kenaikan PBB terhadap ekonomi wilayah. |