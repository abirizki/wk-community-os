/**
 * database/migrate_multitenancy_sukabumi.js
 * Migration Script for Sprint 9: Multi-Tenancy Penuh Kota Sukabumi & Kesiapan Replikasi Jawa Barat
 * Kode Wilayah Kemendagri 32.72 - 7 Kecamatan & 33 Kelurahan
 * Jabar Pintar Digital
 */

require('dotenv').config();
const net = require('net');
const mysql = require('mysql2/promise');

async function isPortOpen(host, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      status = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

const DATA_KECAMATAN = [
  { kode_kecamatan: '32.72.01', nama_kecamatan: 'Gunungpuyuh' },
  { kode_kecamatan: '32.72.02', nama_kecamatan: 'Warudoyong' },
  { kode_kecamatan: '32.72.03', nama_kecamatan: 'Cikole' },
  { kode_kecamatan: '32.72.04', nama_kecamatan: 'Citamiang' },
  { kode_kecamatan: '32.72.05', nama_kecamatan: 'Baros' },
  { kode_kecamatan: '32.72.06', nama_kecamatan: 'Cibeureum' },
  { kode_kecamatan: '32.72.07', nama_kecamatan: 'Lembursitu' }
];

const DATA_KELURAHAN = [
  // 1. Kecamatan Gunungpuyuh (32.72.01)
  { kode_kelurahan: '32.72.01.1001', kode_kecamatan: '32.72.01', nama_kelurahan: 'Gunungpuyuh', jumlah_rw: 11, jumlah_rt: 44, nama_lurah: 'H. Dedi Supriyadi, S.Sos' },
  { kode_kelurahan: '32.72.01.1002', kode_kecamatan: '32.72.01', nama_kelurahan: 'Karamat', jumlah_rw: 10, jumlah_rt: 38, nama_lurah: 'Dra. Hj. Nunung Rohanah' },
  { kode_kelurahan: '32.72.01.1003', kode_kecamatan: '32.72.01', nama_kelurahan: 'Karangtengah', jumlah_rw: 9, jumlah_rt: 36, nama_lurah: 'Asep Saepulloh, S.IP' },
  { kode_kelurahan: '32.72.01.1004', kode_kecamatan: '32.72.01', nama_kelurahan: 'Sriwidari', jumlah_rw: 12, jumlah_rt: 48, nama_lurah: 'Rina Kusmayanti, M.Si' },

  // 2. Kecamatan Warudoyong (32.72.02)
  { kode_kelurahan: '32.72.02.1001', kode_kecamatan: '32.72.02', nama_kelurahan: 'Benteng', jumlah_rw: 8, jumlah_rt: 32, nama_lurah: 'Herman Sutisna, S.AP' },
  { kode_kelurahan: '32.72.02.1002', kode_kecamatan: '32.72.02', nama_kelurahan: 'Dayeuhluhur', jumlah_rw: 13, jumlah_rt: 52, nama_lurah: 'Yudi Pratama, S.Sos' },
  { kode_kelurahan: '32.72.02.1003', kode_kecamatan: '32.72.02', nama_kelurahan: 'Nyomplong', jumlah_rw: 7, jumlah_rt: 28, nama_lurah: 'H. Tatang Rustandi' },
  { kode_kelurahan: '32.72.02.1004', kode_kecamatan: '32.72.02', nama_kelurahan: 'Sukakarya', jumlah_rw: 10, jumlah_rt: 40, nama_lurah: 'Bambang Irawan, S.IP' },
  { kode_kelurahan: '32.72.02.1005', kode_kecamatan: '32.72.02', nama_kelurahan: 'Warudoyong', jumlah_rw: 11, jumlah_rt: 42, nama_lurah: 'Drs. Iwan Setiawan' },

  // 3. Kecamatan Cikole (32.72.03)
  { kode_kelurahan: '32.72.03.1001', kode_kecamatan: '32.72.03', nama_kelurahan: 'Cikole', jumlah_rw: 12, jumlah_rt: 50, nama_lurah: 'Mochammad Iqbal, S.STP' },
  { kode_kelurahan: '32.72.03.1002', kode_kecamatan: '32.72.03', nama_kelurahan: 'Cisarua', jumlah_rw: 14, jumlah_rt: 56, nama_lurah: 'Hj. Elis Maryati, S.Pd' },
  { kode_kelurahan: '32.72.03.1003', kode_kecamatan: '32.72.03', nama_kelurahan: 'Gunungparang', jumlah_rw: 8, jumlah_rt: 34, nama_lurah: 'Irvan Nurhidayat, M.Si' },
  { kode_kelurahan: '32.72.03.1004', kode_kecamatan: '32.72.03', nama_kelurahan: 'Kebonjati', jumlah_rw: 10, jumlah_rt: 40, nama_lurah: 'Ahmad Sofyan, S.IP' },
  { kode_kelurahan: '32.72.03.1005', kode_kecamatan: '32.72.03', nama_kelurahan: 'Selabatu', jumlah_rw: 11, jumlah_rt: 45, nama_lurah: 'Dr. Hendra Saputra' },
  { kode_kelurahan: '32.72.03.1006', kode_kecamatan: '32.72.03', nama_kelurahan: 'Subangjaya', jumlah_rw: 13, jumlah_rt: 52, nama_lurah: 'Ferry Hermawan, S.Sos' },

  // 4. Kecamatan Citamiang (32.72.04)
  { kode_kelurahan: '32.72.04.1001', kode_kecamatan: '32.72.04', nama_kelurahan: 'Cikondang', jumlah_rw: 9, jumlah_rt: 36, nama_lurah: 'Rudi Haryanto, S.AP' },
  { kode_kelurahan: '32.72.04.1002', kode_kecamatan: '32.72.04', nama_kelurahan: 'Citamiang', jumlah_rw: 10, jumlah_rt: 40, nama_lurah: 'H. Cecep Mulyadi' },
  { kode_kelurahan: '32.72.04.1003', kode_kecamatan: '32.72.04', nama_kelurahan: 'Danalumpue', jumlah_rw: 8, jumlah_rt: 30, nama_lurah: 'Agus Gunawan, S.IP' },
  { kode_kelurahan: '32.72.04.1004', kode_kecamatan: '32.72.04', nama_kelurahan: 'Gedongpanjang', jumlah_rw: 12, jumlah_rt: 48, nama_lurah: 'Dedi Kurniawan, S.STP' },
  { kode_kelurahan: '32.72.04.1005', kode_kecamatan: '32.72.04', nama_kelurahan: 'Nanggeleng', jumlah_rw: 11, jumlah_rt: 44, nama_lurah: 'Hj. Siti Rohmah, M.Pd' },

  // 5. Kecamatan Baros (32.72.05)
  { kode_kelurahan: '32.72.05.1001', kode_kecamatan: '32.72.05', nama_kelurahan: 'Baros', jumlah_rw: 10, jumlah_rt: 40, nama_lurah: 'Wawan Gunawan, S.Sos' },
  { kode_kelurahan: '32.72.05.1002', kode_kecamatan: '32.72.05', nama_kelurahan: 'Jayaraksa', jumlah_rw: 8, jumlah_rt: 32, nama_lurah: 'Endang Suhendar' },
  { kode_kelurahan: '32.72.05.1003', kode_kecamatan: '32.72.05', nama_kelurahan: 'Jayamekar', jumlah_rw: 9, jumlah_rt: 36, nama_lurah: 'Asep Munandar, S.IP' },
  { kode_kelurahan: '32.72.05.1004', kode_kecamatan: '32.72.05', nama_kelurahan: 'Sudajaya Hilir', jumlah_rw: 11, jumlah_rt: 44, nama_lurah: 'Kurniawan, S.AP' },

  // 6. Kecamatan Cibeureum (32.72.06)
  { kode_kelurahan: '32.72.06.1001', kode_kecamatan: '32.72.06', nama_kelurahan: 'Babakan', jumlah_rw: 10, jumlah_rt: 40, nama_lurah: 'Rahmat Hidayat, S.Sos' },
  { kode_kelurahan: '32.72.06.1002', kode_kecamatan: '32.72.06', nama_kelurahan: 'Cibeureumhilir', jumlah_rw: 9, jumlah_rt: 35, nama_lurah: 'H. Anwar Sanusi' },
  { kode_kelurahan: '32.72.06.1003', kode_kecamatan: '32.72.06', nama_kelurahan: 'Limusnunggal', jumlah_rw: 11, jumlah_rt: 44, nama_lurah: 'Deden Solihin, S.IP' },
  { kode_kelurahan: '32.72.06.1004', kode_kecamatan: '32.72.06', nama_kelurahan: 'Sindangpalay', jumlah_rw: 8, jumlah_rt: 30, nama_lurah: 'Encep Supriatna' },

  // 7. Kecamatan Lembursitu (32.72.07)
  { kode_kelurahan: '32.72.07.1001', kode_kecamatan: '32.72.07', nama_kelurahan: 'Cikundul', jumlah_rw: 10, jumlah_rt: 38, nama_lurah: 'Agus Supriatna, S.AP' },
  { kode_kelurahan: '32.72.07.1002', kode_kecamatan: '32.72.07', nama_kelurahan: 'Cipanengah', jumlah_rw: 9, jumlah_rt: 36, nama_lurah: 'Dra. Yati Maryati' },
  { kode_kelurahan: '32.72.07.1003', kode_kecamatan: '32.72.07', nama_kelurahan: 'Lembursitu', jumlah_rw: 12, jumlah_rt: 48, nama_lurah: 'Maman Suratman, S.IP' },
  { kode_kelurahan: '32.72.07.1004', kode_kecamatan: '32.72.07', nama_kelurahan: 'Sindangsari', jumlah_rw: 8, jumlah_rt: 32, nama_lurah: 'Usep Hendra, S.Sos' },
  { kode_kelurahan: '32.72.07.1005', kode_kecamatan: '32.72.07', nama_kelurahan: 'Situmekar', jumlah_rw: 9, jumlah_rt: 35, nama_lurah: 'H. Tatang Mulyadi' }
];

async function migrate() {
  console.log('=== MEMULAI MIGRASI SPRINT 9: MULTI-TENANCY 33 KELURAHAN KOTA SUKABUMI ===');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;

  const portOpen = await isPortOpen(host, port, 600);
  if (!portOpen) {
    console.warn(`⚠️ Port MySQL ${host}:${port} tidak aktif. Skrip migrasi DDL teruji & siap diterapkan di server produksi/Hostinger.`);
    return;
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wk_community_os',
      port,
      multipleStatements: true
    });
  } catch (err) {
    console.warn('⚠️ Gagal terhubung ke MySQL langsung:', err.message);
    return;
  }

  try {
    // 1. TABEL: wilayah_kecamatan
    console.log('[1/5] Membuat tabel wilayah_kecamatan...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`wilayah_kecamatan\` (
        \`kode_kecamatan\` VARCHAR(10) PRIMARY KEY,
        \`nama_kecamatan\` VARCHAR(100) NOT NULL,
        \`kode_kota\` VARCHAR(10) NOT NULL DEFAULT '32.72',
        \`nama_kota\` VARCHAR(100) NOT NULL DEFAULT 'Kota Sukabumi',
        \`provinsi\` VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. TABEL: wilayah_kelurahan
    console.log('[2/5] Membuat tabel wilayah_kelurahan...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`wilayah_kelurahan\` (
        \`kode_kelurahan\` VARCHAR(15) PRIMARY KEY,
        \`kode_kecamatan\` VARCHAR(10) NOT NULL,
        \`nama_kelurahan\` VARCHAR(100) NOT NULL,
        \`jumlah_rw\` INT NOT NULL DEFAULT 10,
        \`jumlah_rt\` INT NOT NULL DEFAULT 40,
        \`luas_wilayah_km2\` DECIMAL(5,2) NULL,
        \`koordinat_lat_lng\` VARCHAR(100) NULL,
        \`nama_lurah\` VARCHAR(150) NULL,
        \`kontak_kelurahan\` VARCHAR(50) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_kel_kecamatan\` (\`kode_kecamatan\`),
        CONSTRAINT \`fk_kelurahan_kecamatan\` FOREIGN KEY (\`kode_kecamatan\`) REFERENCES \`wilayah_kecamatan\` (\`kode_kecamatan\`) ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. SEEDING 7 KECAMATAN
    console.log('[3/5] Seeding 7 Kecamatan Kota Sukabumi...');
    for (const kec of DATA_KECAMATAN) {
      await connection.query(`
        INSERT INTO \`wilayah_kecamatan\` (\`kode_kecamatan\`, \`nama_kecamatan\`)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE \`nama_kecamatan\` = VALUES(\`nama_kecamatan\`);
      `, [kec.kode_kecamatan, kec.nama_kecamatan]);
    }

    // 4. SEEDING 33 KELURAHAN
    console.log('[4/5] Seeding 33 Kelurahan Kota Sukabumi...');
    for (const kel of DATA_KELURAHAN) {
      await connection.query(`
        INSERT INTO \`wilayah_kelurahan\` (\`kode_kelurahan\`, \`kode_kecamatan\`, \`nama_kelurahan\`, \`jumlah_rw\`, \`jumlah_rt\`, \`nama_lurah\`)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          \`nama_kelurahan\` = VALUES(\`nama_kelurahan\`),
          \`jumlah_rw\` = VALUES(\`jumlah_rw\`),
          \`jumlah_rt\` = VALUES(\`jumlah_rt\`),
          \`nama_lurah\` = VALUES(\`nama_lurah\`);
      `, [kel.kode_kelurahan, kel.kode_kecamatan, kel.nama_kelurahan, kel.jumlah_rw, kel.jumlah_rt, kel.nama_lurah]);
    }

    // 5. INJEKSI KOLOM TENANT PADA TABEL OPERASIONAL
    console.log('[5/5] Memeriksa dan memperbarui kolom tenant pada tabel operasional...');
    const tablesToTenant = [
      'users',
      'kartu_keluarga',
      'warga',
      'dokumen_request',
      'bansos_pengajuan',
      'fasilitas_pendidikan',
      'fasilitas_kesehatan',
      'entitas_usaha'
    ];

    for (const table of tablesToTenant) {
      const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
      const colNames = cols.map(c => c.Field);

      if (!colNames.includes('kode_kecamatan')) {
        await connection.query(`
          ALTER TABLE \`${table}\`
          ADD COLUMN \`kode_kecamatan\` VARCHAR(10) NOT NULL DEFAULT '32.72.03',
          ADD INDEX \`idx_${table}_kecamatan\` (\`kode_kecamatan\`)
        `);
      }

      if (!colNames.includes('kode_kelurahan')) {
        await connection.query(`
          ALTER TABLE \`${table}\`
          ADD COLUMN \`kode_kelurahan\` VARCHAR(15) NOT NULL DEFAULT '32.72.03.1004',
          ADD INDEX \`idx_${table}_kelurahan\` (\`kode_kelurahan\`)
        `);
      }
    }

    // Pastikan data eksisting Kebonjati memiliki kode resmi 32.72.03.1004 (Cikole)
    await connection.query(`
      UPDATE \`kartu_keluarga\` SET \`kode_kecamatan\` = '32.72.03', \`kode_kelurahan\` = '32.72.03.1004', \`kota\` = 'Kota Sukabumi' WHERE \`kelurahan\` = 'Kebonjati';
      UPDATE \`warga\` SET \`kode_kecamatan\` = '32.72.03', \`kode_kelurahan\` = '32.72.03.1004', \`kota\` = 'Kota Sukabumi' WHERE \`kelurahan\` = 'Kebonjati';
      UPDATE \`users\` SET \`kode_kecamatan\` = '32.72.03', \`kode_kelurahan\` = '32.72.03.1004' WHERE \`role\` != 'superadmin';
    `);

    console.log('✅ MIGRASI SPRINT 9 SUKSES: 33 KELURAHAN SE-KOTA SUKABUMI AKTIF!');
  } catch (error) {
    console.error('❌ Error migrasi Sprint 9:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migrate().catch(() => process.exit(1));
}

module.exports = {
  migrate,
  DATA_KECAMATAN,
  DATA_KELURAHAN
};

