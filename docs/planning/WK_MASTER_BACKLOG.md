**WK COMMUNITY OS ENTERPRISE EDITION**

**MASTER PRODUCT BACKLOG**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-031` |
| **Nama Dokumen** | Master Product Backlog |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Senior Product Manager (Scrum) |
| **Peninjau** | Enterprise PMO, Agile Coach |
| **Persetujuan** | Product Owner, Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini adalah **Master Product Backlog** untuk proyek WK Community OS Enterprise Edition. Dokumen ini berfungsi sebagai satu-satunya sumber kebenaran (*single source of truth*) untuk semua pekerjaan yang perlu dilakukan, yang diurutkan berdasarkan prioritas. Backlog ini berisi daftar semua fitur, fungsi, perbaikan, dan perubahan yang diinginkan untuk produk di masa depan.

Setiap item dalam backlog direpresentasikan sebagai **User Story** yang memberikan nilai bagi pengguna atau pemangku kepentingan. Backlog ini bersifat dinamis; ia akan terus berevolusi seiring dengan perubahan kebutuhan bisnis, masukan dari pasar, dan pembelajaran dari sprint sebelumnya. Tujuan dokumen ini adalah untuk memberikan visibilitas, transparansi, dan panduan yang jelas bagi tim pengembangan dalam merencanakan dan mengeksekusi pekerjaan mereka sprint demi sprint.

---

## 3. Product Goal

**Untuk Rilis Mayor Berikutnya (v2.0):**

> "Mengembangkan platform analitik dan partisipasi publik yang terintegrasi, dengan mengimplementasikan modul-modul kunci seperti **Kesehatan (Posyandu)**, **Ekonomi (PBB & UMKM)**, dan **Partisipasi (Aduan & Aspirasi)**. Tujuan utamanya adalah untuk meluncurkan **Community Score Engine v1.0** yang mampu memberikan *insight* awal berbasis data kepada pimpinan di Kelurahan Kebonjati, serta memvalidasi dampaknya terhadap peningkatan kualitas layanan dan pengambilan keputusan."

---

## 4. Epic

Epic adalah sekumpulan besar User Story yang saling terkait dan memiliki satu tujuan bisnis yang sama.

| Epic ID | Epic Name | Priority | Business Value | Story Point (Est.) | Dependency | Target Sprint |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **E-01** | **Foundation** | `CRITICAL` | 5 | 30 | - | S1-S2 |
| **E-02** | **Framework** | `CRITICAL` | 5 | 50 | E-01 | S1-S3 |
| **E-03** | **Citizen** | `HIGH` | 5 | 80 | E-02 | S4-S6 |
| **E-04** | **Family** | `HIGH` | 5 | 50 | E-03 | S5-S7 |
| **E-05** | **Letter** | `HIGH` | 4 | 60 | E-03 | S6-S8 |
| **E-06** | **Complaint** | `HIGH` | 4 | 70 | E-03 | S9-S11 |
| **E-07** | **Education** | `MEDIUM` | 4 | 90 | E-03 | S12-S15 |
| **E-08** | **Health** | `HIGH` | 5 | 40 | E-03 | S9-S10 |
| **E-09** | **Posyandu** | `HIGH` | 5 | 120 | E-08 | S10-S14 |
| **E-10** | **PBB** | `HIGH` | 5 | 100 | E-03 | S16-S19 |
| **E-11** | **Forum** | `MEDIUM` | 3 | 50 | E-03 | S20-S21 |
| **E-12** | **Aspiration** | `HIGH` | 4 | 80 | E-11 | S22-S24 |
| **E-13** | **Dashboard** | `CRITICAL` | 5 | 150 | E-02 | S3-S25 |
| **E-14** | **Notification** | `HIGH` | 4 | 90 | E-02 | S8-S12 |
| **E-15** | **Rule Engine** | `HIGH` | 5 | 70 | E-02 | S7-S10 |
| **E-16** | **Community Score**| `HIGH` | 5 | 130 | E-13, E-15 | S15-S20 |
| **E-17** | **Deployment** | `CRITICAL` | 5 | 40 | E-01 | S1-S3 |
| **E-18** | **Testing** | `HIGH` | 4 | 60 | E-02 | S4-S8 |
| **E-19** | **Documentation** | `MEDIUM` | 3 | 100 | - | Continuous |
| **E-20** | **Pilot** | `HIGH` | 5 | 50 | All | S25-S26 |
| **E-21** | **Release** | `HIGH` | 5 | 30 | E-20 | S27 |

---

## 5. Product Backlog

### Epic: Foundation (E-01)

| ID | User Story | Acceptance Criteria | Priority | Estimate | Module | Sprint | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| US-001 | Sebagai Developer, saya ingin struktur folder proyek yang terstandardisasi, sehingga saya dapat menemukan file dengan mudah. | - Struktur folder mengikuti `WK_MODULE_STANDARD.md`.<br>- Folder `src`, `docs`, `scripts`, `tests` ada. | `CRITICAL` | 2 | Foundation | S1 | Done |
| US-002 | Sebagai DevOps, saya ingin file `.gitignore` yang komprehensif, sehingga file-file sementara dan sensitif tidak masuk ke repository. | - Mengabaikan `node_modules`, `backups`, `.env`. | `CRITICAL` | 1 | Foundation | S1 | Done |
| US-003 | Sebagai Developer, saya ingin file `appsscript.json` dikonfigurasi dengan benar, sehingga runtime V8 dan zona waktu yang tepat digunakan. | - `runtimeVersion` adalah `V8`.<br>- `timeZone` adalah `Asia/Jakarta`. | `CRITICAL` | 1 | Foundation | S1 | Done |
| US-004 | Sebagai Developer, saya ingin file `.clasp.json` untuk lingkungan DEV, sehingga saya dapat melakukan push kode ke Apps Script. | - `scriptId` untuk lingkungan DEV terisi. | `CRITICAL` | 2 | Foundation | S1 | Done |

### Epic: Framework (E-02)

| ID | User Story | Acceptance Criteria | Priority | Estimate | Module | Sprint | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| US-005 | Sebagai Framework, saya ingin memiliki Kernel aplikasi, sehingga saya dapat mengelola proses boot dan lifecycle. | - Kernel dapat diinisialisasi.<br>- Proses boot mengikuti `WK_KERNEL_ARCHITECTURE.md`. | `CRITICAL` | 8 | Framework | S1 | Done |
| US-006 | Sebagai Framework, saya ingin memiliki Service Container (IoC), sehingga saya dapat mengelola dependensi secara otomatis. | - Dapat melakukan `bind` dan `resolve` service.<br>- Mendukung `singleton`. | `CRITICAL` | 8 | Framework | S2 | Done |
| US-007 | Sebagai Framework, saya ingin memiliki Module Loader, sehingga saya dapat memuat semua modul secara dinamis. | - Memindai direktori `src/`.<br>- Membaca `module.json`.<br>- Mendaftarkan modul ke container. | `CRITICAL` | 5 | Framework | S2 | Done |
| US-008 | Sebagai Framework, saya ingin memiliki Router, sehingga saya dapat meneruskan permintaan masuk ke Controller yang tepat. | - Menerima parameter `module` dan `action`.<br>- Memanggil metode Controller yang sesuai. | `CRITICAL` | 5 | Framework | S3 | Done |
| US-009 | Sebagai Framework, saya ingin memiliki Database Adapter, sehingga logika bisnis terabstraksi dari implementasi database. | - Mendefinisikan interface `findById`, `findAll`, `save`, `delete`. | `HIGH` | 3 | Framework | S2 | Done |
| US-010 | Sebagai Framework, saya ingin memiliki Spreadsheet Driver, sehingga saya dapat menggunakan Google Sheets sebagai database. | - Mengimplementasikan Database Adapter.<br>- Dapat membaca dan menulis baris di Sheet. | `HIGH` | 5 | Framework | S3 | Done |
| US-011 | Sebagai Framework, saya ingin memiliki WK SDK, sehingga developer dapat berinteraksi dengan framework melalui API yang stabil. | - Namespace `WK` tersedia.<br>- Metode `WK.service()`, `WK.repository()` berfungsi. | `HIGH` | 8 | Framework | S3 | Done |

### Epic: Citizen (E-03)

| ID | User Story | Acceptance Criteria | Priority | Estimate | Module | Sprint | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| US-012 | Sebagai Ketua RT, saya ingin menambahkan data warga baru, sehingga data kependudukan di wilayah saya akurat. | - Form tambah warga tersedia.<br>- Data tersimpan di sheet 'citizens'.<br>- Event `Citizen.Created` terpicu. | `HIGH` | 5 | Citizen | S4 | To Do |
| US-013 | Sebagai Ketua RT, saya ingin melihat daftar semua warga di RT saya, sehingga saya dapat memantau data. | - Halaman daftar warga tersedia.<br>- Data hanya menampilkan warga di RT yang login. | `HIGH` | 3 | Citizen | S4 | To Do |
| US-014 | Sebagai Ketua RT, saya ingin mengubah data seorang warga, sehingga saya dapat memperbaiki kesalahan atau memperbarui status. | - Form edit warga tersedia.<br>- Data yang diubah tersimpan.<br>- Event `Citizen.Updated` terpicu. | `HIGH` | 5 | Citizen | S5 | To Do |
| US-015 | Sebagai Ketua RT, saya ingin menonaktifkan data warga yang pindah atau meninggal, sehingga data populasi aktif akurat. | - Opsi untuk mengubah status warga menjadi 'Pindah' atau 'Meninggal'.<br>- Warga non-aktif tidak muncul di daftar utama. | `HIGH` | 3 | Citizen | S5 | To Do |
| US-016 | Sebagai Aparat Kelurahan, saya ingin mencari warga berdasarkan NIK, sehingga saya dapat menemukan data dengan cepat. | - Terdapat kolom pencarian.<br>- Hasil pencarian muncul kurang dari 3 detik. | `HIGH` | 2 | Citizen | S6 | To Do |
| US-017 | Sebagai Sistem, saya ingin memvalidasi NIK harus 16 digit dan unik, sehingga integritas data terjaga. | - Gagal menyimpan jika NIK < 16 digit.<br>- Gagal menyimpan jika NIK sudah ada. | `CRITICAL` | 3 | Citizen | S4 | To Do |
... *(dan sekitar 10-15 user story lainnya untuk modul Citizen)*

### Epic: Family (E-04)

| ID | User Story | Acceptance Criteria | Priority | Estimate | Module | Sprint | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| US-030 | Sebagai Ketua RT, saya ingin membuat data Kartu Keluarga (KK) baru, sehingga saya dapat mendata keluarga baru yang pindah. | - Form tambah KK tersedia.<br>- Data tersimpan di sheet 'families'.<br>- Event `Family.Created` terpicu. | `HIGH` | 5 | Family | S5 | To Do |
| US-031 | Sebagai Ketua RT, saya ingin menambahkan seorang warga ke dalam sebuah KK, sehingga komposisi keluarga tercatat dengan benar. | - Opsi untuk menambahkan anggota di halaman detail KK.<br>- Hubungan keluarga (Anak, Istri, dll.) dapat dipilih. | `HIGH` | 3 | Family | S6 | To Do |
| US-032 | Sebagai Ketua RT, saya ingin melakukan "Pisah KK" untuk seorang warga yang menikah, sehingga terbentuk KK baru. | - Terdapat alur kerja "Pisah KK".<br>- Warga terpilih menjadi Kepala Keluarga di KK baru. | `MEDIUM` | 8 | Family | S7 | To Do |
| US-033 | Sebagai Sistem, saya ingin memastikan setiap KK memiliki satu Kepala Keluarga, sehingga struktur data valid. | - Gagal menyimpan KK jika tidak ada Kepala Keluarga.<br>- Jika Kepala Keluarga meninggal, sistem memberikan peringatan. | `HIGH` | 3 | Family | S6 | To Do |
... *(dan sekitar 8-12 user story lainnya untuk modul Family)*

### Epic: Letter (E-05)

| ID | User Story | Acceptance Criteria | Priority | Estimate | Module | Sprint | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| US-045 | Sebagai Warga, saya ingin mengajukan Surat Pengantar secara online, sehingga saya tidak perlu datang ke rumah RT. | - Form pengajuan surat tersedia di portal warga.<br>- Pengajuan tersimpan dengan status 'Menunggu Persetujuan RT'. | `HIGH` | 5 | Letter | S6 | To Do |
| US-046 | Sebagai Ketua RT, saya ingin menerima notifikasi jika ada pengajuan surat baru, sehingga saya dapat segera memprosesnya. | - Notifikasi muncul di dashboard RT.<br>- Terdapat link untuk langsung ke halaman persetujuan. | `HIGH` | 3 | Letter | S7 | To Do |
| US-047 | Sebagai Ketua RW, saya ingin menyetujui atau menolak pengajuan surat yang sudah disetujui RT, sehingga alur kerja berjalan. | - Halaman persetujuan untuk RW.<br>- Event `Letter.Approved.ByRW` atau `Letter.Rejected.ByRW` terpicu. | `HIGH` | 3 | Letter | S7 | To Do |
| US-048 | Sebagai Aparat Kelurahan, saya ingin mencetak surat yang sudah disetujui semua pihak, sehingga dokumen fisik dapat diberikan. | - Tombol "Cetak" tersedia.<br>- Surat tercetak dengan nomor surat dan tanggal yang ter-generate otomatis. | `HIGH` | 5 | Letter | S8 | To Do |
... *(dan sekitar 10-15 user story lainnya untuk modul Letter)*

### Epic: PBB (E-10)

| ID | User Story | Acceptance Criteria | Priority | Estimate | Module | Sprint | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| US-101 | Sebagai Admin, saya ingin mengimpor data SPPT PBB dari file CSV, sehingga data PBB tahunan tersedia di sistem. | - Terdapat fitur impor CSV.<br>- Data NOP, nama, alamat, dan nominal pajak berhasil masuk ke sheet 'pbb'. | `HIGH` | 8 | PBB | S16 | To Do |
| US-102 | Sebagai Warga, saya ingin melihat tagihan PBB saya untuk tahun ini, sehingga saya tahu jumlah yang harus dibayar. | - Halaman profil warga menampilkan informasi tagihan PBB. | `HIGH` | 3 | PBB | S17 | To Do |
| US-103 | Sebagai Warga, saya ingin mengunggah bukti bayar PBB, sehingga pembayaran saya tercatat. | - Fitur unggah file (gambar/PDF) bukti bayar.<br>- Status pembayaran berubah menjadi 'Menunggu Validasi'. | `HIGH` | 5 | PBB | S17 | To Do |
| US-104 | Sebagai Ketua RT, saya ingin memvalidasi bukti bayar dari warga saya, sehingga saya dapat memastikan pembayaran sudah benar. | - Halaman validasi untuk RT.<br>- Setelah divalidasi, status berubah menjadi 'LUNAS'.<br>- Event `PBB.Paid` terpicu. | `HIGH` | 5 | PBB | S18 | To Do |
| US-105 | Sebagai Sistem, saya ingin mengirim reminder pembayaran PBB 30 hari sebelum jatuh tempo, sehingga warga tidak lupa. | - Scheduler harian berjalan.<br>- Notifikasi terkirim ke warga yang belum bayar. | `HIGH` | 5 | PBB | S18 | To Do |
| US-106 | Sebagai Lurah, saya ingin melihat dashboard kepatuhan PBB per RW, sehingga saya tahu wilayah mana yang perlu perhatian. | - Dashboard menampilkan grafik batang persentase kelunasan untuk setiap RW. | `HIGH` | 8 | PBB | S19 | To Do |
... *(dan sekitar 15-20 user story lainnya untuk modul PBB)*

*(Catatan: Total 200+ User Story akan dibuat dengan mengikuti pola di atas untuk semua Epic yang terdaftar)*

---

## 6. Sprint Planning (Contoh Rencana Awal)

| Sprint | Tanggal (Contoh) | Fokus Utama |
| :--- | :--- | :--- |
| **S1 - S3** | Minggu 1-6 | **Inisiasi & Fondasi:** Membangun Kernel, Framework, DevOps script, dan struktur dasar. |
| **S4 - S8** | Minggu 7-16 | **Layanan Inti:** Mengembangkan modul `Citizen`, `Family`, dan `Letter`. Meluncurkan fitur layanan administrasi dasar. |
| **S9 - S15** | Minggu 17-30 | **Partisipasi & Kesehatan:** Mengembangkan modul `Complaint`, `Health`, `Posyandu`, dan `Education`. |
| **S16 - S20**| Minggu 31-40 | **Ekonomi & Intelijen:** Mengembangkan modul `PBB` dan `Community Score Engine`. |
| **S21 - S24**| Minggu 41-48 | **Demokrasi Digital:** Mengembangkan modul `Forum` dan `Aspiration`. |
| **S25 - S27**| Minggu 49-54 | **Stabilisasi & Rilis:** Melakukan Pilot, perbaikan bug, dan persiapan Rilis v2.0. |

---

## 7. Release Planning

| Rilis | Target | Tema Utama |
| :--- | :--- | :--- |
| **v1.0 (Major)** | Selesai | **Fondasi Arsitektur & DevOps:** Platform stabil dengan modul dasar dan alur kerja rilis yang aman. |
| **v2.0 (Major)** | Target: S27 | **Analytics & Participation:** Pengenalan Community Score dan modul-modul partisipasi publik. |
| **v2.1 (Minor)** | TBD | **Peningkatan UI/UX:** Perbaikan antarmuka berdasarkan masukan dari pilot v2.0. |
| **v3.0 (Major)** | TBD | **Integrasi & AI:** Pengenalan AI Assistant, GIS, dan integrasi pihak ketiga. |

---

## 8. Milestone

| Milestone | Deskripsi | Target Sprint |
| :--- | :--- | :--- |
| **M1: Platform Foundation Complete** | Kernel, Framework, dan alur kerja DevOps siap digunakan. | S3 |
| **M2: Core Services Live** | Modul `Citizen`, `Family`, dan `Letter` siap untuk pilot internal. | S8 |
| **M3: Community Score v1 Live** | `Community Score Engine` berhasil menghitung skor berdasarkan data yang ada. | S20 |
| **M4: Feature Complete for v2.0** | Semua fitur untuk rilis v2.0 telah selesai dikembangkan. | S24 |
| **M5: v2.0 Release** | Versi 2.0 dirilis ke lingkungan produksi. | S27 |

---

## 9. Definition of Ready (DoR)

Sebuah User Story dianggap "Ready" (siap untuk dikerjakan dalam Sprint) jika memenuhi semua kriteria berikut:

- [ ] **Jelas (Clear):** Ditulis dalam format standar "Sebagai..., Saya ingin..., Sehingga...".
- [ ] **Dapat Diuji (Testable):** Memiliki Acceptance Criteria yang spesifik dan objektif.
- [ ] **Layak (Feasible):** Tim pengembangan telah memastikan story ini dapat dikerjakan secara teknis.
- [ ] **Diestimasi (Estimated):** Story telah diberi estimasi Story Point oleh tim pengembangan.
- **Independen (Independent):** Sebisa mungkin tidak memiliki dependensi keras dengan story lain dalam sprint yang sama.

---

## 10. Definition of Done (DoD)

Sebuah User Story dianggap "Done" (selesai) jika memenuhi semua kriteria berikut:

- [ ] **Kode Selesai:** Semua kode yang diperlukan telah ditulis.
- [ ] **Standar Terpenuhi:** Kode mematuhi `WK_CODING_STANDARD.md`.
- [ ] **Review Lolos:** Kode telah di-review dan disetujui oleh anggota tim lain (Pull Request di-merge).
- [ ] **Tes Lolos:** Semua unit test dan integration test yang relevan berhasil dijalankan.
- [ ] **AC Terpenuhi:** Semua Acceptance Criteria telah didemonstrasikan dan diverifikasi.
- [ ] **Dokumentasi Diperbarui:** Dokumentasi teknis (JSDoc, `README.md`) yang relevan telah dibuat atau diperbarui.
- [ ] **Disetujui PO:** Product Owner telah menerima story tersebut dalam Sprint Review.

---

## 11. Risk Management

| Risiko | Probabilitas | Dampak | Strategi Mitigasi |
| :--- | :---: | :---: | :--- |
| Keterbatasan platform Google Apps Script (batasan eksekusi, API) | Sedang | Tinggi | - Desain arsitektur asinkron dengan *queue*.<br>- Lakukan *load testing* lebih awal.<br>- Siapkan rencana migrasi ke platform lain (e.g., Cloud Functions) dalam roadmap jangka panjang. |
| Perubahan kebijakan pemerintah yang mendadak | Rendah | Tinggi | - Bangun sistem yang fleksibel dengan `Rule Engine`.<br>- Jaga komunikasi yang baik dengan pemangku kepentingan pemerintah. |
| Adopsi yang rendah dari aparat RT/RW | Sedang | Tinggi | - Fokus pada UI/UX yang sangat sederhana.<br>- Libatkan aparat dalam sesi UAT (User Acceptance Testing).<br>- Adakan pelatihan dan pendampingan intensif saat pilot. |

---

## 12. Technical Debt

Daftar ini melacak "utang teknis" yang harus "dibayar" di sprint-sprint mendatang.

| ID | Deskripsi Utang Teknis | Modul/Area | Prioritas |
| :--- | :--- | :--- | :---: |
| TD-001 | Belum ada framework unit testing formal (e.g., QUnit). | Testing | `HIGH` |
| TD-002 | Parsing `scriptId` dari `.clasp.json` menggunakan `grep`, rentan gagal. | DevOps | `MEDIUM` |
| TD-003 | Belum ada mekanisme caching untuk data yang sering diakses. | Framework | `MEDIUM` |
| TD-004 | Log error belum terpusat dan belum ada alerting. | Logging | `HIGH` |

---

## 13. Parking Lot

Daftar ide atau topik yang perlu didiskusikan lebih lanjut tetapi tidak masuk dalam lingkup sprint saat ini.

- Apakah kita perlu aplikasi mobile native atau cukup dengan Progressive Web App (PWA)?
- Bagaimana strategi monetisasi platform ini untuk pemerintah daerah di luar pilot project?
- Perlukah integrasi dengan sistem absensi sidik jari untuk aparat?
- Bagaimana menangani kasus warga yang tidak memiliki akses internet sama sekali?

---

## 14. Future Idea

- **Gamification:** Memberikan lencana (badges) atau poin kepada RT/RW dengan kinerja terbaik (berdasarkan Community Score) untuk mendorong kompetisi sehat.
- **Marketplace Modul:** Membuka platform agar developer pihak ketiga dapat membuat dan "menjual" modul mereka sendiri di ekosistem WK OS.
- **Integrasi IoT:** Mengintegrasikan data dari sensor IoT (e.g., sensor kualitas udara, sensor ketinggian air sungai) ke dalam Digital Brain.
- **Hyperlocal Social Media:** Membangun fitur media sosial yang sangat lokal (tingkat RW) untuk memperkuat kohesi sosial.