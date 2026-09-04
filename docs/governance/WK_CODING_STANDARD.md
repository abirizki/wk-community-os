**WK COMMUNITY OS ENTERPRISE EDITION**

**STANDAR PENGKODEAN (CODING STANDARD)**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-024` |
| **Nama Dokumen** | Standar Pengkodean (Coding Standard) |
| **Versi** | 1.0.0 |
| **Status** | `BASELINE` |
| **Penulis** | Enterprise Software Architect |
| **Peninjau** | Chief Software Architect, Lead Developer |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini menetapkan standar pengkodean, praktik, dan alur kerja rekayasa perangkat lunak yang wajib diikuti oleh seluruh tim pengembang WK Community OS. Tujuannya adalah untuk memastikan bahwa basis kode (*codebase*) proyek memiliki tingkat kualitas, konsistensi, keterbacaan, dan kemudahan pemeliharaan (*maintainability*) yang tinggi.

Standar ini mencakup berbagai aspek, mulai dari konvensi penamaan, implementasi pola desain arsitektur (Repository, Service, Controller), standar komentar dan logging, hingga alur kerja kolaborasi menggunakan Git dan proses deployment. Kepatuhan terhadap standar ini bukan hanya soal estetika kode, tetapi merupakan fondasi fundamental untuk membangun platform yang skabel, andal, dan dapat terus berkembang di masa depan dengan utang teknis yang minimal.

## 3. Naming Convention

| Elemen | Konvensi | Contoh |
| :--- | :--- | :--- |
| **Variabel** | `camelCase` | `let citizenData;` |
| **Fungsi** | `camelCase` | `function getCitizenById(id) {}` |
| **Kelas** | `PascalCase` | `class CitizenService {}` |
| **Konstanta** | `UPPER_SNAKE_CASE`| `const MAX_RETRY = 3;` |
| **File Modul** | `PascalCase` | `Service.gs`, `Repository.gs` |
| **Folder Modul** | `lowercase` | `src/citizen/`, `src/family/` |

---

## 4. Repository Pattern

Pola ini bertujuan untuk memisahkan logika akses data dari logika bisnis.

- **Tanggung Jawab Tunggal:** Kelas `Repository` hanya bertanggung jawab untuk operasi CRUD (Create, Read, Update, Delete) terhadap satu entitas data.
- **Interaksi dengan Database:** `Repository` berinteraksi dengan database melalui `dbAdapter` yang diinjeksikan melalui *constructor*.
- **Tidak Ada Logika Bisnis:** `Repository` **DILARANG KERAS** berisi logika bisnis, validasi, atau orkestrasi.
- **Metode Generik:** Harus mengimplementasikan metode dasar seperti `findById`, `findAll`, `save`, dan `delete`. Metode kustom (e.g., `findByNik`) diperbolehkan untuk kueri spesifik.

**Contoh Implementasi:**
```javascript
class CitizenRepository {
  constructor(dbAdapter) {
    this.db = dbAdapter.setTable('citizens');
  }

  findById(id) {
    // Hanya memanggil adapter, tidak ada logika lain
    return this.db.findById(id);
  }
}
```

---

## 5. Service Pattern

Pola ini adalah pusat dari semua logika bisnis.

- **Pusat Logika Bisnis:** Semua aturan bisnis, kalkulasi, dan orkestrasi proses harus berada di dalam kelas `Service`.
- **Mengorkestrasi Repository:** `Service` dapat memanggil satu atau lebih `Repository` untuk memenuhi satu kasus penggunaan bisnis.
- **Stateless:** `Service` harus bersifat *stateless*. Ia tidak boleh menyimpan data keadaan (state) di dalam properti kelasnya. Semua data yang dibutuhkan harus diterima melalui parameter metode.
- **Manajemen Transaksi:** `Service` bertanggung jawab untuk memulai dan mengakhiri transaksi database jika diperlukan.
- **Memicu Event:** Setelah sebuah operasi bisnis selesai, `Service` bertanggung jawab untuk mempublikasikan *event* yang relevan (e.g., `EventManager.publish('Citizen.Created', ...)`).

**Contoh Implementasi:**
```javascript
class CitizenService {
  constructor(citizenRepository, familyRepository) {
    this.citizenRepository = citizenRepository;
    this.familyRepository = familyRepository;
  }

  registerNewCitizen(data) {
    // Logika validasi
    if (data.age < 0) throw new Error('Usia tidak valid.');

    // Orkestrasi
    const citizen = this.citizenRepository.save(data);
    this.familyRepository.addMember(data.kk_id, citizen.id);

    // Memicu event
    EventManager.publish('Citizen.Created', { payload: citizen });

    return citizen;
  }
}
```

---

## 6. Controller Pattern

Pola ini berfungsi sebagai lapisan tipis antara antarmuka pengguna (atau API) dan logika bisnis.

- **Penerima Permintaan:** `Controller` adalah titik masuk yang menerima permintaan dari `Router`.
- **Validasi Input Dasar:** Bertanggung jawab untuk validasi input dasar (e.g., memastikan parameter yang dibutuhkan ada). Validasi bisnis yang kompleks tetap di `Service`.
- **Pemeriksaan Hak Akses:** Memanggil `SecurityManager` untuk memeriksa apakah pengguna memiliki izin untuk melakukan aksi tersebut.
- **Memanggil Service:** Meneruskan permintaan yang sudah divalidasi ke metode `Service` yang sesuai.
- **Tidak Ada Logika Bisnis:** `Controller` **DILARANG KERAS** berisi logika bisnis atau memanggil `Repository` secara langsung.
- **Memformat Respons:** Mengemas hasil dari `Service` ke dalam format respons standar (e.g., `{ success: true, data: ... }`).

**Contoh Implementasi:**
```javascript
class CitizenController {
  constructor(citizenService) {
    this.citizenService = citizenService;
  }

  create(request) {
    SecurityManager.checkPermission('citizen.create');

    const data = request.body;
    if (!data || !data.nik) {
      return { success: false, message: 'Data tidak lengkap.' };
    }

    const result = this.citizenService.registerNewCitizen(data);
    return { success: true, data: result };
  }
}
```

---

## 7. Dashboard Pattern

- **Definisi Widget:** File `Dashboard.gs` digunakan untuk mendefinisikan *widget* yang disumbangkan oleh sebuah modul.
- **Metode Statis:** Definisi *widget* harus berada di dalam sebuah metode statis bernama `getWidgets()`.
- **Struktur Objek:** Setiap *widget* harus berupa objek JavaScript yang mengikuti struktur standar (`id`, `title`, `type`, `dataSource`, `size`).
- **Data Source:** Atribut `dataSource` harus merujuk ke metode di dalam kelas `Service` modul tersebut yang akan menyediakan data untuk *widget*.

**Contoh Implementasi:**
```javascript
class CitizenDashboard {
  static getWidgets() {
    return [
      {
        id: 'citizen_count_widget',
        title: 'Total Warga',
        type: 'scorecard',
        dataSource: 'CitizenService.getTotalCitizenCount', // Merujuk ke metode di Service
        size: 'small'
      }
    ];
  }
}
```

---

## 8. Logging Standard

Logging yang baik sangat penting untuk *debugging* dan monitoring.

- **Gunakan Logger Utility:** Selalu gunakan utilitas `Logger` yang telah disediakan, jangan menggunakan `console.log()` secara langsung di lingkungan produksi.
- **Level Log:** Gunakan level log yang sesuai:
    - `Logger.debug()`: Untuk informasi *debugging* detail selama pengembangan.
    - `Logger.info()`: Untuk mencatat peristiwa bisnis penting (e.g., "User X created letter Y").
    - `Logger.warn()`: Untuk kondisi yang tidak diharapkan tetapi tidak menghentikan proses (e.g., "API response took longer than 3 seconds").
    - `Logger.error()`: Untuk kesalahan fatal yang menghentikan proses. Selalu sertakan *stack trace* jika memungkinkan.
- **Konteks yang Jelas:** Setiap pesan log harus menyertakan konteks yang cukup (e.g., ID entitas, nama fungsi) untuk memudahkan pelacakan.

**Contoh Implementasi:**
```javascript
// Di dalam sebuah Service
try {
  Logger.info(`Starting approval process for letter ID: ${letterId}`);
  // ... proses
} catch (e) {
  Logger.error(`Failed to approve letter ID: ${letterId}. Error: ${e.message}`, e.stack);
  throw e; // Lemparkan kembali error
}
```

---

## 9. Comment Standard

- **JSDoc Wajib:** Semua fungsi dan metode publik (terutama di `Service`) **WAJIB** memiliki blok komentar JSDoc yang menjelaskan tujuan fungsi, parameter (`@param`), dan nilai kembalian (`@returns`).
- **Komentar Inline:** Gunakan komentar inline (`//`) hanya untuk menjelaskan bagian kode yang kompleks atau "mengapa" sebuah keputusan teknis dibuat, bukan "apa" yang dilakukan kode tersebut. Kode harus bisa menjelaskan dirinya sendiri.

**Contoh JSDoc (Do):**
```javascript
/**
 * Calculates the eligibility of a citizen for social assistance.
 * @param {string} citizenId - The unique ID of the citizen.
 * @returns {boolean} - True if the citizen is eligible, false otherwise.
 */
function calculateEligibility(citizenId) {
  // ...
}
```

**Contoh Komentar Inline (Don't):**
```javascript
// loop through citizens
for (const citizen of citizens) { ... }
```

**Contoh Komentar Inline (Do):**
```javascript
// We have to use a manual loop here because Array.prototype.map
// is not performant for very large datasets in Apps Script V8.
for (const citizen of citizens) { ... }
```

---

## 10. Testing Standard

- **File Tes Wajib:** Setiap modul yang memiliki logika bisnis **WAJIB** memiliki file `Test.js`.
- **Fokus pada Service:** Prioritas utama pengujian unit adalah kelas `Service`, karena di sanalah semua logika bisnis berada.
- **Isolasi dengan Mocking:** Saat menguji `Service`, semua dependensinya (terutama `Repository`) harus di-*mock*. Ini memastikan pengujian hanya fokus pada logika bisnis, bukan pada cara kerja database.
- **Skenario Positif dan Negatif:** Setiap tes harus mencakup skenario "happy path" (input valid, hasil sukses) dan minimal satu "unhappy path" (input tidak valid, hasil error).
- **Cakupan Kode:** Target cakupan kode (*code coverage*) untuk `Service.js` adalah minimal 80%.

---

## 11. Commit Standard

Proyek ini mengadopsi standar **Conventional Commits**. Setiap pesan commit harus mengikuti format:

**`<type>(<scope>): <subject>`**

| Tipe | Deskripsi |
| :--- | :--- |
| **`feat`** | Penambahan fitur baru. |
| **`fix`** | Perbaikan bug. |
| **`docs`** | Perubahan pada dokumentasi. |
| **`style`** | Perubahan format kode (spasi, titik koma, dll). |
| **`refactor`**| Perubahan kode yang tidak menambah fitur atau memperbaiki bug. |
| **`perf`** | Perubahan kode untuk meningkatkan performa. |
| **`test`** | Penambahan atau perbaikan tes. |
| **`build`** | Perubahan pada sistem build atau dependensi eksternal. |
| **`ci`** | Perubahan pada file konfigurasi CI/CD. |
| **`chore`** | Perubahan lain yang tidak menyentuh kode sumber (e.g., update `.gitignore`). |

**Contoh:**
- `feat(letter): add digital signature capability`
- `fix(citizen): correct NIK validation logic`
- `docs(readme): update installation instructions`

---

## 12. Git Flow

Proyek ini menggunakan model Git Flow yang disederhanakan.

- **`main`:** Cabang ini merepresentasikan kode produksi yang stabil. Hanya rilis yang sudah teruji yang boleh di-*merge* ke `main`.
- **`develop`:** Cabang utama untuk pengembangan. Semua fitur baru di-*merge* ke sini. Ini adalah sumber untuk rilis berikutnya.
- **`feature/<feature-name>`:** Setiap fitur baru atau tugas dikerjakan di cabang ini, yang dibuat dari `develop`. Contoh: `feature/add-sktm-letter`.
- **`hotfix/<issue-id>`:** Untuk perbaikan bug kritis di produksi. Dibuat dari `main`, lalu di-*merge* kembali ke `main` dan `develop`.

**Alur Kerja Pull Request (PR):**
1. Buat cabang `feature/` dari `develop`.
2. Kerjakan fitur dan lakukan *commit* sesuai standar.
3. Buka PR dari cabang `feature/` ke `develop`.
4. PR harus di-review dan disetujui oleh minimal satu anggota tim lain sebelum di-*merge*.

---

## 13. Review Standard

Proses *code review* adalah gerbang kualitas utama.

- **Tujuan Review:** Bukan untuk mencari kesalahan, tetapi untuk meningkatkan kualitas kode secara kolaboratif.
- **Fokus Reviewer:**
    - Apakah kode sesuai dengan standar arsitektur dan desain?
    - Apakah logika bisnisnya benar?
    - Apakah ada potensi *bug* atau *edge case* yang terlewat?
    - Apakah tes yang ditulis sudah cukup?
    - Apakah kodenya mudah dibaca dan dipelihara?
- **Checklist Reviewer:**
    - [ ] Nama cabang dan pesan commit sesuai standar.
    - [ ] Kode mematuhi Naming Convention dan Coding Standard.
    - [ ] Tidak ada logika bisnis di Controller/Repository.
    - [ ] Fungsi publik memiliki dokumentasi JSDoc.
    - [ ] Unit test telah ditambahkan untuk logika baru.
    - [ ] Tidak ada informasi sensitif (*credentials*) yang di-*hardcode*.

---

## 14. Deployment Standard

- **Dilarang Deployment Manual:** Semua proses deployment ke lingkungan manapun (DEV, STAGING, PROD) **WAJIB** dilakukan melalui perkakas WK CLI, yaitu perintah `wk deploy` atau `wk release`.
- **Alur Rilis:** Perintah `wk release` akan secara otomatis menjalankan `doctor`, `backup`, `deploy`, dan `smoketest`. Proses ini tidak boleh dilewati.
- **Verifikasi:** Setiap deployment harus diikuti dengan verifikasi (minimal *smoke test*) untuk memastikan sistem berjalan dengan baik.
- **Rollback:** Jika terjadi kegagalan pasca-deployment, segera lakukan prosedur *rollback* menggunakan perintah `wk restore`.