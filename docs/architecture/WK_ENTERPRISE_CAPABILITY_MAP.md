**WK COMMUNITY OS**

**PETA KEMAMPUAN ENTERPRISE (ENTERPRISE CAPABILITY MAP)**

| | |
|---|---|
| **ID Dokumen** | `WKOS-ECM-2026-01` |
| **Versi** | `1.0` |
| **Tanggal** | `29 Juli 2026` |
| **Status** | `BASELINE` |
| **Penulis** | `Chief Software Architect` |

---

## Daftar Isi

1.  **Executive Summary**
2.  **Konsep Enterprise Capability**
    2.1. Definisi Capability
    2.2. Tujuan Pemetaan Capability
3.  **Capability Hierarchy (Pohon Kemampuan)**
    3.1. Struktur Hirarki (L1, L2, L3)
    3.2. Diagram Pohon Kemampuan Utama
4.  **Citizen Capability (Kemampuan Warga)**
5.  **Government Capability (Kemampuan Pemerintah)**
6.  **Education Capability (Kemampuan Pendidikan)**
7.  **Health Capability (Kemampuan Kesehatan)**
8.  **Economy Capability (Kemampuan Ekonomi)**
9.  **Infrastructure Capability (Kemampuan Infrastruktur)**
10. **Community Participation Capability (Kemampuan Partisipasi Komunitas)**
11. **Governance Capability (Kemampuan Tata Kelola)**
12. **AI Capability (Kemampuan Kecerdasan Buatan)**
13. **Analytics Capability (Kemampuan Analitik)**
14. **Dashboard Capability (Kemampuan Dasbor)**
15. **Integration Capability (Kemampuan Integrasi)**
16. **Security Capability (Kemampuan Keamanan)**
17. **DevOps Capability (Kemampuan DevOps)**
18. **Future Capability (Kemampuan Masa Depan)**
19. **Capability Dependency Matrix (Matriks Ketergantungan)**
20. **Capability Heat Map (Peta Panas Kemampuan)**
21. **Capability Roadmap (Peta Jalan Kemampuan) 2026–2035**
22. **Maturity Model (Model Kematangan)**
23. **KPI per Capability (Indikator Kinerja Utama per Kemampuan)**
24. **Apendiks**
    24.1. Glosarium
    24.2. Daftar Capability L1

---

## 1. Executive Summary

Dokumen ini menyajikan Peta Kemampuan Enterprise (Enterprise Capability Map) untuk platform WK Community OS. Peta ini adalah representasi abstrak dari **"apa"** yang dapat dilakukan oleh organisasi dan sistem, terlepas dari **"bagaimana"** hal itu dilakukan, siapa yang melakukannya, atau teknologi apa yang digunakan. Tujuannya adalah untuk menyediakan sebuah pandangan yang stabil dan berorientasi bisnis terhadap fungsionalitas platform, yang berfungsi sebagai fondasi untuk perencanaan strategis, arsitektur, dan pengembangan.

Dengan memetakan seluruh kemampuan—mulai dari layanan warga hingga kemampuan AI dan DevOps—dokumen ini menjadi alat bantu utama untuk menyelaraskan investasi teknologi dengan tujuan bisnis. Peta ini akan digunakan untuk mengidentifikasi redundansi, menemukan celah kapabilitas, memprioritaskan inisiatif, dan memandu evolusi platform WK Community OS menjadi ekosistem tata kelola cerdas yang sesungguhnya.

## 2. Konsep Enterprise Capability

### 2.1. Definisi Capability

Sebuah **Capability (Kemampuan)** adalah kemampuan atau kapasitas yang dimiliki oleh sebuah enterprise untuk mencapai tujuan tertentu. Ini adalah blok bangunan fundamental dari model bisnis.

- **Abstrak:** Capability mendefinisikan *apa* yang dilakukan, bukan *bagaimana*. Contoh: "Manajemen Pengaduan" adalah sebuah kemampuan. Implementasinya bisa melalui loket fisik, aplikasi seluler, atau chatbot AI.
- **Stabil:** Kemampuan bisnis cenderung stabil dari waktu ke waktu, bahkan ketika proses, struktur organisasi, atau teknologi yang mendukungnya berubah.
- **Unik:** Setiap kemampuan harus unik dan tidak tumpang tindih.

### 2.2. Tujuan Pemetaan Capability

- **Komunikasi:** Menciptakan bahasa yang sama antara pemangku kepentingan bisnis dan teknis.
- **Perencanaan Strategis:** Membantu pimpinan untuk memvisualisasikan di mana harus berinvestasi untuk mencapai tujuan strategis.
- **Analisis Kesenjangan:** Mengidentifikasi kemampuan yang kurang atau perlu ditingkatkan untuk mendukung visi masa depan.
- **Rasionalisasi Aplikasi:** Membantu dalam memutuskan aplikasi mana yang harus dipertahankan, dikonsolidasikan, atau dihentikan dengan memetakannya ke kemampuan yang didukung.

## 3. Capability Hierarchy (Pohon Kemampuan)

### 3.1. Struktur Hirarki (L1, L2, L3)

Kemampuan diorganisir dalam struktur hierarkis untuk memberikan tingkat detail yang berbeda.
- **Level 1 (L1):** Domain kemampuan tingkat tertinggi dan paling abstrak.
- **Level 2 (L2):** Pengelompokan kemampuan yang lebih spesifik di dalam domain L1.
- **Level 3 (L3):** Kemampuan konkret dan terperinci yang menjelaskan aktivitas spesifik.

### 3.2. Diagram Pohon Kemampuan Utama

```ascii
WK Community OS
├── 1.0 Citizen Capability
│   ├── 1.1 Profile Management
│   └── 1.2 Service Access
├── 2.0 Government Capability
│   ├── 2.1 Data Management
│   └── 2.2 Service Management
├── 3.0 Education Capability
│   ├── 3.1 Student Data Management
│   └── 3.2 School Data Management
├── 4.0 Health Capability
│   ├── 4.1 Citizen Health Management
│   └── 4.2 Public Health Management
├── 5.0 Economy Capability
│   ├── 5.1 Business Management
│   └── 5.2 Tax Management
├── 6.0 Infrastructure Capability
│   ├── 6.1 Asset Management
│   └── 6.2 Condition Monitoring
├── 7.0 Community Participation Capability
│   ├── 7.1 Complaint Management
│   ├── 7.2 Aspiration Management
│   └── 7.3 Forum Management
├── 8.0 Governance Capability
│   ├── 8.1 Workflow Management
│   └── 8.2 Performance Management
├── 9.0 AI Capability
│   ├── 9.1 Rule-Based Automation
│   ├── 9.2 Predictive Analytics
│   └── 9.3 Generative Assistance
├── 10.0 Analytics Capability
│   ├── 10.1 Data Aggregation
│   └── 10.2 Reporting
├── 11.0 Dashboard Capability
│   ├── 11.1 Visualization
│   └── 11.2 Interactivity
├── 12.0 Integration Capability
│   ├── 12.1 API Management
│   └── 12.2 Data Exchange
├── 13.0 Security Capability
│   ├── 13.1 Identity & Access Management
│   └── 13.2 Data Protection
└── 14.0 DevOps Capability
    ├── 14.1 CI/CD
    └── 14.2 System Operations
```

---

## 4. Citizen Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 1.1 | **Profile Management** | 1.1.1 View Personal Data | Kemampuan warga untuk melihat data pribadi dan keluarga mereka. |
| | | 1.1.2 Request Data Update | Kemampuan warga untuk mengajukan permohonan pembaruan data. |
| 1.2 | **Service Access** | 1.2.1 Submit Service Request | Kemampuan warga untuk mengajukan layanan (e.g., surat) secara online. |
| | | 1.2.2 Track Service Status | Kemampuan warga untuk melacak status pengajuan layanan mereka. |
| | | 1.2.3 Access Information | Kemampuan warga untuk mengakses informasi publik (pengumuman, berita). |

## 5. Government Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 2.1 | **Data Management** | 2.1.1 Manage Citizen Data | Kemampuan aparat untuk mengelola (CRUD) data warga dan KK. |
| | | 2.1.2 Manage Area Data | Kemampuan aparat untuk mengelola data wilayah administratif. |
| | | 2.1.3 Validate Data | Kemampuan aparat untuk memvalidasi dan menyetujui data baru. |
| 2.2 | **Service Management** | 2.2.1 Process Service Request | Kemampuan aparat untuk memproses, menyetujui, atau menolak pengajuan layanan. |
| | | 2.2.2 Publish Information | Kemampuan aparat untuk mempublikasikan pengumuman atau berita. |

## 6. Education Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 3.1 | **Student Data Management** | 3.1.1 Track Education History | Kemampuan sistem untuk mencatat riwayat pendidikan setiap warga. |
| | | 3.1.2 Identify Out-of-School Children | Kemampuan sistem untuk mengidentifikasi anak usia sekolah yang belum terdaftar. |
| 3.2 | **School Data Management** | 3.2.1 Manage School Profiles | Kemampuan untuk mengelola data master sekolah (lokasi, kapasitas, jenjang). |

## 7. Health Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 4.1 | **Citizen Health Management** | 4.1.1 Track Health Records | Kemampuan untuk mencatat riwayat kesehatan dasar warga. |
| | | 4.1.2 Manage Posyandu Visits | Kemampuan untuk mencatat data penimbangan dan pengukuran balita di Posyandu. |
| 4.2 | **Public Health Management** | 4.2.1 Monitor Stunting Prevalence | Kemampuan untuk memantau dan memetakan kasus stunting. |
| | | 4.2.2 Track Disease Outbreaks | Kemampuan untuk melacak dan memvisualisasikan penyebaran penyakit menular. |

## 8. Economy Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 5.1 | **Business Management** | 5.1.1 Manage MSME Data | Kemampuan untuk mendata dan mengelola profil UMKM di wilayah tersebut. |
| | | 5.1.2 Promote Local Business | Kemampuan untuk menampilkan direktori UMKM kepada publik. |
| 5.2 | **Tax Management** | 5.2.1 Manage PBB Data | Kemampuan untuk mengelola data objek dan wajib pajak PBB. |
| | | 5.2.2 Monitor Tax Payment | Kemampuan untuk memantau status pembayaran PBB. |

## 9. Infrastructure Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 6.1 | **Asset Management** | 6.1.1 Manage Asset Inventory | Kemampuan untuk mendata aset infrastruktur (jalan, jembatan, dll). |
| 6.2 | **Condition Monitoring** | 6.2.1 Track Asset Condition | Kemampuan untuk mencatat dan memperbarui kondisi setiap aset. |
| | | 6.2.2 Map Damaged Infrastructure | Kemampuan untuk memvisualisasikan lokasi infrastruktur yang rusak. |

## 10. Community Participation Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 7.1 | **Complaint Management** | 7.1.1 Submit Complaint | Kemampuan warga untuk mengirimkan aduan. |
| | | 7.1.2 Process Complaint | Kemampuan aparat untuk menindaklanjuti dan mengubah status aduan. |
| 7.2 | **Aspiration Management** | 7.2.1 Submit Aspiration | Kemampuan warga untuk mengusulkan ide pembangunan. |
| | | 7.2.2 Vote on Aspiration | Kemampuan warga untuk memberikan dukungan pada aspirasi yang ada. |
| 7.3 | **Forum Management** | 7.3.1 Create Discussion Topic | Kemampuan warga untuk memulai topik diskusi baru. |
| | | 7.3.2 Moderate Content | Kemampuan admin untuk memoderasi konten forum. |

## 11. Governance Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 8.1 | **Workflow Management** | 8.1.1 Define Approval Flows | Kemampuan untuk mengkonfigurasi alur persetujuan multi-jenjang. |
| | | 8.1.2 Execute Workflows | Kemampuan sistem untuk menjalankan proses sesuai alur yang didefinisikan. |
| 8.2 | **Performance Management** | 8.2.1 Define SLAs | Kemampuan untuk menetapkan Service Level Agreement untuk setiap layanan. |
| | | 8.2.2 Monitor KPIs | Kemampuan untuk melacak dan menampilkan Key Performance Indicators. |

## 12. AI Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 9.1 | **Rule-Based Automation** | 9.1.1 Execute Business Rules | Kemampuan untuk mengeksekusi aturan bisnis `IF-THEN` secara otomatis. |
| 9.2 | **Predictive Analytics** | 9.2.1 Forecast Trends | Kemampuan untuk memprediksi tren masa depan (e.g., populasi, kebutuhan sekolah). |
| | | 9.2.2 Classify Data | Kemampuan untuk mengklasifikasikan data (e.g., sentimen aduan). |
| 9.3 | **Generative Assistance** | 9.3.1 Generate Text | Kemampuan untuk menghasilkan draf teks (e.g., surat, laporan) berdasarkan prompt. |
| | | 9.3.2 Answer Questions | Kemampuan untuk menjawab pertanyaan dalam bahasa natural. |

## 13. Analytics Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 10.1 | **Data Aggregation** | 10.1.1 Consolidate Data | Kemampuan untuk mengumpulkan dan menggabungkan data dari berbagai sumber. |
| | | 10.1.2 Calculate Metrics | Kemampuan untuk menghitung metrik turunan (e.g., Community Score). |
| 10.2 | **Reporting** | 10.2.1 Generate Standard Reports | Kemampuan untuk menghasilkan laporan terstruktur dalam format standar (tabel). |
| | | 10.2.2 Generate Ad-hoc Reports | Kemampuan untuk membuat laporan kustom berdasarkan filter tertentu. |

## 14. Dashboard Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 11.1 | **Visualization** | 11.1.1 Display Charts | Kemampuan untuk menampilkan data dalam bentuk grafik (batang, pai, garis). |
| | | 11.1.2 Display Maps | Kemampuan untuk menampilkan data geografis pada peta (GIS). |
| 11.2 | **Interactivity** | 11.2.1 Filter Data | Kemampuan pengguna untuk memfilter data yang ditampilkan di dasbor. |
| | | 11.2.2 Drill Down Data | Kemampuan pengguna untuk melihat detail dari data agregat. |

## 15. Integration Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 12.1 | **API Management** | 12.1.1 Expose APIs | Kemampuan untuk menyediakan API yang aman bagi sistem eksternal. |
| | | 12.1.2 Consume APIs | Kemampuan untuk mengambil data dari API sistem eksternal. |
| 12.2 | **Data Exchange** | 12.2.1 Import Data | Kemampuan untuk mengimpor data dari file (e.g., CSV, Excel). |
| | | 12.2.2 Export Data | Kemampuan untuk mengekspor data ke dalam berbagai format. |

## 16. Security Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 13.1 | **Identity & Access Management** | 13.1.1 Authenticate Users | Kemampuan untuk memverifikasi identitas pengguna (via Google). |
| | | 13.1.2 Authorize Access | Kemampuan untuk mengelola hak akses berdasarkan peran (RBAC). |
| 13.2 | **Data Protection** | 13.2.1 Encrypt Data | Kemampuan untuk mengenkripsi data sensitif saat disimpan dan ditransmisikan. |
| | | 13.2.2 Audit Access | Kemampuan untuk mencatat (log) siapa yang mengakses atau mengubah data. |

## 17. DevOps Capability

| ID | L2 Capability | L3 Capability | Deskripsi |
| :--- | :--- | :--- | :--- |
| 14.1 | **Continuous Integration/Deployment** | 14.1.1 Automate Build | Kemampuan untuk membangun dan mengemas aplikasi secara otomatis. |
| | | 14.1.2 Automate Testing | Kemampuan untuk menjalankan tes (e.g., smoke test) secara otomatis. |
| | | 14.1.3 Automate Deployment | Kemampuan untuk melakukan deployment ke berbagai lingkungan secara otomatis. |
| 14.2 | **System Operations** | 14.2.1 Backup & Restore | Kemampuan untuk mencadangkan dan memulihkan sistem secara andal. |
| | | 14.2.2 Monitor System Health | Kemampuan untuk memantau kinerja dan ketersediaan sistem. |

## 18. Future Capability

Kemampuan yang direncanakan untuk fase-fase mendatang, selaras dengan peta jalan produk:
- **Digital Signature Capability:** Kemampuan untuk menandatangani dokumen secara digital.
- **GIS Capability:** Kemampuan analitik spasial yang lebih mendalam.
- **Payment Gateway Integration:** Kemampuan untuk memproses pembayaran (e.g., PBB) secara online.
- **IoT Integration:** Kemampuan untuk menerima dan memproses data dari perangkat Internet of Things.

---

## 19. Capability Dependency Matrix (Matriks Ketergantungan)

Matriks ini menunjukkan bagaimana kemampuan L2 bergantung pada kemampuan lain untuk dapat berfungsi. `X` menandakan ketergantungan.

| Depends On -> | 2.1 Data Mgmt | 8.1 Workflow Mgmt | 10.1 Data Aggregation | 13.1 IAM |
| :--- | :---: | :---: | :---: | :---: |
| **L2 Capability** | | | | |
| 1.2 Service Access | X | | | X |
| 2.2 Service Mgmt | X | X | | X |
| 4.2 Public Health Mgmt | X | | X | X |
| 8.2 Performance Mgmt | | | X | |
| 11.1 Visualization | | | X | |

**Interpretasi:** Untuk "Service Management" (2.2) dapat berfungsi, ia bergantung pada "Data Management" (2.1), "Workflow Management" (8.1), dan "Identity & Access Management" (13.1).

---

## 20. Capability Heat Map (Peta Panas Kemampuan)

Peta ini memvisualisasikan tingkat kematangan atau prioritas saat ini untuk setiap kemampuan L2.
- 🟢 **Matang/Tinggi:** Sudah terimplementasi dengan baik.
- 🟡 **Menengah:** Sebagian terimplementasi atau perlu perbaikan.
- 🔴 **Rendah/Baru:** Belum ada atau masih dalam tahap awal perencanaan.

| ID | L2 Capability | Maturity (v1.0) | Priority (Phase 2) |
| :--- | :--- | :---: | :---: |
| 1.1 | Profile Management | 🟢 | 🟡 |
| 1.2 | Service Access | 🟢 | 🟡 |
| 2.1 | Data Management | 🟢 | 🟢 |
| 2.2 | Service Management | 🟡 | 🟢 |
| 4.2 | Public Health Management | 🔴 | 🟢 |
| 8.1 | Workflow Management | 🟡 | 🟢 |
| 8.2 | Performance Management | 🔴 | 🟢 |
| 9.1 | Rule-Based Automation | 🟡 | 🟡 |
| 9.2 | Predictive Analytics | 🔴 | 🟢 |
| 10.1| Data Aggregation | 🟡 | 🟢 |
| 11.1| Visualization | 🟡 | 🟢 |
| 14.1| CI/CD | 🟡 | 🟡 |
| 14.2| System Operations | 🟢 | 🟡 |

---

## 21. Capability Roadmap (Peta Jalan Kemampuan) 2026–2035

Peta jalan ini memetakan kapan kemampuan L2 utama akan dikembangkan atau ditingkatkan secara signifikan.

| Capability (L2) | Phase 1 (2026-27) | Phase 2 (2028-30) | Phase 3 (2031-33) | Phase 4 (2034-35) |
| :--- | :---: | :---: | :---: | :---: |
| **Data Management** | **FONDASI** | Perbaikan | Perbaikan | Optimalisasi |
| **Service Management** | **FONDASI** | Perbaikan | Perbaikan | Optimalisasi |
| **Workflow Management** | **DASAR** | **PENGEMBANGAN** | Perbaikan | Optimalisasi |
| **Data Aggregation** | **DASAR** | **PENGEMBANGAN** | Perbaikan | Optimalisasi |
| **Visualization** | **DASAR** | **PENGEMBANGAN** | Perbaikan | Optimalisasi |
| **Performance Management** | - | **PENGEMBANGAN** | Perbaikan | Optimalisasi |
| **Predictive Analytics** | - | **DASAR** | **PENGEMBANGAN** | Perbaikan |
| **Generative Assistance** | - | - | **PENGEMBANGAN** | Perbaikan |
| **API Management** | - | - | **PENGEMBANGAN** | Perbaikan |

---

## 22. Maturity Model (Model Kematangan)

Kami menggunakan model 5 tingkat untuk menilai kematangan setiap kemampuan.

| Level | Nama | Deskripsi |
| :--- | :--- | :--- |
| **1** | **Ad-hoc / Initial** | Proses tidak terdefinisi, sporadis, dan sangat bergantung pada individu. |
| **2** | **Repeatable / Managed** | Proses dasar sudah ada dan dapat diulang, namun belum terstandarisasi. |
| **3** | **Defined / Standardized**| Proses telah distandarisasi dan didokumentasikan di seluruh organisasi. |
| **4** | **Measured / Quantified**| Proses diukur dan dikontrol menggunakan metrik kuantitatif (KPI). |
| **5** | **Optimized / Innovating**| Fokus pada perbaikan proses secara berkelanjutan dan inovasi. |

**Contoh Penilaian (v1.0):**
- `Data Management` berada di Level 3 (Defined).
- `System Operations` (Backup/Restore) berada di Level 3 (Defined).
- `Predictive Analytics` berada di Level 1 (Initial).

---

## 23. KPI per Capability (Indikator Kinerja Utama per Kemampuan)

Tabel ini menghubungkan kemampuan L2 dengan metrik yang mengukur keberhasilannya.

| ID | L2 Capability | KPI | Target (Contoh) |
| :--- | :--- | :--- | :--- |
| 2.2 | **Service Management** | Rata-rata Waktu Penyelesaian Layanan | < 8 jam kerja |
| 4.2 | **Public Health Management** | Penurunan Prevalensi Stunting | Turun 5% per tahun |
| 5.2 | **Tax Management** | Persentase Pelunasan PBB | > 95% |
| 7.1 | **Complaint Management** | Indeks Kepuasan Penanganan Aduan | > 85/100 |
| 8.2 | **Performance Management** | Persentase Layanan yang Memenuhi SLA | > 98% |
| 14.2| **System Operations** | Recovery Time Objective (RTO) | < 4 jam |

---

## 24. Apendiks

### 24.1. Glosarium

- **Capability:** Kemampuan bisnis yang abstrak tentang "apa" yang dilakukan sistem.
- **Heat Map:** Visualisasi untuk menunjukkan status atau prioritas.
- **KPI:** Key Performance Indicator, metrik terukur untuk menilai keberhasilan.
- **Maturity Model:** Kerangka kerja untuk menilai tingkat kematangan sebuah proses atau kemampuan.
- **RBAC:** Role-Based Access Control.
- **SLA:** Service Level Agreement.

### 24.2. Daftar Capability L1

1.  Citizen Capability
2.  Government Capability
3.  Education Capability
4.  Health Capability
5.  Economy Capability
6.  Infrastructure Capability
7.  Community Participation Capability
8.  Governance Capability
9.  AI Capability
10. Analytics Capability
11. Dashboard Capability
12. Integration Capability
13. Security Capability
14. DevOps Capability