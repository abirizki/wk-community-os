**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU WK COMMAND-LINE INTERFACE (CLI)**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-022` |
| **Nama Dokumen** | Cetak Biru WK Command-Line Interface (CLI) |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Enterprise Software Architect, DevOps Architect |
| **Peninjau** | Chief Software Architect, Lead Developer |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **WK Command-Line Interface (WK CLI)**, komponen inti dari Enterprise Development Kit (EDK) WK Community OS. WK CLI adalah sebuah perkakas baris perintah terpadu yang dirancang untuk menjadi satu-satunya titik interaksi bagi developer dalam siklus hidup pengembangan perangkat lunak, mulai dari pembuatan modul hingga deployment ke produksi.

Tujuan utamanya adalah untuk menyederhanakan, menstandardisasi, dan mengotomatiskan tugas-tugas yang berulang. WK CLI menyediakan serangkaian perintah yang intuitif untuk menghasilkan kerangka kode (*scaffolding*), menjalankan pemeriksaan kualitas, dan mengorkestrasi alur kerja DevOps yang kompleks. Dengan menyatukan fungsi-fungsi ini ke dalam satu perkakas, kami secara signifikan meningkatkan pengalaman pengembang (Developer Experience), mengurangi potensi kesalahan manusia, dan memastikan bahwa setiap kontribusi kode selaras dengan standar arsitektur dan kualitas yang telah ditetapkan.

## 3. CLI Philosophy

Pengembangan WK CLI didasarkan pada filosofi-filosofi berikut:

- **Single Point of Command:** Developer hanya perlu mengingat satu perintah utama: `wk`. Semua tugas pengembangan dan DevOps dapat diakses dari satu titik masuk ini, menghilangkan kebutuhan untuk mengingat banyak nama skrip atau lokasi file.
- **Developer Experience First:** Alur kerja harus terasa alami dan efisien. Perintah harus intuitif, output harus jelas, dan pesan kesalahan harus informatif. Tujuannya adalah untuk menghilangkan friksi dari proses pengembangan.
- **Automation & Consistency:** Mengotomatiskan pembuatan kode boilerplate dan orkestrasi proses DevOps. Ini tidak hanya menghemat waktu tetapi juga memberlakukan konsistensi dan kepatuhan terhadap standar secara otomatis.
- **Extensible by Design:** Arsitektur CLI harus memungkinkan penambahan perintah-perintah baru di masa depan dengan mudah seiring dengan berkembangnya platform dan kebutuhan tim.

## 4. CLI Architecture

WK CLI berfungsi sebagai *facade* atau lapisan abstraksi di atas perkakas dan skrip yang ada.

```ascii
+-----------------------------------------------------------------+
|                            Developer                            |
+-----------------------------------------------------------------+
                               |
                               | Executes `wk <command> [arguments]`
                               v
+-----------------------------------------------------------------+
|                             WK CLI                              |
|                     (Command-Line Interface)                    |
+-----------------------------------------------------------------+
                               |
                  +------------+-------------+
                  | (Generator)            | (Orchestrator)
                  v                          v
+---------------------------------+  +----------------------------+
|  Internal Scaffolding Handler   |  |  External Script Wrapper   |
| (Uses Code Templates)           |  | (Executes .sh scripts)     |
+---------------------------------+  +----------------------------+
                  |                          |
                  v                          v
+---------------------------------+  +----------------------------+
|      Generated Project Files    |  |  DevOps Scripts (release.sh)|
+---------------------------------+  +----------------------------+
```

## 5. Command Reference

Bagian ini merinci setiap perintah yang tersedia dalam WK CLI v1.0.

### 5.1. DevOps & System Commands

Perintah-perintah ini berfungsi sebagai *wrapper* untuk skrip DevOps yang ada di `scripts/`.

| Perintah | Deskripsi | Wrapper untuk |
| :--- | :--- | :--- |
| `wk doctor` | Menjalankan pemeriksaan kesehatan lingkungan pengembangan. | `scripts/doctor.sh` |
| `wk version` | Menampilkan informasi versi lengkap proyek dan dependensinya. | `scripts/version.sh` |
| `wk backup` | Membuat cadangan proyek sebelum melakukan perubahan besar. | `scripts/backup.sh` |
| `wk restore` | Memulihkan proyek dari cadangan yang ada. | `scripts/restore.sh` |
| `wk deploy` | Menjalankan proses deployment ke lingkungan yang ditentukan. | `scripts/deploy.sh` |
| `wk release` | **Perintah utama rilis.** Mengorkestrasi seluruh alur rilis. | `scripts/release.sh` |
| `wk smoke` | Menjalankan *smoke test* pasca-deployment. | `scripts/smoketest.sh` |

### 5.2. Scaffolding (`create`) Commands

Perintah-perintah ini menggunakan templat untuk menghasilkan kerangka kode secara otomatis.

| Perintah | Deskripsi |
| :--- | :--- |
| `wk create module <ModuleName>` | Perintah paling komprehensif. Membuat struktur direktori dan semua file standar untuk sebuah modul baru. |
| `wk create repository <ModuleName>`| Membuat file `Repository.js` dengan kerangka CRUD di dalam modul yang ada. |
| `wk create service <ModuleName>` | Membuat file `Service.js` dengan kerangka kelas di dalam modul yang ada. |
| `wk create controller <ModuleName>`| Membuat file `Controller.js` dengan kerangka kelas di dalam modul yang ada. |
| `wk create dashboard <ModuleName>`| Membuat file `Dashboard.js` dengan contoh definisi widget. |
| `wk create rule <ModuleName> <RuleName>`| Menambahkan kerangka aturan baru ke file konfigurasi `rules.json`. |
| `wk create menu <ModuleName>` | Membuat file `Menu.js` dengan contoh definisi item menu. |
| `wk create permission <ModuleName>`| Membuat file `Permission.js` dengan contoh definisi hak akses. |
| `wk create migration <Description>`| Membuat file migrasi baru dengan timestamp di direktori `migrations/`. |
| `wk create seeder <TableName>` | Membuat file *seeder* baru untuk mengisi data awal. |
| `wk create test <ModuleName>` | Membuat file `Test.js` dengan kerangka pengujian unit untuk Service. |
| `wk create docs <ModuleName>` | Membuat atau memperbarui file `README.md` di dalam direktori modul. |

### 5.3. Utility Commands

| Perintah | Deskripsi |
| :--- | :--- |
| `wk build` | Menyiapkan proyek untuk deployment. Pada v1.0, ini mungkin hanya menjalankan `wk validate`. Di masa depan, bisa mencakup kompilasi atau minifikasi. |
| `wk clean` | Menghapus file-file sementara, log (kecuali yang penting), dan arsip cadangan lama untuk membersihkan ruang kerja. |
| `wk validate` | Menjalankan serangkaian validasi pada proyek, seperti memeriksa struktur modul, validitas `module.json`, dan dependensi. |
| `wk report` | Menghasilkan laporan proyek, seperti laporan cakupan tes (*test coverage*) atau laporan kualitas kode. |

---

## 6. Command Workflow

### 6.1. Workflow `wk release`

Perintah ini adalah contoh orkestrasi. Ia tidak memiliki logika sendiri, melainkan hanya mengeksekusi skrip `release.sh` yang sudah teruji.

```ascii
`wk release`
      |
      v
+----------------+
|    WK CLI      |
+----------------+
      |
      v
Executes `bash scripts/release.sh`
      |
      v
+----------------+
|  release.sh    |
+----------------+
      |
      v
Runs doctor -> version -> backup -> deploy -> smoke
      |
      v
  [Output]
```

### 6.2. Workflow `wk create module <ModuleName>`

Perintah ini adalah contoh generator. Ia membaca templat dan membuat banyak file.

```ascii
`wk create module citizen`
      |
      v
+----------------+
|    WK CLI      |
+----------------+
      |
      v
1. Create directory `src/citizen/`
2. Read `module.json.tpl`
3. Replace `{{ModuleName}}` with `citizen`
4. Write `src/citizen/module.json`
5. Read `Service.js.tpl`
6. Replace `{{ModuleName}}` with `Citizen`
7. Write `src/citizen/Service.js`
8. ... (repeat for all standard files)
      |
      v
  [Output: "Module 'citizen' created successfully."]
```

---

## 7. Coding Workflow Example

Contoh alur kerja developer menggunakan WK CLI untuk membuat modul `UMKM`.

1.  **Buat Modul:**
    ```bash
    wk create module umkm
    ```
    *(Hasil: Direktori `src/umkm/` dan semua file dasarnya tercipta)*

2.  **Definisikan Model & Repository:**
    Developer membuka `src/umkm/Repository.js` dan mengimplementasikan metode `findByOwnerId`, `searchByName`, dll.

3.  **Implementasikan Logika Bisnis:**
    Developer membuka `src/umkm/Service.js` dan menulis logika untuk `registerUMKM`, `updateBusinessData`, dll.

4.  **Buat Unit Test:**
    ```bash
    wk create test umkm
    ```
    Developer membuka `src/umkm/Test.js` dan menulis tes untuk `registerUMKM`.

5.  **Buat Hak Akses:**
    ```bash
    wk create permission umkm
    ```
    Developer mendefinisikan izin seperti `umkm.create`, `umkm.view.own`.

6.  **Validasi Proyek:**
    ```bash
    wk validate
    ```
    *(Hasil: Memastikan semua file baru sesuai standar)*

7.  **Commit & Push:**
    ```bash
    git add .
    git commit -m "feat(umkm): add initial umkm module"
    git push
    ```

---

## 8. Folder Structure

Struktur direktori untuk perkakas WK CLI itu sendiri, yang akan berada di dalam repositori utama.

```ascii
wk-community-os/
├── ... (project folders)
└── tools/
    └── wk-cli/
        ├── bin/
        │   └── wk              (File eksekusi utama, symlinked globally)
        ├── src/
        │   ├── commands/
        │   │   ├── create/
        │   │   │   ├── module.js
        │   │   │   └── service.js
        │   │   ├── devops/
        │   │   │   ├── release.js
        │   │   │   └── backup.js
        │   │   └── utility/
        │   │       └── validate.js
        │   │
        │   └── templates/
        │       ├── Controller.js.tpl
        │       ├── Repository.js.tpl
        │       ├── Service.js.tpl
        │       └── module.json.tpl
        │
        └── package.json
```

---

## 9. Future CLI Roadmap

| Versi | Fokus | Fitur Utama |
| :--- | :--- | :--- |
| **v1.0** | **Scaffolding & DevOps Wrapper** | Seluruh perintah `create:*` dan `wk <devops_command>`. |
| **v1.5** | **Code Quality & Testing** | - `wk lint`: Menjalankan ESLint pada seluruh proyek.<br>- `wk format`: Menjalankan Prettier untuk memformat kode.<br>- `wk test`: Menjalankan semua file `Test.js` di semua modul. |
| **v2.0** | **Interactive Mode** | - `wk new`: Mode interaktif yang memandu developer membuat modul atau komponen lain langkah demi langkah. |
| **v2.5** | **Refactoring & Maintenance** | - `wk refactor:rename <ModuleName> <NewName>`: Mengganti nama modul secara aman di semua file.<br>- `wk module:disable <ModuleName>`: Mengubah `enabled: false` di `module.json`. |
| **v3.0** | **AI Integration** | - `wk create test --ai <ModuleName>`: AI mencoba menulis kerangka tes dasar berdasarkan kode Service.<br>- `wk create docs --ai <ModuleName>`: AI mencoba menghasilkan dokumentasi `README.md` awal. |