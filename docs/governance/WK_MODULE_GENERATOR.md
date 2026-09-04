**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU MODULE GENERATOR**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-023` |
| **Nama Dokumen** | Cetak Biru Module Generator |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Enterprise Software Architect, Framework Engineer |
| **Peninjau** | Chief Software Architect, Lead Developer |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini menyediakan cetak biru teknis dan fungsional untuk **Module Generator**, sebuah fitur inti dari **WK Command-Line Interface (CLI)**. Module Generator adalah perkakas *scaffolding* otomatis yang dirancang untuk menciptakan seluruh struktur direktori dan file boilerplate untuk sebuah modul baru dengan satu perintah tunggal.

Tujuan utamanya adalah untuk memberlakukan **Standar Pengembangan Modul (`DOC-005`)** secara otomatis, menghilangkan pekerjaan manual yang repetitif, dan memastikan setiap modul baru dibangun di atas fondasi yang konsisten dan sesuai dengan arsitektur platform. Dengan mengotomatiskan pembuatan `Repository`, `Service`, `Controller`, `Test`, dan file-file standar lainnya, generator ini memungkinkan developer untuk langsung fokus pada implementasi logika bisnis, sehingga secara signifikan mempercepat siklus pengembangan dan mengurangi potensi kesalahan konfigurasi.

## 3. Development Philosophy

Module Generator adalah manifestasi dari filosofi rekayasa perangkat lunak yang dianut oleh WK Community OS:

- **Convention over Configuration:** Generator ini memberlakukan konvensi penamaan file, struktur kelas, dan lokasi direktori. Developer tidak perlu lagi memikirkan standar tersebut, karena sudah disediakan secara otomatis.
- **Don't Repeat Yourself (DRY):** Menghilangkan kebutuhan untuk menyalin-tempel (*copy-paste*) struktur dari modul yang ada. Setiap modul baru dihasilkan dari templat yang sama, memastikan konsistensi dan mengurangi duplikasi kode boilerplate.
- **Accelerated Onboarding:** Developer baru dapat menjadi produktif lebih cepat karena mereka tidak perlu mempelajari seluruh standar dari awal. Mereka cukup menjalankan satu perintah untuk mendapatkan kerangka kerja modul yang siap pakai.

## 4. Command Specification

| | |
| :--- | :--- |
| **Perintah** | `wk create module <ModuleName>` |
| **Alias** | `wk c m <ModuleName>` |
| **Argumen** | `ModuleName`: Nama modul dalam format `PascalCase` (e.g., `Citizen`, `SocialAssistance`). CLI akan secara otomatis menanganinya menjadi `camelCase` atau `kebab-case` jika diperlukan. |
| **Contoh** | `wk create module Citizen` |
| **Output** | Membuat direktori `src/citizen/` beserta seluruh file standar di dalamnya. |

## 5. Generator Architecture

Arsitektur generator mengikuti alur yang jelas dari input pengguna hingga penulisan file.

```ascii
Developer executes: `wk create module Citizen`
        |
        v
+----------------------+
|   CLI Command Parser   | (Mengenali perintah 'create module' dan argumen 'Citizen')
+----------------------+
        |
        v
+----------------------+
|  ModuleGenerator Handler | (Menerima 'Citizen' sebagai input)
+----------------------+
        |
        v
| 1. Menyiapkan variabel:
|    - moduleNamePascal = "Citizen"
|    - moduleNameCamel  = "citizen"
|    - moduleNameKebab  = "citizen"
        |
        v
| 2. Membuat direktori: `src/citizen/`
        |
        v
+----------------------+
|   Template Engine      | (Looping melalui daftar templat standar)
+----------------------+
        |
        | For each template (e.g., `Service.js.tpl`):
        |   a. Baca konten templat.
        |   b. Ganti `{{ModuleNamePascal}}` dengan "Citizen".
        |   c. Ganti `{{moduleNameCamel}}` dengan "citizen".
        |
        v
+----------------------+
|   File System Writer   | (Menulis konten yang sudah diproses ke file tujuan)
| (e.g., `src/citizen/Service.js`)
+----------------------+
        |
        v
[Proses selesai, tampilkan pesan sukses]
```

## 6. Generated Files & Boilerplate

Menjalankan `wk create module Citizen` akan secara otomatis menghasilkan file-file berikut dengan konten boilerplate yang sudah disesuaikan.

### `src/citizen/module.json`

```json
{
  "id": "citizen",
  "name": "Citizen",
  "version": "1.0.0",
  "author": "[Your Name]",
  "enabled": true,
  "dependencies": [],
  "permissions": [],
  "menus": [],
  "dashboard": [],
  "events": {},
  "routes": []
}
```

### `src/citizen/Repository.gs`

```javascript
/**
 * @class CitizenRepository
 * @description Handles all data access logic for the Citizen module.
 */
class CitizenRepository {
  constructor(dbAdapter) {
    this.db = dbAdapter.setTable('citizens');
  }

  findById(id) {
    return this.db.findById(id);
  }

  findAll(query = {}) {
    return this.db.findAll(query);
  }

  save(data) {
    return this.db.save(data);
  }

  delete(id) {
    return this.db.delete(id);
  }
}
```

### `src/citizen/Service.gs`

```javascript
/**
 * @class CitizenService
 * @description Contains all business logic for the Citizen module.
 */
class CitizenService {
  constructor(citizenRepository) {
    this.citizenRepository = citizenRepository;
  }

  /**
   * Registers a new citizen.
   * @param {object} citizenData - The data for the new citizen.
   * @returns {object} The newly created citizen record.
   */
  registerCitizen(citizenData) {
    // TODO: Add validation logic via CitizenValidator
    // TODO: Add business rules

    const newCitizen = this.citizenRepository.save(citizenData);

    // TODO: Publish a 'Citizen.Created' event
    // EventManager.publish('Citizen.Created', { payload: newCitizen });

    return newCitizen;
  }
}
```

### `src/citizen/Controller.gs`

```javascript
/**
 * @class CitizenController
 * @description Handles incoming requests for the Citizen module.
 */
class CitizenController {
  constructor(citizenService) {
    this.citizenService = citizenService;
  }

  /**
   * Handles the request to create a new citizen.
   * @param {object} request - The request object containing citizen data.
   * @returns {object} A response object.
   */
  create(request) {
    // TODO: Check permissions
    // SecurityManager.checkPermission('citizen.create');

    const citizenData = request.body;
    const result = this.citizenService.registerCitizen(citizenData);

    return { success: true, data: result };
  }
}
```

### `src/citizen/Dashboard.gs`

```javascript
/**
 * @class CitizenDashboard
 * @description Defines dashboard widgets for the Citizen module.
 */
class CitizenDashboard {
  static getWidgets() {
    return [
      {
        id: 'citizen_count_widget',
        title: 'Total Warga',
        type: 'scorecard',
        dataSource: 'CitizenService.getTotalCitizenCount',
        size: 'small'
      }
    ];
  }
}
```

### `src/citizen/Permission.gs`

```javascript
/**
 * @class CitizenPermission
 * @description Defines permissions for the Citizen module.
 */
class CitizenPermission {
  static getPermissions() {
    return [
      { id: 'citizen.view', description: 'Can view citizen data' },
      { id: 'citizen.create', description: 'Can create a new citizen' },
      { id: 'citizen.update', description: 'Can update citizen data' },
      { id: 'citizen.delete', description: 'Can delete a citizen' }
    ];
  }
}
```

### `src/citizen/Menu.gs`

```javascript
/**
 * @class CitizenMenu
 * @description Defines menu items for the Citizen module.
 */
class CitizenMenu {
  static getMenuItems() {
    return [
      {
        label: 'Kependudukan',
        icon: 'users',
        children: [
          {
            label: 'Data Warga',
            path: '/citizens',
            permission: 'citizen.view'
          }
        ]
      }
    ];
  }
}
```

### `src/citizen/Validator.gs`

```javascript
/**
 * @class CitizenValidator
 * @description Provides validation rules for citizen data.
 */
class CitizenValidator {
  /**
   * Validates the data for a new citizen.
   * @param {object} data - The citizen data.
   * @returns {{isValid: boolean, errors: string[]}}
   */
  static forCreate(data) {
    const errors = [];
    if (!data.nik || data.nik.length !== 16) {
      errors.push('NIK harus 16 digit.');
    }
    if (!data.nama_lengkap) {
      errors.push('Nama lengkap wajib diisi.');
    }
    // TODO: Add more validation rules.

    return { isValid: errors.length === 0, errors };
  }
}
```

### `src/citizen/Test.gs`

```javascript
/**
 * Unit tests for CitizenService.
 */
function runCitizenTests() {
  // Mock the repository
  const mockRepo = {
    save: (data) => ({ id: '123', ...data }),
  };

  const citizenService = new CitizenService(mockRepo);

  // Test case 1: Successful registration
  console.log('Running test: Successful registration...');
  const testData = { nik: '1234567890123456', nama_lengkap: 'Budi' };
  const result = citizenService.registerCitizen(testData);
  console.assert(result.id === '123', 'Test Failed: ID should be 123');
  console.assert(result.nama_lengkap === 'Budi', 'Test Failed: Name should be Budi');
  console.log('Test Passed!');

  // TODO: Add more test cases (e.g., for invalid data).
}
```

### `src/citizen/README.md`

```markdown
# Citizen Module

**Version:** 1.0.0

## 1. Tujuan

Modul ini bertanggung jawab untuk mengelola semua data yang terkait dengan warga (citizen), termasuk data pribadi, alamat, dan status kependudukan.

## 2. Fungsionalitas Utama

- Pendaftaran warga baru.
- Pembaruan data warga.
- Pencarian dan penampilan data warga.

## 3. API / Metode Utama

### `CitizenService.registerCitizen(citizenData)`

Mendaftarkan seorang warga baru ke dalam sistem.

## 4. Event yang Dipublikasikan

- `Citizen.Created`
- `Citizen.Updated`
- `Citizen.Deleted`

## 5. Ketergantungan

- Modul `Family` (untuk menghubungkan ke Kartu Keluarga).
```

### `src/citizen/Migration.gs`

```javascript
/**
 * Migration scripts for the Citizen module.
 */
class CitizenMigration {
  static up() {
    // Logic to apply a schema change.
    // e.g., SpreadsheetApp.getActiveSpreadsheet().getSheetByName('citizens').insertColumnAfter(5);
  }

  static down() {
    // Logic to revert a schema change.
    // e.g., SpreadsheetApp.getActiveSpreadsheet().getSheetByName('citizens').deleteColumn(6);
  }
}
```

### `src/citizen/Seeder.gs`

```javascript
/**
 * Data seeder for the Citizen module.
 */
class CitizenSeeder {
  static run() {
    const sampleCitizens = [
      { nik: '1111222233334444', nama_lengkap: 'Admin User' },
      { nik: '5555666677778888', nama_lengkap: 'Test User' },
    ];

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('citizens');
    sampleCitizens.forEach(citizen => {
      // Logic to append data to the sheet
    });
  }
}
```

## 7. Future Roadmap

| Versi | Fokus | Fitur Utama |
| :--- | :--- | :--- |
| **v1.0** | **Basic Scaffolding** | Menghasilkan semua file standar dengan kode boilerplate dasar. |
| **v1.5** | **Interactive Mode** | `wk create module -i`: Mode interaktif yang akan menanyakan nama modul, dependensi, dan file opsional yang ingin dibuat. |
| **v2.0** | **AI-Powered Generation** | `wk create test --ai <ModuleName>`: Menggunakan AI untuk membaca kode `Service.js` dan secara otomatis menghasilkan kerangka tes yang lebih relevan. |
| **v2.5** | **Blueprint Integration** | `wk create module --from-blueprint <BlueprintFile>`: Membaca file blueprint (seperti `WK_CITIZEN_MODULE_BLUEPRINT.md`) untuk menghasilkan kerangka yang lebih detail, termasuk metode, properti, dan aturan validasi awal. |