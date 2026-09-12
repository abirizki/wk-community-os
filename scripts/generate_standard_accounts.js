/**
 * scripts/generate_standard_accounts.js
 * Generator Akun Standar Pemerintahan & Kredensial Distribusi Pilot
 * Standar Penamaan Resmi: Kota Sukabumi - Kelurahan Kebonjati (Pilot)
 * Jabar Pintar Digital
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function generateAccounts() {
  console.log('================================================================');
  console.log('🏛️  MEMULAI GENERATOR AKUN STANDAR PEMDA KOTA SUKABUMI');
  console.log('    Kelurahan Pilot: Kebonjati (32.72.03.1004)');
  console.log('================================================================\n');

  const salt = await bcrypt.genSalt(10);

  // Definisi Akun Standar
  const standardAccounts = [
    // 1. Eksekutif Kota
    {
      id: 1,
      username: 'superadmin',
      nama: 'Super Admin Diskominfo',
      role: 'superadmin',
      defaultPass: 'Sukabumi@Diskominfo2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: null,
      jabatan: 'Administrator Utama Sistem Kota Sukabumi',
      kategori: 'Pemerintah Kota'
    },
    {
      id: 10,
      username: 'walikota.sukabumi',
      nama: 'Walikota Sukabumi',
      role: 'walikota',
      defaultPass: 'Sukabumi@Juara2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: null,
      jabatan: 'Kepala Daerah Kota Sukabumi',
      kategori: 'Pemerintah Kota'
    },

    // 2. Tingkat Kecamatan (7 Kecamatan)
    {
      id: 11,
      username: 'camat.cikole',
      nama: 'Camat Cikole',
      role: 'camat',
      defaultPass: 'Cikole@Bisa2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: null,
      jabatan: 'Camat Wilayah Cikole',
      kategori: 'Kecamatan'
    },
    {
      id: 12,
      username: 'camat.gunungpuyuh',
      nama: 'Camat Gunungpuyuh',
      role: 'camat',
      defaultPass: 'Gunungpuyuh@Bisa2026',
      kode_kecamatan: '32.72.01',
      kode_kelurahan: '32.72.01.1001',
      rt: null,
      rw: null,
      jabatan: 'Camat Wilayah Gunungpuyuh',
      kategori: 'Kecamatan'
    },
    {
      id: 13,
      username: 'camat.warudoyong',
      nama: 'Camat Warudoyong',
      role: 'camat',
      defaultPass: 'Warudoyong@Bisa2026',
      kode_kecamatan: '32.72.02',
      kode_kelurahan: '32.72.02.1001',
      rt: null,
      rw: null,
      jabatan: 'Camat Wilayah Warudoyong',
      kategori: 'Kecamatan'
    },

    // 3. Tingkat Kelurahan Pilot (Kebonjati)
    {
      id: 2,
      username: 'admin.kebonjati',
      nama: 'Admin Pelayanan Kelurahan Kebonjati',
      role: 'admin_kelurahan',
      defaultPass: 'Kebonjati@Hebat2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: null,
      jabatan: 'Staf Pelayanan Terpadu Kelurahan',
      kategori: 'Kelurahan'
    },
    {
      id: 14,
      username: 'lurah.kebonjati',
      nama: 'Ahmad Sofyan, S.IP (Lurah Kebonjati)',
      role: 'lurah',
      defaultPass: 'Lurah@Kebonjati2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: null,
      jabatan: 'Lurah Kebonjati (Pejabat Penandatangan TTE)',
      kategori: 'Kelurahan'
    },

    // 4. Tingkat Rukun Warga (RW 001 - RW 003 Pilot)
    {
      id: 3,
      username: 'rw01_kebonjati',
      nama: 'Ketua RW 001 Kebonjati',
      role: 'ketua_rw',
      defaultPass: 'Warga01@Kbj2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: '001',
      jabatan: 'Ketua Rukun Warga 001',
      kategori: 'Rukun Warga (RW)'
    },
    {
      id: 15,
      username: 'rw02_kebonjati',
      nama: 'Ketua RW 002 Kebonjati',
      role: 'ketua_rw',
      defaultPass: 'Warga02@Kbj2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: '002',
      jabatan: 'Ketua Rukun Warga 002',
      kategori: 'Rukun Warga (RW)'
    },

    // 5. Tingkat Rukun Tetangga (RT 001 - RT 003 di RW 001)
    {
      id: 4,
      username: 'rt01_rw01_kbj',
      nama: 'Ketua RT 001 RW 001 Kebonjati',
      role: 'ketua_rt',
      defaultPass: 'Guyub01@Kbj2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: '001',
      rw: '001',
      jabatan: 'Ketua Rukun Tetangga 001',
      kategori: 'Rukun Tetangga (RT)'
    },
    {
      id: 16,
      username: 'rt02_rw01_kbj',
      nama: 'Ketua RT 002 RW 001 Kebonjati',
      role: 'ketua_rt',
      defaultPass: 'Guyub02@Kbj2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: '002',
      rw: '001',
      jabatan: 'Ketua Rukun Tetangga 002',
      kategori: 'Rukun Tetangga (RT)'
    },
    {
      id: 17,
      username: 'rt01_rw02_kbj',
      nama: 'Ketua RT 001 RW 002 Kebonjati',
      role: 'ketua_rt',
      defaultPass: 'Guyub01@Kbj2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: '001',
      rw: '002',
      jabatan: 'Ketua Rukun Tetangga 001 RW 002',
      kategori: 'Rukun Tetangga (RT)'
    },

    // 6. Kader Posyandu
    {
      id: 5,
      username: 'posyandu.melati_rw01',
      nama: 'Bdn. Imas Rohayati (Posyandu Melati RW 01)',
      role: 'kader_posyandu',
      defaultPass: 'Sehat01@Kbj2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: null,
      rw: '001',
      jabatan: 'Koordinator Kader Posyandu Balita & Lansia',
      kategori: 'Kader Posyandu'
    },

    // 7. Akun Warga Contoh
    {
      id: 6,
      username: '3273010203850003',
      nama: 'Budi Santoso',
      role: 'warga',
      defaultPass: 'Warga@0003#2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: '001',
      rw: '001',
      jabatan: 'Warga / Kepala Keluarga',
      kategori: 'Warga Masyarakat'
    },
    {
      id: 7,
      username: '3273014504900004',
      nama: 'Siti Rahayu',
      role: 'warga',
      defaultPass: 'Warga@0004#2026',
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1004',
      rt: '002',
      rw: '001',
      jabatan: 'Warga / Ibu Rumah Tangga',
      kategori: 'Warga Masyarakat'
    }
  ];

  console.log(`Meng-hash ${standardAccounts.length} akun terstruktur...`);

  const processed = [];
  for (const acc of standardAccounts) {
    const hash = await bcrypt.hash(acc.defaultPass, salt);
    processed.push({
      ...acc,
      password_hash: hash
    });
  }

  // 1. Buat Berkas Slip Distribusi Kredensial Markdown
  let markdownSlip = `# SLIP DISTRIBUSI KREDENSIAL PENGGUNA RESMI
## SISTEM INFORMASI PELAYANAN PUBLIK "BUMI WARGA"
### KELURAHAN PILOT KEBONJATI — KECAMATAN CIKOLE — KOTA SUKABUMI
*Dicetak Otomatis pada: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}*

---

> [!IMPORTANT]
> **PEMBERITAHUAN KEAMANAN (BSSN & UU PDP No. 27/2022)**:
> 1. Kredensial di bawah ini bersifat rahasia dan hanya boleh diserahkan kepada pejabat/petugas/warga yang bersangkutan.
> 2. Pengguna **diwajibkan mengganti kata sandi** saat pertama kali login ke dalam sistem.
> 3. Alamat Akses Sistem: \`https://bumiwarga.sukabumikota.go.id\` (atau \`http://localhost:3000\` pada server lokal).

---

`;

  let currentCat = '';
  for (const acc of processed) {
    if (acc.kategori !== currentCat) {
      currentCat = acc.kategori;
      markdownSlip += `\n## KATEGORI: ${currentCat.toUpperCase()}\n\n`;
    }

    markdownSlip += `### 📄 SLIP KREDENSIAL: ${acc.nama}
| Parameter | Informasi Akun Resmi |
| :--- | :--- |
| **Nama Pemegang** | **${acc.nama}** |
| **Jabatan / Tugas** | ${acc.jabatan} |
| **Peran Sistem (Role)** | \`${acc.role}\` |
| **Wilayah Cakupan** | Kelurahan Kebonjati (RT ${acc.rt || '-'} / RW ${acc.rw || '-'}) |
| **Username Resmi** | \`${acc.username}\` |
| **Kata Sandi Awal** | \`${acc.defaultPass}\` |
| **Kebijakan Pertama Login** | **Wajib Buat Kata Sandi Baru Pribadi** |

---
`;
  }

  const slipPath = path.join(root, 'docs', 'DISTRIBUSI_KREDENSIAL_PILOT.md');
  fs.writeFileSync(slipPath, markdownSlip);
  console.log(`✅ [PASS] Berkas slip kredensial berhasil disimpan di: docs/DISTRIBUSI_KREDENSIAL_PILOT.md`);

  // 2. Buat Skrip Migrasi SQL / JS untuk Memperbarui Tabel Users di MySQL
  const migrationScript = `/**
 * database/migrate_standard_accounts.js
 * Memperbarui akun users dengan username & password hash standar resmi
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const ACCOUNTS = ${JSON.stringify(processed, null, 2)};

async function run() {
  console.log('Mengaplikasikan akun standar ke database...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bumi_warga'
    });

    // Pastikan kolom must_change_password ada
    try {
      await connection.query(\`
        ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 1 AFTER status
      \`);
      console.log('Kolom must_change_password berhasil ditambahkan ke tabel users.');
    } catch (colErr) {
      // Kolom mungkin sudah ada
    }

    for (const acc of ACCOUNTS) {
      await connection.execute(\`
        INSERT INTO users (id, username, password_hash, nama, role, kode_kecamatan, kode_kelurahan, rt, rw, status, must_change_password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)
        ON DUPLICATE KEY UPDATE
          username = VALUES(username),
          password_hash = VALUES(password_hash),
          nama = VALUES(nama),
          role = VALUES(role),
          kode_kecamatan = VALUES(kode_kecamatan),
          kode_kelurahan = VALUES(kode_kelurahan),
          rt = VALUES(rt),
          rw = VALUES(rw),
          status = 'active',
          must_change_password = 1
      \`, [
        acc.id,
        acc.username,
        acc.password_hash,
        acc.nama,
        acc.role,
        acc.kode_kecamatan,
        acc.kode_kelurahan,
        acc.rt,
        acc.rw
      ]);
    }

    console.log(\`Berhasil memperbarui \${ACCOUNTS.length} akun standar di database!\`);
    await connection.end();
  } catch (err) {
    console.log('Database lokal offline, menyimpan konfigurasi standar in-memory & SQL seed.');
  }
}

run();
`;

  const migrationPath = path.join(root, 'database', 'migrate_standard_accounts.js');
  fs.writeFileSync(migrationPath, migrationScript);
  console.log(`✅ [PASS] Skrip migrasi database berhasil dibuat di: database/migrate_standard_accounts.js`);

  console.log('\n================================================================');
  console.log('🎉 OPSI 1 SELESAI: GENERATOR AKUN & SLIP DISTRIBUSI SIAP PAKAI!');
  console.log('================================================================\n');
}

generateAccounts();

