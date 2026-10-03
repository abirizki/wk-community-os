/**
 * src/routes/scanner.routes.js
 * Universal QR Scanner & Smart Citizen Pass API (Sprint 5)
 * Bumi Warga - Jabar Pintar Digital (Kelurahan Kebonjati, Cikole, Kota Sukabumi)
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth.middleware');
const wargaRepository = require('../repositories/warga.repository');
const bansosRepository = require('../repositories/bansos.repository');
const dokumenRepository = require('../repositories/dokumen.repository');

function parseQrPayload(rawInput) {
  if (!rawInput) return { type: 'UNKNOWN', value: null };
  const str = String(rawInput).trim();

  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.nik) return { type: 'NIK', value: parsed.nik, meta: parsed };
      if (parsed.no_kk) return { type: 'NO_KK', value: parsed.no_kk, meta: parsed };
    } catch (e) {}
  }

  if (str.startsWith('BUMIWARGA:PASS:')) {
    const content = str.replace('BUMIWARGA:PASS:', '').trim();
    if (content.startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        return { type: 'NIK', value: parsed.nik || parsed.no_kk, meta: parsed };
      } catch (e) {}
    }
    return { type: 'NIK', value: content };
  }

  if (str.includes('/verify-surat/') || str.includes('/verify/')) {
    const parts = str.split('/');
    const hash = parts[parts.length - 1];
    return { type: 'TTE_HASH', value: hash };
  }

  if (/^\d{16}$/.test(str)) {
    return { type: 'NIK_OR_KK', value: str };
  }

  if (str.startsWith('REG-') || str.includes('/Ktr.Kbjt/')) {
    return { type: 'NO_SURAT', value: str };
  }

  return { type: 'RAW_QUERY', value: str };
}

router.post('/lookup', requireAuth, async (req, res) => {
  try {
    const { code, mode = 'general' } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Kode QR atau nomor identitas wajib diisi' });
    }

    const parsed = parseQrPayload(code);
    let warga = null;
    let kk = null;
    let doc = null;

    if (parsed.type === 'TTE_HASH' || parsed.type === 'NO_SURAT') {
      if (parsed.type === 'TTE_HASH') {
        doc = await dokumenRepository.findByQrHash(parsed.value);
      } else {
        const [dRows] = await pool.execute(
          'SELECT * FROM dokumen_request WHERE nomor_registrasi = ? OR nomor_surat = ? LIMIT 1',
          [parsed.value, parsed.value]
        );
        if (dRows.length > 0) doc = dRows[0];
      }

      if (doc) {
        warga = await wargaRepository.findByNik(doc.nik_pemohon);
      }
    }

    if (!warga && parsed.value) {
      warga = await wargaRepository.findByNik(parsed.value);

      if (!warga) {
        const [byKk] = await pool.execute(
          'SELECT * FROM warga WHERE no_kk = ? ORDER BY CASE status_hubungan_keluarga WHEN "Kepala Keluarga" THEN 1 ELSE 2 END LIMIT 1',
          [parsed.value]
        );
        if (byKk.length > 0) warga = byKk[0];
      }

      if (!warga) {
        const [byNama] = await pool.execute(
          'SELECT * FROM warga WHERE nama LIKE ? LIMIT 1',
          [`%${parsed.value}%`]
        );
        if (byNama.length > 0) warga = byNama[0];
      }
    }

    if (!warga && !doc) {
      return res.status(404).json({
        success: false,
        message: `Data tidak ditemukan untuk input "${code}". Pastikan QR Code warga atau dokumen resmi Kelurahan Kebonjati.`
      });
    }

    let familyMembers = [];
    if (warga && warga.no_kk) {
      try {
        const [kkRows] = await pool.execute('SELECT * FROM kartu_keluarga WHERE no_kk = ? LIMIT 1', [warga.no_kk]);
        if (kkRows.length > 0) kk = kkRows[0];

        const [famRows] = await pool.execute('SELECT * FROM warga WHERE no_kk = ? ORDER BY id ASC', [warga.no_kk]);
        familyMembers = famRows;
      } catch (e) {}
    }

    let desilInfo = null;
    let bansosList = [];
    if (warga && warga.no_kk) {
      try {
        const [desRows] = await pool.execute('SELECT * FROM desil_keluarga WHERE no_kk = ? LIMIT 1', [warga.no_kk]);
        if (desRows.length > 0) desilInfo = desRows[0];

        const [banRows] = await pool.execute(
          'SELECT * FROM bansos_pengajuan WHERE no_kk = ? OR nik_penerima = ? ORDER BY created_at DESC',
          [warga.no_kk, warga.nik]
        );
        bansosList = banRows;
      } catch (e) {}
    }

    let posyanduData = { balita: [], lansia: [] };
    if (warga) {
      try {
        const [balitaRows] = await pool.execute(
          'SELECT * FROM posyandu WHERE nik_anak = ? OR nama_anak LIKE ? ORDER BY tanggal_kunjungan DESC LIMIT 5',
          [warga.nik, `%${warga.nama}%`]
        );
        posyanduData.balita = balitaRows;

        const [lansiaRows] = await pool.execute(
          'SELECT * FROM posyandu_lansia WHERE nik = ? ORDER BY tanggal_kunjungan DESC LIMIT 5',
          [warga.nik]
        );
        posyanduData.lansia = lansiaRows;
      } catch (e) {}
    }

    let dokumenList = [];
    if (warga) {
      try {
        dokumenList = await dokumenRepository.findByNik(warga.nik);
      } catch (e) {}
    }

    const isEligibleBansos = desilInfo && desilInfo.desil_saat_ini <= 4;
    const isLansia = warga && warga.tanggal_lahir && (new Date().getFullYear() - new Date(warga.tanggal_lahir).getFullYear()) >= 60;
    const isBalita = warga && warga.tanggal_lahir && (new Date().getFullYear() - new Date(warga.tanggal_lahir).getFullYear()) <= 5;

    res.json({
      success: true,
      mode,
      parsed_type: parsed.type,
      warga: warga ? {
        id: warga.id,
        nik: warga.nik,
        nama: warga.nama,
        no_kk: warga.no_kk,
        jenis_kelamin: warga.jenis_kelamin,
        tempat_lahir: warga.tempat_lahir,
        tanggal_lahir: warga.tanggal_lahir,
        agama: warga.agama,
        pekerjaan: warga.pekerjaan,
        alamat: warga.alamat,
        rt: warga.rt,
        rw: warga.rw,
        kelurahan: 'Kebonjati',
        kecamatan: 'Cikole',
        kota: 'Kota Sukabumi',
        no_telepon: warga.no_telepon,
        status_kependudukan: warga.status_kependudukan || 'Tetap',
        status_hubungan_keluarga: warga.status_hubungan_keluarga
      } : null,
      kk: kk ? {
        no_kk: kk.no_kk,
        kepala_keluarga: kk.kepala_keluarga,
        alamat: kk.alamat,
        rt: kk.rt,
        rw: kk.rw,
        kelurahan: kk.kelurahan,
        kecamatan: kk.kecamatan,
        kota: kk.kota
      } : null,
      family_members: familyMembers.map(f => ({
        nik: f.nik,
        nama: f.nama,
        status_hubungan_keluarga: f.status_hubungan_keluarga,
        jenis_kelamin: f.jenis_kelamin,
        tanggal_lahir: f.tanggal_lahir
      })),
      desil: desilInfo ? {
        desil_saat_ini: desilInfo.desil_saat_ini,
        status_dtks: desilInfo.status_dtks,
        status_verifikasi: desilInfo.status_verifikasi
      } : null,
      bansos: {
        eligible_for_assistance: isEligibleBansos,
        history: bansosList
      },
      posyandu: {
        is_balita: isBalita,
        is_lansia: isLansia,
        ...posyanduData
      },
      dokumen_terkait: doc,
      dokumen_history: dokumenList.slice(0, 5),
      quick_actions: [
        {
          id: 'ajukan_surat',
          label: 'Ajukan Surat Warga',
          url: `/dashboard/dokumen?action=new&for_nik=${warga ? warga.nik : ''}`,
          color: 'primary'
        },
        {
          id: 'verifikasi_bansos',
          label: 'Penyaluran Bansos',
          url: `/dashboard/bansos?search=${warga ? warga.nik : ''}`,
          color: 'emerald',
          disabled: !isEligibleBansos && bansosList.length === 0
        },
        {
          id: 'catat_posyandu',
          label: 'Pencatatan Posyandu',
          url: `/dashboard/posyandu?nik=${warga ? warga.nik : ''}`,
          color: 'rose',
          disabled: !isBalita && !isLansia
        }
      ]
    });
  } catch (error) {
    console.error('[ScannerLookup] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/citizen-pass/:nik', requireAuth, async (req, res) => {
  try {
    const { nik } = req.params;
    const warga = await wargaRepository.findByNik(nik);
    if (!warga) {
      return res.status(404).json({ success: false, message: 'Data warga tidak ditemukan' });
    }

    const payloadString = JSON.stringify({
      app: 'BUMI_WARGA_SMART_GOVERNANCE',
      nik: warga.nik,
      no_kk: warga.no_kk,
      nama: warga.nama,
      rt: warga.rt,
      rw: warga.rw,
      kel: 'Kebonjati',
      kec: 'Cikole',
      kota: 'Kota Sukabumi',
      issued_at: new Date().toISOString()
    });

    res.json({
      success: true,
      citizen_pass: {
        nik: warga.nik,
        nama: warga.nama,
        no_kk: warga.no_kk,
        alamat: warga.alamat,
        rt: warga.rt,
        rw: warga.rw,
        kelurahan: 'Kebonjati',
        kecamatan: 'Cikole',
        kota: 'Kota Sukabumi',
        qr_payload: payloadString,
        verify_url: `/verify/pass/${warga.nik}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
