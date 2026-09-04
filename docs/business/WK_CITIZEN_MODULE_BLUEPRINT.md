**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL WARGA (CITIZEN MODULE BLUEPRINT)**

---

## Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-009` |
| **Nama Dokumen** | Cetak Biru Modul Warga |
| **Versi** | 1.0 |
| **Status** | `DRAFT` |
| **Pemilik** | Enterprise Business Analyst |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee |

---

## 1. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul Warga (Citizen Module)**, komponen paling fundamental dalam platform WK Community OS. Modul ini bertanggung jawab untuk mengelola seluruh siklus hidup data kependudukan, mulai dari pencatatan kelahiran, perpindahan, hingga kematian.

Tujuan utama modul ini adalah untuk menciptakan satu sumber kebenaran (*single source of truth*) untuk data warga di wilayah implementasi, dimulai dari **Kelurahan Kebonjati**. Dengan data yang akurat, terpusat, dan terstruktur, modul ini akan menjadi fondasi bagi semua modul lain (seperti Layanan Surat, Kesehatan, Bantuan Sosial) dan menjadi bahan bakar utama bagi komponen intelijen platform. Dokumen ini merinci tujuan bisnis, proses, persyaratan, aturan, dan kriteria penerimaan untuk memastikan pengembangan modul yang sukses dan sesuai dengan kebutuhan.

## 2. Business Objective

- **Meningkatkan Akurasi Data:** Mencapai tingkat akurasi data kependudukan di atas 98% dengan menghilangkan redundansi dan inkonsistensi antara catatan RT, RW, dan Kelurahan.
- **Mempercepat Verifikasi Data:** Mengurangi waktu yang dibutuhkan aparat untuk memverifikasi data seorang warga saat memproses layanan.
- **Menyediakan Fondasi Analitik:** Menyediakan data demografis yang bersih dan terstruktur untuk kebutuhan dasbor pimpinan dan analisis kebijakan.
- **Menyederhanakan Pengelolaan Data:** Memberikan antarmuka yang mudah digunakan bagi aparat RT untuk mendata dan memperbarui informasi warganya.

## 3. Business Scope

| Kategori | Deskripsi |
| :--- | :--- |
| **In Scope** | - Pencatatan data warga baru (karena lahir atau pindah masuk).<br>- Pembaruan data warga (perubahan status perkawinan, pekerjaan, dll.).<br>- Pencatatan perpindahan warga (keluar dari wilayah).<br>- Pencatatan kematian warga.<br>- Pengelolaan data Kartu Keluarga (KK) dan hubungan antar anggota keluarga.<br>- Validasi dan persetujuan perubahan data oleh aparat berwenang. |
| **Out of Scope**| - Proses pengajuan KTP atau dokumen kependudukan nasional lainnya (hanya surat pengantar).<br>- Integrasi langsung secara *real-time* dengan database Dukcapil Nasional (pada fase awal).<br>- Pencatatan riwayat biometrik (sidik jari, retina). |

## 4. Stakeholder

| Stakeholder | Peran dalam Konteks Modul Warga |
| :--- | :--- |
| **Warga** | Subjek data; pihak yang datanya dikelola dan yang mengajukan pembaruan data. |
| **Ketua RT** | Petugas pendata primer; bertanggung jawab atas keakuratan data warga di lingkungannya. |
| **Ketua RW** | Verifikator sekunder; memberikan persetujuan atas perubahan data yang signifikan. |
| **Aparat Kelurahan** | Administrator data utama; memiliki hak akses tertinggi untuk mengelola dan mengesahkan data. |
| **Lurah** | Pengguna data agregat; membutuhkan data demografis yang akurat untuk laporan dan kebijakan. |

## 5. Business Process

Proses bisnis utama dalam modul ini adalah **Manajemen Data Induk Kependudukan**.

```ascii
(Warga/Aparat RT)      (Sistem WK OS)        (Aparat RT)        (Aparat Kelurahan)
      |                      |                    |                      |
      |---[1. Input Data]---->|                    |                      |
      |                      |---[2. Validasi]---->|                      |
      |                      |                    |---[3. Verifikasi]-->|
      |                      |                    |                      |---[4. Persetujuan]-->|
      |                      |<--[5. Notifikasi]---|----------------------|                      |
      |                      |                    |                      |                      |
      |<----[6. Selesai]-----|                    |                      |                      |
```

1.  **Input Data:** Warga (melalui portal) atau aparat RT (melalui aplikasi internal) memasukkan data baru atau perubahan data.
2.  **Validasi Sistem:** Sistem secara otomatis memvalidasi format dan kelengkapan data.
3.  **Verifikasi RT:** Ketua RT memeriksa kebenaran data yang diinput.
4.  **Persetujuan Kelurahan:** Aparat Kelurahan memberikan persetujuan akhir untuk perubahan data krusial.
5.  **Notifikasi:** Sistem memberitahukan status persetujuan kepada pemohon.
6.  **Selesai:** Data resmi diperbarui di database pusat.

## 6. Citizen Lifecycle

| Lifecycle Event | Deskripsi Proses |
| :--- | :--- |
| **Kelahiran** | 1. Warga (orang tua) melaporkan kelahiran.<br>2. Aparat RT membuat data warga baru dengan status "Bayi".<br>3. Data baru ditambahkan ke KK orang tua.<br>4. Aparat Kelurahan mengesahkan data setelah menerima dokumen pendukung (Surat Keterangan Lahir). |
| **Penduduk Baru** | 1. Warga baru melapor ke RT dengan membawa surat pindah.<br>2. Aparat RT membuat data KK dan data warga baru dengan status "Pindahan Masuk".<br>3. Aparat Kelurahan memvalidasi dan menyetujui data. |
| **Update Data** | 1. Warga mengajukan perubahan data (misal: status perkawinan dari 'Belum Kawin' ke 'Kawin').<br>2. Warga melampirkan dokumen pendukung (misal: buku nikah).<br>3. Perubahan data memerlukan persetujuan berjenjang (RT -> Kelurahan). |
| **Pindah** | 1. Warga mengajukan permohonan pindah.<br>2. Setelah disetujui dan surat pindah diterbitkan, status warga di sistem diubah menjadi "Pindah Keluar".<br>3. Data warga tidak dihapus, tetapi diarsip dan tidak lagi dihitung dalam populasi aktif. |
| **Meninggal** | 1. Keluarga melapor ke RT dengan membawa surat keterangan kematian.<br>2. Aparat RT mengubah status warga menjadi "Meninggal".<br>3. Data diarsip. Jika yang meninggal adalah Kepala Keluarga, sistem akan meminta penunjukan Kepala Keluarga baru. |

## 7. Functional Requirement

| ID | Persyaratan Fungsional | Prioritas |
| :--- | :--- | :--- |
| FR-CIT-001 | Sistem harus dapat membuat, membaca, memperbarui, dan menonaktifkan (CRUD) data `Warga`. | Tinggi |
| FR-CIT-002 | Sistem harus dapat membuat, membaca, memperbarui, dan menonaktifkan (CRUD) data `KartuKeluarga`. | Tinggi |
| FR-CIT-003 | Sistem harus dapat menghubungkan entitas `Warga` ke entitas `KartuKeluarga` yang sesuai. | Tinggi |
| FR-CIT-004 | Sistem harus dapat mencatat riwayat perubahan pada data krusial (misal: status perkawinan, alamat). | Sedang |
| FR-CIT-005 | Sistem harus menyediakan fungsi pencarian warga berdasarkan NIK, Nama, atau Nomor KK. | Tinggi |
| FR-CIT-006 | Sistem harus dapat menampilkan profil detail seorang warga, termasuk data keluarga dalam satu KK. | Tinggi |
| FR-CIT-007 | Sistem harus dapat mengelola alur kerja persetujuan untuk setiap perubahan data. | Tinggi |

## 8. Non-Functional Requirement

| Kategori | Persyaratan |
| :--- | :--- |
| **Kinerja** | - Waktu muat halaman profil warga harus kurang dari 3 detik.<br>- Waktu respons pencarian data harus kurang dari 2 detik. |
| **Keamanan** | - Data NIK dan tanggal lahir harus dienkripsi saat disimpan.<br>- Akses ke data warga harus dicatat dalam log audit. |
| **Usabilitas** | - Antarmuka untuk aparat RT harus sangat sederhana dan dapat dioperasikan di perangkat mobile (web responsif). |
| **Skalabilitas**| - Sistem harus mampu menangani data hingga 100.000 warga tanpa degradasi kinerja yang signifikan. |
| **Ketersediaan**| - Uptime sistem harus mencapai 99.5%. |

## 9. Business Rule

- Setiap `Warga` harus memiliki NIK yang unik.
- Setiap `Warga` harus terhubung ke satu dan hanya satu `KartuKeluarga`.
- Setiap `KartuKeluarga` harus memiliki satu `Warga` yang ditunjuk sebagai "Kepala Keluarga".
- Perubahan data yang menyangkut status hukum (perkawinan, kematian) wajib melampirkan bukti digital.
- Warga dengan status "Pindah Keluar" atau "Meninggal" tidak dihitung dalam statistik populasi aktif.

## 10. Workflow

**Alur Kerja: Pembaruan Data Warga**

```ascii
[Warga/RT] -> [Submit Perubahan] -> [Status: Menunggu Verifikasi RT]
                                          |
                                          v (RT Verifikasi)
                                [Status: Menunggu Persetujuan Kelurahan]
                                          |
                                          v (Kelurahan Setujui)
                                [Status: Disetujui] -> [Update Database] -> [Selesai]
                                          |
                                          v (Kelurahan Tolak)
                                [Status: Ditolak] -> [Selesai]
```

## 11. Data Validation

| Field | Aturan Validasi | Pesan Error |
| :--- | :--- | :--- |
| **NIK** | - Harus 16 digit.<br>- Harus unik.<br>- Harus berupa angka. | "NIK harus 16 digit angka." / "NIK sudah terdaftar." |
| **Tanggal Lahir** | - Format harus `DD-MM-YYYY`.<br>- Tidak boleh tanggal di masa depan. | "Format tanggal lahir tidak valid." |
| **No. KK** | - Harus 16 digit.<br>- Harus berupa angka. | "Nomor KK harus 16 digit angka." |
| **Email** | - Harus mengikuti format email standar. | "Format email tidak valid." |

## 12. Dashboard

Modul Warga akan menyumbangkan data untuk *widget* dasbor berikut:
- **Scorecard:** Jumlah Total Warga, Jumlah Total KK.
- **Grafik Batang:** Jumlah Warga per Jenjang Pendidikan.
- **Grafik Pai:** Komposisi Warga berdasarkan Jenis Kelamin.
- **Grafik Piramida:** Piramida Penduduk berdasarkan Kelompok Usia.
- **Tabel:** Daftar Warga Pendatang Baru dalam 30 hari terakhir.

## 13. Notification

| Pemicu | Target Notifikasi | Kanal | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| Pengajuan perubahan data | Ketua RT | Email / App | "Ada pengajuan perubahan data dari warga [Nama Warga] yang perlu diverifikasi." |
| Verifikasi oleh RT | Aparat Kelurahan | Email / App | "Data warga [Nama Warga] telah diverifikasi oleh RT dan menunggu persetujuan Anda." |
| Persetujuan/Penolakan | Warga Pemohon | Email | "Pengajuan perubahan data Anda telah disetujui." |

## 14. Rule Engine Integration

Modul Warga akan berinteraksi dengan *Rule Engine* untuk validasi bisnis yang kompleks.
- **Contoh Aturan:** `IF (warga.usia >= 17 && warga.status_ktp == 'Belum Punya') THEN create_task('Rekomendasi Pembuatan KTP')`
- **Proses:** Setiap kali data warga diperbarui, `CitizenService` akan memanggil `RuleEngine.evaluate('citizen.on_update', citizen_data)` untuk memeriksa apakah ada aturan yang terpicu.

## 15. Community Score Integration

Data dari Modul Warga menjadi input utama untuk beberapa sub-indeks *Community Score*.
- **Education Score:** Dihitung dari agregat data `warga.pendidikan_terakhir`.
- **Health Score:** Dihitung dari data warga yang berstatus stunting atau memiliki penyakit kronis.
- **Economy Score:** Dihitung dari agregat data `warga.pekerjaan` dan `warga.pendapatan`.

## 16. Future AI Integration

- **Deteksi Anomali Data:** AI dapat dilatih untuk mendeteksi pola data yang tidak wajar, misalnya satu alamat dihuni oleh puluhan KK yang tidak saling berhubungan.
- **Prediksi Demografi:** Menggunakan data historis untuk memprediksi pertumbuhan populasi, kebutuhan sekolah, atau jumlah pemilih pemula di masa depan.
- **Segmentasi Warga Cerdas:** Mengelompokkan warga secara otomatis berdasarkan berbagai atribut untuk penargetan program bantuan sosial yang lebih efektif.

## 17. Sequence Diagram (ASCII)

**Skenario: Pendaftaran Warga Baru oleh Aparat RT**

```ascii
 Aparat RT        :UI/Frontend         :CitizenController     :CitizenService      :CitizenRepository
     |                  |                       |                    |                    |
     | Fill Form        |                       |                    |                    |
     |----------------->|                       |                    |                    |
     |                  | submit(citizenData)   |                    |                    |
     |                  |---------------------->|                    |                    |
     |                  |                       | create(citizenData)|                    |
     |                  |                       |------------------->|                    |
     |                  |                       |                    | validate(data)     |
     |                  |                       |                    |------------------->|
     |                  |                       |                    |                    |
     |                  |                       |                    | save(data)         |
     |                  |                       |                    |------------------->|
     |                  |                       |                    |       (DB)         |
     |                  |                       |                    |<-------------------|
     |                  |                       |                    | returns newCitizen |
     |                  |                       |<-------------------|                    |
     |                  |                       | returns successMsg |                    |
     |                  |<----------------------|                    |                    |
     |                  |                       |                    |                    |
     | Show Success     |                       |                    |                    |
     |<-----------------|                       |                    |                    |
     |                  |                       |                    |                    |
```

## 18. Activity Diagram (ASCII)

**Skenario: Alur Kerja Persetujuan Perubahan Alamat**

```ascii
  (*)
   |
   v
[Warga Mengajukan Perubahan Alamat]
   |
   v
<Sistem>
[Validasi Data & Lampiran]
   |
   v
[Status: Menunggu Verifikasi RT]
   |
   v
[Ketua RT Melakukan Verifikasi] --> [Tolak] --+
   |                                          |
   v (Setuju)                                 |
[Status: Menunggu Persetujuan Kelurahan]      |
   |                                          |
   v                                          |
[Aparat Kelurahan Melakukan Persetujuan] --> [Tolak] --+
   |                                                   |
   v (Setuju)                                          |
<Sistem>                                               |
[Perbarui Data di Database]                            |
   |                                                   |
   v                                                   |
[Kirim Notifikasi "Disetujui"]                         |
   |                                                   |
   +---------------------------------------------------+
   |
   v
  (X)
```

## 19. CRUD Matrix

| Entitas | Aparat Kelurahan | Ketua RW | Ketua RT | Warga |
| :--- | :---: | :---: | :---: | :---: |
| **Warga** | C R U D | R | C R U | R U(own) |
| **Kartu Keluarga** | C R U D | R | C R U | R(own) |

**Legenda:** C=Create, R=Read, U=Update, D=Delete/Deactivate, (own)=Hanya data milik sendiri.

## 20. User Permission Matrix

| Aksi | Admin Sistem | Aparat Kelurahan | Ketua RW | Ketua RT | Warga |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **citizen.create** | ✓ | ✓ | ✓ | ✓ | |
| **citizen.view.all** | ✓ | ✓ | ✓ | | |
| **citizen.view.own_area** | ✓ | ✓ | ✓ | ✓ | |
| **citizen.view.own_data** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **citizen.update.all** | ✓ | ✓ | | | |
| **citizen.update.own_area**| ✓ | ✓ | ✓ | ✓ | |
| **citizen.update.own_data**| ✓ | ✓ | ✓ | ✓ | ✓ |
| **citizen.delete** | ✓ | ✓ | | | |
| **citizen.approve.lurah**| ✓ | ✓ | | | |
| **citizen.approve.rw** | ✓ | ✓ | ✓ | | |
| **citizen.approve.rt** | ✓ | ✓ | ✓ | ✓ | |

## 21. Testing Scenario

| ID | Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| TS-CIT-01 | Pengguna (RT) berhasil menambahkan warga baru dengan data yang valid. | Data warga baru tersimpan, status "Menunggu Persetujuan Kelurahan". |
| TS-CIT-02 | Pengguna (RT) mencoba menambahkan warga dengan NIK yang sudah ada. | Sistem menampilkan pesan error "NIK sudah terdaftar" dan data tidak tersimpan. |
| TS-CIT-03 | Warga mengubah nomor teleponnya. | Perubahan tersimpan tanpa memerlukan alur persetujuan. |
| TS-CIT-04 | Warga mengubah status perkawinannya. | Perubahan masuk ke alur kerja dan menunggu verifikasi RT. |
| TS-CIT-05 | Aparat Kelurahan menolak perubahan data. | Status perubahan menjadi "Ditolak" dan notifikasi dikirim ke pemohon. |

## 22. Acceptance Criteria

- Modul dapat melakukan operasi CRUD pada data Warga dan KK sesuai dengan matriks perizinan.
- Alur kerja persetujuan untuk perubahan data krusial berjalan sesuai dengan diagram aktivitas.
- Semua aturan validasi data diimplementasikan dan berfungsi dengan benar.
- Data dari modul ini berhasil ditampilkan pada widget-widget dasbor yang relevan.
- Semua skenario pengujian (Testing Scenario) berhasil dijalankan tanpa error kritis.
- Dokumentasi teknis (`README.md`) dan JSDoc untuk semua fungsi publik telah lengkap.