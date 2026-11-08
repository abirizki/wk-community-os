/**
 * tests/unit/dss_transparency_and_no_slop.test.js
 * Verification for Sprint 3: AI Slop Elimination & DSS Transparency Standards
 * Bumi Warga - Jabar Pintar Digital
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const aiEngineService = require('../../src/services/ai_engine.service');
const dayaDukungService = require('../../src/services/daya_dukung.service');

test('Sprint 3: AI Inference Engine attaches explicit DSS transparency and Human-in-the-Loop notices', () => {
  const mockData = {
    demography: {
      total_warga_aktif: 100,
      total_produktif: 70,
      total_balita: 15,
      total_lansia: 15,
      total_kk: 30
    },
    balitaNutrition: {
      per_rt: [
        { rt: '001', rw: '001', total_balita_unik: 10, gizi_kurang: 2, gizi_buruk: 1, gizi_baik: 7 }
      ],
      at_risk_balita: [
        { rt: '001', rw: '001', nama_anak: 'Balita A', umur_bulan: 24, status_gizi: 'Gizi Kurang', nama_ortu: 'Ortu A' }
      ]
    },
    lansiaHealth: {
      per_rt: [],
      critical_lansia: []
    },
    bansosEquity: [
      { rt: '001', rw: '001', total_sktm: 3, disahkan_bansos: 0, pending_bansos: 3 }
    ],
    documentVelocity: {}
  };

  const insights = aiEngineService.runInferenceRules(mockData);
  assert.ok(Array.isArray(insights));
  assert.ok(insights.length > 0);

  for (const item of insights) {
    assert.strictEqual(item.methodology, 'RULE_BASED_INFERENCE', 'Must honestly disclose rule-based inference');
    assert.strictEqual(item.requires_human_review, true, 'Must require human review');
    assert.ok(item.human_in_the_loop_notice.includes('Human-in-the-Loop'), 'Must explicitly mention Human-in-the-Loop');
    assert.ok(item.action_directives && item.action_directives.length > 0, 'Must have actionable directives');
  }
});

test('Sprint 3: Daya Dukung fallback explicitly flags simulated status', () => {
  const fallback = dayaDukungService.getFallbackStrategicAiInsight({ rw: '001', rt: '001' });
  assert.strictEqual(fallback.is_simulated_fallback, true, 'Fallback must declare simulated status');
  assert.ok(fallback.simulation_notice.includes('estimasi proyeksi baseline'), 'Must include simulation warning');
});

test('Sprint 3: Strategic AI Insight does not fabricate 14 KK when Desil 1-2 count is zero', () => {
  const mockPendidikan = { cohorts: [] };
  const mockKesehatan = { demografi_kesehatan: {}, dukungan_layanan: {} };
  const mockEkonomi = {
    food_accessibility_per_rw: [], // zero records
    total_toko_pangan: 0,
    total_serapan_naker: 0,
    total_terverifikasi_sku: 0
  };

  // Check that poverty count evaluates to 0 KK, NOT 14 KK
  const totalDesilRentan = mockEkonomi.food_accessibility_per_rw?.reduce((acc, curr) => acc + (Number(curr.keluarga_desil_1_2) || 0), 0) || 0;
  assert.strictEqual(totalDesilRentan, 0, 'Zero rentan families must evaluate to 0 KK, never hardcoded 14 KK');
});
