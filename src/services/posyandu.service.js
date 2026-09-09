/**
 * src/services/posyandu.service.js
 * Business Logic Layer for Posyandu.
 * Business Logic Layer for Posyandu Balita & Posyandu Lansia.
 * Bumi Warga - Jabar Pintar Digital
 */

const posyanduRepository = require('../repositories/posyandu.repository');

class PosyanduService {
  // ----------------------------------------------------
  // BALITA BUSINESS LOGIC
  // ----------------------------------------------------

  /**
   * Catat rekam medis baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   * Hitung estimasi status gizi antropometri balita
   */
  async createRecord(payload) {
    const { 
  calculateStatusGizi(umur_bulan, berat_badan_kg, tinggi_badan_cm) {
    const imt = parseFloat((berat_badan_kg / Math.pow(tinggi_badan_cm / 100, 2)).toFixed(1));
    
    if (imt < 13.0) return 'Gizi Buruk';
    if (imt < 14.5) return 'Gizi Kurang';
    if (imt <= 18.0) return 'Normal';
    if (imt <= 19.5) return 'Risiko Lebih';
    return 'Obesitas';
  }

  /**
   * Catat rekam medis balita baru
   */
  async createRecord(payload, currentUser) {
    let { 
      nik_warga, 
      nama_anak, 
      tanggal_lahir_anak,
      jenis_kelamin_anak = 'L',
      umur_bulan, 
      berat_badan_kg, 
      tinggi_badan_cm, 
      tanggal_pemeriksaan 
      lingkar_kepala_cm,
      status_gizi,
      imunisasi,
      tanggal_pemeriksaan,
      petugas,
      catatan_kesehatan
    } = payload;

    if (!nik_warga) {
      const err = new Error('NIK Wali tidak ditemukan dalam sesi');
      err.status = 400;
    // Proteksi NIK: jika warga biasa, kunci ke identitas sesi
    if (!currentUser) {
      const err = new Error('Sesi autentikasi tidak ditemukan');
      err.status = 401;
      throw err;
    }

    if (currentUser.role === 'warga') {
      nik_warga = currentUser.active_nik || currentUser.username;
    } else if (!nik_warga) {
      nik_warga = currentUser.active_nik || currentUser.username;
    }

    if (!nama_anak || nama_anak.trim() === '') {
      const err = new Error('Nama anak wajib diisi');
      err.status = 400;
      throw err;
    }

    if (isNaN(berat_badan_kg) || parseFloat(berat_badan_kg) <= 0) {
    const bb = parseFloat(berat_badan_kg);
    const tb = parseFloat(tinggi_badan_cm);
    const umur = parseInt(umur_bulan, 10);

    if (isNaN(bb) || bb <= 0) {
      const err = new Error('Berat badan harus berupa angka positif');
      err.status = 400;
      throw err;
    }

    if (isNaN(tinggi_badan_cm) || parseFloat(tinggi_badan_cm) <= 0) {
    if (isNaN(tb) || tb <= 0) {
      const err = new Error('Tinggi badan harus berupa angka positif');
      err.status = 400;
      throw err;
    }

    const result = await posyanduRepository.create(payload);
    
    return {
      id: result.insertId,
      ...payload
    if (isNaN(umur) || umur < 0) {
      const err = new Error('Umur anak dalam bulan tidak boleh negatif');
      err.status = 400;
      throw err;
    }

    // Hitung status gizi otomatis jika belum diisi
    if (!status_gizi || status_gizi === 'Auto') {
      status_gizi = this.calculateStatusGizi(umur, bb, tb);
    }

    const recordData = {
      nik_warga,
      nama_anak: nama_anak.trim(),
      tanggal_lahir_anak: tanggal_lahir_anak || null,
      jenis_kelamin_anak,
      umur_bulan: umur,
      berat_badan_kg: bb,
      tinggi_badan_cm: tb,
      lingkar_kepala_cm: lingkar_kepala_cm ? parseFloat(lingkar_kepala_cm) : null,
      status_gizi,
      imunisasi: imunisasi || null,
      tanggal_pemeriksaan: tanggal_pemeriksaan || new Date(),
      petugas: petugas || currentUser.nama || 'Kader Posyandu',
      catatan_kesehatan: catatan_kesehatan || null
    };

    const result = await posyanduRepository.create(recordData);
    return { id: result.insertId, ...recordData };
  }

  /**
   * Ambil riwayat posyandu berdasarkan NIK ortu/wali
   * @param {string} nik 
   * @returns {Promise<Array>}
   * Ambil riwayat posyandu balita keluarga
   */
  async getHistoryByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }

    return await posyanduRepository.findByNik(nik);
  }

  /**
   * Daftar balita sesuai hierarki pengguna
   */
  async listBalita(currentUser, query = {}) {
    const scope = this.resolveScope(currentUser, query);
    return await posyanduRepository.listBalita({
      ...scope,
      search: query.search || '',
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    });
  }

  /**
   * Statistik balita sesuai hierarki
   */
  async getBalitaStats(currentUser, query = {}) {
    const scope = this.resolveScope(currentUser, query);
    return await posyanduRepository.getBalitaStats(scope);
  }

  // ----------------------------------------------------
  // LANSIA BUSINESS LOGIC
  // ----------------------------------------------------

  /**
   * Hitung IMT lansia
   */
  calculateImt(bb_kg, tb_cm) {
    if (!bb_kg || !tb_cm || tb_cm <= 0) return null;
    const tb_m = tb_cm / 100;
    return parseFloat((bb_kg / (tb_m * tb_m)).toFixed(1));
  }

  /**
   * Klasifikasi kesehatan lansia
   */
  classifyLansiaHealth(imt, tensi_sistolik, tensi_diastolik, gds) {
    let imtStatus = 'Normal';
    if (imt < 18.5) imtStatus = 'Kurus';
    else if (imt > 27.0) imtStatus = 'Obesitas';
    else if (imt > 25.0) imtStatus = 'Gemuk';

    let tensiStatus = 'Normal';
    if (tensi_sistolik >= 160 || tensi_diastolik >= 100) tensiStatus = 'Hipertensi Tk 2';
    else if (tensi_sistolik >= 140 || tensi_diastolik >= 90) tensiStatus = 'Hipertensi Tk 1';
    else if (tensi_sistolik >= 120 || tensi_diastolik >= 80) tensiStatus = 'Prehipertensi';

    let gdsStatus = null;
    if (gds) {
      if (gds >= 200) gdsStatus = 'Diabetes';
      else if (gds >= 140) gdsStatus = 'Pre-diabetes';
      else gdsStatus = 'Normal';
    }

    return { imtStatus, tensiStatus, gdsStatus };
  }

  /**
   * Daftarkan Lansia Baru
   */
  async registerLansia(payload, currentUser) {
    const { nik, nama, tanggal_lahir, jenis_kelamin, alamat, status_tinggal, riwayat_penyakit } = payload;
    let { rt, rw } = payload;

    if (!nik || nik.length < 16) {
      const err = new Error('NIK lansia harus 16 digit');
      err.status = 400;
      throw err;
    }

    if (!nama || nama.trim() === '') {
      const err = new Error('Nama lansia wajib diisi');
      err.status = 400;
      throw err;
    }

    // Kunci RT/RW sesuai otoritas pengguna
    if (currentUser.role === 'ketua_rt') {
      rt = currentUser.rt;
      rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      rw = currentUser.rw;
    }

    if (!rt || !rw) {
      const err = new Error('Wilayah RT dan RW wajib dicantumkan');
      err.status = 400;
      throw err;
    }

    // Cek duplikasi di posyandu_lansia
    const existing = await posyanduRepository.findLansiaByNik(nik);
    if (existing) {
      const err = new Error(`Lansia dengan NIK ${nik} sudah terdaftar di Posyandu Lansia.`);
      err.status = 400;
      throw err;
    }

    return await posyanduRepository.createLansia({
      nik,
      nama: nama.trim(),
      tanggal_lahir,
      jenis_kelamin,
      alamat: alamat || 'Kelurahan Kebonjati',
      rt,
      rw,
      status_tinggal: status_tinggal || 'Bersama Keluarga',
      riwayat_penyakit: riwayat_penyakit || null
    });
  }

  /**
   * Catat rekam medis pemeriksaan lansia
   */
  async recordPemeriksaanLansia(payload, currentUser) {
    const {
      posyandu_lansia_id,
      tanggal_pemeriksaan = new Date(),
      tensi_sistolik,
      tensi_diastolik,
      gula_darah_sewaktu,
      kolesterol,
      asam_urat,
      berat_badan_kg,
      tinggi_badan_cm,
      skor_kemandirian_adl = 'Mandiri',
      keluhan,
      tindakan_petugas,
      petugas
    } = payload;

    if (!posyandu_lansia_id) {
      const err = new Error('ID lansia wajib ditentukan');
      err.status = 400;
      throw err;
    }

    const sistolik = parseInt(tensi_sistolik, 10);
    const diastolik = parseInt(tensi_diastolik, 10);
    const bb = parseFloat(berat_badan_kg);
    const tb = parseFloat(tinggi_badan_cm);

    if (isNaN(sistolik) || isNaN(diastolik) || sistolik <= 0 || diastolik <= 0) {
      const err = new Error('Tekanan darah sistolik dan diastolik harus berupa angka positif');
      err.status = 400;
      throw err;
    }

    if (isNaN(bb) || isNaN(tb) || bb <= 0 || tb <= 0) {
      const err = new Error('Berat badan dan tinggi badan harus berupa angka positif');
      err.status = 400;
      throw err;
    }

    const imt = this.calculateImt(bb, tb);

    const record = await posyanduRepository.createPemeriksaanLansia({
      posyandu_lansia_id,
      tanggal_pemeriksaan,
      tensi_sistolik: sistolik,
      tensi_diastolik: diastolik,
      gula_darah_sewaktu: gula_darah_sewaktu ? parseInt(gula_darah_sewaktu, 10) : null,
      kolesterol: kolesterol ? parseInt(kolesterol, 10) : null,
      asam_urat: asam_urat ? parseFloat(asam_urat) : null,
      berat_badan_kg: bb,
      tinggi_badan_cm: tb,
      imt,
      skor_kemandirian_adl,
      keluhan: keluhan || null,
      tindakan_petugas: tindakan_petugas || null,
      petugas: petugas || currentUser.nama || 'Kader Posyandu Lansia'
    });

    return record;
  }

  /**
   * Daftar lansia dengan pemeriksaan terakhirnya
   */
  async listLansia(currentUser, query = {}) {
    const scope = this.resolveScope(currentUser, query);
    const lansiaList = await posyanduRepository.listLansia({
      ...scope,
      search: query.search || '',
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    });

    // Perkaya data dengan indikator status kesehatan otomatis
    return lansiaList.map((item) => {
      const health = this.classifyLansiaHealth(
        item.imt,
        item.tensi_sistolik,
        item.tensi_diastolik,
        item.gula_darah_sewaktu
      );
      return {
        ...item,
        status_imt: health.imtStatus,
        status_tensi: health.tensiStatus,
        status_gds: health.gdsStatus,
        is_hipertensi: item.tensi_sistolik >= 140 || item.tensi_diastolik >= 90,
        is_diabetes: item.gula_darah_sewaktu >= 200
      };
    });
  }

  /**
   * Riwayat pemeriksaan lansia
   */
  async getLansiaHistory(lansiaId) {
    if (!lansiaId) {
      const err = new Error('ID Lansia tidak valid');
      err.status = 400;
      throw err;
    }
    return await posyanduRepository.getPemeriksaanHistoryByLansiaId(lansiaId);
  }

  /**
   * Ambil data lansia milik keluarga dari warga yang sedang aktif login
   */
  async getFamilyLansia(currentUser) {
    const activeNik = currentUser.active_nik || currentUser.username;
    const list = await posyanduRepository.findLansiaByFamilyNik(activeNik);
    return list.map((item) => {
      const health = this.classifyLansiaHealth(
        item.imt,
        item.tensi_sistolik,
        item.tensi_diastolik,
        item.gula_darah_sewaktu
      );
      return {
        ...item,
        status_imt: health.imtStatus,
        status_tensi: health.tensiStatus,
        status_gds: health.gdsStatus,
        is_hipertensi: item.tensi_sistolik >= 140 || item.tensi_diastolik >= 90,
        is_diabetes: item.gula_darah_sewaktu >= 200
      };
    });
  }

  /**
   * Statistik lansia sesuai hierarki
   */
  async getLansiaStats(currentUser, query = {}) {
    const scope = this.resolveScope(currentUser, query);
    return await posyanduRepository.getLansiaStats(scope);
  }

  // ----------------------------------------------------
  // UTILITY / SCOPE RESOLVER
  // ----------------------------------------------------
  resolveScope(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    if (role === 'ketua_rt') {
      return { rt, rw };
    }
    if (role === 'ketua_rw' || role === 'admin_rw') {
      return { rw, rt: query.rt || null };
    }
    if (role === 'kader_posyandu') {
      return { rw: rw || null, rt: rt || null };
    }
    // Superadmin & Admin Kelurahan
    return {
      rw: query.rw || null,
      rt: query.rt || null
    };
  }
}

module.exports = new PosyanduService();

