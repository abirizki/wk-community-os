# Panduan Migrasi `wk-community-os` dari Google Apps Script ke Node.js

## Kesimpulan awal

Repository `abirizki/wk-community-os` saat ini adalah proyek Google Apps Script, bukan aplikasi Node.js. Kode menggunakan file `.gs`, `appsscript.json`, `SpreadsheetApp`, dan Google Sheets sebagai penyimpanan data.

Migrasi tidak cukup dengan menambahkan `package.json`. Runtime Google Apps Script harus diganti dengan server Node.js, database, sistem autentikasi, penyimpanan file, dan route HTTP yang berjalan di Hostinger.

---

## 1. Arsitektur tujuan

Gunakan arsitektur berikut di Hostinger:

```text
bumiwarga.simetrikami.com
├── server.js              # Entry point Express
├── package.json           # Dependency dan perintah start
├── .env                   # Rahasia, jangan di-commit
├── src/
│   ├── config.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── warga.routes.js
│   │   ├── dashboard.routes.js
│   │   └── dokumen.routes.js
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   └── db/
├── public/                # React build atau file statis
└── uploads/               # Jika file disimpan di hosting
```

Jangan mengubah semua file `.gs` menjadi `.js` secara otomatis. Banyak API Google Apps Script tidak tersedia di Node.js.

---

## 2. Buat branch migrasi

Pertahankan repository Google Apps Script agar tetap aman. Buat branch baru untuk versi Node.js:

```bash
git checkout -b node-hostinger-migration
git push -u origin node-hostinger-migration
```

Untuk deployment awal di Hostinger, gunakan branch tersebut setelah isinya sudah memiliki `package.json` dan `server.js`.

---

## 3. Tambahkan `package.json`

Buat `package.json` di root repository:

```json
{
  "name": "wk-community-os-node",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "helmet": "^8.0.0",
    "mysql2": "^3.11.5"
  }
}
```

Kemudian jalankan secara lokal:

```bash
npm install
```

Commit juga `package-lock.json`:

```bash
git add package.json package-lock.json
git commit -m "Add Node.js runtime configuration"
git push
```

---

## 4. Buat entry point `server.js`

Gunakan port dari environment Hostinger. Jangan mengunci port ke `3000` saja.

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    application: "WK Community OS",
    environment: process.env.NODE_ENV || "development"
  });
});

// Route API akan ditambahkan di sini.
// app.use("/api/auth", require("./src/routes/auth.routes"));
// app.use("/api/warga", require("./src/routes/warga.routes"));

// Jika React build berada di folder public:
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

// Fallback SPA. Pastikan route API didefinisikan sebelum fallback ini.
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`WK Community OS berjalan pada port ${port}`);
});
```

Tahap pertama migrasi cukup memastikan endpoint berikut merespons:

```text
GET /health
```

Jangan langsung memigrasikan seluruh fitur sebelum endpoint kesehatan berhasil dijalankan di Hostinger.

---

## 5. Migrasi konfigurasi

Konfigurasi dari `01_Config.js` harus dipisahkan dari kode. Jangan menaruh password database, secret session, atau token Google langsung di repository.

Buat file `.env` secara lokal hanya untuk pengujian:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=ganti-dengan-secret-random-yang-panjang
DB_HOST=153.92.15.81
DB_USER=u466444476_bumiwarga
DB_PASSWORD=isi-password-database
DB_NAME=u466444476_bumiwarga
FRONTEND_ORIGIN=https://bumiwarga.simetrikami.com
```

Tambahkan `.env` ke `.gitignore`:

```gitignore
.env
.env.*
node_modules/
uploads/
```

Password database tidak boleh diunggah ke GitHub.

---

## 6. Pilih strategi database

### Opsi A: Migrasi ke MySQL Hostinger

Ini cocok jika aplikasi ingin berdiri penuh di Hostinger. Tabel Google Sheets harus diubah menjadi tabel relasional.

Contoh tabel awal:

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'WARGA',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE warga (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nik VARCHAR(32) NOT NULL UNIQUE,
  no_kk VARCHAR(32),
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin VARCHAR(20),
  tanggal_lahir DATE,
  alamat TEXT,
  rt VARCHAR(10),
  rw VARCHAR(10),
  no_hp VARCHAR(30),
  email VARCHAR(255),
  status_warga VARCHAR(30) DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Buat koneksi database:

```js
// src/db/pool.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

module.exports = pool;
```

Uji koneksi:

```js
// src/db/check.js
const pool = require("./pool");

async function checkDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    return true;
  } finally {
    connection.release();
  }
}

module.exports = { checkDatabase };
```

### Opsi B: Tetap menggunakan Google Sheets

Jika data lama harus tetap berada di Google Sheets, Node.js harus memanggil Google Sheets API. Ini membutuhkan:

1. Google Cloud project.
2. Google Sheets API aktif.
3. Service account atau OAuth.
4. Akses spreadsheet diberikan kepada identitas yang digunakan aplikasi.
5. Secret Google disimpan sebagai environment variable Hostinger.

Migrasi ini lebih kompleks karena `SpreadsheetApp` tidak dapat dipanggil langsung dari Node.js.

Untuk aplikasi produksi baru, gunakan MySQL sebagai sumber data utama dan lakukan migrasi data dari Sheets secara bertahap.

---

## 7. Pemetaan modul repository

| Modul saat ini | Tindakan migrasi |
|---|---|
| `01_Config.js` | Pecah menjadi `src/config.js` dan environment variable |
| `09_database.js` | Tulis ulang dengan MySQL atau Google Sheets API |
| `11_Session.js` | Ganti dengan `express-session` dan penyimpanan server |
| `12_Request.js` | Ganti dengan route dan middleware Express |
| `15_Security.js` | Audit ulang dengan bcrypt, helmet, validasi input |
| `16_Permission.js` | Middleware authorization berbasis role |
| `18_Installer.js` | Migration script atau database seed |
| `19_Framework.js` | Tidak dipindahkan langsung; ganti dengan bootstrap Express |
| `20-24_*Repository.js` | Repository database Node.js |
| `30-33_*Service.js` | Service Node.js |
| `appsscript.json` | Tidak dipakai oleh Node.js |
| `.clasp.json` | Tidak dipakai oleh deployment Node.js |

---

## 8. Contoh migrasi route dan repository

### Repository

```js
// src/repositories/warga.repository.js
const pool = require("../db/pool");

async function findByNik(nik) {
  const [rows] = await pool.execute(
    "SELECT * FROM warga WHERE nik = ? LIMIT 1",
    [nik]
  );

  return rows[0] || null;
}

async function list({ limit = 20, offset = 0 } = {}) {
  const [rows] = await pool.execute(
    "SELECT * FROM warga ORDER BY nama ASC LIMIT ? OFFSET ?",
    [Number(limit), Number(offset)]
  );

  return rows;
}

module.exports = { findByNik, list };
```

### Service

```js
// src/services/warga.service.js
const wargaRepository = require("../repositories/warga.repository");

async function getByNik(nik) {
  if (!nik || String(nik).length < 5) {
    const error = new Error("NIK tidak valid");
    error.statusCode = 400;
    throw error;
  }

  return wargaRepository.findByNik(nik);
}

module.exports = { getByNik };
```

### Route

```js
// src/routes/warga.routes.js
const express = require("express");
const wargaService = require("../services/warga.service");

const router = express.Router();

router.get("/:nik", async (req, res, next) => {
  try {
    const warga = await wargaService.getByNik(req.params.nik);

    if (!warga) {
      return res.status(404).json({ message: "Data warga tidak ditemukan" });
    }

    res.json({ data: warga });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

Tambahkan ke `server.js`:

```js
app.use("/api/warga", require("./src/routes/warga.routes"));
```

---

## 9. Migrasi autentikasi

Jangan memindahkan password lama sebagai teks biasa. Gunakan hash password.

```js
const bcrypt = require("bcryptjs");

const passwordHash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(password, passwordHash);
```

Untuk tahap awal:

- `POST /api/auth/login`
- Verifikasi username dan password hash.
- Buat session atau token.
- Tambahkan middleware untuk memeriksa login.
- Tambahkan middleware role untuk RT, RW, kelurahan, dan admin.

Audit juga kolom `Password`, `Token`, dan `Session` dari sistem lama sebelum memindahkan datanya.

---

## 10. Migrasi upload file

Kode lama menggunakan konsep folder upload Google Drive. Di Node.js, pilih salah satu:

### Simpan di hosting

Gunakan `multer`, validasi tipe dan ukuran file, lalu simpan di folder non-public jika dokumen bersifat sensitif.

### Simpan di Google Drive

Gunakan Google Drive API dengan service account/OAuth. Jangan menaruh credential JSON langsung di GitHub.

Untuk dokumen warga, pilihan penyimpanan dan hak akses harus dirancang dengan hati-hati. Jangan menjadikan URL file sebagai akses publik tanpa pemeriksaan izin.

---

## 11. Frontend React

Repository yang dianalisis tidak berisi proyek React yang jelas. Jika frontend berada di repository lain, ada dua pilihan:

### Monolith

React dibuat terlebih dahulu lalu hasil build disalin ke `public/`:

```text
public/
├── index.html
├── assets/
└── favicon.ico
```

Express menyajikan folder tersebut dengan `express.static()`.

### Terpisah

Frontend dan API dideploy terpisah. API berjalan pada Node.js Web App dan frontend menjadi website statis. Untuk permulaan, monolith lebih sederhana jika React memang sudah tersedia.

---

## 12. Konfigurasi deployment Hostinger

Setelah repository sudah benar-benar menjadi aplikasi Node.js:

```text
Repository: abirizki/wk-community-os
Branch: node-hostinger-migration
Application root: kosong jika package.json berada di root
Build command: npm install
Start command: npm start
```

Jika aplikasi memakai build frontend:

```text
Build command: npm install && npm run build
Start command: npm start
```

Pastikan `package.json` berada langsung di application root yang dipilih. Jangan memilih branch `main` jika kode migrasi berada di branch lain.

Environment variable harus diisi melalui konfigurasi aplikasi Hostinger, bukan melalui file `.env` yang di-commit ke GitHub.

---

## 13. Tahapan migrasi yang disarankan

### Tahap 1: Proof of deployment

- Tambahkan `package.json`.
- Tambahkan `server.js`.
- Buat `GET /health`.
- Deploy ke Hostinger.
- Pastikan aplikasi merespons.

### Tahap 2: Database

- Buat schema MySQL.
- Uji koneksi.
- Buat repository `users` dan `warga`.
- Migrasikan salinan data kecil.

### Tahap 3: Autentikasi

- Migrasikan login.
- Hash ulang password jika diperlukan.
- Tambahkan session dan authorization.

### Tahap 4: Fitur utama

Migrasikan satu per satu:

1. Data warga.
2. Data kartu keluarga.
3. Dashboard.
4. Layanan.
5. Pengajuan.
6. Dokumen.
7. Surat.
8. Audit log.
9. QR verification.

### Tahap 5: Frontend dan production hardening

- Hubungkan React ke API.
- Atur CORS.
- Matikan debug log.
- Uji error handling.
- Uji backup dan restore.
- Periksa keamanan file upload.

---

## 14. Checklist sebelum deployment

- [ ] Branch deployment sudah benar.
- [ ] `package.json` ada di root.
- [ ] `package-lock.json` sudah di-commit.
- [ ] Ada script `start`.
- [ ] Ada `server.js`.
- [ ] Aplikasi menggunakan `process.env.PORT`.
- [ ] Tidak ada password di source code.
- [ ] `.env` ada di `.gitignore`.
- [ ] `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` sudah diisi di hPanel.
- [ ] Database sudah memiliki tabel.
- [ ] Endpoint `/health` berhasil.
- [ ] `DEBUG` dan debug log dimatikan untuk production.
- [ ] Route API tidak tertutup oleh fallback React.
- [ ] Upload file memiliki batas ukuran dan validasi MIME type.
- [ ] Password pengguna menggunakan hash.

---

## Rekomendasi akhir

Jangan mencoba menjalankan repository saat ini langsung sebagai Node.js. Pertahankan repository tersebut sebagai sumber kode Google Apps Script dan kerjakan porting ke branch baru.

Target pertama bukan memindahkan seluruh aplikasi sekaligus. Target pertama adalah membuat server Node.js sederhana dengan `/health`, lalu memigrasikan database dan autentikasi secara bertahap. Dengan pendekatan ini, kesalahan deployment, database, dan aplikasi dapat dipisahkan sehingga lebih mudah diperbaiki.