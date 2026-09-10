const pool = require('d:/wk_prod/src/db/pool');

async function migratePhase4() {
  try {
    console.log('Migrating Phase 4: dokumen_request updates & bansos_pengajuan...');

    // 1. Check & ensure columns on dokumen_request
    try {
      await pool.query(`
        ALTER TABLE \`dokumen_request\`
        ADD COLUMN IF NOT EXISTS \`jenis_dokumen\` VARCHAR(100) NULL AFTER \`nik_pemohon\`,
        ADD COLUMN IF NOT EXISTS \`rt\` VARCHAR(5) NULL AFTER \`keperluan\`,
        ADD COLUMN IF NOT EXISTS \`rw\` VARCHAR(5) NULL AFTER \`rt\`,
        ADD COLUMN IF NOT EXISTS \`approved_at\` TIMESTAMP NULL AFTER \`approved_by_kelurahan\`,
        ADD COLUMN IF NOT EXISTS \`catatan_admin\` TEXT NULL AFTER \`catatan_petugas\`,
        ADD COLUMN IF NOT EXISTS \`file_hasil\` VARCHAR(255) NULL AFTER \`file_url\`;
      `);
      console.log('dokumen_request columns verified.');
    } catch (e) {
      console.log('dokumen_request alter notice:', e.message);
    }

    // 2. Create bansos_pengajuan table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`bansos_pengajuan\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nomor_pengajuan\` VARCHAR(50) NOT NULL UNIQUE,
        \`no_kk\` VARCHAR(16) NOT NULL,
        \`nik_penerima\` VARCHAR(16) NOT NULL,
        \`nama_penerima\` VARCHAR(150) NOT NULL,
        \`jenis_bansos\` ENUM('PKH', 'BPNT', 'BLT BBM', 'Bantuan Lansia', 'Bantuan Balita Stunting', 'SKTM') NOT NULL,
        \`alasan_pengajuan\` TEXT NOT NULL,
        \`nominal_bantuan\` DECIMAL(12,2) NULL DEFAULT 0.00,
        \`status\` ENUM('PENDING_RT', 'PENDING_RW', 'PENDING_KELURAHAN', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_RT',
        \`approval_step\` ENUM('RT', 'RW', 'KELURAHAN', 'COMPLETED') NOT NULL DEFAULT 'RT',
        \`rt\` VARCHAR(5) NOT NULL,
        \`rw\` VARCHAR(5) NOT NULL,
        \`diajukan_oleh_user_id\` INT NULL,
        \`diverifikasi_oleh_user_id\` INT NULL,
        \`disahkan_oleh_user_id\` INT NULL,
        \`catatan_verifikasi\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_bansos_kk\` (\`no_kk\`),
        INDEX \`idx_bansos_nik\` (\`nik_penerima\`),
        INDEX \`idx_bansos_rt_rw\` (\`rt\`, \`rw\`),
        INDEX \`idx_bansos_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('bansos_pengajuan table verified.');

    // 3. Seed sample bansos
    await pool.query(`
      INSERT INTO \`bansos_pengajuan\` (\`id\`, \`nomor_pengajuan\`, \`no_kk\`, \`nik_penerima\`, \`nama_penerima\`, \`jenis_bansos\`, \`alasan_pengajuan\`, \`nominal_bantuan\`, \`status\`, \`approval_step\`, \`rt\`, \`rw\`, \`catatan_verifikasi\`) VALUES
        (1, 'BS-2026-001', '3273010101900001', '3273011005500012', 'H. Soleh Santoso', 'Bantuan Lansia', 'Warga lansia berumur 76 tahun dengan riwayat hipertensi memerlukan asupan nutrisi tambahan dan obat berkala.', 600000.00, 'APPROVED', 'COMPLETED', '001', '001', 'Disetujui berdasarkan data posyandu lansia dan kondisi ekonomi keluarga.'),
        (2, 'BS-2026-002', '3273014504900002', '3273014504900004', 'Siti Rahayu', 'Bantuan Balita Stunting', 'Pengajuan PMT (Pemberian Makanan Tambahan) pemulihan gizi protein hewani untuk balita.', 450000.00, 'PENDING_RW', 'RW', '002', '001', 'Diusulkan oleh Ketua RT 002.')
      ON DUPLICATE KEY UPDATE \`nama_penerima\` = VALUES(\`nama_penerima\`);
    `);
    console.log('Sample bansos seeded.');

  } catch (err) {
    console.error('Migration Phase 4 failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migratePhase4();

