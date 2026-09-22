/**
 * src/repositories/bansos.repository.js
 * Data Access Layer for Bantuan Sosial (Bansos) Berjenjang (RT -> RW -> Kelurahan).
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class BansosRepository {
  /**
   * Catat usulan bansos baru oleh RT/RW
   */
  async create(payload) {
    const {
      nomor_pengajuan,
      no_kk,
      nik_penerima,
      nama_penerima,
      jenis_bansos,
      alasan_pengajuan,
      nominal_bantuan = 0,
      status = 'PENDING_RT',
      approval_step = 'RT',
      rt,
      rw,
      diajukan_oleh_user_id = null
    } = payload;

    const noPengajuan = nomor_pengajuan || `BS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(
      `INSERT INTO bansos_pengajuan 
       (nomor_pengajuan, no_kk, nik_penerima, nama_penerima, jenis_bansos, alasan_pengajuan, nominal_bantuan, status, approval_step, rt, rw, diajukan_oleh_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noPengajuan,
        no_kk,
        nik_penerima,
        nama_penerima,
        jenis_bansos,
        alasan_pengajuan,
        nominal_bantuan,
        status,
        approval_step,
        rt,
        rw,
        diajukan_oleh_user_id
      ]
    );

    return {
      id: result.insertId,
      nomor_pengajuan: noPengajuan,
      ...payload
    };
  }

  /**
   * Ambil bansos berdasarkan ID
   */
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, 
                u_rt.nama AS nama_pengusul_rt,
                u_rw.nama AS nama_verifikator_rw,
                u_kel.nama AS nama_pengesah_kelurahan,
                u_dis.nama AS nama_penyalur_lapangan,
                d.desil_saat_ini,
                d.desil_usulan,
                d.status_verifikasi AS status_verifikasi_desil
         FROM bansos_pengajuan b
         LEFT JOIN users u_rt ON b.diajukan_oleh_user_id = u_rt.id
         LEFT JOIN users u_rw ON b.diverifikasi_oleh_user_id = u_rw.id
         LEFT JOIN users u_kel ON b.disahkan_oleh_user_id = u_kel.id
         LEFT JOIN users u_dis ON b.diserahkan_oleh_user_id = u_dis.id
         LEFT JOIN desil_keluarga d ON b.no_kk = d.no_kk
         WHERE b.id = ? LIMIT 1`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.warn('[BansosRepo] findById error:', e.message);
      return null;
    }
  }

  /**
   * Ambil usulan bansos berdasarkan No KK
   */
  async findByNoKK(no_kk) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, d.desil_saat_ini, d.desil_usulan 
         FROM bansos_pengajuan b 
         LEFT JOIN desil_keluarga d ON b.no_kk = d.no_kk
         WHERE b.no_kk = ? ORDER BY b.created_at DESC`,
        [no_kk]
      );
      return rows;
    } catch (e) {
      console.warn('[BansosRepo] findByNoKK error:', e.message);
      return [];
    }
  }

  /**
   * Ambil usulan bansos berdasarkan NIK pemohon
   */
  async findByNik(nik) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, d.desil_saat_ini, d.desil_usulan 
         FROM bansos_pengajuan b 
         LEFT JOIN desil_keluarga d ON b.no_kk = d.no_kk
         WHERE b.nik_penerima = ? ORDER BY b.created_at DESC`,
        [nik]
      );
      return rows;
    } catch (e) {
      console.warn('[BansosRepo] findByNik error:', e.message);
      return [];
    }
  }

  /**
   * Ambil daftar usulan bansos ter-scope hierarki
   */
  async list({ rt, rw, status, jenis_bansos, search, limit = 50, offset = 0 } = {}) {
    try {
      let query = `
        SELECT b.*, 
               d.desil_saat_ini, 
               d.desil_usulan, 
               d.status_verifikasi AS status_verifikasi_desil 
        FROM bansos_pengajuan b
        LEFT JOIN desil_keluarga d ON b.no_kk = d.no_kk
        WHERE 1=1
      `;
      const params = [];

      if (rw) {
        query += ' AND b.rw = ?';
        params.push(rw);
      }
      if (rt) {
        query += ' AND b.rt = ?';
        params.push(rt);
      }
      if (status) {
        query += ' AND b.status = ?';
        params.push(status);
      }
      if (jenis_bansos) {
        query += ' AND b.jenis_bansos = ?';
        params.push(jenis_bansos);
      }
      if (search) {
        query += ' AND (b.nama_penerima LIKE ? OR b.nik_penerima LIKE ? OR b.no_kk LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(String(limit), String(offset));
      const safeLimit = Math.max(1, parseInt(limit, 10) || 50);
      const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
      query += ` ORDER BY b.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (e) {
      console.warn('[BansosRepo] list error:', e.message);
      return [];
    }
  }

  /**
   * Update status verifikasi / pengesahan bertingkat
   */
  async updateStatus(id, updateData) {
    const {
      status,
      approval_step,
      diverifikasi_oleh_user_id = null,
      disahkan_oleh_user_id = null,
      catatan_verifikasi = null,
      nominal_bantuan = null
    } = updateData;

    let query = 'UPDATE bansos_pengajuan SET status = ?, approval_step = ?';
    const params = [status, approval_step];

    if (diverifikasi_oleh_user_id !== null) {
      query += ', diverifikasi_oleh_user_id = ?';
      params.push(diverifikasi_oleh_user_id);
    }
    if (disahkan_oleh_user_id !== null) {
      query += ', disahkan_oleh_user_id = ?';
      params.push(disahkan_oleh_user_id);
    }
    if (catatan_verifikasi !== null) {
      query += ', catatan_verifikasi = ?';
      params.push(catatan_verifikasi);
    }
    if (nominal_bantuan !== null) {
      query += ', nominal_bantuan = ?';
      params.push(nominal_bantuan);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result;
  }

  /**
   * Catat bukti serah-terima bansos di lapangan (Point of Disbursement)
   */
  async disburse(id, { foto_penyerahan_url, koordinat_lat_lng, tanda_tangan_penerima_url }, userId) {
    const query = `
      UPDATE bansos_pengajuan 
      SET status = 'DISBURSED',
          foto_penyerahan_url = ?,
          koordinat_lat_lng = ?,
          tanda_tangan_penerima_url = ?,
          diserahkan_oleh_user_id = ?,
          tanggal_penyerahan = NOW()
      WHERE id = ?
    `;
    await pool.execute(query, [
      foto_penyerahan_url || null,
      koordinat_lat_lng || null,
      tanda_tangan_penerima_url || null,
      userId,
      id
    ]);
    return this.findById(id);
  }

  /**
   * Statistik agregasi bansos
   */
  async getStats({ rt, rw } = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) AS total_usulan,
          SUM(CASE WHEN status IN ('APPROVED', 'DISBURSED') THEN 1 ELSE 0 END) AS total_disetujui,
          SUM(CASE WHEN status = 'DISBURSED' THEN 1 ELSE 0 END) AS total_tersalurkan_lapangan,
          SUM(CASE WHEN status = 'PENDING_RW' THEN 1 ELSE 0 END) AS pending_rw,
          SUM(CASE WHEN status = 'PENDING_KELURAHAN' THEN 1 ELSE 0 END) AS pending_kelurahan,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS total_ditolak,
          COALESCE(SUM(CASE WHEN status IN ('APPROVED', 'DISBURSED') THEN nominal_bantuan ELSE 0 END), 0) AS total_dana_tersalurkan
        FROM bansos_pengajuan
        WHERE 1=1
      `;
      const params = [];

      if (rw) {
        query += ' AND rw = ?';
        params.push(rw);
      }
      if (rt) {
        query += ' AND rt = ?';
        params.push(rt);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0] || {
        total_usulan: 0,
        total_disetujui: 0,
        total_tersalurkan_lapangan: 0,
        pending_rw: 0,
        pending_kelurahan: 0,
        total_ditolak: 0,
        total_dana_tersalurkan: 0
      };
    } catch (e) {
      console.warn('[BansosRepo] getStats error:', e.message);
      return {
        total_usulan: 0,
        total_disetujui: 0,
        total_tersalurkan_lapangan: 0,
        pending_rw: 0,
        pending_kelurahan: 0,
        total_ditolak: 0,
        total_dana_tersalurkan: 0
      };
    }
  }

  /**
   * Simpan laporan sanggahan / audit ketidaksesuaian penerima bansos oleh RT/RW
   */
  async createAuditSanggahan(payload) {
    const {
      bansos_pengajuan_id = null,
      nik_warga,
      nama_warga,
      no_kk = null,
      rt,
      rw,
      tipe_sanggahan,
      alasan_lapangan,
      bukti_foto_url = null,
      status_review = 'PENDING_KELURAHAN',
      dilaporkan_oleh_user_id
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO bansos_audit_sanggahan 
       (bansos_pengajuan_id, nik_warga, nama_warga, no_kk, rt, rw, tipe_sanggahan, alasan_lapangan, bukti_foto_url, status_review, dilaporkan_oleh_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bansos_pengajuan_id,
        nik_warga,
        nama_warga,
        no_kk,
        rt,
        rw,
        tipe_sanggahan,
        alasan_lapangan,
        bukti_foto_url,
        status_review,
        dilaporkan_oleh_user_id
      ]
    );

    return {
      id: result.insertId,
      ...payload
    };
  }

  /**
   * Ambil daftar audit sanggahan bansos ter-scope kewilayahan
   */
  async listAuditSanggahan({ rt, rw, status_review, tipe_sanggahan, limit = 50, offset = 0 } = {}) {
    try {
      let query = `
        SELECT s.*, 
               u_rep.nama AS nama_pelapor,
               u_rep.role AS role_pelapor,
               u_rev.nama AS nama_reviewer,
               bp.jenis_bansos,
               bp.status AS status_bansos_saat_ini
        FROM bansos_audit_sanggahan s
        LEFT JOIN users u_rep ON s.dilaporkan_oleh_user_id = u_rep.id
        LEFT JOIN users u_rev ON s.direview_oleh_user_id = u_rev.id
        LEFT JOIN bansos_pengajuan bp ON s.bansos_pengajuan_id = bp.id
        WHERE 1=1
      `;
      const params = [];

      if (rw) {
        query += ' AND s.rw = ?';
        params.push(rw);
      }
      if (rt) {
        query += ' AND s.rt = ?';
        params.push(rt);
      }
      if (status_review) {
        query += ' AND s.status_review = ?';
        params.push(status_review);
      }
      if (tipe_sanggahan) {
        query += ' AND s.tipe_sanggahan = ?';
        params.push(tipe_sanggahan);
      }

      query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
      params.push(String(limit), String(offset));

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (e) {
      console.warn('[BansosRepo] listAuditSanggahan error:', e.message);
      return [];
    }
  }

  /**
   * Ambil detail sanggahan audit berdasarkan ID
   */
  async getAuditSanggahanById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.*, 
                u_rep.nama AS nama_pelapor,
                u_rev.nama AS nama_reviewer
         FROM bansos_audit_sanggahan s
         LEFT JOIN users u_rep ON s.dilaporkan_oleh_user_id = u_rep.id
         LEFT JOIN users u_rev ON s.direview_oleh_user_id = u_rev.id
         WHERE s.id = ? LIMIT 1`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.warn('[BansosRepo] getAuditSanggahanById error:', e.message);
      return null;
    }
  }

  /**
   * Keputusan review audit sanggahan oleh Kelurahan / Lurah
   */
  async reviewAuditSanggahan(id, { status_review, catatan_kelurahan, direview_oleh_user_id }) {
    await pool.execute(
      `UPDATE bansos_audit_sanggahan
       SET status_review = ?,
           catatan_kelurahan = ?,
           direview_oleh_user_id = ?,
           tanggal_review = NOW()
       WHERE id = ?`,
      [status_review, catatan_kelurahan || null, direview_oleh_user_id, id]
    );

    return this.getAuditSanggahanById(id);
  }
}

module.exports = new BansosRepository();

