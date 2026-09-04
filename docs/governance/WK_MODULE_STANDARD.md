**WK COMMUNITY OS ENTERPRISE EDITION**

**STANDAR PENGEMBANGAN MODUL**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-005` |
| **Nama Dokumen** | Standar Pengembangan Modul |
| **Versi** | 1.0 |
| **Status** | `BASELINE` |
| **Pemilik** | Chief Software Architect |
| **Peninjau** | Lead Developer, DevOps Engineer |
| **Persetujuan** | Steering Committee |

---

## 2. Executive Summary

Dokumen ini menetapkan standar resmi untuk desain, pengembangan, dan pemeliharaan semua modul dalam ekosistem WK Community OS. Tujuannya adalah untuk memastikan bahwa setiap modul, baik yang dikembangkan oleh tim inti maupun oleh kontributor di masa depan, memiliki tingkat kualitas, konsistensi, dan interoperabilitas yang seragam.

Dengan mengadopsi filosofi "Everything is a Module", kami menciptakan arsitektur yang sangat fleksibel, skabel, dan mudah dipelihara. Standar ini mencakup siklus hidup modul, struktur direktori, konvensi penamaan, aturan dependensi, hingga daftar periksa kesiapan produksi. Kepatuhan terhadap standar ini bersifat wajib dan merupakan kunci untuk keberhasilan jangka panjang platform WK Community OS.

---

## 3. Module Philosophy

Filosofi inti dari arsitektur WK Community OS adalah **"Everything is a Module"** (Semuanya adalah Modul).

Ini berarti setiap unit fungsionalitas, tidak peduli seberapa besar atau kecil, harus diperlakukan sebagai sebuah paket yang mandiri, dapat dipasang (*pluggable*), dan dapat dikelola secara independen. Mulai dari fungsionalitas inti seperti `Citizen` (Manajemen Warga) hingga fitur pendukung seperti `PDFGenerator`, semuanya adalah modul.

**Prinsip di balik filosofi ini:**
- **Enkapsulasi:** Setiap modul bertanggung jawab atas domain bisnisnya sendiri dan menyembunyikan kompleksitas internalnya.
- **Interoperabilitas:** Modul berinteraksi satu sama lain melalui antarmuka (API) dan *event* yang terdefinisi dengan baik, bukan melalui akses langsung ke implementasi internal.
- **Fleksibilitas:** Fungsionalitas dapat dengan mudah ditambah, diperbarui, dinonaktifkan, atau bahkan diganti dengan implementasi lain tanpa mengganggu keseluruhan sistem.
- **Skalabilitas Tim:** Tim yang berbeda dapat bekerja pada modul yang berbeda secara paralel dengan minimalisir konflik.

---

## 4. Module Life Cycle

Setiap modul dalam WK Community OS akan melewati siklus hidup yang terdefinisi dengan jelas, dari konsepsi hingga penghentian.

```ascii
  [1. Planning] -> [2. Blueprint] -> [3. Architecture] -> [4. Development] -> [5. Testing]
        ^                                                                         |
        |                                                                         v
  [10. Retirement] <- [9. Maintenance] <- [8. Production] <- [7. Demo] <- [6. Documentation]
```

| Tahap | Deskripsi | Output Utama |
| :--- | :--- | :--- |
| **1. Planning** | Analisis kebutuhan bisnis dan definisi ruang lingkup modul. | Dokumen Kebutuhan Produk (PRD). |
| **2. Blueprint** | Pembuatan *mockup* atau *wireframe* antarmuka pengguna. | Desain UI/UX. |
| **3. Architecture**| Desain model data, API, dan interaksi dengan modul lain. | Dokumen Desain Teknis. |
| **4. Development** | Penulisan kode sesuai dengan standar yang ditetapkan. | Kode sumber modul. |
| **5. Testing** | Pengujian unit, integrasi, dan fungsional. | Laporan Hasil Pengujian. |
| **6. Documentation**| Penulisan dokumentasi teknis dan pengguna. | `README.md`, panduan pengguna. |
| **7. Demo** | Demonstrasi fungsionalitas kepada pemangku kepentingan. | Umpan balik dan persetujuan. |
| **8. Production** | Deployment modul ke lingkungan produksi. | Modul aktif di sistem. |
| **9. Maintenance** | Perbaikan bug dan pembaruan minor. | *Patch release*. |
| **10. Retirement**| Proses penonaktifan dan pengarsipan modul jika sudah tidak relevan. | Modul dinonaktifkan. |

---

## 5. Standard Module Structure

Semua modul HARUS mengikuti struktur direktori standar untuk memastikan konsistensi dan kemudahan navigasi.

```ascii
src/
├── citizen/
│   ├── Controller.js
│   ├── Dashboard.js
│   ├── Menu.js
│   ├── Migration.js
│   ├── module.json
│   ├── Permission.js
│   ├── README.md
│   ├── Repository.js
│   ├── Seeder.js
│   ├── Service.js
│   └── Test.js
│
├── family/
│   └── (struktur file yang sama...)
│
├── education/
│   └── (struktur file yang sama...)
│
└── (dan modul-modul lainnya...)
```

---

## 6. Standard Files

Setiap modul harus berisi file-file standar berikut, meskipun beberapa di antaranya mungkin kosong jika tidak relevan.

| Nama File | Deskripsi | Wajib? |
| :--- | :--- | :--- |
| **`module.json`** | **Manifest File.** Mendefinisikan metadata dan konfigurasi modul. | **Ya** |
| **`Repository.js`** | Bertanggung jawab atas semua logika akses data (CRUD). | **Ya** |
| **`Service.js`** | Berisi semua logika bisnis, aturan, dan orkestrasi. | **Ya** |
| **`Controller.js`** | Menangani permintaan masuk dan memanggil *Service*. | **Ya** |
| **`Permission.js`**| Mendefinisikan hak akses spesifik untuk modul ini. | Ya |
| **`Dashboard.js`** | Mendefinisikan *widget* dasbor yang disediakan oleh modul. | Tidak |
| **`Menu.js`** | Mendefinisikan item menu yang ditambahkan oleh modul ke sidebar atau navigasi. | Tidak |
| **`README.md`** | Dokumentasi teknis dan fungsional dari modul. | **Ya** |
| **`Test.js`** | Berisi skrip pengujian unit dan integrasi untuk modul. | **Ya** |
| **`Migration.js`** | Skrip untuk migrasi skema data (misalnya, menambah kolom baru di Google Sheets). | Tidak |
| **`Seeder.js`** | Skrip untuk mengisi data awal (*seed data*) yang dibutuhkan oleh modul. | Tidak |

---

## 7. `module.json` Standard

File `module.json` adalah jantung dari setiap modul. File ini dibaca oleh `ModuleLoader` saat sistem dimulai.

| Field | Tipe | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| **`id`** | String | ID unik modul, harus sama dengan nama folder. Harus `lower-case`. | `"citizen"` |
| **`name`** | String | Nama modul yang mudah dibaca. | `"Manajemen Warga"` |
| **`version`** | String | Versi modul, mengikuti SemVer (e.g., `1.0.0`). | `"1.0.0"` |
| **`author`** | String | Nama pengembang atau tim. | `"WK Core Team"` |
| **`enabled`** | Boolean | Status aktif atau tidaknya modul. `false` akan membuat modul tidak dimuat. | `true` |
| **`dependencies`**| Array | Daftar `id` modul lain yang dibutuhkan oleh modul ini. | `["family", "auth"]` |
| **`permissions`**| Array | Daftar kode izin yang didefinisikan dalam `Permission.js`. | `["citizen.view", "citizen.create"]` |
| **`menus`** | Array | Daftar objek menu yang didefinisikan dalam `Menu.js`. | `[{"label": "Warga", "icon": "users", ...}]` |
| **`dashboard`** | Array | Daftar objek *widget* dasbor dari `Dashboard.js`. | `[{"title": "Jumlah Warga", "type": "scorecard", ...}]` |
| **`events`** | Object | Mendefinisikan *event listener*. Modul dapat "mendengarkan" *event* dari modul lain. | `{"family.created": "onFamilyCreated"}` |
| **`routes`** | Array | Mendefinisikan rute API atau halaman yang diekspos oleh `Controller.js`. | `[{"path": "/citizen/all", "method": "GET", ...}]` |

---

## 8. Naming Convention

Untuk menjaga konsistensi, semua nama file dan kelas harus mengikuti konvensi berikut.

| Tipe Komponen | Konvensi Penamaan | Contoh |
| :--- | :--- | :--- |
| **Repository** | `[ModuleName]Repository` | `CitizenRepository` |
| **Service** | `[ModuleName]Service` | `CitizenService` |
| **Controller** | `[ModuleName]Controller` | `CitizenController` |
| **Dashboard** | `[ModuleName]Dashboard` | `CitizenDashboard` |
| **Permission** | `[ModuleName]Permission` | `CitizenPermission` |
| **Menu** | `[ModuleName]Menu` | `CitizenMenu` |

---

## 9. Dependency Rules

Aturan ketergantungan antar lapisan bersifat **ketat** dan **wajib** dipatuhi untuk menjaga *Clean Architecture*.

1.  **Aliran Searah:** Aliran panggilan harus selalu searah: `Controller` -> `Service` -> `Repository`.
2.  **Tidak Boleh Melompat:** `Controller` **TIDAK BOLEH** memanggil `Repository` secara langsung.
3.  **Repository Terisolasi:** `Repository` **TIDAK BOLEH** memanggil `Service` atau `Controller`. Tugasnya hanya berinteraksi dengan database.
4.  **Service sebagai Pusat Logika:** Semua logika bisnis harus berada di dalam `Service`. `Controller` hanya sebagai penerus permintaan, `Repository` hanya sebagai pengakses data.
5.  **Tidak Ada Dependensi Sirkular:** Modul A tidak boleh bergantung pada Modul B jika Modul B sudah bergantung pada Modul A.

```ascii
   [Controller]
        |
        v
     [Service]
        |
        v
    [Repository]
        |
        v
     [Database]
```

---

## 10. Module Registration

Sistem memiliki komponen inti bernama **`ModuleLoader`**. Saat aplikasi pertama kali dijalankan, `ModuleLoader` bertanggung jawab untuk:
1.  Memindai seluruh direktori di dalam `src/`.
2.  Membaca file `module.json` dari setiap direktori yang ditemukan.
3.  Memvalidasi `module.json` dan dependensinya.
4.  Jika modul berstatus `enabled` dan semua dependensinya terpenuhi, `ModuleLoader` akan "mendaftarkan" modul tersebut ke dalam sebuah *registry* pusat.
5.  Pendaftaran ini meliputi: menambahkan rute ke `Router`, menu ke `NavigationManager`, izin ke `SecurityManager`, dan *event listener* ke `EventManager`.

Proses ini memastikan bahwa penambahan atau penonaktifan modul dapat dilakukan hanya dengan mengubah konfigurasi `module.json`, tanpa menyentuh kode inti sistem.

---

## 11. Module Loading Flow

```ascii
[System Start]
      |
      v
+---------------------+
|    ModuleLoader     |
+---------------------+
      |
      v
Scan `src/*` for `module.json`
      |
      | For each module.json found:
      |
      +-----> [Read module.json]
                  |
                  v
              Is `enabled`? --(No)--> [Skip]
                  |
                  v (Yes)
              Check Dependencies --(Fail)--> [Log Error & Skip]
                  |
                  v (Pass)
              [Register Module to System]
                  |
      +-----------+-----------+-----------+
      |           |           |           |
      v           v           v           v
  [Router]   [Navigation]  [Security]  [EventManager]
  (Add Routes) (Add Menus)  (Add Perms) (Add Listeners)
```

---

## 12. Versioning

Setiap modul harus memiliki versinya sendiri di dalam `module.json` dan wajib mengikuti standar **Semantic Versioning (SemVer) 2.0.0**.

Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.5`)
- **MAJOR:** Untuk perubahan yang tidak kompatibel (*breaking changes*).
- **MINOR:** Untuk penambahan fungsionalitas baru yang tetap kompatibel.
- **PATCH:** Untuk perbaikan bug yang tetap kompatibel.

---

## 13. Coding Standard

- Semua kode harus ditulis dalam gaya JavaScript modern (ES6+).
- Gunakan JSDoc untuk mendokumentasikan semua fungsi, parameter, dan nilai kembalian.
- Ikuti panduan gaya (misalnya, ESLint) yang telah dikonfigurasi untuk proyek.
- Hindari penggunaan variabel global. Gunakan *dependency injection* melalui *service container*.

---

## 14. Testing Standard

- Setiap modul wajib memiliki file `Test.js`.
- *Code coverage* untuk logika bisnis di dalam `Service.js` harus mencapai minimal 80%.
- Pengujian harus mencakup *happy path* (skenario sukses) dan *unhappy path* (skenario gagal).
- Gunakan `MockDriver` atau *mocking library* untuk mengisolasi `Repository` saat menguji `Service`.

---

## 15. Documentation Standard

- Setiap modul wajib memiliki file `README.md`.
- `README.md` harus menjelaskan:
    - Tujuan dan fungsionalitas modul.
    - Cara konfigurasi (jika ada).
    - Daftar *event* yang dipancarkan (*emitted*) dan didengarkan (*listened*).
    - Contoh penggunaan API atau fungsi utama.

---

## 16. Checklist Module Ready

Sebelum sebuah modul dapat dianggap siap untuk produksi (dan di-*merge* ke *main branch*), ia harus memenuhi seluruh item dalam daftar periksa berikut.

| Kategori | Item | Status (Y/N) |
| :--- | :--- | :--- |
| **Struktur & Konfigurasi** | | |
| | Struktur folder sesuai standar. | |
| | Semua file standar yang wajib ada telah dibuat. | |
| | `module.json` telah diisi dengan lengkap dan benar. | |
| | Konvensi penamaan diikuti dengan ketat. | |
| **Kode & Arsitektur** | | |
| | Aturan dependensi (`Controller` -> `Service` -> `Repository`) dipatuhi. | |
| | Tidak ada logika bisnis di dalam `Controller` atau `Repository`. | |
| | Kode telah diformat sesuai standar (ESLint pass). | |
| | Tidak ada informasi sensitif (*hardcoded credentials*) di dalam kode. | |
| **Pengujian** | | |
| | Unit test untuk `Service.js` telah dibuat. | |
| | *Code coverage* mencapai target minimal 80%. | |
| | Semua tes berhasil dijalankan (pass). | |
| **Dokumentasi** | | |
| | `README.md` telah diisi dengan lengkap. | |
| | Semua fungsi publik telah dilengkapi dengan JSDoc. | |
| **Fungsional** | | |
| | Modul telah didemokan dan disetujui oleh Product Owner. | |
| | Hak akses (`Permission.js`) telah diimplementasikan dan diuji. | |
| | Menu (`Menu.js`) dan Rute (`module.json`) berfungsi seperti yang diharapkan. | |