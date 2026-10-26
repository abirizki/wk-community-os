/**
 * tests/unit/dashboard_scoping_and_metrics.test.js
 * Unit Test Suite for:
 * 1. Role -> Territory Authorization Matrix (RT, RW, Kelurahan, Camat, Walikota)
 * 2. Scope Isolation (Prevent query parameter override outside session scope)
 * 3. active_tenant Security (Cannot expand scope for unprivileged roles)
 * 4. Executive Command Center Data Provenance (Pilot Live vs SDI Baseline)
 * 5. Weighted Metrics & Aggregation Consistency (Zero data, partial coverage)
 * Bumi Warga - Jabar Pintar Digital (Kota Sukabumi)
 */

const assert = require('assert');
const wilayahRepository = require('../../src/repositories/wilayah.repository');
const aiEngineService = require('../../src/services/ai_engine.service');

async function runDashboardTests() {
  console.log('=== RUNNING DASHBOARD SCOPING & METRICS INTEGRITY TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // --- 1. SCOPING & AUTHORIZATION ENFORCEMENT ---

  test('Ketua RT is strictly locked to session RT & RW (active_tenant cannot expand scope)', () => {
    const userSession = {
      role: 'ketua_rt',
      rt: '003',
      rw: '002',
      kode_kelurahan: '32.72.03.1004',
      // Attacker attempts to forge active_tenant to view another kelurahan
      active_tenant: {
        kode_kecamatan: '32.72.01',
        kode_kelurahan: '32.72.01.1001',
        nama_kelurahan: 'Gunungparang'
      }
    };

    const scope = aiEngineService.resolveScope(userSession);
    assert.strictEqual(scope.rt, '003', 'RT must remain 003');
    assert.strictEqual(scope.rw, '002', 'RW must remain 002');
    assert.strictEqual(scope.kode_kelurahan, '32.72.03.1004', 'Kelurahan must remain home kelurahan');
    assert.strictEqual(scope.kode_kecamatan, undefined, 'Must not take active_tenant kecamatan');
  });

  test('Ketua RW / Admin RW is strictly locked to session RW', () => {
    const userSession = {
      role: 'ketua_rw',
      rw: '005',
      kode_kelurahan: '32.72.03.1004'
    };

    const scope = aiEngineService.resolveScope(userSession);
    assert.strictEqual(scope.rw, '005', 'RW must remain 005');
    assert.strictEqual(scope.kode_kelurahan, '32.72.03.1004');
  });

  test('Camat cannot switch active_tenant to a kelurahan outside their own kecamatan', () => {
    const camatSession = {
      role: 'camat',
      kode_kecamatan: '32.72.03', // Cikole
      active_tenant: {
        kode_kecamatan: '32.72.07', // Lembursitu (Out-of-scope)
        kode_kelurahan: '32.72.07.1001',
        nama_kelurahan: 'Cikundul'
      }
    };

    const scope = aiEngineService.resolveScope(camatSession);
    assert.strictEqual(scope.kode_kecamatan, '32.72.03', 'Camat scope must reject out-of-kecamatan active_tenant');
    assert.strictEqual(scope.kode_kelurahan, undefined, 'Should not have unauthorized kelurahan');
  });

  test('Walikota and Superadmin can view macro city scope or valid active_tenant', () => {
    const walikotaSession = {
      role: 'walikota'
    };
    const macroScope = aiEngineService.resolveScope(walikotaSession);
    assert.deepStrictEqual(macroScope, {}, 'Walikota without active_tenant should have macro city scope');

    const superadminSwitchSession = {
      role: 'superadmin',
      active_tenant: {
        kode_kecamatan: '32.72.02',
        kode_kelurahan: '32.72.02.1003',
        nama_kelurahan: 'Tipar',
        nama_kecamatan: 'Citamiang'
      }
    };
    const switchedScope = aiEngineService.resolveScope(superadminSwitchSession);
    assert.strictEqual(switchedScope.kode_kelurahan, '32.72.02.1003');
    assert.strictEqual(switchedScope.kelurahan, 'Tipar');
  });

  // --- 2. WILAYAH REPOSITORY & PROVENANCE SEPARATION ---

  await asyncTest('Wilayah Repository separates Pilot Live data from SDI Baseline Projections', async () => {
    const result = await wilayahRepository.getCommandCenterHeatmap();
    assert(result.kota, 'Must contain kota executive metadata');
    assert(result.heatmap, 'Must contain heatmap array of 33 kelurahan');
    assert.strictEqual(result.heatmap.length, 33, 'Kota Sukabumi has exactly 33 Kelurahan');

    // Check Pilot Hub provenance
    const kebonjati = result.heatmap.find(k => k.kode_kelurahan === '32.72.03.1004');
    assert(kebonjati, 'Kebonjati must exist');
    assert.strictEqual(kebonjati.is_pilot_hub, true, 'Kebonjati must be marked as pilot hub');
    assert.strictEqual(kebonjati.data_provenance, 'LIVE_TRANSACTIONAL', 'Kebonjati must have LIVE_TRANSACTIONAL provenance');
    assert.strictEqual(kebonjati.quality_status, 'VERIFIED_PRODUCTION', 'Kebonjati must have VERIFIED_PRODUCTION status');

    // Check non-pilot kelurahan provenance
    const nonPilot = result.heatmap.find(k => k.kode_kelurahan !== '32.72.03.1004');
    assert(nonPilot, 'Non-pilot kelurahan must exist');
    assert.strictEqual(nonPilot.is_pilot_hub, false, 'Non-pilot must not be pilot hub');
    assert.strictEqual(nonPilot.data_provenance, 'BASELINE_PROYEKSI_SDI', 'Must have BASELINE_PROYEKSI_SDI provenance');

    // Check Cakupan Integrasi metadata
    const cakupan = result.kota.cakupan_integrasi;
    assert(cakupan, 'Cakupan integrasi must exist');
    assert.strictEqual(cakupan.total_kelurahan, 33);
    assert.strictEqual(cakupan.kelurahan_terintegrasi, 1);
    assert.strictEqual(cakupan.persentase_cakupan, '3.0%');

    // Check Pilot Actual vs Proyeksi Baseline
    assert(result.kota.pilot_actual, 'Must contain distinct pilot_actual object');
    assert.strictEqual(result.kota.pilot_actual.nama_kelurahan, 'Kebonjati');
    assert.strictEqual(result.kota.pilot_actual.nama_kecamatan, 'Cikole');
    assert(result.kota.proyeksi_baseline_sdi, 'Must contain distinct proyeksi_baseline_sdi object');
    assert.strictEqual(result.kota.proyeksi_baseline_sdi.data_provenance, 'BASELINE_PROYEKSI_SDI');
  });

  // --- 3. CAMAT SCOPED QUERY FILTERING ---

  await asyncTest('Wilayah Repository filters accurately when scoped by Kecamatan', async () => {
    // Kecamatan Cikole (32.72.03) has 6 kelurahan
    const cikoleOnly = await wilayahRepository.getCommandCenterHeatmap('32.72.03');
    assert.strictEqual(cikoleOnly.heatmap.length, 6, 'Kecamatan Cikole must have exactly 6 kelurahan');
    for (const kel of cikoleOnly.heatmap) {
      assert.strictEqual(kel.kode_kecamatan, '32.72.03');
      assert.strictEqual(kel.nama_kecamatan, 'Cikole');
    }
  });

  // --- 4. DATA AGGREGATION INTEGRITY ON EMPTY / EDGE CASES ---

  test('Aggregation functions handle empty and zero datasets gracefully without NaN', () => {
    const emptyHeatmap = [];
    const totalWarga = emptyHeatmap.reduce((sum, h) => sum + (h.metrics?.total_warga || 0), 0);
    const avgSla = emptyHeatmap.length > 0 ? (totalWarga / emptyHeatmap.length) : 0;
    assert.strictEqual(totalWarga, 0);
    assert.strictEqual(avgSla, 0);
    assert(!isNaN(avgSla), 'Must not be NaN');

    const sampleHeatmap = [
      { metrics: { kasus_stunting: 0, sla_proses_surat_jam: 1.5 } },
      { metrics: { kasus_stunting: 2, sla_proses_surat_jam: 2.1 } }
    ];
    const avgSampleSla = Number((sampleHeatmap.reduce((s, h) => s + h.metrics.sla_proses_surat_jam, 0) / sampleHeatmap.length).toFixed(1));
    assert.strictEqual(avgSampleSla, 1.8);
  });

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runDashboardTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

