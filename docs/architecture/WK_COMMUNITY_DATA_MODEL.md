**WK COMMUNITY OS**

**DOKUMEN MODEL DATA KOMUNITAS**

| | |
|---|---|
| **ID Dokumen** | `WKOS-CDM-2026-01` |
| **Versi** | `1.0` |
| **Tanggal** | `29 Juli 2026` |
| **Status** | `BASELINE` |
| **Penulis** | `Chief Software Architect` |

---

## Daftar Isi

1.  **Pendahuluan**
    1.1. Tujuan Dokumen
    1.2. Ruang Lingkup

2.  **Prinsip dan Strategi Desain Data**
    2.1. Strategi Normalisasi
    2.2. Master Data Management (MDM)
    2.3. Kualitas Data (Data Quality)
    2.4. Aturan Integritas Data

3.  **Diagram Relasi Entitas (ERD) Konseptual**
    3.1. Diagram Utama

4.  **Model Data Inti (Core Entities)**
    4.1. Wilayah Administratif
    4.2. Kartu Keluarga (KK)
    4.3. Warga

5.  **Model Data Kesejahteraan (Well-being Entities)**
    5.1. Pendidikan
    5.2. Kesehatan
    5.3. Posyandu

6.  **Model Data Aset Komunitas (Community Asset Entities)**
    6.1. Infrastruktur
    6.2. Pajak Bumi dan Bangunan (PBB)
    6.3. Usaha Mikro, Kecil, dan Menengah (UMKM)

7.  **Model Data Layanan & Partisipasi (Service & Participation Entities)**
    7.1. Surat
    7.2. Aduan
    7.3. Forum Warga (Topik & Komentar)
    7.4. Aspirasi

8.  **Model Data Sistem & Intelijen (System & Intelligence Entities)**
    8.1. Dashboard
    8.2. Rule Engine
    8.3. Community Intelligence (Community Score)

9.  **Fondasi AI: Rancangan Knowledge Graph**
    9.1. Konsep Knowledge Graph
    9.2. Struktur Node dan Edge
    9.3. Contoh Sub-Graph
    9.4. Manfaat untuk Evolusi AI

10. **Penutup**

---

## 1. Pendahuluan

### 1.1. Tujuan Dokumen

Dokumen ini bertujuan untuk mendefinisikan model data logis yang komprehensif untuk platform WK Community OS. Model data ini berfungsi sebagai cetak biru tunggal (*single source of truth*) untuk struktur, relasi, atribut, dan batasan dari semua data yang dikelola dalam sistem. Tujuannya adalah untuk memastikan konsistensi, integritas, dan skalabilitas data seiring dengan evolusi platform.

### 1.2. Ruang Lingkup

Dokumen ini mencakup desain entitas data mulai dari data master administratif, data transaksional layanan publik, hingga data agregat untuk kebutuhan intelijen bisnis dan kecerdasan buatan. Ini mendefinisikan struktur logis dan tidak terikat pada implementasi database fisik tertentu (misalnya, Google Sheets, MySQL, atau NoSQL).

---

## 2. Prinsip dan Strategi Desain Data

### 2.1. Strategi Normalisasi

Model data dirancang dengan mengikuti prinsip normalisasi hingga **Bentuk Normal Ketiga (3NF)** untuk data transaksional dan operasional. Tujuannya adalah untuk:
- **Mengurangi Redundansi Data:** Menghindari duplikasi informasi di beberapa tabel.
- **Meningkatkan Integritas Data:** Memastikan perubahan data hanya perlu dilakukan di satu tempat.
- **Menjaga Konsistensi:** Mencegah anomali saat melakukan operasi `INSERT`, `UPDATE`, atau `DELETE`.

Untuk kebutuhan analitik dan dasbor, akan digunakan proses **denormalisasi** terkontrol di mana data dari beberapa tabel digabungkan ke dalam tabel agregat atau *materialized view* untuk mempercepat kueri.

### 2.2. Master Data Management (MDM)

Data inti seperti **Wilayah Administratif** dan **Warga (NIK)** dikelola sebagai *Master Data*.
- **Sumber Tunggal Kebenaran:** Harus ada satu sumber otoritatif untuk setiap entitas master. Data wilayah akan mengacu pada kode wilayah resmi dari pemerintah pusat.
- **Tata Kelola Data:** Perubahan pada data master harus melalui proses validasi yang ketat dan dapat diaudit.
- **Distribusi:** Data master akan didistribusikan atau direferensikan ke seluruh modul lain, bukan diduplikasi.

### 2.3. Kualitas Data (Data Quality)

Kualitas data adalah prioritas utama. Strategi untuk menjaga kualitas data meliputi:
- **Validasi di Tingkat Aplikasi:** Setiap input data divalidasi berdasarkan tipe, format, dan aturan bisnis sebelum disimpan.
- **Pembersihan Data Berkala:** Proses terjadwal akan dijalankan untuk mendeteksi dan menandai data yang tidak lengkap, tidak konsisten, atau duplikatif.
- **Skor Kualitas Data:** Dasbor internal akan menampilkan metrik kualitas data (misalnya, persentase data warga dengan NIK valid) untuk setiap wilayah.

### 2.4. Aturan Integritas Data

- **Integritas Entitas:** Setiap tabel harus memiliki *Primary Key* (PK) yang unik dan tidak boleh null.
- **Integritas Referensial:** *Foreign Key* (FK) harus selalu merujuk pada *Primary Key* yang valid di tabel lain. Operasi yang dapat melanggar integritas ini (misalnya, menghapus data wilayah yang masih memiliki warga) akan dibatasi.
- **Integritas Domain:** Nilai setiap atribut harus sesuai dengan tipe data dan batasan yang telah ditentukan (misalnya, `jenis_kelamin` hanya boleh 'L' atau 'P').

---

## 3. Diagram Relasi Entitas (ERD) Konseptual

### 3.1. Diagram Utama

Diagram ini menunjukkan hubungan tingkat tinggi antara entitas-entitas utama. `(1)` menandakan sisi "satu" dan `(M)` menandakan sisi "banyak" dalam sebuah relasi.

```ascii
+----------------+ (1)-----(M) +-----------------+ (1)-----(M) +-----------+
|    Wilayah     |<>----------|  KartuKeluarga  |<>----------|   Warga   |
+----------------+            +-----------------+            +-----------+
       | (M)                          | (M)                          | (M)
       |                              |                              |
       v (1)                          v (1)                          v (1)
+----------------+            +-----------------+            +-----------+
| Infrastruktur  |            |       PBB       |            | Pendidikan|
+----------------+            +-----------------+            +-----------+
                                                                   |
                                                                   v (1)
+----------------+ (1)-----(M) +-----------------+ (1)-----(M) +-----------+
|      UMKM      |<>----------|      Surat      |<>----------|  Kesehatan|
+----------------+            +-----------------+            +-----------+
       ^ (1)                          ^ (1)                          ^ (M)
       |                              |                              |
       +------------------------------+------------------------------+
                                      | (1)
                                  +-----------+
                                  |   Aduan   |
                                  +-----------+
```

---

## 4. Model Data Inti (Core Entities)

### 4.1. Wilayah Administratif (`Wilayah`)
- **Deskripsi:** Entitas master yang merepresentasikan hierarki wilayah pemerintahan.
- **Atribut Utama:**
    - `wilayah_id` (PK, String): Kode wilayah unik (misalnya, kode BPS).
    - `nama_wilayah` (String): Nama wilayah (e.g., "RW 05", "Kelurahan Sukamaju").
    - `level` (Enum): Level wilayah (PROVINSI, KABUPATEN, KECAMATAN, KELURAHAN, RW, RT).
    - `parent_id` (FK, String): Merujuk ke `wilayah_id` dari level di atasnya (self-referencing).
- **Relasi:**
    - Satu `Wilayah` (parent) memiliki banyak `Wilayah` (children).
    - Satu `Wilayah` (RT) dapat memiliki banyak `KartuKeluarga`.

### 4.2. Kartu Keluarga (`KartuKeluarga`)
- **Deskripsi:** Entitas yang merepresentasikan satu unit keluarga.
- **Atribut Utama:**
    - `kk_id` (PK, String): Nomor Kartu Keluarga.
    - `rt_id` (FK, String): Merujuk ke `wilayah_id` dari RT tempat KK berdomisili.
    - `alamat` (String): Alamat lengkap.
    - `kepala_keluarga_id` (FK, String): Merujuk ke `warga_id` dari kepala keluarga.
- **Relasi:**
    - Satu `KartuKeluarga` dimiliki oleh satu `Wilayah` (RT).
    - Satu `KartuKeluarga` memiliki banyak `Warga`.

### 4.3. Warga (`Warga`)
- **Deskripsi:** Entitas master yang merepresentasikan setiap individu.
- **Atribut Utama:**
    - `warga_id` (PK, String): Nomor Induk Kependudukan (NIK).
    - `kk_id` (FK, String): Merujuk ke `kk_id` dari keluarga warga.
    - `nama_lengkap` (String): Nama lengkap.
    - `tanggal_lahir` (Date): Tanggal lahir.
    - `jenis_kelamin` (Enum): 'L' atau 'P'.
    - `agama` (String): Agama.
    - `pekerjaan` (String): Pekerjaan.
    - `status_perkawinan` (Enum): KAWIN, BELUM KAWIN, dll.
    - `status_hubungan` (Enum): KEPALA KELUARGA, ISTRI, ANAK, dll.
- **Relasi:**
    - Satu `Warga` tergabung dalam satu `KartuKeluarga`.
    - Satu `Warga` dapat memiliki banyak `Pendidikan`, `Kesehatan`, `UMKM`, dll.

---

## 5. Model Data Kesejahteraan (Well-being Entities)

### 5.1. Pendidikan (`Pendidikan`)
- **Deskripsi:** Riwayat pendidikan formal setiap warga.
- **Atribut Utama:**
    - `pendidikan_id` (PK, Auto-increment): ID unik.
    - `warga_id` (FK, String): Merujuk ke NIK warga.
    - `jenjang` (Enum): SD, SMP, SMA, S1, dll.
    - `nama_institusi` (String): Nama sekolah/universitas.
    - `tahun_lulus` (Integer): Tahun kelulusan.
- **Relasi:**
    - Satu `Warga` dapat memiliki banyak riwayat `Pendidikan`.

### 5.2. Kesehatan (`Kesehatan`)
- **Deskripsi:** Catatan kesehatan penting setiap warga.
- **Atribut Utama:**
    - `kesehatan_id` (PK, Auto-increment): ID unik.
    - `warga_id` (FK, String): Merujuk ke NIK warga.
    - `riwayat_penyakit` (String): Penyakit kronis (e.g., "Diabetes").
    - `golongan_darah` (Enum): A, B, AB, O.
    - `status_asuransi` (Enum): BPJS, SWASTA, TIDAK ADA.
    - `status_stunting` (Boolean): Khusus untuk balita.
- **Relasi:**
    - Satu `Warga` dapat memiliki banyak catatan `Kesehatan`.

### 5.3. Posyandu (`Posyandu`)
- **Deskripsi:** Data kegiatan dan peserta Pos Pelayanan Terpadu.
- **Atribut Utama:**
    - `posyandu_id` (PK, Auto-increment): ID unik.
    - `rw_id` (FK, String): Merujuk ke `wilayah_id` dari RW lokasi Posyandu.
    - `nama_posyandu` (String): e.g., "Posyandu Melati 1".
    - `jadwal_kegiatan` (Date): Tanggal kegiatan berikutnya.
    - `peserta_id` (FK, String): Merujuk ke `warga_id` (balita/ibu hamil) yang terdaftar.
    - `berat_badan` (Float): Berat badan saat penimbangan.
    - `tinggi_badan` (Float): Tinggi badan saat pengukuran.
- **Relasi:**
    - Satu `Posyandu` berada di satu `Wilayah` (RW).
    - Satu `Warga` (balita/ibu) dapat terdaftar di satu `Posyandu`.

---

## 6. Model Data Aset Komunitas (Community Asset Entities)

### 6.1. Infrastruktur (`Infrastruktur`)
- **Deskripsi:** Inventaris aset infrastruktur publik.
- **Atribut Utama:**
    - `infra_id` (PK, Auto-increment): ID unik.
    - `wilayah_id` (FK, String): Lokasi infrastruktur.
    - `jenis` (Enum): JALAN, JEMBATAN, DRAINASE, LAMPU JALAN.
    - `kondisi` (Enum): BAIK, RUSAK RINGAN, RUSAK BERAT.
    - `lokasi_koordinat` (String): Koordinat geografis.
- **Relasi:**
    - Satu `Infrastruktur` berada di satu `Wilayah`.

### 6.2. Pajak Bumi dan Bangunan (PBB) (`PBB`)
- **Deskripsi:** Data objek dan status pembayaran PBB.
- **Atribut Utama:**
    - `nop_id` (PK, String): Nomor Objek Pajak.
    - `wajib_pajak_id` (FK, String): Merujuk ke `warga_id`.
    - `luas_tanah` (Float): Luas tanah dalam m².
    - `luas_bangunan` (Float): Luas bangunan dalam m².
    - `tagihan` (Decimal): Jumlah tagihan tahunan.
    - `status_pembayaran` (Enum): LUNAS, BELUM LUNAS.
- **Relasi:**
    - Satu `PBB` dimiliki oleh satu `Warga`.

### 6.3. Usaha Mikro, Kecil, dan Menengah (UMKM) (`UMKM`)
- **Deskripsi:** Data usaha yang dimiliki oleh warga.
- **Atribut Utama:**
    - `umkm_id` (PK, Auto-increment): ID unik.
    - `pemilik_id` (FK, String): Merujuk ke `warga_id`.
    - `nama_usaha` (String): Nama usaha.
    - `jenis_usaha` (String): e.g., "Kuliner", "Kerajinan".
    - `omzet_bulanan` (Decimal): Omzet rata-rata per bulan.
- **Relasi:**
    - Satu `UMKM` dimiliki oleh satu `Warga`.

---

## 7. Model Data Layanan & Partisipasi (Service & Participation Entities)

### 7.1. Surat (`Surat`)
- **Deskripsi:** Entitas transaksional untuk setiap pengajuan surat.
- **Atribut Utama:**
    - `surat_id` (PK, Auto-increment): ID unik.
    - `pemohon_id` (FK, String): Merujuk ke `warga_id`.
    - `jenis_surat` (Enum): SKTM, PENGANTAR_KTP, DOMISILI.
    - `status` (Enum): DRAFT, DIAJUKAN, DISETUJUI_RT, DISETUJUI_RW, DICETAK, DITOLAK.
    - `tanggal_pengajuan` (Timestamp): Waktu pengajuan.
    - `nomor_surat` (String): Nomor surat resmi setelah dicetak.
- **Relasi:**
    - Satu `Surat` diajukan oleh satu `Warga`.

### 7.2. Aduan (`Aduan`)
- **Deskripsi:** Entitas untuk setiap aduan yang dikirim oleh warga.
- **Atribut Utama:**
    - `aduan_id` (PK, Auto-increment): ID unik.
    - `pelapor_id` (FK, String): Merujuk ke `warga_id`.
    - `kategori` (Enum): INFRASTRUKTUR, KEAMANAN, KEBERSIHAN.
    - `deskripsi` (Text): Isi aduan.
    - `status` (Enum): BARU, DIPROSES, SELESAI.
    - `foto_bukti` (String): URL ke file gambar.
- **Relasi:**
    - Satu `Aduan` dikirim oleh satu `Warga`.

### 7.3. Forum Warga (`ForumTopik`, `ForumKomentar`)
- **Deskripsi:** Model untuk fitur forum diskusi online.
- **Atribut Utama (`ForumTopik`):**
    - `topik_id` (PK, Auto-increment): ID unik.
    - `pembuat_id` (FK, String): Merujuk ke `warga_id`.
    - `judul` (String): Judul topik diskusi.
    - `isi` (Text): Konten pembuka topik.
- **Atribut Utama (`ForumKomentar`):**
    - `komentar_id` (PK, Auto-increment): ID unik.
    - `topik_id` (FK, Integer): Merujuk ke `topik_id`.
    - `penulis_id` (FK, String): Merujuk ke `warga_id`.
    - `isi_komentar` (Text): Isi komentar.
- **Relasi:**
    - Satu `ForumTopik` memiliki banyak `ForumKomentar`.

### 7.4. Aspirasi (`Aspirasi`)
- **Deskripsi:** Usulan atau ide dari warga untuk pembangunan (mirip Musrenbang digital).
- **Atribut Utama:**
    - `aspirasi_id` (PK, Auto-increment): ID unik.
    - `pengusul_id` (FK, String): Merujuk ke `warga_id`.
    - `judul_aspirasi` (String): Judul usulan.
    - `kategori` (Enum): PEMBANGUNAN, PEMBERDAYAAN, KESEHATAN.
    - `estimasi_biaya` (Decimal): Perkiraan biaya.
    - `jumlah_dukungan` (Integer): Jumlah warga lain yang mendukung.
- **Relasi:**
    - Satu `Aspirasi` diusulkan oleh satu `Warga`.

---

## 8. Model Data Sistem & Intelijen (System & Intelligence Entities)

### 8.1. Dashboard (`DashboardConfig`)
- **Deskripsi:** Menyimpan konfigurasi tata letak dan konten dasbor.
- **Atribut Utama:**
    - `widget_id` (PK, String): ID unik widget.
    - `role_id` (String): Peran yang dapat melihat widget ini.
    - `tipe_widget` (Enum): GRAFIK_BATANG, PIE_CHART, PETA, SCORECARD.
    - `data_source_function` (String): Nama fungsi di *Service Layer* yang menyediakan data untuk widget ini (e.g., `DashboardService.getEducationData`).
    - `posisi` (Integer): Urutan tampilan widget.

### 8.2. Rule Engine (`Rule`)
- **Deskripsi:** Menyimpan definisi aturan bisnis yang dapat dieksekusi.
- **Atribut Utama:**
    - `rule_id` (PK, String): ID unik aturan.
    - `event_trigger` (String): Peristiwa yang memicu aturan (e.g., "surat.before_update_status").
    - `kondisi` (JSON/String): Logika kondisi dalam format yang dapat dievaluasi (e.g., `{"field": "warga.income", "operator": "<", "value": 2000000}`).
    - `aksi` (JSON/String): Aksi yang harus diambil jika kondisi terpenuhi (e.g., `{"action": "allow_transition", "value": true}`).

### 8.3. Community Intelligence (`CommunityScore`)
- **Deskripsi:** Tabel agregat yang menyimpan hasil perhitungan Community Score secara periodik.
- **Atribut Utama:**
    - `score_id` (PK, Auto-increment): ID unik.
    - `wilayah_id` (FK, String): Wilayah yang dinilai.
    - `periode` (String): Periode penilaian (e.g., "2026-Q3").
    - `education_score` (Float): Skor sub-indeks pendidikan.
    - `health_score` (Float): Skor sub-indeks kesehatan.
    - `economy_score` (Float): Skor sub-indeks ekonomi.
    - `infrastructure_score` (Float): Skor sub-indeks infrastruktur.
    - `participation_score` (Float): Skor sub-indeks partisipasi.
    - `governance_score` (Float): Skor sub-indeks tata kelola.
    - `final_score` (Float): Skor akhir komposit.

---

## 9. Fondasi AI: Rancangan Knowledge Graph

### 9.1. Konsep Knowledge Graph

Untuk mendukung fitur AI yang canggih, data relasional yang ternormalisasi akan ditransformasikan menjadi sebuah **Knowledge Graph**. Ini adalah model data berbasis graf yang merepresentasikan entitas sebagai **node (simpul)** dan hubungan antar entitas sebagai **edge (sisi)**. Model ini sangat efektif dalam menemukan pola, hubungan tersembunyi, dan memberikan rekomendasi yang kontekstual.

### 9.2. Struktur Node dan Edge

- **Nodes (Simpul):**
    - Setiap entitas utama akan menjadi sebuah node dengan labelnya masing-masing.
    - Contoh Node: `(warga:Warga {nik: '32...', nama: 'Budi'})`, `(umkm:UMKM {nama: 'Warung Sejahtera'})`, `(wilayah:Wilayah {nama: 'RW 05'})`.

- **Edges (Sisi):**
    - Setiap relasi antar entitas akan menjadi sebuah edge berarah yang memiliki label semantik.
    - Contoh Edge: `(warga)-[:TINGGAL_DI]->(wilayah)`, `(warga)-[:MEMILIKI_USAHA]->(umkm)`, `(warga)-[:MENGAJUKAN]->(surat)`.

### 9.3. Contoh Sub-Graph

Diagram ini mengilustrasikan bagaimana data Budi, seorang warga RW 05 yang memiliki warung dan mengajukan aduan tentang jalan rusak, direpresentasikan dalam Knowledge Graph.

```ascii
 (Budi:Warga)
     |
     +--[:TINGGAL_DI]->(RW_05:Wilayah)
     |
     +--[:MEMILIKI_USAHA]->(Warung_Sejahtera:UMKM)
     |
     +--[:MELAPORKAN]->(Aduan_001:Aduan)-[:TENTANG]->(Jalan_Rusak:Infrastruktur)
```

### 9.4. Manfaat untuk Evolusi AI

- **Recommendation Engine:** Dengan mudah dapat menjawab pertanyaan seperti, "Warga seperti Budi yang memiliki UMKM kuliner, program pelatihan apa yang relevan?". Kueri graf akan mencari warga lain dengan pola serupa.
- **Analisis Dampak:** Memungkinkan analisis kompleks seperti, "Jika infrastruktur 'Jalan_Rusak' diperbaiki, berapa banyak UMKM di sekitarnya yang berpotensi mengalami peningkatan omzet?".
- **Deteksi Penipuan/Anomali:** Mendeteksi pola yang tidak wajar, misalnya satu warga mengajukan puluhan surat bantuan sosial dalam waktu singkat.
- **Input untuk LLM:** Knowledge Graph menyediakan data terstruktur yang kaya konteks, yang dapat digunakan sebagai *grounding* untuk model LLM (seperti Ollama) agar memberikan jawaban yang lebih faktual dan relevan dengan kondisi komunitas.

---

## 10. Penutup

Model data yang didefinisikan dalam dokumen ini adalah fondasi dari seluruh platform WK Community OS. Dengan implementasi yang disiplin terhadap prinsip-prinsip yang telah ditetapkan, model ini akan memastikan bahwa platform tidak hanya mampu menangani kebutuhan administrasi saat ini, tetapi juga siap untuk berkembang menjadi ekosistem intelijen komunitas yang sesungguhnya di masa depan.