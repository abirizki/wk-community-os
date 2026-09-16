# BUMI WARGA — UI/UX & PRODUCT SPECIFICATION
**Dokumen Spesifikasi Antarmuka, Sistem Desain, Alur Kerja & Tata Kelola Data Per Peran**  
*Pemerintah Kota Sukabumi — Jawa Barat | Edisi Standar Operasional 2026*  
*Status Dokumen: Blueprint Spesifikasi Teknis Siap Eksekusi Developer (No Coding / Zero Source Code Modification)*  
*Dasar Acuan: `BUMI_WARGA_PRODUCT_DISCOVERY_REPORT.md`, 6 Modul Resmi `USER_MODULE_*.md`, dan Basis Data/API Aktual `d:\wk_prod`*

---

## 1. Master Design System & Global Standards

### A. Semantic Status System (Warna, Ikon, Teks, Aksesibilitas WCAG 2.1 AA)
Seluruh status dalam sistem harus merefleksikan 3 parameter visual sekaligus: **Warna Bersertifikasi Kontras**, **Ikon Unik Bentuk**, dan **Naskah Teks Terbaca**. Tidak boleh mengandalkan warna semata (*never rely on color alone*).

| Kategori Semantik | Latar Belakang (*Surface*) | Garis Tepi (*Border*) | Teks (*Text Color*) | Ikon Lucide | Naskah Standar UI (Bahasa Indonesia) | Contoh Status Entitas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Info / Pending Awal** | `bg-blue-50` (#EFF6FF) | `border-blue-200` (#BFDBFE) | `text-blue-800` (#1E40AF) | `<Clock size={14} />` | Menunggu Verifikasi | `SUBMITTED`, `PENDING_RT`, `PENDING_RW` |
| **Warning / Aging SLA** | `bg-amber-50` (#FFFBEB) | `border-amber-300` (#FCD34D) | `text-amber-900` (#78350F) | `<AlertTriangle size={14} />` | Mendekati Batas Waktu | `AGING_WARNING`, `BELUM_BAYAR`, `Gizi Kurang` |
| **Critical / Overdue / Reject** | `bg-rose-50` (#FFF1F2) | `border-rose-300` (#FDA4AF) | `text-rose-900` (#881337) | `<AlertOctagon size={14} />` | Tindakan Tertahan / Kritis | `OVERDUE`, `REJECTED`, `Gizi Buruk`, `SANGGAHAN_TIDAK_LAYAK` |
| **Success / Valid / Approved** | `bg-emerald-50` (#ECFDF5) | `border-emerald-200` (#A7F3D0) | `text-emerald-900` (#064E3B) | `<CheckCircle2 size={14} />` | Terverifikasi / Selesai | `APPROVED`, `LUNAS`, `Normal`, `DISAHKAN_LURAH` |
| **Ready for Signature (TTE)** | `bg-purple-50` (#FAF5FF) | `border-purple-200` (#E9D5FF) | `text-purple-900` (#581C87) | `<FileSignature size={14} />` | Siap TTE / Pengesahan | `READY_TTE`, `DRAFT_SELESAI` |
| **Offline / Synced Queue** | `bg-slate-100` (#F1F5F9) | `border-slate-300` (#CBD5E1) | `text-slate-800` (#1E293B) | `<CloudOff size={14} />` | Tersimpan Lokal (Offline) | `OFFLINE_QUEUED`, `UNSYNCED` |

---

### B. Design Tokens Ringkas (Tailwind CSS Mapping)
- **Primary / Brand**:
  - `primary-50`: `#F0FDF4` (Sangat Muda - Highlight baris terpilih)
  - `primary-600`: `#059669` (Brand Hijau SPBE Pemprov Jabar / Kota Sukabumi)
  - `primary-700`: `#047857` (Interaksi Hover Tombol Utama)
  - `primary-800`: `#065F46` (Active State & Focus Ring)
- **Neutral / Surface**:
  - `surface-canvas`: `#F8FAFC` (`bg-slate-50` — Canvas aplikasi latar belakang)
  - `surface-card`: `#FFFFFF` (`bg-white` — Kartu modul dengan elevasi `shadow-sm`)
  - `surface-subtle`: `#F1F5F9` (`bg-slate-100` — Wadah input & header tabel)
  - `border-default`: `#E2E8F0` (`border-slate-200` — Pemisah visual 1px)
- **Typography Scale (Inter / Plus Jakarta Sans)**:
  - `display`: 24px (1.5rem), Semibold 600, leading-tight (Judul Halaman)
  - `heading`: 18px (1.125rem), Semibold 600, leading-snug (Judul Kartu/Modul)
  - `body`: 14px (0.875rem), Regular 400, leading-normal (Teks Bacaan Utama)
  - `caption`: 12px (0.75rem), Medium 500, leading-normal (Meta-info & Timestamp)
- **Radius & Shadows**:
  - Radius: `rounded-xl` (12px) untuk seluruh kartu dashboard; `rounded-lg` (8px) untuk input/button.
  - Shadow: `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`) untuk kartu; `shadow-md` untuk modal/drawer pop-up.

---

### C. Daftar Pustaka Komponen Reusable Prioritas

```
frontend/src/components/
├── core/
│   ├── DashboardShell.jsx       [TARGET / UX IMPROVEMENT]  -> Shell pembungkus halaman: Title, Subtitle, Breadcrumb, Action Tray
│   ├── RoleHeader.jsx           [TARGET / UX IMPROVEMENT]  -> Header konteks peran: Salam, Badge RT/RW, Context Switcher
│   ├── ActionCenter.jsx         [TARGET / UX IMPROVEMENT]  -> Wadah dinamis kartu pekerjaan tertahan & peringatan SLA
│   ├── KPIGrid.jsx              [TARGET / UX IMPROVEMENT]  -> Grid container responsif (1 kolom di mobile, 4 kolom di desktop)
│   ├── KPICard.jsx              [TARGET / UX IMPROVEMENT]  -> Kartu metrik: Angka, Satuan, Trend, Subtitle, Variasi Semantik
│   ├── StatusBadge.jsx          [TARGET / UX IMPROVEMENT]  -> Badge status dengan ikon Lucide, teks baku, dan kontras tinggi
│   ├── SLABadge.jsx             [TARGET / UX IMPROVEMENT]  -> Lencana hitung mundur waktu dengan detak warna amber/rose
│   └── DataTable.jsx            [TARGET / UX IMPROVEMENT]  -> Tabel terpadu: Pencarian, Filter Cepat, Pagination, Empty State
├── workflow/
│   ├── WorkflowStepper.jsx      [TARGET / UX IMPROVEMENT]  -> Visualisasi alur 4 tahap surat (Warga -> RT -> RW -> Lurah)
│   ├── QuickSignTray.jsx        [TARGET / UX IMPROVEMENT]  -> Baki persetujuan massal sekali klik (Lurah & Ketua RW)
│   └── SanggahanCard.jsx        [TARGET / UX IMPROVEMENT]  -> Kartu pelaporan sanggahan ketidaklayakan bansos lapangan
├── ai/
│   ├── AIBriefCard.jsx          [TARGET / UX IMPROVEMENT]  -> Ringkasan eksekutif 2-3 kalimat dari mesin aturan DSS
│   ├── InsightCard.jsx          [TARGET / UX IMPROVEMENT]  -> Kartu insight analitik: What, Why, Evidence, Priority, Action
│   └── SuggestedQuestions.jsx   [TARGET / UX IMPROVEMENT]  -> Tombol pintas pertanyaan analitik kontekstual
└── mobile/
    ├── MobileTouchForm.jsx      [TARGET / UX IMPROVEMENT]  -> Form input antropometri ramah ibu jari bawah (Kader)
    ├── OfflineSyncBanner.jsx    [TARGET / UX IMPROVEMENT]  -> Banner status mutasi lokal IndexedDB dan tombol sinkronisasi
    └── BottomNavigation.jsx     [CURRENT / PERBAIKAN]      -> Bilah navigasi bawah 4 menu utama khusus layar smartphone
```

---

### D. Urutan Implementasi Komponen (Developer Phased Order)
1. **Pondasi Token & Komponen Atom**:
   - `StatusBadge.jsx` &rarr; `SLABadge.jsx` &rarr; `KPICard.jsx`. (Memastikan visual status dan KPI terstandar di semua layar).
2. **Pondasi Kontainer & Layout**:
   - `DashboardShell.jsx` &rarr; `RoleHeader.jsx` &rarr; `KPIGrid.jsx` &rarr; `ActionCenter.jsx`.
3. **Komponen Alur Kerja & Visualisasi**:
   - `WorkflowStepper.jsx` &rarr; `DataTable.jsx` &rarr; `QuickSignTray.jsx`.
4. **Komponen Inteligensi & Asisten**:
   - `AIBriefCard.jsx` &rarr; `InsightCard.jsx` &rarr; `SuggestedQuestions.jsx`.
5. **Komponen Khusus Seluler & Luar Jaringan**:
   - `OfflineSyncBanner.jsx` &rarr; `MobileTouchForm.jsx` &rarr; `BottomNavigation.jsx`.

---

## 2. Spesifikasi Modul Per Peran Pengguna

---

### ROLE 1: WARGA (Pemohon Mandiri)

#### 1. Primary Job (30 Detik Pertama)
Warga harus dapat langsung melihat **posisi riil berkas surat yang sedang aktif diajukannya** (apakah tertahan di RT, RW, atau Kelurahan) serta mengetahui apakah ada tindakan yang harus diambil (misalnya: perbaikan foto dokumen atau pengambilan berkas jadi di loket).

#### 2. Recommended Dashboard Layout (Wireframe Blueprint)
```
+---------------------------------------------------------------------------------------------+
| TOPBAR: Logo Bumi Warga | [Konteks NIK: Budi Santoso (KK 3273...)] [Family Switcher] | Notif|
+---------------------------------------------------------------------------------------------+
| [RoleHeader]: "Selamat Pagi, Budi Santoso" | Status Warga: RT 001 / RW 001 | Desil 2        |
+---------------------------------------------------------------------------------------------+
| [AIBriefCard]: Asisten Layanan Mandiri                                                      |
| "Surat Keterangan Domisili Usaha Anda telah disetujui Ketua RT 001 dan diteruskan ke RW.    |
| Estimasi pengesahan kelurahan: Besok, 15 September pukul 11:00 WIB."                        |
+---------------------------------------------------------------------------------------------+
| [ActionCenter]: (Jika ada surat revisi atau bansos siap ambil)                              |
| [!] "Surat Keterangan Kematian: Lampiran Surat Kematian RS Buram. Klik untuk unggah ulang." |
+---------------------------------------------------------------------------------------------+
| [WorkflowStepper - Permohonan Terkini]:                                                     |
| (1) Diajukan [✓]  -> (2) Pengantar RT [✓]  -> (3) Rekomendasi RW [●]  -> (4) TTE Lurah [ ]  |
+---------------------------------------------------------------------------------------------+
| [KPIGrid]: 4 Kartu Metrik Warga                                                             |
| [Surat Diproses: 1] | [Bansos Terdaftar: PKH] | [Iuran RT: Lunas (Sep)] | [Jadwal Posyandu] |
+---------------------------------------------------------------------------------------------+
| [Quick Action Grid]:                                                                        |
| [+ Ajukan Surat Baru] | [Lapor Aduan Lingkungan] | [Lihat KK Digital] | [Cek Tagihan PBB]   |
+---------------------------------------------------------------------------------------------+
| [Recent Activity Table]: 5 Riwayat Layanan Terakhir                                         |
+---------------------------------------------------------------------------------------------+
```

#### 3. Final Sidebar Structure (Role &rarr; Domain &rarr; Action)
- **Pusat Pengajuan**:
  - 📄 Status & Pengajuan Surat (`/dashboard/dokumen`) — *Action: Buat & Pantau Berkas*
  - 📢 Lapor Pengaduan Warga (`/dashboard/pengaduan`) — *Action: Sampaikan Komplain/Aspirasi*
- **Keluarga & Bantuan Sosial**:
  - 👨‍👩‍👧‍👦 Kartu Keluarga & Anggota (`/dashboard/kk`) — *Domain: Data Kependudukan Keluarga*
  - 🎁 Informasi Bantuan Sosial (`/dashboard/bansos`) — *Domain: Status Kepesertaan DTKS/Bansos*
  - 👶 Posyandu Balita & Lansia (`/dashboard/posyandu`) — *Domain: Catatan Kesehatan Keluarga*
- **Kewajiban & Lingkungan**:
  - 💳 Iuran Lingkungan & Kas RT (`/dashboard/keuangan`) — *Action: Bayar Iuran & Cek Kas*
  - 🏠 Status PBB-P2 Warga (`/dashboard/pbb`) — *Domain: Informasi Tagihan PBB Terutang*
- **Pusat Bantuan**:
  - 📖 Panduan Pelayanan Warga (`/dashboard/panduan`) — *Domain: SOP & Syarat Dokumen*

#### 4. Action Center Content
- **Kartu 1 (Kritis)**: `Dokumen Ditolak / Butuh Revisi` — Muncul jika `dokumen_request.status = 'REJECTED'` atau memiliki `catatan_admin`. Berisi tombol: *"Unggah Perbaikan Sekarang"*.
- **Kartu 2 (Penting)**: `Bansos Siap Disalurkan` — Muncul jika warga terdaftar di `bansos_pengajuan.status = 'DISAHKAN'` dan `foto_penyerahan_url IS NULL`. Berisi instruksi: *"Ambil Paket Bansos di Balai RW 001 membawa KTP Asli"*.
- **Kartu 3 (Peringatan Rutin)**: `Iuran Lingkungan Belum Terbayar` — Muncul jika `keuangan_iuran_warga.status_bayar = 'BELUM_BAYAR'` pada bulan berjalan. Berisi tombol: *"Konfirmasi Pembayaran"*.

#### 5. KPI Grid (4 Metrik Maksimal)
1. **Surat Aktif**: `COUNT(dokumen_request) WHERE status IN ('SUBMITTED', 'PENDING_RW', 'PENDING_KELURAHAN', 'READY_TTE')` (Subteks: "Dalam proses legalitas").
2. **Kepesertaan Bansos**: Jenis bantuan aktif keluarga (`warga.catatan_bansos_mandiri` atau `bansos_pengajuan.jenis_bansos`) (Nilai: "PKH Aktif" / "Non-Penerima").
3. **Status Iuran RT**: Status pembayaran bulan berjalan (`LUNAS` / `BELUM BAYAR`) (Nilai: "Lunas Sep 2026", Warna: Emerald).
4. **Jadwal Posyandu Terdekat**: Tanggal buka posyandu di RW binaan (Nilai: "18 Sep 2026", Subteks: "Posyandu Melati RW 01").

#### 6. AI Daily Brief Format & Suggested Questions
- **Format Brief**:  
  *"Halo [Nama Warga], Anda memiliki 1 berkas permohonan aktif ([Jenis Dokumen]) yang saat ini sedang dalam penelaahan Ketua RW 001. Iuran kas RT bulan September telah tercatat LUNAS. Posyandu Melati akan buka 4 hari lagi."*
- **3 Suggested Questions**:
  1. *"Berapa lama lagi surat saya akan selesai ditandatangani Lurah?"*
  2. *"Apa syarat yang harus disiapkan untuk mengajukan Surat Keterangan Usaha?"*
  3. *"Kapan jadwal imunisasi campak berikutnya untuk anak saya?"*

#### 7. Insight Card Format
- **What**: Pengantar RT untuk SKCK telah diterbitkan oleh Ketua RT 001.
- **Why**: Berkas Anda memenuhi syarat domisili dan telah diverifikasi faktual.
- **Evidence**: Nomor Registrasi `REG-1789230`, Disetujui tanggal 14 Sep 2026 pukul 08:15 WIB.
- **Priority**: Normal / Sedang.
- **Action**: Menunggu validasi Ketua RW 001 (tidak perlu hadir fisik).

#### 8. Mobile Behavior
- Tombol navigasi bawah (*Bottom Nav*): Beranda, Surat Mandiri, Bansos, Profil KK.
- Formulir pengajuan surat responsif vertikal dengan pengunggah kamera langsung untuk KTP/KK.
- Berkas surat yang telah terbit memiliki tombol besar: *"Unduh Surat PDF Resmi"* dan *"Kirim Salinan ke WhatsApp"*.

#### 9. State States (Empty, Loading, Error)
- **Empty State (Belum ada surat)**: Ilustrasi berkas bersih + Teks *"Belum ada permohonan surat aktif"* + Tombol aksi *"Buat Permohonan Surat Pertama"*.
- **Loading State**: Komponen `WorkflowStepperSkeleton` dan 4 kartu `KPICardSkeleton` dengan animasi denyut (*pulse animation*).
- **Error State**: Teks *"Gagal memuat status berkas"* + Tombol *"Coba Muat Ulang"* dengan penjelasan teknis tersanitasi.

#### 10. Data & API Requirements
- `GET /api/dokumen/nik/:nik` &rarr; Riwayat dokumen dan tahapan approval per NIK.
- `GET /api/warga/family-members` &rarr; Daftar anggota keluarga untuk switch NIK di topbar.
- `GET /api/keuangan/iuran/my-status` &rarr; Status tagihan kas iuran KK.
- `GET /api/bansos/pengajuan/my-status` &rarr; Status pengajuan bansos warga.

#### 11. Permission & Data Scope
- **Role RBAC**: `warga` (Level 4).
- **Data Scope**: Terkunci mutlak hanya pada NIK pemohon dan NIK yang terdaftar dalam satu Kartu Keluarga (`kartu_keluarga.no_kk`). Dilarang melihat data permohonan warga lain.

---

### ROLE 2: KETUA RT (Verifikator Faktual Tingkat I)

#### 1. Primary Job (30 Detik Pertama)
Ketua RT harus dapat **melihat antrean permohonan pengantar surat yang baru diajukan warga lingkungannya**, mengenali mana yang mendekati batas waktu SLA 4 jam, dan **mengeksekusi verifikasi faktual lapangan** (Setujui / Tolak dengan Catatan).

#### 2. Recommended Dashboard Layout (Wireframe Blueprint)
```
+---------------------------------------------------------------------------------------------+
| TOPBAR: Logo Bumi Warga | [Konteks: Ketua RT 001 / RW 001 - Kelurahan Kebonjati] | Notif (3)|
+---------------------------------------------------------------------------------------------+
| [RoleHeader]: "Pusat Verifikasi Rukun Tetangga 001" | 48 Kepala Keluarga | 162 Jiwa Warga   |
+---------------------------------------------------------------------------------------------+
| [ActionCenter]: Baki Antrean Prioritas RT (Urut SLA Terdekat)                               |
| [!] Surat Keterangan Usaha - Pemohon: Ahmad Dahlan (Aging: 3 Jam 15 Menit) [Proses Cepat]   |
| [!] Sanggahan Bansos Lapangan: NIK 3273... (Lapor: Warga Meninggal Dunia) [Tinjau Bukti]   |
+---------------------------------------------------------------------------------------------+
| [KPIGrid]: 4 Indikator Layanan & Lingkungan RT                                              |
| [Antrean Surat: 3] | [Aging > 3 Jam: 1] | [Kepatuhan Iuran: 82%] | [Balita Kurang Gizi: 1]  |
+---------------------------------------------------------------------------------------------+
| [Tabel Antrean Verifikasi Pengantar RT]: Filter: [Semua] [Mendesak] [Selesai]                |
| Kolom: No Reg | Warga Pemohon | Jenis Surat | Waktu Pengajuan | SLA Countdown | Aksi Cepat  |
+---------------------------------------------------------------------------------------------+
| [Ringkasan Kas RT & Catat Pembayaran Cepat]: Form input mutasi kas 1 baris                  |
+---------------------------------------------------------------------------------------------+
```

#### 3. Final Sidebar Structure (Role &rarr; Domain &rarr; Action)
- **Pusat Aksi RT**:
  - 📥 Verifikasi Pengantar Surat (`/dashboard/dokumen`) — *Action: Tinjau & Terbitkan Pengantar*
  - ⚠️ Audit & Sanggahan Bansos (`/dashboard/bansos`) — *Action: Laporkan Anomali Lapangan*
- **Kependudukan Lingkungan**:
  - 👥 Pangkalan Data Warga RT (`/dashboard/warga`) — *Domain: Direktori Warga RT*
  - 📑 Registrasi Kartu Keluarga RT (`/dashboard/kk`) — *Domain: Master KK Wilayah RT*
- **Pengelolaan Kas & Aduan**:
  - 💰 Buku Kas RT & Iuran Warga (`/dashboard/keuangan`) — *Action: Catat Iuran & Mutasi Kas*
  - 📢 Aduan Warga RT (`/dashboard/pengaduan`) — *Action: Mediasi Masalah Lingkungan*
- **Pedoman Layanan**:
  - 📘 Standar Verifikasi RT (`/dashboard/panduan`) — *Domain: Aturan Faktual Domisili*

#### 4. Action Center Content
- **Kartu 1 (SLA Kritis)**: `Pengantar Surat Mendekati 4 Jam` — Tampil merah jika berkas di RT berumur > 3 jam pada jam kerja. Tombol: *"Buka Berkas Pemohon"*.
- **Kartu 2 (Audit Sosial)**: `Laporan Anomali Bansos` — Pengingat untuk memeriksa rumah warga yang disanggah mampu atau telah pindah alamat.
- **Kartu 3 (Keuangan RT)**: `Tunggakan Iuran Lingkungan` — Menampilkan jumlah KK yang belum menyetor iuran bulanan RT > 15 hari dari tanggal tagihan.

#### 5. KPI Grid (4 Metrik Maksimal)
1. **Antrean Surat Pending**: `COUNT(dokumen_request) WHERE approval_step = 'RT' AND status = 'SUBMITTED'` (Nilai: "3 Berkas").
2. **Kepatuhan SLA RT**: Persentase permohonan selesai < 4 jam kerja (Nilai: "94%", Subteks: "Target Pelayanan Prima").
3. **Kolektivitas Iuran RT**: Rasio KK lunas iuran bulan berjalan (Nilai: "38 / 46 KK (82%)", Subteks: "Rp 950.000 terhimpun").
4. **Peringatan Balita Berisiko**: Jumlah balita di RT dengan status gizi kurang / penurunan bobot (Nilai: "1 Balita", Subteks: "Perlu PMT").

#### 6. AI Daily Brief Format & Suggested Questions
- **Format Brief**:  
  *"Selamat pagi Ketua RT 001. Pagi ini terdapat 3 pengantar surat warga yang menunggu verifikasi Anda, dengan 1 berkas mendekati batas waktu SLA 4 jam (Ahmad Dahlan). Kas RT terkumpul Rp 950.000 (82% KK lunas)."*
- **4 Suggested Questions**:
  1. *"Mana permohonan surat yang harus saya proses paling awal pagi ini?"*
  2. *"Siapa saja kepala keluarga di RT 001 yang belum membayar iuran bulan September?"*
  3. *"Apakah ada data warga penerima bansos di RT 001 yang perlu disanggah karena meninggal?"*
  4. *"Bagaimana status gizi balita di wilayah RT 001 pasca posyandu kemarin?"*

#### 7. Insight Card Format
- **What**: Verifikasi surat pemohon Ahmad Dahlan berumur 3 jam 15 menit.
- **Why**: Batas standar pelayanan prima tingkat RT adalah 4 jam kerja sebelum memicu notifikasi peringatan.
- **Evidence**: Dibuat 14 Sep pukul 06:45 WIB, Jenis: Surat Keterangan Usaha (RT 001).
- **Priority**: Tinggi (Mendekati SLA Breach).
- **Action**: Periksa keabsahan usaha pemohon dan klik *"Setujui Pengantar RT"*.

#### 8. Mobile Behavior
- Tampilan tabel diubah otomatis menjadi kartu vertikal (*Card List*) di smartphone.
- Tombol verifikasi aksi cepat: Tombol hijau bulat besar *"Setujui"* dan tombol abu-abu *"Kembalikan"* dengan konfirmasi modal sederhana.

#### 9. State States (Empty, Loading, Error)
- **Empty State**: Ikon centang hijau + Teks *"Semua permohonan warga telah selesai diverifikasi. Tidak ada antrean pending di RT 001."*
- **Loading State**: Skeleton baris antrean dokumen dan skeleton kas RT.
- **Error State**: Teks *"Koneksi database RT terputus"* + Tombol reload data.

#### 10. Data & API Requirements
- `GET /api/dokumen?rt=001&rw=001&approval_step=RT&status=SUBMITTED` &rarr; Daftar antrean surat RT.
- `PATCH /api/dokumen/:id/status` &rarr; Eksekusi persetujuan pengantar RT (`approved_by_rt`).
- `GET /api/keuangan/rekapitulasi?rt=001&rw=001` &rarr; Saldo kas RT dan rekap iuran KK.
- `POST /api/bansos/audit-sanggahan` &rarr; Pengiriman sanggahan bansos lapangan.

#### 11. Permission & Data Scope
- **Role RBAC**: `ketua_rt` (Level 3).
- **Data Scope**: Dibatasi secara mutlak (*hard-scoped*) pada `rt = req.user.rt` dan `rw = req.user.rw`. Tidak memiliki wewenang melihat atau mengesahkan berkas dari RT lain.

---

### ROLE 3: KETUA RW (Verifikator Berjenjang Tingkat II)

#### 1. Primary Job (30 Detik Pertama)
Ketua RW harus dapat **menelaah rekomendasi surat yang telah disetujui para Ketua RT**, mengeksekusi validasi berjenjang (bisa secara massal / *batch*), dan **mengidentifikasi RT mana di bawah naungannya yang mengalami penumpukan antrean atau masalah sosial**.

#### 2. Recommended Dashboard Layout (Wireframe Blueprint)
```
+---------------------------------------------------------------------------------------------+
| TOPBAR: Logo Bumi Warga | [Konteks: Ketua RW 001 - Kelurahan Kebonjati] | Notif (5)         |
+---------------------------------------------------------------------------------------------+
| [RoleHeader]: "Dashboard Rekapitulasi Rukun Warga 001" | Membawahi 8 RT | 1.240 Jiwa Warga   |
+---------------------------------------------------------------------------------------------+
| [AIBriefCard]: Rekap Intelijen Kewilayahan RW                                               |
| "Terdapat 7 rekomendasi surat menunggu validasi RW. RT 003 terdeteksi mengalami lonjakan   |
| antrean tertahan (5 berkas > 5 jam). Program bansos beras RW siap salur 92%."                |
+---------------------------------------------------------------------------------------------+
| [QuickSignTray]: Validasi Massal Rekomendasi RW                                             |
| [✓ Pilih Semua (7 Berkas)]  --->  [Tombol: Setujui Semua Rekomendasi Terpilih (Batch Sign)] |
+---------------------------------------------------------------------------------------------+
| [KPIGrid]: 4 Indikator Kewilayahan RW                                                       |
| [Rekomendasi Siap: 7] | [RT Bottleneck: RT 03] | [Konsolidasi Kas RW] | [Desil 1 Non-Bansos]|
+---------------------------------------------------------------------------------------------+
| [Radar Kinerja Verifikasi Antar-RT]: Tabel visual kecepatan rata-rata layanan RT 01 s.d. 08 |
+---------------------------------------------------------------------------------------------+
| [Tabel Berkas Menunggu Validasi RW]: No Reg | RT Asal | Pemohon | Waktu Lolos RT | Aksi     |
+---------------------------------------------------------------------------------------------+
```

#### 3. Final Sidebar Structure (Role &rarr; Domain &rarr; Action)
- **Pusat Validasi RW**:
  - 📑 Validasi Rekomendasi RW (`/dashboard/dokumen`) — *Action: Validasi & Teruskan ke Kelurahan*
  - 📊 Radar Kinerja Pelayanan RT (`/dashboard/data-maturity`) — *Domain: Monitoring Bottleneck RT*
- **Sosial & Kemiskinan RW**:
  - ⚖️ Pemetaan Desil Kemiskinan (`/dashboard/desil`) — *Domain: DTKS & Perlindungan Sosial RW*
  - 🎁 Pengawasan Penyaluran Bansos (`/dashboard/bansos`) — *Action: Audit Sanggahan Lintas RT*
- **Tata Kelola Lingkungan**:
  - 💵 Konsolidasi Kas & Iuran RW (`/dashboard/keuangan`) — *Domain: Neraca Keuangan Wilayah*
  - 🛡️ Ketertiban & Aduan Warga (`/dashboard/pengaduan`) — *Action: Monitoring Resolusi Aduan*
- **Direktori Wilayah**:
  - 📋 Direktori Warga RW (`/dashboard/warga`) — *Domain: Master Pencarian Data Warga RW*

#### 4. Action Center Content
- **Kartu 1 (Operasional)**: `7 Rekomendasi Berkas Menunggu Pengesahan RW` — Tombol: *"Buka Baki Validasi Massal"*.
- **Kartu 2 (Bottleneck Alert)**: `Keterlambatan Pelayanan di RT 003` — Pemberitahuan bahwa rata-rata waktu verifikasi RT 003 mencapai 8 jam kerja. Tombol: *"Kirim Notifikasi Koordinasi ke Ketua RT 003"*.
- **Kartu 3 (Anomali Bansos)**: `3 Sanggahan Lapangan Menunggu Validasi RW` — Sanggahan warga mampu di RT 002 dan RT 005 sebelum diteruskan ke kelurahan.

#### 5. KPI Grid (4 Metrik Maksimal)
1. **Rekomendasi Menunggu RW**: `COUNT(dokumen_request) WHERE approval_step = 'RW' AND status = 'SUBMITTED'` (Nilai: "7 Berkas").
2. **RT Kinerja Terendah (Bottleneck)**: Nomor RT dengan antrean tertahan terbanyak (Nilai: "RT 003", Subteks: "5 berkas tertahan").
3. **Penyaluran Bansos RW**: Persentase paket bansos fisik yang telah diserahkan dan difoto geotagging (Nilai: "92%", Subteks: "115 dari 125 KPM").
4. **Kerentanan Sosial Ekstrem**: Keluarga Desil 1 yang belum terdaftar jaminan kesehatan (Nilai: "6 KK", Subteks: "Prioritas Usulan PBI").

#### 6. AI Daily Brief Format & Suggested Questions
- **Format Brief**:  
  *"Selamat pagi Ketua RW 001. Saat ini terdapat 7 berkas rekomendasi yang siap diteruskan ke loket kelurahan. Performa pelayanan RT umumnya baik, kecuali RT 003 yang mengalami penumpukan 5 berkas. Penyaluran bansos PKH telah mencapai 92%."*
- **4 Suggested Questions**:
  1. *"Berapa lama rata-rata waktu yang dibutuhkan RT 003 untuk memproses surat minggu ini?"*
  2. *"Apakah ada berkas rekomendasi RW yang sudah tertahan lebih dari 4 jam?"*
  3. *"Tampilkan daftar keluarga Desil 1 di RW 001 yang belum menerima bansos pangan."*
  4. *"Bagaimana neraca penerimaan iuran lingkungan dari 8 RT binaan pada bulan ini?"*

#### 7. Insight Card Format
- **What**: Terdeteksi ketimpangan kecepatan verifikasi surat di lingkungan RW 001.
- **Why**: RT 003 membutuhkan rata-rata 8.4 jam kerja per berkas, sementara RT 001 dan RT 002 di bawah 1.5 jam.
- **Evidence**: Data transaksi 30 hari terakhir (`analytics.repository.js`), 14 permohonan tertahan di RT 003.
- **Priority**: Sedang (Efisiensi Birokrasi).
- **Action**: Lakukan supervisi atau hubungi Ketua RT 003 via WhatsApp Gateway untuk asistensi berkas.

#### 8. Mobile Behavior
- Fitur *QuickSignTray* dirancang melayang di bagian bawah layar smartphone (*Sticky Bottom Sheet*).
- Grafik perbandingan RT disederhanakan menjadi bilah kemajuan (*Progress Bars*) dengan kode warna hijau-kuning-merah.

#### 9. State States (Empty, Loading, Error)
- **Empty State**: Teks *"Tidak ada rekomendasi surat yang menunggu validasi RW. Seluruh berkas telah diteruskan ke kelurahan."*
- **Loading State**: Shimmer loading pada tabel perbandingan RT dan baki approval.
- **Error State**: Banner merah *"Gagal memuat rekapitulasi data RW 001"*.

#### 10. Data & API Requirements
- `GET /api/dokumen?rw=001&approval_step=RW` &rarr; Daftar antrean validasi RW.
- `POST /api/dokumen/batch-approve` &rarr; Eksekusi persetujuan rekomendasi RW massal (`approved_by_rw`).
- `GET /api/analytics/velocity?rw=001` &rarr; Metrik kecepatan layanan per RT.
- `GET /api/bansos/stats?rw=001` &rarr; Statistik penyaluran dan audit bansos RW.

#### 11. Permission & Data Scope
- **Role RBAC**: `ketua_rw` (Level 2).
- **Data Scope**: Terkunci pada `rw = req.user.rw` (dapat mengakses seluruh data RT di dalam RW yang bersangkutan, namun dilarang mengakses RW lain).

---

### ROLE 4: ADMIN / PETUGAS LOKET KELURAHAN (Verifikator Final & Operator)

#### 1. Primary Job (30 Detik Pertama)
Petugas Loket harus dapat **membuka antrean berkas yang telah disahkan RT & RW**, memverifikasi kelengkapan yuridis persyaratan, **menerbitkan nomor surat dinas resmi**, dan **menghasilkan draf siap TTE untuk meja Lurah**.

#### 2. Recommended Dashboard Layout (Wireframe Blueprint)
```
+---------------------------------------------------------------------------------------------+
| TOPBAR: Logo Bumi Warga | [Admin Pelayanan - Kelurahan Kebonjati] | WhatsApp Bot: [ONLINE]  |
+---------------------------------------------------------------------------------------------+
| [RoleHeader]: "Meja Operasional Pelayanan Administrasi Kelurahan" | 18 RW / 92 RT Terhubung  |
+---------------------------------------------------------------------------------------------+
| [ActionCenter]: Antrean Loket Mendesak (Status: PENDING_KELURAHAN)                          |
| [!] 12 Berkas Siap Divalidasi Loket | 4 Draf Menunggu Koreksi Dokumen | 1 Gagal Kirim WA    |
+---------------------------------------------------------------------------------------------+
| [KPIGrid]: 4 Indikator Loket Kelurahan                                                      |
| [Antrean Loket: 12] | [Draf Siap TTE: 18] | [Surat Terbit Hari Ini: 34] | [SLA Breach: 0]   |
+---------------------------------------------------------------------------------------------+
| [Meja Kerja Verifikasi Surat]: Filter Tab: [Semua (12)] [SKTM (4)] [Domisili (5)] [Kematian]|
| Fitur: Nomor Agenda Otomatis | Preview KTP/KK Bersandingan | Tombol Generate Draf TTE       |
+---------------------------------------------------------------------------------------------+
| [Panel Pemantau Notifikasi WhatsApp]: Status bot, kuota pesan, dan daftar pesan gagal kirim |
+---------------------------------------------------------------------------------------------+
```

#### 3. Final Sidebar Structure (Role &rarr; Domain &rarr; Action)
- **Pelayanan Loket & Surat**:
  - 📥 Verifikasi Berkas Loket (`/dashboard/dokumen`) — *Action: Verifikasi & Terbitkan Nomor Agenda*
  - 🖨️ Draf Siap Pengesahan TTE (`/dashboard/dokumen?status=READY_TTE`) — *Action: Majukan ke Meja Lurah*
  - 📲 Pemantau Pesan WhatsApp (`/dashboard/whatsapp`) — *Domain: Monitoring Notifikasi Warga*
- **Master Registrasi Kependudukan**:
  - 👤 Master Basis Data Warga (`/dashboard/warga`) — *Domain: Registrasi & Mutasi NIK*
  - 👨‍👩‍👦 Master Register Kartu Keluarga (`/dashboard/kk`) — *Domain: Penerbitan & Pecah KK*
  - 🏛️ Rekonsiliasi NOP PBB (`/dashboard/pbb`) — *Domain: Verifikasi Pajak Bumi & Bangunan*
- **Program Sosial & Pembukuan**:
  - 📦 Tata Kelola Bansos & DTKS (`/dashboard/bansos`) — *Action: Verifikasi Audit Sanggahan*
  - 💼 Buku Kas Penerimaan Kelurahan (`/dashboard/keuangan`) — *Domain: Kas Retribusi/Operasional*
- **SOP & Integrasi**:
  - ⚙️ Panel Integrasi API Disdukcapil (`/dashboard/integrasi`) — *Domain: Status Integrasi Kota*
  - 📖 Buku Pedoman Layanan Kedinasan (`/dashboard/panduan`) — *Domain: Regulasi Permendagri*

#### 4. Action Center Content
- **Kartu 1 (Prioritas Pelayanan)**: `12 Berkas Siap Penomoran Agenda` — Menampilkan berkas berstatus `PENDING_KELURAHAN` yang telah lengkap ditandatangani RT & RW.
- **Kartu 2 (Koreksi Dokumen)**: `3 Permohonan Butuh Konfirmasi NIK Ganda` — Berkas yang NIK pemohonnya tidak sinkron dengan master data warga.
- **Kartu 3 (Infrastruktur)**: `Gateway WhatsApp Membutuhkan Re-koneksi` — Muncul jika status bot WA terputus (*disconnected*).

#### 5. KPI Grid (4 Metrik Maksimal)
1. **Antrean Loket Masuk**: `COUNT(dokumen_request) WHERE approval_step = 'KELURAHAN' AND status = 'SUBMITTED'` (Nilai: "12 Permohonan").
2. **Draf Siap TTE Lurah**: Berkas yang telah diberi nomor registrasi dan draf PDF-nya berhasil dibuat (Nilai: "18 Berkas").
3. **Surat Diterbitkan Hari Ini**: Dokumen resmi yang telah selesai ditandatangani Lurah hari ini (Nilai: "34 Dokumen").
4. **Tingkat Kepatuhan SLA Kelurahan**: Persentase berkas kelurahan selesai < 24 jam (Nilai: "98.5%", Warna: Emerald).

#### 6. AI Daily Brief Format & Suggested Questions
- **Format Brief**:  
  *"Selamat bertugas Petugas Loket. Pagi ini terdapat 12 berkas permohonan masuk yang telah diverifikasi RT/RW. Sebanyak 18 draf surat telah siap di meja pengesahan Lurah. Sistem notifikasi WhatsApp dalam kondisi ONLINE normal."*
- **4 Suggested Questions**:
  1. *"Berapa nomor agenda dinas berikutnya untuk Surat Keterangan Tidak Mampu (SKTM)?"*
  2. *"Tampilkan berkas yang persyaratannya belum lengkap untuk segera dikembalikan ke pemohon."*
  3. *"Apakah ada pesan WhatsApp konfirmasi surat selesai yang gagal terkirim hari ini?"*
  4. *"Tampilkan rekapitulasi jumlah surat yang terbit berdasarkan kategori minggu ini."*

#### 7. Insight Card Format
- **What**: Terdeteksi 3 permohonan SKTM dari RW 004 dengan lampiran foto kartu keluarga versi lama.
- **Why**: Menggunakan format KK tanpa barcode Ditjen Dukcapil berisiko ditolak oleh rumah sakit rujukan.
- **Evidence**: Nomor Registrasi `REG-1789441`, `REG-1789445`, `REG-1789449`.
- **Priority**: Tinggi (Kepatuhan Regulasi).
- **Action**: Kembalikan berkas dengan catatan ramah agar warga mengunggah foto KK barcode terbaru.

#### 8. Mobile Behavior
- Antarmuka Admin dioptimalkan untuk desktop loket (Dual-Monitor Support: Sisi kiri menampilkan dokumen scan warga, sisi kanan menampilkan formulir draf surat).
- Pada layar tablet/ponsel, formulir verifikasi dipadatkan menjadi modal layar penuh (*Full-Screen Sheet*).

#### 9. State States (Empty, Loading, Error)
- **Empty State**: Ilustrasi baki berkas kosong + Teks *"Baki loket bersih. Seluruh berkas masuk telah diproses dan dimajukan ke meja Lurah."*
- **Loading State**: Tabel dokumen skeleton dengan 5 baris shimmer.
- **Error State**: Peringatan *"Gagal menghubungkan ke generator draf surat"* + Tombol restart worker.

#### 10. Data & API Requirements
- `GET /api/dokumen?approval_step=KELURAHAN&status=SUBMITTED` &rarr; Antrean verifikasi loket.
- `PATCH /api/dokumen/:id/status` &rarr; Update status ke `READY_TTE` dan generate `nomor_registrasi`.
- `POST /api/whatsapp/send` &rarr; Pengiriman manual / otomatis pesan notifikasi ke no telepon warga.
- `GET /api/completeness/stats` &rarr; Kematangan data identitas pemohon.

#### 11. Permission & Data Scope
- **Role RBAC**: `admin_kelurahan` / `admin` (Level 1).
- **Data Scope**: Cakupan seluruh wilayah kelurahan (seluruh RT dan RW di Kelurahan Kebonjati).

---

### ROLE 5: LURAH (Otorisator TTE & Pimpinan Wilayah)

#### 1. Primary Job (30 Detik Pertama)
Lurah harus dapat **melihat jumlah dokumen yang menunggu penandatanganan elektronik (TTE)**, mengeksekusi pengesahan digital (single sign atau massal), dan **memperoleh gambaran eksekutif kondisi kesehatan/stunting serta aduan darurat warga dalam 30 detik**.

#### 2. Recommended Dashboard Layout (Wireframe Blueprint)
```
+---------------------------------------------------------------------------------------------+
| TOPBAR: Logo Bumi Warga | [Konteks: Lurah Kebonjati (Otorisator Resmi TTE)] | Tanggal Hari Ini|
+---------------------------------------------------------------------------------------------+
| [RoleHeader]: "Executive Command Center Kelurahan Kebonjati" | Indeks Kinerja Layanan: 96/100|
+---------------------------------------------------------------------------------------------+
| [QuickSignTray - Meja Tanda Tangan Digital Lurah]:                                          |
| "Terdapat 18 dokumen resmi siap disahkan bertanda tangan elektronik & QR Kriptografis."     |
| [Lihat Sampel Berkas]  --->  [Tombol Primer Ungu: TANDATANGANI 18 BERKAS SEKALIGUS (TTE)]   |
+---------------------------------------------------------------------------------------------+
| [AIBriefCard]: Executive Intelligence Daily Brief                                           |
| "100% permohonan surat hari ini selesai dalam SLA (<6 jam). Terdeteksi klaster 3 balita gizi |
| buruk di RW 002. Terdapat 1 aduan fasilitas jalan rusak yang belum ditanggapi > 48 jam."    |
+---------------------------------------------------------------------------------------------+
| [KPIGrid]: 4 Indikator Strategis Pimpinan                                                   |
| [Dokumen Menunggu TTE: 18] | [Capaian SLA: 98.5%] | [Balita Gizi Buruk: 3] | [Aduan Kritis: 1]|
+---------------------------------------------------------------------------------------------+
| [Radar Wilayah & Stunting]: Peta sebaran stunting dan kemiskinan per RW (RW 01 s.d. 18)     |
+---------------------------------------------------------------------------------------------+
| [Baki Disposisi Aduan Darurat]: Aduan warga berkategori keamanan/bencana butuh instruksi     |
+---------------------------------------------------------------------------------------------+
```

#### 3. Final Sidebar Structure (Role &rarr; Domain &rarr; Action)
- **Otorisasi & Kebijakan Eksekutif**:
  - ✍️ Pengesahan Dokumen TTE (`/dashboard/dokumen`) — *Action: Tanda Tangan Digital Berkas Warga*
  - 📈 Command Center & Daily Brief (`/dashboard/command-center`) — *Domain: Executive Radar Wilayah*
- **Program Prioritas Kota**:
  - 🩺 Pengawasan Stunting & Posyandu (`/dashboard/posyandu`) — *Domain: Zero Stunting Monitoring*
  - 🎯 Penetapan Alokasi Bansos (`/dashboard/bansos`) — *Action: Pengesahan Definitif DTKS*
  - 🚨 Disposisi & Aduan Warga (`/dashboard/pengaduan`) — *Action: Disposisi Keluhan Lapangan*
- **Kinerja Tata Kelola**:
  - ⏱️ Kepatuhan SLA Pelayanan (`/dashboard/data-maturity`) — *Domain: Audit Kecepatan Birokrasi*
  - 🏛️ Neraca Realisasi PBB & Kas (`/dashboard/daya-dukung`) — *Domain: Pendapatan & Daya Dukung*

#### 4. Action Center Content
- **Kartu 1 (Krusial Jabatan)**: `18 Dokumen Resmi Menunggu Otorisasi TTE` — Tombol: *"Buka Baki TTE Sekarang"*.
- **Kartu 2 (Darurat Medis / Sosial)**: `Klaster Stunting Baru di RW 002` — Tampil jika terdeteksi >= 3 balita gizi buruk di satu RW. Tombol: *"Instruksikan Intervensi Gizi PMT"*.
- **Kartu 3 (Reputasi Layanan)**: `Aduan Warga Kritis Belum Disposisi > 48 Jam` — Tombol: *"Buka Lembar Disposisi"*.

#### 5. KPI Grid (4 Metrik Maksimal)
1. **Menunggu TTE Lurah**: `COUNT(dokumen_request) WHERE status = 'READY_TTE'` (Nilai: "18 Berkas", Warna: Purple).
2. **Kepatuhan SLA Pelayanan**: Persentase total permohonan selesai tepat waktu (Nilai: "98.5%", Subteks: "Rata-rata 5.8 Jam").
3. **Balita Butuh Intervensi**: Jumlah kasus balita gizi buruk aktif di seluruh kelurahan (Nilai: "3 Balita", Warna: Amber).
4. **Disposisi Aduan Tertahan**: Aduan warga belum direspons > 48 jam (Nilai: "1 Aduan", Warna: Rose).

#### 6. AI Daily Brief Format & Suggested Questions
- **Format Brief**:  
  *"Selamat pagi Bapak Lurah. Pagi ini 18 dokumen warga siap disahkan tanda tangan digital. Kepatuhan SLA pelayanan kelurahan mencapai 98.5%. Perlu perhatian khusus: terdeteksi 3 balita gizi buruk di RW 002 dan 1 aduan saluran air tersumbat di RW 005 yang belum ditindaklanjuti."*
- **4 Suggested Questions**:
  1. *"Tampilkan dokumen yang paling mendesak untuk ditandatangani pagi ini."*
  2. *"RW mana yang memiliki kasus stunting dan gizi buruk balita tertinggi bulan ini?"*
  3. *"Bagaimana capaian realisasi penerimaan PBB-P2 di tingkat RW hingga minggu ini?"*
  4. *"Apa rekomendasi kebijakan bantuan sosial berdasarkan hasil audit sanggahan lapangan?"*

#### 7. Insight Card Format
- **What**: Konsentrasi kasus balita gizi buruk terpusat di wilayah RW 002 (3 dari total 4 kasus kelurahan).
- **Why**: Korelasi tinggi dengan rendahnya akses sanitasi jamban sehat dan status kemiskinan Desil 1 di RT 003 RW 002.
- **Evidence**: Rekap antropometri posyandu September 2026 (`ai_engine.service.js` - `buildRTRiskMatrix`).
- **Priority**: Kritis (Prioritas Pimpinan).
- **Action**: Terbitkan instruksi lurah untuk pemberian Makanan Tambahan (PMT) pemulihan dan peninjauan sanitasi oleh seksi pembangunan.

#### 8. Mobile Behavior
- Tombol otorisasi TTE didesain ramah sentuhan smartphone dengan verifikasi PIN / Biometrik bawaan perangkat (*WebAuthn / Passkey Ready*).
- Menampilkan kartu ringkasan eksekutif satu layar penuh yang nyaman dibaca saat Lurah dalam perjalanan dinas.

#### 9. State States (Empty, Loading, Error)
- **Empty State**: Ikon cap dinas centang + Teks *"Semua dokumen telah ditandatangani. Meja TTE digital bersih."*
- **Loading State**: Shimmer kartu metrik eksekutif dan baki TTE.
- **Error State**: Banner *"Gagal memuat sertifikat TTE digital. Periksa modul kriptografi."*

#### 10. Data & API Requirements
- `GET /api/dokumen?status=READY_TTE` &rarr; Daftar dokumen menunggu otorisasi Lurah.
- `POST /api/dokumen/batch-sign` &rarr; Eksekusi otorisasi digital massal dan penempelan QR code verifikasi.
- `GET /api/analytics/executive-summary` &rarr; Output inferensi mesin DSS `ai_engine.service.js`.
- `GET /api/posyandu/stats` &rarr; Statistik pemantauan stunting kelurahan.

#### 11. Permission & Data Scope
- **Role RBAC**: `lurah` (Level 1).
- **Data Scope**: Tingkat eksekutif seluruh kelurahan. Memiliki wewenang penandatanganan final dan akses analitik komprehensif.

---

### ROLE 6: KADER POSYANDU (Pencatat Balita & Lansia Lapangan)

#### 1. Primary Job (30 Detik Pertama)
Kader harus dapat **membuka formulir input balita/lansia dalam satu sentuhan**, melihat status antrean mutasi offline di perangkat, dan **mencatat hasil penimbangan dengan satu tangan secara cepat tanpa terhambat koneksi internet**.

#### 2. Recommended Dashboard Layout (Wireframe Blueprint)
```
+---------------------------------------------------------------------------------------------+
| TOPBAR: Logo Bumi Warga | [Kader Posyandu Melati - RW 001] | [Indikator Sinyal: ONLINE/OFF] |
+---------------------------------------------------------------------------------------------+
| [OfflineSyncBanner]: Status Antrean Memori Lokal                                            |
| 📶 Jaringan: Terhubung | 8 Data Pemeriksaan Belum Sinkron | [Tombol: SINKRONKAN SEKARANG]   |
+---------------------------------------------------------------------------------------------+
| [RoleHeader]: "Pelayanan Posyandu Balita & Lansia" | Hari Buka: Posyandu Melati RW 001     |
+---------------------------------------------------------------------------------------------+
| [One-Hand Action Tray - Mobile First]:                                                      |
| [ Tombol Besar Hijau: + CATAT BALITA (KMS) ]   [ Tombol Besar Biru: + PEMERIKSAAN LANSIA ]  |
+---------------------------------------------------------------------------------------------+
| [KPIGrid]: 4 Indikator Meja Posyandu                                                        |
| [Sasaran Balita: 42] | [Hadir Timbang: 31] | [Gizi Kurang: 2] | [Lansia Hipertensi: 6]      |
+---------------------------------------------------------------------------------------------+
| [Sinyal Waspada Pertumbuhan (Early Warning)]:                                               |
| [!] 3 Balita mengalami kurva BB menurun 2 bulan beruntun -> Butuh Konseling & PMT           |
+---------------------------------------------------------------------------------------------+
| [Daftar Antrean Sasaran Belum Hadir]: Filter cepat per RT di lingkungan RW                  |
+---------------------------------------------------------------------------------------------+
```

#### 3. Final Sidebar Structure (Role &rarr; Domain &rarr; Action)
- **Pelayanan Meja Posyandu**:
  - 👶 Layanan Balita & Antropometri (`/dashboard/posyandu?tab=balita`) — *Action: Input KMS & Status Gizi*
  - 👵 Layanan Lansia & Skrining ADL (`/dashboard/posyandu?tab=lansia`) — *Action: Tensi, GDS, Kolesterol*
  - 📶 Antrean & Sinkronisasi Offline (`/dashboard/posyandu/offline`) — *Domain: Monitoring Antrean IndexedDB*
- **Data Sasaran & Peringatan**:
  - 📋 Sasaran Balita & Lansia Binaan (`/dashboard/warga`) — *Domain: Registrasi Balita & Ibu*
  - ⚠️ Radar Balita Risiko Gizi (`/dashboard/posyandu/risiko`) — *Domain: Pemantauan Gagal Tumbuh*
- **Panduan & Standar**:
  - 📗 Standar Antropometri WHO (`/dashboard/panduan`) — *Domain: Tabel Baku Z-Score Kemenkes*

#### 4. Action Center Content
- **Kartu 1 (Krusial Sinkronisasi)**: `8 Data Belum Tersinkronkan ke Server` — Tampil kuning/merah jika ada antrean tersimpan di memori perangkat. Tombol besar: *"Kirim Data ke Server"*.
- **Kartu 2 (Peringatan Gizi)**: `Kurva Pertumbuhan Turun (2T)` — Menampilkan anak yang berat badannya tidak naik 2 kali penimbangan berturut-turut. Tombol: *"Buka Lembar Konseling PMT"*.
- **Kartu 3 (Lansia Risiko Tinggi)**: `Lansia Ketergantungan Berat (ADL)` — Menampilkan lansia sebatang kara yang butuh pendampingan kader.

#### 5. KPI Grid (4 Metrik Maksimal)
1. **Kehadiran Balita**: Rasio balita hadir timbang terhadap total sasaran (Nilai: "31 / 42 Anak (74%)", Subteks: "Target: >85%").
2. **Balita Terindikasi Kurang Gizi**: Jumlah anak dengan hasil IMT/Umur < -2 SD (Nilai: "2 Anak", Warna: Amber).
3. **Pemeriksaan Lansia Selesai**: Jumlah lansia yang telah diperiksa kesehatan hari ini (Nilai: "18 Lansia", Subteks: "Tensi & GDS").
4. **Status Antrean Offline**: Jumlah mutasi yang tertahan di memori perangkat (Nilai: "8 Antrean", Warna: Slate).

#### 6. AI Daily Brief Format & Suggested Questions
- **Format Brief**:  
  *"Semangat pagi Kader Posyandu Melati. Hari ini 31 dari 42 balita telah ditimbang. Sistem mendeteksi 2 balita terindikasi gizi kurang dan 3 balita mengalami penurunan bobot badan. Terdapat 8 data pemeriksaan di memori ponsel yang siap dikirim saat tersambung internet."*
- **4 Suggested Questions**:
  1. *"Siapa saja balita yang belum hadir penimbangan di Posyandu Melati hari ini?"*
  2. *"Tampilkan balita yang berat badannya turun dibandingkan bulan lalu."*
  3. *"Berapa skor Z-Score antropometri untuk balita usia 14 bulan dengan BB 8.2 kg dan TB 74 cm?"*
  4. *"Tampilkan lansia yang memiliki tekanan darah sistolik di atas 160 mmHg hari ini."*

#### 7. Insight Card Format
- **What**: Balita Ananda Rizky (14 Bulan, RT 001) mengalami penurunan berat badan 300 gram dari bulan lalu.
- **Why**: Kurva KMS menunjukkan tren menurun (*growth faltering*), risiko masuk kategori gizi kurang jika tidak diintervensi.
- **Evidence**: BB Juli: 8.5 kg, BB Agustus: 8.4 kg, BB September: 8.1 kg (`posyandu.service.js`).
- **Priority**: Tinggi (Pencegahan Stunting Dini).
- **Action**: Berikan edukasi makanan bergizi kaya protein hewani kepada orang tua dan jadwalkan kunjungan rumah (*home visit*).

#### 8. Mobile Behavior (Khusus Kader: 100% One-Hand Ergonomics)
- **Zona Ibu Jari Bawah (*Thumb Zone*)**: Seluruh tombol aksi utama ("Simpan Hasil Timbang", "Lanjut Sasaran Berikutnya", "Kamera Dokumentasi") ditempatkan di sepertiga bawah layar ponsel (ketinggian 0 s.d. 250px dari tepi bawah).
- **Input Angka Raksasa (*Numpad Friendly*)**: Kolom input Berat Badan (kg) dan Tinggi Badan (cm) menggunakan tipe `inputmode="decimal"` dengan font raksasa (28px) untuk mencegah salah ketik desimal.
- **Batas Kewajaran Otomatis (*Sanity Bounds*)**: Jika kader memasukkan BB balita > 30 kg atau < 1.5 kg, sistem langsung menampilkan dialog konfirmasi: *"Apakah yakin berat badan 85 kg? Format desimal menggunakan titik (misal: 8.5 kg)"*.

#### 9. State States (Empty, Loading, Error)
- **Empty State**: Ikon timbangan + Teks *"Belum ada penimbangan balita hari ini. Tekan tombol hijau di bawah untuk mencatat anak pertama."*
- **Loading State**: Spinner ringan tanpa memblokir input layar sentuh.
- **Error State**: Banner offline ramah *"Jaringan internet terputus. Data Anda disimpan aman di memori HP dan otomatis dikirim saat online."*

#### 10. Data & API Requirements
- `GET /api/posyandu/balita?rw=001` &rarr; Master sasaran balita RW.
- `POST /api/posyandu/balita` &rarr; Simpan rekam medis KMS (online atau via `offlineQueue.js`).
- `POST /api/posyandu/lansia/:id/pemeriksaan` &rarr; Simpan rekam skrining lansia.
- `GET /api/posyandu/stats?rw=001` &rarr; Rekap kehadiran dan status gizi balita.

#### 11. Permission & Data Scope
- **Role RBAC**: `kader_posyandu` (Level 3).
- **Data Scope**: Terkunci pada RW wilayah binaan posyandu (`rw = req.user.rw`). Dapat mengakses rekam medis posyandu balita dan lansia, namun tidak memiliki wewenang mengedit data kependudukan resmi atau menandatangani surat.

---

## 3. Spesifikasi Teknis Arsitektur & Resiliensi Luar Jaringan

### A. Arsitektur Antrean Luar Jaringan (*Offline Queue Architecture*)
Menggantikan ketergantungan rapuh `localStorage` (kuota 5MB) pada [`frontend/src/utils/offlineQueue.js`](file:///d:/wk_prod/frontend/src/utils/offlineQueue.js#L22) menjadi **IndexedDB Storage Pattern** berbasis pustaka ringan `idb` (kuota > 250MB):

```
[ AKSI PENGGUNA (Form Posyandu / Tanda Tangan Bansos) ]
                          │
                          ▼
            Apakah browser ONLINE? 
             ├── YA  ──> Kirim via Axios HTTP ke Express Backend
             └── TIDAK ──> Simpan ke IndexedDB: Objek Store 'mutations_queue'
                                    │
                                    ├── Payload: { id, url, method, body, createdAt, retryCount }
                                    ├── Dukungan Penyimpanan: Foto Blob / Canvas Signature
                                    └── Pemicu: window.dispatchEvent('offline-queue-updated')
                                    │
[ JARINGAN KEMBALI PULIH (Event: 'online') ]
                          │
                          ▼
            Fungsi: flushOfflineQueue()
             ├── Baca antrean berurutan (FIFO)
             ├── Eksekusi HTTP Request berulang
             ├── Berhasil  ──> Hapus dari IndexedDB
             └── Gagal Validasi Server (4xx) ──> Pindahkan ke Store 'dead_letter_queue'
```

### B. Validasi Input Cerdas & Batas Kewajaran (*Sanity Bounds*)
Untuk meminimalkan *human error* di lapangan, frontend wajib menerapkan batasan logika validasi sebelum mutasi disimpan:
1. **Antropometri Balita**:
   - `berat_badan_kg`: Minimum 1.0 kg, Maksimum 35.0 kg.
   - `tinggi_badan_cm`: Minimum 35.0 cm, Maksimum 130.0 cm.
   - `lingkar_kepala_cm`: Minimum 25.0 cm, Maksimum 60.0 cm.
2. **Pemeriksaan Lansia**:
   - `tensi_sistolik`: Minimum 70 mmHg, Maksimum 260 mmHg.
   - `tensi_diastolik`: Minimum 40 mmHg, Maksimum 160 mmHg.
   - `gula_darah_sewaktu`: Minimum 40 mg/dL, Maksimum 600 mg/dL.
3. **Surat Warga**:
   - Lampiran foto wajib memiliki resolusi minimal 600x600 pixel dan ukuran maksimal 5MB dengan kompresi otomatis di sisi browser (*Client-Side Image Resizing*).

---

## 4. Developer Handoff Checklist & Rencana Implementasi

| Fase Kerja | Target Komponen / Modul | Berkas Target Pengubahan | Kriteria Penerimaan (*Acceptance Criteria*) |
| :--- | :--- | :--- | :--- |
| **Fase 1: Sistem Desain & Token** | Komponen Atom & Wrapper | `frontend/src/components/core/*` | Seluruh status badge memenuhi rasio kontras 4.5:1 WCAG AA; Tipografi konsisten. |
| **Fase 2: Restrukturisasi Sidebar** | Navigasi Berbasis Domain Aksi | `frontend/src/layouts/DashboardLayout.jsx` | 6 role resmi memiliki menu ringkas berorientasi aksi; menu tabel mentah disatukan. |
| **Fase 3: Dashboard & Pusat Aksi** | `ActionCenter`, `WorkflowStepper`, `QuickSignTray` | `frontend/src/pages/DashboardHome.jsx`, `DokumenPage.jsx` | Warga melihat progress bar alur surat; RT & Lurah memiliki baki antrean cepat. |
| **Fase 4: Upgrade PWA Kader** | Migrasi IndexedDB & Mobile Form | `frontend/src/utils/offlineQueue.js`, `PosyanduPage.jsx` | Data penimbangan tersimpan aman saat offline tanpa galat kuota 5MB; tombol ramah 1 tangan. |
| **Fase 5: SLA Tracking & Database** | Penambahan Timestamp SLA | `src/db/auto_patch.js`, `dokumen.repository.js` | Tersedia pencatatan waktu per tahapan aktor untuk menghitung durasi presisi. |

---

*Spesifikasi UI/UX dan Produk ini siap diimplementasikan langsung oleh tim pengembang tanpa perlu menebak hierarki data, tata letak antarmuka, atau wewenang RBAC pengguna.*

