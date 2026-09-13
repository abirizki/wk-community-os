/**
 * src/services/bansos.service.js
 * Business Logic Layer for Tiered Bantuan Sosial (Bansos) & Verifikasi Berjenjang.
 * Bumi Warga - Jabar Pintar Digital
 */

const bansosRepository = require('../repositories/bansos.repository');
const wargaRepository = require('../repositories/warga.repository');
const notifikasiRepository = require('../repositories/notifikasi.repository');

class BansosService {
  /**
   * Usulkan calon penerima bansos baru (RT / RW / Kelurahan)
   */
  async proposeBansos(payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya Ketua RT, RW, dan Admin yang berwenang mengusulkan penerima bansos.');
      err.status = 403;
      throw err;
    }

    let { no_kk, nik_penerima, nama_penerima, jenis_bansos, alasan_pengajuan, nominal_bantuan, rt, rw } = payload;

    if (!nik_penerima || String(nik_penerima).trim().length !== 16) {
      const err = new Error('NIK penerima manfaat harus 16 digit');
      err.status = 400;
      throw err;
    }

    if (!jenis_bansos) {
      const err = new Error('Jenis bantuan sosial wajib dipilih');
      err.status = 400;
      throw err;
    }

    if (!alasan_pengajuan || alasan_pengajuan.trim().length < 5) {
      const err = new Error('Alasan evidensi pengajuan minimal 5 karakter');
      err.status = 400;
      throw err;
    }

    // Ambil data warga dari repository jika nama belum diisi
    if (!nama_penerima || !no_kk) {
      const warga = await wargaRepository.findByNik(nik_penerima);
      if (warga) {
        nama_penerima = warga.nama;
        no_kk = warga.no_kk;
        rt = warga.rt;
        rw = warga.rw;
      }
    }

    // Enforce wilayah RT / RW
    if (currentUser.role === 'ketua_rt') {
      rt = currentUser.rt;
      rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      rw = currentUser.rw;
    }

    // Tentukan tahap approval awal berdasar siapa yang mengusulkan
    let initialStatus = 'PENDING_RW';
    let initialStep = 'RW';

    if (['admin_kelurahan', 'superadmin', 'admin'].includes(currentUser.role)) {
      initialStatus = 'APPROVED';
      initialStep = 'COMPLETED';
    }

    const bansos = await bansosRepository.create({
      no_kk: no_kk || '3273010101900001',
      nik_penerima,
      nama_penerima: nama_penerima || 'Warga Kebonjati',
      jenis_bansos,
      alasan_pengajuan: alasan_pengajuan.trim(),
      nominal_bantuan: parseFloat(nominal_bantuan) || 0,
      status: initialStatus,
      approval_step: initialStep,
      rt: rt || '001',
      rw: rw || '001',
      diajukan_oleh_user_id: currentUser.id
    });

    // Notifikasi ke warga calon penerima
    try {
      await notifikasiRepository.create({
        nik_target: nik_penerima,
        judul: 'Usulan Bantuan Sosial Didaftarkan',
        pesan: `Anda diusulkan sebagai calon penerima manfaat ${jenis_bansos} oleh pengurus RT/RW. Usulan sedang dalam proses verifikasi.`,
        tipe: 'info',
        link: '/dashboard/bansos'
      });
    } catch (e) {
      console.warn('Notifikasi bansos error:', e.message);
    }

    return bansos;
  }

  /**
   * Ambil daftar usulan bansos berdasar scope hierarki
   */
  async listBansos(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {
      status: query.status || null,
      jenis_bansos: query.jenis_bansos || null,
      search: query.search || '',
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    };

    if (role === 'ketua_rt') {
      filter.rt = rt;
      filter.rw = rw;
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      filter.rw = rw;
      if (query.rt) filter.rt = query.rt;
    } else if (role === 'warga') {
      const activeNik = currentUser.active_nik || currentUser.username;
      const warga = await wargaRepository.findByNik(activeNik);
      if (warga) {
        return await bansosRepository.findByNoKK(warga.no_kk);
      }
      return await bansosRepository.findByNik(activeNik);
    } else {
      // Kelurahan / Superadmin
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return await bansosRepository.list(filter);
  }

  /**
   * Verifikasi dan Pengesahan Usulan Bansos Berjenjang
   */
  async verifyBansos(id, currentUser, action, catatan = '', nominal = null) {
    const bansos = await bansosRepository.findById(id);
    if (!bansos) {
      const err = new Error('Data pengajuan bansos tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const { role } = currentUser;

    if (action === 'REJECT') {
      await bansosRepository.updateStatus(id, {
        status: 'REJECTED',
        approval_step: 'COMPLETED',
        catatan_verifikasi: `Ditolak oleh ${currentUser.nama} (${currentUser.role}): ${catatan || 'Kriteria belum memenuhi syarat'}`
      });

      await notifikasiRepository.create({
        nik_target: bansos.nik_penerima,
        judul: 'Status Usulan Bansos',
        pesan: `Usulan ${bansos.jenis_bansos} untuk keluarga Anda belum dapat disetujui. Catatan: ${catatan || 'Kuota terpenuhi atau kriteria belum sesuai'}`,
        tipe: 'error',
        link: '/dashboard/bansos'
      });

      return { success: true, status: 'REJECTED', message: 'Usulan bansos berhasil ditolak.' };
    }

    // ACTION: APPROVE
    if (role === 'ketua_rw' || role === 'admin_rw') {
      await bansosRepository.updateStatus(id, {
        status: 'PENDING_KELURAHAN',
        approval_step: 'KELURAHAN',
        diverifikasi_oleh_user_id: currentUser.id,
        catatan_verifikasi: catatan || 'Diverifikasi & disetujui tingkat RW. Diteruskan ke Kelurahan.'
      });

      return { success: true, status: 'PENDING_KELURAHAN', message: 'Usulan bansos diverifikasi RW dan diteruskan ke Kelurahan.' };
    }

    if (['admin_kelurahan', 'superadmin', 'admin'].includes(role)) {
      await bansosRepository.updateStatus(id, {
        status: 'APPROVED',
        approval_step: 'COMPLETED',
        disahkan_oleh_user_id: currentUser.id,
        nominal_bantuan: nominal !== null ? parseFloat(nominal) : bansos.nominal_bantuan,
        catatan_verifikasi: catatan || 'Disahkan oleh Kantor Kelurahan Kebonjati. Bantuan siap disalurkan.'
      });

      // Notifikasi kelulusan bansos ke warga
      await notifikasiRepository.create({
        nik_target: bansos.nik_penerima,
        judul: 'Penerima Manfaat Bansos Ditetapkan',
        pesan: `Selamat! Keluarga Anda telah RESMI DITETAPKAN sebagai penerima bantuan ${bansos.jenis_bansos} Kelurahan Kebonjati. Silakan pantau informasi jadwal pencairan/distribusi di Balai Warga.`,
        tipe: 'success',
        link: '/dashboard/bansos'
      });

      return { success: true, status: 'APPROVED', message: 'Usulan bansos resmi disahkan oleh Kelurahan Kebonjati.' };
    }

    throw new Error('Peran Anda tidak memiliki kewenangan verifikasi bansos ini.');
  }

  /**
   * Rekam serah-terima bantuan sosial di lapangan (Point of Disbursement)
   * Menyimpan foto serah terima GPS geotagged, koordinat, dan tanda tangan digital
   */
  async disburseBansos(id, disburseData, currentUser) {
    const allowedRoles = ['superadmin', 'admin_kelurahan', 'admin', 'ketua_rw', 'admin_rw', 'ketua_rt'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Anda tidak memiliki wewenang untuk menyalurkan bantuan sosial.');
      err.status = 403;
      throw err;
    }

    const bansos = await bansosRepository.findById(id);
    if (!bansos) {
      const err = new Error('Data usulan bantuan sosial tidak ditemukan.');
      err.status = 404;
      throw err;
    }

    if (bansos.status !== 'APPROVED') {
      const err = new Error('Hanya bantuan sosial dengan status APPROVED (Disahkan Kelurahan) yang dapat diserah-terimakan.');
      err.status = 400;
      throw err;
    }

    const updated = await bansosRepository.disburse(id, disburseData, currentUser.id);

    // Notifikasi ke warga
    try {
      await notifikasiRepository.create({
        nik_target: bansos.nik_penerima,
        judul: 'Bantuan Sosial Telah Diterima',
        pesan: `Serah terima bantuan ${bansos.jenis_bansos} untuk keluarga Anda telah berhasil dicatat oleh petugas pada ${new Date().toLocaleString('id-ID')}. Terima kasih atas konfirmasi tanda tangan Anda.`,
        tipe: 'success',
        link: '/dashboard/bansos'
      });

      // Notifikasi WhatsApp otomatis ke penerima bansos
      const warga = await wargaRepository.findByNik(bansos.nik_penerima);
      if (warga && warga.no_telepon) {
        const whatsappService = require('./whatsapp.service');
        await whatsappService.sendBansosNotification({
          phone: warga.no_telepon,
          nama: bansos.nama_penerima,
          jenis_bansos: bansos.jenis_bansos,
          nominal: bansos.nominal_bantuan,
          jadwal_penyerahan: 'Telah Diterima',
          lokasi: 'Balai RW / Kelurahan'
        });
      }
    } catch (e) {
      console.warn('Notifikasi gagal terkirim:', e.message);
    }

    return { success: true, message: 'Bantuan sosial berhasil diserahterimakan di lapangan.', data: updated };
  }

  /**
   * Ambil statistik bansos
   */
  async getBansosStats(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {};

    if (role === 'ketua_rt') {
      filter.rt = rt;
      filter.rw = rw;
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      filter.rw = rw;
      if (query.rt) filter.rt = query.rt;
    } else {
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return bansosRepository.getStats(filter);
  }

  /**
   * RT / RW Melaporkan sanggahan / anomali penerima bansos
   */
  async reportAuditSanggahan(payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya Ketua RT, Ketua RW, dan Petugas yang berwenang melaporkan sanggahan audit bansos.');
      err.status = 403;
      throw err;
    }

    const {
      bansos_pengajuan_id,
      nik_warga,
      nama_warga,
      no_kk,
      tipe_sanggahan,
      alasan_lapangan,
      bukti_foto_url
    } = payload;

    if (!nik_warga || String(nik_warga).trim().length !== 16) {
      const err = new Error('NIK warga yang dilaporkan harus 16 digit valid');
      err.status = 400;
      throw err;
    }

    if (!['TIDAK_LAYAK', 'SUDAH_PINDAH', 'MENINGGAL_DUNIA', 'LAYAK_BELUM_TERDAFTAR'].includes(tipe_sanggahan)) {
      const err = new Error('Kategori sanggahan/anomali tidak valid');
      err.status = 400;
      throw err;
    }

    if (!alasan_lapangan || alasan_lapangan.trim().length < 5) {
      const err = new Error('Uraian fakta lapangan minimal 5 karakter');
      err.status = 400;
      throw err;
    }

    let rt = currentUser.rt || '001';
    let rw = currentUser.rw || '001';

    // Cek warga di database
    const warga = await wargaRepository.findByNik(nik_warga);
    let finalNama = nama_warga || (warga ? warga.nama : 'Warga');
    let finalKK = no_kk || (warga ? warga.no_kk : null);
    if (warga && !currentUser.rt) {
      rt = warga.rt || rt;
      rw = warga.rw || rw;
    }

    const record = await bansosRepository.createAuditSanggahan({
      bansos_pengajuan_id: bansos_pengajuan_id ? Number(bansos_pengajuan_id) : null,
      nik_warga,
      nama_warga: finalNama,
      no_kk: finalKK,
      rt,
      rw,
      tipe_sanggahan,
      alasan_lapangan: alasan_lapangan.trim(),
      bukti_foto_url: bukti_foto_url || null,
      status_review: 'PENDING_KELURAHAN',
      dilaporkan_oleh_user_id: currentUser.id
    });

    return {
      success: true,
      message: 'Laporan audit sanggahan bansos berhasil diajukan ke Meja Review Kelurahan.',
      data: record
    };
  }

  /**
   * Ambil daftar laporan audit sanggahan
   */
  async listAuditSanggahan(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {
      status_review: query.status_review || null,
      tipe_sanggahan: query.tipe_sanggahan || null,
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    };

    if (role === 'ketua_rt') {
      filter.rt = rt;
      filter.rw = rw;
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      filter.rw = rw;
      if (query.rt) filter.rt = query.rt;
    } else {
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return await bansosRepository.listAuditSanggahan(filter);
  }

  /**
   * Review dan Keputusan Sanggahan oleh Admin Kelurahan / Lurah
   */
  async reviewAuditSanggahan(id, payload, currentUser) {
    const allowedRoles = ['admin_kelurahan', 'lurah', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya Admin Kelurahan dan Lurah yang berwenang mengambil keputusan audit bansos.');
      err.status = 403;
      throw err;
    }

    const { status_review, catatan_kelurahan } = payload;
    if (!['DISETUJUI_PENCABUTAN', 'DISETUJUI_INKLUSI', 'DITOLAK'].includes(status_review)) {
      const err = new Error('Status keputusan review tidak valid');
      err.status = 400;
      throw err;
    }

    const sanggahan = await bansosRepository.getAuditSanggahanById(id);
    if (!sanggahan) {
      const err = new Error('Data audit sanggahan tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const updated = await bansosRepository.reviewAuditSanggahan(id, {
      status_review,
      catatan_kelurahan: catatan_kelurahan || 'Telah diverifikasi silang dengan DTKS dan data lapangan Kelurahan.',
      direview_oleh_user_id: currentUser.id
    });

    // Dampak Otomatis Keputusan ke Status Bantuan & Desil / Kependudukan
    const pool = require('../db/pool');
    if (status_review === 'DISETUJUI_PENCABUTAN') {
      if (sanggahan.bansos_pengajuan_id) {
        try {
          await bansosRepository.updateStatus(sanggahan.bansos_pengajuan_id, {
            status: 'REJECTED',
            approval_step: 'COMPLETED',
            catatan_verifikasi: `Pencabutan kuota bantuan sosial disahkan Kelurahan berdasar audit temuan lapangan RT/RW: ${catatan_kelurahan || sanggahan.alasan_lapangan}`
          });
        } catch (e) {
          console.warn('Update status pencabutan bansos warning:', e.message);
        }
      }

      // 1. Jika Warga Mampu: Sinkronkan ke Desil Keluarga (Graduasi Desil 7)
      if (sanggahan.tipe_sanggahan === 'TIDAK_LAYAK' && sanggahan.no_kk) {
        try {
          await pool.execute(
            `UPDATE desil_keluarga 
             SET desil_saat_ini = 7, 
                 status_verifikasi = 'VERIFIED_KELURAHAN', 
                 catatan_kelurahan = 'Graduasi mandiri hasil audit faktual RT/RW' 
             WHERE no_kk = ?`,
            [sanggahan.no_kk]
          );
        } catch (e) {
          console.warn('Sync desil mampu warning:', e.message);
        }
      }

      // 2. Jika Sudah Pindah: Sinkronkan status kependudukan warga
      if (sanggahan.tipe_sanggahan === 'SUDAH_PINDAH') {
        try {
          await pool.execute(
            `UPDATE warga SET status_kependudukan = 'Pindah' WHERE nik = ?`,
            [sanggahan.nik_warga]
          );
        } catch (e) {
          console.warn('Sync warga pindah warning:', e.message);
        }
      }

      // 3. Jika Meninggal Dunia: Sinkronkan status kependudukan warga
      if (sanggahan.tipe_sanggahan === 'MENINGGAL_DUNIA') {
        try {
          await pool.execute(
            `UPDATE warga SET status_kependudukan = 'Meninggal' WHERE nik = ?`,
            [sanggahan.nik_warga]
          );
        } catch (e) {
          console.warn('Sync warga meninggal warning:', e.message);
        }
      }
    } else if (status_review === 'DISETUJUI_INKLUSI' && sanggahan.tipe_sanggahan === 'LAYAK_BELUM_TERDAFTAR') {
      try {
        await bansosRepository.create({
          nik_penerima: sanggahan.nik_warga,
          nama_penerima: sanggahan.nama_warga,
          no_kk: sanggahan.no_kk || '3273010101900001',
          jenis_bansos: 'Bantuan Darurat Kelurahan (Inklusi Audit)',
          alasan_pengajuan: `Inklusi prioritas dari audit lapangan RT/RW: ${sanggahan.alasan_lapangan}`,
          nominal_bantuan: 600000,
          status: 'APPROVED',
          approval_step: 'COMPLETED',
          rt: sanggahan.rt,
          rw: sanggahan.rw,
          diajukan_oleh_user_id: currentUser.id
        });

        // Sinkronkan ke Desil 1 (Sangat Miskin / Prioritas Ekstrem)
        if (sanggahan.no_kk) {
          await pool.execute(
            `UPDATE desil_keluarga 
             SET desil_saat_ini = 1, 
                 status_verifikasi = 'VERIFIED_KELURAHAN', 
                 catatan_kelurahan = 'Inklusi prioritas Desil 1 hasil audit RT/RW' 
             WHERE no_kk = ?`,
            [sanggahan.no_kk]
          );
        }
      } catch (e) {
        console.warn('Inklusi bansos otomatis warning:', e.message);
      }
    }

    // Kirim notifikasi ke pelapor (RT/RW)
    try {
      if (sanggahan.dilaporkan_oleh_user_id) {
        const reporter = await require('../repositories/user.repository').findById(sanggahan.dilaporkan_oleh_user_id);
        if (reporter && reporter.username) {
          await notifikasiRepository.create({
            nik_target: reporter.username,
            judul: 'Hasil Review Audit Bansos Kelurahan',
            pesan: `Laporan anomali bansos warga a.n ${sanggahan.nama_warga} telah diputus: ${status_review.replace('_', ' ')}. Catatan: ${catatan_kelurahan || '-'}`,
            tipe: status_review === 'DITOLAK' ? 'warning' : 'success',
            link: '/dashboard/bansos'
          });
        }
      }
    } catch (e) {
      console.warn('Notifikasi hasil audit review warning:', e.message);
    }

    return {
      success: true,
      message: `Keputusan audit bansos berhasil disimpan: ${status_review.replace('_', ' ')}.`,
      data: updated
    };
  }

  /**
   * Ambil data lengkap Berita Acara Audit Sanggahan Bansos format cetak dinas
   */
  async getAuditBeritaAcara(id, currentUser) {
    const sanggahan = await bansosRepository.getAuditSanggahanById(id);
    if (!sanggahan) {
      const err = new Error('Data audit sanggahan tidak ditemukan.');
      err.status = 404;
      throw err;
    }

    const warga = await wargaRepository.findByNik(sanggahan.nik_warga);
    const dateFormatted = new Date(sanggahan.tanggal_review || sanggahan.created_at || Date.now());
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const nomorBA = `BA-AUDIT/${romanMonths[dateFormatted.getMonth()]}/${dateFormatted.getFullYear()}/${String(sanggahan.id).padStart(4, '0')}`;

    return {
      nomor_berita_acara: nomorBA,
      kop: {
        instansi: 'PEMERINTAH KOTA SUKABUMI',
        kecamatan: 'KECAMATAN ANDIR',
        kelurahan: 'KELURAHAN KEBONJATI',
        alamat: 'Jl. Kebonjati No. 1, Kota Sukabumi, Jawa Barat 40181',
        telepon: '(0266) 221-123',
        portal: 'bumiwarga.online'
      },
      sanggahan,
      warga,
      tanggal_resmi: dateFormatted.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      pejabat_lurah: {
        nama: 'H. Rahmat Hidayat, S.IP, M.Si',
        nip: '19760815 200212 1 003',
        jabatan: 'Lurah Kebonjati'
      },
      qr_verification_code: `VERIF-SPBE-BW-${sanggahan.id}-${Date.now().toString(36).toUpperCase()}`
    };
  }

  /**
   * Ambil metrik transparansi penyelamatan kuota bansos dari temuan audit lapangan
   */
  async getStatsPenyelamatan(currentUser) {
    const pool = require('../db/pool');
    const { role, rt, rw } = currentUser;
    let query = `
      SELECT 
        COUNT(*) AS total_sanggahan_sah,
        COALESCE(SUM(CASE WHEN tipe_sanggahan = 'TIDAK_LAYAK' THEN 1 ELSE 0 END), 0) AS total_warga_mampu_graduasi,
        COALESCE(SUM(CASE WHEN tipe_sanggahan = 'SUDAH_PINDAH' THEN 1 ELSE 0 END), 0) AS total_pindah_wilayah,
        COALESCE(SUM(CASE WHEN tipe_sanggahan = 'MENINGGAL_DUNIA' THEN 1 ELSE 0 END), 0) AS total_meninggal,
        COALESCE(SUM(CASE WHEN tipe_sanggahan = 'LAYAK_BELUM_TERDAFTAR' THEN 1 ELSE 0 END), 0) AS total_inklusi_baru
      FROM bansos_audit_sanggahan
      WHERE status_review IN ('DISETUJUI_PENCABUTAN', 'DISETUJUI_INKLUSI')
    `;
    const params = [];
    if (role === 'ketua_rt') {
      query += ' AND rt = ? AND rw = ?';
      params.push(rt, rw);
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      query += ' AND rw = ?';
      params.push(rw);
    }

    const [rows] = await pool.execute(query, params);
    const row = rows[0] || {};
    const totalDicabut = Number(row.total_warga_mampu_graduasi || 0) + Number(row.total_pindah_wilayah || 0) + Number(row.total_meninggal || 0);
    const estimasiDanaDiselamatkan = totalDicabut * 600000;

    return {
      total_kuota_diselamatkan: totalDicabut,
      estimasi_dana_diselamatkan: estimasiDanaDiselamatkan,
      total_inklusi_prioritas: Number(row.total_inklusi_baru || 0),
      rincian: {
        warga_mampu: Number(row.total_warga_mampu_graduasi || 0),
        pindah: Number(row.total_pindah_wilayah || 0),
        meninggal: Number(row.total_meninggal || 0)
      }
    };
  }
}

module.exports = new BansosService();

