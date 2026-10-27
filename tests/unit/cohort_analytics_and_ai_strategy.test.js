/**
 * tests/unit/cohort_analytics_and_ai_strategy.test.js
 * Verification of School Cohort Progression Forecasting (T vs T+1),
 * Health Cycle (1000 HPK & Elderly), and AI Strategy Executive Engine
 * Bumi Warga - Jabar Pintar Digital
 */

const assert = require('assert');
const dayaDukungService = require('../../src/services/daya_dukung.service');

async function runTests() {
  console.log('🧪 Running Cohort Progression & AI Strategy Unit Tests...');
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

  // TEST 1: Analisis Pendidikan Membandingkan Siswa Saat Ini vs Calon Siswa Tahun Depan (T+1)
  test('analyzeEducation computes Cohort Progression T vs T+1 for all school tiers', () => {
    const mockSummary = {
      kapasitas_jenjang: [
        { jenjang: 'PAUD', total_institusi: 2, total_kursi_baru: 50, total_kapasitas: 120, total_rombel: 4 },
        { jenjang: 'SD', total_institusi: 3, total_kursi_baru: 120, total_kapasitas: 720, total_rombel: 24 },
        { jenjang: 'SMP', total_institusi: 1, total_kursi_baru: 90, total_kapasitas: 270, total_rombel: 9 },
        { jenjang: 'SMA', total_institusi: 1, total_kursi_baru: 60, total_kapasitas: 180, total_rombel: 6 },
        { jenjang: 'SMK', total_institusi: 1, total_kursi_baru: 60, total_kapasitas: 180, total_rombel: 6 }
      ],
      demografi_anak: {
        usia_paud: 65,
        usia_sd: 680,
        usia_smp: 260,
        usia_sma: 240,
        masuk_paud_t1: 45,
        masuk_sd_t1: 145, // Defisit: 145 calon murid vs 120 kursi -> defisit 25
        masuk_smp_t1: 85,  // Surplus: 85 calon murid vs 90 kursi -> surplus 5
        masuk_sma_t1: 110, // Surplus: 110 calon murid vs 120 kursi SMA+SMK -> surplus 10
        lulus_sekolah_ke_kerja_t1: 75,
        potensi_anak_belum_sekolah: 4
      }
    };

    const res = dayaDukungService.analyzeEducation(mockSummary);
    assert.ok(res, 'Analysis result must exist');
    assert.strictEqual(res.cohorts.length, 4, 'Must have 4 cohorts (PAUD, SD, SMP, SMA/SMK)');

    // Verify SD Cohort
    const sd = res.cohorts.find(c => c.jenjang_kode === 'SD');
    assert.ok(sd, 'SD cohort must exist');
    assert.strictEqual(sd.jumlah_anak_saat_ini, 680, 'Siswa SD aktif saat ini');
    assert.strictEqual(sd.proyeksi_masuk_t1, 145, 'Calon murid masuk SD tahun depan');
    assert.strictEqual(sd.kursi_baru, 120, 'Kapasitas kursi baru PPDB SD');
    assert.strictEqual(sd.selisih_kursi, -25, 'Harus defisit 25 kursi');
    assert.strictEqual(sd.status_kapasitas, 'DEFISIT', 'Status kapasitas harus DEFISIT');
    assert.strictEqual(sd.rombel_defisit, 1, 'Memerlukan 1 rombel tambahan (25 siswa / standar 28)');

    // Verify SMP Cohort
    const smp = res.cohorts.find(c => c.jenjang_kode === 'SMP');
    assert.ok(smp, 'SMP cohort must exist');
    assert.strictEqual(smp.proyeksi_masuk_t1, 85);
    assert.strictEqual(smp.kursi_baru, 90);
    assert.strictEqual(smp.selisih_kursi, 5);
    assert.strictEqual(smp.status_kapasitas, 'SURPLUS');

    // Verify Warning & Alert
    assert.ok(res.ai_warnings.length >= 2, 'Should have warning for SD deficit and out of school children');
    assert.strictEqual(res.potensi_anak_belum_sekolah, 4);
    assert.strictEqual(res.proyeksi_lulusan_siap_kerja_t1, 75);
  });

  // TEST 2: Analisis Kesehatan Menghitung 1000 HPK, Rasio Posyandu & Proyeksi Kelahiran (T+1)
  test('analyzeHealth calculates Life-Cycle cohorts, 1000 HPK & Posyandu carrying capacity', () => {
    const mockHealth = {
      faskes: {
        total_faskes: 4,
        total_dokter: 3,
        total_bidan: 5,
        total_perawat: 8,
        total_ahli_gizi: 2,
        total_tempat_tidur: 10,
        total_posyandu: 5
      },
      populasi: {
        total_penduduk: 3500,
        total_balita: 420,
        baduta_1000hpk: 180,
        balita_24_59bln: 240,
        total_lansia: 310,
        lansia_risti: 85
      },
      ibu_hamil: {
        total_ibu_hamil: 42,
        ibu_hamil_risti: 6,
        proyeksi_kelahiran_t1: 42
      },
      lansia_rentan: {
        lansia_sebatang_kara: 12
      }
    };

    const res = dayaDukungService.analyzeHealth(mockHealth);
    assert.ok(res, 'Health analysis must exist');
    assert.strictEqual(res.demografi_kesehatan.total_balita, 420);
    assert.strictEqual(res.demografi_kesehatan.baduta_1000hpk, 180);
    assert.strictEqual(res.demografi_kesehatan.ibu_hamil_risti, 6);
    assert.strictEqual(res.demografi_kesehatan.proyeksi_kelahiran_t1, 42);
    assert.strictEqual(res.demografi_kesehatan.lansia_sebatang_kara, 12);

    // Rasio Balita per Posyandu: 420 / 5 = 84 balita/posyandu
    assert.strictEqual(res.dukungan_layanan.rasio_balita_per_posyandu, 84);
    assert.strictEqual(res.dukungan_layanan.posyandu_beban_status, 'OPTIMAL');

    // Rasio Dokter: (3 / 3500) * 1000 = 0.86
    assert.strictEqual(res.faskes_stats.dokter.rasio_per_1000, 0.86);
    assert.strictEqual(res.faskes_stats.dokter.status, 'WASPADA BEBAN');
  });

  // TEST 3: Analisis Ekonomi Menghitung Serapan Naker & Pemuda Siap Kerja (T+1)
  test('analyzeEconomy calculates Youth Labor Transition and Food Security', () => {
    const mockEcon = {
      usaha: { total_umkm: 35, total_serapan_naker: 110, total_toko_pangan_murah: 4, total_terverifikasi_sku: 28 },
      ketenagakerjaan: { usia_produktif: 2100, usia_produktif_belum_bekerja: 240, pemuda_siap_kerja_t1: 48 },
      desil_rentan_per_rw: [{ rw: '001', total_keluarga_rentan: 14 }],
      toko_pangan_per_rw: [{ rw: '001', jumlah_toko_pangan: 2 }]
    };

    const res = dayaDukungService.analyzeEconomy(mockEcon);
    assert.ok(res, 'Economy analysis must exist');
    assert.strictEqual(res.pemuda_siap_kerja_t1, 48);
    assert.strictEqual(res.total_umkm, 35);
    assert.strictEqual(res.total_serapan_naker, 110);
    assert.strictEqual(res.food_accessibility_per_rw[0].status_akses, 'CUKUP');
  });

  // TEST 4: getStrategicAiInsight Menghasilkan 4 Kartu Insight Eksekutif Siap Baca
  test('getStrategicAiInsight synthesizes 4 Prescriptive Executive Decision Cards', async () => {
    // Override getComprehensiveCarryingCapacity to test insight generator independently
    const originalMethod = dayaDukungService.getComprehensiveCarryingCapacity;
    dayaDukungService.getComprehensiveCarryingCapacity = async () => ({
      index_daya_dukung: { score: 82, status: 'MEMADAI', color: 'blue' },
      pendidikan: {
        overall_capacity_score: 78,
        cohorts: [
          { jenjang: 'Sekolah Dasar (SD)', jenjang_kode: 'SD', jumlah_anak_saat_ini: 500, proyeksi_masuk_t1: 115, kursi_baru: 90, selisih_kursi: -25, status_kapasitas: 'DEFISIT', rombel_defisit: 1 },
          { jenjang: 'SMP / MTs', jenjang_kode: 'SMP', jumlah_anak_saat_ini: 250, proyeksi_masuk_t1: 80, kursi_baru: 90, selisih_kursi: 10, status_kapasitas: 'SURPLUS', rombel_defisit: 0 }
        ],
        potensi_anak_belum_sekolah: 2,
        proyeksi_lulusan_siap_kerja_t1: 42,
        ai_warnings: []
      },
      kesehatan: {
        health_adequacy_score: 85,
        demografi_kesehatan: { total_balita: 310, baduta_1000hpk: 120, total_ibu_hamil: 25, ibu_hamil_risti: 4, proyeksi_kelahiran_t1: 25, total_lansia: 180 },
        dukungan_layanan: { total_posyandu: 4, rasio_balita_per_posyandu: 78 }
      },
      ekonomi: {
        economic_vitality_score: 80,
        total_serapan_naker: 85,
        total_terverifikasi_sku: 20,
        total_toko_pangan: 3,
        pemuda_siap_kerja_t1: 42,
        rasio_serapan_persen: 5.2,
        food_accessibility_per_rw: [{ rw: '001', keluarga_desil_1_2: 12 }]
      },
      sanitasi: { sanitation_health_score: 90 }
    });

    try {
      const res = await dayaDukungService.getStrategicAiInsight({ rw: '001' });
      assert.ok(res, 'Insight result must exist');
      assert.ok(Array.isArray(res.executive_insights), 'executive_insights must be an array');
      assert.strictEqual(res.executive_insights.length, 4, 'Must produce exactly 4 executive cards');

      // 1. Pendidikan Card
      const eduCard = res.executive_insights.find(c => c.sektor === 'PENDIDIKAN');
      assert.ok(eduCard, 'Education card must exist');
      assert.strictEqual(eduCard.badge_status, 'DEFISIT KURSI');
      assert.strictEqual(eduCard.urgensi, 'high');
      assert.ok(eduCard.ringkasan_angka.tahun_depan_value.includes('115'));
      assert.ok(eduCard.ringkasan_angka.neraca_value.includes('Defisit 25 Kursi'));
      assert.ok(eduCard.rekomendasi_kebijakan.includes('rombongan belajar tambahan'));

      // 2. Kesehatan Card
      const healthCard = res.executive_insights.find(c => c.sektor === 'KESEHATAN');
      assert.ok(healthCard, 'Health card must exist');
      assert.strictEqual(healthCard.badge_status, 'INTERVENSI GIZI');
      assert.strictEqual(healthCard.urgensi, 'high');
      assert.ok(healthCard.temuan_kritis.includes('4 ibu hamil risiko tinggi/KEK'));
      assert.ok(healthCard.rekomendasi_kebijakan.includes('Pemberian Makanan Tambahan (PMT)'));

      // 3. Bansos Card
      const socialCard = res.executive_insights.find(c => c.sektor === 'PERLINDUNGAN_SOSIAL');
      assert.ok(socialCard, 'Social card must exist');
      assert.strictEqual(socialCard.badge_status, 'PENGAWALAN BANSOS');

      // 4. Ketenagakerjaan Card
      const workCard = res.executive_insights.find(c => c.sektor === 'KETENAGAKERJAAN');
      assert.ok(workCard, 'Workforce card must exist');
      assert.ok(workCard.ringkasan_angka.tahun_depan_value.includes('42 pemuda'));
    } finally {
      dayaDukungService.getComprehensiveCarryingCapacity = originalMethod;
    }
  });

  // TEST 5: Graceful Handling pada Empty / Zero Data
  test('analyzeEducation and analyzeHealth handle zero datasets gracefully without NaN', () => {
    const emptyEdu = dayaDukungService.analyzeEducation({});
    assert.strictEqual(typeof emptyEdu.overall_capacity_score, 'number');
    assert.ok(!isNaN(emptyEdu.overall_capacity_score));

    const emptyHealth = dayaDukungService.analyzeHealth({});
    assert.strictEqual(typeof emptyHealth.health_adequacy_score, 'number');
    assert.ok(!isNaN(emptyHealth.health_adequacy_score));
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

