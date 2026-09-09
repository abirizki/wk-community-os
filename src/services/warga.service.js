/**
 * src/services/warga.service.js
 * Business Logic Layer for Warga entity.
 * Business Logic Layer for Warga entity, Assisted RT Mode, & Bulk Import.
 * Bumi Warga - Jabar Pintar Digital
 */

const bcrypt = require('bcryptjs');
const wargaRepository = require('../repositories/warga.repository');
const userRepository = require('../repositories/user.repository');

class WargaService {
  /**
   * Ambil data warga berdasarkan NIK
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async getByNik(nik) {
    if (!nik || nik.length < 5) {
      const err = new Error('NIK tidak valid atau terlalu pendek');
      err.status = 400;
      throw err;
    }

    const warga = await wargaRepository.findByNik(nik);
    
    if (!warga) {
      const err = new Error('Data Warga tidak ditemukan');
      err.status = 404;
      throw err;
    }

    return warga;
  }

  /**
   * Ambil daftar warga
   * @param {Object} options 
   * @returns {Promise<Array>}
   * Ambil daftar warga ter-scope hierarki dan terpaginasi
   */
  async listWarga({ limit = 20, offset = 0 } = {}) {
    return await wargaRepository.list({ limit, offset });
  async listWarga({ limit = 20, offset = 0, search = '', rt, rw } = {}, currentUser = {}) {
    let targetRT = rt || null;
    let targetRW = rw || null;

    // Terapkan isolasi wilayah
    if (currentUser.role === 'ketua_rt') {
      targetRT = currentUser.rt;
      targetRW = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      targetRW = currentUser.rw;
    }

    const items = await wargaRepository.list({
      limit: parseInt(limit, 10) || 20,
      offset: parseInt(offset, 10) || 0,
      search: search.trim(),
      rt: targetRT,
      rw: targetRW
    });

    const total = await wargaRepository.count({
      search: search.trim(),
      rt: targetRT,
      rw: targetRW
    });

    return {
      items,
      total,
      limit: parseInt(limit, 10) || 20,
      offset: parseInt(offset, 10) || 0
    };
  }

  /**
   * Pendaftaran Warga Terbantu (Asistensi Offline oleh RT/RW)
   */
  async registerAssistedWarga(payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya RT, RW, dan Admin yang berwenang melakukan asistensi pendaftaran warga.');
      err.status = 403;
      throw err;
    }

    let {
      nik,
      no_kk,
      nama,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      agama = 'Islam',
      status_perkawinan = 'Belum Kawin',
      status_hubungan_keluarga = 'Anak',
      pekerjaan = 'Belum Bekerja',
      pendidikan_terakhir = 'SMA/SMK',
      golongan_darah = 'Tidak Tahu',
      alamat,
      rt,
      rw,
      no_telepon,
      email
    } = payload;

    // Enforce RT/RW scope locking
    if (currentUser.role === 'ketua_rt') {
      rt = currentUser.rt;
      rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      rw = currentUser.rw;
    }

    if (!nik || String(nik).trim().length !== 16) {
      const err = new Error('NIK harus berupa 16 digit angka.');
      err.status = 400;
      throw err;
    }

    if (!no_kk || String(no_kk).trim().length !== 16) {
      const err = new Error('Nomor Kartu Keluarga (No KK) harus berupa 16 digit angka.');
      err.status = 400;
      throw err;
    }

    if (!nama || nama.trim() === '') {
      const err = new Error('Nama lengkap warga wajib diisi.');
      err.status = 400;
      throw err;
    }

    if (!tanggal_lahir) {
      const err = new Error('Tanggal lahir warga wajib diisi.');
      err.status = 400;
      throw err;
    }

    const cleanNik = String(nik).trim();
    const cleanNoKk = String(no_kk).trim();
    const cleanNama = nama.trim();

    // 1. Cek apakah NIK sudah terdaftar di data warga
    const existingWarga = await wargaRepository.findByNik(cleanNik);
    if (existingWarga) {
      const err = new Error(`Warga dengan NIK ${cleanNik} sudah terdaftar dalam sistem.`);
      err.status = 400;
      throw err;
    }

    // 2. Buat atau update Kartu Keluarga
    await wargaRepository.upsertKartuKeluarga({
      no_kk: cleanNoKk,
      kepala_keluarga: status_hubungan_keluarga === 'Kepala Keluarga' ? cleanNama : '',
      alamat: alamat || 'Jl. Kebonjati',
      rt,
      rw
    });

    // 3. Buat akun user portal otomatis jika belum ada
    let userId = null;
    const existingUser = await userRepository.findByUsername(cleanNik);
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('password123', salt);

      const newUser = await userRepository.createUser({
        username: cleanNik,
        password_hash: defaultPasswordHash,
        nama: cleanNama,
        role: 'warga',
        rt,
        rw,
        created_by_user_id: currentUser.id,
        status: 'active'
      });
      userId = newUser.id;
    }

    // 4. Masukkan ke database warga
    await wargaRepository.create({
      user_id: userId,
      nik: cleanNik,
      no_kk: cleanNoKk,
      nama: cleanNama,
      jenis_kelamin: jenis_kelamin || 'L',
      tempat_lahir: tempat_lahir || 'Bandung',
      tanggal_lahir,
      agama,
      status_perkawinan,
      status_hubungan_keluarga,
      pekerjaan,
      pendidikan_terakhir,
      golongan_darah,
      alamat: alamat || 'Jl. Kebonjati',
      rt,
      rw,
      no_telepon: no_telepon || null,
      email: email || null,
      status_kependudukan: 'Tetap'
    });

    return await wargaRepository.findByNik(cleanNik);
  }

  /**
   * Import Massal Data Sensus (Excel/CSV parsed JSON array)
   */
  async bulkImportWarga(records, currentUser) {
    const allowedRoles = ['admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya Admin Kelurahan dan Super Admin yang berwenang melakukan import massal.');
      err.status = 403;
      throw err;
    }

    if (!Array.isArray(records) || records.length === 0) {
      const err = new Error('Data import tidak valid atau kosong.');
      err.status = 400;
      throw err;
    }

    const summary = {
      total: records.length,
      imported: 0,
      skipped: 0,
      errors: []
    };

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      try {
        const cleanNik = String(row.nik || '').trim();
        const cleanNoKk = String(row.no_kk || '').trim();
        const cleanNama = String(row.nama || '').trim();

        if (cleanNik.length !== 16 || cleanNoKk.length !== 16 || !cleanNama) {
          summary.skipped++;
          summary.errors.push(`Baris #${rowNum}: NIK (${cleanNik}) atau No KK (${cleanNoKk}) tidak 16 digit, atau nama kosong.`);
          continue;
        }

        // Cek jika NIK sudah ada
        const existing = await wargaRepository.findByNik(cleanNik);
        if (existing) {
          summary.skipped++;
          continue; // Lewati jika sudah ada
        }

        const rt = String(row.rt || '001').padStart(3, '0');
        const rw = String(row.rw || '001').padStart(3, '0');
        const hub = row.status_hubungan_keluarga || 'Anggota Keluarga';

        // Upsert Kartu Keluarga
        await wargaRepository.upsertKartuKeluarga({
          no_kk: cleanNoKk,
          kepala_keluarga: hub === 'Kepala Keluarga' ? cleanNama : '',
          alamat: row.alamat || 'Jl. Kebonjati',
          rt,
          rw
        });

        // Buat akun user
        let userId = null;
        const existingUser = await userRepository.findByUsername(cleanNik);
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const newUser = await userRepository.createUser({
            username: cleanNik,
            password_hash: defaultPasswordHash,
            nama: cleanNama,
            role: 'warga',
            rt,
            rw,
            created_by_user_id: currentUser.id,
            status: 'active'
          });
          userId = newUser.id;
        }

        // Insert Warga
        await wargaRepository.create({
          user_id: userId,
          nik: cleanNik,
          no_kk: cleanNoKk,
          nama: cleanNama,
          jenis_kelamin: (row.jenis_kelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
          tempat_lahir: row.tempat_lahir || 'Bandung',
          tanggal_lahir: row.tanggal_lahir || '1990-01-01',
          agama: row.agama || 'Islam',
          status_perkawinan: row.status_perkawinan || 'Belum Kawin',
          status_hubungan_keluarga: hub,
          pekerjaan: row.pekerjaan || 'Belum Bekerja',
          pendidikan_terakhir: row.pendidikan_terakhir || 'SMA/SMK',
          golongan_darah: row.golongan_darah || 'Tidak Tahu',
          alamat: row.alamat || 'Jl. Kebonjati',
          rt,
          rw,
          no_telepon: row.no_telepon || null,
          email: row.email || null,
          status_kependudukan: 'Tetap'
        });

        summary.imported++;
      } catch (rowErr) {
        summary.skipped++;
        summary.errors.push(`Baris #${rowNum} (NIK: ${row.nik}): ${rowErr.message}`);
      }
    }

    return summary;
  }
}

module.exports = new WargaService();

