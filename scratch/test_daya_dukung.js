/**
 * scratch/test_daya_dukung.js
 * Unit Test for Sprint 8: Fasilitas Publik, Daya Dukung Wilayah & Ekonomi Lokal
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const assert = require('assert');
const dayaDukungService = require('../src/services/daya_dukung.service');

async function runTests() {
  console.log('=== RUNNING TESTS: SPRINT 8 FASILITAS PUBLIK & DAYA DUKUNG WILAYAH ===\n');

  // -------------------------------------------------------------------------
  // TEST 1: Analisis Sektor Pendidikan (Defisit/Surplus Kursi PPDB & Anak Usia Sekolah)
  // -------------------------------------------------------------------------
  console.log('[TEST 1] Verifikasi Analisis Sektor Pendidikan...');
  const mockPendidikanSummary = {
    kapasitas_jenjang: [
      { jenjang: 'PAUD', total_institusi: 1, total_kursi_baru: 35, total_kapasitas: 70, total_rombel: 2 },
      { jenjang: 'SD', total_institusi: 1, total_kursi_baru: 96, total_kapasitas: 384, total_rombel: 12 },
      { jenjang: 'SMP', total_institusi: 1, total_kursi_baru: 72, total_kapasitas: 216, total_rombel: 6 },
      { jenjang: 'SMA', total_institusi: 1, total_kursi_baru: 120, total_kapasitas: 720, total_rombel: 20 },
      { jenjang: 'SMK', total_institusi: 1, total_kursi_baru: 60, total_kapasitas: 180, total_rombel: 6 }
    ],
    demografi_anak: {
      usia_paud: 40,   // Kapasitas 35 -> Defisit 5
      usia_sd: 90,     // Kapasitas 96 -> Surplus 6
      usia_smp: 85,    // Kapasitas 72 -> Defisit 13
      usia_sma: 150,   // Kapasitas 180 -> Surplus 30
      potensi_anak_belum_sekolah: 3
    }
  };

  const eduResult = dayaDukungService.analyzeEducation(mockPendidikanSummary);
  assert.strictEqual(eduResult.cohorts.length, 4, 'Harus ada 4 jenjang cohort (PAUD, SD, SMP, SMA/SMK)');
  
  const paudCohort = eduResult.cohorts.find(c => c.jenjang === 'PAUD / TK');
  assert.strictEqual(paudCohort.status_kapasitas, 'DEFISIT', 'PAUD harus berstatus DEFISIT');
  assert.strictEqual(paudCohort.selisih_kursi, -5, 'PAUD harus defisit 5 kursi');

  const sdCohort = eduResult.cohorts.find(c => c.jenjang === 'Sekolah Dasar (SD)');
  assert.strictEqual(sdCohort.status_kapasitas, 'SURPLUS', 'SD harus berstatus SURPLUS');
  assert.strictEqual(sdCohort.selisih_kursi, 6, 'SD harus surplus 6 kursi');

  const smpCohort = eduResult.cohorts.find(c => c.jenjang === 'SMP / MTs');
  assert.strictEqual(smpCohort.status_kapasitas, 'DEFISIT', 'SMP harus berstatus DEFISIT');
  assert.strictEqual(smpCohort.selisih_kursi, -13, 'SMP harus defisit 13 kursi');

  assert.strictEqual(eduResult.potensi_anak_belum_sekolah, 3, 'Harus mencatat 3 anak berisiko belum sekolah');
  assert(eduResult.ai_warnings.length >= 2, 'Harus menghasilkan minimal 2 peringatan AI (defisit & anak belum sekolah)');
  console.log('  -> PASS: Analisis zonasi PPDB & deteksi defisit kursi berhasil.');

  // -------------------------------------------------------------------------
  // TEST 2: Analisis Sektor Kesehatan & Rasio Medis per 1.000 Penduduk
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Verifikasi Rasio Daya Dukung Medis...');
  const mockKesehatanSummary = {
    faskes: {
      total_faskes: 5,
      total_dokter: 5,
      total_bidan: 6,
      total_perawat: 9,
      total_ahli_gizi: 2,
      total_tempat_tidur: 10,
      total_posyandu: 2
    },
    populasi: {
      total_penduduk: 4000,
      total_balita: 250,
      total_lansia: 420
    }
  };

  const healthResult = dayaDukungService.analyzeHealth(mockKesehatanSummary);
  // Rasio dokter: (5 / 4000) * 1000 = 1.25 per 1.000 penduduk (Standar WHO min 1.0)
  assert.strictEqual(healthResult.faskes_stats.dokter.rasio_per_1000, 1.25, 'Rasio dokter harus 1.25 per 1.000');
  assert.strictEqual(healthResult.faskes_stats.dokter.status, 'IDEAL', 'Status rasio dokter harus IDEAL');
  // Rasio total nakes: ((5 + 6 + 9) / 4000) * 1000 = 5.0 per 1.000 (Standar 2.5)
  assert.strictEqual(healthResult.faskes_stats.total_nakes.rasio_per_1000, 5.0, 'Rasio total nakes harus 5.0 per 1.000');
  assert.strictEqual(healthResult.health_adequacy_score, 100, 'Skor kecukupan kesehatan harus 100');
  console.log('  -> PASS: Perhitungan rasio medis & standar WHO berhasil.');

  // -------------------------------------------------------------------------
  // TEST 3: Analisis Ekonomi Lokal & Peta Keterjangkauan Pangan Desil 1-2
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Verifikasi Ekosistem UMKM & Akses Pangan Murah Desil 1-2...');
  const mockEkonomiSummary = {
    usaha: {
      total_umkm: 8,
      total_serapan_naker: 24,
      total_toko_pangan_murah: 2,
      total_terverifikasi_sku: 5
    },
    ketenagakerjaan: {
      usia_produktif: 200,
      usia_produktif_belum_bekerja: 35
    },
    desil_rentan_per_rw: [
      { rw: '001', total_keluarga_rentan: 12 },
      { rw: '002', total_keluarga_rentan: 18 },
      { rw: '003', total_keluarga_rentan: 8 }
    ],
    toko_pangan_per_rw: [
      { rw: '001', jumlah_toko_pangan: 1 },
      { rw: '002', jumlah_toko_pangan: 1 }
      // RW 003 tidak punya toko pangan murah -> RAWAN AKSES
    ]
  };

  const econResult = dayaDukungService.analyzeEconomy(mockEkonomiSummary);
  assert.strictEqual(econResult.total_umkm, 8, 'Total UMKM harus 8');
  assert.strictEqual(econResult.total_serapan_naker, 24, 'Total serapan naker harus 24');
  assert.strictEqual(econResult.rasio_serapan_persen, 12.0, 'Rasio serapan naker harus 12.0%');

  const rw3FoodMap = econResult.food_accessibility_per_rw.find(f => f.rw === '003');
  assert.strictEqual(rw3FoodMap.status_akses, 'RAWAN AKSES (0 TOKO)', 'RW 003 harus terdeteksi RAWAN AKSES PANGAN');
  assert.strictEqual(rw3FoodMap.color, 'rose', 'Warna badge RW 003 harus rose/merah');
  console.log('  -> PASS: Indeks serapan naker & pemetaan kerawanan pangan Desil 1-2 berhasil.');

  // -------------------------------------------------------------------------
  // TEST 4: Analisis Sanitasi & Korelasi Spasial Stunting Balita
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Verifikasi Korelasi Sanitasi vs Stunting Balita...');
  const mockSanitasiData = {
    sanitasi_rt: [
      { rt: '001', rw: '001', total_kk: 25, air_bersih_layak: 25, jamban_sehat: 25, jamban_non_standar: 0 },
      { rt: '002', rw: '001', total_kk: 30, air_bersih_layak: 20, jamban_sehat: 20, jamban_non_standar: 10 },
      { rt: '001', rw: '002', total_kk: 20, air_bersih_layak: 18, jamban_sehat: 15, jamban_non_standar: 5 }
    ],
    stunting_rt: [
      { rt: '002', rw: '001', kasus_stunting_balita: 3 }, // RT 002/001: Jamban non standar + stunting -> ZONA MERAH
      { rt: '001', rw: '001', kasus_stunting_balita: 0 }
    ]
  };

  const sanResult = dayaDukungService.analyzeSanitation(mockSanitasiData);
  assert.strictEqual(sanResult.matrix_rt.length, 3, 'Harus memetakan 3 RT');
  
  const rt2rw1 = sanResult.matrix_rt.find(r => r.rt === '002' && r.rw === '001');
  assert.strictEqual(rt2rw1.kategori_risiko, 'ZONA MERAH: RESIKO GANDA', 'RT 002/001 harus terdeteksi ZONA MERAH');
  assert.strictEqual(rt2rw1.badge_color, 'rose', 'Badge RT 002/001 harus rose');

  const rt1rw1 = sanResult.matrix_rt.find(r => r.rt === '001' && r.rw === '001');
  assert.strictEqual(rt1rw1.kategori_risiko, 'AMAN & SEHAT', 'RT 001/001 harus AMAN & SEHAT');
  assert.strictEqual(rt1rw1.badge_color, 'emerald', 'Badge RT 001/001 harus emerald');

  const rt1rw2 = sanResult.matrix_rt.find(r => r.rt === '001' && r.rw === '002');
  assert.strictEqual(rt1rw2.kategori_risiko, 'WASPADA SANITASI', 'RT 001/002 harus WASPADA SANITASI');
  console.log('  -> PASS: Korelasi spasial sanitasi buruk vs balita stunting berhasil.');

  console.log('\n===============================================================');
  console.log('🎉 SEMUA 4 PENGUJIAN UNIT SPRINT 8 BERHASIL 100%! (ALL TESTS PASSED)');
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});

