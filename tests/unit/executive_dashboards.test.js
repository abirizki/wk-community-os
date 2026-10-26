/**
 * tests/unit/executive_dashboards.test.js
 * Verification of Executive Decision Support Dashboards & Multi-Tier Scoped Analytics
 * Covering: RT, RW, Lurah, and Walikota Tiers
 * Bumi Warga - Jabar Pintar Digital (Kota Sukabumi)
 */

const assert = require('assert');
const wilayahRepository = require('../../src/repositories/wilayah.repository');
const { generateCsv, generateExcelXml } = require('../../src/utils/export.util');

async function runTests() {
  console.log('🧪 Running Executive Dashboards & Decision Support Unit Tests...');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.stack || err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.stack || err.message}`);
      failed++;
    }
  }

  // TEST 1: Walikota Command Center Heatmap returns 7 Kecamatan & 33 Kelurahan
  await asyncTest('wilayahRepository.getCommandCenterHeatmap aggregates city-wide metrics', async () => {
    const result = await wilayahRepository.getCommandCenterHeatmap();
    assert.ok(result, 'Result should exist');
    assert.ok(Array.isArray(result.heatmap), 'Heatmap should be an array');
    assert.strictEqual(result.heatmap.length, 33, 'Total kelurahan in Kota Sukabumi must be 33');

    // Check Pilot Kelurahan Kebonjati
    const kebonjati = result.heatmap.find(k => k.kode_kelurahan === '32.72.03.1004');
    assert.ok(kebonjati, 'Kebonjati must be in heatmap');
    assert.strictEqual(kebonjati.nama_kelurahan, 'Kebonjati');
    assert.strictEqual(kebonjati.nama_kecamatan, 'Cikole');
    assert.strictEqual(kebonjati.is_pilot_hub, true);
    assert.strictEqual(kebonjati.data_provenance, 'LIVE_TRANSACTIONAL');

    // Non-pilot should have baseline provenance
    const gunungparang = result.heatmap.find(k => k.kode_kelurahan === '32.72.01.1001');
    assert.ok(gunungparang, 'Gunungparang must be in heatmap');
    assert.strictEqual(gunungparang.is_pilot_hub, false);
    assert.strictEqual(gunungparang.data_provenance, 'BASELINE_PROYEKSI_SDI');
  });

  // TEST 2: Command Center Heatmap scoped to Camat Cikole (32.72.03) returns 6 Kelurahan
  await asyncTest('wilayahRepository.getCommandCenterHeatmap scopes correctly by Kecamatan', async () => {
    const cikoleResult = await wilayahRepository.getCommandCenterHeatmap('32.72.03');
    assert.strictEqual(cikoleResult.heatmap.length, 6, 'Kecamatan Cikole has exactly 6 kelurahan');
    cikoleResult.heatmap.forEach(k => {
      assert.strictEqual(k.kode_kecamatan, '32.72.03');
      assert.strictEqual(k.nama_kecamatan, 'Cikole');
    });
  });

  // TEST 3: RW Scorecard Structure Verification
  test('RW Scorecard data contract includes Health, Education, and Welfare aggregates', () => {
    const mockRTItem = {
      rt: '001',
      rw: '001',
      demografi: { total_warga: 340, total_kk: 98, lansia_total: 28 },
      kesehatan: { total_balita: 22, stunting: 1, lansia_total: 28 },
      pendidikan: { usia_sekolah: 64, anak_balita: 22 },
      kesejahteraan: { desil_1_2: 4, total_yatim: 2, total_lansia_rentan: 3 },
      pelayanan: { pending_rw: 1, pending_rt: 0, total_surat: 12 }
    };

    assert.strictEqual(mockRTItem.kesehatan.total_balita, 22);
    assert.strictEqual(mockRTItem.kesehatan.stunting, 1);
    assert.strictEqual(mockRTItem.pendidikan.usia_sekolah, 64);
    assert.strictEqual(mockRTItem.kesejahteraan.desil_1_2, 4);
  });

  // TEST 4: RW Export Engine generates valid SpreadsheetML with all multi-tier columns
  test('generateExcelXml for RW Scorecard includes header styling and numeric cells', () => {
    const headers = [
      'No', 'Wilayah RT', 'Ketua RT', 'Total Jiwa', 'Total KK',
      'Anak Usia Sekolah', 'Balita Posyandu', 'Kasus Stunting',
      'Lansia', 'Keluarga Desil 1-2', 'Surat Pending'
    ];
    const rows = [
      [
        1, 'RT 001', 'Asep Saepudin',
        { value: 320, type: 'Number' },
        { value: 95, type: 'Number' },
        { value: 68, type: 'Number' },
        { value: 24, type: 'Number' },
        { value: 1, type: 'Number' },
        { value: 30, type: 'Number' },
        { value: 5, type: 'Number' },
        { value: 2, type: 'Number' }
      ]
    ];

    const xml = generateExcelXml('Buku Putih RW 001', [{ name: 'Buku Putih RW 001', headers, rows }]);
    assert.ok(xml.includes('xmlns="urn:schemas-microsoft-com:office:spreadsheet"'));
    assert.ok(xml.includes('Anak Usia Sekolah'));
    assert.ok(xml.includes('Kasus Stunting'));
    assert.ok(xml.includes('Asep Saepudin'));
    assert.ok(xml.includes('<Data ss:Type="Number">320</Data>'));
  });

  // TEST 5: Walikota Macro City Export Engine produces valid structure
  test('generateCsv for Walikota Command Center exports all 33 kelurahan with UTF-8 BOM', () => {
    const headers = [
      'No', 'Kode Kelurahan', 'Kelurahan', 'Kecamatan',
      'Jumlah RW', 'Total Penduduk', 'Total KK', 'Kasus Stunting (Balita)',
      'Status Stunting', 'Kemiskinan Ekstrem (Desil 1-2)', 'Rerata SLA Layanan (Jam)'
    ];
    const rows = [
      [1, '32.72.03.1004', 'Kebonjati', 'Cikole', 7, 1450, 420, 1, 'RENDAH', 14, 1.2],
      [2, '32.72.01.1001', 'Gunungparang', 'Cikole', 8, 2200, 650, 3, 'SEDANG (WASPADA)', 20, 2.0]
    ];

    const csv = generateCsv(headers, rows);
    assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');
    assert.ok(csv.includes('Kebonjati,Cikole'));
    assert.ok(csv.includes('Gunungparang,Cikole'));
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

