# BUKU PANDUAN OPERASIONAL & STANDAR OPERASIONAL PROSEDUR (SOP) DIGITAL
## SISTEM INFORMASI PELAYANAN PUBLIK TERPADU "BUMI WARGA"
### PEMERINTAH KOTA SUKABUMI — PROVINSI JAWA BARAT

---

## DAFTAR ISI

1. [Bab I: Ketentuan Umum & Tata Kelola Pengguna](#bab-i-ketentuan-umum--tata-kelola-pengguna)
2. [Bab II: Standar Hak Akses & Pembagian Peran (RBAC)](#bab-ii-standar-hak-akses--pembagian-peran-rbac)
3. [Bab III: SOP Layanan Surat Administrasi Kependudukan Digital](#bab-iii-sop-layanan-surat-administrasi-kependudukan-digital)
4. [Bab IV: SOP Penyaluran Bantuan Sosial Presisi & Peringkat Desil 1–10](#bab-iv-sop-penyaluran-bantuan-sosial-presisi--peringkat-desil-110)
5. [Bab V: SOP Pelayanan Posyandu Digital (Balita, Lansia & Mode Luring)](#bab-v-sop-pelayanan-posyandu-digital-balita-lansia--mode-luring)
6. [Bab VI: SOP Pengelolaan & Eskalasi Pengaduan Warga](#bab-vi-sop-pengelolaan--eskalasi-pengaduan-warga)
7. [Bab VII: SOP Interoperabilitas Data (Dukcapil & Sapawarga JDS)](#bab-vii-sop-interoperabilitas-data-dukcapil--sapawarga-jds)
8. [Bab VIII: SOP Keamanan Siber, Kerahasiaan Data (UU PDP) & Tanggap Insiden](#bab-viii-sop-keamanan-siber-kerahasiaan-data-uu-pdp--tanggap-insiden)

---

## BAB I: KETENTUAN UMUM & TATA KELOLA PENGGUNA

### 1.1 Dasar Hukum
1. Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
2. Peraturan Presiden Nomor 39 Tahun 2019 tentang Satu Data Indonesia.
3. Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE).
4. Peraturan Menteri Dalam Negeri Nomor 102 Tahun 2019 tentang Pemberian Hak Akses dan Pemanfaatan Data Kependudukan.
5. Peraturan Daerah Kota Sukabumi tentang Pelayanan Administrasi Kependudukan dan Tata Kelola Rukun Tetangga / Rukun Warga.

### 1.2 Tujuan Pedoman
Menjadi acuan baku bagi seluruh aparatur pemerintah (Walikota, Camat, Lurah, Kasi Pelayanan), pengurus RT/RW, kader Posyandu, dan warga dalam mengoperasikan ekosistem aplikasi **Bumi Warga** guna mewujudkan birokrasi yang lincah, transparan, dan berkeadilan sosial.

---

## BAB II: STANDAR HAK AKSES & PEMBAGIAN PERAN (RBAC)

Platform Bumi Warga menerapkan isolasi data bertingkat (*Row-Level Multi-Tenancy Scoping*):

| Peran (Role) | Lingkup Wilayah | Wewenang Utama |
| :--- | :--- | :--- |
| **Walikota / Superadmin** | Seluruh Kota (33 Kelurahan, 7 Kecamatan) | Akses Makro Command Center Kota, analitik kemiskinan & stunting, switch-tenant simulator. |
| **Camat** | 1 Kecamatan Terdaftar | Monitoring kinerja kelurahan di bawah kecamatannya, agregat desil & SLA layanan surat. |
| **Lurah / Admin Kelurahan** | 1 Kelurahan Terdaftar | Pengesahan akhir surat permohonan via TTE QR Code resmi, persetujuan bansos, verifikasi Dukcapil. |
| **Ketua RW** | 1 RW Terdaftar | Verifikasi surat tingkat RW, monitoring bansos tingkat RW, supervisi Posyandu RW. |
| **Ketua RT** | 1 RT Terdaftar | Pengantar permohonan surat warga, verifikasi domisili & status KK tingkat RT. |
| **Kader Posyandu** | 1 Pos Posyandu RW | Pencatatan pengukuran balita, skrining lansia (IMT, tensi, gula darah), operasi offline PWA. |
| **Warga** | Keluarga / NIK Terdaftar | Pengajuan surat mandiri, cek KK digital, cek status bansos, lapor pengaduan lingkungan. |

---

## BAB III: SOP LAYANAN SURAT ADMINISTRASI KEPENDUDUKAN DIGITAL

### 3.1 Alur Pengajuan hingga Penerbitan (SLA Maksimal: 24 Jam Kerja)

```
[Warga] Mengajukan Surat via Web/PWA
   │
   ▼
[Ketua RT] Verifikasi Pengantar (Maks. 4 Jam)
   │
   ▼
[Ketua RW] Verifikasi Rekomendasi (Maks. 4 Jam)
   │
   ▼
[Lurah/Kelurahan] Penomoran Otomatis & Pengesahan TTE QR Code (Maks. 16 Jam)
   │
   ├── Otomatis Terbit: PDF Resmi bertanda TTE QR Code
   └── Notifikasi Otomatis: WhatsApp Gateway mengirim tautan dokumen ke nomor warga
```

### 3.2 Tata Cara Verifikasi Keaslian Surat
1. Setiap dokumen yang diterbitkan dilengkapi dengan QR Code Kriptografis unik berformat:
   `https://bumiwarga.sukabumikota.go.id/verify/{nomor_surat}`
2. Pihak instansi luar (Bank, BPJS, Kepolisian, Sekolah) dapat memindai QR Code tersebut secara langsung menggunakan kamera smartphone tanpa perlu login.
3. Sistem akan menampilkan status keabsahan dokumen, nama penandatangan (Lurah), dan cap waktu penandatanganan.

---

## BAB IV: SOP PENYALURAN BANTUAN SOSIAL PRESISI & PERINGKAT DESIL 1–10

### 4.1 Penetapan Kuota & Peringkat Desil
1. Klasifikasi Desil Kemiskinan dihitung secara otomatis berdasarkan indikator konsumsi listrik, kondisi fisik hunian, kepemilikan aset, dan rasio tanggungan keluarga.
2. **Prioritas Penyaluran**:
   - **Desil 1 (Kemiskinan Ekstrem)**: Wajib diprioritaskan 100% menerima program PKH, BPNT, dan Bantuan Pangan Daerah.
   - **Desil 2–3**: Prioritas kedua sesuai alokasi kuota bansos Kelurahan/RW.
   - **Desil > 4**: Tidak diperbolehkan menerima bansos reguler demi menjamin keadilan fiskal.

### 4.2 Prosedur Penyerahan Lapangan & Anti-Pungli
1. Petugas penyalur (Kelurahan / Pengurus RW) membuka menu **Bansos** di sistem.
2. Identifikasi penerima menggunakan NIK dan pencocokan foto KTP.
3. Petugas mengklik tombol **"Serahkan Bantuan"**, memasukkan nama petugas lapangan dan catatan penyerahan.
4. WhatsApp Gateway secara otomatis mengirimkan tanda terima digital ke nomor HP warga penerima untuk mencegah pemotongan atau pungli oleh oknum.

---

## BAB V: SOP PELAYANAN POSYANDU DIGITAL (BALITA, LANSIA & MODE LURING)

### 5.1 Prosedur Hari Buka Posyandu Balita
1. Kader menimbang Berat Badan (BB), mengukur Tinggi Badan (TB), dan Lingkar Kepala (LK).
2. Kader memasukkan data ke menu **Posyandu Balita**.
3. Sistem otomatis mengkalkulasi status antropometri (Gizi Baik, Berisiko Stunting, Gizi Kurang, Gizi Lebih).
4. Jika balita berstatus *Berisiko Stunting*, sistem langsung memberikan tanda peringatan (*flag*) untuk rujukan ke Puskesmas.

### 5.2 Prosedur Hari Buka Posyandu Lansia
1. Pengukuran Indeks Massa Tubuh (IMT), Tensi Darah Sistolik/Diastolik, Gula Darah Sewaktu (GDS), Asam Urat, dan Kolesterol.
2. Sistem otomatis mengklasifikasikan risiko hipertensi dan diabetes melitus.

### 5.3 Prosedur Operasional Luring (*Offline-First*)
1. Jika lokasi Posyandu tidak terjangkau sinyal internet (blank spot / pemadaman listrik):
   - Aplikasi PWA Bumi Warga tetap dapat dibuka melalui browser gawai kader.
   - Banner **"Mode Offline"** akan aktif di bagian atas layar.
   - Kader tetap menginput data anak dan lansia seperti biasa.
   - Data otomatis disimpan ke penyimpanan lokal aman (**IndexedDB** perangkat).
2. Begitu kader kembali ke area berinternet (atau terhubung ke WiFi):
   - Sistem secara otomatis mendeteksi koneksi dan melakukan **Background Flush**.
   - Semua antrean data offline terkirim ke server kelurahan tanpa ada data yang hilang.

---

## BAB VI: SOP PENGELOLAAN & ESKALASI PENGADUAN WARGA

### 6.1 Matriks SLA Penanganan Pengaduan Lingkungan

| Kategori Pengaduan | SLA Respon Pertama | SLA Penyelesaian Lapangan |
| :--- | :--- | :--- |
| **Darurat / Kebencanaan** (Pohon tumbang, longsor, banjir) | ≤ 15 Menit | ≤ 2 Jam |
| **Ketertiban & Keamanan** | ≤ 30 Menit | ≤ 6 Jam |
| **Sampah & Saluran Air** | ≤ 2 Jam | ≤ 24 Jam |
| **Administrasi Lingkungan** | ≤ 4 Jam | ≤ 48 Jam |

### 6.2 Prosedur Tindak Lanjut
1. Pengaduan masuk dari warga (lengkap dengan koordinat lokasi dan foto bukti).
2. Ketua RT/RW menerima notifikasi pengaduan dan menugaskan petugas lapangan.
3. Setelah perbaikan selesai, petugas mengunggah foto bukti penanganan dan mengubah status menjadi **"SELESAI"**.
4. Warga pelapor menerima notifikasi WhatsApp bahwa laporan telah terselesaikan.

---

## BAB VII: SOP INTEROPERABILITAS DATA (DUKCAPIL & SAPAWARGA JDS)

### 7.1 Verifikasi Identitas Kependudukan (Dukcapil)
1. Setiap pendaftaran warga baru atau perubahan KK diverifikasi melalui Web Service Dukcapil Kemendagri melalui jalur terowongan aman IPsec VPN.
2. Validasi mencakup kesesuaian 16 digit NIK, Nama Lengkap, Tanggal Lahir, serta status hidup dalam Death Registry.
3. Verifikasi biometrik wajah wajib memenuhi ambang batas kemiripan minimal **80%**.

### 7.2 Integrasi Satu Data Jawa Barat (JDS Sapawarga)
1. Sistem secara periodik menyajikan agregat statistik 33 Kelurahan ke endpoint Partner API JDS dengan standar format Satu Data Indonesia (Perpres 39/2019).
2. Warga dapat melakukan login tunggal (*Single Sign-On*) menggunakan akun Sapawarga Jabar.

---

## BAB VIII: KEAMANAN SIBER, KERAHASIAAN DATA (UU PDP) & TANGGAP INSIDEN

### 8.1 Prinsip Zero Data Hoarding (UU PDP No. 27/2022)
1. Citra biometrik wajah hanya digunakan untuk verifikasi pencocokan seketika di memori (in-memory compute) dan **wajib segera dimusnahkan**. Sistem dilarang menyimpan foto mentah biometrik warga.
2. NIK pada antarmuka publik dan ekspor publik wajib disamarkan (*masked*, contoh: `327201******0001`).

### 8.2 Audit Trail Anti-Tampering Kriptografis SHA-256
Setiap akses data kependudukan dan perubahan dokumen dicatat ke dalam log transaksi yang diikat dengan *cryptographic hash chaining* (SHA-256) untuk mencegah manipulasi catatan audit oleh pihak internal maupun eksternal.

### 8.3 Kontak Darurat Cyber Security (CSIRT)
Jika ditemukan indikasi anomali sistem atau upaya peretasan, segera hubungi:
- **Tim CSIRT Diskominfo Kota Sukabumi**: `csirt@sukabumikota.go.id`
- **Helpdesk Teknis Bumi Warga**: `support@bumiwarga.sukabumi.go.id`

