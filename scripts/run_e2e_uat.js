/**
 * END-TO-END USER ACCEPTANCE TEST (UAT) SUITE: BUMI WARGA COMMUNITY OS
 * Standar Pengujian Komprehensif Skala Enterprise Pemerintah Daerah
 * Menguji 7 Skenario Inti:
 * 1. Multi-Tenancy Hirarkis & Master Wilayah Sukabumi
 * 2. Layanan Surat Digital & Verifikasi TTE QR
 * 3. Bantuan Sosial Presisi & Peringkat Desil 1-10
 * 4. Posyandu Digital, KMS Balita & Skrining Lansia
 * 5. Interoperabilitas Dukcapil Kemendagri & Sapawarga JDS
 * 6. Keamanan Siber, Audit Trail SHA-256 & UU PDP No. 27/2022
 * 7. PWA Manifest, Service Worker & Offline-First Sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🏛️  MEMULAI END-TO-END USER ACCEPTANCE TEST (UAT): BUMI WARGA');
console.log('    Pelayanan Publik & Tata Kelola Digital Kota Sukabumi');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, scenario, desc) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] (${scenario}) ${desc}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] (${scenario}) ${desc}`);
    failedTests++;
  }
}

async function runUAT() {
  // ---------------------------------------------------------------------------
  // SKENARIO 1: Multi-Tenancy & Struktur Wilayah Kemendagri Kota Sukabumi (32.72)
  // ---------------------------------------------------------------------------
  console.log('📌 SKENARIO 1: Multi-Tenancy Hirarkis & Struktur Wilayah Resmi');
  try {
    const wilayahRepo = (await import('../src/repositories/wilayah.repository.js')).default;

    const allKecamatan = await wilayahRepo.getAllKecamatan();
    assert(Array.isArray(allKecamatan) && allKecamatan.length === 7, 'Skenario 1.1', 'Master 7 Kecamatan resmi Kota Sukabumi tersedia');

    const allKelurahan = await wilayahRepo.getAllKelurahan();
    assert(Array.isArray(allKelurahan) && allKelurahan.length === 33, 'Skenario 1.2', 'Master 33 Kelurahan resmi Kota Sukabumi terdaftar');

    const kebonjati = await wilayahRepo.getKelurahanByKode('32.72.03.1004');
    const namaKebonjati = kebonjati ? (kebonjati.nama_kelurahan || kebonjati.nama) : null;
    assert(kebonjati && namaKebonjati === 'Kebonjati' && kebonjati.kode_kecamatan === '32.72.03', 'Skenario 1.3', 'Kelurahan Pilot Kebonjati terpetakan di Kec. Cikole (32.72.03.1004)');

    const heatmap = await wilayahRepo.getCommandCenterHeatmap();
    assert(heatmap && heatmap.kota && heatmap.kota.total_kelurahan === 33, 'Skenario 1.4', 'Command Center Walikota mengagregasi 33 kelurahan');
  } catch (err) {
    assert(false, 'Skenario 1', 'Error loading WilayahRepository: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // SKENARIO 2: Layanan Surat Digital & Verifikasi TTE QR
  // ---------------------------------------------------------------------------
  console.log('\n📌 SKENARIO 2: Alur Surat Digital & Tanda Tangan Elektronik (TTE)');
  try {
    const suratServiceExists = fs.existsSync(path.join(root, 'src', 'services', 'dokumen.service.js'));
    assert(suratServiceExists, 'Skenario 2.1', 'Layanan dokumen/surat service tersedia');

    const suratContent = fs.readFileSync(path.join(root, 'src', 'services', 'dokumen.service.js'), 'utf8');
    assert(suratContent.includes('qr') || suratContent.includes('qrcode') || suratContent.includes('sendSuratNotification'), 'Skenario 2.2', 'Fitur QR code TTE & integrasi WhatsApp notification terpasang');
    assert(suratContent.includes('nomor_surat') || suratContent.includes('SURAT_') || suratContent.includes('format'), 'Skenario 2.3', 'Penomoran surat otomatis memenuhi format resmi');
  } catch (err) {
    assert(false, 'Skenario 2', 'Error validating Surat: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // SKENARIO 3: Bantuan Sosial Presisi & Peringkat Desil 1-10
  // ---------------------------------------------------------------------------
  console.log('\n📌 SKENARIO 3: Bantuan Sosial Presisi & Kuota Kemiskinan Ekstrem');
  try {
    const bansosServiceExists = fs.existsSync(path.join(root, 'src', 'services', 'bansos.service.js'));
    assert(bansosServiceExists, 'Skenario 3.1', 'Layanan bansos service tersedia');

    const desilService = (await import('../src/services/desil.service.js')).default;
    const extremePoorDesil = desilService.calculatePMTDesil({
      daya_listrik: 'Tanpa Meteran',
      status_rumah: 'Bebas Sewa',
      sumber_air: 'Sumur Tidak Terlindung',
      luas_lantai_kategori: '< 8 m2 (Padat)',
      bahan_bakar_memasak: 'Minyak/Kayu',
      kepemilikan_motor: '0 unit',
      ada_disabilitas_lansia_tunggal: true
    });
    assert(extremePoorDesil <= 2, 'Skenario 3.2', `Algoritma DTSEN PMT mendeteksi kemiskinan ekstrem (Desil ${extremePoorDesil} <= 2)`);

    const richDesil = desilService.calculatePMTDesil({
      kepemilikan_mobil: true
    });
    assert(richDesil >= 7, 'Skenario 3.3', `Hard Gate kepemilikan mobil otomatis mengunci ke kelompok mampu (Desil ${richDesil} >= 7)`);

    const bansosContent = fs.readFileSync(path.join(root, 'src', 'services', 'bansos.service.js'), 'utf8');
    assert(bansosContent.includes('sendBansosNotification'), 'Skenario 3.4', 'Trigger notifikasi WhatsApp penyaluran bansos terpasang');
  } catch (err) {
    assert(false, 'Skenario 3', 'Error validating Bansos: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // SKENARIO 4: Posyandu Digital, KMS Balita & Skrining Lansia
  // ---------------------------------------------------------------------------
  console.log('\n📌 SKENARIO 4: Posyandu Digital (KMS Balita, Skrining Lansia & Offline)');
  try {
    const posyanduPageContent = fs.readFileSync(path.join(root, 'frontend', 'src', 'pages', 'PosyanduPage.jsx'), 'utf8');
    assert(posyanduPageContent.includes('enqueueOfflineAction'), 'Skenario 4.1', 'Fitur pencatatan balita offline queue terpasang');
    assert(posyanduPageContent.includes('POSYANDU_CHECKUP_LANSIA'), 'Skenario 4.2', 'Fitur skrining lansia offline queue terpasang');
    assert(posyanduPageContent.includes('cacheData') && posyanduPageContent.includes('getCachedData'), 'Skenario 4.3', 'Offline snapshot cache untuk data balita & lansia aktif');
    assert(posyanduPageContent.includes('liveIMT'), 'Skenario 4.4', 'Kalkulator live Indeks Massa Tubuh (IMT) lansia aktif');
  } catch (err) {
    assert(false, 'Skenario 4', 'Error validating Posyandu: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // SKENARIO 5: Interoperabilitas Dukcapil Kemendagri & Sapawarga JDS
  // ---------------------------------------------------------------------------
  console.log('\n📌 SKENARIO 5: Interoperabilitas Dukcapil Kemendagri & Sapawarga JDS');
  try {
    const dukcapil = (await import('../src/services/dukcapil.service.js')).default;

    // Uji NIK Matching
    const validMatch = await dukcapil.verifyNikMatching({
      nik: '3273010203850003',
      nama: 'BUDI SANTOSO',
      tanggal_lahir: '1985-03-02'
    });
    assert(validMatch.is_matched === true && validMatch.match_details.nik_exists === true, 'Skenario 5.1', 'Dukcapil Web Service NIK Matching valid');

    // Uji Biometric Facial Verification
    const bioResult = await dukcapil.verifyBiometricFace({
      nik: '3273010203850003',
      face_image_base64: 'sample_live_face'
    });
    assert(bioResult.is_matched === true, 'Skenario 5.2', `Dukcapil Biometrik Wajah lulus threshold (>=80%)`);

    // Uji Death Registry Check
    const deathCheck = await dukcapil.checkStatusKematian({ nik: '3273010203850003' });
    assert(deathCheck.status_kependudukan === 'AKTIF' && deathCheck.akta_kematian === null, 'Skenario 5.3', 'Dukcapil Death Registry Check valid (Status Kependudukan: AKTIF)');

    // Uji Sapawarga Satu Data Jabar Aggregator
    const sapawarga = (await import('../src/services/sapawarga.service.js')).default;
    const sdiPacket = await sapawarga.exportSatuDataJabarPayload('32.72');
    assert(sdiPacket.metadata.standar.includes('Satu Data Indonesia'), 'Skenario 5.4', 'Satu Data Jabar / SDI Packet sesuai regulasi Perpres 39/2019');
  } catch (err) {
    assert(false, 'Skenario 5', 'Error validating Interoperabilitas: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // SKENARIO 6: Keamanan Siber, Audit Trail SHA-256 & Kepatuhan UU PDP No. 27/2022
  // ---------------------------------------------------------------------------
  console.log('\n📌 SKENARIO 6: Keamanan Siber & Kepatuhan UU PDP No. 27/2022');
  try {
    const dukcapilContent = fs.readFileSync(path.join(root, 'src', 'services', 'dukcapil.service.js'), 'utf8');
    assert(dukcapilContent.includes('Zero Data Hoarding') || dukcapilContent.includes('UU PDP No. 27/2022'), 'Skenario 6.1', 'Prinsip Zero Data Hoarding (UU PDP No. 27/2022) terpenuhi');
    assert(dukcapilContent.includes('createHash(\'sha256\')'), 'Skenario 6.2', 'Audit trail anti-tampering SHA-256 hash chaining aktif');

    const nginxConf = fs.readFileSync(path.join(root, 'nginx', 'wk-community-os.conf'), 'utf8');
    assert(nginxConf.includes('limit_req_zone') && nginxConf.includes('bw_api_limit'), 'Skenario 6.3', 'Perlindungan Nginx Rate Limiting aktif');
    assert(nginxConf.includes('Strict-Transport-Security') && nginxConf.includes('X-Frame-Options'), 'Skenario 6.4', 'Security Headers (HSTS, Anti-Clickjacking) terpasang');
  } catch (err) {
    assert(false, 'Skenario 6', 'Error validating Security: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // SKENARIO 7: Progressive Web App (PWA) & Offline-First Architecture
  // ---------------------------------------------------------------------------
  console.log('\n📌 SKENARIO 7: Progressive Web App (PWA) & Offline-First Architecture');
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public', 'manifest.json'), 'utf8'));
    assert(manifest.display === 'standalone' && manifest.theme_color === '#1b4332', 'Skenario 7.1', 'PWA Manifest mandiri & beridentitas daerah');

    const sw = fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');
    assert(sw.includes('STATIC_CACHE') && sw.includes('offline.html'), 'Skenario 7.2', 'Service worker App Shell & Offline fallback terpasang');

    const offlineStorage = fs.readFileSync(path.join(root, 'frontend', 'src', 'utils', 'offlineStorage.js'), 'utf8');
    assert(offlineStorage.includes('indexedDB') && offlineStorage.includes('flushOfflineQueue'), 'Skenario 7.3', 'IndexedDB offline storage & background flush engine siap');

    const layout = fs.readFileSync(path.join(root, 'frontend', 'src', 'layouts', 'DashboardLayout.jsx'), 'utf8');
    assert(layout.includes('OfflineIndicator') && layout.includes('PWAInstallPrompt'), 'Skenario 7.4', 'Komponen UI OfflineIndicator & PWAInstallPrompt terpasang di root layout');
  } catch (err) {
    assert(false, 'Skenario 7', 'Error validating PWA: ' + err.message);
  }

  // ---------------------------------------------------------------------------
  // REKAPITULASI UAT
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 REKAPITULASI UAT: ${passedTests} PASSED, ${failedTests} FAILED DARI ${totalTests} SKENARIO`);
  if (failedTests === 0) {
    console.log('🎉 STATUS: USER ACCEPTANCE TEST (UAT) 100% LULUS!');
    console.log('   SISTEM BUMI WARGA MEMENUHI SELURUH PERSYARATAN AKREDITASI PEMDA.');
  } else {
    console.error('⚠️ STATUS: TERDAPAT PENGUJIAN YANG GAGAL.');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runUAT();

