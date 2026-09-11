/**
 * src/services/ai_engine.service.js
 * Rule-Based AI Engine & Decision Support System (DSS)
 * Evidence-Based Governance for Kelurahan Kebonjati, Kec. Andir, Kota Bandung
 * Jabar Pintar Digital
 */

const analyticsRepository = require('../repositories/analytics.repository');

class AIEngineService {
  /**
   * Menghasilkan Executive Summary lengkap (KPI, Matriks Wilayah, & Rekomendasi AI)
   */
  async getExecutiveSummary(userSession = {}) {
    const scope = this.resolveScope(userSession);

    const [
      demography,
      balitaNutrition,
      lansiaHealth,
      bansosEquity,
      documentVelocity,
      complaints
    ] = await Promise.all([
      analyticsRepository.getDemographyStats(scope),
      analyticsRepository.getBalitaNutritionByRT(scope),
      analyticsRepository.getLansiaHealthByRT(scope),
      analyticsRepository.getBansosEquityByRT(scope),
      analyticsRepository.getDocumentVelocityStats(scope),
      analyticsRepository.getComplaintsStats()
    ]);

    // Jalankan Rule-Based Inference Engine
    const aiInsights = this.runInferenceRules({
      demography,
      balitaNutrition,
      lansiaHealth,
      bansosEquity,
      documentVelocity
    });

    // Susun Matriks Risiko RT terpadu
    const rtMatrix = this.buildRTRiskMatrix({
      balitaNutrition,
      lansiaHealth,
      bansosEquity
    });

    return {
      scope,
      timestamp: new Date().toISOString(),
      kpi: {
        demography,
        document_velocity: documentVelocity,
        complaints
      },
      rt_risk_matrix: rtMatrix,
      ai_insights: aiInsights
    };
  }

  /**
   * Menghasilkan daftar rekomendasi cerdas AI terperinci
   */
  async getAIInsights(userSession = {}) {
    const summary = await this.getExecutiveSummary(userSession);
    return summary.ai_insights;
  }

  /**
   * Menentukan scope wilayah berdasarkan hak akses session user
   */
  resolveScope(user) {
    if (!user) return {};
    if (user.role === 'ketua_rt') {
      return { rt: user.rt || '001', rw: user.rw || '001' };
    }
    if (['ketua_rw', 'admin_rw'].includes(user.role)) {
      return { rw: user.rw || '001' };
    }
    return {}; // Superadmin & Kelurahan memiliki akses makro seluruh wilayah
  }

  /**
   * Core Inference Rules Engine
   */
  runInferenceRules({ demography, balitaNutrition, lansiaHealth, bansosEquity, documentVelocity }) {
    const insights = [];

    // =========================================================================
    // RULE 1: DETEKSI KLUSTER STUNTING BALITA (RULE_STUNTING_CLUSTER)
    // =========================================================================
    balitaNutrition.per_rt.forEach((rtItem) => {
      const stuntingRisk = (rtItem.gizi_kurang || 0) + (rtItem.gizi_buruk || 0);
      const total = rtItem.total_pemeriksaan || 1;
      const rate = (stuntingRisk / total) * 100;

      if (stuntingRisk >= 2 || rate >= 15) {
        const affectedKids = balitaNutrition.at_risk_balita.filter(b => b.rt === rtItem.rt);
        insights.push({
          id: `INS-STUNTING-${rtItem.rt}`,
          category: 'KESEHATAN_BALITA',
          rule_code: 'RULE_STUNTING_CLUSTER',
          severity: 'CRITICAL',
          badge_label: 'Prioritas Intervensi Stunting',
          title: `Kluster Balita Berisiko Stunting Tinggi Terdeteksi di RT ${rtItem.rt}`,
          summary: `Tercatat ${stuntingRisk} balita (${rate.toFixed(1)}% dari total pemeriksaan) terindikasi gizi kurang/buruk di RT ${rtItem.rt} / RW ${rtItem.rw}.`,
          evidence: {
            wilayah: `RT ${rtItem.rt} / RW ${rtItem.rw}`,
            total_balita_diperiksa: rtItem.total_balita_unik,
            balita_gizi_buruk: rtItem.gizi_buruk,
            balita_gizi_kurang: rtItem.gizi_kurang,
            balita_gizi_baik: rtItem.gizi_baik,
            sample_terdampak: affectedKids.slice(0, 3).map(k => ({
              nama: k.nama_anak,
              usia_bulan: k.umur_bulan,
              status: k.status_gizi,
              orang_tua: k.nama_ortu
            }))
          },
          action_directives: [
            `Instruksikan Kader Posyandu mendistribusikan Paket PMT Pemulihan Protein Hewani (Telur, Susu, Daging) selama 30 hari berturut-turut di RT ${rtItem.rt}.`,
            `Jadwalkan kunjungan konseling gizi terpadu bersama tim nutrisionis Puskesmas Garuda ke RT ${rtItem.rt}.`,
            `Rekomendasikan keluarga terdampak ke dalam kuota Bantuan Sosial Balita Stunting Kelurahan.`
          ],
          impact_score: 95
        });
      } else if (stuntingRisk === 1) {
        insights.push({
          id: `INS-STUNTING-WARN-${rtItem.rt}`,
          category: 'KESEHATAN_BALITA',
          rule_code: 'RULE_STUNTING_MONITORING',
          severity: 'WARNING',
          badge_label: 'Pemantauan Gizi Ketat',
          title: `Perhatian Gizi Balita Terindikasi di RT ${rtItem.rt}`,
          summary: `Ditemukan 1 kasus balita dalam kategori gizi kurang di RT ${rtItem.rt}. Diperlukan mitigasi dini agar tidak berkembang menjadi stunting kronis.`,
          evidence: {
            wilayah: `RT ${rtItem.rt} / RW ${rtItem.rw}`,
            total_balita_diperiksa: rtItem.total_balita_unik,
            status: 'Gizi Kurang'
          },
          action_directives: [
            `Lakukan penimbangan dan pengukuran ulang antropometri 14 hari ke depan.`,
            `Berikan edukasi MPASI bernutrisi seimbang kepada orang tua balita.`
          ],
          impact_score: 65
        });
      }
    });

    // =========================================================================
    // RULE 2: PERINGATAN KOMORBID & KERENTANAN LANSIA (RULE_GERIATRIC_VULNERABILITY)
    // =========================================================================
    if (lansiaHealth.critical_lansia && lansiaHealth.critical_lansia.length > 0) {
      const topCritical = lansiaHealth.critical_lansia.slice(0, 5);
      const totalAlone = lansiaHealth.critical_lansia.filter(l => l.status_tinggal === 'Sebatang Kara').length;
      const totalSevereTensi = lansiaHealth.critical_lansia.filter(l => l.tensi_sistolik >= 160).length;

      insights.push({
        id: 'INS-GERIATRIC-CRITICAL',
        category: 'GERIATRI_LANSIA',
        rule_code: 'RULE_GERIATRIC_VULNERABILITY',
        severity: 'CRITICAL',
        badge_label: 'Kewaspadaan Komorbid Lansia',
        title: `Deteksi ${lansiaHealth.critical_lansia.length} Lansia Rawan Komorbid Berat & Isolasi Sosial`,
        summary: `Terdapat ${totalSevereTensi} lansia dengan hipertensi stage-2 ($\ge 160$ mmHg) dan ${totalAlone} lansia berstatus Sebatang Kara yang membutuhkan pemantauan intensif.`,
        evidence: {
          total_lansia_rawan: lansiaHealth.critical_lansia.length,
          total_sebatang_kara: totalAlone,
          total_hipertensi_berat: totalSevereTensi,
          daftar_prioritas: topCritical.map(l => ({
            nama: l.nama,
            usia: l.usia,
            wilayah: `RT ${l.rt} / RW ${l.rw}`,
            tensi: `${l.tensi_sistolik}/${l.tensi_diastolik}`,
            gula_darah: l.gula_darah_sewaktu ? `${l.gula_darah_sewaktu} mg/dL` : 'Belum diukur',
            status_tinggal: l.status_tinggal,
            kemandirian: l.skor_kemandirian_adl
          }))
        },
        action_directives: [
          `Aktifkan Program "Ketuk Pintu Lansia" (Home Care Visit) mingguan oleh perawat Puskesmas dan Ketua RT.`,
          `Daftarkan lansia sebatang kara ke dalam Bantuan Sosial Lansia Prioritas Kelurahan Kebonjati.`,
          `Sediakan pasokan obat antihipertensi & antidiabetes rutin melalui Posbindu Lansia.`
        ],
        impact_score: 90
      });
    }

    // =========================================================================
    // RULE 3: KEADILAN SOSIAL & KESENJANGAN BANSOS (RULE_BANSOS_EQUITY)
    // =========================================================================
    bansosEquity.forEach(b => {
      // Jika ada SKTM disahkan tapi belum ada bansos terealisasi
      if (b.total_sktm > 0 && b.disahkan_bansos === 0) {
        insights.push({
          id: `INS-EQUITY-${b.rt}`,
          category: 'BANTUAN_SOSIAL',
          rule_code: 'RULE_BANSOS_EQUITY',
          severity: 'WARNING',
          badge_label: 'Kesenjangan Penyaluran Bansos',
          title: `Disparitas Penyaluran Bantuan Sosial di RT ${b.rt}`,
          summary: `RT ${b.rt} mencatat ${b.total_sktm} keluarga dengan SKTM terverifikasi, namun belum ada alokasi bansos yang berstatus disahkan.`,
          evidence: {
            wilayah: `RT ${b.rt} / RW ${b.rw}`,
            total_keluarga_sktm: b.total_sktm,
            total_bansos_disahkan: b.disahkan_bansos,
            total_usulan_pending: b.pending_bansos
          },
          action_directives: [
            `Prioritaskan verifikasi usulan bansos dari RT ${b.rt} pada rapat penetapan alokasi berikutnya.`,
            `Lakukan audit lapangan bersama Ketua RT ${b.rt} untuk memastikan verifikasi bansos tidak terhambat administrasi.`
          ],
          impact_score: 78
        });
      }
    });

    // =========================================================================
    // RULE 4: VITALITAS DEMOGRAFI & BEBAN KETERGANTUNGAN (RULE_DEMOGRAPHIC_VITALITY)
    // =========================================================================
    if (demography.total_produktif > 0) {
      const nonProductive = (demography.total_balita || 0) + (demography.total_lansia || 0);
      const dependencyRatio = (nonProductive / demography.total_produktif) * 100;

      insights.push({
        id: 'INS-DEMOGRAPHY-RATIO',
        category: 'DEMOGRAFI',
        rule_code: 'RULE_DEMOGRAPHIC_VITALITY',
        severity: 'INFO',
        badge_label: 'Dinamika Kependudukan',
        title: `Rasio Ketergantungan Penduduk: ${dependencyRatio.toFixed(1)}%`,
        summary: `Kelurahan Kebonjati memiliki ${demography.total_warga_aktif} warga aktif. Setiap 100 penduduk usia produktif menopang sekitar ${Math.round(dependencyRatio)} jiwa usia non-produktif (balita & lansia).`,
        evidence: {
          total_warga: demography.total_warga_aktif,
          usia_produktif: demography.total_produktif,
          balita: demography.total_balita,
          lansia: demography.total_lansia,
          total_kepala_keluarga: demography.total_kk,
          angka_kematian_tercatat: demography.total_meninggal,
          angka_pindah_keluar: demography.total_pindah
        },
        action_directives: [
          `Optimalkan integrasi Posyandu Siklus Hidup untuk melayani balita dan lansia dalam satu titik layanan.`,
          `Rencanakan program pemberdayaan ekonomi keluarga bagi kepala keluarga di bawah garis kemiskinan.`
        ],
        impact_score: 50
      });
    }

    // Urutkan insight berdasarkan impact_score (prioritas tertinggi di paling atas)
    return insights.sort((a, b) => b.impact_score - a.impact_score);
  }

  /**
   * Membangun Matriks Risiko RT terpadu (Kompilasi Skor Kesehatan & Bansos)
   */
  buildRTRiskMatrix({ balitaNutrition, lansiaHealth, bansosEquity }) {
    // Kumpulkan semua RT unik
    const rtSet = new Set();
    balitaNutrition.per_rt.forEach(r => rtSet.add(r.rt));
    lansiaHealth.per_rt.forEach(r => rtSet.add(r.rt));
    bansosEquity.forEach(r => rtSet.add(r.rt));

    // Default ke RT 001, 002, 003 bila database baru mulai diisi
    ['001', '002', '003'].forEach(r => rtSet.add(r));

    const sortedRTs = Array.from(rtSet).sort();

    return sortedRTs.map((rt) => {
      const balita = balitaNutrition.per_rt.find(r => r.rt === rt) || {
        total_balita_unik: 0,
        gizi_kurang: 0,
        gizi_buruk: 0,
        gizi_baik: 0
      };

      const lansia = lansiaHealth.per_rt.find(r => r.rt === rt) || {
        total_lansia: 0,
        sebatang_kara: 0,
        hipertensi: 0,
        hipertensi_berat: 0,
        diabetes: 0,
        ketergantungan_tinggi: 0
      };

      const bansos = bansosEquity.find(r => r.rt === rt) || {
        total_sktm: 0,
        disahkan_bansos: 0,
        total_usulan_bansos: 0,
        total_nominal_disalurkan: 0
      };

      // Tentukan Level Risiko Stunting RT
      const stuntingRiskCount = balita.gizi_kurang + balita.gizi_buruk;
      let stuntingLevel = 'AMAN';
      if (stuntingRiskCount >= 2) stuntingLevel = 'TINGGI';
      else if (stuntingRiskCount === 1) stuntingLevel = 'WASPADA';

      // Tentukan Level Risiko Lansia RT
      let lansiaLevel = 'AMAN';
      if (lansia.hipertensi_berat >= 2 || (lansia.sebatang_kara >= 2)) lansiaLevel = 'TINGGI';
      else if (lansia.hipertensi >= 1 || lansia.sebatang_kara >= 1) lansiaLevel = 'WASPADA';

      // Status Kesejahteraan
      let bansosCoverage = 'TERPENUHI';
      if (bansos.total_sktm > bansos.disahkan_bansos) {
        bansosCoverage = 'PERLU_PERHATIAN';
      }

      return {
        rt,
        rw: '001',
        stunting: {
          level: stuntingLevel,
          kasus_rawan: stuntingRiskCount,
          total_balita: balita.total_balita_unik
        },
        geriatri: {
          level: lansiaLevel,
          hipertensi: lansia.hipertensi,
          hipertensi_berat: lansia.hipertensi_berat,
          sebatang_kara: lansia.sebatang_kara,
          total_lansia: lansia.total_lansia
        },
        bansos: {
          coverage: bansosCoverage,
          total_sktm: bansos.total_sktm,
          disahkan: bansos.disahkan_bansos,
          nominal: bansos.total_nominal_disalurkan
        }
      };
    });
  }
}

module.exports = new AIEngineService();

