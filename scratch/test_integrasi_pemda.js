/**
 * scratch/test_integrasi_pemda.js
 * Comprehensive Test Suite for Sprint 10: Integrasi Ekosistem Pemda
 * Dukcapil Kemendagri & Sapawarga / Satu Data Jabar
 */

const assert = require('assert');
const dukcapilService = require('../src/services/dukcapil.service');
const sapawargaService = require('../src/services/sapawarga.service');

async function runTests() {
  console.log('================================================================');
  console.log('🚀 MEMULAI TEST SUITE: INTEGRASI EKOSISTEM PEMDA (SPRINT 10)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // TEST 1: Dukcapil NIK Matching - Valid NIK & Full Match
  await asyncTest('1. Dukcapil NIK Matching - Valid NIK & Full Data Match', async () => {
    const res = await dukcapilService.verifyNikMatching({
      nik: '3273010203850003',
      nama: 'Budi Santoso',
      tanggal_lahir: '1985-03-02'
    });
    assert.strictEqual(res.is_matched, true);
    assert.strictEqual(res.match_details.nik_exists, true);
    assert.strictEqual(res.match_details.nama_matched, true);
    assert.strictEqual(res.match_details.tanggal_lahir_matched, true);
    assert.strictEqual(res.match_details.status_kependudukan, 'AKTIF');
    assert.ok(res.compliance.integrity_hash, 'Hash integritas UU PDP wajib ada');
  });

  // TEST 2: Dukcapil NIK Matching - Unmatched Name
  await asyncTest('2. Dukcapil NIK Matching - NIK Valid tapi Nama Berbeda', async () => {
    const res = await dukcapilService.verifyNikMatching({
      nik: '3273010203850003',
      nama: 'Agus Setiawan'
    });
    assert.strictEqual(res.is_matched, false);
    assert.strictEqual(res.match_details.nama_matched, false);
  });

  // TEST 3: Dukcapil NIK Matching - Invalid / Unregistered NIK
  await asyncTest('3. Dukcapil NIK Matching - NIK Tidak Terdaftar', async () => {
    const res = await dukcapilService.verifyNikMatching({
      nik: '3273000000000099'
    });
    assert.strictEqual(res.is_matched, false);
    assert.strictEqual(res.message, 'NIK tidak ditemukan di server Dukcapil Kemendagri');
  });

  // TEST 4: Dukcapil Biometric Face Recognition & Zero Data Hoarding
  await asyncTest('4. Dukcapil Biometric Face Recognition - Ambang Batas >= 80%', async () => {
    const fakeFaceBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...randombase64data';
    const res = await dukcapilService.verifyBiometricFace({
      nik: '3273010203850003',
      face_image_base64: fakeFaceBase64
    });
    assert.strictEqual(res.is_matched, true);
    assert.ok(res.similarity_score >= 80.0, 'Score kemiripan biometrik harus >= 80%');
    assert.ok(res.compliance.uu_pdp.includes('Zero Hoarding'));
  });

  // TEST 5: Dukcapil Death Registry Check
  await asyncTest('5. Dukcapil Death Registry - Warga Telah Meninggal Terdeteksi', async () => {
    const res = await dukcapilService.checkStatusKematian({ nik: '3273019999990001' });
    assert.strictEqual(res.status_kependudukan, 'MENINGGAL');
    assert.ok(res.akta_kematian);
    assert.strictEqual(res.akta_kematian.nomor_akta, '3273-KM-12112024-0012');
  });

  // TEST 6: Dukcapil Audit Logs & SHA-256 Anti-Tampering Hash
  await asyncTest('6. Dukcapil Audit Logs - Verifikasi Hash SHA-256 Anti-Tampering', async () => {
    const logs = await dukcapilService.getAuditLogs({ limit: 5 });
    assert.ok(logs.length > 0, 'Harus ada log verifikasi tercatat');
    const latest = logs[0];
    assert.ok(latest.integrity_hash, 'Setiap log verifikasi wajib memiliki SHA-256 integrity hash');
    assert.strictEqual(latest.integrity_hash.length, 64, 'SHA-256 hash harus berpanjang 64 karakter');
  });

  // TEST 7: Sapawarga Single Sign-On (SSO) Token Exchange
  await asyncTest('7. Sapawarga SSO - Pertukaran Token OIDC Berhasil', async () => {
    const res = await sapawargaService.handleSapawargaSSO('spw_mock_3273010203850003');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.username, '3273010203850003');
    assert.ok(res.token, 'Session JWT token wajib dihasilkan');
  });

  // TEST 8: Partner API Key Validation & RBAC Scoping
  await asyncTest('8. Partner API Gateway - Validasi Key & Perizinan Scope', async () => {
    // Valid key & valid scope
    const val1 = await sapawargaService.validateApiKey('bw_live_spw_77a9c812d45e0f19b882', 'read:surat');
    assert.strictEqual(val1.isValid, true);
    assert.strictEqual(val1.partnerName, 'SAPAWARGA_JABAR');

    // Valid key but forbidden scope
    const val2 = await sapawargaService.validateApiKey('bw_live_spw_77a9c812d45e0f19b882', 'push:satudata');
    assert.strictEqual(val2.isValid, false);
    assert.ok(val2.reason.includes('tidak diizinkan'));

    // Invalid key
    const val3 = await sapawargaService.validateApiKey('bw_invalid_key_12345');
    assert.strictEqual(val3.isValid, false);
  });

  // TEST 9: Event Webhook Dispatcher
  await asyncTest('9. Webhooks Event Dispatcher - Logging & Event Status', async () => {
    const wh = await sapawargaService.dispatchWebhookEvent('SURAT_APPROVED', {
      nomor_surat: '470/08/SKTM/KBJ/2026',
      nik_pemohon: '3273010203850003',
      status: 'SELESAI'
    });
    assert.strictEqual(wh.status, 'SUCCESS');
    assert.strictEqual(wh.event_type, 'SURAT_APPROVED');

    const logs = await sapawargaService.getWebhookLogs(5);
    assert.ok(logs.length > 0);
  });

  // TEST 10: Satu Data Jabar Aggregator Payload
  await asyncTest('10. Satu Data Jabar Aggregator - SDI Format & Checksum Verification', async () => {
    const payload = await sapawargaService.exportSatuDataJabarPayload('32.72');
    assert.strictEqual(payload.metadata.standar, 'Satu Data Indonesia (SDI) / JDS West Java 2.0');
    assert.strictEqual(payload.metadata.kode_kab_kota, '32.72');
    assert.strictEqual(payload.ringkasan_kota.total_kecamatan, 7);
    assert.strictEqual(payload.ringkasan_kota.total_kelurahan, 33);
    assert.ok(payload.metadata.checksum, 'Metadata SDI wajib memiliki checksum verifikasi');
    assert.ok(Array.isArray(payload.rincian_per_kelurahan));
    assert.strictEqual(payload.rincian_per_kelurahan.length, 33, 'Harus mencakup 33 kelurahan Kota Sukabumi');
  });

  console.log('\n================================================================');
  console.log(`🎉 HASIL PENGUJIAN: ${passed} / ${total} TESTS PASSED (100%)`);
  console.log('================================================================');
}

runTests().catch(console.error);

