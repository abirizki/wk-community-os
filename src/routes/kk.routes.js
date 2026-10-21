/**
 * src/routes/kk.routes.js
 * Kartu Keluarga API Endpoints
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const kkService = require('../services/kk.service');
const { requireAuth, requireFamilyOrStaffScope } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/kk/my/card - Kartu Keluarga Digital untuk akun yang sedang login (Anti-IDOR)
router.get(['/my/card', '/me', '/my'], requireAuth, async (req, res) => {
  try {
    const card = await kkService.getMyFamilyCard(req.session.user);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat Kartu Keluarga' });
  }
});

// GET /api/kk/verify/:noKk - Verifikasi Publik Kartu Keluarga Digital (Scan QR Code Tanpa Login)
router.get(['/verify/:noKk', '/public-verify/:noKk'], async (req, res) => {
  try {
    const { noKk } = req.params;
    const verification = await kkService.getPublicFamilyCardVerification(noKk);
    res.json({ success: true, valid: true, data: verification });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      valid: false,
      message: error.message || 'Gagal memverifikasi keabsahan Kartu Keluarga.'
    });
  }
});

// GET /api/kk/:noKk - Cari KK spesifik (Anti-IDOR: dilindungi Scope Guard)
router.get('/:noKk', requireAuth, requireFamilyOrStaffScope('noKk'), async (req, res) => {
  try {
    const { noKk } = req.params;
    const kk = await kkService.getByNoKk(noKk);
    
    res.json({
      success: true,
      data: kk
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/kk/download/template - Unduh struktur kolom CSV template Kemendagri
router.get('/download/template', requireAuth, (req, res) => {
  const headers = [
    'no_kk',
    'kepala_keluarga',
    'alamat',
    'rt',
    'rw',
    'nik',
    'nama',
    'jenis_kelamin',
    'tempat_lahir',
    'tanggal_lahir',
    'agama',
    'pendidikan',
    'pekerjaan',
    'status_perkawinan',
    'status_hubungan_keluarga',
    'golongan_darah',
    'nama_ibu',
    'kategori_asuransi',
    'nomor_asuransi',
    'no_telepon'
  ];

  const sampleRow1 = [
    '3273010101900001',
    'Budi Santoso',
    'Jl. Kebonjati No. 12',
    '001',
    '001',
    '3273010203850003',
    'Budi Santoso',
    'L',
    'Bandung',
    '1985-03-02',
    'Islam',
    'S1',
    'Karyawan Swasta',
    'Kawin',
    'Kepala Keluarga',
    'O',
    'Haryati',
    'BPJS Kesehatan Mandiri',
    '0001234567891',
    '081234567890'
  ];

  const sampleRow2 = [
    '3273010101900001',
    'Budi Santoso',
    'Jl. Kebonjati No. 12',
    '001',
    '001',
    '3273014506880002',
    'Siti Aminah',
    'P',
    'Bandung',
    '1988-06-05',
    'Islam',
    'D3',
    'Wiraswasta',
    'Kawin',
    'Istri',
    'A',
    'Rukmini',
    'BPJS Kesehatan Mandiri',
    '0001234567892',
    '081234567891'
  ];

  const csvContent = [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template_import_kk_kemendagri.csv"');
  res.status(200).send(csvContent);
});

// POST /api/kk/bulk-import - Input data KK secara massal (Admin Kelurahan, Lurah, Superadmin)
router.post('/bulk-import', requireAuth, async (req, res) => {
  try {
    const allowedRoles = ['superadmin', 'admin_kelurahan', 'admin', 'lurah', 'staf_kelurahan'];
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ success: false, message: 'Hanya Admin Kelurahan atau Superadmin yang berwenang melakukan impor data KK massal.' });
    }

    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar data baris KK tidak boleh kosong.' });
    }

    const result = await kkService.bulkImport(rows, req.session.user);
    res.json(result);
  } catch (error) {
    console.error('Bulk import KK error:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal mengimpor data KK massal' });
  }
});

module.exports = router;
