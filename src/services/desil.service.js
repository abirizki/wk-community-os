/**
 * src/services/desil.service.js
 * Business Logic Layer for Desil Kesejahteraan (DTSEN BPS & Kemensos)
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const desilRepository = require('../repositories/desil.repository');

class DesilService {
  /**
   * Algoritma Proxy Means Testing (PMT) Mandiri
   * Mengkalkulasi estimasi desil usulan (1 s/d 10) berbasis indikator DTSEN
   */
  calculatePMTDesil(data) {
    // 1. Hard Gate: Kepemilikan mobil otomatis mengunci pada kelompok mampu (Desil 7–10)
    if (data.kepemilikan_mobil === true || data.kepemilikan_mobil === 1 || data.kepemilikan_mobil === '1') {
      return 8; // Desil 8: Menengah ke Atas (Non-Bansos)
    }

    let score = 0;

    // A. Daya Listrik (Skor 0 - 30)
    const daya = data.daya_listrik || '900 VA';
    if (daya === 'Tanpa Meteran') score += 2;
    else if (daya === '450 VA') score += 5;
    else if (daya === '900 VA') score += 14;
    else if (daya === '1300 VA') score += 24;
    else score += 30; // > 1300 VA

    // B. Status Kepemilikan Rumah (Skor 0 - 20)
    const rumah = data.status_rumah || 'Milik Sendiri';
    if (rumah === 'Bebas Sewa' || rumah === 'Menumpang') score += 3;
    else if (rumah === 'Sewa/Kontrak') score += 8;
    else score += 16; // Milik Sendiri

    // C. Sumber Air Minum (Skor 0 - 15)
    const air = data.sumber_air || 'PDAM/Leding';
    if (air === 'Sumur Tidak Terlindung') score += 2;
    else if (air === 'Sumur Terlindung') score += 5;
    else if (air === 'PDAM/Leding') score += 10;
    else score += 14; // Air Kemasan/Isi Ulang

    // D. Kepadatan Luas Lantai per Kapita (Skor 0 - 15)
    const lantai = data.luas_lantai_kategori || '8 - 14 m2';
    if (lantai === '< 8 m2 (Padat)') score += 3;
    else if (lantai === '8 - 14 m2') score += 8;
    else score += 15; // > 14 m2

    // E. Bahan Bakar Memasak (Skor 0 - 10)
    const bbm = data.bahan_bakar_memasak || 'Gas 3kg';
    if (bbm === 'Minyak/Kayu') score += 1;
    else if (bbm === 'Gas 3kg') score += 4;
    else score += 10; // Gas > 3kg / Listrik

    // F. Aset Sepeda Motor (Skor 0 - 10)
    const motor = data.kepemilikan_motor || '1 unit';
    if (motor === '0 unit') score += 0;
    else if (motor === '1 unit') score += 5;
    else score += 10; // >= 2 unit

    // G. Pengurang Skor untuk Beban Kerentanan Khusus (Vulnerability Mitigator)
    if (data.ada_disabilitas_lansia_tunggal) score -= 6;
    if (data.ada_anak_sekolah_pip) score -= 4;

    score = Math.max(0, Math.min(100, score));

    // Mapping Skor ke Desil (1 s/d 10)
    // Desil 1: 0 - 15 (10% Terbawah / Sangat Miskin Ekstrem)
    if (score <= 15) return 1;
    if (score <= 25) return 2;
    if (score <= 36) return 3;
    if (score <= 48) return 4;
    if (score <= 60) return 5;
    if (score <= 70) return 6;
    if (score <= 80) return 7;
    if (score <= 90) return 8;
    if (score <= 95) return 9;
    return 10;
  }

  /**
   * Mengambil status desil keluarga pengguna yang sedang login
   */
  async getMyFamilyDesil(user) {
    let no_kk = user.no_kk;
    if (!no_kk && user.username && user.username.length === 16) {
      no_kk = user.username;
    }
    if (!no_kk) {
      throw new Error('Nomor Kartu Keluarga tidak terdeteksi pada sesi Anda.');
    }

    const data = await desilRepository.findByNoKK(no_kk);
    return data || {
      no_kk,
      desil_saat_ini: null,
      desil_usulan: 4,
      status_verifikasi: 'DRAFT_USULAN',
      daya_listrik: '900 VA',
      status_rumah: 'Milik Sendiri',
      sumber_air: 'PDAM/Leding',
      luas_lantai_kategori: '8 - 14 m2',
      bahan_bakar_memasak: 'Gas 3kg',
      kepemilikan_motor: '1 unit',
      kepemilikan_mobil: 0
    };
  }

  /**
   * Menyimpan kuesioner awal indikator mandiri (Draft)
   */
  async saveDraft(payload, user) {
    const no_kk = payload.no_kk || user.no_kk;
    if (!no_kk) throw new Error('Nomor Kartu Keluarga wajib diisi.');

    // Hitung taksiran desil usulan secara otomatis
    const desil_usulan = this.calculatePMTDesil(payload);
    payload.desil_usulan = desil_usulan;

    return desilRepository.upsertDraft(no_kk, payload, user.id, user.role);
  }

  /**
   * Mengajukan pengesahan pembaruan desil resmi dengan bukti kementerian
   */
  async submitUpdateWithBukti(payload, user) {
    const no_kk = payload.no_kk || user.no_kk;
    if (!no_kk) throw new Error('Nomor Kartu Keluarga wajib diisi.');

    if (!payload.bukti_kementerian_url && !payload.id_dtks_kemensos) {
      throw new Error('Wajib melampirkan berkas bukti kementerian (Cek Bansos / DTSEN BPS) atau ID DTKS.');
    }

    const desil_usulan = payload.desil_usulan || this.calculatePMTDesil(payload);
    payload.desil_usulan = desil_usulan;

    return desilRepository.submitUpdateWithBukti(no_kk, payload, user.id, user.role);
  }

  /**
   * Pengesahan desil oleh Admin Kelurahan
   */
  async verifyDesil(id, { status, desilFinal, catatan }, user) {
    const allowedRoles = ['superadmin', 'admin_kelurahan', 'admin'];
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Hanya Admin Kelurahan yang memiliki wewenang mengesahkan status Desil resmi.');
    }

    if (!['VERIFIED_KELURAHAN', 'REJECTED'].includes(status)) {
      throw new Error('Status verifikasi tidak valid.');
    }

    const desil = await desilRepository.findById(id);
    if (!desil) throw new Error('Data permohonan desil tidak ditemukan.');

    const finalDesilVal = status === 'VERIFIED_KELURAHAN' ? (parseInt(desilFinal, 10) || desil.desil_usulan) : null;

    return desilRepository.verifyDesil(id, status, finalDesilVal, catatan, user.id);
  }

  /**
   * Daftar permohonan dan statistik
   */
  async listDesil(filters, user) {
    const scope = this.resolveScope(user);
    return desilRepository.listDesil(filters, scope);
  }

  async getDesilStats(user) {
    const scope = this.resolveScope(user);
    return desilRepository.getDesilStats(scope);
  }

  resolveScope(user) {
    if (!user) return {};
    if (user.role === 'ketua_rt') return { rt: user.rt, rw: user.rw };
    if (user.role === 'ketua_rw' || user.role === 'admin_rw') return { rw: user.rw };
    return {}; // Kelurahan / Superadmin melihat makro
  }
}

module.exports = new DesilService();

