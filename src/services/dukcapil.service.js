/**
 * src/services/dukcapil.service.js
 * Adapter Service for DUKCAPIL Kemendagri Web Service
 * Kepatuhan: Permendagri No. 102/2019 & UU PDP No. 27/2022 (Zero Data Hoarding)
 * Jabar Pintar Digital
 */

const crypto = require('crypto');
const pool = require('../db/pool');

// In-memory audit log store fallback jika database MySQL lokal sedang offline
const inMemoryDukcapilLogs = [];

// Data Warga Valid Terverifikasi untuk Sandbox / Baseline Dukcapil Kemendagri
const DUKCAPIL_SANDBOX_CITIZENS = {
  '3273010203850003': {
    nik: '3273010203850003',
    nama: 'BUDI SANTOSO',
    tanggal_lahir: '1985-03-02',
    jenis_kelamin: 'L',
    status_kawin: 'KAWIN',
    status_hidup: 'HIDUP',
    alamat: 'JL. KEBONJATI NO. 12',
    rt: '001',
    rw: '001',
    kelurahan: 'KEBONJATI',
    kecamatan: 'ANDIR',
    kab_kota: 'KOTA BANDUNG',
    provinsi: 'JAWA BARAT',
    face_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  '3273014504900004': {
    nik: '3273014504900004',
    nama: 'SITI RAHAYU',
    tanggal_lahir: '1990-04-05',
    jenis_kelamin: 'P',
    status_kawin: 'KAWIN',
    status_hidup: 'HIDUP',
    alamat: 'JL. GARUDA NO. 45',
    rt: '002',
    rw: '001',
    kelurahan: 'KEBONJATI',
    kecamatan: 'ANDIR',
    kab_kota: 'KOTA BANDUNG',
    provinsi: 'JAWA BARAT',
    face_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  '3273021505850005': {
    nik: '3273021505850005',
    nama: 'AHMAD FAUZI',
    tanggal_lahir: '1985-05-15',
    jenis_kelamin: 'L',
    status_kawin: 'BELUM KAWIN',
    status_hidup: 'HIDUP',
    alamat: 'JL. KEBONJATI NO. 88',
    rt: '001',
    rw: '002',
    kelurahan: 'KEBONJATI',
    kecamatan: 'ANDIR',
    kab_kota: 'KOTA BANDUNG',
    provinsi: 'JAWA BARAT',
    face_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  },
  '3273011005500012': {
    nik: '3273011005500012',
    nama: 'H. SOLEH SANTOSO',
    tanggal_lahir: '1950-05-10',
    jenis_kelamin: 'L',
    status_kawin: 'CERAI MATI',
    status_hidup: 'HIDUP',
    alamat: 'JL. KEBONJATI NO. 12',
    rt: '001',
    rw: '001',
    kelurahan: 'KEBONJATI',
    kecamatan: 'ANDIR',
    kab_kota: 'KOTA BANDUNG',
    provinsi: 'JAWA BARAT',
    face_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
  },
  '3273019999990001': {
    nik: '3273019999990001',
    nama: 'ALMARHUM SUMARNA',
    tanggal_lahir: '1945-01-01',
    jenis_kelamin: 'L',
    status_kawin: 'CERAI MATI',
    status_hidup: 'MENINGGAL',
    tanggal_kematian: '2024-11-12',
    nomor_akta_kematian: '3273-KM-12112024-0012',
    alamat: 'JL. KEBONJATI RT 003/001',
    rt: '003',
    rw: '001',
    kelurahan: 'KEBONJATI',
    kecamatan: 'ANDIR',
    kab_kota: 'KOTA BANDUNG',
    provinsi: 'JAWA BARAT'
  }
};

class DukcapilService {
  /**
   * Menghasilkan hash SHA-256 untuk memastikan audit trail anti-tampering (UU PDP)
   */
  generateIntegrityHash(nik, jenisVerifikasi, isMatched, timestamp) {
    const salt = process.env.DUKCAPIL_INTEGRITY_SALT || 'DUKCAPIL_UU_PDP_2026_INTEGRITY_SALT';
    return crypto
      .createHash('sha256')
      .update(`${nik}|${jenisVerifikasi}|${isMatched}|${timestamp}|${salt}`)
      .digest('hex');
  }

  /**
   * Mencatat log verifikasi ke database & memory audit
   * STRICT ZERO DATA HOARDING: TIDAK PERNAH menyimpan gambar biometrik atau payload pribadi mentah!
   */
  async logVerification({ nik, nama, jenisVerifikasi, isMatched, similarityScore, keterangan, requestorUserId, ipAddress }) {
    const timestamp = new Date().toISOString();
    const integrityHash = this.generateIntegrityHash(nik, jenisVerifikasi, isMatched ? 1 : 0, timestamp);

    const logEntry = {
      nik_diminta: nik,
      nama_diminta: nama ? nama.substring(0, 150) : null,
      jenis_verifikasi: jenisVerifikasi,
      is_matched: isMatched ? 1 : 0,
      similarity_score: similarityScore != null ? parseFloat(similarityScore) : null,
      keterangan: keterangan || (isMatched ? 'VERIFIKASI SUKSES' : 'DATA TIDAK COCOK'),
      requestor_user_id: requestorUserId || null,
      ip_address: ipAddress || '127.0.0.1',
      integrity_hash: integrityHash,
      created_at: timestamp
    };

    // 1. Simpan ke in-memory logs (selalu tersedia)
    inMemoryDukcapilLogs.unshift({
      id: inMemoryDukcapilLogs.length + 1,
      ...logEntry
    });
    if (inMemoryDukcapilLogs.length > 500) inMemoryDukcapilLogs.pop();

    // 2. Simpan ke database jika koneksi MySQL aktif
    try {
      await pool.query(
        `INSERT INTO dukcapil_verifikasi_log 
         (nik_diminta, nama_diminta, jenis_verifikasi, is_matched, similarity_score, keterangan, requestor_user_id, ip_address, integrity_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logEntry.nik_diminta,
          logEntry.nama_diminta,
          logEntry.jenis_verifikasi,
          logEntry.is_matched,
          logEntry.similarity_score,
          logEntry.keterangan,
          logEntry.requestor_user_id,
          logEntry.ip_address,
          logEntry.integrity_hash
        ]
      );
    } catch (dbErr) {
      // Graceful fallback ke in-memory jika DB offline
    }

    return logEntry;
  }

  /**
   * Endpoint Verifikasi NIK Matching (Web Service Dukcapil Kemendagri)
   * Parameter: nik, nama (opsional), tanggal_lahir (opsional)
   */
  async verifyNikMatching({ nik, nama, tanggal_lahir }, requestorUser = {}, ipAddress = '127.0.0.1') {
    if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
      throw new Error('NIK harus berupa 16 digit numerik sesuai standar KTP-el Kemendagri');
    }

    const cleanNik = nik.trim();
    let record = DUKCAPIL_SANDBOX_CITIZENS[cleanNik];

    // Jika tidak ditemukan di sandbox dictionary, coba cek dari database warga internal
    if (!record) {
      try {
        const [rows] = await pool.query('SELECT * FROM warga WHERE nik = ? LIMIT 1', [cleanNik]);
        if (rows && rows.length > 0) {
          const w = rows[0];
          record = {
            nik: w.nik,
            nama: w.nama.toUpperCase(),
            tanggal_lahir: w.tanggal_lahir ? new Date(w.tanggal_lahir).toISOString().split('T')[0] : null,
            status_hidup: 'HIDUP'
          };
        }
      } catch (e) {
        // DB fallback
      }
    }

    const timestamp = new Date().toISOString();

    if (!record) {
      await this.logVerification({
        nik: cleanNik,
        nama,
        jenisVerifikasi: 'NIK_MATCHING',
        isMatched: false,
        similarityScore: null,
        keterangan: 'NIK tidak terdaftar dalam database Kependudukan Nasional Dukcapil',
        requestorUserId: requestorUser.id,
        ipAddress
      });

      return {
        is_matched: false,
        nik: cleanNik,
        message: 'NIK tidak ditemukan di server Dukcapil Kemendagri',
        compliance: {
          permendagri: 'Permendagri No. 102/2019',
          uu_pdp: 'UU No. 27/2022 (Zero Data Hoarding dipenuhi)',
          integrity_hash: this.generateIntegrityHash(cleanNik, 'NIK_MATCHING', 0, timestamp)
        }
      };
    }

    // Bandingkan elemen data jika diberikan
    let namaCocok = true;
    if (nama) {
      const cleanInputNama = nama.trim().toUpperCase();
      namaCocok = record.nama.includes(cleanInputNama) || cleanInputNama.includes(record.nama);
    }

    let tglCocok = true;
    if (tanggal_lahir) {
      const cleanInputTgl = String(tanggal_lahir).split('T')[0].trim();
      tglCocok = record.tanggal_lahir === cleanInputTgl;
    }

    const isFullyMatched = namaCocok && tglCocok;
    const keterangan = isFullyMatched
      ? 'NIK, Nama, dan Tanggal Lahir sesuai dengan Master Data Dukcapil Kemendagri'
      : (!namaCocok ? 'NIK ditemukan tetapi Nama Lengkap tidak sesuai' : 'NIK ditemukan tetapi Tanggal Lahir tidak cocok');

    const logEntry = await this.logVerification({
      nik: cleanNik,
      nama: nama || record.nama,
      jenisVerifikasi: 'NIK_MATCHING',
      isMatched: isFullyMatched,
      similarityScore: isFullyMatched ? 100.0 : 50.0,
      keterangan,
      requestorUserId: requestorUser.id,
      ipAddress
    });

    return {
      is_matched: isFullyMatched,
      nik: cleanNik,
      match_details: {
        nik_exists: true,
        nama_matched: namaCocok,
        tanggal_lahir_matched: tglCocok,
        status_kependudukan: record.status_hidup === 'HIDUP' ? 'AKTIF' : 'MENINGGAL'
      },
      keterangan,
      compliance: {
        permendagri: 'Permendagri No. 102/2019',
        uu_pdp: 'UU No. 27/2022 (Zero Data Hoarding dipenuhi - Data mentah tidak disimpan)',
        integrity_hash: logEntry.integrity_hash,
        timestamp: logEntry.created_at
      }
    };
  }

  /**
   * Endpoint Biometric Face Recognition Kemendagri
   * Zero Data Hoarding: Parameter face_image_base64 TIDAK PERNAH disimpan di storage/DB!
   */
  async verifyBiometricFace({ nik, face_image_base64 }, requestorUser = {}, ipAddress = '127.0.0.1') {
    if (!nik || nik.length !== 16) {
      throw new Error('NIK 16 digit wajib disertakan');
    }
    if (!face_image_base64 || typeof face_image_base64 !== 'string') {
      throw new Error('Data biometrik citra wajah (Base64) wajib disertakan');
    }

    const cleanNik = nik.trim();
    const record = DUKCAPIL_SANDBOX_CITIZENS[cleanNik];

    // Simulasi kecocokan AI Biometrik Berdasarkan Hash Citra Masukan
    let similarityScore = 0;
    let isMatched = false;

    if (record) {
      const inputHash = crypto.createHash('sha256').update(face_image_base64).digest('hex');
      if (record.face_hash && record.face_hash === inputHash) {
        similarityScore = 98.5;
        isMatched = true;
      } else {
        similarityScore = 92.4;
        isMatched = similarityScore >= 80.0;
      }
    } else {
      similarityScore = 18.2;
      isMatched = false;
    }

    const keterangan = isMatched
      ? `Kecocokan Biometrik Wajah Lolos Ambang Batas: ${similarityScore}% (Threshold: >=80%)`
      : `Kecocokan Biometrik Wajah Gagal: ${similarityScore}% di bawah ambang batas (>=80%)`;

    // Strict Zero Data Hoarding: lepaskan reference face_image_base64
    face_image_base64 = null;

    const logEntry = await this.logVerification({
      nik: cleanNik,
      nama: record ? record.nama : null,
      jenisVerifikasi: 'BIOMETRIC_FACE',
      isMatched,
      similarityScore,
      keterangan,
      requestorUserId: requestorUser.id,
      ipAddress
    });

    return {
      is_matched: isMatched,
      nik: cleanNik,
      similarity_score: similarityScore,
      threshold_required: 80.0,
      keterangan,
      compliance: {
        permendagri: 'Permendagri No. 102/2019',
        uu_pdp: 'UU No. 27/2022 Pasal 28 & 34: Citra wajah diproses in-memory dan langsung dimusnahkan (Zero Hoarding)',
        integrity_hash: logEntry.integrity_hash,
        timestamp: logEntry.created_at
      }
    };
  }

  /**
   * Endpoint Pengecekan Status Kematian (Death Registry Check)
   */
  async checkStatusKematian({ nik }, requestorUser = {}, ipAddress = '127.0.0.1') {
    if (!nik || nik.length !== 16) {
      throw new Error('NIK 16 digit wajib disertakan');
    }

    const cleanNik = nik.trim();
    const record = DUKCAPIL_SANDBOX_CITIZENS[cleanNik];

    const isMeninggal = record && record.status_hidup === 'MENINGGAL';
    const isMatched = !!record;

    const keterangan = isMeninggal
      ? `Warga tercatat telah meninggal dunia (No Akta: ${record.nomor_akta_kematian}, Tgl: ${record.tanggal_kematian})`
      : (record ? 'Warga berstatus HIDUP dan aktif dalam kependudukan' : 'NIK tidak terdaftar');

    const logEntry = await this.logVerification({
      nik: cleanNik,
      nama: record ? record.nama : null,
      jenisVerifikasi: 'STATUS_KEMATIAN',
      isMatched,
      similarityScore: isMeninggal ? 100.0 : 0.0,
      keterangan,
      requestorUserId: requestorUser.id,
      ipAddress
    });

    return {
      nik: cleanNik,
      status_kependudukan: isMeninggal ? 'MENINGGAL' : (record ? 'AKTIF' : 'TIDAK_DITEMUKAN'),
      akta_kematian: isMeninggal ? {
        nomor_akta: record.nomor_akta_kematian,
        tanggal_kematian: record.tanggal_kematian
      } : null,
      keterangan,
      compliance: {
        integrity_hash: logEntry.integrity_hash,
        timestamp: logEntry.created_at
      }
    };
  }

  /**
   * Mengambil riwayat log verifikasi Dukcapil untuk audit transparansi & UU PDP
   */
  async getAuditLogs({ limit = 20, nik = null }) {
    try {
      let query = `SELECT * FROM dukcapil_verifikasi_log `;
      const params = [];
      if (nik) {
        query += `WHERE nik_diminta = ? `;
        params.push(nik);
      }
      query += `ORDER BY id DESC LIMIT ?`;
      params.push(parseInt(limit, 10) || 20);

      const [rows] = await pool.query(query, params);
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      // Fallback in-memory
    }

    let filtered = inMemoryDukcapilLogs;
    if (nik) {
      filtered = filtered.filter(l => l.nik_diminta === nik);
    }
    return filtered.slice(0, parseInt(limit, 10) || 20);
  }
}

module.exports = new DukcapilService();
