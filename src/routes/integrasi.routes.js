/**
 * src/routes/integrasi.routes.js
 * API Endpoints for Ecosystem Integration: DUKCAPIL Kemendagri & SAPAWARGA / SATU DATA JABAR
 * Jabar Pintar Digital
 */

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const dukcapilService = require('../services/dukcapil.service');
const sapawargaService = require('../services/sapawarga.service');

const router = express.Router();

/**
 * Middleware untuk Partner API Gateway yang diamankan dengan API Key JDS
 */
const requirePartnerApiKey = (requiredScope = null) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers['x-api-key'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED_PARTNER',
        message: 'Header Authorization (Bearer API_KEY) atau X-API-Key wajib disertakan untuk mengakses API Mitra Pemda'
      });
    }

    const validation = await sapawargaService.validateApiKey(authHeader, requiredScope);
    if (!validation.isValid) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_SCOPE',
        message: validation.reason,
        partner: validation.partnerName
      });
    }

    req.partner = {
      name: validation.partnerName,
      scopes: validation.scopes
    };
    next();
  };
};

// =======================================================================
// 1. DUKCAPIL KEMENDAGRI ADAPTER ENDPOINTS (Kepatuhan Permendagri 102/2019 & UU PDP)
// =======================================================================

// POST /api/integrasi/dukcapil/verify-nik - NIK Matching Web Service
router.post('/dukcapil/verify-nik', requireAuth, async (req, res) => {
  try {
    const { nik, nama, tanggal_lahir } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const result = await dukcapilService.verifyNikMatching({ nik, nama, tanggal_lahir }, req.user, ipAddress);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error Dukcapil verify-nik:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/integrasi/dukcapil/verify-biometric - Biometric Face Recognition (Zero Data Hoarding)
router.post('/dukcapil/verify-biometric', requireAuth, async (req, res) => {
  try {
    const { nik, face_image_base64 } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const result = await dukcapilService.verifyBiometricFace({ nik, face_image_base64 }, req.user, ipAddress);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error Dukcapil verify-biometric:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/integrasi/dukcapil/check-kematian - Registry Cek Kematian
router.post('/dukcapil/check-kematian', requireAuth, async (req, res) => {
  try {
    const { nik } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const result = await dukcapilService.checkStatusKematian({ nik }, req.user, ipAddress);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error Dukcapil check-kematian:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/integrasi/dukcapil/logs - Audit Trail Log Verifikasi UU PDP
router.get('/dukcapil/logs', requireAuth, async (req, res) => {
  try {
    const { limit, nik } = req.query;
    const logs = await dukcapilService.getAuditLogs({ limit, nik });
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching Dukcapil logs:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat log audit Dukcapil' });
  }
});

// =======================================================================
// 2. SAPAWARGA & SATU DATA JABAR INTERNAL MANAGEMENT ENDPOINTS
// =======================================================================

// POST /api/integrasi/sapawarga/sso - Exchange SSO Token dari Sapawarga Mobile
router.post('/sapawarga/sso', async (req, res) => {
  try {
    const { sso_token } = req.body;
    const result = await sapawargaService.handleSapawargaSSO(sso_token);
    if (req.session && result.user) {
      req.session.user = result.user;
    }
    res.json(result);
  } catch (err) {
    console.error('Error Sapawarga SSO:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/integrasi/partner/keys - Daftar Kredensial API Mitra (Admin Only)
router.get('/partner/keys', requireAuth, requireRole('superadmin', 'admin_kelurahan'), async (req, res) => {
  try {
    const keys = await sapawargaService.getPartnerKeys();
    res.json({ success: true, data: keys });
  } catch (err) {
    console.error('Error fetching partner keys:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar kunci partner' });
  }
});

// POST /api/integrasi/partner/webhook/test - Trigger Test Webhook Dispatch
router.post('/partner/webhook/test', requireAuth, requireRole('superadmin', 'admin_kelurahan'), async (req, res) => {
  try {
    const { event_type, payload, target_partner } = req.body;
    const result = await sapawargaService.dispatchWebhookEvent(
      event_type || 'SURAT_APPROVED',
      payload || { test: true, timestamp: new Date().toISOString() },
      target_partner || 'SAPAWARGA_JABAR'
    );
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error dispatching test webhook:', err);
    res.status(500).json({ success: false, message: 'Gagal mengirim webhook' });
  }
});

// GET /api/integrasi/partner/webhook/logs - Log Webhook Dispatcher
router.get('/partner/webhook/logs', requireAuth, async (req, res) => {
  try {
    const { limit } = req.query;
    const logs = await sapawargaService.getWebhookLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching webhook logs:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat log webhook' });
  }
});

// GET /api/integrasi/satudata/export - Export Satu Data Jabar Aggregated JSON
router.get('/satudata/export', requireAuth, async (req, res) => {
  try {
    const { kode_kota } = req.query;
    const payload = await sapawargaService.exportSatuDataJabarPayload(kode_kota || '32.72');
    res.json({ success: true, data: payload });
  } catch (err) {
    console.error('Error generating Satu Data Jabar export:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data Satu Data Jabar' });
  }
});

// =======================================================================
// 3. PARTNER GATEWAY (Protected by Bearer API Key & Scopes)
// =======================================================================
// 3. PARTNER GATEWAY (Protected by Bearer API Key & Scopes)
// =======================================================================
const partnerRouter = express.Router();

// GET /sapawarga/surat/status/:nik
partnerRouter.get('/sapawarga/surat/status/:nik', requirePartnerApiKey('read:surat'), async (req, res) => {
  try {
    const { nik } = req.params;
    const records = await sapawargaService.getSuratStatusForSapawarga(nik);
    res.json({
      success: true,
      partner: req.partner.name,
      nik,
      data: records
    });
  } catch (err) {
    console.error('Partner gateway error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /sapawarga/bansos/status/:nik
partnerRouter.get('/sapawarga/bansos/status/:nik', requirePartnerApiKey('read:bansos'), async (req, res) => {
  try {
    const { nik } = req.params;
    const records = await sapawargaService.getBansosStatusForSapawarga(nik);
    res.json({
      success: true,
      partner: req.partner.name,
      nik,
      data: records
    });
  } catch (err) {
    console.error('Partner gateway error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /satudata/demography-aggregate
partnerRouter.get('/satudata/demography-aggregate', requirePartnerApiKey('read:demography_aggregate'), async (req, res) => {
  try {
    const { kode_kota } = req.query;
    const payload = await sapawargaService.exportSatuDataJabarPayload(kode_kota || '32.72');
    res.json({
      success: true,
      partner: req.partner.name,
      data: payload
    });
  } catch (err) {
    console.error('Partner gateway error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /satudata/push
partnerRouter.post('/satudata/push', requirePartnerApiKey('push:satudata'), async (req, res) => {
  try {
    const payload = await sapawargaService.exportSatuDataJabarPayload('32.72');
    const webhookLog = await sapawargaService.dispatchWebhookEvent('DESIL_UPDATED', {
      source: 'PORTAL_SATUDATA_PUSH',
      checksum: payload.metadata.checksum,
      total_kelurahan: payload.ringkasan_kota.total_kelurahan
    }, 'SATU_DATA_JABAR');

    res.json({
      success: true,
      message: 'Sinkronisasi paket data Satu Data Jabar berhasil dieksekusi',
      batch_id: webhookLog.id,
      timestamp: webhookLog.created_at,
      metadata: payload.metadata
    });
  } catch (err) {
    console.error('Partner gateway error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount partnerRouter under /v1/partner on main router
router.use('/v1/partner', partnerRouter);

module.exports = router;
module.exports.partnerRouter = partnerRouter;
module.exports.requirePartnerApiKey = requirePartnerApiKey;
