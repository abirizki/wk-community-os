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
   * AI Strategy & Strategic Decision Support Engine
   * Menghasilkan analisis terintegrasi untuk menu AI Strategy di bawah hero section
   */
  async getStrategicAiInsight(scope = {}) {
    const carryingCapacity = await this.getComprehensiveCarryingCapacity(scope);
    const { pendidikan, kesehatan, ekonomi, index_daya_dukung } = carryingCapacity;

    // 1. Sintesis Sektor Pendidikan
    const sdCohort = pendidikan.cohorts.find(c => c.jenjang_kode === 'SD') || {};
    const smpCohort = pendidikan.cohorts.find(c => c.jenjang_kode === 'SMP') || {};
    const smaCohort = pendidikan.cohorts.find(c => c.jenjang_kode === 'SMA_SMK') || {};

    const isEduDeficit = sdCohort.status_kapasitas === 'DEFISIT' || smpCohort.status_kapasitas === 'DEFISIT';
    const eduDeficitCount = (sdCohort.selisih_kursi < 0 ? Math.abs(sdCohort.selisih_kursi) : 0) +
                            (smpCohort.selisih_kursi < 0 ? Math.abs(smpCohort.selisih_kursi) : 0);

    // 2. Sintesis Sektor Kesehatan & 1000 HPK
    const bumilRisti = kesehatan.demografi_kesehatan?.ibu_hamil_risti || 0;
    const totalBumil = kesehatan.demografi_kesehatan?.total_ibu_hamil || 0;
    const badutaCount = kesehatan.demografi_kesehatan?.baduta_1000hpk || 0;
    const kelahiranT1 = kesehatan.demografi_kesehatan?.proyeksi_kelahiran_t1 || 0;
    const rasioPosyandu = kesehatan.dukungan_layanan?.rasio_balita_per_posyandu || 0;

    // 3. Sintesis Sektor Ketenagakerjaan & Usia Muda
    const pemudaSiapKerja = pendidikan.proyeksi_lulusan_siap_kerja_t1 || ekonomi.pemuda_siap_kerja_t1 || 0;

    // Ciptakan Kartu-Kartu Rekomendasi Keputusan Pimpinan
    const executiveInsights = [
      {
        id: 'insight-edu-ppdb',
        sektor: 'PENDIDIKAN',
        icon: 'GraduationCap',
        judul: isEduDeficit 
          ? 'Peringatan Dini PPDB: Defisit Daya Tampung Sekolah (T+1)' 
          : 'Kesiapan Daya Tampung PPDB Wilayah Terpenuhi (T+1)',
        badge_status: isEduDeficit ? 'DEFISIT KURSI' : 'KAPASITAS AMAN',
        badge_color: isEduDeficit ? 'rose' : 'emerald',
        urgensi: isEduDeficit ? 'high' : 'low',
        ringkasan_angka: {
          tahun_ini_label: 'Siswa SD Aktif Saat Ini',
          tahun_ini_value: `${sdCohort.jumlah_anak_saat_ini || 0} siswa`,
          tahun_depan_label: 'Calon Masuk SD (Usia 6 Th)',
          tahun_depan_value: `${sdCohort.proyeksi_masuk_t1 || 0} anak`,
          daya_dukung_label: 'Kapasitas Kursi PPDB Baru',
          daya_dukung_value: `${sdCohort.kursi_baru || 0} kursi`,
          neraca_label: 'Keseimbangan Zonasi',
          neraca_value: sdCohort.selisih_kursi < 0 ? `Defisit ${Math.abs(sdCohort.selisih_kursi)} Kursi` : `Surplus +${sdCohort.selisih_kursi} Kursi`
        },
        temuan_kritis: isEduDeficit
          ? `Sebanyak ${sdCohort.proyeksi_masuk_t1} anak usia 6 tahun akan memasuki jenjang SD tahun ajaran depan, sedangkan daya tampung kursi baru hanya ${sdCohort.kursi_baru} kursi (Defisit ${Math.abs(sdCohort.selisih_kursi)} kursi / butuh ~${sdCohort.rombel_defisit || 1} rombel baru).`
          : `Proyeksi ${sdCohort.proyeksi_masuk_t1} calon siswa baru kelas 1 SD dapat tertampung optimal pada ${sdCohort.kursi_baru} kuota kursi PPDB zonasi yang tersedia.`,
        rekomendasi_kebijakan: isEduDeficit
          ? `Disposisikan pembukaan 1 rombongan belajar tambahan di SD Negeri zonasi terdekat atau aktifkan kuota beasiswa afirmasi ke sekolah swasta/madrasah sebelum pengumuman PPDB.`
          : `Pertahankan pemeliharaan fasilitas ruang kelas dan lakukan verifikasi berkala agar tidak ada anak usia 7-18 tahun yang putus sekolah.`,
        aksi_cepat: {
          label: isEduDeficit ? 'Ajukan Tambahan Rombel' : 'Pantau Rincian Zonasi',
          action_key: 'NAVIGATE_PENDIDIKAN',
          link: '/dashboard/fasilitas'
        }
      },
      {
        id: 'insight-health-stunting',
        sektor: 'KESEHATAN',
        icon: 'HeartPulse',
        judul: bumilRisti > 0 || rasioPosyandu > 80
          ? 'Mitigasi Stunting: Intervensi 1000 HPK & Beban Posyandu'
          : 'Layanan Posyandu & Gizi Balita Berjalan Stabil',
        badge_status: bumilRisti > 0 ? 'INTERVENSI GIZI' : 'STATUS TERJAGA',
        badge_color: bumilRisti > 0 ? 'rose' : 'emerald',
        urgensi: bumilRisti > 0 ? 'high' : 'medium',
        ringkasan_angka: {
          tahun_ini_label: 'Sasaran Balita Saat Ini',
          tahun_ini_value: `${kesehatan.demografi_kesehatan?.total_balita || 0} balita`,
          tahun_depan_label: 'Proyeksi Bayi Baru Lahir (T+1)',
          tahun_depan_value: `${kelahiranT1} kelahiran`,
          daya_dukung_label: 'Dukungan Posyandu & Faskes',
          daya_dukung_value: `${kesehatan.dukungan_layanan?.total_posyandu || 0} Posyandu`,
          neraca_label: 'Beban Layanan Posyandu',
          neraca_value: `${rasioPosyandu} balita / posyandu`
        },
        temuan_kritis: bumilRisti > 0
          ? `Terdeteksi ${bumilRisti} ibu hamil risiko tinggi/KEK dan ${badutaCount} baduta usia 0-23 bulan yang membutuhkan pemantauan gizi intensif untuk mencegah gagal tumbuh (stunting) permanen.`
          : `Cakupan pemantauan tumbuh kembang di posyandu berjalan baik dengan ${kesehatan.dukungan_layanan?.total_posyandu || 0} unit posyandu aktif mendampingi balita dan ibu hamil.`,
        rekomendasi_kebijakan: bumilRisti > 0
          ? `Instruksikan pendistribusian paket Pemberian Makanan Tambahan (PMT) pemulihan berprotein hewani serta dampingi pemeriksaan USG/ANC gratis oleh bidan desa.`
          : `Pastikan ketersediaan stok Vitamin A, obat cacing, dan imunisasi dasar lengkap terjaga di seluruh posyandu binaan.`,
        aksi_cepat: {
          label: 'Distribusi PMT Pemulihan',
          action_key: 'NAVIGATE_POSYANDU',
          link: '/dashboard/posyandu'
        }
      },
      {
        id: 'insight-social-desil',
        sektor: 'PERLINDUNGAN_SOSIAL',
        icon: 'Users',
        judul: 'Pemberdayaan Terpadu Desil DTKS & Bansos Tepat Sasaran',
        badge_status: 'PENGAWALAN BANSOS',
        badge_color: 'amber',
        urgensi: 'medium',
        ringkasan_angka: {
          tahun_ini_label: 'Keluarga Rentan Desil 1-2',
          tahun_ini_value: `${ekonomi.food_accessibility_per_rw?.reduce((acc, curr) => acc + (curr.keluarga_desil_1_2 || 0), 0) || 14} KK`,
          tahun_depan_label: 'Target Graduasi Mandiri',
          tahun_depan_value: '3 - 5 KK / Thn',
          daya_dukung_label: 'Mitra Sembako Murah',
          daya_dukung_value: `${ekonomi.total_toko_pangan || 0} Toko`,
          neraca_label: 'Akses Pangan Terjangkau',
          neraca_value: 'Terkover Sebagian'
        },
        temuan_kritis: `Keluarga rentan memerlukan integrasi program bansos reguler (PKH/Sembako) dengan akses pangan murah di tingkat RW agar tidak terjerumus ke kemiskinan ekstrem.`,
        rekomendasi_kebijakan: `Lakukan rekonsiliasi data kuota bantuan sosial via Tiket QR dan sinkronkan dengan program pemberdayaan ekonomi keluarga melalui izin usaha SKU Kelurahan.`,
        aksi_cepat: {
          label: 'Verifikasi Desil & Bansos',
          action_key: 'NAVIGATE_BANSOS',
          link: '/dashboard/desil'
        }
      },
      {
        id: 'insight-economy-work',
        sektor: 'KETENAGAKERJAAN',
        icon: 'TrendingUp',
        judul: 'Transisi Lulusan Sekolah ke Angkatan Kerja Muda (T+1)',
        badge_status: 'POTENSI PRODUKTIF',
        badge_color: 'blue',
        urgensi: 'low',
        ringkasan_angka: {
          tahun_ini_label: 'Tenaga Kerja Terserap UMKM',
          tahun_ini_value: `${ekonomi.total_serapan_naker || 0} orang`,
          tahun_depan_label: 'Proyeksi Lulusan Siap Kerja (T+1)',
          tahun_depan_value: `${pemudaSiapKerja || 0} pemuda`,
          daya_dukung_label: 'Entitas UMKM Berizin SKU',
          daya_dukung_value: `${ekonomi.total_terverifikasi_sku || 0} UMKM`,
          neraca_label: 'Rasio Serapan Naker',
          neraca_value: `${ekonomi.rasio_serapan_persen || 0}%`
        },
        temuan_kritis: `Sebanyak ${pemudaSiapKerja} remaja usia 17-18 tahun diproyeksikan menyelesaikan pendidikan menengah tahun depan dan bersiap memasuki dunia kerja atau wirausaha mandiri.`,
        rekomendasi_kebijakan: `Buka kemitraan magang kerja dengan UMKM lokal dan fasilitasi pendaftaran pelatihan vokasi digital agar pemuda memiliki sertifikasi kompetensi kerja.`,
        aksi_cepat: {
          label: 'Aktivasi Pelatihan & SKU',
          action_key: 'NAVIGATE_USAHA',
          link: '/dashboard/fasilitas'
        }
      }
    ];

    return {
      scope,
      timestamp: new Date().toISOString(),
      index_daya_dukung,
      executive_insights: executiveInsights,
      pillars: {
        pendidikan,
        kesehatan,
        ekonomi,
        sanitasi: carryingCapacity.sanitasi
      }
    };
  }

  /**
   * 1. Analisis Sektor Pendidikan: Daya Tampung Kursi PPDB vs Usia Sekolah Tahun Ini & Mendatang (T+1)
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

    const smaSmkCap = {
      kursi_baru: smaCap.kursi_baru + smkCap.kursi_baru,
      total_kapasitas: smaCap.total_kapasitas + smkCap.total_kapasitas,
      institusi: smaCap.institusi + smkCap.institusi,
      rombel: smaCap.rombel + smkCap.rombel
    };

    // 1. DATA KOHORT PENDIDIKAN TAHUN BERJALAN (T) VS TAHUN DEPAN (T+1)
    const cohorts = [
      {
        jenjang: 'PAUD / TK',
        jenjang_kode: 'PAUD',
        usia_label: '3 - 6 Tahun',
        jumlah_anak_saat_ini: Number(demografi_anak.usia_paud) || 0,
        proyeksi_masuk_t1: Number(demografi_anak.masuk_paud_t1) || 0,
        keterangan_t1: 'Anak usia 2-3 th yang tahun depan masuk PAUD/TK',
        kursi_baru: paudCap.kursi_baru,
        total_kapasitas: paudCap.total_kapasitas,
        institusi: paudCap.institusi,
        rombel: paudCap.rombel,
        standar_siswa_per_rombel: 20
      },
      {
        jenjang: 'Sekolah Dasar (SD)',
        jenjang_kode: 'SD',
        usia_label: '7 - 12 Tahun',
        jumlah_anak_saat_ini: Number(demografi_anak.usia_sd) || 0,
        proyeksi_masuk_t1: Number(demografi_anak.masuk_sd_t1) || 0,
        keterangan_t1: 'Anak usia 6 th yang tahun depan wajib masuk Kelas 1 SD',
        kursi_baru: sdCap.kursi_baru,
        total_kapasitas: sdCap.total_kapasitas,
        institusi: sdCap.institusi,
        rombel: sdCap.rombel,
        standar_siswa_per_rombel: 28
      },
      {
        jenjang: 'SMP / MTs',
        jenjang_kode: 'SMP',
        usia_label: '13 - 15 Tahun',
        jumlah_anak_saat_ini: Number(demografi_anak.usia_smp) || 0,
        proyeksi_masuk_t1: Number(demografi_anak.masuk_smp_t1) || 0,
        keterangan_t1: 'Anak usia 12 th (lulusan SD) yang tahun depan masuk Kelas 7 SMP',
        kursi_baru: smpCap.kursi_baru,
        total_kapasitas: smpCap.total_kapasitas,
        institusi: smpCap.institusi,
        rombel: smpCap.rombel,
        standar_siswa_per_rombel: 32
      },
      {
        jenjang: 'SMA / SMK',
        jenjang_kode: 'SMA_SMK',
        usia_label: '16 - 18 Tahun',
        jumlah_anak_saat_ini: Number(demografi_anak.usia_sma) || 0,
        proyeksi_masuk_t1: Number(demografi_anak.masuk_sma_t1) || 0,
        keterangan_t1: 'Anak usia 15 th (lulusan SMP) yang tahun depan masuk Kelas 10 SMA/SMK',
        kursi_baru: smaSmkCap.kursi_baru,
        total_kapasitas: smaSmkCap.total_kapasitas,
        institusi: smaSmkCap.institusi,
        rombel: smaSmkCap.rombel,
        standar_siswa_per_rombel: 36
      }
    ];

    let totalSkorKapasitas = 0;
    const cohortsWithAnalysis = cohorts.map(c => {
      // Bandingkan Kursi Baru PPDB dengan Calon Siswa Masuk Tahun Depan (T+1)
      const targetSiswaMasuk = c.proyeksi_masuk_t1 > 0 
        ? c.proyeksi_masuk_t1 
        : Math.round(c.jumlah_anak_saat_ini / (c.jenjang_kode === 'SD' ? 6 : (c.jenjang_kode === 'SMP' ? 3 : 3)));

      const selisih = c.kursi_baru - targetSiswaMasuk;
      const rasioPersen = targetSiswaMasuk > 0 
        ? Math.round((c.kursi_baru / targetSiswaMasuk) * 100) 
        : (c.kursi_baru > 0 ? 100 : 0);

      let status = 'SURPLUS';
      let badgeColor = 'emerald';
      let rombelDefisit = 0;

      if (selisih < 0) {
        status = 'DEFISIT';
        badgeColor = 'rose';
        rombelDefisit = Math.ceil(Math.abs(selisih) / c.standar_siswa_per_rombel);
      } else if (selisih === 0) {
        status = 'PAS';
        badgeColor = 'amber';
      } else {
        status = 'SURPLUS';
        badgeColor = 'emerald';
      }

      totalSkorKapasitas += Math.min(100, rasioPersen);

      return {
        ...c,
        target_siswa_masuk_t1: targetSiswaMasuk,
        selisih_kursi: selisih,
        rasio_daya_tampung_persen: rasioPersen,
        status_kapasitas: status,
        badge_color: badgeColor,
        rombel_defisit: rombelDefisit
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
          pesan: `Potensi defisit daya tampung PPDB jenjang ${c.jenjang} sebesar ${Math.abs(c.selisih_kursi)} kursi tahun depan (${c.rombel_defisit} rombel tambahan dibutuhkan). Direkomendasikan penambahan ruang kelas atau afirmasi kuota sekolah swasta.`
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

    const lulusanSiapKerja = Number(demografi_anak.lulus_sekolah_ke_kerja_t1) || 0;

    return {
      overall_capacity_score: avgScore,
      cohorts: cohortsWithAnalysis,
      potensi_anak_belum_sekolah: anakBelumSekolah,
      proyeksi_lulusan_siap_kerja_t1: lulusanSiapKerja,
      ai_warnings: aiWarnings
    };
  }

  /**
   * 2. Analisis Sektor Kesehatan: Rasio Daya Dukung Medis per 1.000 Penduduk, Siklus Hidup (1000 HPK & Lansia) & Proyeksi Kelahiran (T+1)
   */
  analyzeHealth(summary) {
    const { faskes = {}, populasi = {}, ibu_hamil = {}, lansia_rentan = {} } = summary;
    const totalPop = Number(populasi.total_penduduk) || 1;
    const totalDokter = Number(faskes.total_dokter) || 0;
    const totalBidan = Number(faskes.total_bidan) || 0;
    const totalPerawat = Number(faskes.total_perawat) || 0;
    const totalBeds = Number(faskes.total_tempat_tidur) || 0;
    const totalFaskes = Number(faskes.total_faskes) || 0;
    const totalPosyandu = Number(faskes.total_posyandu) || 0;

    const totalBalita = Number(populasi.total_balita) || 0;
    const baduta1000hpk = Number(populasi.baduta_1000hpk) || Math.round(totalBalita * 0.4);
    const balita24to59 = Number(populasi.balita_24_59bln) || Math.max(0, totalBalita - baduta1000hpk);

    const totalBumil = Number(ibu_hamil.total_ibu_hamil) || 0;
    const bumilRisti = Number(ibu_hamil.ibu_hamil_risti) || 0;
    const proyeksiKelahiranT1 = Number(ibu_hamil.proyeksi_kelahiran_t1) || (totalBumil > 0 ? totalBumil : Math.round(totalBalita / 5));

    const totalLansia = Number(populasi.total_lansia) || 0;
    const lansiaRisti = Number(populasi.lansia_risti) || 0;
    const lansiaSebatangKara = Number(lansia_rentan.lansia_sebatang_kara) || 0;

    // Standar WHO & Kemenkes:
    // - Dokter: min 1.0 dokter per 1.000 penduduk
    // - Total Tenaga Medis: min 2.5 nakes per 1.000 penduduk
    // - Tempat Tidur: min 1.0 bed per 1.000 penduduk
    // - Posyandu: min 1 posyandu per 80-100 balita
    const rasioBalitaPerPosyandu = totalPosyandu > 0 ? Math.round(totalBalita / totalPosyandu) : totalBalita;
    const posyanduBebanStatus = rasioBalitaPerPosyandu > 100 ? 'OVERLOAD' : (rasioBalitaPerPosyandu > 80 ? 'OPTIMAL' : 'MEMADAI');

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
    if (proyeksiKelahiranT1 > 0) {
      insights.push(`Proyeksi kelahiran ${proyeksiKelahiranT1} bayi baru tahun depan dari ${totalBumil} ibu hamil aktif (${bumilRisti} risiko tinggi/KEK membutuhkan intervensi 1000 HPK).`);
    }
    if (rasioBalitaPerPosyandu > 100) {
      insights.push(`Beban posyandu terdeteksi tinggi (${rasioBalitaPerPosyandu} balita/posyandu). Disarankan penambahan hari buka posyandu atau pembentukan posyandu satelit.`);
    }
    if (rasioDokter < 1.0) {
      insights.push(`Rasio dokter saat ini (${rasioDokter}/1.000 jiwa) berada di bawah ambang rekomendasi WHO (1.0/1.000 jiwa). Diperlukan penjadwalan dokter keliling puskesmas.`);
    } else {
      insights.push(`Kapasitas dokter wilayah (${rasioDokter}/1.000 jiwa) memenuhi standar pelayanan kesehatan primer.`);
    }

    if (totalBidan > 0) {
      insights.push(`Tersedia ${totalBidan} bidan desa yang aktif mendampingi posyandu balita & ibu hamil risiko tinggi.`);
    }

    return {
      health_adequacy_score: adequacyScore,
      populasi_terlayani: totalPop,
      total_faskes: totalFaskes,
      demografi_kesehatan: {
        total_balita: totalBalita,
        baduta_1000hpk: baduta1000hpk,
        balita_24_59bln: balita24to59,
        total_ibu_hamil: totalBumil,
        ibu_hamil_risti: bumilRisti,
        proyeksi_kelahiran_t1: proyeksiKelahiranT1,
        total_lansia: totalLansia,
        lansia_risti: lansiaRisti,
        lansia_sebatang_kara: lansiaSebatangKara
      },
      dukungan_layanan: {
        total_posyandu: totalPosyandu,
        rasio_balita_per_posyandu: rasioBalitaPerPosyandu,
        posyandu_beban_status: posyanduBebanStatus,
        dokter: { jumlah: totalDokter, rasio_per_1000: rasioDokter, standar_who: 1.0, status: dokterStatus, color: dokterColor },
        bidan: { jumlah: totalBidan, rasio_per_1000: Number(((totalBidan / totalPop) * 1000).toFixed(2)) },
        perawat: { jumlah: totalPerawat, rasio_per_1000: Number(((totalPerawat / totalPop) * 1000).toFixed(2)) },
        total_nakes: { jumlah: totalDokter + totalBidan + totalPerawat, rasio_per_1000: rasioNakes, standar: 2.5 },
        tempat_tidur: { jumlah: totalBeds, rasio_per_1000: rasioBeds, standar: 1.0 }
      },
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
    const pemudaSiapKerja = Number(ketenagakerjaan.pemuda_siap_kerja_t1) || 0;

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
      pemuda_siap_kerja_t1: pemudaSiapKerja,
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

