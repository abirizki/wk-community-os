**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL KARTU KELUARGA (FAMILY MODULE BLUEPRINT)**

---

## Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-010` |
| **Nama Dokumen** | Cetak Biru Modul Kartu Keluarga |
| **Versi** | 1.0 |
| **Status** | `DRAFT` |
| **Pemilik** | Enterprise Business Analyst |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee |

---

## 1. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul Kartu Keluarga (Family Module)** dalam platform WK Community OS. Modul ini berfokus pada pengelolaan entitas Kartu Keluarga (KK) sebagai unit sosial dan administratif fundamental dalam sebuah komunitas.

Tujuan utama modul ini adalah untuk menyediakan fungsionalitas yang andal dalam mengelola seluruh siklus hidup KK, termasuk pembuatan KK baru, pembaruan anggota, proses pisah dan gabung KK, serta penonaktifan. Dengan mengelola data KK secara akurat, modul ini menjadi penghubung krusial antara data `Warga` individu dan data `Wilayah` administratif. Keberhasilan modul ini akan memastikan integritas data silsilah, mempermudah penargetan program berbasis keluarga (misalnya, bantuan sosial), dan menyediakan data agregat yang akurat untuk perencanaan strategis di **Kelurahan Kebonjati**.

## 2. Business Goal

- **Menjaga Integritas Struktur Keluarga:** Memastikan data hubungan antar anggota keluarga dalam satu KK selalu akurat dan mutakhir.
- **Menyederhanakan Proses Administrasi KK:** Mengotomatiskan proses yang kompleks seperti pisah atau gabung KK, yang secara tradisional memerlukan banyak dokumen manual.
- **Menyediakan Dasar untuk Program Berbasis Keluarga:** Menyediakan data yang valid untuk program-program pemerintah yang menargetkan unit keluarga, seperti Program Keluarga Harapan (PKH) atau bantuan stunting.
- **Meningkatkan Kualitas Data Agregat:** Menghasilkan data agregat yang akurat mengenai jumlah dan komposisi keluarga di setiap wilayah.

## 3. KK Lifecycle (Siklus Hidup Kartu Keluarga)

Siklus hidup KK mencakup semua peristiwa bisnis utama yang memengaruhi komposisi dan status sebuah unit keluarga.

| Lifecycle Event | Deskripsi Proses |
| :--- | :--- |
| **Tambah KK** | 1. Terjadi karena ada keluarga baru yang pindah masuk atau terbentuknya keluarga baru dari proses "Pisah KK".<br>2. Aparat RT membuat entitas `KartuKeluarga` baru.<br>3. Menunjuk satu `Warga` sebagai Kepala Keluarga.<br>4. Menambahkan anggota keluarga lainnya dan mendefinisikan hubungan mereka terhadap Kepala Keluarga.<br>5. Proses ini memerlukan persetujuan dari Aparat Kelurahan. |
| **Update KK** | 1. Terjadi karena ada perubahan internal: kelahiran anggota baru, kematian anggota, atau perubahan data Kepala Keluarga.<br>2. **Kelahiran:** Menambahkan `Warga` baru ke dalam KK.<br>3. **Kematian:** Mengubah status `Warga` menjadi "Meninggal". Jika yang meninggal adalah Kepala Keluarga, sistem akan mewajibkan penunjukan Kepala Keluarga baru dari anggota yang tersisa.<br>4. Perubahan ini dicatat dalam riwayat KK. |
| **Pisah KK** | 1. Terjadi ketika seorang anggota keluarga (misalnya, anak yang sudah menikah) membentuk keluarga baru.<br>2. Sistem akan memandu aparat melalui alur kerja "Pisah KK".<br>3. `Warga` yang bersangkutan akan dipindahkan dari KK lama.<br>4. Sebuah entitas `KartuKeluarga` baru akan dibuat dengan warga tersebut sebagai Kepala Keluarga.<br>5. Alamat KK baru dapat sama atau berbeda dari KK lama. |
| **Gabung KK** | 1. Proses yang lebih jarang terjadi, misalnya seorang individu (dari KK tunggal) bergabung ke dalam keluarga lain karena perkawinan.<br>2. Seluruh anggota dari KK yang akan digabung dipindahkan ke KK tujuan.<br>3. KK lama kemudian diubah statusnya menjadi "Tidak Aktif".<br>4. Proses ini memerlukan validasi dan persetujuan ketat dari Aparat Kelurahan. |
| **Pindah KK** | 1. Terjadi ketika seluruh anggota keluarga dalam satu KK pindah keluar dari wilayah administratif Kelurahan.<br>2. Status KK diubah menjadi "Pindah Keluar".<br>3. Semua anggota keluarga di dalamnya juga diperbarui statusnya.<br>4. Data tidak dihapus, tetapi diarsip untuk keperluan historis. |
| **KK Tidak Aktif**| 1. Status ini diberikan kepada KK yang sudah tidak valid lagi karena proses "Gabung KK" atau jika semua anggotanya telah "Pindah Keluar" atau "Meninggal".<br>2. KK yang tidak aktif tidak akan muncul dalam pencarian default atau dihitung dalam statistik aktif. |

## 4. Business Rule

- Setiap `KartuKeluarga` harus terikat pada satu dan hanya satu `Wilayah` (RT).
- Setiap `KartuKeluarga` aktif harus memiliki tepat satu `Warga` dengan status hubungan "Kepala Keluarga".
- Seorang `Warga` hanya dapat menjadi anggota dari satu `KartuKeluarga` aktif pada satu waktu.
- Proses "Pisah KK" hanya dapat dilakukan jika anggota yang akan pisah sudah dewasa (misalnya, usia > 17 tahun atau status "Kawin").
- Penunjukan Kepala Keluarga baru hanya dapat dilakukan dari anggota keluarga yang masih aktif di dalam KK tersebut.

## 5. Validation Rule

| Field/Proses | Aturan Validasi | Pesan Error |
| :--- | :--- | :--- |
| **Nomor KK** | - Harus 16 digit angka.<br>- Harus unik di seluruh sistem. | "Nomor KK harus 16 digit angka." / "Nomor KK sudah terdaftar." |
| **Kepala Keluarga**| - Tidak boleh kosong saat membuat KK baru.<br>- Harus merupakan anggota dari KK tersebut. | "Kepala Keluarga wajib diisi." |
| **Tambah Anggota**| - NIK yang ditambahkan harus sudah terdaftar di Modul Warga.<br>- NIK tersebut tidak boleh terdaftar di KK aktif lainnya. | "Warga dengan NIK tersebut tidak ditemukan." / "Warga sudah terdaftar di KK lain." |
| **Pisah KK** | - Anggota yang akan pisah tidak boleh menjadi satu-satunya anggota dewasa di KK lama. | "Tidak dapat melakukan pisah KK, harus ada minimal satu orang dewasa yang tersisa." |

## 6. Workflow

**Alur Kerja: Proses Pisah KK**

```ascii
  (*)
   |
   v
[Aparat RT memilih opsi "Pisah KK" pada KK asal]
   |
   v
[Sistem menampilkan daftar anggota KK asal]
   |
   v
[Aparat RT memilih anggota yang akan pisah]
   |
   v
<Sistem>
[Validasi: Periksa apakah anggota memenuhi syarat]
   |
   v (Syarat Terpenuhi)
[Aparat RT mengisi data untuk KK baru (No. KK baru, Alamat baru)]
   |
   v
<Sistem>
[1. Buat entitas KK baru dengan status "Menunggu Persetujuan"]
[2. Pindahkan anggota terpilih dari KK lama ke KK baru]
[3. Tetapkan anggota tersebut sebagai Kepala Keluarga di KK baru]
   |
   v
[Status: Menunggu Persetujuan Kelurahan]
   |
   v
[Aparat Kelurahan melakukan verifikasi & persetujuan]
   |
   v (Setuju)
<Sistem>
[1. Ubah status KK baru menjadi "Aktif"]
[2. Simpan perubahan pada KK lama]
[3. Kirim notifikasi]
   |
   v
  (X)
```

## 7. Dashboard

Modul Keluarga akan menyumbangkan data untuk *widget* dasbor berikut:
- **Scorecard:** Jumlah Total Kartu Keluarga Aktif.
- **Grafik Garis:** Tren Penambahan KK Baru per Bulan.
- **Tabel:** Daftar KK Baru yang Terbentuk dalam 30 Hari Terakhir.
- **Statistik:** Rata-rata Jumlah Anggota per KK.

## 8. Notification

| Pemicu | Target Notifikasi | Kanal | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| Pembuatan KK baru | Aparat Kelurahan | Email / App | "Ada pengajuan KK baru ([No. KK]) di wilayah RT [No. RT] yang memerlukan persetujuan Anda." |
| Proses Pisah KK disetujui | Ketua RT | Email / App | "Proses Pisah KK untuk [Nama Kepala Keluarga Baru] telah disetujui. KK baru telah aktif." |
| Kepala Keluarga meninggal | Ketua RT | App | "Kepala Keluarga dari KK [No. KK] telah meninggal. Harap segera menunjuk Kepala Keluarga yang baru." |

## 9. Rule Engine Integration

*Rule Engine* akan digunakan untuk memeriksa kelayakan keluarga terhadap program pemerintah.
- **Contoh Aturan:** `IF (kk.jumlah_tanggungan > 4 && kk.status_ekonomi == 'Miskin') THEN kk.is_eligible_for_pkh = true`
- **Proses:** Sebuah proses *batch* malam hari akan menjalankan `RuleEngine.evaluate('family.check_eligibility', all_kk_data)` untuk memperbarui status kelayakan setiap keluarga secara berkala.

## 10. CRUD Matrix

| Entitas | Aparat Kelurahan | Ketua RW | Ketua RT | Warga |
| :--- | :---: | :---: | :---: | :---: |
| **Kartu Keluarga** | C R U D | R | C R U | R(own) |
| **Anggota Keluarga**| C R U D | R | C R U | R(own) |

**Legenda:** C=Create, R=Read, U=Update, D=Delete/Deactivate, (own)=Hanya data KK sendiri.

## 11. Permission Matrix

| Aksi | Admin Sistem | Aparat Kelurahan | Ketua RW | Ketua RT |
| :--- | :---: | :---: | :---: | :---: |
| **family.create** | ✓ | ✓ | ✓ | ✓ |
| **family.view.all** | ✓ | ✓ | | |
| **family.view.own_kecamatan**| ✓ | ✓ | | |
| **family.view.own_kelurahan**| ✓ | ✓ | ✓ | |
| **family.view.own_rw** | ✓ | ✓ | ✓ | ✓ |
| **family.update** | ✓ | ✓ | | ✓ |
| **family.split** | ✓ | ✓ | | ✓ |
| **family.merge** | ✓ | ✓ | | |
| **family.deactivate** | ✓ | ✓ | | |
| **family.approve** | ✓ | ✓ | | |

## 12. Testing Scenario

| ID | Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| TS-FAM-01 | Pengguna (RT) berhasil membuat KK baru dengan 1 Kepala Keluarga dan 2 anggota. | Data KK baru dan 3 anggota tersimpan. Status KK "Menunggu Persetujuan". |
| TS-FAM-02 | Pengguna (RT) mencoba membuat KK tanpa menunjuk Kepala Keluarga. | Sistem menampilkan pesan error "Kepala Keluarga wajib diisi." |
| TS-FAM-03 | Pengguna (RT) melakukan proses "Pisah KK" untuk seorang anak yang sudah menikah. | KK baru berhasil dibuat dengan anak tersebut sebagai Kepala Keluarga. Anggota di KK lama berkurang satu. |
| TS-FAM-04 | Kepala Keluarga dari sebuah KK meninggal. Sistem di-update. | Status warga tersebut menjadi "Meninggal". Sistem menampilkan peringatan pada data KK tersebut bahwa "Kepala Keluarga perlu ditunjuk ulang". |
| TS-FAM-05 | Pengguna (RT) mencoba menambahkan warga yang sudah terdaftar di KK lain. | Sistem menampilkan pesan error "Warga sudah terdaftar di KK lain." |

## 13. Acceptance Criteria

- Sistem mampu menangani seluruh siklus hidup KK (Tambah, Update, Pisah, Gabung, Pindah, Tidak Aktif) sesuai alur kerja yang didefinisikan.
- Semua aturan bisnis dan validasi data terkait entitas `KartuKeluarga` dan anggotanya telah diimplementasikan.
- Matriks perizinan (CRUD & Permission) diterapkan dengan benar, membatasi aksi pengguna sesuai perannya.
- Data agregat dari Modul Keluarga (Jumlah KK, dll.) ditampilkan dengan benar di dasbor.
- Notifikasi terkirim sesuai dengan pemicu yang telah ditentukan.
- Semua skenario pengujian (Testing Scenario) berhasil dijalankan tanpa error kritis.