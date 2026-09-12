/**
 * src/services/completeness.service.js
 * Inference Engine: Skor Kelengkapan Profil Warga & AI Lintas Peran
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

class CompletenessService {
  /**
   * Hitung Skor Kelengkapan Warga Berbasis 4 Pilar Komposit
   * @param {Object} warga Data warga kependudukan
   * @param {Object|null} desil Data desil_keluarga (jika ada)
   * @param {Array|null} posyanduBalita Rekam posyandu balita
   * @param {Array|null} posyanduLansia Rekam posyandu lansia
   * @param {Object|null} user Akun login sistem
   * @returns {Object} Hasil evaluasi 4 pilar, missing fields, dan rekomendasi
   */
  calculateCitizenScore(warga, desil = null, posyanduBalita = null, posyanduLansia = null, user = null) {
    if (!warga) return { score: 0, pillars: {}, missing_fields: [], tier: 'EMPTY' };

    const missing = [];
    const quickWins = [];

    // ==========================================
    // PILAR 1: IDENTITAS POKOK (Maksimal 30 Poin)
    // ==========================================
    let pilar1 = 0;
    
    // NIK valid (16 digit)
    const isNikValid = warga.nik && String(warga.nik).trim().length === 16 && /^\d+$/.test(String(warga.nik).trim());
    if (isNikValid) {
      pilar1 += 6;
    } else {
      missing.push({ field: 'nik', label: 'Nomor Induk Kependudukan (NIK 16 Digit)', weight: 6, pilar: 1 });
    }

    // Nama Lengkap
    if (warga.nama && warga.nama.trim().length >= 3) {
      pilar1 += 4;
    } else {
      missing.push({ field: 'nama', label: 'Nama Lengkap Resmi', weight: 4, pilar: 1 });
    }

    // Jenis Kelamin
    if (warga.jenis_kelamin === 'L' || warga.jenis_kelamin === 'P') {
      pilar1 += 3;
    } else {
      missing.push({ field: 'jenis_kelamin', label: 'Jenis Kelamin (L/P)', weight: 3, pilar: 1 });
    }

    // Tempat & Tanggal Lahir
    const hasTempatLahir = Boolean(warga.tempat_lahir && warga.tempat_lahir.trim().length > 1);
    const hasTanggalLahir = Boolean(warga.tanggal_lahir && !isNaN(new Date(warga.tanggal_lahir).getTime()));
    if (hasTempatLahir && hasTanggalLahir) {
      pilar1 += 4;
    } else {
      missing.push({ field: 'ttl', label: 'Tempat & Tanggal Lahir Lengkap', weight: 4, pilar: 1 });
    }

    // Agama
    if (warga.agama && warga.agama !== 'Lainnya') {
      pilar1 += 3;
    } else if (warga.agama) {
      pilar1 += 2;
    } else {
      missing.push({ field: 'agama', label: 'Agama Terdaftar', weight: 3, pilar: 1 });
    }

    // Status Perkawinan
    if (warga.status_perkawinan) {
      pilar1 += 3;
    } else {
      missing.push({ field: 'status_perkawinan', label: 'Status Perkawinan', weight: 3, pilar: 1 });
    }

    // Pekerjaan
    if (warga.pekerjaan && warga.pekerjaan.trim() !== '' && warga.pekerjaan !== '-') {
      pilar1 += 4;
    } else {
      missing.push({ field: 'pekerjaan', label: 'Profesi / Mata Pencaharian', weight: 4, pilar: 1 });
      quickWins.push({ action: 'Lengkapi jenis pekerjaan / mata pencaharian', point: '+4 Poin' });
    }

    // Alamat & RT/RW
    const hasAlamat = Boolean(warga.alamat && warga.alamat.trim().length > 3);
    const hasRtRw = Boolean(warga.rt && warga.rw);
    if (hasAlamat && hasRtRw) {
      pilar1 += 3;
    } else {
      missing.push({ field: 'alamat', label: 'Alamat Domisili & Nomor RT/RW', weight: 3, pilar: 1 });
    }

    // ==========================================
    // PILAR 2: KONTAK & AKSES AKUN (Maksimal 25 Poin)
    // ==========================================
    let pilar2 = 0;

    // No. Telepon / WhatsApp
    const hasPhone = Boolean(warga.no_telepon && String(warga.no_telepon).replace(/\D/g, '').length >= 9);
    if (hasPhone) {
      pilar2 += 10;
    } else {
      missing.push({ field: 'no_telepon', label: 'Nomor WhatsApp / HP Aktif', weight: 10, pilar: 2 });
      quickWins.push({ action: 'Cantumkan Nomor WhatsApp aktif untuk notifikasi surat & bansos', point: '+10 Poin' });
    }

    // Email
    const hasEmail = Boolean(warga.email && warga.email.includes('@') && warga.email.includes('.'));
    if (hasEmail) {
      pilar2 += 5;
    } else {
      missing.push({ field: 'email', label: 'Alamat Email Terverifikasi', weight: 5, pilar: 2 });
      quickWins.push({ action: 'Isi alamat email aktif', point: '+5 Poin' });
    }

    // Akun Sistem Aktif
    const hasActiveAccount = Boolean(warga.user_id || (user && user.status === 'active'));
    if (hasActiveAccount) {
      pilar2 += 5;
    } else {
      missing.push({ field: 'user_id', label: 'Aktivasi Akun Login Mandiri', weight: 5, pilar: 2 });
    }

    // Foto Profil / KTP
    const hasFoto = Boolean(warga.foto_url && warga.foto_url.trim().length > 5);
    if (hasFoto) {
      pilar2 += 5;
    } else {
      missing.push({ field: 'foto_url', label: 'Foto Profil / Identitas Warga', weight: 5, pilar: 2 });
      quickWins.push({ action: 'Unggah foto profil / identitas resmi', point: '+5 Poin' });
    }

    // ==========================================
    // PILAR 3: KARTU KELUARGA & SOSIAL (Maksimal 25 Poin)
    // ==========================================
    let pilar3 = 0;

    // Nomor Kartu Keluarga Valid
    const hasNoKK = Boolean(warga.no_kk && String(warga.no_kk).trim().length === 16 && /^\d+$/.test(String(warga.no_kk).trim()));
    if (hasNoKK) {
      pilar3 += 8;
    } else {
      missing.push({ field: 'no_kk', label: 'Nomor Kartu Keluarga (16 Digit)', weight: 8, pilar: 3 });
    }

    // Hubungan Keluarga
    if (warga.status_hubungan_keluarga) {
      pilar3 += 6;
    } else {
      missing.push({ field: 'status_hubungan_keluarga', label: 'Hubungan dalam Kartu Keluarga', weight: 6, pilar: 3 });
    }

    // Pendidikan Terakhir
    if (warga.pendidikan_terakhir) {
      pilar3 += 5;
    } else {
      missing.push({ field: 'pendidikan_terakhir', label: 'Tingkat Pendidikan Terakhir', weight: 5, pilar: 3 });
      quickWins.push({ action: 'Pilih jenjang pendidikan terakhir', point: '+5 Poin' });
    }

    // Status Desil Kesejahteraan DTSEN
    const hasDesil = Boolean(desil && (desil.desil_saat_ini || desil.desil_usulan));
    if (hasDesil) {
      pilar3 += 6;
    } else {
      missing.push({ field: 'desil', label: 'Indikator Desil Kesejahteraan DTSEN', weight: 6, pilar: 3 });
      quickWins.push({ action: 'Isi kuesioner Desil DTSEN Mandiri', point: '+6 Poin' });
    }

    // ==========================================
    // PILAR 4: KESEHATAN & KERENTANAN (Maksimal 20 Poin)
    // ==========================================
    let pilar4 = 0;

    // Golongan Darah
    const hasGoldar = Boolean(warga.golongan_darah && warga.golongan_darah !== 'Tidak Tahu');
    if (hasGoldar) {
      pilar4 += 6;
    } else {
      missing.push({ field: 'golongan_darah', label: 'Data Golongan Darah Resmi', weight: 6, pilar: 4 });
      quickWins.push({ action: 'Pilih golongan darah (A, B, AB, atau O)', point: '+6 Poin' });
    }

    // Rekam Posyandu & Kerentanan Usia
    const umurTahun = warga.tanggal_lahir 
      ? Math.floor((new Date() - new Date(warga.tanggal_lahir)) / (365.25 * 24 * 60 * 60 * 1000))
      : 25;

    if (umurTahun < 5) {
      // Balita: Wajib antropometri berat/tinggi
      const hasBalitaRecord = Boolean(posyanduBalita && posyanduBalita.length > 0);
      if (hasBalitaRecord) {
        pilar4 += 14;
      } else {
        missing.push({ field: 'posyandu_balita', label: 'Rekam Penimbangan & Antropometri Balita di Posyandu', weight: 14, pilar: 4 });
        quickWins.push({ action: 'Lakukan penimbangan balita di Posyandu Melati', point: '+14 Poin' });
      }
    } else if (umurTahun >= 60) {
      // Lansia: Wajib tensi & gula darah
      const hasLansiaRecord = Boolean(posyanduLansia && posyanduLansia.length > 0);
      if (hasLansiaRecord) {
        pilar4 += 14;
      } else {
        missing.push({ field: 'posyandu_lansia', label: 'Rekam Pemeriksaan Tensi / Gula Darah Posyandu Lansia', weight: 14, pilar: 4 });
        quickWins.push({ action: 'Lakukan skrining kesehatan di Posyandu Lansia', point: '+14 Poin' });
      }
    } else {
      // Usia Produktif: default terpenuhi jika tidak ada riwayat penyakit parah
      pilar4 += 14;
    }

    // ==========================================
    // SKOR TOTAL & EVALUASI TIER
    // ==========================================
    const totalScore = Math.min(100, Math.round(pilar1 + pilar2 + pilar3 + pilar4));
    
    let tier = 'NEEDS_COMPLETION';
    let tierLabel = 'Perlu Dilengkapi';
    let tierColor = 'rose';
    let autoFillEligible = false;

    if (totalScore >= 80) {
      tier = 'EXCELLENT';
      tierLabel = 'Sangat Lengkap';
      tierColor = 'emerald';
      autoFillEligible = true; // Syarat AI Auto-Fill Surat Terpenuhi
    } else if (totalScore >= 50) {
      tier = 'GOOD';
      tierLabel = 'Cukup Lengkap';
      tierColor = 'blue';
    }

    return {
      nik: warga.nik,
      nama: warga.nama,
      no_kk: warga.no_kk,
      rt: warga.rt,
      rw: warga.rw,
      total_score: totalScore,
      tier,
      tier_label: tierLabel,
      tier_color: tierColor,
      auto_fill_eligible: autoFillEligible,
      pillars: {
        pilar1_identitas: { score: pilar1, max: 30, percentage: Math.round((pilar1 / 30) * 100), label: 'Identitas Pokok' },
        pilar2_kontak: { score: pilar2, max: 25, percentage: Math.round((pilar2 / 25) * 100), label: 'Kontak & Akun' },
        pilar3_keluarga: { score: pilar3, max: 25, percentage: Math.round((pilar3 / 25) * 100), label: 'KK & Sosial' },
        pilar4_kesehatan: { score: pilar4, max: 20, percentage: Math.round((pilar4 / 20) * 100), label: 'Kesehatan' }
      },
      missing_fields: missing,
      quick_wins: quickWins.slice(0, 3)
    };
  }

  /**
   * AI Door-to-Door Nudge: Prioritas kunjungan RT Assisted Mode
   */
  buildDoorToDoorNudgeList(wargaListWithScores) {
    const list = wargaListWithScores
      .filter(item => item.total_score < 50)
      .map(item => {
        let priority = 'MEDIUM';
        let priorityReason = 'Data identitas belum lengkap';

        if (item.umurTahun < 5 && item.missing_fields.some(m => m.field === 'posyandu_balita')) {
          priority = 'HIGH';
          priorityReason = 'Balita tanpa rekam pemantauan posyandu stunting';
        } else if (item.umurTahun >= 60 && item.missing_fields.some(m => m.field === 'posyandu_lansia')) {
          priority = 'HIGH';
          priorityReason = 'Lansia tanpa rekam tensi & skrining kesehatan';
        } else if (item.missing_fields.some(m => m.field === 'no_telepon')) {
          priorityReason = 'Belum ada nomor WhatsApp/HP untuk koordinasi warga';
        } else if (item.missing_fields.some(m => m.field === 'desil')) {
          priorityReason = 'Indikator desil bansos DTSEN belum terdata';
        }

        return {
          nik: item.nik,
          nama: item.nama,
          no_kk: item.no_kk,
          rt: item.rt,
          rw: item.rw,
          score: item.total_score,
          priority,
          priority_reason: priorityReason,
          missing_count: item.missing_fields.length,
          missing_labels: item.missing_fields.slice(0, 3).map(m => m.label)
        };
      });

    // Urutkan prioritas HIGH terlebih dahulu, kemudian skor terendah
    return list.sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
      return a.score - b.score;
    });
  }

  /**
   * AI Anomaly Detection: Deteksi ketidaksesuaian data kependudukan
   */
  detectAnomalies(wargaRows, kkRows = []) {
    const anomalies = [];

    // 1. Cek duplikasi NIK atau format salah
    const nikSeen = new Set();
    for (const w of wargaRows) {
      const cleanNik = String(w.nik || '').trim();
      if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
        anomalies.push({
          type: 'INVALID_NIK_FORMAT',
          severity: 'HIGH',
          nik: w.nik,
          nama: w.nama,
          rt: w.rt,
          rw: w.rw,
          issue: `Format NIK tidak valid (${cleanNik.length} digit, standar 16 digit angka)`,
          recommendation: 'Lakukan perbaikan NIK sesuai dokumen fisik e-KTP/Kartu Keluarga.'
        });
      } else if (nikSeen.has(cleanNik)) {
        anomalies.push({
          type: 'DUPLICATE_NIK',
          severity: 'CRITICAL',
          nik: w.nik,
          nama: w.nama,
          rt: w.rt,
          rw: w.rw,
          issue: `Terdeteksi NIK ganda dalam basis data: ${cleanNik}`,
          recommendation: 'Verifikasi NIK asli dengan pemegang akun untuk mencegah benturan identitas.'
        });
      }
      nikSeen.add(cleanNik);

      // 2. Usia tidak wajar (Masa Depan atau > 115 Tahun)
      if (w.tanggal_lahir) {
        const tgl = new Date(w.tanggal_lahir);
        const now = new Date();
        if (tgl > now) {
          anomalies.push({
            type: 'FUTURE_BIRTH_DATE',
            severity: 'CRITICAL',
            nik: w.nik,
            nama: w.nama,
            rt: w.rt,
            rw: w.rw,
            issue: `Tanggal lahir tercatat di masa depan: ${w.tanggal_lahir}`,
            recommendation: 'Koreksi tanggal lahir warga pada sistem kependudukan.'
          });
        }
        const age = Math.floor((now - tgl) / (365.25 * 24 * 60 * 60 * 1000));
        if (age > 115) {
          anomalies.push({
            type: 'UNUSUAL_SUPERCENTENARIAN',
            severity: 'MEDIUM',
            nik: w.nik,
            nama: w.nama,
            rt: w.rt,
            rw: w.rw,
            issue: `Usia tercatat ${age} tahun (> 115 tahun)`,
            recommendation: 'Konfirmasi fisik dan status kependudukan warga di lapangan.'
          });
        }
        // 3. Hubungan Kepala Keluarga tapi usia anak-anak (< 16 tahun)
        if (w.status_hubungan_keluarga === 'Kepala Keluarga' && age < 16) {
          anomalies.push({
            type: 'UNDERAGE_HEAD_OF_FAMILY',
            severity: 'HIGH',
            nik: w.nik,
            nama: w.nama,
            rt: w.rt,
            rw: w.rw,
            issue: `Tercatat sebagai Kepala Keluarga namun usia baru ${age} tahun`,
            recommendation: 'Periksa kesesuaian Nomor KK dan susunan anggota keluarga.'
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Hitung Data Fidelity Confidence Score untuk pimpinan (0 - 100%)
   */
  calculateDataFidelityConfidence(averageCompleteness, verifiedPercentage = 90) {
    // 60% bobot kelengkapan profil + 40% verifikasi
    const confidence = Math.round((averageCompleteness * 0.6) + (verifiedPercentage * 0.4));
    let level = 'HIGH';
    let badgeColor = 'emerald';
    let explanation = 'Data sangat akurat dan terverifikasi untuk perumusan kebijakan strategis.';

    if (confidence < 50) {
      level = 'LOW';
      badgeColor = 'rose';
      explanation = 'Tingkat kelengkapan data masih rendah. Diperlukan sensus terarah sebelum alokasi anggaran.';
    } else if (confidence < 75) {
      level = 'MODERATE';
      badgeColor = 'amber';
      explanation = 'Data memadai untuk estimasi umum, namun beberapa RT membutuhkan pemutakhiran data primer.';
    }

    return {
      confidence_score: confidence,
      level,
      badge_color: badgeColor,
      explanation
    };
  }
}

module.exports = new CompletenessService();

