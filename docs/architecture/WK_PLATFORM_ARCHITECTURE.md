**WK COMMUNITY OS**

**DOKUMEN ARSITEKTUR PLATFORM**

| | |
|---|---|
| **ID Dokumen** | `WKOS-PA-2026-01` |
| **Versi** | `1.0` |
| **Tanggal** | `29 Juli 2026` |
| **Status** | `BASELINE` |
| **Penulis** | `Chief Software Architect` |

---

## Daftar Isi

1.  Pendahuluan
    1.1. Tujuan Dokumen
    1.2. Ruang Lingkup
    1.3. Audiens
2.  Prinsip-Prinsip Arsitektur
    2.1. Clean Architecture
    2.2. Modular Design
    2.3. Repository Pattern
    2.4. Service Layer
3.  Arsitektur Platform Berlapis (Layered Architecture)
    3.1. Diagram Arsitektur Umum
    3.2. Presentation Layer
    3.3. Application Layer
    3.4. Business Layer
    3.5. Repository Layer
    3.6. Database Layer
4.  Arsitektur Komponen Inti
    4.1. Struktur Modul
    4.2. Workflow Engine
    4.3. Rule Engine
    4.4. Notification Engine
    4.5. Dashboard Architecture
5.  Arsitektur Keamanan (Security Architecture)
    5.1. Otentikasi (Authentication)
    5.2. Otorisasi (Authorization)
6.  Arsitektur Deployment dan Integrasi
    6.1. Deployment Architecture
    6.2. Alur Kerja CI/CD
    6.3. Integrasi Platform Eksternal
7.  Peta Jalan Evolusi Arsitektur AI
    7.1. Arsitektur AI Gateway
    7.2. Fase 1: Integrasi Local LLM (Ollama)
    7.3. Fase 2: Integrasi Cloud AI (Google Vertex AI)

---

## 1. Pendahuluan

### 1.1. Tujuan Dokumen

Dokumen ini bertujuan untuk mendefinisikan dan menjelaskan arsitektur platform WK Community OS secara komprehensif. Ini akan berfungsi sebagai cetak biru (*blueprint*) teknis bagi para arsitek, pengembang, dan tim DevOps dalam merancang, membangun, dan memelihara platform. Dokumen ini meresmikan standar teknis dan prinsip desain yang harus dipatuhi untuk memastikan platform yang dihasilkan bersifat skabel, andal, dan mudah dipelihara.

### 1.2. Ruang Lingkup

Dokumen ini mencakup:
- Prinsip-prinsip desain arsitektur fundamental.
- Struktur arsitektur berlapis dari tingkat presentasi hingga basis data.
- Desain komponen-komponen inti seperti *Workflow Engine* dan *Rule Engine*.
- Arsitektur keamanan, deployment, dan integrasi dengan sistem eksternal.
- Peta jalan evolusi arsitektur untuk mendukung fitur-fitur canggih seperti AI dan LLM.

### 1.3. Audiens

- **Chief Software Architect:** Sebagai pemilik dan pemelihara dokumen.
- **Software Developer:** Sebagai panduan dalam implementasi kode dan desain fitur.
- **DevOps Engineer:** Sebagai referensi untuk merancang dan mengelola infrastruktur CI/CD dan deployment.
- **Product Manager:** Untuk memahami kapabilitas teknis dan batasan platform.

---

## 2. Prinsip-Prinsip Arsitektur

Arsitektur WK Community OS dibangun di atas empat pilar fundamental untuk menjamin kualitas dan keberlanjutan jangka panjang.

### 2.1. Clean Architecture

Kami mengadopsi prinsip *Clean Architecture* yang memisahkan secara tegas antara logika bisnis (*business logic*) dengan detail implementasi (misalnya, UI, database, framework). Ketergantungan selalu mengarah ke dalam, dari lapisan luar yang tidak stabil ke lapisan dalam yang stabil. Ini memastikan bahwa inti dari aplikasi (logika bisnis) tidak bergantung pada teknologi eksternal dan dapat diuji secara independen.

### 2.2. Modular Design

Platform dirancang secara modular, di mana setiap fungsionalitas bisnis (misalnya, *Citizen*, *Family*, *Letter*) dienkapsulasi dalam modulnya sendiri. Setiap modul memiliki *Controller*, *Service*, dan *Repository*-nya sendiri. Desain ini memungkinkan pengembangan paralel, mengurangi ketergantungan antar-tim, dan mempermudah pemeliharaan atau penggantian modul di masa depan.

### 2.3. Repository Pattern

Pola ini digunakan untuk memisahkan logika bisnis dari logika akses data. *Service Layer* tidak akan pernah berinteraksi langsung dengan sumber data. Sebaliknya, ia akan berkomunikasi melalui *interface* yang didefinisikan oleh *Repository*. Implementasi konkret dari *Repository* (misalnya, `SpreadsheetCitizenRepository` atau `MySqlCitizenRepository`) dapat ditukar tanpa mengubah kode di *Service Layer*.

### 2.4. Service Layer

Seluruh logika bisnis, aturan, dan orkestrasi proses ditempatkan secara eksklusif di dalam *Service Layer*. Lapisan ini berfungsi sebagai fasad untuk kasus penggunaan (*use cases*) aplikasi. *Controller* hanya bertugas meneruskan permintaan ke *Service* yang sesuai, dan *Repository* hanya bertugas menyediakan data. Ini menjaga logika bisnis tetap terpusat dan mudah diuji.

---

## 3. Arsitektur Platform Berlapis (Layered Architecture)

### 3.1. Diagram Arsitektur Umum

Arsitektur WK Community OS dibagi menjadi lima lapisan logis yang berbeda, memastikan pemisahan tanggung jawab (*separation of concerns*) yang jelas.

```ascii
+-------------------------------------------------------------------------+
|                           Presentation Layer                            |
|  (Google Apps Script HTML Service, Vercel Frontend, Mobile Client)      |
+-------------------------------------------------------------------------+
                              | (HTTP Requests, Function Calls)
                              v
+-------------------------------------------------------------------------+
|                           Application Layer                             |
|  (Router.gs, CitizenController.gs, FamilyController.gs)                 |
+-------------------------------------------------------------------------+
                              | (Method Calls)
                              v
+-------------------------------------------------------------------------+
|                             Business Layer                              |
|  (CitizenService.gs, ApprovalWorkflowEngine, NotificationEngine)        |
+-------------------------------------------------------------------------+
                              | (Interface Calls)
                              v
+-------------------------------------------------------------------------+
|                            Repository Layer                             |
|  (CitizenRepository.gs, ILetterRepository, DatabaseAdapter)             |
+-------------------------------------------------------------------------+
                              | (Driver-specific Calls)
                              v
+-------------------------------------------------------------------------+
|                             Database Layer                              |
|  (SpreadsheetDriver.gs, MockDriver.gs) -> [Google Sheets, In-Memory]    |
+-------------------------------------------------------------------------+
```

### 3.2. Presentation Layer

- **Tanggung Jawab:** Menampilkan data kepada pengguna dan menangkap input dari pengguna.
- **Teknologi:**
    - **Google Apps Script `HtmlService`:** Untuk antarmuka web yang terintegrasi langsung di dalam ekosistem Google (misalnya, berjalan di dalam Google Sites atau sebagai web app mandiri).
    - **Vercel/Next.js:** Untuk *landing page* publik, portal berita, atau aplikasi frontend yang lebih kompleks yang berinteraksi dengan backend Apps Script melalui API.
    - **Mobile Client (Masa Depan):** Aplikasi seluler (Android/iOS) yang akan berkomunikasi melalui API Gateway.

### 3.3. Application Layer

- **Tanggung Jawab:** Menerima permintaan dari *Presentation Layer*, meneruskannya ke *Business Layer* yang sesuai, dan memformat hasil untuk dikirim kembali. Lapisan ini tidak mengandung logika bisnis.
- **Komponen:**
    - **`Router.gs`:** Titik masuk tunggal untuk semua permintaan. Menganalisis parameter permintaan (`action`, `module`) untuk memanggil metode *Controller* yang benar.
    - **`[Module]Controller.gs`:** Bertanggung jawab atas validasi input dasar (misalnya, memeriksa apakah parameter ada) dan memanggil metode *Service*.

### 3.4. Business Layer

- **Tanggung Jawab:** Ini adalah inti dari aplikasi. Semua logika bisnis, aturan validasi yang kompleks, orkestrasi alur kerja, dan pengambilan keputusan berada di sini.
- **Komponen:**
    - **`[Module]Service.gs`:** Mengimplementasikan kasus penggunaan spesifik untuk sebuah modul (misalnya, `registerNewCitizen`, `processLetterRequest`).
    - **`WorkflowEngine.gs`:** Mengelola alur kerja multi-langkah, seperti proses persetujuan surat.
    - **`RuleEngine.gs`:** Mengeksekusi aturan bisnis yang dapat dikonfigurasi.
    - **`NotificationEngine.gs`:** Mengelola pengiriman notifikasi (email, dll.).

### 3.5. Repository Layer

- **Tanggung Jawab:** Menyediakan abstraksi untuk akses data. Mendefinisikan *interface* (misalnya, `findAll`, `findById`, `save`) yang akan digunakan oleh *Business Layer*.
- **Komponen:**
    - **`I[Module]Repository.js`:** *Interface* yang mendefinisikan kontrak operasi data untuk sebuah modul.
    - **`DatabaseAdapter.js`:** *Interface* generik yang diimplementasikan oleh semua *driver* database.

### 3.6. Database Layer

- **Tanggung Jawab:** Implementasi konkret dari akses data. Berinteraksi langsung dengan media penyimpanan.
- **Komponen:**
    - **`SpreadsheetDriver.gs`:** Implementasi `DatabaseAdapter` yang membaca dan menulis data ke Google Spreadsheet.
    - **`MockDriver.gs`:** Implementasi `DatabaseAdapter` yang menggunakan array dalam memori untuk tujuan pengujian (*testing*).
    - **`MySqlDriver.gs` (Masa Depan):** Implementasi untuk berinteraksi dengan database SQL melalui JDBC Service Apps Script.

---

## 4. Arsitektur Komponen Inti

### 4.1. Struktur Modul

Setiap modul bisnis dienkapsulasi dalam direktorinya sendiri di dalam `src/` dan mengikuti struktur standar:

```
src/
└── citizen/
    ├── CitizenController.js
    ├── CitizenService.js
    └── CitizenRepository.js
```

### 4.2. Workflow Engine

Mesin ini bertanggung jawab untuk mengelola proses bisnis yang terdiri dari beberapa langkah dan mungkin melibatkan beberapa aktor.
- **Definisi Workflow:** Didefinisikan dalam format JSON atau objek JavaScript, yang menguraikan setiap status, transisi yang diizinkan, dan peran (*role*) yang dapat melakukan transisi.
- **State Management:** Melacak status saat ini dari setiap entitas dalam alur kerja (misalnya, surat dengan status `DRAFT`, `SUBMITTED`, `APPROVED_RT`, `APPROVED_RW`).

### 4.3. Rule Engine

Mesin ini memisahkan aturan bisnis dari kode inti, memungkinkan aturan diubah tanpa perlu melakukan *deployment* ulang kode.
- **Definisi Aturan:** Aturan didefinisikan dalam format `(Kondisi, Aksi)`. Contoh: `IF (letter.type === 'SKTM' && citizen.income < 2000000) THEN allow_transition = true`.
- **Eksekusi:** *Workflow Engine* akan memanggil *Rule Engine* sebelum mengizinkan transisi status untuk memvalidasi apakah kondisi terpenuhi.

### 4.4. Notification Engine

Komponen terpusat untuk menangani semua komunikasi keluar.
- **Template:** Menggunakan template (misalnya, dari file HTML) untuk email atau notifikasi lainnya.
- **Antrean (Queue):** Permintaan notifikasi dimasukkan ke dalam antrean (diimplementasikan menggunakan Google Spreadsheet atau CacheService) untuk pengiriman asinkron.
- **Driver:** Mendukung berbagai *driver* pengiriman (misalnya, `MailAppDriver`, `WhatsAppDriver` di masa depan).

### 4.5. Dashboard Architecture

Dasbor dirancang untuk menjadi dinamis dan berbasis data.
- **Data Source:** *Service Layer* akan menyediakan metode khusus `getDashboardData()` yang mengagregasi data dari berbagai *repository*.
- **Caching:** Data dasbor yang mahal untuk dihitung akan di-cache menggunakan `CacheService` Apps Script untuk mengurangi waktu muat.
- **Visualisasi:** Data mentah dikirim ke *Presentation Layer*, di mana *library* seperti Google Charts atau Chart.js digunakan untuk rendering.

---

## 5. Arsitektur Keamanan (Security Architecture)

### 5.1. Otentikasi (Authentication)

Menggunakan mekanisme bawaan Google. Pengguna yang mengakses aplikasi harus login dengan Akun Google mereka. `Session.getActiveUser().getEmail()` digunakan sebagai identitas unik pengguna.

### 5.2. Otorisasi (Authorization)

Kami mengimplementasikan *Role-Based Access Control* (RBAC).
- **Definisi Peran:** Peran (misalnya, `ADMIN`, `APARAT_KELURAHAN`, `KETUA_RW`, `WARGA`) didefinisikan dalam sebuah konfigurasi.
- **Pemetaan Pengguna-ke-Peran:** Sebuah tabel di Google Spreadsheet memetakan email pengguna ke peran mereka.
- **Pemeriksaan Izin:** Sebuah fungsi `Security.hasPermission(user, requiredRole)` akan dipanggil di awal setiap metode *Controller* atau *Service* yang memerlukan otorisasi.

---

## 6. Arsitektur Deployment dan Integrasi

### 6.1. Deployment Architecture

Kami menggunakan pendekatan berbasis direktori untuk memisahkan lingkungan.

```ascii
+----------------+   +----------------+   +----------------+
|     WK_DEV     |   |   WK_STAGING   |   |     WK_PROD    |
| (.clasp.json)  |   | (.clasp.json)  |   | (.clasp.json)  |
+----------------+   ++---------------+   ++---------------+
        |                  |                  |
        | (scriptId_dev)   | (scriptId_stg)   | (scriptId_prod)
        v                  v                  v
+----------------+   +----------------+   +----------------+
| Apps Script DEV|   |Apps Script STG |   |Apps Script PROD|
+----------------+   +----------------+   +----------------+
```

### 6.2. Alur Kerja CI/CD

Menggunakan **GitHub Actions** sebagai orkestrator utama.

```ascii
1. Push to `develop` branch
         |
         v
2. GitHub Action Triggered
         |
         v
3. Checkout code into WK_DEV folder structure
         |
         v
4. Run `scripts/release.sh --non-interactive --env dev`
         |
         v
5. Script executes: doctor -> backup -> deploy (to DEV) -> smoketest
         |
         v
6. On Success -> Report to GitHub
```

### 6.3. Integrasi Platform Eksternal

- **Google Apps Script & Spreadsheet:** Sebagai inti dari backend dan database.
- **GitHub:** Sebagai *source control* dan pemicu alur kerja CI/CD.
- **Blogger:** Digunakan sebagai portal berita atau pengumuman publik. WK Community OS dapat mem-posting pembaruan secara otomatis ke Blogger melalui Blogger API yang tersedia di Apps Script.
- **Vercel:** Digunakan untuk meng-host aplikasi frontend (Next.js) yang lebih canggih. Frontend ini akan berinteraksi dengan backend Apps Script yang di-deploy sebagai Web App, berfungsi sebagai API.

---

## 7. Peta Jalan Evolusi Arsitektur AI

### 7.1. Arsitektur AI Gateway

Untuk mengintegrasikan berbagai model AI, kami akan membuat `AIGateway.gs`. Ini akan berfungsi sebagai fasad yang mengarahkan permintaan ke penyedia AI yang sesuai.

```ascii
+---------------------+
|   Business Layer    |
| (e.g., AIService.gs)|
+---------------------+
          |
          v
+---------------------+
|     AIGateway.gs    |
+---------------------+
          |
 +--------+---------+
 |                  |
 v                  v
+----------------+  +-----------------+
| Local LLM Driver |  | Cloud AI Driver |
| (Ollama)       |  | (Vertex AI)     |
+----------------+  +-----------------+
```

### 7.2. Fase 1: Integrasi Local LLM (Ollama)

- **Tujuan:** Menyediakan fitur AI generatif (misalnya, "AI Assistant") dengan tetap menjaga data sensitif tetap berada di jaringan lokal (*on-premise*).
- **Arsitektur:**
    1.  Sebuah server di jaringan lokal akan menjalankan **Ollama** dengan model LLM (misalnya, Llama 3, Mistral).
    2.  Server ini akan mengekspos sebuah endpoint API.
    3.  Google Apps Script, melalui `UrlFetchApp`, akan membuat permintaan ke endpoint API lokal ini.
    4.  Karena Apps Script berjalan di cloud Google, diperlukan sebuah *tunnel* atau *firewall rule* agar server Google dapat mengakses endpoint di jaringan lokal. Ini adalah tantangan utama yang harus diatasi.

### 7.3. Fase 2: Integrasi Cloud AI (Google Vertex AI)

- **Tujuan:** Memanfaatkan kekuatan model AI skala besar untuk analisis data non-sensitif.
- **Arsitektur:**
    1.  Data yang sudah dianonimkan (misalnya, data agregat PBB) akan diekspor ke Google Cloud Storage.
    2.  Sebuah *Cloud Function* akan dipicu untuk memproses data ini menggunakan layanan Vertex AI (misalnya, untuk *forecasting*).
    3.  Hasil analisis akan disimpan kembali ke Cloud Storage atau BigQuery.
    4.  WK Community OS akan membaca hasil analisis ini melalui API atau konektor BigQuery Apps Script.