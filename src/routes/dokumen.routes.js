/**
 * src/routes/dokumen.routes.js
 * Dokumen Request API endpoints (Pelayanan Surat Kelurahan & Event Triggers).
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const dokumenService = require('../services/dokumen.service');
const dokumenRepository = require('../repositories/dokumen.repository');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/dokumen/verify/:hash - Verifikasi Publik TTE QR Code Resmi (Tanpa Login)
router.get('/verify/:hash', async (req, res) => {
  try {
    const hash = req.params.hash;
    const doc = await dokumenRepository.findByHash(hash);
    if (!doc) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Dokumen atau QR Code TTE tidak ditemukan dalam pangkalan data resmi Kelurahan Kebonjati.'
      });
    }

    return res.json({
      success: true,
      valid: true,
      dokumen: {
        id: doc.id,
        nomor_surat: doc.nomor_surat,
        nomor_registrasi: doc.nomor_registrasi,
        jenis_dokumen: doc.jenis_dokumen,
        keperluan: doc.keperluan,
        nik_pemohon: doc.nik_pemohon,
        nama_pemohon: doc.nama_pemohon,
        rt: doc.rt,
        rw: doc.rw,
        kelurahan: doc.kelurahan || 'Kebonjati',
        kecamatan: doc.kecamatan || 'Cikole',
        kota: doc.kota || 'Kota Sukabumi',
        status: doc.status,
        approved_at: doc.approved_at,
        qr_code_hash: doc.qr_code_hash
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, valid: false, message: error.message });
  }
});

// GET /api/dokumen/prefill-data - AI Auto-Fill Data Profil Warga
router.get('/prefill-data', requireAuth, async (req, res) => {
  try {
    const data = await dokumenService.getPrefillData(req.session.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dokumen/family-members - Anggota keluarga 1 KK untuk pemohon surat
router.get('/family-members', requireAuth, async (req, res) => {
  try {
    const userRepository = require('../repositories/user.repository');
    const activeNik = req.session.user?.active_nik || req.session.user?.username;
    let noKK = req.session.user?.no_kk;

    if (!noKK && activeNik) {
      const warga = await userRepository.findWargaByNik(activeNik);
      if (warga) noKK = warga.no_kk;
    }

    if (!noKK) {
      return res.json({ success: true, data: [] });
    }

    const members = await userRepository.findFamilyMembersByNoKK(noKK);
    res.json({ success: true, data: members || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/dokumen - Warga mengajukan permohonan surat baru
router.post('/', requireAuth, async (req, res) => {
  try {
    const newDoc = await dokumenService.requestDokumen(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: 'Permohonan surat berhasil diajukan.',
      data: newDoc
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/dokumen/me - Warga melihat riwayat permohonan surat miliknya & keluarganya
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.active_nik || req.session.user.username;
    const docs = await dokumenService.getByNik(nik);
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/dokumen - Operator/RT/RW/Admin melihat permohonan surat sesuai hierarki
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.session.user.role === 'warga') {
      const nik = req.session.user.active_nik || req.session.user.username;
      const docs = await dokumenService.getByNik(nik);
      return res.json({ success: true, data: docs });
    }

    const docs = await dokumenService.listByScope(req.session.user, req.query);
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/dokumen/:id/approve - Persetujuan berjenjang (RT -> RW -> Kelurahan)
router.patch('/:id/approve', requireAuth, requireRole('ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin', 'lurah'), async (req, res) => {
  try {
    const { catatan } = req.body;
    const result = await dokumenService.approveDokumen(Number(req.params.id), req.session.user, catatan);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/dokumen/:id/emergency-bypass - Protokol Kedaruratan: Bypass Verifikasi RT oleh RW
router.post('/:id/emergency-bypass', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin'), async (req, res) => {
  try {
    const { emergency_reason, pin } = req.body;
    const result = await dokumenService.emergencyBypassRT(Number(req.params.id), req.session.user, emergency_reason, pin);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/dokumen/batch-approve - Pengesahan TTE Massal (QuickSignTray Lurah / Kelurahan)
router.post('/batch-approve', requireAuth, requireRole('admin_kelurahan', 'superadmin', 'admin', 'lurah'), async (req, res) => {
  try {
    const { ids, catatan, pin } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID dokumen tidak boleh kosong' });
    }
    const results = [];
    for (const docId of ids) {
      try {
        const r = await dokumenService.approveDokumen(Number(docId), req.session.user, catatan || 'Pengesahan TTE massal oleh Lurah');
        results.push({ id: docId, success: true, result: r });
      } catch (err) {
        results.push({ id: docId, success: false, error: err.message });
      }
    }
    const successCount = results.filter(r => r.success).length;
    res.json({
      success: true,
      message: `Berhasil mengesahkan ${successCount} dari ${ids.length} dokumen.`,
      data: results
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/dokumen/:id/reject - Penolakan permohonan surat
router.patch('/:id/reject', requireAuth, requireRole('ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin', 'lurah'), async (req, res) => {
  try {
    const { catatan } = req.body;
    const result = await dokumenService.rejectDokumen(Number(req.params.id), req.session.user, catatan);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/dokumen/:id/revise - Pengembalian surat untuk perbaikan / revisi (SOP Resmi)
router.patch('/:id/revise', requireAuth, requireRole('ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin', 'lurah'), async (req, res) => {
  try {
    const { catatan } = req.body;
    const result = await dokumenService.reviseDokumen(Number(req.params.id), req.session.user, catatan);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/dokumen/:id/status - Kompatibilitas mundur
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, catatan_admin } = req.body;
    if (status === 'APPROVED') {
      const result = await dokumenService.approveDokumen(Number(req.params.id), req.session.user, catatan_admin);
      return res.json(result);
    } else if (status === 'REJECTED') {
      const result = await dokumenService.rejectDokumen(Number(req.params.id), req.session.user, catatan_admin);
      return res.json(result);
    }
    res.json({ success: true, message: `Status diperbarui menjadi ${status}` });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/dokumen/:id/history - Riwayat jejak audit dokumen
router.get('/:id/history', requireAuth, async (req, res) => {
  try {
    const history = await dokumenRepository.getWorkflowHistory(Number(req.params.id));
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
