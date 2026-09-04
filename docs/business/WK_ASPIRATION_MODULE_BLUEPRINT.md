**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL ASPIRASI (ASPIRATION MODULE BLUEPRINT)**

---

## Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-013` |
| **Nama Dokumen** | Cetak Biru Modul Aspirasi |
| **Versi** | 1.0 |
| **Status** | `DRAFT` |
| **Pemilik** | Enterprise Business Analyst |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee |

---

## 1. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul Aspirasi (Aspiration Module)**, sebuah inovasi inti dalam platform WK Community OS yang bertujuan untuk mendigitalisasi dan mendemokratisasi proses Musyawarah Perencanaan Pembangunan (Musrenbang). Modul ini menyediakan platform bagi warga untuk mengajukan usulan pembangunan, memberikan dukungan melalui sistem pemungutan suara (*voting*), dan berpartisipasi dalam diskusi untuk menentukan prioritas pembangunan di lingkungan mereka.

Tujuan utama modul ini adalah untuk mentransformasi proses perencanaan dari yang bersifat *top-down* dan seremonial menjadi proses yang *bottom-up*, transparan, dan berbasis data. Dengan fitur seperti polling, prioritas dinamis, dan integrasi dengan forum diskusi, Modul Aspirasi akan menjadi kanal utama bagi pemerintah di **Kelurahan Kebonjati** untuk menyerap, menganalisis, dan menindaklanjuti ide-ide konstruktif dari warganya secara efektif.

## 2. Konsep Inti

| Konsep | Deskripsi |
| :--- | :--- |
| **Usulan** | Ide atau proposal pembangunan konkret yang diajukan oleh seorang warga, lengkap dengan deskripsi, estimasi biaya, dan lokasi. |
| **Polling / Voting**| Mekanisme bagi warga lain untuk memberikan suara dukungan ("Upvote") pada usulan yang mereka anggap penting. Jumlah suara menjadi salah satu faktor utama penentu prioritas. |
| **Musyawarah** | Proses pembahasan usulan-usulan yang memiliki prioritas tertinggi. Dapat dilakukan secara digital melalui modul **Forum** atau dijadwalkan secara fisik. |
| **Prioritas** | Level urgensi sebuah usulan, yang ditentukan secara otomatis oleh sistem (berdasarkan jumlah suara, kategori, dll.) atau secara manual oleh aparat. Level: `Rendah`, `Sedang`, `Tinggi`, `Kritis`. |
| **Status** | Tahapan siklus hidup sebuah usulan, yang memberikan transparansi proses kepada publik. |

## 3. Workflow (Alur Kerja)

Alur kerja Modul Aspirasi dirancang untuk menyaring dan memprioritaskan ide dari warga menjadi rencana yang dapat ditindaklanjuti.

```ascii
  (*)
   |
   v
[Warga Mengajukan Usulan Pembangunan]
   |
   v
<Sistem>
[Status: Baru, Menunggu Verifikasi]
   |
   v
[Aparat Kelurahan memverifikasi kelayakan & kelengkapan usulan]
   |
   +-----> [Tolak/Duplikat] -----> (X)
   |
   v (Layak)
<Sistem>
[Status: Tahap Polling]
[Usulan dibuka untuk voting oleh warga selama periode tertentu (e.g., 30 hari)]
   |
   v
[Periode Polling Selesai]
   |
   v
<Sistem>
[Sistem menghitung total suara dan menetapkan Prioritas awal]
[Status: Menunggu Penjadwalan Musyawarah]
   |
   v
[Pimpinan (Lurah/Camat) & Tim Perencana meninjau usulan prioritas]
   |
   v
[Usulan terpilih dijadwalkan untuk dibahas dalam Musyawarah]
   |
   v
<Sistem>
[Status: Dalam Pembahasan]
   |
   v
[Hasil Musyawarah menentukan keputusan akhir]
   |
   +-----> [Diterima] --> [Status: Diterima, Masuk Rencana Pembangunan] --> (X)
   |
   +-----> [Ditunda] --> [Status: Ditunda, Akan Dievaluasi Kembali] --> (X)
   |
   +-----> [Ditolak] --> [Status: Ditolak dengan Alasan] --> (X)
```

## 4. Status Aspirasi

- **Baru:** Usulan baru masuk, menunggu verifikasi awal.
- **Polling:** Usulan telah diverifikasi dan dibuka untuk pemungutan suara.
- **Menunggu Penjadwalan:** Periode polling selesai, menunggu untuk dibahas.
- **Dalam Pembahasan:** Usulan sedang aktif didiskusikan dalam forum atau rapat musyawarah.
- **Diterima:** Usulan disetujui dan akan dimasukkan ke dalam rencana pembangunan.
- **Ditunda:** Usulan dianggap baik namun belum menjadi prioritas saat ini.
- **Ditolak:** Usulan tidak dapat diterima, disertai dengan alasan yang jelas.

## 5. Dashboard (Dasbor)

Modul Aspirasi akan menyediakan data untuk Dasbor Partisipasi Publik dan Perencanaan.
- **Scorecard:** Total Usulan Masuk, % Usulan Diterima, Total Partisipasi Voting.
- **Grafik Batang:** Jumlah Usulan per Kategori (Pembangunan, Pemberdayaan, dll.).
- **Tabel Peringkat:** Daftar 10 Usulan Teratas berdasarkan Jumlah Suara.
- **Peta (Heatmap):** Peta persebaran lokasi usulan untuk analisis kewilayahan.
- **KPI:** Rata-rata Jumlah Suara per Usulan, Tingkat Partisipasi Warga dalam Polling (%).

## 6. Notification (Notifikasi)

| Pemicu | Target Notifikasi | Kanal | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| Usulan baru diajukan | Warga Pengusul | Email / App | "Usulan Anda '[Judul Usulan]' telah diterima dan sedang diverifikasi." |
| Usulan lolos verifikasi | Seluruh Warga | App / Berita | "Ada usulan baru: '[Judul Usulan]'. Ayo berikan dukungan Anda!" |
| Usulan masuk 10 besar | Warga Pengusul | Email / App | "Selamat! Usulan Anda masuk dalam 10 besar dan menjadi prioritas pembahasan." |
| Jadwal musyawarah | Warga Pengusul & Peminat | Email / App | "Pembahasan untuk usulan '[Judul Usulan]' akan diadakan pada [Tanggal]." |
| Keputusan akhir dibuat | Warga Pengusul & Peminat | Email / App | "Hasil musyawarah untuk usulan Anda telah ditetapkan: [Status Akhir]." |

## 7. Forum Integration

Setiap usulan yang masuk akan secara otomatis membuat sebuah topik diskusi baru di **Modul Forum**.
- **Tujuan:** Menyediakan ruang bagi warga untuk berdiskusi secara mendalam mengenai detail, kelebihan, dan kekurangan sebuah usulan.
- **Mekanisme:**
    - Saat `Aspirasi` dibuat, sistem akan memanggil `ForumService.createTopicFromAspiration(aspirasiData)`.
    - Halaman detail aspirasi akan menampilkan *thread* diskusi dari forum tersebut secara terintegrasi.
    - Jumlah dan sentimen komentar di forum dapat menjadi faktor pertimbangan tambahan dalam penentuan prioritas.

## 8. Rule Engine Integration

*Rule Engine* akan digunakan untuk mengotomatiskan logika bisnis dalam modul ini.
- **Aturan Prioritas Otomatis:** `IF (aspirasi.votes > 100 && aspirasi.kategori == 'INFRASTRUKTUR') THEN aspirasi.setPrioritas('Tinggi')`
- **Aturan Penandaan Urgensi:** `IF (aspirasi.judul.includes('darurat') || aspirasi.judul.includes('berbahaya')) THEN aspirasi.setPrioritas('Kritis') && NOTIFY('Lurah')`
- **Aturan Kelayakan Voting:** `IF (warga.status_verifikasi == 'Terverifikasi' && warga.domisili == aspirasi.wilayah) THEN warga.canVote = true`

## 9. AI Recommendation (Future)

Di masa depan, AI akan memberikan kemampuan analitik yang lebih canggih.
- **Deteksi Usulan Duplikat:** AI akan membaca deskripsi usulan baru dan membandingkannya dengan usulan yang sudah ada untuk mendeteksi dan menyarankan penggabungan usulan yang serupa.
- **Analisis Sentimen Diskusi:** AI akan menganalisis sentimen (positif, negatif, netral) dari diskusi di forum untuk memberikan ringkasan kepada pimpinan mengenai opini publik terhadap sebuah usulan.
- **Rekomendasi Anggaran:** Berdasarkan data historis proyek serupa, AI dapat memberikan rekomendasi estimasi anggaran yang lebih akurat untuk sebuah usulan.
- **Analisis Dampak:** AI dapat membantu mensimulasikan potensi dampak dari sebuah usulan. Contoh: "Jika usulan 'Pembangunan Jembatan X' diterima, ini berpotensi mengurangi waktu tempuh bagi 500 warga dan meningkatkan omzet 30 UMKM di sekitarnya."

## 10. Testing Scenario

| ID | Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| TS-ASP-01 | Warga berhasil mengajukan usulan baru dengan data lengkap. | Usulan tersimpan dengan status "Baru". Notifikasi terkirim ke aparat untuk verifikasi. |
| TS-ASP-02 | Aparat menyetujui usulan. | Status usulan berubah menjadi "Polling". Usulan muncul di halaman voting. Notifikasi terkirim ke warga. |
| TS-ASP-03 | Seorang warga memberikan suara (upvote) pada sebuah usulan. | Jumlah suara pada usulan tersebut bertambah satu. Warga tersebut tidak dapat memberikan suara lagi pada usulan yang sama. |
| TS-ASP-04 | Periode polling untuk sebuah usulan berakhir. | Status usulan berubah menjadi "Menunggu Penjadwalan". Sistem menghitung prioritas berdasarkan total suara. |
| TS-ASP-05 | Pimpinan mengubah status usulan menjadi "Diterima" setelah musyawarah. | Status usulan diperbarui. Notifikasi hasil akhir terkirim ke pengusul dan para pendukung. |
| TS-ASP-06 | Warga mencoba memberikan suara pada usulan yang statusnya bukan "Polling". | Sistem menolak aksi dan menampilkan pesan bahwa periode voting telah berakhir. |

## 11. Acceptance Criteria

- Sistem mampu memfasilitasi seluruh alur kerja aspirasi, dari pengajuan hingga keputusan akhir.
- Fitur polling/voting berfungsi dengan benar, termasuk pembatasan satu suara per warga per usulan.
- Integrasi dengan Modul Forum berjalan lancar, di mana setiap aspirasi memiliki ruang diskusinya sendiri.
- Aturan bisnis untuk penentuan prioritas otomatis diimplementasikan dan berfungsi sesuai harapan.
- Dasbor menampilkan data dan KPI terkait aspirasi warga secara akurat.
- Notifikasi terkirim pada setiap tahapan penting dalam siklus hidup aspirasi.
- Semua skenario pengujian (Testing Scenario) berhasil dijalankan tanpa error kritis.