**WK COMMUNITY OS ENTERPRISE EDITION**

**PIAGAM PROYEK (PROJECT CHARTER)**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Nama Proyek** | WK Community OS Enterprise Edition |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 29 Juli 2026 |
| **Status** | `DRAFT` |
| **Pemilik Proyek** | Chief Software Architect |
| **Repository** | `https://github.com/wk-community-os` |

---

### Riwayat Versi

| Versi | Tanggal | Perubahan | Penulis |
| :--- | :--- | :--- | :--- |
| 1.0 | 29 Juli 2026 | Pembuatan dokumen awal. | Chief Software Architect |

### Pemilik Dokumen

| Nama | Jabatan |
| :--- | :--- |
| [Nama Pemilik] | Chief Software Architect |

### Peninjau (Reviewer)

| Nama | Jabatan |
| :--- | :--- |
| [Nama Peninjau 1] | Project Manager |
| [Nama Peninjau 2] | Lead DevOps Engineer |
| [Nama Peninjau 3] | Perwakilan Pemerintah Daerah |

---

## 2. Executive Summary

Piagam Proyek ini meresmikan inisiasi proyek **WK Community OS Enterprise Edition**, sebuah platform perangkat lunak yang dirancang untuk mentransformasi tata kelola dan pelayanan publik di tingkat pemerintahan lokal Indonesia. Proyek ini bertujuan untuk menggantikan proses administrasi manual yang tidak efisien dengan sistem digital yang terintegrasi, berbasis data, dan berpusat pada warga. Implementasi percontohan (*pilot project*) akan dilaksanakan di **Kelurahan Kebonjati, Kota Sukabumi**. Keberhasilan proyek ini akan diukur melalui peningkatan efisiensi layanan, akurasi data, dan kepuasan masyarakat, yang pada akhirnya akan menciptakan model tata kelola digital yang dapat diskalakan ke wilayah lain di seluruh Indonesia.

## 3. Latar Belakang

Saat ini, proses administrasi di tingkat Kelurahan, RW, dan RT, termasuk di Kelurahan Kebonjati, masih sangat bergantung pada proses manual berbasis kertas. Hal ini menimbulkan berbagai tantangan, seperti waktu pelayanan yang lama, data kependudukan yang terfragmentasi dan tidak akurat, kesulitan dalam pelacakan status pengajuan, serta kurangnya alat bantu bagi pimpinan untuk membuat keputusan strategis berbasis data. Proyek WK Community OS Enterprise Edition digagas untuk mengatasi tantangan-tantangan fundamental ini dengan menyediakan sebuah solusi teknologi yang komprehensif dan terjangkau.

## 4. Visi

Menjadi **Platform Transformasi Digital Komunitas Indonesia**, mewujudkan ekosistem pemerintahan digital yang cerdas, responsif, dan terintegrasi di setiap tingkatan untuk meningkatkan kualitas hidup masyarakat secara berkelanjutan.

## 5. Misi

1.  **Mengotomatisasi:** Menggantikan proses manual dengan alur kerja digital yang efisien untuk pelayanan publik.
2.  **Mengintegrasikan:** Membangun sumber data kependudukan dan layanan yang terpusat dan akurat.
3.  **Memberdayakan:** Menyediakan dasbor analitik dan intelijen untuk mendukung pengambilan keputusan berbasis data bagi pimpinan.
4.  **Melibatkan:** Membuka kanal partisipasi digital yang mudah diakses bagi masyarakat.

## 6. Nilai-Nilai Inti (Core Values)

- **Berorientasi pada Pelayanan:** Mengutamakan kemudahan dan kecepatan bagi masyarakat.
- **Transparansi:** Memastikan setiap proses dapat dilacak dan akuntabel.
- **Inovasi:** Terus menerapkan teknologi untuk memberikan solusi yang lebih baik.
- **Kolaborasi:** Mendorong kerja sama antar tingkat pemerintahan.
- **Amanah:** Menjaga keamanan dan privasi data sebagai prioritas utama.

## 7. Tujuan Proyek (Project Objectives)

- Mengimplementasikan modul Kependudukan dan Layanan Surat di Kelurahan Kebonjati dalam 6 bulan.
- Mengurangi waktu rata-rata penyelesaian layanan surat pengantar sebesar 80% (dari beberapa hari menjadi beberapa jam).
- Mencapai tingkat akurasi data kependudukan di atas 98% di wilayah percontohan.
- Melatih 100% aparat RT, RW, dan Kelurahan Kebonjati dalam penggunaan platform.
- Mencapai Indeks Kepuasan Masyarakat (IKM) di atas 85 untuk layanan yang telah didigitalisasi.

## 8. Ruang Lingkup (Scope)

### 8.1. In Scope (Termasuk dalam Ruang Lingkup)

- Pengembangan dan kustomisasi modul `Warga`, `KK`, dan `Surat`.
- Migrasi data kependudukan awal untuk Kelurahan Kebonjati.
- Pelatihan bagi seluruh aparat terkait di wilayah percontohan.
- Pengembangan dasbor operasional dasar untuk memantau layanan.
- Penyiapan infrastruktur berbasis Google Workspace (Google Sheets sebagai database).
- Penyerahan seluruh dokumentasi teknis dan pengguna.

### 8.2. Out of Scope (Tidak Termasuk dalam Ruang Lingkup)

- Penyediaan perangkat keras (komputer, printer, jaringan internet) untuk kantor Kelurahan/RT/RW.
- Pengembangan modul di luar yang telah disebutkan (misalnya, `Kesehatan`, `Pendidikan`) pada fase awal ini.
- Integrasi dengan sistem dinas lain di tingkat Kota/Kabupaten.
- Pengembangan aplikasi mobile native.

## 9. Pemangku Kepentingan (Stakeholder)

| Nama/Grup | Peran | Kepentingan Utama |
| :--- | :--- | :--- |
| **Pemerintah Kota Sukabumi** | Sponsor Proyek | Keberhasilan program *Smart City*, peningkatan citra pemerintah. |
| **Lurah & Aparat Kel. Kebonjati** | Pengguna Utama | Peningkatan efisiensi kerja, kemudahan pelaporan. |
| **Ketua RT & RW se-Kebonjati** | Pengguna Utama | Kemudahan pendataan warga dan proses persetujuan. |
| **Masyarakat Kel. Kebonjati** | Penerima Manfaat | Pelayanan yang lebih cepat, mudah, dan transparan. |
| **Tim Pengembang WK Community OS**| Pelaksana Proyek | Menyelesaikan proyek sesuai jadwal, anggaran, dan kualitas. |

## 10. Target Pengguna (Target Users)

| Pengguna | Deskripsi | Kebutuhan Utama |
| :--- | :--- | :--- |
| **Aparat Kelurahan** | Staf yang memproses dan mencetak dokumen akhir. | Antarmuka yang efisien untuk verifikasi, pencetakan, dan rekapitulasi laporan. |
| **Ketua RW** | Memberikan persetujuan tingkat menengah. | Notifikasi instan, dasbor sederhana untuk memantau RT di bawahnya, kemudahan persetujuan. |
| **Ketua RT** | Titik awal layanan dan verifikasi data warga. | Aplikasi yang sangat mudah digunakan untuk pendataan, verifikasi, dan persetujuan awal. |
| **Warga** | Pemohon layanan. | Kemudahan mengajukan permohonan dan melacak statusnya. |

## 11. Masalah Bisnis (Business Problems)

- **Waktu Tunggu Layanan Lama:** Warga harus datang berkali-kali ke RT, RW, dan Kelurahan untuk satu surat.
- **Data Tidak Akurat:** Data warga di buku RT sering tidak sinkron dengan data di Kelurahan.
- **Beban Kerja Administratif Tinggi:** Aparat menghabiskan banyak waktu untuk tugas-tugas pencatatan dan rekapitulasi manual.
- **Kesulitan Pelaporan:** Lurah kesulitan mendapatkan data agregat (misalnya, jumlah warga pendatang baru) secara cepat dan akurat.

## 12. Solusi yang Diusulkan (Proposed Solution)

Mengimplementasikan platform WK Community OS yang menyediakan:
- **Alur Kerja Digital:** Pengajuan surat dilakukan secara online, dan alur persetujuan berjalan secara digital dari RT hingga Kelurahan melalui notifikasi.
- **Database Terpusat:** Semua data warga dan KK disimpan dalam satu database (Google Sheets) yang dapat diakses oleh semua tingkatan sesuai hak akses, memastikan data yang konsisten.
- **Dasbor Real-time:** Pimpinan dapat melihat jumlah layanan, waktu penyelesaian, dan data demografis secara langsung melalui dasbor analitik.

## 13. Tujuan Strategis (Strategic Goals)

| Jangka Waktu | Tujuan |
| :--- | :--- |
| **1 Tahun** | Model digitalisasi layanan di Kelurahan Kebonjati berhasil dan menjadi percontohan. Platform stabil dan diadopsi penuh oleh pengguna. |
| **3 Tahun** | Platform diadopsi oleh mayoritas kelurahan di Kota Sukabumi. Modul tambahan (Kesehatan, Ekonomi) mulai diimplementasikan. |
| **5 Tahun** | WK Community OS menjadi platform standar untuk program *Smart City* di beberapa kota/kabupaten di Indonesia. Kemampuan AI mulai memberikan rekomendasi kebijakan. |

## 14. Indikator Keberhasilan (KPI)

| Kategori | KPI | Target Awal |
| :--- | :--- | :--- |
| **Efisiensi** | Rata-rata waktu penyelesaian surat pengantar | < 8 Jam |
| **Kualitas Data**| Persentase NIK valid dalam database | > 99% |
| **Adopsi** | Persentase aparat aktif menggunakan sistem harian | > 90% |
| **Kepuasan** | Skor Indeks Kepuasan Masyarakat (IKM) | > 85/100 |

## 15. Struktur Tata Kelola (Governance Structure)

| Peran | Penanggung Jawab | Tugas Utama |
| :--- | :--- | :--- |
| **Project Sponsor** | Kepala Dinas Kominfo Kota Sukabumi | Memberikan dukungan politis dan sumber daya. |
| **Project Manager** | [Nama PM dari Tim WK OS] | Mengelola jadwal, anggaran, dan tim proyek. |
| **Product Owner** | Lurah Kebonjati | Mewakili kebutuhan pengguna dan memprioritaskan fitur. |
| **Tim Teknis** | Tim Pengembang WK Community OS | Melakukan pengembangan, pengujian, dan deployment. |
| **Komite Pengarah**| Gabungan Sponsor, PM, dan PO | Mengambil keputusan strategis dan menyelesaikan eskalasi. |

## 16. Metodologi Pengembangan

Proyek ini akan menggunakan metodologi **Agile Scrum**.
- **Sprint:** Pengembangan akan dibagi ke dalam siklus 2-mingguan (Sprint).
- **Ritual:** Akan diadakan *Daily Standup*, *Sprint Planning*, *Sprint Review*, dan *Sprint Retrospective*.
- **Backlog:** *Product Owner* akan mengelola *Product Backlog* yang berisi daftar fitur dan perbaikan yang akan dikerjakan.

## 17. Tumpukan Teknologi (Technology Stack)

| Komponen | Teknologi |
| :--- | :--- |
| **Backend Logic** | Google Apps Script (Runtime V8) |
| **Framework** | WK Framework |
| **Database** | Google Sheets |
| **Frontend** | Google Apps Script HTML Service |
| **Source Control** | Git / GitHub |
| **Deployment** | Google CLASP |
| **DevOps** | Bash Scripts (GitHub Actions) |

## 18. Ringkasan Peta Jalan Produk

1.  **Fase 1 (Pilot):** Fokus pada modul Kependudukan & Layanan Surat di Kel. Kebonjati.
2.  **Fase 2 (Ekspansi & Analitik):** Ekspansi ke kelurahan lain, pengembangan modul Kesehatan & Ekonomi, serta dasbor eksekutif.
3.  **Fase 3 (Integrasi & AI):** Integrasi dengan sistem eksternal, implementasi AI Assistant (LLM), dan fitur prediktif.
4.  **Fase 4 (Ekosistem):** Pembukaan API untuk pihak ketiga dan pengembangan menuju platform *Smart Regency*.

## 19. Manajemen Risiko (Risk Management)

| Risiko | Probabilitas | Dampak | Strategi Mitigasi |
| :--- | :--- | :--- | :--- |
| **Resistensi dari Aparat** | Sedang | Tinggi | Pelatihan intensif, pendampingan, dan menunjuk "juara" (*champion*) di setiap level. |
| **Konektivitas Internet Buruk** | Tinggi | Sedang | Merancang aplikasi agar tetap responsif pada koneksi lambat, menyediakan mode *offline* jika memungkinkan. |
| **Perubahan Kebijakan Pemerintah** | Rendah | Tinggi | Membangun sistem yang fleksibel (misalnya, dengan *Rule Engine*) agar mudah beradaptasi. |
| **Keamanan Data** | Sedang | Sangat Tinggi | Menerapkan prinsip *least privilege*, enkripsi data sensitif, dan audit akses secara berkala. |

## 20. Asumsi (Assumptions)

- Pemerintah Kota Sukabumi dan Kelurahan Kebonjati memberikan dukungan penuh selama proyek berlangsung.
- Infrastruktur dasar (listrik, komputer) tersedia di kantor aparat.
- Data kependudukan awal dalam format digital (misalnya, Excel) tersedia untuk migrasi.
- Aparat memiliki literasi digital dasar untuk dapat dilatih.

## 21. Batasan (Constraints)

- Proyek harus berjalan di atas platform Google Workspace (Apps Script, Sheets) untuk menekan biaya infrastruktur.
- Anggaran dan jadwal proyek bersifat tetap sesuai dengan kesepakatan awal.
- Ketergantungan pada API dan layanan Google yang dapat berubah di masa depan.

## 22. Persetujuan (Approval)

Dengan menandatangani di bawah ini, para pemangku kepentingan menyetujui isi dari Piagam Proyek ini dan memberikan otorisasi untuk memulai proyek WK Community OS Enterprise Edition.

<br>
<br>

---
**[Nama Project Sponsor]**  
Project Sponsor  
*Kepala Dinas Kominfo Kota Sukabumi*  

Tanggal: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

<br>
<br>

---
**[Nama Project Manager]**  
Project Manager  
*WK Community OS Team*  

Tanggal: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

<br>
<br>

---
**[Nama Product Owner]**  
Product Owner  
*Lurah Kebonjati*  

Tanggal: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_