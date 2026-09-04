**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODUL SURAT (LETTER MODULE BLUEPRINT)**

---

## Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-011` |
| **Nama Dokumen** | Cetak Biru Modul Surat |
| **Versi** | 1.0 |
| **Status** | `DRAFT` |
| **Pemilik** | Enterprise Business Analyst |
| **Peninjau** | Chief Software Architect, Product Owner (Lurah Kebonjati) |
| **Persetujuan** | Steering Committee |

---

## 1. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Modul Surat (Letter Module)**, sebuah komponen krusial dalam platform WK Community OS yang bertujuan untuk mendigitalisasi dan mengotomatiskan proses layanan surat-menyurat di tingkat pemerintahan lokal. Modul ini akan menggantikan alur kerja manual yang lambat dan tidak efisien dengan sistem online yang terstruktur, transparan, dan dapat dilacak.

Fokus utama modul ini adalah mengelola seluruh siklus hidup pengajuan surat, mulai dari permohonan oleh warga, persetujuan berjenjang oleh RT, RW, dan Kelurahan, hingga penerbitan dokumen akhir. Dengan mengimplementasikan alur kerja digital yang andal, integrasi dengan tanda tangan digital dan verifikasi QR di masa depan, modul ini akan secara drastis mengurangi waktu layanan, meningkatkan efisiensi aparat, dan memberikan pengalaman yang jauh lebih baik bagi warga di **Kelurahan Kebonjati**.

## 2. Jenis Surat (Letter Types)

Modul ini akan mendukung beberapa jenis surat yang paling umum dibutuhkan oleh warga pada fase awal.

| Kode Surat | Nama Surat | Deskripsi | Dokumen Pendukung (Contoh) |
| :--- | :--- | :--- | :--- |
| **SKTM** | Surat Keterangan Tidak Mampu | Digunakan untuk keperluan pengajuan beasiswa, keringanan biaya rumah sakit, dll. | - Scan KK<br>- Scan KTP<br>- Foto Rumah |
| **DOMISILI** | Surat Keterangan Domisili | Menyatakan bahwa seorang warga benar-benar tinggal di alamat yang tercantum. | - Scan KK<br>- Scan KTP |
| **USAHA** | Surat Keterangan Usaha | Digunakan oleh pemilik UMKM untuk keperluan administrasi usaha, seperti pengajuan pinjaman. | - Scan KK<br>- Scan KTP<br>- Foto Tempat Usaha |
| **PENGANTAR**| Surat Pengantar Umum | Surat pengantar serbaguna untuk berbagai keperluan (e.g., pengantar pembuatan SKCK, KTP). | - Scan KK<br>- Scan KTP |
| **KELAHIRAN**| Surat Keterangan Kelahiran | Digunakan untuk proses pembuatan Akta Kelahiran. | - Scan KK<br>- Scan KTP Orang Tua<br>- Surat Keterangan Lahir dari Bidan/RS |
| **KEMATIAN** | Surat Keterangan Kematian | Digunakan untuk proses pembuatan Akta Kematian dan keperluan administrasi lainnya. | - Scan KK<br>- Scan KTP Almarhum/ah<br>- Surat Keterangan Kematian dari RS |

## 3. Workflow (Alur Kerja)

Alur kerja persetujuan surat dirancang secara berjenjang untuk memastikan validasi yang tepat di setiap tingkatan.

```ascii
  (*)
   |
   v
[Warga Mengajukan Surat via Portal]
   |
   v
<Sistem>
[Status: Menunggu Persetujuan RT]
   |
   v
[Ketua RT melakukan verifikasi data pemohon & kelengkapan syarat]
   |
   +-----> [Tolak] -----> (X)
   |
   v (Setuju)
<Sistem>
[Status: Menunggu Persetujuan RW]
   |
   v
[Ketua RW melakukan verifikasi]
   |
   +-----> [Tolak] -----> (X)
   |
   v (Setuju)
<Sistem>
[Status: Menunggu Persetujuan Kelurahan]
   |
   v
[Aparat Kelurahan melakukan verifikasi akhir & memberikan nomor surat]
   |
   +-----> [Tolak] -----> (X)
   |
   v (Setuju)
<Sistem>
[Status: Siap Diambil / Diunduh]
   |
   v
  (X)
```

### 3.1. Integrasi Tanda Tangan Digital (Future)

Pada fase mendatang, setelah persetujuan Aparat Kelurahan, sistem akan secara otomatis memanggil layanan Tanda Tangan Digital (misalnya, dari BSrE) untuk membubuhkan tanda tangan elektronik yang sah secara hukum pada dokumen PDF yang dihasilkan.

### 3.2. Integrasi Verifikasi QR (Future)

Setiap surat yang diterbitkan akan memiliki QR Code unik. Ketika dipindai, QR Code ini akan mengarah ke sebuah halaman verifikasi di server WK Community OS yang menampilkan detail surat (Nomor Surat, Jenis Surat, Nama Pemohon, Tanggal Terbit, Status). Ini untuk mencegah pemalsuan dokumen.

## 4. Notification (Notifikasi)

| Pemicu | Target Notifikasi | Kanal | Isi Pesan (Contoh) |
| :--- | :--- | :--- | :--- |
| Pengajuan surat baru | Ketua RT | Email / App | "Ada pengajuan [Jenis Surat] dari [Nama Warga] yang menunggu persetujuan Anda." |
| Persetujuan oleh RT | Ketua RW | Email / App | "Ada pengajuan [Jenis Surat] dari [Nama Warga] yang telah disetujui RT dan menunggu persetujuan Anda." |
| Persetujuan oleh RW | Aparat Kelurahan | Email / App | "Pengajuan [Jenis Surat] dari [Nama Warga] menunggu verifikasi dan penomoran." |
| Surat ditolak | Warga Pemohon | Email | "Mohon maaf, pengajuan [Jenis Surat] Anda ditolak dengan alasan: [Alasan Penolakan]." |
| Surat siap diambil | Warga Pemohon | Email | "Surat [Jenis Surat] Anda telah selesai diproses dan siap untuk diambil/diunduh." |

## 5. Dashboard (Dasbor)

Modul Surat akan menyumbangkan data untuk *widget* dasbor berikut:
- **Scorecard:** Jumlah Total Surat Diajukan (Bulan Ini), Jumlah Surat Selesai, Jumlah Surat Tertunda.
- **Grafik Batang:** Jumlah Pengajuan per Jenis Surat.
- **Grafik Garis:** Tren Pengajuan Surat Harian/Mingguan.
- **Tabel:** Daftar 5 Pengajuan Surat Terbaru dengan Statusnya.
- **KPI:** Rata-rata Waktu Penyelesaian Layanan Surat (dalam jam).

## 6. Rule Engine Integration

*Rule Engine* digunakan untuk validasi persyaratan pengajuan surat secara otomatis.

- **Contoh Aturan 1 (SKTM):** `IF (surat.jenis == 'SKTM' && warga.pendapatan > UMR) THEN REJECT('Pendapatan melebihi syarat untuk SKTM')`
- **Contoh Aturan 2 (Kematian):** `IF (surat.jenis == 'KEMATIAN' && warga.status != 'Meninggal') THEN REJECT('Status warga pemohon belum diubah menjadi Meninggal')`
- **Proses:** Sebelum pengajuan surat dibuat, `LetterService` akan memanggil `RuleEngine.evaluate('letter.before_create', {surat: suratData, warga: wargaData})` untuk memastikan semua prasyarat terpenuhi.

## 7. Sequence Diagram (ASCII)

**Skenario: Pengajuan Surat oleh Warga**

```ascii
  Warga            :UI/Frontend         :LetterController      :LetterService       :WorkflowEngine
    |                  |                       |                    |                    |
    | Pilih Jenis Surat|                       |                    |                    |
    | & Isi Form       |                       |                    |                    |
    |----------------->|                       |                    |                    |
    |                  | submit(letterData)    |                    |                    |
    |                  |---------------------->|                    |                    |
    |                  |                       | create(letterData) |                    |
    |                  |                       |------------------->|                    |
    |                  |                       |                    | validate(data)     |
    |                  |                       |                    |------------------->| (Rule Engine)
    |                  |                       |                    |                    |
    |                  |                       |                    | startWorkflow()    |
    |                  |                       |                    |------------------->|
    |                  |                       |                    |                    |
    |                  |                       |                    | returns newLetter  |
    |                  |                       |<-------------------|                    |
    |                  |                       |                    |                    |
    |                  | returns successMsg    |                    |                    |
    |                  |<----------------------|                    |                    |
    |                  |                       |                    |                    |
    | Tampilkan Status |                       |                    |                    |
    |<-----------------|                       |                    |                    |
    |                  |                       |                    |                    |
```

## 8. Testing Scenario

| ID | Skenario Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| TS-LET-01 | Warga berhasil mengajukan Surat Domisili dengan data lengkap. | Pengajuan tersimpan dengan status "Menunggu Persetujuan RT". Notifikasi terkirim ke Ketua RT. |
| TS-LET-02 | Warga mencoba mengajukan SKTM tetapi data pendapatan di profilnya di atas UMR. | Sistem (via Rule Engine) menolak pengajuan dan menampilkan pesan error yang sesuai. |
| TS-LET-03 | Ketua RT menyetujui pengajuan. | Status surat berubah menjadi "Menunggu Persetujuan RW". Notifikasi terkirim ke Ketua RW. |
| TS-LET-04 | Ketua RW menolak pengajuan dengan memberikan alasan. | Status surat berubah menjadi "Ditolak". Notifikasi penolakan beserta alasannya terkirim ke warga. |
| TS-LET-05 | Aparat Kelurahan menyetujui pengajuan. | Status surat berubah menjadi "Siap Diambil". Sistem menghasilkan nomor surat. Notifikasi terkirim ke warga. |
| TS-LET-06 | Pengguna dengan peran "Warga" mencoba mengakses halaman persetujuan. | Sistem menolak akses dan menampilkan pesan "Akses Ditolak". |

## 9. Acceptance Criteria

- Sistem mampu mengelola pengajuan untuk semua jenis surat yang didefinisikan (SKTM, Domisili, dll.).
- Alur kerja persetujuan berjenjang (RT -> RW -> Kelurahan) berfungsi sesuai dengan diagram alur.
- Notifikasi terkirim secara otomatis ke pihak yang relevan pada setiap perubahan status.
- Data dari Modul Surat teragregasi dan ditampilkan dengan benar pada dasbor.
- Aturan bisnis yang didefinisikan di *Rule Engine* berhasil mencegah pengajuan yang tidak memenuhi syarat.
- Hak akses untuk menyetujui atau menolak pengajuan dibatasi sesuai dengan peran pengguna (RT, RW, Kelurahan).
- Semua skenario pengujian (Testing Scenario) berhasil dijalankan tanpa error kritis.