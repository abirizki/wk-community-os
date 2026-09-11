/**
 * src/routes/analytics.routes.js
 * API Endpoints for AI Decision Support & Executive Leadership Analytics
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const express = require('express');
const aiEngineService = require('../services/ai_engine.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/analytics/executive-summary - Ringkasan Eksekutif & Matriks Kewilayahan
router.get('/executive-summary', requireAuth, async (req, res) => {
  try {
    const summary = await aiEngineService.getExecutiveSummary(req.session.user);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal memuat ringkasan eksekutif'
    });
  }
});

// GET /api/analytics/ai-insights - Rekomendasi Cerdas AI Terperinci
router.get('/ai-insights', requireAuth, async (req, res) => {
  try {
    const insights = await aiEngineService.getAIInsights(req.session.user);
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal memuat rekomendasi AI'
    });
  }
});

module.exports = router;

