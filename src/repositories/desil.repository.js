/**
 * src/repositories/desil.repository.js
 * Data Access Layer for Desil Kesejahteraan (DTSEN BPS & Kemensos)
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class DesilRepository {
  /**
   * Mengambil data profil desil berdasarkan Nomor KK
   */
  async findByNoKK(no_kk) {
    const [rows] = await pool.execute(
      `SELECT d.*, kk.kepala_keluarga, kk.alamat, kk.rt, kk.rw, kk.kelurahan
       FROM desil_keluarga d
       JOIN kartu_keluarga kk ON d.no_kk = kk.no_kk
       WHERE d.no_kk = ? LIMIT 1`,
      [no_kk]
    );
    return rows[0] || null;
  }

  /**
   * Mengambil data profil desil berdasarkan ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT d.*, kk.kepala_keluarga, kk.alamat, kk.rt, kk.rw, kk.kelurahan
       FROM desil_keluarga d
       JOIN kartu_keluarga kk ON d.no_kk = kk.no_kk
       WHERE d.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Menyimpan / memperbarui draft usulan kuesioner DTSEN mandiri
   */
  async upsertDraft(no_kk, data, userId, userRole) {
    const query = `
      INSERT INTO desil_keluarga (
        no_kk, desil_usulan, daya_listrik, status_rumah, sumber_air,
        luas_lantai_kategori, bahan_bakar_memasak, kepemilikan_motor, kepemilikan_mobil,
        ada_disabilitas_lansia_tunggal, ada_anak_sekolah_pip, id_dtks_kemensos,
        status_verifikasi, diajukan_oleh_user_id, diajukan_oleh_role, tanggal_pengajuan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT_USULAN', ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        desil_usulan = VALUES(desil_usulan),
        daya_listrik = VALUES(daya_listrik),
        status_rumah = VALUES(status_rumah),
        sumber_air = VALUES(sumber_air),
        luas_lantai_kategori = VALUES(luas_lantai_kategori),
        bahan_bakar_memasak = VALUES(bahan_bakar_memasak),
        kepemilikan_motor = VALUES(kepemilikan_motor),
        kepemilikan_mobil = VALUES(kepemilikan_mobil),
        ada_disabilitas_lansia_tunggal = VALUES(ada_disabilitas_lansia_tunggal),
        ada_anak_sekolah_pip = VALUES(ada_anak_sekolah_pip),
        id_dtks_kemensos = VALUES(id_dtks_kemensos),
        diajukan_oleh_user_id = VALUES(diajukan_oleh_user_id),
        diajukan_oleh_role = VALUES(diajukan_oleh_role),
        tanggal_pengajuan = NOW()
    `;

    await pool.execute(query, [
      no_kk,
      data.desil_usulan,
      data.daya_listrik || '900 VA',
      data.status_rumah || 'Milik Sendiri',
      data.sumber_air || 'PDAM/Leding',
      data.luas_lantai_kategori || '8 - 14 m2',
      data.bahan_bakar_memasak || 'Gas 3kg',
      data.kepemilikan_motor || '1 unit',
      data.kepemilikan_mobil ? 1 : 0,
      data.ada_disabilitas_lansia_tunggal ? 1 : 0,
      data.ada_anak_sekolah_pip ? 1 : 0,
      data.id_dtks_kemensos || null,
      userId || null,
      userRole || 'warga'
    ]);

    return this.findByNoKK(no_kk);
  }

  /**
   * Mengajukan pembaruan desil resmi ke kelurahan dengan melampirkan berkas bukti kementerian
   */
  async submitUpdateWithBukti(no_kk, data, userId, userRole) {
    const query = `
      INSERT INTO desil_keluarga (
        no_kk, desil_usulan, daya_listrik, status_rumah, sumber_air,
        luas_lantai_kategori, bahan_bakar_memasak, kepemilikan_motor, kepemilikan_mobil,
        ada_disabilitas_lansia_tunggal, ada_anak_sekolah_pip, id_dtks_kemensos,
        bukti_kementerian_url, nomor_referensi_bukti,
        status_verifikasi, diajukan_oleh_user_id, diajukan_oleh_role, tanggal_pengajuan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MENUNGGU_VERIFIKASI_KELURAHAN', ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        desil_usulan = VALUES(desil_usulan),
        daya_listrik = VALUES(daya_listrik),
        status_rumah = VALUES(status_rumah),
        sumber_air = VALUES(sumber_air),
        luas_lantai_kategori = VALUES(luas_lantai_kategori),
        bahan_bakar_memasak = VALUES(bahan_bakar_memasak),
        kepemilikan_motor = VALUES(kepemilikan_motor),
        kepemilikan_mobil = VALUES(kepemilikan_mobil),
        ada_disabilitas_lansia_tunggal = VALUES(ada_disabilitas_lansia_tunggal),
        ada_anak_sekolah_pip = VALUES(ada_anak_sekolah_pip),
        id_dtks_kemensos = VALUES(id_dtks_kemensos),
        bukti_kementerian_url = COALESCE(VALUES(bukti_kementerian_url), bukti_kementerian_url),
        nomor_referensi_bukti = VALUES(nomor_referensi_bukti),
        status_verifikasi = 'MENUNGGU_VERIFIKASI_KELURAHAN',
        diajukan_oleh_user_id = VALUES(diajukan_oleh_user_id),
        diajukan_oleh_role = VALUES(diajukan_oleh_role),
        tanggal_pengajuan = NOW()
    `;

    await pool.execute(query, [
      no_kk,
      data.desil_usulan,
      data.daya_listrik || '900 VA',
      data.status_rumah || 'Milik Sendiri',
      data.sumber_air || 'PDAM/Leding',
      data.luas_lantai_kategori || '8 - 14 m2',
      data.bahan_bakar_memasak || 'Gas 3kg',
      data.kepemilikan_motor || '1 unit',
      data.kepemilikan_mobil ? 1 : 0,
      data.ada_disabilitas_lansia_tunggal ? 1 : 0,
      data.ada_anak_sekolah_pip ? 1 : 0,
      data.id_dtks_kemensos || null,
      data.bukti_kementerian_url || null,
      data.nomor_referensi_bukti || null,
      userId || null,
      userRole || 'warga'
    ]);

    return this.findByNoKK(no_kk);
  }

  /**
   * Pengesahan status desil oleh Admin Kelurahan
   */
  async verifyDesil(id, status, desilFinal, catatan, adminUserId) {
    let updateFields = 'status_verifikasi = ?, catatan_verifikasi = ?, diverifikasi_oleh_user_id = ?, tanggal_verifikasi = NOW()';
    const params = [status, catatan || null, adminUserId];

    if (status === 'VERIFIED_KELURAHAN') {
      updateFields += ', desil_saat_ini = ?';
      params.push(desilFinal);
    }
    params.push(id);

    await pool.execute(`UPDATE desil_keluarga SET ${updateFields} WHERE id = ?`, params);
    return this.findById(id);
  }

  /**
   * Menampilkan daftar desil keluarga terfilter berdasarkan wilayah
   */
  async listDesil(filters = {}, userScope = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (userScope.rt) {
      whereClause += ' AND kk.rt = ?';
      params.push(userScope.rt);
    }
    if (userScope.rw) {
      whereClause += ' AND kk.rw = ?';
      params.push(userScope.rw);
    }

    if (filters.rt) {
      whereClause += ' AND kk.rt = ?';
      params.push(filters.rt);
    }
    if (filters.rw) {
      whereClause += ' AND kk.rw = ?';
      params.push(filters.rw);
    }
    if (filters.status_verifikasi) {
      whereClause += ' AND d.status_verifikasi = ?';
      params.push(filters.status_verifikasi);
    }
    if (filters.desil) {
      whereClause += ' AND (d.desil_saat_ini = ? OR (d.desil_saat_ini IS NULL AND d.desil_usulan = ?))';
      params.push(filters.desil, filters.desil);
    }
    if (filters.search) {
      whereClause += ' AND (kk.no_kk LIKE ? OR kk.kepala_keluarga LIKE ? OR d.id_dtks_kemensos LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    const query = `
      SELECT d.*, kk.kepala_keluarga, kk.alamat, kk.rt, kk.rw, kk.kelurahan,
             (SELECT COUNT(*) FROM warga w WHERE w.no_kk = kk.no_kk) AS total_anggota
      FROM kartu_keluarga kk
      LEFT JOIN desil_keluarga d ON kk.no_kk = d.no_kk
      ${whereClause}
      ORDER BY 
        CASE WHEN d.status_verifikasi = 'MENUNGGU_VERIFIKASI_KELURAHAN' THEN 1
             WHEN d.status_verifikasi = 'DRAFT_USULAN' THEN 2
             ELSE 3 END,
        COALESCE(d.desil_saat_ini, d.desil_usulan, 99) ASC,
        kk.no_kk ASC
      LIMIT 200
    `;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Menghitung statistik agregat sebaran desil kewilayahan
   */
  async getDesilStats(userScope = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (userScope.rt) {
      whereClause += ' AND kk.rt = ?';
      params.push(userScope.rt);
    }
    if (userScope.rw) {
      whereClause += ' AND kk.rw = ?';
      params.push(userScope.rw);
    }

    const [rows] = await pool.execute(
      `SELECT 
        COUNT(kk.id) AS total_kk,
        SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) AS terdata_desil,
        SUM(CASE WHEN d.status_verifikasi = 'VERIFIED_KELURAHAN' THEN 1 ELSE 0 END) AS verified_kelurahan,
        SUM(CASE WHEN d.status_verifikasi = 'MENUNGGU_VERIFIKASI_KELURAHAN' THEN 1 ELSE 0 END) AS pending_verifikasi,
        SUM(CASE WHEN COALESCE(d.desil_saat_ini, d.desil_usulan) = 1 THEN 1 ELSE 0 END) AS desil_1,
        SUM(CASE WHEN COALESCE(d.desil_saat_ini, d.desil_usulan) = 2 THEN 1 ELSE 0 END) AS desil_2,
        SUM(CASE WHEN COALESCE(d.desil_saat_ini, d.desil_usulan) = 3 THEN 1 ELSE 0 END) AS desil_3,
        SUM(CASE WHEN COALESCE(d.desil_saat_ini, d.desil_usulan) = 4 THEN 1 ELSE 0 END) AS desil_4,
        SUM(CASE WHEN COALESCE(d.desil_saat_ini, d.desil_usulan) = 5 THEN 1 ELSE 0 END) AS desil_5,
        SUM(CASE WHEN COALESCE(d.desil_saat_ini, d.desil_usulan) >= 6 THEN 1 ELSE 0 END) AS desil_mampu
       FROM kartu_keluarga kk
       LEFT JOIN desil_keluarga d ON kk.no_kk = d.no_kk
       ${whereClause}`,
      params
    );

    return rows[0] || {
      total_kk: 0,
      terdata_desil: 0,
      verified_kelurahan: 0,
      pending_verifikasi: 0,
      desil_1: 0,
      desil_2: 0,
      desil_3: 0,
      desil_4: 0,
      desil_5: 0,
      desil_mampu: 0
    };
  }
}

module.exports = new DesilRepository();

