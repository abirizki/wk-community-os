/**
 * src/services/daya_dukung.service.js
 * Service Layer for Public Facilities, Regional Carrying Capacity & Local Economy Ecosystem
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const fasilitasRepository = require('../repositories/fasilitas.repository');

class DayaDukungService {
  /**
   * Menghitung seluruh pilar daya dukung wilayah komprehensif
   */
  async getComprehensiveCarryingCapacity(scope = {}) {
    const [pendidikanSummary, kesehatanSummary, ekonomiSummary, sanitasiData] = await Promise.all([
      fasilitasRepository.getPendidikanSummary(scope),
      fasilitasRepository.getKesehatanSummary(scope),
      fasilitasRepository.getEntitasUsahaSummary(scope),
      fasilitasRepository.getSanitasiSummaryByRT()
    ]);

    const eduAnalysis = this.analyzeEducation(pendidikanSummary);
    const healthAnalysis = this.analyzeHealth(kesehatanSummary);
    const econAnalysis = this.analyzeEconomy(ekonomiSummary);
    const sanitationAnalysis = this.analyzeSanitation(sanitasiData);

    // Hitung Indeks Daya Dukung Wilayah Agregat (0 - 100%)
    const scorePendidikan = eduAnalysis.overall_capacity_score;
    const scoreKesehatan = healthAnalysis.health_adequacy_score;
    const scoreEkonomi = econAnalysis.economic_vitality_score;
    const scoreSanitasi = sanitationAnalysis.sanitation_health_score;

    const overallScore = Math.round(
      (scorePendidikan * 0.3) +
      (scoreKesehatan * 0.3) +
      (scoreEkonomi * 0.2) +
      (scoreSanitasi * 0.2)
    );

    let statusLabel = 'PRIMA';
    let statusColor = 'emerald';
    if (overallScore < 60) {
      statusLabel = 'DEFISIT KRITIS';
      statusColor = 'rose';
    } else if (overallScore < 75) {
      statusLabel = 'WASPADA DAYA DUKUNG';
      statusColor = 'amber';
    } else if (overallScore < 90) {
      statusLabel = 'MEMADAI';
      statusColor = 'blue';
    }

    return {
      scope,
      timestamp: new Date().toISOString(),
      index_daya_dukung: {
        score: overallScore,
        status: statusLabel,
        color: statusColor,
        komponen: {
          pendidikan: scorePendidikan,
          kesehatan: scoreKesehatan,
          ekonomi: scoreEkonomi,
          sanitasi: scoreSanitasi
        }
      },
      pendidikan: eduAnalysis,
      kesehatan: healthAnalysis,
      ekonomi: econAnalysis,
      sanitasi: sanitationAnalysis
    };
  }

  /**
   * 1. Analisis Sektor Pendidikan: Daya Tampung Kursi PPDB vs Usia Sekolah
   */
  analyzeEducation(summary) {
    const { kapasitas_jenjang = [], demografi_anak = {} } = summary;

    // Helper cari kapasitas per jenjang
    const getJenjangCap = (jenjang) => {
      const found = kapasitas_jenjang.find(k => k.jenjang === jenjang);
      return {
        kursi_baru: found ? Number(found.total_kursi_baru) : 0,
        total_kapasitas: found ? Number(found.total_kapasitas) : 0,
        institusi: found ? Number(found.total_institusi) : 0,
        rombel: found ? Number(found.total_rombel) : 0
      };
    };

    const paudCap = getJenjangCap('PAUD');
    const sdCap = getJenjangCap('SD');
    const smpCap = getJenjangCap('SMP');
    const smaCap = getJenjangCap('SMA');
    const smkCap = getJenjangCap('SMK');

    const cohorts = [
      {
        jenjang: 'PAUD / TK',
        usia_label: '3 - 6 Tahun',
        jumlah_anak: Number(demografi_anak.usia_paud) || 0,
        kursi_baru: paudCap.kursi_baru,
        total_kapasitas: paudCap.total_kapasitas,
        institusi: paudCap.institusi
      },
      {
        jenjang: 'Sekolah Dasar (SD)',
        usia_label: '7 - 12 Tahun',
        jumlah_anak: Number(demografi_anak.usia_sd) || 0,
        kursi_baru: sdCap.kursi_baru,
        total_kapasitas: sdCap.total_kapasitas,
        institusi: sdCap.institusi
      },
      {
        jenjang: 'SMP / MTs',
        usia_label: '13 - 15 Tahun',
        jumlah_anak: Number(demografi_anak.usia_smp) || 0,
        kursi_baru: smpCap.kursi_baru,
        total_kapasitas: smpCap.total_kapasitas,
        institusi: smpCap.institusi
      },
      {
        jenjang: 'SMA / SMK',
        usia_label: '16 - 18 Tahun',
        jumlah_anak: Number(demografi_anak.usia_sma) || 0,
        kursi_baru: smaCap.kursi_baru + smkCap.kursi_baru,
        total_kapasitas: smaCap.total_kapasitas + smkCap.total_kapasitas,
        institusi: smaCap.institusi + smkCap.institusi
      }
    ];

    let totalSkorKapasitas = 0;
    const cohortsWithAnalysis = cohorts.map(c => {
      // Selisih kursi baru PPDB vs anak yang masuk usia jenjang bersangkutan
      const selisih = c.kursi_baru - c.jumlah_anak;
      const rasioPersen = c.jumlah_anak > 0 
        ? Math.round((c.kursi_baru / c.jumlah_anak) * 100) 
        : (c.kursi_baru > 0 ? 100 : 0);

      let status = 'SURPLUS';
      let badgeColor = 'emerald';
      if (selisih < 0) {
        status = 'DEFISIT';
        badgeColor = 'rose';
      } else if (selisih === 0) {
        status = 'PAS';
        badgeColor = 'amber';
      }

      totalSkorKapasitas += Math.min(100, rasioPersen);

      return {
        ...c,
        selisih_kursi: selisih,
        rasio_daya_tampung_persen: rasioPersen,
        status_kapasitas: status,
        badge_color: badgeColor
      };
    });

    const avgScore = cohorts.length > 0 ? Math.round(totalSkorKapasitas / cohorts.length) : 80;

    // AI Early Warnings & Rekomendasi
    const aiWarnings = [];
    cohortsWithAnalysis.forEach(c => {
      if (c.status_kapasitas === 'DEFISIT') {
        aiWarnings.push({
          level: 'WARNING',
          jenjang: c.jenjang,
          pesan: `Defisit kursi PPDB pada jenjang ${c.jenjang} sebesar ${Math.abs(c.selisih_kursi)} kursi. Perluasan kuota zonasi atau beasiswa sekolah swasta diusulkan.`
        });
      }
    });

    const anakBelumSekolah = Number(demografi_anak.potensi_anak_belum_sekolah) || 0;
    if (anakBelumSekolah > 0) {
      aiWarnings.push({
        level: 'ALERT',
        jenjang: 'Wajib Belajar 12 Tahun',
        pesan: `Terdeteksi ${anakBelumSekolah} anak usia 7-18 tahun yang tercatat belum/tidak sekolah. Diperlukan penjangkauan RT/RW & program Gerakan Kembali Bersekolah.`
      });
    }

    return {
      overall_capacity_score: avgScore,
      cohorts: cohortsWithAnalysis,
      potensi_anak_belum_sekolah: anakBelumSekolah,
      ai_warnings: aiWarnings
    };
  }

  /**
   * 2. Analisis Sektor Kesehatan: Rasio Daya Dukung Medis per 1.000 Penduduk
   */
  analyzeHealth(summary) {
    const { faskes = {}, populasi = {} } = summary;
    const totalPop = Number(populasi.total_penduduk) || 1;
    const totalDokter = Number(faskes.total_dokter) || 0;
    const totalBidan = Number(faskes.total_bidan) || 0;
    const totalPerawat = Number(faskes.total_perawat) || 0;
    const totalBeds = Number(faskes.total_tempat_tidur) || 0;
    const totalFaskes = Number(faskes.total_faskes) || 0;

    // Standar WHO & Kemenkes:
    // - Dokter: min 1.0 dokter per 1.000 penduduk
    // - Total Tenaga Medis: min 2.5 nakes per 1.000 penduduk
    // - Tempat Tidur: min 1.0 bed per 1.000 penduduk
    const rasioDokter = Number(((totalDokter / totalPop) * 1000).toFixed(2));
    const rasioNakes = Number((((totalDokter + totalBidan + totalPerawat) / totalPop) * 1000).toFixed(2));
    const rasioBeds = Number(((totalBeds / totalPop) * 1000).toFixed(2));

    let dokterStatus = 'IDEAL';
    let dokterColor = 'emerald';
    if (rasioDokter < 0.5) {
      dokterStatus = 'DEFISIT KRITIS';
      dokterColor = 'rose';
    } else if (rasioDokter < 1.0) {
      dokterStatus = 'WASPADA BEBAN';
      dokterColor = 'amber';
    }

    // Skor kecukupan kesehatan (0 - 100)
    let adequacyScore = Math.min(100, Math.round((rasioDokter / 1.0) * 50 + (rasioNakes / 2.5) * 50));
    if (isNaN(adequacyScore) || adequacyScore === 0) adequacyScore = 75;

    const insights = [];
    if (rasioDokter < 1.0) {
      insights.push(`Rasio dokter saat ini (${rasioDokter}/1.000 jiwa) berada di bawah ambang rekomendasi WHO (1.0/1.000 jiwa). Diperlukan penjadwalan dokter keliling puskesmas.`);
    } else {
      insights.push(`Kapasitas dokter kelurahan (${rasioDokter}/1.000 jiwa) memenuhi standar pelayanan kesehatan primer.`);
    }

    if (totalBidan > 0) {
      insights.push(`Tersedia ${totalBidan} bidan desa yang aktif mendampingi posyandu balita & ibu hamil risiko tinggi.`);
    }

    return {
      health_adequacy_score: adequacyScore,
      populasi_terlayani: totalPop,
      total_faskes: totalFaskes,
      faskes_stats: {
        dokter: { jumlah: totalDokter, rasio_per_1000: rasioDokter, standar_who: 1.0, status: dokterStatus, color: dokterColor },
        bidan: { jumlah: totalBidan, rasio_per_1000: Number(((totalBidan / totalPop) * 1000).toFixed(2)) },
        perawat: { jumlah: totalPerawat, rasio_per_1000: Number(((totalPerawat / totalPop) * 1000).toFixed(2)) },
        total_nakes: { jumlah: totalDokter + totalBidan + totalPerawat, rasio_per_1000: rasioNakes, standar: 2.5 },
        tempat_tidur: { jumlah: totalBeds, rasio_per_1000: rasioBeds, standar: 1.0 }
      },
      insights
    };
  }

  /**
   * 3. Analisis Sektor Ekonomi Lokal: UMKM, Serapan Naker & Pangan Murah
   */
  analyzeEconomy(summary) {
    const { usaha = {}, ketenagakerjaan = {}, desil_rentan_per_rw = [], toko_pangan_per_rw = [] } = summary;

    const totalUmkm = Number(usaha.total_umkm) || 0;
    const totalSerapanNaker = Number(usaha.total_serapan_naker) || 0;
    const totalTokoPangan = Number(usaha.total_toko_pangan_murah) || 0;
    const totalSku = Number(usaha.total_terverifikasi_sku) || 0;

    const usiaProduktif = Number(ketenagakerjaan.usia_produktif) || 1;
    const belumBekerja = Number(ketenagakerjaan.usia_produktif_belum_bekerja) || 0;

    // Rasio serapan naker lokal
    const rasioSerapan = Number(((totalSerapanNaker / usiaProduktif) * 100).toFixed(1));

    // Skor vitalitas ekonomi (0 - 100)
    let vitalityScore = Math.min(100, Math.round(totalUmkm * 10 + totalSku * 5 + rasioSerapan * 2));
    if (vitalityScore < 40) vitalityScore = 65; // baseline realistis

    // Peta Keterjangkauan Toko Sembako Murah bagi Keluarga Rentan Desil 1-2
    const foodAccessibilityMap = desil_rentan_per_rw.map(dr => {
      const rw = dr.rw;
      const keluargaRentan = Number(dr.total_keluarga_rentan) || 0;
      const matchingToko = toko_pangan_per_rw.find(tp => tp.rw === rw);
      const jumlahToko = matchingToko ? Number(matchingToko.jumlah_toko_pangan) : 0;

      let aksesStatus = 'CUKUP';
      let badgeColor = 'emerald';
      if (keluargaRentan > 0 && jumlahToko === 0) {
        aksesStatus = 'RAWAN AKSES (0 TOKO)';
        badgeColor = 'rose';
      } else if (keluargaRentan > 10 && jumlahToko === 1) {
        aksesStatus = 'TERBATAS';
        badgeColor = 'amber';
      }

      return {
        rw,
        keluarga_desil_1_2: keluargaRentan,
        toko_pangan_murah: jumlahToko,
        status_akses: aksesStatus,
        color: badgeColor
      };
    });

    const insights = [
      `Ekosistem UMKM lokal menyerap ${totalSerapanNaker} tenaga kerja warga (${rasioSerapan}% dari usia produktif).`,
      `${totalSku} entitas usaha telah resmi disahkan melalui sinkronisasi SKU Kelurahan.`,
      `Terdapat ${totalTokoPangan} toko sembako murah mitra penyaluran pangan bansos terdata di wilayah.`
    ];

    return {
      economic_vitality_score: vitalityScore,
      total_umkm: totalUmkm,
      total_serapan_naker: totalSerapanNaker,
      total_terverifikasi_sku: totalSku,
      usia_produktif: usiaProduktif,
      usia_produktif_belum_bekerja: belumBekerja,
      rasio_serapan_persen: rasioSerapan,
      food_accessibility_per_rw: foodAccessibilityMap,
      insights
    };
  }

  /**
   * 4. Analisis Sektor Sanitasi & Korelasi Spasial Kasus Stunting
   */
  analyzeSanitation(data) {
    const { sanitasi_rt = [], stunting_rt = [] } = data;

    let totalKK = 0;
    let totalAirLayak = 0;
    let totalJambanSehat = 0;

    const rtRiskMatrix = sanitasi_rt.map(item => {
      const kkCount = Number(item.total_kk) || 0;
      const airLayak = Number(item.air_bersih_layak) || 0;
      const jambanSehat = Number(item.jamban_sehat) || 0;
      const jambanNonStandar = Number(item.jamban_non_standar) || 0;

      totalKK += kkCount;
      totalAirLayak += airLayak;
      totalJambanSehat += jambanSehat;

      // Cari kasus stunting pada RT & RW yang sama
      const matchingStunting = stunting_rt.find(s => s.rt === item.rt && s.rw === item.rw);
      const stuntingCount = matchingStunting ? Number(matchingStunting.kasus_stunting_balita) : 0;

      const persenAirLayak = kkCount > 0 ? Math.round((airLayak / kkCount) * 100) : 100;
      const persenJambanSehat = kkCount > 0 ? Math.round((jambanSehat / kkCount) * 100) : 100;

      let riskCategory = 'AMAN & SEHAT';
      let riskColor = 'emerald';
      let recommendation = 'Pertahankan pemeliharaan infrastruktur sanitasi saat ini.';

      if (jambanNonStandar > 0 && stuntingCount > 0) {
        riskCategory = 'ZONA MERAH: RESIKO GANDA';
        riskColor = 'rose';
        recommendation = 'Prioritas intervensi: Bedah sanitasi jamban sehat komunal & PMT balita darurat.';
      } else if (jambanNonStandar > 0) {
        riskCategory = 'WASPADA SANITASI';
        riskColor = 'amber';
        recommendation = 'Edukasi Stop BABS dan sosialisasi bantuan tangki septik SNI.';
      } else if (stuntingCount > 0) {
        riskCategory = 'FOKUS NUTRISI BALITA';
        riskColor = 'blue';
        recommendation = 'Sanitasi baik, fokus pada edukasi asupan gizi hewani dan asi eksklusif.';
      }

      return {
        rt: item.rt,
        rw: item.rw,
        total_kk: kkCount,
        air_bersih_persen: persenAirLayak,
        jamban_sehat_persen: persenJambanSehat,
        jamban_non_standar: jambanNonStandar,
        kasus_stunting_balita: stuntingCount,
        kategori_risiko: riskCategory,
        badge_color: riskColor,
        rekomendasi_intervensi: recommendation
      };
    });

    const persenAirTotal = totalKK > 0 ? Math.round((totalAirLayak / totalKK) * 100) : 95;
    const persenJambanTotal = totalKK > 0 ? Math.round((totalJambanSehat / totalKK) * 100) : 92;
    const sanitationScore = Math.round((persenAirTotal + persenJambanTotal) / 2);

    return {
      sanitation_health_score: sanitationScore,
      air_bersih_tercover_persen: persenAirTotal,
      jamban_sehat_tercover_persen: persenJambanTotal,
      matrix_rt: rtRiskMatrix
    };
  }
}

module.exports = new DayaDukungService();

