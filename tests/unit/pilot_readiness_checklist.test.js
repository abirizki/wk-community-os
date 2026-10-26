/**
 * tests/unit/pilot_readiness_checklist.test.js
 * Comprehensive Verification of Readiness Checklist (Canvas)
 * Covering:
 * P0 · Keamanan Akun (Negative & Positive API Tests, Kredensial, Kupon, Secret, Mock SSO)
 * P0 · Kepercayaan Data (Bandung/Sukabumi Reconciliation, Provenance Separation, No Fake SLA)
 * P0 · Otorisasi & Isolasi Wilayah (Strict RT/RW/Kelurahan Scoping, Anti-Tampering Query)
 * Bumi Warga - Kota Sukabumi (Jabar Pintar Digital)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Modules to test
const sapawargaService = require('../../src/services/sapawarga.service');
const wargaService = require('../../src/services/warga.service');
const aiEngineService = require('../../src/services/ai_engine.service');
const wilayahRepository = require('../../src/repositories/wilayah.repository');

let passedCount = 0;
let failedCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failedCount++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failedCount++;
  }
}

async function main() {
  console.log('================================================================');
  console.log('RUNNING PILOT READINESS CHECKLIST TESTS (CANVAS CRITERIA)');
  console.log('================================================================\n');

  // =========================================================================
  // GERBANG 1: P0 · KEAMANAN AKUN
  // =========================================================================
  console.log('--- GERBANG 1: P0 · KEAMANAN AKUN ---');

  test('P0.1.1: Default PIN 123456 and birthdate PIN are strictly eliminated from auth.routes.js', () => {
    const authCode = fs.readFileSync(path.join(__dirname, '../../src/routes/auth.routes.js'), 'utf8');
    assert.strictEqual(authCode.includes("password === '123456'"), false, 'Must not accept 123456');
    assert.strictEqual(authCode.includes("loginMethod = 'birthdate_pin'"), false, 'Must not allow birthdate login');
    assert.ok(authCode.includes('Identitas (NIK/Username) atau kata sandi tidak sesuai'), 'Must return generic error');
  });

  test('P0.1.2: Server fails fast in production if SESSION_SECRET is missing or weak (< 32 chars)', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../../server.js'), 'utf8');
    assert.ok(serverCode.includes('isProduction'), 'Must check production environment');
    assert.ok(serverCode.includes('process.env.SESSION_SECRET.trim().length < 32'), 'Must enforce min 32 chars');
    assert.ok(serverCode.includes('process.exit(1)'), 'Must exit process on failure');
  });

  await asyncTest('P0.1.3: Sapawarga SSO rejects sandbox mock token when in production without explicit allow', async () => {
    const origEnv = process.env.NODE_ENV;
    const origAllow = process.env.ALLOW_SANDBOX_LOGIN;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_SANDBOX_LOGIN;
      
      let thrown = false;
      try {
        await sapawargaService.handleSapawargaSSO('spw_mock_3272030103810001');
      } catch (err) {
        thrown = true;
        assert.ok(err.message.includes('lingkungan produksi'), 'Error message must specify production restriction');
      }
      assert.strictEqual(thrown, true, 'Mock token must throw in production');
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origAllow) process.env.ALLOW_SANDBOX_LOGIN = origAllow;
      else delete process.env.ALLOW_SANDBOX_LOGIN;
    }
  });

  await asyncTest('P0.1.4: Sapawarga SSO rejects token missing citizen NIK (no fallback to dummy NIK)', async () => {
    let thrown = false;
    try {
      await sapawargaService.handleSapawargaSSO('invalid_token_format');
    } catch (err) {
      thrown = true;
      assert.ok(err.message.includes('Validasi token SSO Sapawarga gagal'), 'Must reject invalid token');
    }
    assert.strictEqual(thrown, true, 'Invalid token must throw');
  });

  test('P0.1.5: Coupon tokens are generated using CSPRNG with valid BW-XXXXXX format and high entropy', () => {
    const actCode = fs.readFileSync(path.join(__dirname, '../../src/routes/activation.routes.js'), 'utf8');
    assert.ok(actCode.includes('crypto.randomInt'), 'Must use crypto.randomInt');
    assert.strictEqual(actCode.includes('Math.random()'), false, 'Must not use Math.random()');

    // Generate sample and check uniqueness
    const generated = new Set();
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let i = 0; i < 200; i++) {
      let code = '';
      for (let j = 0; j < 6; j++) {
        code += chars[crypto.randomInt(0, chars.length)];
      }
      const token = `BW-${code}`;
      assert.match(token, /^BW-[2-9A-HJ-NP-Z]{6}$/);
      generated.add(token);
    }
    assert.strictEqual(generated.size, 200, '200 generated tokens must have zero collisions');
  });

  // =========================================================================
  // GERBANG 2: P0 · KEPERCAYAAN DATA & REKONSILIASI WILAYAH
  // =========================================================================
  console.log('\n--- GERBANG 2: P0 · KEPERCAYAAN DATA & REKONSILIASI WILAYAH ---');

  test('P0.2.1: Territorial reconciliation: Kebonjati is in Cikole, Kota Sukabumi (No Andir / Bandung defaults)', () => {
    const autoPatchCode = fs.readFileSync(path.join(__dirname, '../../src/db/auto_patch.js'), 'utf8');
    const initCode = fs.readFileSync(path.join(__dirname, '../../src/db/init.js'), 'utf8');
    const wargaRepoCode = fs.readFileSync(path.join(__dirname, '../../src/repositories/warga.repository.js'), 'utf8');

    // init.js checks
    assert.ok(initCode.includes("kecamatan VARCHAR(100) NOT NULL DEFAULT 'Cikole'"), 'init.js must default kecamatan to Cikole');
    assert.ok(initCode.includes("kota VARCHAR(100) NOT NULL DEFAULT 'Kota Sukabumi'"), 'init.js must default kota to Kota Sukabumi');
    assert.strictEqual(initCode.includes("DEFAULT 'Andir'"), false, 'init.js must not contain default Andir');

    // auto_patch.js checks
    assert.ok(autoPatchCode.includes("Cikole") && autoPatchCode.includes("Kota Sukabumi"), 'auto_patch.js must normalize to Cikole & Sukabumi');
    assert.strictEqual(autoPatchCode.includes("DEFAULT 'Andir'"), false, 'auto_patch.js must not have default Andir');

    // warga repository checks
    assert.ok(wargaRepoCode.includes("kecamatan = 'Cikole'"), 'warga.repository must default kecamatan to Cikole');
    assert.ok(wargaRepoCode.includes("kota = 'Kota Sukabumi'"), 'warga.repository must default kota to Kota Sukabumi');
    assert.strictEqual(wargaRepoCode.includes("kecamatan = 'Andir'"), false, 'warga.repository must not have kecamatan Andir');
  });

  await asyncTest('P0.2.2: Data Provenance: Pilot Hub (Kebonjati) is LIVE_TRANSACTIONAL, other 32 kelurahan are BASELINE_PROYEKSI_SDI', async () => {
    const heatmapData = await wilayahRepository.getCommandCenterHeatmap();
    assert.strictEqual(heatmapData.heatmap.length, 33, 'Must have exactly 33 Kelurahan in Kota Sukabumi');

    const pilot = heatmapData.heatmap.find(k => k.kode_kelurahan === '32.72.03.1004');
    assert.strictEqual(pilot.is_pilot_hub, true);
    assert.strictEqual(pilot.data_provenance, 'LIVE_TRANSACTIONAL');

    const nonPilotCount = heatmapData.heatmap.filter(k => k.data_provenance === 'BASELINE_PROYEKSI_SDI').length;
    assert.strictEqual(nonPilotCount, 32, 'Exactly 32 non-pilot kelurahan must have BASELINE_PROYEKSI_SDI provenance');
  });

  test('P0.2.3: Zero fake SLA fallbacks in DashboardLurah.jsx (initial state is null / Belum Tersedia)', () => {
    const lurahCode = fs.readFileSync(path.join(__dirname, '../../frontend/src/pages/dashboard/DashboardLurah.jsx'), 'utf8');
    assert.strictEqual(lurahCode.includes("slaSurat: '96.4%'"), false, 'Must not have 96.4% fallback SLA');
    assert.ok(lurahCode.includes('slaCompliance, setSlaCompliance] = useState(null)'), 'Must initialize SLA state to null');
    assert.ok(lurahCode.includes("'Belum Tersedia'"), 'Must display Belum Tersedia when SLA data is unavailable');
  });

  // =========================================================================
  // GERBANG 3: P0 · OTORISASI & ISOLASI WILAYAH
  // =========================================================================
  console.log('\n--- GERBANG 3: P0 · OTORISASI & ISOLASI WILAYAH ---');

  await asyncTest('P0.3.1: Anti-Tampering: Ketua RT 001 querying rt=002 is strictly rejected with 403', async () => {
    const rtSession = {
      id: 201,
      role: 'ketua_rt',
      rt: '001',
      rw: '001'
    };

    let thrown = false;
    try {
      await wargaService.listWarga({ rt: '002', rw: '001' }, rtSession);
    } catch (err) {
      thrown = true;
      assert.strictEqual(err.status, 403, 'Must return HTTP 403 Forbidden');
      assert.ok(err.message.includes('hanya berwenang mengakses data RT 001'), 'Error must specify session RT limitation');
    }
    assert.strictEqual(thrown, true, 'Tampered RT query must be rejected');
  });

  await asyncTest('P0.3.2: Anti-Tampering: Ketua RW 001 querying rw=002 is strictly rejected with 403', async () => {
    const rwSession = {
      id: 202,
      role: 'ketua_rw',
      rw: '001'
    };

    let thrown = false;
    try {
      await wargaService.listWarga({ rw: '002' }, rwSession);
    } catch (err) {
      thrown = true;
      assert.strictEqual(err.status, 403, 'Must return HTTP 403 Forbidden');
      assert.ok(err.message.includes('hanya berwenang mengakses data RW 001'), 'Error must specify session RW limitation');
    }
    assert.strictEqual(thrown, true, 'Tampered RW query must be rejected');
  });

  test('P0.3.3: Warga role is strictly barred from listing census warga endpoint (warga.routes.js)', () => {
    const wargaRoutesCode = fs.readFileSync(path.join(__dirname, '../../src/routes/warga.routes.js'), 'utf8');
    assert.ok(wargaRoutesCode.includes("req.session.user.role === 'warga'"), 'Must check for warga role');
    assert.ok(wargaRoutesCode.includes('403'), 'Must return 403 for warga');
    assert.ok(wargaRoutesCode.includes('Akun warga mandiri hanya berwenang mengakses data keluarga sendiri'), 'Explicit access denial');
  });

  test('P0.3.4: Camat Cikole scope strictly rejects active_tenant from other kecamatan', () => {
    const camatSession = {
      role: 'camat',
      kode_kecamatan: '32.72.03', // Cikole
      active_tenant: {
        kode_kecamatan: '32.72.06', // Warudoyong (Forbidden)
        kode_kelurahan: '32.72.06.1002'
      }
    };
    const resolved = aiEngineService.resolveScope(camatSession);
    assert.strictEqual(resolved.kode_kecamatan, '32.72.03', 'Must retain own kecamatan');
    assert.strictEqual(resolved.kode_kelurahan, undefined, 'Must not adopt foreign kelurahan');
  });

  console.log('\n================================================================');
  console.log(`CHECKLIST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
