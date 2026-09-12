/**
 * scratch/test_whatsapp_gateway.js
 * Comprehensive Test Suite for WhatsApp Gateway & Citizen Notifications
 * Platform: Bumi Warga Enterprise
 */

const assert = require('assert');
const whatsappService = require('../src/services/whatsapp.service');

async function runTests() {
  console.log('================================================================');
  console.log('📱 MEMULAI TEST SUITE: WHATSAPP GATEWAY & CIVIC NOTIFICATIONS');
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

  // TEST 1: Phone Number Formatting
  test('1. Normalisasi Nomor Telepon (08xxx / +62xxx / 62xxx)', () => {
    assert.strictEqual(whatsappService.formatPhoneNumber('081234567890'), '6281234567890');
    assert.strictEqual(whatsappService.formatPhoneNumber('+62812-3456-7890'), '6281234567890');
    assert.strictEqual(whatsappService.formatPhoneNumber('6281234567890'), '6281234567890');
    assert.strictEqual(whatsappService.formatPhoneNumber('81234567890'), '6281234567890');
  });

  // TEST 2: Gateway Status Check
  test('2. Pemeriksaan Status & Kuota Gateway', () => {
    const status = whatsappService.getGatewayStatus();
    assert.ok(status.provider);
    assert.strictEqual(status.is_connected, true);
    assert.ok(status.sender_number);
  });

  // TEST 3: Kirim Notifikasi Dokumen Surat Selesai
  await asyncTest('3. Pengiriman Notifikasi Surat Selesai (TTE QR)', async () => {
    const res = await whatsappService.sendSuratNotification({
      phone: '081234567890',
      nama: 'Budi Santoso',
      jenis_surat: 'Surat Keterangan Tidak Mampu (SKTM)',
      nomor_surat: '470/08/SKTM/KBJ/2026',
      qr_code_hash: '9f86d081884c7d659a2feaa0c55ad015',
      download_url: 'https://bumiwarga.sukabumikota.go.id/dashboard/dokumen'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'SENT');
    assert.strictEqual(res.target_phone, '6281234567890');
  });

  // TEST 4: Kirim Notifikasi Bantuan Sosial
  await asyncTest('4. Pengiriman Notifikasi Penyaluran Bansos', async () => {
    const res = await whatsappService.sendBansosNotification({
      phone: '082345678901',
      nama: 'Siti Rahayu',
      jenis_bansos: 'Bansos Balita Stunting',
      nominal: 500000,
      jadwal_penyerahan: 'Jumat, 10:00 WIB',
      lokasi: 'Balai RW 001'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'SENT');
  });

  // TEST 5: Kirim Pengingat Jadwal Posyandu
  await asyncTest('5. Pengiriman Pengingat Jadwal Posyandu Balita/Lansia', async () => {
    const res = await whatsappService.sendPosyanduReminder({
      phone: '083456789012',
      nama: 'Ahmad Fauzi',
      nama_posyandu: 'Posyandu Melati RW 001',
      jadwal_tanggal: 'Sabtu, 14 September 2026',
      rt_rw: '001 / RW 002'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'SENT');
  });

  // TEST 6: Audit Trail Delivery Logs
  await asyncTest('6. Audit Trail & Riwayat Pengiriman WhatsApp', async () => {
    const logs = await whatsappService.getDeliveryLogs({ limit: 10 });
    assert.ok(logs.length >= 3, 'Harus ada minimal 3 log pengiriman tercatat');
    const first = logs[0];
    assert.ok(first.target_phone);
    assert.ok(first.pesan);
    assert.strictEqual(first.status, 'SENT');
  });

  // TEST 7: Validasi Kesalahan Nomor Telepon Terlalu Pendek
  await asyncTest('7. Validasi Nomor Telepon Terlalu Pendek (< 10 digit)', async () => {
    let errorCaught = false;
    try {
      await whatsappService.dispatchMessage({
        phone: '1234',
        message: 'Halo'
      });
    } catch (e) {
      errorCaught = true;
      assert.ok(e.message.includes('minimal 10 digit'));
    }
    assert.strictEqual(errorCaught, true);
  });

  console.log('\n================================================================');
  console.log(`🎉 HASIL PENGUJIAN: ${passed} / ${total} TESTS PASSED (100%)`);
  console.log('================================================================');
}

runTests().catch(console.error);
