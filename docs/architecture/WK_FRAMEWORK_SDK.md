**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU WK FRAMEWORK SDK**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-025` |
| **Nama Dokumen** | Cetak Biru WK Framework SDK |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Lead Framework Engineer |
| **Peninjau** | Chief Software Architect, Enterprise Software Architect |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **WK Framework Software Development Kit (SDK)**. SDK ini adalah satu-satunya antarmuka publik yang terekspos dari WK Framework, yang dirancang untuk digunakan oleh para pengembang modul dalam ekosistem WK Community OS. SDK ini menyediakan serangkaian API yang terpadu, sederhana, dan kuat melalui sebuah *global namespace* `WK`.

Tujuan utama dari SDK ini adalah untuk menyembunyikan kompleksitas internal framework, menyediakan cara yang konsisten untuk berinteraksi dengan layanan inti (seperti *Service Container*, *Logger*, *Cache*), dan memberlakukan praktik pengembangan terbaik secara implisit. Dengan menggunakan SDK ini, developer dapat membangun modul dengan lebih cepat, dengan kode yang lebih bersih, dan dengan jaminan kompatibilitas di masa depan, karena mereka berinteraksi dengan API yang stabil, bukan dengan implementasi internal yang mungkin berubah.

## 3. SDK Philosophy

Filosofi di balik WK Framework SDK adalah **"Developer-First Abstraction"**.

Ini berarti prioritas utama kami adalah pengalaman pengembang (*Developer Experience*). Kami percaya bahwa developer harus dapat fokus pada penyelesaian masalah bisnis, bukan pada seluk-beluk cara kerja framework.

**Prinsip Kunci:**
- **Simplicity (Kesederhanaan):** API harus intuitif dan mudah digunakan. `WK.logger().info('Hello')` lebih baik daripada `new LoggerService(config).getInstance().info('Hello')`.
- **Consistency (Konsistensi):** Cara mengakses layanan yang berbeda harus terasa seragam. Semua layanan inti diakses melalui namespace `WK`.
- **Stability (Kestabilan):** API SDK adalah sebuah kontrak. Kami menjamin bahwa metode-metode dalam SDK akan tetap stabil dan kompatibel ke belakang dalam satu rilis mayor, meskipun implementasi internalnya kami perbaiki.
- **Discoverability (Kemudahan Penemuan):** Dengan API yang terpusat di bawah `WK`, developer dapat dengan mudah menemukan fungsionalitas yang tersedia menggunakan fitur *autocomplete* pada IDE.

## 4. SDK Architecture

SDK berfungsi sebagai sebuah **Facade Pattern** di atas layanan-layanan inti framework. Ini menyediakan satu titik masuk yang menyederhanakan interaksi dengan sistem yang lebih kompleks di baliknya.

```ascii

  +------------------------------------------------+
  |                 Module Developer               |
  | (e.g., working on `CitizenService.gs`)         |
  +------------------------------------------------+
                           |
                           | Uses simple, stable APIs
                           | e.g., WK.service('family').addMember(...)
                           |       WK.logger().info(...)
                           v
  +------------------------------------------------+
  |              WK Framework SDK                  |
  |           (Global `WK` Namespace)              |
  +------------------------------------------------+
                           |
                           | Delegates calls to complex internal services
                           v
  +------------------------------------------------+
  |              Core Framework Services           |
  | (ServiceContainer, ModuleLoader, Logger, etc.) |
  +------------------------------------------------+

```

## 5. Core Namespace

Namespace `WK` adalah objek global yang menyediakan akses ke semua fungsionalitas SDK.

---

### 5.1. Registrasi Modul

| Metode | Deskripsi |
| :--- | :--- |
| `WK.module(id, definition)` | Mendaftarkan sebuah modul ke dalam sistem. Ini adalah titik awal dari setiap modul. |

**Parameter:**
- `id` (String): ID unik modul (e.g., `"citizen"`).
- `definition` (Object): Objek yang berisi semua kelas komponen modul.

**Contoh:**
```javascript
// Di dalam file utama modul citizen
WK.module('citizen', {
  repository: CitizenRepository,
  service: CitizenService,
  controller: CitizenController,
  // ... komponen lainnya
});
```

---

### 5.2. Akses Komponen

| Metode | Deskripsi |
| :--- | :--- |
| `WK.service(moduleId)` | Mengambil instance *singleton* dari kelas Service sebuah modul. |
| `WK.repository(moduleId)` | Mengambil instance *singleton* dari kelas Repository sebuah modul. |
| `WK.controller(moduleId)`| Mengambil instance *singleton* dari kelas Controller sebuah modul. |

**Contoh:**
```javascript
// Di dalam CitizenService, kita perlu memanggil FamilyService
const familyService = WK.service('family');
familyService.addMemberToFamily(kk_id, citizen_id);
```

---

### 5.3. Registrasi Konfigurasi

| Metode | Deskripsi |
| :--- | :--- |
| `WK.dashboard(moduleId, widgets)` | Mendaftarkan *widget* dasbor dari sebuah modul. |
| `WK.rule(moduleId, rules)` | Mendaftarkan aturan bisnis dari sebuah modul. |
| `WK.permission(moduleId, permissions)`| Mendaftarkan hak akses dari sebuah modul. |
| `WK.menu(moduleId, menuItems)` | Mendaftarkan item menu dari sebuah modul. |

**Contoh:**
```javascript
// Di dalam file CitizenDashboard.gs
const widgets = [{ id: 'citizen_count', ... }];
WK.dashboard('citizen', widgets);
```

---

### 5.4. Layanan Inti (Core Services)

| Metode | Deskripsi |
| :--- | :--- |
| `WK.validator()` | Menyediakan akses ke utilitas validasi data umum. |
| `WK.helper()` | Menyediakan akses ke fungsi-fungsi pembantu umum (e.g., format tanggal, string). |
| `WK.cache()` | Menyediakan antarmuka untuk berinteraksi dengan layanan cache (e.g., `get`, `put`, `remove`). |
| `WK.session()` | Menyediakan akses ke informasi sesi pengguna saat ini (e.g., `getUser`, `getRole`). |
| `WK.logger()` | Menyediakan instance logger untuk mencatat pesan (`debug`, `info`, `warn`, `error`). |
| `WK.security()` | Menyediakan metode terkait keamanan (e.g., `checkPermission`, `hasRole`). |
| `WK.query()` | Menyediakan *query builder* untuk membangun kueri database yang kompleks. |
| `WK.database()` | Menyediakan akses langsung ke *database adapter* (penggunaannya harus dibatasi). |

**Contoh:**
```javascript
function someBusinessLogic(data) {
  // Menggunakan Validator
  const validation = WK.validator().validate(data, { email: 'required|email' });
  if (!validation.isValid) {
    throw new Error('Data tidak valid');
  }

  // Menggunakan Logger
  WK.logger().info(`Processing data for user: ${WK.session().getUser().email}`);

  // Menggunakan Cache
  let cachedData = WK.cache().get('some_key');
  if (!cachedData) {
    // ... proses mahal
    WK.cache().put('some_key', result, 600); // Cache selama 10 menit
  }
}
```

## 6. SDK Lifecycle

Siklus hidup SDK terkait erat dengan proses startup aplikasi.

```ascii
      (*)
       |
       v
[Aplikasi Dimulai]
       |
       v
[Framework Menginisialisasi Core Services (Logger, Cache, dll.)]
       |
       v
[Framework Menginisialisasi Global Namespace `WK`]
       |
       v
[Module Loader mengeksekusi semua file modul]
       |
       v
[Setiap modul memanggil `WK.module(...)` untuk mendaftarkan dirinya]
       |
       v
[Framework membangun dependensi dan meng-instantiate semua komponen]
       |
       v
[SDK Siap Digunakan]
       |
       v
      (X)
```

## 7. SDK Coding Standard

- **Gunakan Selalu `WK`:** Semua interaksi dengan layanan framework atau antar-modul **HARUS** dilakukan melalui namespace `WK`.
- **Jangan Meng-cache Instance:** Jangan menyimpan hasil dari `WK.service('module')` ke dalam variabel global atau properti kelas. Panggil `WK.service()` setiap kali Anda membutuhkannya. Framework akan menangani *caching* instance di belakang layar.
    - **Don't:** `this.familyService = WK.service('family');` di dalam *constructor*.
    - **Do:** `const familyService = WK.service('family');` di dalam metode yang membutuhkannya.
- **Hindari `WK.database()`:** Penggunaan `WK.database()` secara langsung dari dalam `Service` atau `Controller` sangat tidak disarankan karena melanggar *Repository Pattern*. Gunakan hanya untuk kasus-kasus yang sangat spesifik dan telah disetujui.

## 8. SDK Naming Convention

| Elemen | Konvensi | Contoh |
| :--- | :--- | :--- |
| **Namespace Utama** | `WK` | `WK` |
| **Metode SDK** | `camelCase` | `WK.service()`, `WK.logger()` |
| **ID Modul** | `lowercase` | `WK.service('citizen')` |
| **ID Komponen** | `PascalCase` | `CitizenService` |

## 9. SDK Extension

Ekstensi adalah cara untuk menambahkan fungsionalitas baru ke dalam namespace `WK` itu sendiri. Proses ini dikontrol secara ketat dan hanya dilakukan oleh tim Framework Engineer.

- **Mekanisme:** Menambahkan metode baru ke objek prototipe `WK`.
- **Tujuan:** Untuk menyediakan layanan inti baru yang bersifat generik dan dapat digunakan oleh semua modul.
- **Contoh:** Jika kita memutuskan untuk menambahkan layanan `PDFGenerator`, tim framework akan membuat `PDFService` dan mengeksposnya melalui `WK.pdf()`.

## 10. SDK Plugin

Plugin adalah cara bagi modul untuk menyediakan fungsionalitas yang dapat digunakan kembali oleh modul lain melalui sebuah mekanisme yang terstandardisasi.

- **Mekanisme:** Sebuah modul dapat mendaftarkan "plugin" melalui `module.json`.
    ```json
    "plugins": {
      "formatter": "RupiahFormatter"
    }
    ```
- **Penggunaan:** Modul lain kemudian dapat memanggil plugin ini melalui SDK.
    ```javascript
    const formattedPrice = WK.plugin('formatter.rupiah').format(10000);
    ```
- **Tujuan:** Memungkinkan ekosistem modul untuk tumbuh secara organik, di mana modul dapat saling berbagi fungsionalitas spesifik tanpa harus menjadi bagian dari inti SDK.

## 11. SDK Future Roadmap

| Versi | Fokus | Fitur Utama |
| :--- | :--- | :--- |
| **v1.0** | **Fondasi** | Menyediakan API dasar untuk registrasi dan akses komponen serta layanan inti. |
| **v1.5** | **Developer Experience** | - Peningkatan *type hinting* (JSDoc) untuk *autocomplete* yang lebih baik di editor Apps Script.<br>- Menambahkan lebih banyak fungsi di `WK.helper()` dan `WK.validator()`. |
| **v2.0** | **Fluent API** | - Memperkenalkan API yang dapat dirangkai (*chainable*). Contoh: `WK.query('citizens').where('age', '>', 17).limit(10).get()`. |
| **v2.5** | **Asynchronous Support**| - Menyediakan utilitas untuk mengelola operasi asinkron dengan lebih mudah, mungkin berbasis *Promise*. |
| **v3.0** | **Plugin & Event Bus** | - Mematangkan sistem Plugin.<br>- Mengekspos `EventManager` melalui `WK.event()`, memungkinkan modul untuk mempublikasikan dan berlangganan *event* secara eksplisit melalui SDK. |