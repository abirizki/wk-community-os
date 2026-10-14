/**
 * src/services/pbb.service.js
 * Business Logic Layer for PBB.
 */

const pbbRepository = require('../repositories/pbb.repository');

class PbbService {
  /**
   * Ambil daftar tagihan PBB berdasarkan NIK warga
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async getTagihanByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }

    return await pbbRepository.findByNik(nik);
  }

  /**
   * Simulasi pembayaran tagihan PBB
   * @param {string} nop 
   * @param {number} tahun 
   * @param {string} nikPelapor - untuk validasi otorisasi (opsional jika warga hanya bisa bayar pajaknya sendiri)
   * @returns {Promise<Object>}
   */
  async bayarTagihan(nop, tahun, nikPelapor) {
    if (!nop || !tahun) {
      const err = new Error('NOP dan Tahun wajib diisi');
      err.status = 400;
      throw err;
    }

    // Cek keberadaan tagihan
    const tagihan = await pbbRepository.findByNopAndTahun(nop, tahun);
    if (!tagihan) {
      const err = new Error('Data tagihan PBB tidak ditemukan');
      err.status = 404;
      throw err;
    }

    // Validasi kepemilikan (Warga hanya bisa bayar miliknya)
    if (tagihan.nik_warga !== nikPelapor) {
      const err = new Error('Anda tidak memiliki akses ke tagihan ini');
      err.status = 403;
      throw err;
    }

    if (tagihan.status_pembayaran === 'PAID') {
      const err = new Error('Tagihan ini sudah dibayar');
      err.status = 400;
      throw err;
    }

    // Proses update status
    await pbbRepository.updateStatus(nop, tahun, 'PAID');
    
    return {
      nop,
      tahun,
      status_pembayaran: 'PAID',
      message: 'Pembayaran berhasil'
    };
  }

  /**
   * Ambil daftar PBB untuk Meja Kerja RT/RW dan Admin Kelurahan
   */
  async listPbb(currentUser, query = {}) {
    let rw = query.rw || null;
    let rt = query.rt || null;

    if (currentUser.role === 'ketua_rt') {
      rt = currentUser.rt;
      rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      rw = currentUser.rw;
    }

    return await pbbRepository.listPbb({
      rw,
      rt,
      tahun: query.tahun || new Date().getFullYear(),
      status: query.status || 'ALL',
      search: query.search || '',
      limit: parseInt(query.limit, 10) || 100,
      offset: parseInt(query.offset, 10) || 0
    });
  }

  /**
   * Template CSV Baku DHKP PBB Kelurahan
   */
  getTemplateCsv() {
    return 'NOP,NIK_WARGA,NAMA_WAJIB_PAJAK,ALAMAT_OBJEK,RT,RW,TAHUN,NOMINAL,JATUH_TEMPO,STATUS_PEMBAYARAN\n' +
      '32.73.010.001.001-0001.0,3273010101900001,Budi Santoso,Jl. Kebonjati No. 12,001,001,2026,175000,2026-09-30,UNPAID\n' +
      '32.73.010.001.001-0002.0,3273010202910002,Ahmad Dahlan,Jl. Kebonjati No. 14,001,001,2026,220000,2026-09-30,UNPAID\n' +
      '32.73.010.001.002-0003.0,3273010303920003,Hj. Siti Aminah,Gang Saluyu No. 5,002,001,2026,145000,2026-09-30,PAID\n';
  }

  /**
   * Import Massal Data DHKP PBB oleh Admin Kelurahan
   */
  async bulkImport(payload, currentUser) {
    const { csv_data, tahun = new Date().getFullYear(), kirim_notifikasi = true } = payload;
    if (!csv_data || typeof csv_data !== 'string') {
      const err = new Error('Data CSV DHKP PBB wajib disertakan');
      err.status = 400;
      throw err;
    }

    const lines = csv_data.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      const err = new Error('File CSV kosong atau hanya berisi baris header');
      err.status = 400;
      throw err;
    }

    const rows = [];
    const errors = [];
    const targetNiks = new Set();

    // Skip header line 0
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      const [nop, nik_warga, nama_wajib_pajak, alamat_objek_pajak, rt, rw, tahunPajak, nominal, jatuhTempo, statusBayar] = parts;

      if (!nop) {
        errors.push(`Baris ${i + 1}: NOP tidak boleh kosong`);
        continue;
      }
      if (!nik_warga || nik_warga.length < 16) {
        errors.push(`Baris ${i + 1}: NIK wajib 16 digit (${nik_warga || 'kosong'})`);
        continue;
      }

      const nominalNum = parseFloat(nominal) || 150000;
      const rowItem = {
        nop,
        nik_warga,
        nama_wajib_pajak: nama_wajib_pajak || 'Wajib Pajak',
        alamat_objek_pajak: alamat_objek_pajak || 'Kelurahan Kebonjati',
        rt: rt || '001',
        rw: rw || '001',
        tahun: parseInt(tahunPajak, 10) || parseInt(tahun, 10),
        nominal: nominalNum,
        tanggal_jatuh_tempo: jatuhTempo || `${tahun}-09-30`,
        status_pembayaran: (statusBayar && statusBayar.toUpperCase() === 'PAID') ? 'PAID' : 'UNPAID'
      };

      rows.push(rowItem);
      targetNiks.add(nik_warga);
    }

    if (rows.length === 0) {
      const err = new Error(`Tidak ada baris data PBB yang valid: ${errors.slice(0, 3).join('; ')}`);
      err.status = 400;
      throw err;
    }

    const result = await pbbRepository.bulkImportPbb(rows);

    // Kirim notifikasi massal ke warga
    if (kirim_notifikasi && targetNiks.size > 0) {
      try {
        const notifikasiRepo = require('../repositories/notifikasi.repository');
        for (const nik of targetNiks) {
          await notifikasiRepo.create({
            nik_target: nik,
            judul: `Tagihan PBB-P2 Tahun ${tahun} Telah Terbit`,
            pesan: `Yth. Warga, data ketetapan PBB-P2 tahun ${tahun} telah dirilis oleh kelurahan. Cek rincian NOP & status pembayaran Anda di menu Pajak PBB Digital.`,
            tipe: 'info',
            link: '/dashboard/pbb'
          });
        }
      } catch (notifErr) {
        console.warn('[PbbService] Bulk import notifikasi warning:', notifErr.message);
      }
    }

    return {
      success: true,
      inserted: result.inserted,
      updated: result.updated,
      total_imported: rows.length,
      errors_count: errors.length,
      errors_sample: errors.slice(0, 5),
      notifikasi_sent: kirim_notifikasi ? targetNiks.size : 0
    };
  }

  /**
   * Verifikasi PBB Lapangan oleh RT
   */
  async verifyByRt(id, payload, currentUser) {
    if (!id) {
      const err = new Error('ID tagihan PBB tidak valid');
      err.status = 400;
      throw err;
    }

    const res = await pbbRepository.verifyPbbByRt(id, {
      status_pembayaran: payload.status_pembayaran || 'PAID',
      catatan_rt: payload.catatan_rt || 'Diverifikasi langsung oleh Pengurus RT',
      verifikator_user_id: currentUser?.id,
      bukti_bayar_url: payload.bukti_bayar_url || null
    });

    // Kirim notifikasi ke warga terkait hasil verifikasi RT
    if (payload.nik_warga) {
      try {
        const notifikasiRepo = require('../repositories/notifikasi.repository');
        await notifikasiRepo.create({
          nik_target: payload.nik_warga,
          judul: `Status PBB Telah Diverifikasi RT (${payload.status_pembayaran === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'})`,
          pesan: `Status tagihan PBB NOP ${payload.nop || ''} telah diverifikasi oleh Ketua RT ${currentUser.rt || ''}. Catatan: ${payload.catatan_rt || 'Sesuai data lapangan'}.`,
          tipe: payload.status_pembayaran === 'PAID' ? 'success' : 'warning',
          link: '/dashboard/pbb'
        });
      } catch (e) {}
    }

    return { success: true, message: 'Verifikasi PBB berhasil disimpan oleh RT' };
  }
}

module.exports = new PbbService();

