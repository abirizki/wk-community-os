/**
 * src/repositories/dokumen.repository.js
 * Data Access Layer for Dokumen Request (Pelayanan Surat Kelurahan).
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class DokumenRepository {
  /**
   * Buat permohonan surat baru dengan nomor registrasi unik, SLA timestamp awal, dan riwayat workflow
   */
  async create(payload) {
    const { 
      nik_pemohon, 
      jenis_dokumen, 
      keperluan, 
      nomor_registrasi,
      rt = null,
      rw = null,
      is_auto_filled_by_ai = 0,
      acted_by_user_id = null
    } = payload;

    const noReg = nomor_registrasi || `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(
      `INSERT INTO dokumen_request 
       (nomor_registrasi, nik_pemohon, jenis_surat, jenis_dokumen, keperluan, status, approval_step, rt, rw, trigger_executed, is_auto_filled_by_ai, rt_received_at, sla_deadline) 
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED', 'RT', ?, ?, 0, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [noReg, nik_pemohon, jenis_dokumen, jenis_dokumen, keperluan, rt, rw, is_auto_filled_by_ai ? 1 : 0]
    );

    const docId = result.insertId;

    // Catat riwayat workflow pengajuan perdana
    if (acted_by_user_id) {
      await this.recordWorkflowHistory({
        dokumen_request_id: docId,
        from_step: null,
        to_step: 'RT',
        acted_by_user_id,
        acted_by_role: 'warga',
        action: 'SUBMIT',
        notes: `Pengajuan surat ${jenis_dokumen} oleh pemohon.`
      }).catch(err => console.warn('[WorkflowHistory] Note on create:', err.message));
    }

    return {
      id: docId,
      nomor_registrasi: noReg,
      ...payload,
      status: 'SUBMITTED',
      approval_step: 'RT'
    };
  }

  /**
   * Catat entri riwayat audit workflow
   */
  async recordWorkflowHistory({ dokumen_request_id, from_step, to_step, acted_by_user_id, acted_by_role, action, notes = null }) {
    try {
      await pool.execute(
        `INSERT INTO dokumen_workflow_history 
         (dokumen_request_id, from_step, to_step, acted_by_user_id, acted_by_role, action, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dokumen_request_id, from_step, to_step, acted_by_user_id, acted_by_role, action, notes]
      );
    } catch (e) {
      console.warn('[WorkflowHistory] Record error:', e.message);
    }
  }

  /**
   * Ambil seluruh riwayat workflow dokumen untuk audit trail
   */
  async getWorkflowHistory(dokumenId) {
    try {
      const [rows] = await pool.execute(
        `SELECT h.*, u.nama AS acted_by_nama, u.username AS acted_by_username
         FROM dokumen_workflow_history h
         LEFT JOIN users u ON h.acted_by_user_id = u.id
         WHERE h.dokumen_request_id = ?
         ORDER BY h.created_at ASC`,
        [dokumenId]
      );
      return rows;
    } catch (e) {
      console.warn('[WorkflowHistory] getWorkflowHistory error:', e.message);
      return [];
    }
  }

  /**
   * Ambil detail permohonan surat berdasarkan ID lengkap dengan data warga & KK
   */
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT d.*, 
                COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_dokumen,
                COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_surat,
                w.nama AS nama_pemohon, 
                w.no_kk, 
                w.jenis_kelamin,
                w.tanggal_lahir,
                w.pekerjaan,
                w.alamat,
                COALESCE(d.rt, w.rt) AS rt,
                COALESCE(d.rw, w.rw) AS rw,
                w.no_telepon,
                rt_user.nama AS nama_petugas_rt,
                rw_user.nama AS nama_petugas_rw,
                kel_user.nama AS nama_petugas_kelurahan
         FROM dokumen_request d 
         LEFT JOIN warga w ON d.nik_pemohon = w.nik
         LEFT JOIN users rt_user ON d.approved_by_rt = rt_user.id
         LEFT JOIN users rw_user ON d.approved_by_rw = rw_user.id
         LEFT JOIN users kel_user ON d.approved_by_kelurahan = kel_user.id
         WHERE d.id = ? 
         LIMIT 1`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.warn('[DokumenRepo] findById error:', e.message);
      return null;
    }
  }

  /**
   * Ambil permohonan surat milik satu NIK atau satu No KK
   */
  async findByNik(nik) {
    try {
      const [rows] = await pool.execute(
        `SELECT d.*, 
                COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_dokumen,
                COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_surat,
                w.nama AS nama_pemohon,
                w.no_kk,
                COALESCE(d.rt, w.rt) AS rt,
                COALESCE(d.rw, w.rw) AS rw
         FROM dokumen_request d 
         LEFT JOIN warga w ON d.nik_pemohon = w.nik
         WHERE d.nik_pemohon = ? OR w.no_kk = (SELECT no_kk FROM warga WHERE nik = ? LIMIT 1)
         ORDER BY d.created_at DESC`,
        [nik, nik]
      );
      return rows;
    } catch (e) {
      console.warn('[DokumenRepo] findByNik error:', e.message);
      return [];
    }
  }

  /**
   * Update status permohonan dokumen
   */
  async updateStatus(id, status, catatan_admin = null, file_hasil = null) {
    const approvedAt = status === 'APPROVED' || status === 'READY_PICKUP' ? new Date() : null;
    const [result] = await pool.execute(
      `UPDATE dokumen_request 
       SET status = ?, catatan_admin = COALESCE(?, catatan_admin), file_hasil = COALESCE(?, file_hasil), approved_at = COALESCE(?, approved_at)
       WHERE id = ?`,
      [status, catatan_admin, file_hasil, approvedAt, id]
    );
    return result;
  }

  /**
   * Ambil daftar permohonan surat berdasar filter dan hierarki kewilayahan
   */
  async list({ rt, rw, status, approval_step, limit = 50, offset = 0 } = {}) {
    try {
      let query = `
        SELECT d.*, 
               COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_dokumen,
               COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_surat,
               w.nama AS nama_pemohon, 
               w.no_kk, 
               w.no_telepon,
               COALESCE(d.rt, w.rt) AS rt,
               COALESCE(d.rw, w.rw) AS rw
        FROM dokumen_request d 
        LEFT JOIN warga w ON d.nik_pemohon = w.nik 
        WHERE 1=1
      `;
      const params = [];

      if (rw) {
        query += ' AND (d.rw = ? OR (d.rw IS NULL AND w.rw = ?))';
        params.push(rw, rw);
      }
      if (rt) {
        query += ' AND (d.rt = ? OR (d.rt IS NULL AND w.rt = ?))';
        params.push(rt, rt);
      }
      if (status) {
        query += ' AND d.status = ?';
        params.push(status);
      }
      if (approval_step) {
        query += ' AND d.approval_step = ?';
        params.push(approval_step);
      }

      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params.push(String(limit), String(offset));

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (e) {
      console.warn('[DokumenRepo] list error:', e.message);
      return [];
    }
  }

  /**
   * Update status dan step approval berjenjang dengan pencatatan SLA & riwayat audit
   */
  async updateApproval(id, updateData) {
    const {
      status,
      approval_step,
      catatan_petugas = null,
      approved_by_rt = null,
      approved_by_rw = null,
      approved_by_kelurahan = null,
      trigger_executed = null,
      file_url = null,
      from_step = null,
      acted_by_user_id = null,
      acted_by_role = null,
      action = 'APPROVE',
      notes = null
    } = updateData;

    let query = 'UPDATE dokumen_request SET status = ?, approval_step = ?';
    const params = [status, approval_step];

    if (catatan_petugas !== null) {
      query += ', catatan_petugas = ?, catatan_admin = ?';
      params.push(catatan_petugas, catatan_petugas);
    }
    if (approved_by_rt !== null) {
      query += ', approved_by_rt = ?, rt_processed_at = NOW(), rw_received_at = NOW(), sla_deadline = DATE_ADD(NOW(), INTERVAL 24 HOUR)';
      params.push(approved_by_rt);
    }
    if (approved_by_rw !== null) {
      query += ', approved_by_rw = ?, rw_processed_at = NOW(), kelurahan_received_at = NOW(), sla_deadline = DATE_ADD(NOW(), INTERVAL 24 HOUR)';
      params.push(approved_by_rw);
    }
    if (approved_by_kelurahan !== null) {
      query += ', approved_by_kelurahan = ?, approved_at = NOW()';
      params.push(approved_by_kelurahan);
    }
    if (status === 'REJECTED') {
      query += ', sla_deadline = NULL';
    }
    if (trigger_executed !== null) {
      query += ', trigger_executed = ?';
      params.push(trigger_executed);
    }
    if (file_url !== null) {
      query += ', file_url = ?, file_hasil = ?';
      params.push(file_url, file_url);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);

    // Catat audit trail ke dokumen_workflow_history
    if (acted_by_user_id && acted_by_role) {
      await this.recordWorkflowHistory({
        dokumen_request_id: id,
        from_step: from_step || (approved_by_rt ? 'RT' : approved_by_rw ? 'RW' : 'KELURAHAN'),
        to_step: approval_step,
        acted_by_user_id,
        acted_by_role,
        action: action || (status === 'REJECTED' ? 'REJECT' : 'APPROVE'),
        notes: notes || catatan_petugas
      }).catch(err => console.warn('[WorkflowHistory] Note on updateApproval:', err.message));
    }

    return result;
  }

  /**
   * Statistik ringkasan dokumen per wilayah
   */
  async getStats({ rt, rw } = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) AS total_permohonan,
          SUM(CASE WHEN d.status = 'SUBMITTED' AND d.approval_step = 'RT' THEN 1 ELSE 0 END) AS pending_rt,
          SUM(CASE WHEN d.approval_step = 'RW' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_rw,
          SUM(CASE WHEN d.approval_step = 'KELURAHAN' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_kelurahan,
          SUM(CASE WHEN d.status = 'APPROVED' THEN 1 ELSE 0 END) AS total_approved,
          SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS total_rejected
        FROM dokumen_request d
        LEFT JOIN warga w ON d.nik_pemohon = w.nik
        WHERE 1=1
      `;
      const params = [];

      if (rw) {
        query += ' AND (d.rw = ? OR (d.rw IS NULL AND w.rw = ?))';
        params.push(rw, rw);
      }
      if (rt) {
        query += ' AND (d.rt = ? OR (d.rt IS NULL AND w.rt = ?))';
        params.push(rt, rt);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0] || {
        total_permohonan: 0,
        pending_rt: 0,
        pending_rw: 0,
        pending_kelurahan: 0,
        total_approved: 0,
        total_rejected: 0
      };
    } catch (e) {
      console.warn('[DokumenRepo] getStats error:', e.message);
      return {
        total_permohonan: 0,
        pending_rt: 0,
        pending_rw: 0,
        pending_kelurahan: 0,
        total_approved: 0,
        total_rejected: 0
      };
    }
  }
}

module.exports = new DokumenRepository();

