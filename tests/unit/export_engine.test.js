/**
 * tests/unit/export_engine.test.js
 * Verification of Universal Export Engine (CSV RFC 4180, SpreadsheetML Excel, Scoping, and PII Masking)
 */

const assert = require('assert');
const { generateCsv, generateExcelXml, maskPii } = require('../../src/utils/export.util');
const keuanganService = require('../../src/services/keuangan.service');
const keuanganRepository = require('../../src/repositories/keuangan.repository');
const dokumenService = require('../../src/services/dokumen.service');
const dokumenRepository = require('../../src/repositories/dokumen.repository');

async function runTests() {
  console.log('🧪 Running Universal Export Engine Unit Tests...');
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

  // TEST 1: CSV UTF-8 BOM and RFC 4180 Escaping
  test('generateCsv outputs UTF-8 BOM and escapes commas/quotes', () => {
    const headers = ['Nama Warga', 'Catatan, Khusus'];
    const rows = [
      ['Budi "Santoso"', 'Iuran sampah, bulan Mei\ndan Juni'],
      ['Siti Aminah', 'Lunas biasa']
    ];

    const csv = generateCsv(headers, rows);
    assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM (\\uFEFF)');
    assert.ok(csv.includes('"Catatan, Khusus"'), 'Header with comma must be quoted');
    assert.ok(csv.includes('"Budi ""Santoso"""'), 'Quotes within values must be escaped with double quotes');
    assert.ok(csv.includes('"Iuran sampah, bulan Mei\ndan Juni"'), 'Values with newlines/commas must be quoted');
  });

  // TEST 2: SpreadsheetML Excel XML Structure & Formatting
  test('generateExcelXml produces valid styled Excel SpreadsheetML', () => {
    const sheets = [
      {
        name: 'Laporan Kas',
        headers: ['No', 'Nama Lengkap', 'Nominal (Rp)'],
        rows: [
          [1, 'Ahmad Fauzi & Keluarga', { value: 50000, type: 'Currency' }],
          [2, 'Dewi Sartika <Ketua>', { value: 75000, type: 'Currency' }]
        ]
      }
    ];

    const xml = generateExcelXml('Laporan Keuangan', sheets);
    assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Must contain XML declaration');
    assert.ok(xml.includes('xmlns="urn:schemas-microsoft-com:office:spreadsheet"'), 'Must have SpreadsheetML namespace');
    assert.ok(xml.includes('Laporan Keuangan'), 'Must contain title in metadata');
    assert.ok(xml.includes('Ahmad Fauzi &amp; Keluarga'), 'Ampersands must be escaped');
    assert.ok(xml.includes('Dewi Sartika &lt;Ketua&gt;'), 'Angle brackets must be escaped');
    assert.ok(xml.includes('<Data ss:Type="Number">50000</Data>'), 'Numbers must use Number ss:Type');
    assert.ok(xml.includes('ss:StyleID="CurrencyCell"'), 'Currency cells must reference CurrencyCell style');
  });

  // TEST 3: PII Masking Compliance (UU PDP No. 27/2022)
  test('maskPii correctly masks center 6 digits', () => {
    assert.strictEqual(maskPii('3272030103860021'), '327203******0021');
    assert.strictEqual(maskPii('12345'), '12345');
    assert.strictEqual(maskPii(null), null);
    assert.strictEqual(maskPii(undefined), undefined);
  });

  // Setup Mock Repositories for Keuangan and Dokumen
  const origGetTransaksiList = keuanganRepository.getTransaksiList;
  const origGetIuranList = keuanganRepository.getIuranList;
  const origListDokumen = dokumenRepository.list;

  keuanganRepository.getTransaksiList = async (filters) => [
    {
      id: 1,
      nomor_transaksi: 'TRX-001',
      tanggal_transaksi: '2026-10-01',
      tipe: 'MASUK',
      kategori: 'Iuran Bulanan',
      keterangan: 'Kas RT 001',
      nominal: 250000,
      rt: filters.rt || '001',
      rw: filters.rw || '001',
      nama_pencatat: 'Ketua RT'
    }
  ];

  keuanganRepository.getIuranList = async (filters) => [
    {
      id: 10,
      no_kk: '3272030101000001',
      nama_kepala_keluarga: 'H. Sudirman',
      rt: filters.rt || '001',
      rw: filters.rw || '001',
      periode_bulan: '2026-10',
      nominal: 25000,
      status: 'LUNAS',
      tanggal_bayar: '2026-10-05',
      metode_bayar: 'TUNAI_RT',
      nomor_kuitansi: 'KW-001'
    }
  ];

  dokumenRepository.list = async (filters) => [
    {
      id: 101,
      nomor_registrasi: 'REG-2026-001',
      nomor_surat: '470/101/Ktr.Kbjt/X/2026',
      created_at: '2026-10-10T08:00:00Z',
      approved_at: '2026-10-10T10:00:00Z',
      jenis_dokumen: 'Surat Pengantar SKCK',
      nama_pemohon: 'Rizki Pratama',
      nik_pemohon: '3272030103860021',
      rt: filters.rt || '001',
      rw: filters.rw || '001',
      keperluan: 'Melamar Pekerjaan',
      status: 'APPROVED',
      approval_step: 'COMPLETED',
      qr_code_hash: 'abc1234567890abcdef1234567890'
    }
  ];

  try {
    // TEST 4: Keuangan Service Export Kas Scoping & Formats
    await asyncTest('keuanganService.exportKas obeys RT/RW scope and supports Excel & CSV', async () => {
      const rtUser = { role: 'ketua_rt', rt: '001', rw: '001', nama: 'Ketua RT 01' };

      // Test Excel format
      const excelRes = await keuanganService.exportKas({}, rtUser, 'xlsx');
      assert.strictEqual(excelRes.mimeType, 'application/vnd.ms-excel');
      assert.ok(excelRes.filename.includes('Buku_Kas_RT001_RW001_'));
      assert.ok(excelRes.content.includes('xmlns="urn:schemas-microsoft-com:office:spreadsheet"'));
      assert.ok(excelRes.content.includes('Kas Masuk (Rp)'));

      // Test CSV format
      const csvRes = await keuanganService.exportKas({}, rtUser, 'csv');
      assert.strictEqual(csvRes.mimeType, 'text/csv; charset=utf-8');
      assert.ok(csvRes.content.startsWith('\uFEFF'));
      assert.ok(csvRes.content.includes('Tanggal Transaksi,Nomor Transaksi,Tipe'));
    });

    // TEST 5: Keuangan Service Export Iuran Scoping & Masking
    await asyncTest('keuanganService.exportIuran generates scoped citizen dues recap', async () => {
      const rwUser = { role: 'ketua_rw', rw: '001', nama: 'Ketua RW 01' };

      const excelRes = await keuanganService.exportIuran({}, rwUser, 'xlsx');
      assert.ok(excelRes.filename.includes('Rekap_Iuran_RT001_RW001_'));
      assert.ok(excelRes.content.includes('Rekap Iuran'));
      assert.ok(excelRes.content.includes('Nama Kepala Keluarga'));
    });

    // TEST 6: Dokumen Service Export Register Surat Scoping & Masking
    await asyncTest('dokumenService.exportRegisterSurat creates register with PII protection', async () => {
      const lurahUser = { role: 'lurah', kelurahan: 'Kebonjati', nama: 'Lurah Kebonjati' };

      const excelRes = await dokumenService.exportRegisterSurat({}, lurahUser, 'xlsx');
      assert.ok(excelRes.filename.includes('Register_Surat_Kebonjati_'));
      assert.ok(excelRes.content.includes('Register Pelayanan Surat'));
      assert.ok(excelRes.content.includes('Nomor Registrasi'));
      assert.ok(excelRes.content.includes('Rizki Pratama'));
      assert.ok(excelRes.content.includes('3272030103860021')); // Authorized officer sees unmasked NIK
    });

    // TEST 7: Warga / Public access masking
    await asyncTest('dokumenService.exportRegisterSurat masks NIK for non-officer', async () => {
      const citizenUser = { role: 'warga', username: '3272030103860021', nama: 'Warga Biasa' };

      const excelRes = await dokumenService.exportRegisterSurat({}, citizenUser, 'xlsx');
      assert.ok(excelRes.content.includes('327203******0021'), 'Citizen role must have center NIK digits masked');
    });

  } finally {
    // Restore original methods
    keuanganRepository.getTransaksiList = origGetTransaksiList;
    keuanganRepository.getIuranList = origGetIuranList;
    dokumenRepository.list = origListDokumen;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

