**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU ENTERPRISE DEVELOPMENT KIT (EDK)**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-021` |
| **Nama Dokumen** | Cetak Biru Enterprise Development Kit (EDK) |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Enterprise Software Architect, Framework Engineer |
| **Peninjau** | Chief Software Architect, Lead Developer |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Enterprise Development Kit (EDK)** WK Community OS. EDK adalah seperangkat perkakas, pustaka, dan generator kode berbasis Command-Line Interface (CLI) yang dirancang untuk menstandardisasi dan mempercepat siklus pengembangan modul dalam ekosistem WK Community OS.

Tujuan utama EDK adalah untuk memberlakukan standar arsitektur yang telah ditetapkan dalam `WK_MODULE_STANDARD.md` secara otomatis. Dengan menyediakan perintah sederhana untuk menghasilkan kerangka (*scaffolding*) modul, *controller*, *service*, *repository*, dan komponen lainnya, EDK secara drastis mengurangi waktu yang dibutuhkan developer untuk menulis kode boilerplate. Hal ini memungkinkan tim untuk lebih fokus pada implementasi logika bisnis yang memberikan nilai tambah, sekaligus memastikan bahwa setiap kode yang dihasilkan memiliki kualitas, struktur, dan konsistensi yang seragam.

## 3. Development Philosophy

EDK dibangun di atas dua filosofi utama:

1.  **Convention over Configuration (Konvensi di atas Konfigurasi):**
    Platform WK Community OS memiliki arsitektur dan standar yang jelas. EDK memberlakukan standar ini sebagai konvensi. Developer tidak perlu membuat keputusan tentang di mana menempatkan file atau bagaimana menamainya; EDK akan melakukannya secara otomatis sesuai konvensi. Ini mengurangi beban kognitif dan potensi kesalahan.

2.  **Don't Repeat Yourself (DRY):**
    Menulis struktur file dan kode boilerplate yang sama berulang kali untuk setiap modul baru adalah pemborosan waktu. EDK mengotomatiskan tugas-tugas yang berulang ini, memastikan developer hanya menulis kode yang unik untuk setiap fungsionalitas.

## 4. EDK Architecture

Arsitektur EDK berpusat pada sebuah tool CLI tunggal yang berinteraksi dengan templat kode untuk menghasilkan file di dalam struktur proyek.

```ascii
+-----------------+
|   Developer     |
+-----------------+
        |
        | 1. Executes Command (e.g., `wk-cli generate:module citizen`)
        v
+-----------------+
|     WK-CLI      | (Command-Line Interface Tool)
+-----------------+
        |
        | 2. Reads Corresponding Template
        v
+-----------------+
|    Templates    | (e.g., `repository.js.tpl`, `service.js.tpl`)
+-----------------+
        |
        | 3. Generates Files with Boilerplate Code
        v
+-----------------+
|  Project Files  | (e.g., `src/citizen/Repository.js`, `src/citizen/Service.js`)
+-----------------+
```

## 5. CLI Architecture

Tool `wk-cli` itu sendiri dirancang dengan arsitektur yang modular, kemungkinan besar menggunakan Node.js dan pustaka seperti `commander.js` atau `yargs`.

```ascii
User Input: `wk-cli generate:module <ModuleName>`
      |
      v
+--------------------------+
|   Command Parser         | (e.g., commander.js)
| (Parses 'generate:module') |
+--------------------------+
      |
      v
+--------------------------+
|   Command Handler        | (Invokes `GenerateModuleCommand`)
| (`GenerateModuleCommand.js`)|
+--------------------------+
      |
      v
+--------------------------+
|   File Generator         | (Reads templates, replaces variables like `{{ModuleName}}`)
| (`TemplateEngine.js`)    |
+--------------------------+
      |
      v
+--------------------------+
|   File System Writer     | (Creates directories and writes the generated files)
| (`fs` module)            |
+--------------------------+
```

---

## Generator Commands

Bagian ini merinci perintah-perintah utama yang disediakan oleh `wk-cli` untuk *scaffolding*.

### 6. Module Generator

- **Command:** `wk-cli generate:module <ModuleName>`
- **Deskripsi:** Perintah ini adalah yang paling komprehensif. Ia akan membuat direktori baru di `src/<ModuleName>` dan menghasilkan seluruh file standar (`module.json`, `Repository.js`, `Service.js`, `Controller.js`, `README.md`, `Test.js`, dll.) dengan kode boilerplate dasar.
- **Contoh:** `wk-cli generate:module socialassistance`

### 7. Repository Generator

- **Command:** `wk-cli generate:repository <ModuleName>`
- **Deskripsi:** Menghasilkan file `Repository.js` di dalam modul yang sudah ada, lengkap dengan kerangka kelas `[ModuleName]Repository` dan metode CRUD dasar (e.g., `findById`, `findAll`, `save`, `delete`).
- **Contoh:** `wk-cli generate:repository socialassistance`

### 8. Service Generator

- **Command:** `wk-cli generate:service <ModuleName>`
- **Deskripsi:** Menghasilkan file `Service.js` di dalam modul yang sudah ada, dengan kerangka kelas `[ModuleName]Service` dan contoh metode bisnis.
- **Contoh:** `wk-cli generate:service socialassistance`

### 9. Controller Generator

- **Command:** `wk-cli generate:controller <ModuleName>`
- **Deskripsi:** Menghasilkan file `Controller.js` di dalam modul yang sudah ada, dengan kerangka kelas `[ModuleName]Controller` dan contoh metode untuk menangani permintaan.
- **Contoh:** `wk-cli generate:controller socialassistance`

### 10. Dashboard Generator

- **Command:** `wk-cli generate:dashboard <ModuleName>`
- **Deskripsi:** Menghasilkan file `Dashboard.js` dengan contoh definisi *widget* dasbor (Scorecard, Chart) yang akan didaftarkan melalui `module.json`.
- **Contoh:** `wk-cli generate:dashboard socialassistance`

### 11. Rule Generator

- **Command:** `wk-cli generate:rule <ModuleName> <RuleName>`
- **Deskripsi:** Menambahkan definisi aturan baru ke dalam file konfigurasi aturan (misalnya, `src/config/rules.json`), dengan kerangka kondisi (`IF`) dan aksi (`THEN`).
- **Contoh:** `wk-cli generate:rule socialassistance CheckEligibility`

### 12. Permission Generator

- **Command:** `wk-cli generate:permission <ModuleName>`
- **Deskripsi:** Menghasilkan file `Permission.js` dengan contoh definisi hak akses (e.g., `socialassistance.view`, `socialassistance.approve`).
- **Contoh:** `wk-cli generate:permission socialassistance`

### 13. Menu Generator

- **Command:** `wk-cli generate:menu <ModuleName>`
- **Deskripsi:** Menghasilkan file `Menu.js` dengan contoh definisi item menu untuk navigasi utama.
- **Contoh:** `wk-cli generate:menu socialassistance`

### 14. Test Generator

- **Command:** `wk-cli generate:test <ModuleName>`
- **Deskripsi:** Menghasilkan file `Test.js` dengan kerangka pengujian unit untuk `Service.js`, lengkap dengan *mocking* untuk `Repository.js`.
- **Contoh:** `wk-cli generate:test socialassistance`

### 15. Migration Generator

- **Command:** `wk-cli generate:migration <Description>`
- **Deskripsi:** Membuat file migrasi baru di direktori `migrations/` dengan nama file ber-timestamp (e.g., `20260729103000_add_column_to_citizen.js`). File ini berisi kerangka fungsi `up()` dan `down()`.
- **Contoh:** `wk-cli generate:migration AddStatusToBansos`

### 16. Seeder Generator

- **Command:** `wk-cli generate:seeder <TableName>`
- **Deskripsi:** Membuat file *seeder* baru di direktori `seeders/` untuk mengisi data awal ke dalam tabel (spreadsheet) tertentu.
- **Contoh:** `wk-cli generate:seeder SocialAssistancePrograms`

### 17. Documentation Generator

- **Command:** `wk-cli generate:docs <ModuleName>`
- **Deskripsi:** Menghasilkan file `README.md` di dalam direktori modul dengan templat standar yang mencakup tujuan modul, cara penggunaan, dan daftar API.
- **Contoh:** `wk-cli generate:docs socialassistance`

### 18. Release Generator

- **Command:** `wk-cli release:patch` / `release:minor` / `release:major`
- **Deskripsi:** Perintah ini akan mengotomatiskan sebagian proses rilis:
    1.  Meningkatkan versi di `package.json` dan semua `module.json` yang berubah.
    2.  Membuat tag Git baru.
    3.  Menghasilkan draf `CHANGELOG.md` dari riwayat commit sejak tag terakhir.
- **Contoh:** `wk-cli release:minor`

---

## 19. Coding Workflow

Alur kerja yang direkomendasikan bagi developer saat membuat fungsionalitas baru dari awal.

```ascii
      (*)
       |
       v
[1. `wk-cli generate:module <ModuleName>`]
       |
       v
[2. Buka `src/<ModuleName>/Repository.js`]
[   (Definisikan metode akses data)   ]
       |
       v
[3. Buka `src/<ModuleName>/Service.js`]
[   (Implementasikan logika bisnis)   ]
       |
       v
[4. Buka `src/<ModuleName>/Controller.js`]
[   (Hubungkan rute ke metode Service)  ]
       |
       v
[5. `wk-cli generate:test <ModuleName>`]
[   (Tulis unit test untuk Service)   ]
       |
       v
[6. Jalankan semua tes]
       |
       v
[7. `git commit` & `git push`]
       |
       v
      (X)
```

---

## 20. Folder Structure

Struktur direktori untuk tool EDK (`wk-cli`) itu sendiri.

```ascii
wk-community-os/
├── ... (project folders)
└── tools/
    └── wk-cli/
        ├── bin/
        │   └── wk-cli          (File eksekusi utama)
        ├── src/
        │   ├── commands/
        │   │   ├── generateModule.js
        │   │   ├── generateService.js
        │   │   └── ... (file untuk setiap perintah)
        │   │
        │   └── templates/
        │       ├── module/
        │       │   ├── Controller.js.tpl
        │       │   ├── Repository.js.tpl
        │       │   ├── Service.js.tpl
        │       │   └── module.json.tpl
        │       └── migration/
        │           └── migration.js.tpl
        │
        └── package.json
```

---

## 21. Future CLI Roadmap

| Versi | Fokus | Fitur Utama |
| :--- | :--- | :--- |
| **v1.0** | **Scaffolding** | Seluruh perintah `generate:*` untuk pembuatan kerangka kode. |
| **v1.5** | **Code Quality** | - `wk-cli lint`: Menjalankan ESLint pada seluruh proyek.<br>- `wk-cli format`: Menjalankan Prettier untuk memformat kode secara otomatis. |
| **v2.0** | **DevOps Integration** | - `wk-cli deploy`: Wrapper cerdas untuk skrip `deploy.sh`, dengan pilihan lingkungan.<br>- `wk-cli backup`: Wrapper untuk `backup.sh`. |
| **v2.5** | **Refactoring** | - `wk-cli refactor:rename-module <OldName> <NewName>`: Mengganti nama modul di semua file dan dependensi terkait secara aman. |
| **v3.0** | **Interactive Mode & GUI**| - Mode interaktif (`wk-cli new`) yang menanyakan langkah demi langkah.<br>- Pengembangan antarmuka web (GUI) untuk EDK. |