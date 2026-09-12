/**
 * scratch/test_multitenancy.js
 * Unit Test for Sprint 9: Multi-Tenancy Penuh Kota Sukabumi & Kesiapan Replikasi Jawa Barat
 * Jabar Pintar Digital
 */

const assert = require('assert');
const wilayahRepository = require('../src/repositories/wilayah.repository');
const aiEngineService = require('../src/services/ai_engine.service');

async function runTests() {
  console.log('=== RUNNING TESTS: SPRINT 9 MULTI-TENANCY KOTA SUKABUMI (32.72) ===\n');

  // -------------------------------------------------------------------------
  // TEST 1: Verifikasi Master Wilayah 7 Kecamatan & 33 Kelurahan
  // -------------------------------------------------------------------------
  console.log('[TEST 1] Verifikasi Kelengkapan 7 Kecamatan & 33 Kelurahan...');
  const kecamatanList = await wilayahRepository.getAllKecamatan();
  assert.strictEqual(kecamatanList.length, 7, 'Kota Sukabumi harus memiliki tepat 7 Kecamatan');

  const kelurahanList = await wilayahRepository.getAllKelurahan();
  assert.strictEqual(kelurahanList.length, 33, 'Kota Sukabumi harus memiliki tepat 33 Kelurahan');

  // Cek mapping pilot hub Kebonjati di Kecamatan Cikole
  const kebonjati = kelurahanList.find(k => k.kode_kelurahan === '32.72.03.1004');
  assert(kebonjati !== undefined, 'Kelurahan Kebonjati (32.72.03.1004) harus terdaftar');
  assert.strictEqual(kebonjati.nama_kelurahan, 'Kebonjati', 'Nama harus Kebonjati');
  assert.strictEqual(kebonjati.kode_kecamatan, '32.72.03', 'Kebonjati harus berada di Kec. Cikole (32.72.03)');
  console.log('  -> PASS: 7 Kecamatan dan 33 Kelurahan terverifikasi 100% lengkap.');

  // -------------------------------------------------------------------------
  // TEST 2: Verifikasi Executive Command Center Heatmap 33 Kelurahan
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Verifikasi Agregat Heatmap Command Center...');
  const commandResult = await wilayahRepository.getCommandCenterHeatmap();
  assert.strictEqual(commandResult.kota.kode_kota, '32.72', 'Kode kota harus 32.72');
  assert.strictEqual(commandResult.kota.nama_kota, 'Kota Sukabumi', 'Nama kota harus Kota Sukabumi');
  assert.strictEqual(commandResult.heatmap.length, 33, 'Heatmap harus memuat seluruh 33 Kelurahan');
  assert(commandResult.kota.kpi_agregat.total_penduduk > 80000, 'Total penduduk kota harus > 80.000 jiwa');
  assert(commandResult.kota.kpi_agregat.total_kk > 25000, 'Total KK kota harus > 25.000 KK');
  assert(commandResult.kota.kpi_agregat.rata_rata_kematangan_data >= 75, 'Rata-rata kematangan data harus >= 75%');
  assert(commandResult.kota.kpi_agregat.rata_rata_sla_jam > 0, 'Rata-rata SLA jam harus > 0');

  // Uji filter per kecamatan
  const cikoleOnly = await wilayahRepository.getCommandCenterHeatmap('32.72.03');
  assert.strictEqual(cikoleOnly.heatmap.length, 6, 'Kecamatan Cikole harus memiliki tepat 6 kelurahan');

  const barosOnly = await wilayahRepository.getCommandCenterHeatmap('32.72.05');
  assert.strictEqual(barosOnly.heatmap.length, 4, 'Kecamatan Baros harus memiliki tepat 4 kelurahan');
  console.log('  -> PASS: Kalkulasi heatmap agregat & filtering kecamatan berhasil.');

  // -------------------------------------------------------------------------
  // TEST 3: Verifikasi Row-Level Scoping & Isolasi Tenant
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Verifikasi Row-Level Scoping & Isolasi Tenant...');

  // User 1: Lurah Kebonjati
  const lurahKebonjatiUser = {
    role: 'admin_kelurahan',
    kode_kelurahan: '32.72.03.1004',
    nama: 'Ahmad Sofyan'
  };
  const scopeLurah = aiEngineService.resolveScope(lurahKebonjatiUser);
  assert.strictEqual(scopeLurah.kode_kelurahan, '32.72.03.1004', 'Lurah harus terkunci pada kelurahan bersangkutan');
  assert.strictEqual(scopeLurah.kode_kecamatan, undefined, 'Lurah tidak memiliki scope makro kecamatan');

  // User 2: Camat Cikole
  const camatCikoleUser = {
    role: 'camat',
    kode_kecamatan: '32.72.03',
    nama: 'Camat Cikole'
  };
  const scopeCamat = aiEngineService.resolveScope(camatCikoleUser);
  assert.strictEqual(scopeCamat.kode_kecamatan, '32.72.03', 'Camat harus mencakup kecamatannya');
  assert.strictEqual(scopeCamat.kode_kelurahan, undefined, 'Camat mencakup multi-kelurahan di kecamatannya');

  // User 3: Walikota Sukabumi (Superadmin Makro)
  const walikotaUser = {
    role: 'superadmin',
    nama: 'Walikota Sukabumi'
  };
  const scopeWalikota = aiEngineService.resolveScope(walikotaUser);
  assert.deepStrictEqual(scopeWalikota, {}, 'Walikota/Superadmin memiliki akses makro 33 kelurahan tanpa batas');

  // User 4: Walikota melakukan Simulasi Masuk Tenant Kelurahan Cisarua
  const walikotaSimulasiUser = {
    role: 'superadmin',
    nama: 'Walikota Sukabumi',
    active_tenant: {
      kode_kecamatan: '32.72.03',
      kode_kelurahan: '32.72.03.1002',
      nama_kelurahan: 'Cisarua',
      nama_kecamatan: 'Cikole'
    }
  };
  const scopeSimulasi = aiEngineService.resolveScope(walikotaSimulasiUser);
  assert.strictEqual(scopeSimulasi.kode_kelurahan, '32.72.03.1002', 'Simulasi harus beralih ke Cisarua');
  assert.strictEqual(scopeSimulasi.kelurahan, 'Cisarua', 'Nama kelurahan tenant harus Cisarua');
  console.log('  -> PASS: Isolasi row-level tenant & simulasi switcher berhasil sempurna.');

  console.log('\n===============================================================');
  console.log('🎉 SEMUA 3 PENGUJIAN MULTI-TENANCY SPRINT 9 BERHASIL 100%!');
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
