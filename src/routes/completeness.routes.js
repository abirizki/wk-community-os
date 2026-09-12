/**
 * src/routes/completeness.routes.js
 * API Endpoints for Data Completeness Scoring & Multi-Role AI Assistants
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const express = require('express');
const completenessService = require('../services/completeness.service');
const completenessRepository = require('../repositories/completeness.repository');
const wargaRepository = require('../repositories/warga.repository');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * 1. GET /api/completeness/my-score
 * Mengambil skor kelengkapan data profil warga login, rincian 4 pilar, dan saran AI
 */
router.get('/my-score', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    const targetNik = req.query.nik || user.active_nik || user.username;

    const rawData = await completenessRepository.getCitizenRawData(targetNik);
    if (!rawData || !rawData.warga) {
      return res.status(404).json({ success: false, message: 'Data kependudukan warga tidak ditemukan.' });
    }

    const evaluation = completenessService.calculateCitizenScore(
      rawData.warga,
      rawData.desil,
      rawData.posyanduBalita,
      rawData.posyanduLansia,
      rawData.user
    );

    // Update cache di background
    completenessRepository.updateScoreCache(targetNik, evaluation.total_score, evaluation.pillars);

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. GET /api/completeness/rt-readiness
 * Ringkasan statistik kesiapan dan skor kelengkapan data per RT
 */
router.get('/rt-readiness', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    const scope = {};

    if (user.role === 'ketua_rt') {
      scope.rt = user.rt;
      scope.rw = user.rw;
    } else if (user.role === 'ketua_rw' || user.role === 'admin_rw') {
      scope.rw = user.rw;
    }

    if (req.query.rt) scope.rt = req.query.rt;
    if (req.query.rw) scope.rw = req.query.rw;

    const stats = await completenessRepository.getRTReadinessStats(scope);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. GET /api/completeness/rw-leaderboard
 * Papan peringkat kematangan data antar RT
 */
router.get('/rw-leaderboard', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    let targetRw = req.query.rw || null;

    if (user.role === 'ketua_rt' || user.role === 'ketua_rw' || user.role === 'admin_rw') {
      targetRw = user.rw;
    }

    const leaderboard = await completenessRepository.getRWLeaderboard(targetRw);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 4. GET /api/completeness/door-to-door-nudge
 * AI Door-to-Door Nudge: Daftar prioritas warga/KK untuk dikunjungi RT Assisted Mode
 */
router.get('/door-to-door-nudge', requireAuth, requireRole(['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'kader_posyandu']), async (req, res) => {
  try {
    const user = req.session.user;
    const scope = {};

    if (user.role === 'ketua_rt') {
      scope.rt = user.rt;
      scope.rw = user.rw;
    } else if (user.role === 'ketua_rw' || user.role === 'admin_rw') {
      scope.rw = user.rw;
    }

    if (req.query.rt) scope.rt = req.query.rt;
    if (req.query.rw) scope.rw = req.query.rw;

    const wargaRows = await completenessRepository.getWargaForAudit(scope, 150);
    
    // Evaluasi skor untuk masing-masing warga
    const wargaWithScores = wargaRows.map(w => {
      const umurTahun = w.tanggal_lahir 
        ? Math.floor((new Date() - new Date(w.tanggal_lahir)) / (365.25 * 24 * 60 * 60 * 1000))
        : 30;

      const evalResult = completenessService.calculateCitizenScore(w, {
        desil_saat_ini: w.desil_saat_ini,
        desil_usulan: w.desil_usulan
      });

      return {
        ...evalResult,
        umurTahun
      };
    });

    const nudgeList = completenessService.buildDoorToDoorNudgeList(wargaWithScores);

    res.json({
      success: true,
      data: nudgeList,
      total_needs_visit: nudgeList.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 5. GET /api/completeness/anomalies
 * AI Anomaly Detection: Peringatan anomali data kependudukan
 */
router.get('/anomalies', requireAuth, requireRole(['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin']), async (req, res) => {
  try {
    const user = req.session.user;
    const scope = {};

    if (user.role === 'ketua_rt') {
      scope.rt = user.rt;
      scope.rw = user.rw;
    } else if (user.role === 'ketua_rw' || user.role === 'admin_rw') {
      scope.rw = user.rw;
    }

    const wargaRows = await completenessRepository.getWargaForAudit(scope, 250);
    const anomalies = completenessService.detectAnomalies(wargaRows);

    res.json({
      success: true,
      data: anomalies,
      total_anomalies: anomalies.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 6. GET /api/completeness/kelurahan-index
 * Indeks Kematangan Data Kelurahan dan Data Fidelity Confidence Score
 */
router.get('/kelurahan-index', requireAuth, async (req, res) => {
  try {
    const maturityIndex = await completenessRepository.getKelurahanDataMaturityIndex();
    const fidelity = completenessService.calculateDataFidelityConfidence(maturityIndex.overall_maturity_score);

    res.json({
      success: true,
      data: {
        ...maturityIndex,
        fidelity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 7. POST /api/completeness/recalculate-all
 * Batch recalculate skor kelengkapan warga
 */
router.post('/recalculate-all', requireAuth, requireRole(['admin_kelurahan', 'superadmin']), async (req, res) => {
  try {
    const wargaRows = await completenessRepository.getWargaForAudit({}, 500);
    let updatedCount = 0;

    for (const w of wargaRows) {
      const evalResult = completenessService.calculateCitizenScore(w, {
        desil_saat_ini: w.desil_saat_ini,
        desil_usulan: w.desil_usulan
      });
      await completenessRepository.updateScoreCache(w.nik, evalResult.total_score, evalResult.pillars);
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Berhasil memperbarui kalkulasi skor kelengkapan untuk ${updatedCount} data warga.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

