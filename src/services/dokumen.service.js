/**
 * src/services/dokumen.service.js
 * Business Logic Layer for Multi-Tier Document Approvals & Demography Event Triggers.
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');
const dokumenRepository = require('../repositories/dokumen.repository');
const notifikasiRepository = require('../repositories/notifikasi.repository');
const bansosRepository = require('../repositories/bansos.repository');
const wargaRepository = require('../repositories/warga.repository');
const completenessService = require('./completeness.service');
const completenessRepository = require('../repositories/completeness.repository');
const fasilitasRepository = require('../repositories/fasilitas.repository');
const { generateCsv, generateExcelXml, maskPii } = require('../utils/export.util');

class DokumenService {
  /**
   * Ambil data profil untuk AI Auto-Fill Surat Instan (Syarat: skor kelengkapan >= 80%)
   */
  async getPrefillData(currentUser) {
    const activeNik = currentUser.active_nik || currentUser.username;
    if (!activeNik) {
      return { eligible: false, message: 'Sesi NIK tidak ditemukan' };
    }
    const rawData = await completenessRepository.getCitizenRawData(activeNik);
    if (!rawData || !rawData.warga) {
      return { eligible: false, message: 'Data warga tidak ditemukan' };
    }
    const scoreResult = completenessService.calculateCitizenScore(
      rawData.warga,
      rawData.desil,
      rawData.posyanduBalita,
      rawData.posyanduLansia,
      rawData.user
    );

    // Ambil anggota keluarga dalam 1 KK yang sama
    let familyMembers = [];
    if (rawData.warga.no_kk) {
      try {
        const userRepo = require('../repositories/user.repository');
        familyMembers = await userRepo.findFamilyMembersByNoKK(rawData.warga.no_kk);
      } catch (e) {
        console.warn('Error fetching familyMembers in getPrefillData:', e.message);
      }
    }

    return {
      eligible: scoreResult.auto_fill_eligible,
      score: scoreResult.total_score,
      tier: scoreResult.tier,
      tier_label: scoreResult.tier_label,
      profile: {
        nama: rawData.warga.nama,
        nik: rawData.warga.nik,
        no_kk: rawData.warga.no_kk,
        tempat_lahir: rawData.warga.tempat_lahir,
        tanggal_lahir: rawData.warga.tanggal_lahir,
        jenis_kelamin: rawData.warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        agama: rawData.warga.agama,
        status_perkawinan: rawData.warga.status_perkawinan,
        status_hubungan_keluarga: rawData.warga.status_hubungan_keluarga,
        pekerjaan: rawData.warga.pekerjaan,
        pendidikan_terakhir: rawData.warga.pendidikan_terakhir,
        golongan_darah: rawData.warga.golongan_darah,
        alamat: rawData.warga.alamat,
        rt: rawData.warga.rt,
        rw: rawData.warga.rw,
        no_telepon: rawData.warga.no_telepon,
        email: rawData.warga.email
      },
      familyMembers
    };
  }

  /**
   * Ajukan permohonan surat baru (bisa untuk diri sendiri atau anggota keluarga dalam 1 KK)
   * @param {Object} payload 
   * @param {Object} currentUser
   * @returns {Promise<Object>}
   */
  async requestDokumen(payload, currentUser) {
    let activeNik = currentUser.active_nik || currentUser.username;
    const { 
      jenis_dokumen, 
      keperluan, 
      is_auto_filled_by_ai,
      nik_pemohon: requestedNik,
      data_tambahan,
      syarat_berkas
    } = payload;

    if (!activeNik) {
      const err = new Error('Sesi autentikasi NIK pemohon tidak ditemukan');
      err.status = 401;
      throw err;
    }

    if (!jenis_dokumen || jenis_dokumen.trim() === '') {
      const err = new Error('Jenis dokumen/surat wajib dipilih');
      err.status = 400;
      throw err;
    }

    if (!keperluan || keperluan.trim().length < 5) {
      const err = new Error('Keperluan permohonan surat minimal 5 karakter');
      err.status = 400;
      throw err;
    }

    // 1. Ambil data domisili user pemohon
    let userWarga = await wargaRepository.findByNik(activeNik);
    
    // Jika activeNik adalah Nomor KK atau belum terdaftar langsung di NIK, cari via No KK
    if (!userWarga && currentUser.no_kk) {
      try {
        const [wByKk] = await pool.execute(
          'SELECT * FROM warga WHERE no_kk = ? ORDER BY CASE status_hubungan_keluarga WHEN "Kepala Keluarga" THEN 1 ELSE 2 END, id ASC LIMIT 1',
          [currentUser.no_kk]
        );
        if (wByKk.length > 0) userWarga = wByKk[0];
      } catch (e) {}
    }
    if (!userWarga && activeNik) {
      try {
        const [wByKkAlt] = await pool.execute(
          'SELECT * FROM warga WHERE no_kk = ? ORDER BY CASE status_hubungan_keluarga WHEN "Kepala Keluarga" THEN 1 ELSE 2 END, id ASC LIMIT 1',
          [activeNik]
        );
        if (wByKkAlt.length > 0) userWarga = wByKkAlt[0];
      } catch (e) {}
    }

    // Pastikan activeNik merujuk ke NIK riil pemohon
    if (userWarga && userWarga.nik) {
      activeNik = userWarga.nik;
    }

    // 2. Tentukan subjek permohonan (Diri Sendiri atau Anggota Keluarga dalam 1 KK)
    let targetNik = activeNik;
    let targetNama = userWarga?.nama || currentUser.nama || currentUser.username;
    let targetHubungan = userWarga?.status_hubungan_keluarga || 'Kepala Keluarga';
    let isDiajukanUntukKeluarga = false;

    // Normalisasi requestedNik: jika "self" atau Nomor KK, samakan dengan activeNik
    let cleanRequestedNik = requestedNik;
    if (cleanRequestedNik === 'self' || cleanRequestedNik === userWarga?.no_kk || cleanRequestedNik === currentUser.no_kk) {
      cleanRequestedNik = activeNik;
    }

    if (cleanRequestedNik && cleanRequestedNik !== activeNik) {
      // Validasi bahwa cleanRequestedNik berada dalam 1 KK yang sama untuk role warga
      if (currentUser.role === 'warga') {
        const userNoKK = userWarga?.no_kk || currentUser.no_kk;
        const userRepo = require('../repositories/user.repository');
        let family = [];
        if (userNoKK) {
          try {
            family = await userRepo.findFamilyMembersByNoKK(userNoKK);
          } catch (e) {}
        }
        if ((!family || family.length === 0) && currentUser.family_members && currentUser.family_members.length > 0) {
          family = currentUser.family_members;
        }

        const member = family.find(f => f.nik === cleanRequestedNik);
        if (member) {
          targetNik = member.nik;
          targetNama = member.nama;
          targetHubungan = member.status_hubungan_keluarga || member.hubungan_keluarga || 'Anggota Keluarga';
          isDiajukanUntukKeluarga = true;
        } else {
          // Cari langsung di tabel warga
          const targetW = await wargaRepository.findByNik(cleanRequestedNik);
          if (targetW && (!userNoKK || targetW.no_kk === userNoKK)) {
            targetNik = targetW.nik;
            targetNama = targetW.nama;
            targetHubungan = targetW.status_hubungan_keluarga || targetW.hubungan_keluarga || 'Anggota Keluarga';
            isDiajukanUntukKeluarga = true;
          } else {
            const err = new Error('Permohonan hanya dapat diajukan untuk diri sendiri atau anggota keluarga yang terdaftar dalam satu Kartu Keluarga (KK) yang sama.');
            err.status = 403;
            throw err;
          }
        }
      } else {
        // Petugas / Admin dapat mengajukan atas nama warga (Loket Dampingan / Offline)
        let targetW = await wargaRepository.findByNik(cleanRequestedNik);
        if (targetW) {
          targetNik = targetW.nik;
          targetNama = targetW.nama;
          targetHubungan = targetW.status_hubungan_keluarga || 'Warga';
          isDiajukanUntukKeluarga = true;
        } else if (cleanRequestedNik && (payload.nama_pemohon || payload.nama_subjek || payload.data_tambahan?.nama_warga)) {
          // Warga Pendatang / Non-Permanen belum ada di tabel warga, daftarkan otomatis agar integritas foreign key terjaga
          const pendatangNama = payload.nama_pemohon || payload.nama_subjek || payload.data_tambahan?.nama_warga || 'Warga Pendatang';
          try {
            await wargaRepository.create({
              nik: cleanRequestedNik,
              nama: pendatangNama,
              status_hubungan_keluarga: 'Warga Pendatang',
              rt: currentUser.rt || '001',
              rw: currentUser.rw || '001',
              status_kependudukan: 'Tidak Tetap'
            });
            targetW = await wargaRepository.findByNik(cleanRequestedNik);
            if (targetW) {
              targetNik = targetW.nik;
              targetNama = targetW.nama;
              targetHubungan = 'Warga Pendatang';
              isDiajukanUntukKeluarga = true;
            }
          } catch (createErr) {
            console.warn('[DokumenService] Auto-create pendatang warning:', createErr.message);
          }
        }
      }
    }

    // Pencegahan foreign key constraint fk_dokumen_warga: Pastikan targetNik ada di tabel warga
    let targetWarga = await wargaRepository.findByNik(targetNik);
    if (!targetWarga && userWarga && userWarga.nik) {
      targetNik = userWarga.nik;
      targetWarga = userWarga;
    }

    const rt = targetWarga ? targetWarga.rt : (userWarga ? userWarga.rt : (currentUser.rt || '001'));
    const rw = targetWarga ? targetWarga.rw : (userWarga ? userWarga.rw : (currentUser.rw || '001'));

    const isRwEmergencyBypass = Boolean(
      (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') && 
      (payload.is_emergency_bypass || payload.emergency_bypass || payload.direct_rw_approval || payload.is_assisted)
    );
    const isDirectRtApproval = Boolean(
      payload.direct_rt_approval || (currentUser.role === 'ketua_rt' && payload.is_assisted)
    );

    let initialStatus = 'SUBMITTED';
    let initialStep = 'RT';

    if (isRwEmergencyBypass) {
      initialStatus = 'VERIFYING';
      initialStep = 'KELURAHAN';
    } else if (isDirectRtApproval) {
      initialStatus = 'VERIFYING';
      initialStep = 'RW';
    }

    const result = await dokumenRepository.create({
      nik_pemohon: targetNik,
      diajukan_oleh_nik: (isDiajukanUntukKeluarga || currentUser.role !== 'warga') ? activeNik : null,
      nama_subjek: targetNama,
      hubungan_keluarga: targetHubungan,
      data_tambahan,
      syarat_berkas,
      jenis_dokumen: jenis_dokumen.trim(),
      keperluan: keperluan.trim(),
      status: initialStatus,
      approval_step: initialStep,
      rt,
      rw,
      is_auto_filled_by_ai: Boolean(is_auto_filled_by_ai),
      acted_by_user_id: currentUser.id
    });

    if (isRwEmergencyBypass && (result.id || result.insertId)) {
      try {
        await dokumenRepository.updateApproval(result.id || result.insertId, {
          status: 'VERIFYING',
          approval_step: 'KELURAHAN',
          approved_by_rt: currentUser.id,
          approved_by_rw: currentUser.id,
          catatan_petugas: payload.bypass_reason 
            ? `Bypass Diskresi Darurat RW: ${payload.bypass_reason}`
            : 'Disahkan via Diskresi Darurat Ketua RW (Ketua RT berhalangan/kebutuhan mendesak warga) dan langsung diteruskan ke Kelurahan.'
        });
      } catch (apprErr) {
        console.warn('Auto-approval step update note:', apprErr.message);
      }
    } else if (isDirectRtApproval && (result.id || result.insertId)) {
      try {
        await dokumenRepository.updateApproval(result.id || result.insertId, {
          status: 'VERIFYING',
          approval_step: 'RW',
          approved_by_rt: currentUser.id,
          catatan_petugas: 'Diajukan melalui Loket Dampingan RT dan langsung diverifikasi faktual oleh Ketua RT.'
        });
      } catch (apprErr) {
        console.warn('Auto-approval step update note:', apprErr.message);
      }
    }

    // Kirim notifikasi konfirmasi ke pemohon
    try {
      await notifikasiRepository.create({
        nik_target: activeNik,
        judul: 'Permohonan Surat Diajukan',
        pesan: isDiajukanUntukKeluarga 
          ? `Permohonan ${jenis_dokumen} untuk anggota keluarga an. ${targetNama} (${targetHubungan}) berhasil diajukan dan sedang menunggu verifikasi Ketua RT ${rt}.`
          : `Permohonan ${jenis_dokumen} berhasil diajukan dan sedang menunggu verifikasi Ketua RT ${rt}.`,
        tipe: 'info',
        link: '/dashboard/dokumen'
      });
    } catch (e) {
      console.warn('Gagal memicu notifikasi pengajuan dokumen:', e.message);
    }

    return {
      id: result.id || result.insertId,
      nomor_registrasi: result.nomor_registrasi,
      nik_pemohon: targetNik,
      nama_pemohon: targetNama,
      diajukan_oleh_nik: isDiajukanUntukKeluarga ? activeNik : null,
      hubungan_keluarga: targetHubungan,
      ...payload,
      status: 'SUBMITTED',
      created_at: new Date()
    };
  }

  /**
   * Ambil daftar permohonan surat warga tertentu
   */
  async getByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }
    return await dokumenRepository.findByNik(nik);
  }

  /**
   * Ambil seluruh permohonan surat (Operator / Admin)
   */
  async getAll() {
    return await dokumenRepository.list();
  }

  /**
   * Ambil seluruh permohonan surat berdasar hierarki peran
   */
  async listByScope(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {
      status: query.status || null,
      approval_step: query.approval_step || null,
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
      // Admin Kelurahan & Super Admin
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return await dokumenRepository.list(filter);
  }

  /**
   * Eksekusi trigger demografi otomatis saat surat disahkan oleh Kelurahan
   */
  async executeDemographyTrigger(doc) {
    const jenis = (doc.jenis_surat || doc.jenis_dokumen || '').toLowerCase();
    const nik = doc.nik_pemohon;

    console.log(`[Demography Trigger] Checking triggers for '${jenis}' on NIK: ${nik}`);

    // 1. Trigger Kematian / Surat Keterangan Meninggal Dunia
    if (jenis.includes('meninggal') || jenis.includes('kematian')) {
      await pool.execute(
        `UPDATE warga SET status_kependudukan = 'Meninggal' WHERE nik = ?`,
        [nik]
      );
      await pool.execute(
        `UPDATE users SET status = 'inactive' WHERE username = ?`,
        [nik]
      );
      await pool.execute(
        `UPDATE posyandu_lansia SET status_tinggal = 'Sebatang Kara' WHERE nik = ?`,
        [nik]
      );
      console.log(`[Trigger Sukses] Status kependudukan ${nik} diubah ke 'Meninggal' dan akun dinonaktifkan.`);
      return true;
    }

    // 2. Trigger Pindah Domisili
    if (jenis.includes('pindah') || jenis.includes('domisili')) {
      if (jenis.includes('pindah')) {
        await pool.execute(
          `UPDATE warga SET status_kependudukan = 'Pindah' WHERE nik = ?`,
          [nik]
        );
        console.log(`[Trigger Sukses] Status kependudukan ${nik} diubah ke 'Pindah'.`);
        return true;
      }
    }

    // 3. Trigger Surat Keterangan Tidak Mampu (SKTM) -> Masuk Antrean Bansos Otomatis
    if (jenis.includes('tidak mampu') || jenis.includes('sktm')) {
      const warga = await wargaRepository.findByNik(nik);
      if (warga) {
        await bansosRepository.create({
          no_kk: warga.no_kk,
          nik_penerima: warga.nik,
          nama_penerima: warga.nama,
          jenis_bansos: 'SKTM',
          alasan_pengajuan: `Otomatis direkomendasikan melalui pengesahan SKTM: ${doc.keperluan}`,
          nominal_bantuan: 300000.00,
          status: 'APPROVED',
          approval_step: 'COMPLETED',
          rt: warga.rt,
          rw: warga.rw,
          catatan_verifikasi: 'Evidensi tervalidasi via Surat Keterangan Tidak Mampu resmi Kelurahan Kebonjati.'
        });
        console.log(`[Trigger Sukses] Keluarga ${warga.nama} (KK: ${warga.no_kk}) otomatis dimasukkan ke daftar penerima bantuan SKTM.`);
        return true;
      }
    }

    // 4. Trigger Surat Keterangan Usaha (SKU) -> Masuk Direktori UMKM Otomatis
    if (jenis.includes('usaha') || jenis.includes('sku')) {
      const warga = await wargaRepository.findByNik(nik);
      if (warga) {
        let namaUsaha = `Usaha Mandiri ${warga.nama}`;
        const match = (doc.keperluan || '').match(/(?:nama\s*usaha|usaha)\s*[:=]\s*([^,\.\n]+)/i);
        if (match && match[1]) {
          namaUsaha = match[1].trim();
        }

        await fasilitasRepository.upsertFromSKU({
          nik_pemilik: warga.nik,
          nama_pemilik: warga.nama,
          nama_usaha: namaUsaha,
          keperluan: doc.keperluan,
          rt: warga.rt,
          rw: warga.rw,
          sku_no: doc.nomor_registrasi
        });
        console.log(`[Trigger Sukses] UMKM '${namaUsaha}' milik ${warga.nama} otomatis terdaftar di direktori usaha warga.`);
        return true;
      }
    }

    // 5. Trigger Surat Keterangan Kelahiran -> Otomatisasi Registrasi Bayi Warga & Enrolment Posyandu (1000 HPK)
    if (jenis.includes('kelahiran') || jenis.includes('lahir') || jenis.includes('akta')) {
      try {
        const ortuWarga = await wargaRepository.findByNik(nik);
        let dataTambahan = {};
        if (typeof doc.data_tambahan === 'string') {
          try { dataTambahan = JSON.parse(doc.data_tambahan); } catch (e) {}
        } else if (typeof doc.data_tambahan === 'object' && doc.data_tambahan !== null) {
          dataTambahan = doc.data_tambahan;
        }

        const namaAnak = dataTambahan.nama_anak || doc.nama_subjek || 'Bayi Baru Lahir';
        const rawJk = (dataTambahan.jenis_kelamin_anak || dataTambahan.jenis_kelamin || 'Laki-Laki').toLowerCase();
        const jenisKelamin = rawJk.includes('p') || rawJk.includes('perempuan') ? 'P' : 'L';
        const tglLahir = dataTambahan.tanggal_lahir_anak || dataTambahan.tanggal_lahir || new Date().toISOString().slice(0, 10);
        const tempatLahir = dataTambahan.tempat_lahir_anak || dataTambahan.tempat_lahir || (ortuWarga?.kota || 'Kota Sukabumi');
        const noKk = ortuWarga?.no_kk || doc.no_kk || '3272040000000000';
        const rt = ortuWarga?.rt || doc.rt || '001';
        const rw = ortuWarga?.rw || doc.rw || '001';
        const kelurahan = ortuWarga?.kelurahan || 'Kebonjati';
        const kecamatan = ortuWarga?.kecamatan || 'Cikole';
        const kota = ortuWarga?.kota || 'Kota Sukabumi';
        const agama = ortuWarga?.agama || 'Islam';

        // Format NIK sementara (Provisional NIK): 327204 + DDMMyy + random 4 digit
        const [yyyy, mm, dd] = tglLahir.split('-');
        let dayNum = parseInt(dd, 10) || 1;
        if (jenisKelamin === 'P') dayNum += 40; // Standar Dukcapil: wanita tanggal lahir + 40
        const ddStr = String(dayNum).padStart(2, '0');
        const mmStr = String(mm || '01').padStart(2, '0');
        const yyStr = String(yyyy || '2026').slice(-2);
        const random4 = Math.floor(1000 + Math.random() * 9000);
        // Format NIK sementara (Provisional NIK): Awalan '0000' + DDMMyy + 4 digit acak (16 digit)
        // Format NIK sementara (Provisional NIK): 000000 + DDMMyy + 4 digit acak (Tepat 16 Digit)
        const provisionalNik = `000000${ddStr}${mmStr}${yyStr}${random4}`;

        // 1. Tambahkan ke pangkalan data warga kependudukan
        const [existingWarga] = await pool.execute('SELECT id FROM warga WHERE nama = ? AND no_kk = ?', [namaAnak, noKk]);
        if (existingWarga.length === 0) {
          await pool.execute(
            `INSERT INTO warga 
             (nik, no_kk, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, status_perkawinan, status_hubungan_keluarga, status_kependudukan, rt, rw, kelurahan, kecamatan, kota, is_nik_sementara) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Belum Kawin', 'Anak', 'Tetap', ?, ?, ?, ?, ?, 1)`,
            [provisionalNik, noKk, namaAnak, jenisKelamin, tempatLahir, tglLahir, agama, rt, rw, kelurahan, kecamatan, kota]
          );
          console.log(`[Trigger Sukses] Bayi ${namaAnak} otomatis terdaftar di warga (NIK Sementara: ${provisionalNik}, KK: ${noKk}).`);
        }

        // 2. Cek apakah ibu terdaftar di posyandu_ibu_hamil, lalu perbarui status
        try {
          await pool.execute(
            `UPDATE posyandu_ibu_hamil SET usia_kehamilan_minggu = 40 WHERE no_kk = ? OR nik = ?`,
            [noKk, nik]
          );
        } catch (e) {}

        // 3. Enrolment Otomatis ke Posyandu Balita (1000 HPK)
        const [existingPos] = await pool.execute('SELECT id FROM posyandu WHERE nama_anak = ? AND nik_warga = ?', [namaAnak, provisionalNik]);
        if (existingPos.length === 0) {
          await pool.execute(
            `INSERT INTO posyandu 
             (nama_anak, nik_warga, tanggal_pemeriksaan, berat_badan, tinggi_badan, status_gizi, catatan, created_by) 
             VALUES (?, ?, ?, ?, ?, 'Normal', 'Pendaftaran otomatis balita 1000 HPK dari pengesahan Akta Kelahiran resmi Kelurahan', 'SISTEM')`,
            [namaAnak, provisionalNik, tglLahir, 3.2, 49.0]
          );
          console.log(`[Trigger Sukses] Bayi ${namaAnak} otomatis di-enroll ke pemantauan Posyandu balita.`);
        }

        return true;
      } catch (birthErr) {
        console.error('[Trigger Kelahiran Error]:', birthErr.message);
        return false;
      }
    }

    return false;
  }

  /**
   * Pemetaan Kode Klasifikasi Naskah Dinas Kelurahan sesuai Permendagri No. 83/2022
   * jo. Permendagri No. 138/2017 tentang Pola Klasifikasi Arsip Pemerintah Daerah
   */
  getKodeKlasifikasi(jenisDokumen = '') {
    const j = String(jenisDokumen || '').toLowerCase();
    if (j.includes('usaha') || j.includes('sku') || j.includes('umkm')) return '503';
    if (j.includes('tidak mampu') || j.includes('sktm') || j.includes('miskin') || j.includes('beasiswa')) return '463';
    if (j.includes('kematian') || j.includes('meninggal')) return '472.12';
    if (j.includes('kelahiran') || j.includes('lahir')) return '472.11';
    if (j.includes('skck') || j.includes('kelakuan baik') || j.includes('tertib')) return '331';
    if (j.includes('belum menikah') || j.includes('kawin') || j.includes('janda') || j.includes('duda')) return '474.2';
    if (j.includes('penghasilan') || j.includes('gaji')) return '560';
    if (j.includes('pindah') || j.includes('mutasi')) return '475';
    if (j.includes('domisili') || j.includes('tinggal') || j.includes('pengantar') || j.includes('keterangan')) return '470';
    return '470';
  }

  /**
   * Singkatan Resmi Kelurahan untuk Tata Naskah Dinas
   */
  getSingkatanKelurahan(kelurahan = 'Kebonjati') {
    const k = String(kelurahan || 'Kebonjati').toLowerCase();
    if (k.includes('kebonjati') || k.includes('kebon jati')) return 'Kel.Kbjt';
    if (k.includes('cikole')) return 'Kel.Ckl';
    if (k.includes('gunungpuyuh') || k.includes('gunung puyuh')) return 'Kel.Gnp';
    if (k.includes('baros')) return 'Kel.Brs';
    if (k.includes('cibeureum') || k.includes('cibereum')) return 'Kel.Cbr';
    if (k.includes('lembur')) return 'Kel.Lbr';
    if (k.includes('warudoyong')) return 'Kel.Wrd';
    
    const words = String(kelurahan).trim().split(/\s+/);
    if (words.length === 1) return `Kel.${kelurahan.substring(0, 4)}`;
    return `Kel.${words.map(w => w[0]).join('')}`;
  }

  /**
   * Formula Penomoran Resmi Naskah Dinas Kelurahan:
   * [Kode Klasifikasi] / [Nomor Urut Padded] - [Singkatan Kelurahan] / [Bulan Romawi] / [Tahun]
   */
  generateNomorSuratResmi(docId, jenisDokumen, kelurahan = 'Kebonjati') {
    const kode = this.getKodeKlasifikasi(jenisDokumen);
    const singkatan = this.getSingkatanKelurahan(kelurahan);
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const now = new Date();
    const romanMonth = romanMonths[now.getMonth()];
    const year = now.getFullYear();
    const paddedId = String(docId).padStart(3, '0');
    return `${kode}/${paddedId}-${singkatan}/${romanMonth}/${year}`;
  }

  /**
   * Verifikasi & Persetujuan Berjenjang (RT -> RW -> Kelurahan)
   */
  async approveDokumen(id, currentUser, catatan = '') {
    const doc = await dokumenRepository.findById(id);
    if (!doc) {
      const err = new Error('Dokumen tidak ditemukan');
      err.status = 404;
      throw err;
    }

    if (doc.status === 'APPROVED') {
      throw new Error('Dokumen ini sudah disetujui sebelumnya.');
    }
    if (doc.status === 'REJECTED') {
      throw new Error('Dokumen ini sudah ditolak dan tidak dapat diproses lagi.');
    }

    const { role } = currentUser;

    // STEP 1: Persetujuan Ketua RT
    if (role === 'ketua_rt') {
      if (doc.approval_step !== 'RT') {
        throw new Error('Tahap verifikasi dokumen ini bukan di tingkat RT.');
      }
      await dokumenRepository.updateApproval(id, {
        status: 'VERIFYING',
        approval_step: 'RW',
        approved_by_rt: currentUser.id,
        catatan_petugas: catatan || 'Disetujui oleh Ketua RT, diteruskan ke RW'
      });

      // Notifikasi ke warga
      try {
        await notifikasiRepository.create({
          nik_target: doc.nik_pemohon,
          judul: 'Persetujuan RT Berhasil',
          pesan: `Permohonan surat ${doc.jenis_dokumen} telah disetujui RT ${doc.rt} dan diteruskan ke RW ${doc.rw}.`,
          tipe: 'info',
          link: '/dashboard/dokumen'
        });
      } catch (e) {
        console.warn('Gagal memicu notifikasi update dokumen:', e.message);
      }

      return { success: true, step: 'RW', message: 'Disetujui oleh RT. Menunggu verifikasi RW.' };
    }

    // STEP 2: Persetujuan Ketua RW / Admin RW
    if (role === 'ketua_rw' || role === 'admin_rw') {
      if (doc.approval_step !== 'RW') {
        throw new Error('Tahap verifikasi dokumen ini bukan di tingkat RW.');
      }
      await dokumenRepository.updateApproval(id, {
        status: 'VERIFYING',
        approval_step: 'KELURAHAN',
        approved_by_rw: currentUser.id,
        catatan_petugas: catatan || 'Disetujui oleh RW, diteruskan ke Kelurahan'
      });

      try {
        await notifikasiRepository.create({
          nik_target: doc.nik_pemohon,
          judul: 'Persetujuan RW Berhasil',
          pesan: `Permohonan surat ${doc.jenis_dokumen} telah disetujui RW ${doc.rw} dan sedang diproses di Kelurahan Kebonjati.`,
          tipe: 'info',
          link: '/dashboard/dokumen'
        });
      } catch (e) {
        console.warn('Gagal memicu notifikasi update dokumen:', e.message);
      }

      return { success: true, step: 'KELURAHAN', message: 'Disetujui oleh RW. Menunggu pengesahan Kelurahan.' };
    }

    // STEP 3: Otorisasi & Pengesahan Kelurahan (Lurah / Admin Kelurahan)
    if (['admin_kelurahan', 'superadmin', 'admin', 'lurah', 'walikota', 'camat'].includes(role)) {
      const kelurahanName = doc.kelurahan || currentUser.kelurahan || 'Kebonjati';

      // 3.A. Jika aksi dilakukan oleh Staf / Admin Kelurahan (Verifikasi Berkas Administratif)
      // Dokumen diberi status READY_TTE dan approval_step tetap KELURAHAN agar masuk ke Meja TTE Lurah
      const isDirectLurahTTE = ['lurah', 'superadmin', 'walikota', 'camat'].includes(role) || Boolean(catatan && catatan.pin) || Boolean(currentUser.pin);

      if (role === 'admin_kelurahan' && !isDirectLurahTTE) {
        await dokumenRepository.updateApproval(id, {
          status: 'READY_TTE',
          approval_step: 'KELURAHAN',
          approved_by_kelurahan: currentUser.id,
          catatan_petugas: catatan || `Berkas telah diverifikasi lengkap oleh Staf Kelurahan ${kelurahanName}, menunggu penandatanganan TTE Lurah.`
        });

        // Notifikasi in-app ke warga (Resilient try-catch)
        try {
          await notifikasiRepository.create({
            nik_target: doc.nik_pemohon,
            judul: 'Berkas Surat Terverifikasi',
            pesan: `Permohonan surat ${doc.jenis_dokumen} Anda telah diverifikasi oleh Staf Kelurahan ${kelurahanName} dan diteruskan ke Meja TTE Lurah.`,
            tipe: 'info',
            link: '/dashboard/dokumen'
          });
        } catch (notifErr) {
          console.warn('[DokumenService] Catatan notifikasi verifikasi staf:', notifErr.message);
        }

        return {
          success: true,
          step: 'KELURAHAN',
          status: 'READY_TTE',
          message: `Berkas permohonan surat berhasil diverifikasi Staf Kelurahan. Dokumen siap ditandatangani oleh Lurah ${kelurahanName} (TTE).`
        };
      }

      // 3.B. Pengesahan TTE Digital Resmi oleh Lurah / Pejabat Berwenang
      const triggerRan = await this.executeDemographyTrigger(doc);

      const crypto = require('crypto');
      const now = new Date();
      const nomorSurat = this.generateNomorSuratResmi(id, doc.jenis_dokumen || doc.jenis_surat, kelurahanName);

      const signatureData = `${nomorSurat}|${doc.nik_pemohon}|${doc.jenis_dokumen || doc.jenis_surat}|${now.toISOString()}|Kelurahan ${kelurahanName}`;
      const qrCodeHash = crypto.createHash('sha256').update(signatureData).digest('hex');

      await dokumenRepository.updateApproval(id, {
        status: 'APPROVED',
        approval_step: 'COMPLETED',
        approved_by_kelurahan: currentUser.id,
        nomor_surat: nomorSurat,
        qr_code_hash: qrCodeHash,
        catatan_petugas: catatan || `Dokumen resmi disahkan oleh Lurah ${kelurahanName} (TTE Sah)`
      });

      // Notifikasi akhir ke warga (Resilient try-catch)
      try {
        await notifikasiRepository.create({
          nik_target: doc.nik_pemohon,
          judul: 'Surat Resmi Telah Disahkan',
          pesan: `Selamat! Permohonan ${doc.jenis_dokumen} Anda telah RESMI DISETUJUI dan disahkan oleh Kelurahan ${kelurahanName} dengan Nomor Surat: ${nomorSurat}.`,
          tipe: 'success',
          link: '/dashboard/dokumen'
        });
      } catch (notifErr) {
        console.warn('[DokumenService] Catatan notifikasi kelulusan surat:', notifErr.message);
      }

      // Notifikasi WhatsApp otomatis ke warga (Non-blocking asinkron agar respons HTTP instan)
      setImmediate(async () => {
        try {
          const warga = await wargaRepository.findByNik(doc.nik_pemohon);
          if (warga && warga.no_telepon) {
            const whatsappService = require('./whatsapp.service');
            await whatsappService.sendSuratNotification({
              phone: warga.no_telepon,
              nama: warga.nama,
              jenis_surat: doc.jenis_dokumen || doc.jenis_surat,
              nomor_surat: nomorSurat,
              qr_code_hash: qrCodeHash
            });
          }
        } catch (waErr) {
          console.warn('[DokumenService] Gagal mengirim notifikasi WhatsApp surat (non-blocking):', waErr.message);
        }
      });

      return { 
        success: true, 
        step: 'COMPLETED', 
        status: 'APPROVED', 
        nomor_surat: nomorSurat,
        qr_code_hash: qrCodeHash,
        trigger_executed: triggerRan,
        message: `Surat telah resmi disahkan oleh Lurah ${kelurahanName} dengan TTE Sah dan trigger data kependudukan berhasil dieksekusi.` 
      };
    }

    throw new Error('Peran Anda tidak memiliki wewenang untuk menyetujui dokumen ini.');
  }

  /**
   * Penolakan Dokumen oleh Petugas RT, RW, atau Kelurahan
   */
  async rejectDokumen(id, currentUser, catatan = '') {
    const doc = await dokumenRepository.findById(id);
    if (!doc) {
      const err = new Error('Dokumen tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const alasan = catatan || 'Persyaratan administrasi atau berkas belum lengkap.';

    await dokumenRepository.updateApproval(id, {
      status: 'REJECTED',
      approval_step: 'COMPLETED',
      catatan_petugas: `Ditolak oleh ${currentUser.nama} (${currentUser.role}): ${alasan}`
    });

    // Notifikasi penolakan ke warga
    await notifikasiRepository.create({
      nik_target: doc.nik_pemohon,
      judul: 'Permohonan Surat Ditolak',
      pesan: `Permohonan ${doc.jenis_dokumen} Anda tidak dapat diproses. Alasan: ${alasan}`,
      tipe: 'error',
      link: '/dashboard/dokumen'
    });

    return {
      success: true,
      status: 'REJECTED',
      message: 'Permohonan surat berhasil ditolak dengan catatan pemberitahuan ke warga.'
    };
  }

  /**
   * Pengembalian Dokumen untuk Perbaikan / Revisi (SOP Resmi RT/RW/Kelurahan)
   */
  async reviseDokumen(id, currentUser, catatan = '') {
    const doc = await dokumenRepository.findById(id);
    if (!doc) {
      const err = new Error('Dokumen tidak ditemukan');
      err.status = 404;
      throw err;
    }

    if (!catatan || catatan.trim().length < 3) {
      const err = new Error('Mohon sertakan instruksi perbaikan atau catatan revisi yang jelas untuk warga.');
      err.status = 400;
      throw err;
    }

    const catatanRevisi = `Dikembalikan untuk perbaikan oleh ${currentUser.nama} (${currentUser.role}): ${catatan.trim()}`;

    await dokumenRepository.updateApproval(id, {
      status: 'REVISION',
      approval_step: doc.approval_step || 'RT',
      catatan_petugas: catatanRevisi
    });

    await dokumenRepository.recordWorkflowHistory({
      dokumen_request_id: id,
      from_step: doc.approval_step || 'RT',
      to_step: doc.approval_step || 'RT',
      acted_by_user_id: currentUser.id,
      acted_by_role: currentUser.role,
      action: 'RETURN_FOR_REVISION',
      notes: catatan.trim()
    });

    await notifikasiRepository.create({
      nik_target: doc.nik_pemohon,
      judul: 'Permohonan Surat Perlu Perbaikan',
      pesan: `Permohonan ${doc.jenis_dokumen} Anda membutuhkan perbaikan berkas: "${catatan.trim()}". Silakan perbaiki melalui aplikasi.`,
      tipe: 'warning',
      link: '/dashboard/dokumen'
    });

    return {
      success: true,
      status: 'REVISION',
      message: 'Permohonan surat berhasil dikembalikan ke pemohon dengan instruksi perbaikan.'
    };
  }

  /**
   * Ekspor Buku Register Surat Pelayanan SPBE ke format XLSX / CSV
   */
  async exportRegisterSurat(filters = {}, currentUser, format = 'xlsx') {
    const docs = await this.listByScope(currentUser, filters);

    const headers = [
      'No',
      'Nomor Registrasi',
      'Nomor Surat Dinas',
      'Tanggal Pengajuan',
      'Tanggal Disahkan',
      'Jenis Surat Pelayanan',
      'Nama Pemohon',
      'NIK Pemohon',
      'Wilayah RT/RW',
      'Keperluan',
      'Status Dokumen',
      'Tahap Approval',
      'Hash TTE / QR Code'
    ];

    const isAuthorized = ['superadmin', 'admin', 'admin_kelurahan', 'lurah', 'ketua_rw', 'admin_rw', 'ketua_rt'].includes(currentUser.role);

    const rows = docs.map((d, idx) => {
      const maskedNik = isAuthorized ? (d.nik_pemohon || '-') : maskPii(d.nik_pemohon);
      return [
        idx + 1,
        d.nomor_registrasi || '-',
        d.nomor_surat || '(Belum terbit)',
        d.created_at ? new Date(d.created_at).toISOString().slice(0, 10) : '-',
        d.approved_at ? new Date(d.approved_at).toISOString().slice(0, 10) : '-',
        d.jenis_dokumen || d.jenis_surat || '-',
        d.nama_pemohon || '-',
        maskedNik,
        `RT ${d.rt || '-'}/RW ${d.rw || '-'}`,
        d.keperluan || '-',
        d.status || '-',
        d.approval_step || '-',
        d.qr_code_hash ? `${d.qr_code_hash.slice(0, 12)}...` : '-'
      ];
    });

    const kelurahan = currentUser.kelurahan || 'Kebonjati';

    if (format === 'csv') {
      const csvRows = docs.map((d, idx) => [
        idx + 1,
        d.nomor_registrasi || '-',
        d.nomor_surat || '-',
        d.created_at ? new Date(d.created_at).toISOString().slice(0, 10) : '-',
        d.approved_at ? new Date(d.approved_at).toISOString().slice(0, 10) : '-',
        d.jenis_dokumen || d.jenis_surat || '-',
        d.nama_pemohon || '-',
        isAuthorized ? (d.nik_pemohon || '-') : maskPii(d.nik_pemohon),
        `RT ${d.rt || '-'}/RW ${d.rw || '-'}`,
        d.keperluan || '-',
        d.status || '-',
        d.approval_step || '-',
        d.qr_code_hash || '-'
      ]);
      return {
        filename: `Register_Surat_${kelurahan}_${Date.now()}.csv`,
        mimeType: 'text/csv; charset=utf-8',
        content: generateCsv(headers, csvRows)
      };
    }

    const xml = generateExcelXml(`Register Surat SPBE Kelurahan ${kelurahan}`, [
      {
        name: `Register Pelayanan Surat`,
        headers,
        rows
      }
    ]);

    return {
      filename: `Register_Surat_${kelurahan}_${Date.now()}.xls`,
      mimeType: 'application/vnd.ms-excel',
      content: xml
    };
  }
}

module.exports = new DokumenService();
