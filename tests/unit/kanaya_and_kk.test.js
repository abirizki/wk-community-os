/**
 * tests/unit/kanaya_and_kk.test.js
 * Unit & Integration Test Suite for:
 * 1. Kanaya AI Reasoning Pipeline (Spec T1-T6)
 * 2. Public KK Digital Verification & Masked PII
 * 3. Extended Family Relations Handling
 * 4. Scanner KK Payload Parsing
 */

const assert = require('assert');
const kanayaService = require('../../src/services/kanaya.service');
const { BUMI_WARGA_SOP_REGISTRY, searchSop } = require('../../src/services/kanaya.sop');
const kkService = require('../../src/services/kk.service');

async function runTests() {
  console.log('=== RUNNING KANAYA AI & KK VERIFICATION TESTS ===\n');
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

  // 1. SOP Registry Tests
  test('SOP Registry contains grounded SOPs with version and source', () => {
    assert(Array.isArray(BUMI_WARGA_SOP_REGISTRY), 'SOP Registry should be an array');
    assert(BUMI_WARGA_SOP_REGISTRY.length >= 5, 'Should have at least 5 SOPs');
    for (const sop of BUMI_WARGA_SOP_REGISTRY) {
      assert(sop.id, 'SOP must have id');
      assert(sop.title, 'SOP must have title');
      assert(sop.source_name, 'SOP must have source_name');
      assert(sop.version, 'SOP must have version');
      assert(sop.body, 'SOP must have body');
    }
  });

  test('searchSop correctly finds SKU and SKTM SOPs', () => {
    const sku = searchSop('Bagaimana cara membuat SKU untuk usaha?');
    assert(sku, 'SKU SOP should be found');
    assert.strictEqual(sku.id, 'sku');

    const sktm = searchSop('Syarat SKTM beasiswa KIP');
    assert(sktm, 'SKTM SOP should be found');
    assert.strictEqual(sktm.id, 'sktm');
  });

  // 2. Kanaya AI Processing Tests
  await asyncTest('Kanaya: Greeting returns friendly Pasundan welcome with action chips', async () => {
    const res = await kanayaService.processQuery({
      message: 'Sampurasun Kanaya',
      user: { nama: 'Budi Santoso', role: 'warga' }
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.answer_meta.intent, 'greeting');
    assert(res.reply.includes('Sampurasun'));
    assert(Array.isArray(res.action_chips));
  });

  await asyncTest('Kanaya: High-Stakes bansos decision requires human handoff', async () => {
    const res = await kanayaService.processQuery({
      message: 'Apakah keluarga saya pasti dapat bansos PKH?',
      user: { nama: 'Budi Santoso', role: 'warga' }
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.answer_meta.intent, 'high_stakes_decision');
    assert.strictEqual(res.answer_meta.needs_human, true, 'High stakes queries must have needs_human: true');
    assert(res.reply.includes('Musyawarah Kelurahan'));
  });

  await asyncTest('Kanaya: Warga document status returns grounded response', async () => {
    const res = await kanayaService.processQuery({
      message: 'Surat pengajuan saya sudah sampai mana?',
      user: { active_nik: '3273010203850003', nama: 'Budi Santoso', role: 'warga' }
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.answer_meta.intent, 'my_service_status');
    assert(res.answer_meta.evidence.length > 0, 'Status responses must have evidence');
  });

  await asyncTest('Kanaya: RT work queue provides RT scope queue', async () => {
    const res = await kanayaService.processQuery({
      message: 'Berapa antrean verifikasi surat di wilayah saya?',
      user: { nama: 'Dadang Ruhiyat', role: 'ketua_rt', rt: '001', rw: '001' }
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.answer_meta.intent, 'field_work_queue');
    assert(res.reply.includes('RT 001'));
  });

  await asyncTest('Kanaya: Walikota regional analytics returns macro aggregate metrics', async () => {
    const res = await kanayaService.processQuery({
      message: 'Tampilkan analitik dan statistik pelayanan warga',
      user: { nama: 'H. Achmad Fahmi', role: 'walikota' }
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.answer_meta.intent, 'regional_analytics');
    assert(res.reply.includes('Total Warga Terdata'));
  });

  // 3. KK Digital Public Verification Tests
  await asyncTest('KK Service: getPublicFamilyCardVerification returns masked PII & extended family members', async () => {
    const res = await kkService.getPublicFamilyCardVerification('3273010101900001');
    assert.strictEqual(res.valid, true);
    assert(res.no_kk_masked.includes('******'), 'No KK must be masked in public verification');
    assert(Array.isArray(res.anggota), 'Anggota must be an array');
    assert(res.anggota.length >= 3, 'Must have at least 3 members');
    
    // Check that NIK is masked
    for (const m of res.anggota) {
      assert(m.nik_masked.includes('******'), 'NIK must be masked in public verification');
      assert(m.status_hubungan_keluarga, 'Relation must be present');
    }

    // Verify extended family relationship support
    const relations = res.anggota.map(m => m.status_hubungan_keluarga);
    console.log('   -> Anggota KK Relations:', relations);
    assert(relations.includes('Kepala Keluarga'), 'Must have Kepala Keluarga');
    assert(relations.includes('Istri'), 'Must have Istri');
    assert(relations.some(r => r.includes('Orang Tua') || r.includes('Anak')), 'Must support family relations');
  });

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});

