/**
 * src/repositories/fasilitas.repository.js
 * Repository Layer for Public Facilities, Carrying Capacity, and Local Economy Ecosystem
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class FasilitasRepository {
  // =========================================================================
  // 1. SEKTOR PENDIDIKAN
  // =========================================================================

  /**
   * Mengambil daftar fasilitas pendidikan di kelurahan
   */
  async getPendidikanInventory(scope = {}) {
    let query = `
      SELECT id, nama_sekolah, npsn, jenjang, status_sekolah, alamat, rt, rw,
             kelurahan, kecamatan, kota, koordinat_lat_lng, daya_tampung_kursi_baru,
             total_kapasitas_murid, jumlah_rombel, akreditasi, no_telepon, kepala_sekolah,
             created_at, updated_at
      FROM fasilitas_pendidikan
      WHERE 1=1
    `;
    const params = [];

    if (scope.rw) {
      query += ` AND rw = ?`;
      params.push(scope.rw);
    }
    if (scope.rt) {
      query += ` AND rt = ?`;
      params.push(scope.rt);
    }

    query += ` ORDER BY FIELD(jenjang, 'PAUD', 'SD', 'SMP', 'SMA', 'SMK', 'SLB', 'PKBM'), nama_sekolah ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Agregasi kapasitas kursi sekolah vs populasi anak usia sekolah dari tabel warga
   */
  async getPendidikanSummary(scope = {}) {
    // 1. Kapasitas kursi sekolah berdasarkan jenjang
    const [sekolahStats] = await pool.query(`
      SELECT 
        jenjang,
        COUNT(*) as total_institusi,
        COALESCE(SUM(daya_tampung_kursi_baru), 0) as total_kursi_baru,
        COALESCE(SUM(total_kapasitas_murid), 0) as total_kapasitas,
        COALESCE(SUM(jumlah_rombel), 0) as total_rombel
      FROM fasilitas_pendidikan
      GROUP BY jenjang
    `);

    // 2. Populasi nyata anak usia sekolah dari tabel warga
    // PAUD: 3-6 thn, SD: 7-12 thn, SMP: 13-15 thn, SMA/SMK: 16-18 thn
    const [demografiAnak] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 3 AND 6 THEN 1 END) as usia_paud,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 7 AND 12 THEN 1 END) as usia_sd,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 13 AND 15 THEN 1 END) as usia_smp,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 16 AND 18 THEN 1 END) as usia_sma,
        -- Indikasi putus sekolah / belum sekolah pada usia wajib belajar (7-18 tahun)
        COUNT(CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 7 AND 18 
               AND pendidikan_terakhir IN ('Tidak/Belum Sekolah') 
          THEN 1 
        END) as potensi_anak_belum_sekolah
      FROM warga
      WHERE status_kependudukan = 'Tetap'
    `);

    return {
      kapasitas_jenjang: sekolahStats,
      demografi_anak: demografiAnak[0] || {
        usia_paud: 0,
        usia_sd: 0,
        usia_smp: 0,
        usia_sma: 0,
        potensi_anak_belum_sekolah: 0
      }
    };
  }

  async createPendidikan(data) {
    const {
      nama_sekolah, npsn, jenjang, status_sekolah = 'Negeri', alamat, rt = '001', rw = '001',
      daya_tampung_kursi_baru = 0, total_kapasitas_murid = 0, jumlah_rombel = 1,
      akreditasi = 'B', no_telepon = null, kepala_sekolah = null
    } = data;

    const [result] = await pool.execute(`
      INSERT INTO fasilitas_pendidikan (
        nama_sekolah, npsn, jenjang, status_sekolah, alamat, rt, rw,
        daya_tampung_kursi_baru, total_kapasitas_murid, jumlah_rombel,
        akreditasi, no_telepon, kepala_sekolah
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nama_sekolah, npsn, jenjang, status_sekolah, alamat, rt, rw,
      daya_tampung_kursi_baru, total_kapasitas_murid, jumlah_rombel,
      akreditasi, no_telepon, kepala_sekolah
    ]);

    return { id: result.insertId, ...data };
  }

  // =========================================================================
  // 2. SEKTOR KESEHATAN
  // =========================================================================

  /**
   * Mengambil inventaris faskes
   */
  async getKesehatanInventory(scope = {}) {
    let query = `
      SELECT id, nama_faskes, jenis_faskes, kategori_pengelola, alamat, rt, rw,
             kelurahan, kecamatan, kota, koordinat_lat_lng, jumlah_dokter, jumlah_bidan,
             jumlah_perawat, jumlah_ahli_gizi, kapasitas_tempat_tidur, layanan_igd_24jam,
             jam_operasional, no_kontak, penanggung_jawab, created_at, updated_at
      FROM fasilitas_kesehatan
      WHERE 1=1
    `;
    const params = [];

    if (scope.rw) {
      query += ` AND rw = ?`;
      params.push(scope.rw);
    }
    if (scope.rt) {
      query += ` AND rt = ?`;
      params.push(scope.rt);
    }

    query += ` ORDER BY FIELD(jenis_faskes, 'Puskesmas', 'Pustu', 'Klinik Pratama', 'Posyandu', 'Apotek', 'Praktik Mandiri'), nama_faskes ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Agregasi daya dukung medis dan rasio terhadap penduduk
   */
  async getKesehatanSummary(scope = {}) {
    // 1. Total tenaga medis & kapasitas
    const [medisStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_faskes,
        COALESCE(SUM(jumlah_dokter), 0) as total_dokter,
        COALESCE(SUM(jumlah_bidan), 0) as total_bidan,
        COALESCE(SUM(jumlah_perawat), 0) as total_perawat,
        COALESCE(SUM(jumlah_ahli_gizi), 0) as total_ahli_gizi,
        COALESCE(SUM(kapasitas_tempat_tidur), 0) as total_tempat_tidur,
        COUNT(CASE WHEN jenis_faskes = 'Posyandu' THEN 1 END) as total_posyandu
      FROM fasilitas_kesehatan
    `);

    // 2. Total populasi penduduk aktif
    const [popStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_penduduk,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 END) as total_balita,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 END) as total_lansia
      FROM warga
      WHERE status_kependudukan = 'Tetap'
    `);

    return {
      faskes: medisStats[0] || {
        total_faskes: 0,
        total_dokter: 0,
        total_bidan: 0,
        total_perawat: 0,
        total_ahli_gizi: 0,
        total_tempat_tidur: 0,
        total_posyandu: 0
      },
      populasi: popStats[0] || {
        total_penduduk: 0,
        total_balita: 0,
        total_lansia: 0
      }
    };
  }

  async createKesehatan(data) {
    const {
      nama_faskes, jenis_faskes, kategori_pengelola = 'Pemerintah', alamat, rt = '001', rw = '001',
      jumlah_dokter = 0, jumlah_bidan = 0, jumlah_perawat = 0, jumlah_ahli_gizi = 0,
      kapasitas_tempat_tidur = 0, layanan_igd_24jam = 0, jam_operasional = '08:00 - 16:00 WIB',
      no_kontak = null, penanggung_jawab = null
    } = data;

    const [result] = await pool.execute(`
      INSERT INTO fasilitas_kesehatan (
        nama_faskes, jenis_faskes, kategori_pengelola, alamat, rt, rw,
        jumlah_dokter, jumlah_bidan, jumlah_perawat, jumlah_ahli_gizi,
        kapasitas_tempat_tidur, layanan_igd_24jam, jam_operasional,
        no_kontak, penanggung_jawab
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nama_faskes, jenis_faskes, kategori_pengelola, alamat, rt, rw,
      jumlah_dokter, jumlah_bidan, jumlah_perawat, jumlah_ahli_gizi,
      kapasitas_tempat_tidur, layanan_igd_24jam ? 1 : 0, jam_operasional,
      no_kontak, penanggung_jawab
    ]);

    return { id: result.insertId, ...data };
  }

  // =========================================================================
  // 3. SEKTOR EKONOMI LOKAL & ENTITAS USAHA (AUTO-SYNC SKU)
  // =========================================================================

  /**
   * Mengambil daftar UMKM dan entitas usaha warga
   */
  async getEntitasUsahaList(scope = {}, filters = {}) {
    let query = `
      SELECT id, nama_usaha, nik_pemilik, nama_pemilik, kategori_usaha, skala_usaha,
             alamat, rt, rw, kelurahan, kecamatan, kota, koordinat_lat_lng,
             jumlah_tenaga_kerja_lokal, omset_bulanan_kategori, apakah_toko_pangan_murah,
             sku_nomor_registrasi, status_verifikasi, no_telepon, deskripsi_produk,
             created_at, updated_at
      FROM entitas_usaha
      WHERE 1=1
    `;
    const params = [];

    if (scope.rw) {
      query += ` AND rw = ?`;
      params.push(scope.rw);
    }
    if (scope.rt) {
      query += ` AND rt = ?`;
      params.push(scope.rt);
    }
    if (filters.kategori) {
      query += ` AND kategori_usaha = ?`;
      params.push(filters.kategori);
    }
    if (filters.is_pangan_murah) {
      query += ` AND apakah_toko_pangan_murah = 1`;
    }

    query += ` ORDER BY apakah_toko_pangan_murah DESC, nama_usaha ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Agregasi ekosistem usaha warga vs angkatan kerja produktif
   */
  async getEntitasUsahaSummary(scope = {}) {
    // 1. Total usaha & serapan naker
    const [bizStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_umkm,
        COALESCE(SUM(jumlah_tenaga_kerja_lokal), 0) as total_serapan_naker,
        COUNT(CASE WHEN apakah_toko_pangan_murah = 1 THEN 1 END) as total_toko_pangan_murah,
        COUNT(CASE WHEN sku_nomor_registrasi IS NOT NULL THEN 1 END) as total_terverifikasi_sku
      FROM entitas_usaha
      WHERE status_verifikasi = 'TERVERIFIKASI'
    `);

    // 2. Populasi usia produktif (15-64 tahun) & status pekerjaan
    const [nakerStats] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 15 AND 64 THEN 1 END) as usia_produktif,
        COUNT(CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 15 AND 64 
               AND (pekerjaan IS NULL OR pekerjaan IN ('Belum/Tidak Bekerja', 'Tidak Bekerja', 'Mengurus Rumah Tangga')) 
          THEN 1 
        END) as usia_produktif_belum_bekerja
      FROM warga
      WHERE status_kependudukan = 'Tetap'
    `);

    // 3. Jumlah keluarga Desil 1 & 2 per RW (Kebutuhan Akses Pangan Terjangkau)
    const [desilRentan] = await pool.query(`
      SELECT 
        kk.rw,
        COUNT(*) as total_keluarga_rentan
      FROM desil_keluarga dk
      JOIN kartu_keluarga kk ON dk.no_kk = kk.no_kk
      WHERE COALESCE(dk.desil_saat_ini, dk.desil_usulan) IN (1, 2)
      GROUP BY kk.rw
    `);

    // 4. Toko sembako murah per RW
    const [tokoPanganPerRW] = await pool.query(`
      SELECT 
        rw,
        COUNT(*) as jumlah_toko_pangan
      FROM entitas_usaha
      WHERE apakah_toko_pangan_murah = 1
      GROUP BY rw
    `);

    return {
      usaha: bizStats[0] || {
        total_umkm: 0,
        total_serapan_naker: 0,
        total_toko_pangan_murah: 0,
        total_terverifikasi_sku: 0
      },
      ketenagakerjaan: nakerStats[0] || {
        usia_produktif: 0,
        usia_produktif_belum_bekerja: 0
      },
      desil_rentan_per_rw: desilRentan,
      toko_pangan_per_rw: tokoPanganPerRW
    };
  }

  async createEntitasUsaha(data) {
    const {
      nama_usaha, nik_pemilik, nama_pemilik, kategori_usaha = 'Kuliner & Warung',
      skala_usaha = 'Mikro', alamat, rt = '001', rw = '001', jumlah_tenaga_kerja_lokal = 1,
      omset_bulanan_kategori = '< 5 Juta', apakah_toko_pangan_murah = 0,
      sku_nomor_registrasi = null, status_verifikasi = 'TERVERIFIKASI',
      no_telepon = null, deskripsi_produk = null
    } = data;

    const [result] = await pool.execute(`
      INSERT INTO entitas_usaha (
        nama_usaha, nik_pemilik, nama_pemilik, kategori_usaha, skala_usaha,
        alamat, rt, rw, jumlah_tenaga_kerja_lokal, omset_bulanan_kategori,
        apakah_toko_pangan_murah, sku_nomor_registrasi, status_verifikasi,
        no_telepon, deskripsi_produk
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nama_usaha, nik_pemilik, nama_pemilik, kategori_usaha, skala_usaha,
      alamat, rt, rw, jumlah_tenaga_kerja_lokal, omset_bulanan_kategori,
      apakah_toko_pangan_murah ? 1 : 0, sku_nomor_registrasi, status_verifikasi,
      no_telepon, deskripsi_produk
    ]);

    return { id: result.insertId, ...data };
  }

  /**
   * Helper Auto-Sync: Saat permohonan SKU disahkan, otomatis daftarkan / update UMKM
   */
  async upsertFromSKU({ nik_pemilik, nama_pemilik, nama_usaha, keperluan, rt, rw, sku_no }) {
    // Periksa apakah usaha dengan NIK dan nama serupa sudah tercatat
    const [existing] = await pool.query(
      `SELECT id FROM entitas_usaha WHERE nik_pemilik = ? AND nama_usaha = ? LIMIT 1`,
      [nik_pemilik, nama_usaha]
    );

    if (existing.length > 0) {
      await pool.execute(`
        UPDATE entitas_usaha 
        SET sku_nomor_registrasi = ?, status_verifikasi = 'TERVERIFIKASI', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [sku_no, existing[0].id]);
      return { action: 'UPDATED', id: existing[0].id };
    } else {
      // Deteksi kategori usaha dari deskripsi teks keperluan
      let kategori = 'Kuliner & Warung';
      const text = (keperluan || '').toLowerCase();
      if (text.includes('sembako') || text.includes('kelontong') || text.includes('warung toko')) {
        kategori = 'Toko Sembako / Kelontong';
      } else if (text.includes('bengkel') || text.includes('laundry') || text.includes('servis') || text.includes('jasa')) {
        kategori = 'Jasa & Servis';
      } else if (text.includes('kaos') || text.includes('konveksi') || text.includes('baju') || text.includes('kain')) {
        kategori = 'Fashion & Tekstil';
      } else if (text.includes('tani') || text.includes('ternak') || text.includes('lele') || text.includes('sayur')) {
        kategori = 'Pertanian & Peternakan Perkotaan';
      }

      const isPanganMurah = kategori === 'Toko Sembako / Kelontong' ? 1 : 0;

      const [result] = await pool.execute(`
        INSERT INTO entitas_usaha (
          nama_usaha, nik_pemilik, nama_pemilik, kategori_usaha, skala_usaha,
          alamat, rt, rw, jumlah_tenaga_kerja_lokal, omset_bulanan_kategori,
          apakah_toko_pangan_murah, sku_nomor_registrasi, status_verifikasi,
          deskripsi_produk
        ) VALUES (?, ?, ?, ?, 'Mikro', ?, ?, ?, 1, '< 5 Juta', ?, ?, 'TERVERIFIKASI', ?)
      `, [
        nama_usaha, nik_pemilik, nama_pemilik, kategori,
        `Wilayah RT ${rt} RW ${rw}`, rt, rw, isPanganMurah, sku_no,
        keperluan || 'Usaha mandiri warga terdaftar via SKU resmi kelurahan'
      ]);

      return { action: 'CREATED', id: result.insertId };
    }
  }

  // =========================================================================
  // 4. SEKTOR SANITASI & KORELASI STUNTING
  // =========================================================================

  /**
   * Profil sanitasi lingkungan per RT dan korelasi kasus balita stunting
   */
  async getSanitasiSummaryByRT() {
    // 1. Data agregasi sanitasi dari desil_keluarga
    const [sanitasiRows] = await pool.query(`
      SELECT 
        kk.rt,
        kk.rw,
        COUNT(*) as total_kk,
        COUNT(CASE WHEN dk.sumber_air IN ('PDAM/Leding', 'Sumur Terlindung') THEN 1 END) as air_bersih_layak,
        COUNT(CASE WHEN dk.sumber_air NOT IN ('PDAM/Leding', 'Sumur Terlindung') THEN 1 END) as air_non_layak,
        COUNT(CASE WHEN dk.jenis_sanitasi = 'Jamban Pribadi Leher Angsa' THEN 1 END) as jamban_sehat,
        COUNT(CASE WHEN dk.jenis_sanitasi != 'Jamban Pribadi Leher Angsa' THEN 1 END) as jamban_non_standar,
        COUNT(CASE WHEN dk.pembuangan_limbah = 'Septic Tank Standar' THEN 1 END) as limbah_standar
      FROM kartu_keluarga kk
      LEFT JOIN desil_keluarga dk ON kk.no_kk = dk.no_kk
      GROUP BY kk.rt, kk.rw
      ORDER BY kk.rw ASC, kk.rt ASC
    `);

    // 2. Data balita gizi kurang / stunting per RT dari posyandu
    const [stuntingRows] = await pool.query(`
      SELECT 
        w.rt,
        w.rw,
        COUNT(DISTINCT p.id) as kasus_stunting_balita
      FROM posyandu p
      JOIN warga w ON p.nik_warga = w.nik
      WHERE p.status_gizi IN ('Gizi Buruk', 'Gizi Kurang')
      GROUP BY w.rt, w.rw
    `);

    return {
      sanitasi_rt: sanitasiRows,
      stunting_rt: stuntingRows
    };
  }
}

module.exports = new FasilitasRepository();

