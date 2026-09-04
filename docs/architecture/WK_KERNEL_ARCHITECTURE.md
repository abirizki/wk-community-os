**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU ARSITEKTUR KERNEL**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-029` |
| **Nama Dokumen** | Cetak Biru Arsitektur Kernel |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Lead Framework Engineer, Enterprise Software Architect |
| **Peninjau** | Chief Software Architect |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini merinci arsitektur **Kernel WK Framework**, komponen inti yang menjadi jantung dan otak dari seluruh platform WK Community OS. Kernel bertanggung jawab atas proses fundamental *bootstrapping* aplikasi, mengelola siklus hidup permintaan, dan menyediakan layanan-layanan inti melalui mekanisme *Service Container* dan *Dependency Injection*.

Tujuan utama dari desain Kernel ini adalah untuk menciptakan fondasi yang stabil, minimal, dan sangat dapat diperluas (*extensible*). Dengan memisahkan "inti" dari "fitur", Kernel memastikan bahwa semua fungsionalitas utama seperti *Event Dispatching*, *Module Loading*, dan manajemen konfigurasi diorkestrasi secara elegan dan efisien. Cetak biru ini akan menjadi panduan utama bagi para arsitek dan pengembang senior dalam memahami, memelihara, dan mengembangkan fondasi dari WK Framework.

## 3. Kernel Philosophy

Filosofi desain Kernel didasarkan pada dua prinsip utama:

1.  **Stable Core, Extensible Periphery (Inti Stabil, Periferal Dapat Diperluas):**
    Kernel itu sendiri dibuat sekecil dan sestabil mungkin. Ia hanya berisi logika yang mutlak diperlukan untuk memulai aplikasi dan memuat komponen lain. Semua fungsionalitas tambahan, bahkan yang inti sekalipun (seperti Logger atau Database), dimuat sebagai **Service Provider** atau **Module**. Ini memastikan bahwa inti framework jarang berubah, sehingga mengurangi risiko regresi, sementara fungsionalitas baru dapat ditambahkan dengan aman di "pinggiran".

2.  **Inversion of Control (IoC) / Dependency Injection (DI):**
    Kernel bertanggung jawab untuk "merakit" aplikasi. Komponen (seperti `CitizenService`) tidak membuat dependensinya sendiri (seperti `CitizenRepository`). Sebaliknya, komponen tersebut hanya mendeklarasikan apa yang dibutuhkannya, dan **Container** Kernel akan secara otomatis menyediakan (menginjeksikan) dependensi tersebut saat komponen dibuat. Ini menghasilkan kode yang sangat *decoupled* dan mudah diuji.

## 4. Boot Process

Proses *booting* adalah urutan langkah yang dijalankan Kernel dari awal hingga aplikasi siap menangani permintaan.

```ascii
      (*)
       |
       v
[1. Entry Point (doGet/doPost)]
       |
       v
[2. Instantiate Kernel]
       |
       v
[3. Kernel registers Core Service Providers]
|  (Config, Logger, Event, Database, etc.)
       |
       v
[4. Kernel boots all Service Providers]
|  (Providers register their services into the Container)
       |
       v
[5. Kernel executes ModuleLoader]
       |
       v
[6. ModuleLoader scans `src/` and registers all Module components]
|  (Controllers, Services, Repositories are bound to the Container)
       |
       v
[7. Kernel dispatches the incoming request to the Router]
       |
       v
[Application is Ready]
```

## 5. Application Lifecycle (Request Lifecycle)

Setelah proses *booting* selesai, setiap permintaan yang masuk akan melewati siklus hidup berikut:

1.  **Routing:** `Router` menerima permintaan dan mencocokkannya dengan rute yang telah didaftarkan oleh modul-modul.
2.  **Middleware (Future):** Permintaan melewati serangkaian *middleware* (e.g., untuk otentikasi, logging).
3.  **Controller Execution:** Kernel mengambil *instance* `Controller` yang sesuai dari *Container* (dengan semua dependensinya sudah diinjeksikan) dan memanggil metode yang relevan.
4.  **Service Logic:** `Controller` memanggil `Service` untuk menjalankan logika bisnis.
5.  **Event Publishing:** `Service` mempublikasikan *event* ke `EventDispatcher`.
6.  **Response Generation:** `Controller` menerima hasil dari `Service` dan memformatnya menjadi respons (HTML/JSON).
7.  **Response Sent:** Respons dikirim kembali ke klien.
8.  **Termination:** Kernel melakukan tugas-tugas akhir, seperti menulis log atau menutup koneksi.

## 6. Container (IoC Container)

- **Tujuan:** Sebagai "pabrik" dan "registri" pusat untuk semua objek dan layanan dalam aplikasi.
- **Fungsi:**
    - **Binding:** Memetakan sebuah "kunci" (e.g., `'service.citizen'`) ke sebuah kelas atau pabrik (`CitizenService`).
    - **Resolving:** Ketika ada permintaan untuk sebuah kunci (e.g., `WK.service('citizen')`), *Container* akan membuat (*instantiate*) objeknya.
    - **Dependency Injection:** Saat membuat objek, *Container* secara otomatis memeriksa dependensi di *constructor*-nya, membuat dependensi tersebut terlebih dahulu, lalu menginjeksikannya.
    - **Singleton Management:** Memastikan bahwa untuk satu kunci, hanya ada satu *instance* objek yang dibuat selama siklus hidup aplikasi.

## 7. Service Provider

- **Tujuan:** Untuk mengenkapsulasi logika pendaftaran layanan inti ke dalam Kernel.
- **Struktur:** Setiap *Service Provider* adalah sebuah kelas yang memiliki dua metode utama:
    - `register()`: Dipanggil selama fase registrasi. Di sinilah *provider* "mengikat" layanannya ke dalam *Container*. Metode ini tidak boleh mengakses layanan lain.
    - `boot()`: Dipanggil setelah semua *provider* selesai diregistrasi. Di sinilah *provider* dapat melakukan pekerjaan yang memerlukan layanan lain (e.g., `EventServiceProvider` mendaftarkan *listener* ke `EventDispatcher`).

**Contoh:**
```javascript
class LoggingServiceProvider {
  register(container) {
    container.singleton('logger', () => new LoggerService());
  }

  boot(container) {
    // Tidak ada yang perlu dilakukan saat boot untuk logger
  }
}
```

## 8. Module Loader

- **Tujuan:** Mengotomatiskan proses penemuan dan pendaftaran semua modul aplikasi.
- **Proses:**
    1.  Dipanggil oleh Kernel setelah semua *Core Service Provider* di-*boot*.
    2.  Memindai semua sub-direktori di dalam `src/`.
    3.  Di setiap direktori, ia mencari dan mengeksekusi file `*.module.gs` (nama tentatif).
    4.  File modul tersebut akan memanggil `WK.module(...)`, yang pada gilirannya akan mendaftarkan semua komponen modul (Controller, Service, Repository, dll.) ke dalam *Container*.

## 9. Event Dispatcher

- **Tujuan:** Mengelola mekanisme *publish-subscribe* untuk komunikasi asinkron antar modul.
- **Komponen:**
    - **`EventManager` (Facade):** Antarmuka publik (`WK.event()`) yang digunakan modul untuk mempublikasikan *event*.
    - **`EventDispatcher` (Core):** Logika inti yang menerima *event* dan meneruskannya ke semua *listener* yang terdaftar.
    - **`ListenerRegistry`:** Sebuah registri yang memetakan nama *event* ke daftar kelas *listener*-nya.

## 10. Rule Dispatcher

- **Tujuan:** Menjadi jembatan antara `EventDispatcher` dan `RuleEngine`.
- **Mekanisme:**
    1.  `RuleDispatcher` adalah sebuah *listener* khusus yang berlangganan pada semua atau sebagian besar *event*.
    2.  Ketika sebuah *event* diterima, `RuleDispatcher` akan memanggil `RuleEngine` untuk mengevaluasi apakah ada aturan yang cocok dengan *event* tersebut.
    3.  Jika ada aturan yang cocok dan kondisinya terpenuhi, `RuleEngine` akan menjalankan aksinya (yang mungkin akan mempublikasikan *event* baru).

## 11. Dashboard Dispatcher

- **Tujuan:** Mengagregasi semua definisi *widget* dasbor dari berbagai modul.
- **Mekanisme:**
    1.  Setiap modul mendaftarkan definisi *widget*-nya melalui `WK.dashboard(...)`.
    2.  Definisi ini disimpan dalam sebuah `DashboardRegistry` di dalam Kernel.
    3.  Ketika halaman dasbor dimuat, `DashboardController` akan meminta semua *widget* dari `DashboardRegistry`, mengambil data dari `dataSource` yang sesuai, dan mengirimkannya ke UI.

## 12. Config Manager

- **Tujuan:** Menyediakan akses terpadu ke semua variabel konfigurasi.
- **Sumber Konfigurasi:**
    - File konfigurasi utama (e.g., `config.json`).
    - Properti skrip (untuk *environment variables*).
    - `module.json` dari setiap modul.
- **API:** Menyediakan API sederhana seperti `Config.get('app.name')` atau `Config.get('module.citizen.version')`.

## 13. Version Manager

- **Tujuan:** Melacak versi framework dan setiap modul.
- **Mekanisme:** Saat `ModuleLoader` memproses `module.json`, ia juga mendaftarkan `id` dan `version` modul ke `VersionManager`.
- **API:** Menyediakan API seperti `Version.get('framework')` dan `Version.get('module.citizen')`. Ini berguna untuk pemeriksaan dependensi dan diagnostik.

## 14. Dependency Injection

DI adalah hasil akhir dari penggunaan *Container* dan *Service Provider*.

**Alur Kerja DI:**
1.  `CitizenServiceProvider` mendaftarkan `CitizenRepository` dan `CitizenService` ke *Container*.
2.  Developer menulis `class CitizenService { constructor(citizenRepository) { ... } }`. Perhatikan bahwa `citizenRepository` hanya dideklarasikan, tidak dibuat.
3.  Ketika `Router` membutuhkan `CitizenController`, ia meminta ke *Container*.
4.  *Container* melihat `CitizenController` butuh `CitizenService`.
5.  *Container* melihat `CitizenService` butuh `CitizenRepository`.
6.  *Container* membuat *instance* `CitizenRepository` (karena belum ada).
7.  *Container* membuat *instance* `CitizenService` dan **menginjeksikan** *instance* `CitizenRepository` ke dalam *constructor*-nya.
8.  *Container* membuat *instance* `CitizenController` dan **menginjeksikan** *instance* `CitizenService` ke dalamnya.
9.  *Container* mengembalikan *instance* `CitizenController` yang sudah siap pakai.

## 15. Future Plugin System

Arsitektur Kernel yang berbasis *Service Provider* dan *Module Loader* secara alami mendukung sistem plugin di masa depan.
- **Definisi Plugin:** Sebuah plugin pada dasarnya adalah sebuah "modul super" yang dapat berisi:
    - Komponen standar (Controller, Service, dll.).
    - *Service Provider*-nya sendiri untuk mendaftarkan layanan baru ke Kernel.
    - Aset statis (CSS, JS).
- **Mekanisme:** Plugin akan memiliki file manifest-nya sendiri (e.g., `plugin.json`) dan akan dimuat oleh `PluginLoader` (mirip `ModuleLoader`) setelah semua modul inti dimuat.

## 16. Sequence Diagram (Boot Process)

```ascii
 :doGet()        :Kernel          :Container       :ModuleLoader    :Router
    |                |                |                |                |
    | new Kernel()   |                |                |                |
    |--------------->|                |                |                |
    |                | registerProviders()|             |                |
    |                |---------------->| (binds services) |                |
    |                |                |                |                |
    |                | bootProviders()|                |                |
    |                |---------------->|                |                |
    |                |                |                |                |
    |                | loadModules()  |                |                |
    |                |--------------->|---------------->|                |
    |                |                |                | scan() & register()|
    |                |                |                |--------------->|
    |                |                |                |                |
    |                | dispatch(req)  |                |                |
    |                |-------------------------------------------------->|
    |                |                |                |                |
```

## 17. Activity Diagram (Request Handling)

```ascii
      (*)
       |
       v
  [Request Received by Router]
       |
       v
  [Match Route to Controller/Method]
       |
       v
<Kernel>
[Resolve Controller from Container]
       |
       v
[Inject Dependencies (Service, etc.)]
       |
       v
[Execute Controller Method]
       |
       v
<Controller>
[Call Service Method]
       |
       v
<Service>
[Execute Business Logic]
       |
       v
[Publish Event(s)]
       |
       v
[Return Result to Controller]
       |
       v
<Controller>
[Format HTTP Response]
       |
       v
  [Send Response to Client]
       |
       v
      (X)
```