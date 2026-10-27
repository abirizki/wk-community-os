/**
 * src/repositories/fasilitas.repository.js
 * Repository Layer for Public Facilities, Carrying Capacity, and Local Economy Ecosystem
 * Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi - Jabar Pintar Digital
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
  /**
   * Agregasi kapasitas kursi sekolah vs populasi anak usia sekolah dari tabel warga
   * Termasuk Proyeksi Kohort Siswa Masuk Tahun Depan (T+1)
   */
  async getPendidikanSummary(scope = {}) {
    // 1. Kapasitas kursi sekolah berdasarkan jenjang
    let schoolQuery = `
      SELECT 
        jenjang,
        COUNT(*) as total_institusi,
        COALESCE(SUM(daya_tampung_kursi_baru), 0) as total_kursi_baru,
        COALESCE(SUM(total_kapasitas_murid), 0) as total_kapasitas,
        COALESCE(SUM(jumlah_rombel), 0) as total_rombel
      FROM fasilitas_pendidikan
      WHERE 1=1
    `;
    const schoolParams = [];
    if (scope.kelurahan) {
      schoolQuery += ` AND kelurahan = ?`;
      schoolParams.push(scope.kelurahan);
    }
    schoolQuery += ` GROUP BY jenjang`;

    let [sekolahStats] = await pool.query(schoolQuery, schoolParams);
    if (!sekolahStats || sekolahStats.length === 0) {
      const [fallback] = await pool.query(`
        SELECT 
          jenjang,
          COUNT(*) as total_institusi,
          COALESCE(SUM(daya_tampung_kursi_baru), 0) as total_kursi_baru,
          COALESCE(SUM(total_kapasitas_murid), 0) as total_kapasitas,
          COALESCE(SUM(jumlah_rombel), 0) as total_rombel
        FROM fasilitas_pendidikan
        GROUP BY jenjang
      `);
      sekolahStats = fallback;
    }

    // 2. Populasi nyata anak usia sekolah dan Proyeksi Kohort T+1 dari tabel warga
    let wargaQuery = `
      SELECT 
        -- Usia Sekolah Tahun Berjalan (T)
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 3 AND 6 THEN 1 END) as usia_paud,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 7 AND 12 THEN 1 END) as usia_sd,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 13 AND 15 THEN 1 END) as usia_smp,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 16 AND 18 THEN 1 END) as usia_sma,
        
        -- Proyeksi Kohort Tahun Yang Akan Datang (T+1)
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 2 AND 3 THEN 1 END) as masuk_paud_t1,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) = 6 THEN 1 END) as masuk_sd_t1,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) = 12 THEN 1 END) as masuk_smp_t1,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) = 15 THEN 1 END) as masuk_sma_t1,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) = 18 THEN 1 END) as lulus_sekolah_ke_kerja_t1,

        -- Indikasi putus sekolah / belum sekolah pada usia wajib belajar (7-18 tahun)
        COUNT(CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 7 AND 18 
               AND pendidikan_terakhir IN ('Tidak/Belum Sekolah') 
          THEN 1 
        END) as potensi_anak_belum_sekolah
      FROM warga
      WHERE status_kependudukan = 'Tetap'
    `;
    const wargaParams = [];
    if (scope.rw) {
      wargaQuery += ` AND rw = ?`;
      wargaParams.push(scope.rw);
    }
    if (scope.rt) {
      wargaQuery += ` AND rt = ?`;
      wargaParams.push(scope.rt);
    }
    if (scope.kelurahan) {
      wargaQuery += ` AND kelurahan = ?`;
      wargaParams.push(scope.kelurahan);
    }

    const [demografiAnak] = await pool.query(wargaQuery, wargaParams);

    return {
      kapasitas_jenjang: sekolahStats,
      demografi_anak: demografiAnak[0] || {
        usia_paud: 0,
        usia_sd: 0,
        usia_smp: 0,
        usia_sma: 0,
        masuk_paud_t1: 0,
        masuk_sd_t1: 0,
        masuk_smp_t1: 0,
        masuk_sma_t1: 0,
        lulus_sekolah_ke_kerja_t1: 0,
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
  /**
   * Agregasi daya dukung medis, siklus hidup (Balita 1000 HPK & Lansia), serta proyeksi kelahiran (T+1)
   */
  async getKesehatanSummary(scope = {}) {
    // 1. Total tenaga medis & kapasitas fasilitas kesehatan
    let faskesQuery = `
      SELECT 
        COUNT(*) as total_faskes,
        COALESCE(SUM(jumlah_dokter), 0) as total_dokter,
        COALESCE(SUM(jumlah_bidan), 0) as total_bidan,
        COALESCE(SUM(jumlah_perawat), 0) as total_perawat,
        COALESCE(SUM(jumlah_ahli_gizi), 0) as total_ahli_gizi,
        COALESCE(SUM(kapasitas_tempat_tidur), 0) as total_tempat_tidur,
        COUNT(CASE WHEN jenis_faskes = 'Posyandu' THEN 1 END) as total_posyandu
      FROM fasilitas_kesehatan
      WHERE 1=1
    `;
    const faskesParams = [];
    if (scope.kelurahan) {
      faskesQuery += ` AND kelurahan = ?`;
      faskesParams.push(scope.kelurahan);
    }
    let [medisStats] = await pool.query(faskesQuery, faskesParams);
    if (!medisStats || medisStats.length === 0 || Number(medisStats[0]?.total_faskes) === 0) {
      const [fallbackMedis] = await pool.query(`
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
      medisStats = fallbackMedis;
    }

    // 2. Populasi nyata siklus hidup (Balita, Baduta 1000 HPK, Lansia) dari tabel warga
    let wargaQuery = `
      SELECT 
        COUNT(*) as total_penduduk,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 END) as total_balita,
        COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, tanggal_lahir, CURDATE()) BETWEEN 0 AND 23 THEN 1 END) as baduta_1000hpk,
        COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, tanggal_lahir, CURDATE()) BETWEEN 24 AND 59 THEN 1 END) as balita_24_59bln,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 END) as total_lansia,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 70 THEN 1 END) as lansia_risti
      FROM warga
      WHERE status_kependudukan = 'Tetap'
    `;
    const wargaParams = [];
    if (scope.rw) {
      wargaQuery += ` AND rw = ?`;
      wargaParams.push(scope.rw);
    }
    if (scope.rt) {
      wargaQuery += ` AND rt = ?`;
      wargaParams.push(scope.rt);
    }
    if (scope.kelurahan) {
      wargaQuery += ` AND kelurahan = ?`;
      wargaParams.push(scope.kelurahan);
    }
    const [popStats] = await pool.query(wargaQuery, wargaParams);

    // 3. Ibu hamil & Proyeksi Kelahiran (T+1)
    let bumilStats = [{ total_ibu_hamil: 0, ibu_hamil_risti: 0, proyeksi_kelahiran_t1: 0 }];
    try {
      let bumilQuery = `
        SELECT 
          COUNT(*) as total_ibu_hamil,
          COUNT(CASE WHEN status_kek = 'Risiko KEK' OR status_risiko IN ('Risiko Tinggi', 'Sangat Tinggi') THEN 1 END) as ibu_hamil_risti,
          COUNT(*) as proyeksi_kelahiran_t1
        FROM posyandu_ibu_hamil
        WHERE 1=1
      `;
      const bumilParams = [];
      if (scope.rw) {
        bumilQuery += ` AND rw = ?`;
        bumilParams.push(scope.rw);
      }
      if (scope.rt) {
        bumilQuery += ` AND rt = ?`;
        bumilParams.push(scope.rt);
      }
      const [resBumil] = await pool.query(bumilQuery, bumilParams);
      if (resBumil && resBumil.length > 0) bumilStats = resBumil;
    } catch (e) {}

    // 4. Lansia sebatang kara dari kelompok rentan
    let lansiaRentanStats = [{ lansia_sebatang_kara: 0 }];
    try {
      let rentanQuery = `
        SELECT COUNT(*) as lansia_sebatang_kara
        FROM kelompok_rentan_rt
        WHERE kategori = 'LANSIA_SEBATANG_KARA'
      `;
      const rentanParams = [];
      if (scope.rw) {
        rentanQuery += ` AND rw = ?`;
        rentanParams.push(scope.rw);
      }
      if (scope.rt) {
        rentanQuery += ` AND rt = ?`;
        rentanParams.push(scope.rt);
      }
      const [resRentan] = await pool.query(rentanQuery, rentanParams);
      if (resRentan && resRentan.length > 0) lansiaRentanStats = resRentan;
    } catch (e) {}

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
        baduta_1000hpk: 0,
        balita_24_59bln: 0,
        total_lansia: 0,
        lansia_risti: 0
      },
      ibu_hamil: bumilStats[0] || {
        total_ibu_hamil: 0,
        ibu_hamil_risti: 0,
        proyeksi_kelahiran_t1: 0
      },
      lansia_rentan: lansiaRentanStats[0] || {
        lansia_sebatang_kara: 0
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
  /**
   * Agregasi ekosistem usaha warga vs angkatan kerja produktif dan pemuda masuk pasar kerja (T+1)
   */
  async getEntitasUsahaSummary(scope = {}) {
    // 1. Total usaha & serapan naker
    let bizQuery = `
      SELECT 
        COUNT(*) as total_umkm,
        COALESCE(SUM(jumlah_tenaga_kerja_lokal), 0) as total_serapan_naker,
        COUNT(CASE WHEN apakah_toko_pangan_murah = 1 THEN 1 END) as total_toko_pangan_murah,
        COUNT(CASE WHEN sku_nomor_registrasi IS NOT NULL THEN 1 END) as total_terverifikasi_sku
      FROM entitas_usaha
      WHERE status_verifikasi = 'TERVERIFIKASI'
    `;
    const bizParams = [];
    if (scope.rw) {
      bizQuery += ` AND rw = ?`;
      bizParams.push(scope.rw);
    }
    if (scope.rt) {
      bizQuery += ` AND rt = ?`;
      bizParams.push(scope.rt);
    }
    const [bizStats] = await pool.query(bizQuery, bizParams);

    // 2. Populasi usia produktif (15-64 tahun) & pemuda masuk angkatan kerja baru
    let nakerQuery = `
      SELECT 
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 15 AND 64 THEN 1 END) as usia_produktif,
        COUNT(CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 15 AND 64 
               AND (pekerjaan IS NULL OR pekerjaan IN ('Belum/Tidak Bekerja', 'Tidak Bekerja', 'Mengurus Rumah Tangga')) 
          THEN 1 
        END) as usia_produktif_belum_bekerja,
        COUNT(CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 17 AND 24 
               AND (pekerjaan IS NULL OR pekerjaan IN ('Belum/Tidak Bekerja', 'Pelajar / Mahasiswa', 'Tidak Bekerja')) 
          THEN 1 
        END) as pemuda_siap_kerja_t1
      FROM warga
      WHERE status_kependudukan = 'Tetap'
    `;
    const nakerParams = [];
    if (scope.rw) {
      nakerQuery += ` AND rw = ?`;
      nakerParams.push(scope.rw);
    }
    if (scope.rt) {
      nakerQuery += ` AND rt = ?`;
      nakerParams.push(scope.rt);
    }
    const [nakerStats] = await pool.query(nakerQuery, nakerParams);

    // 3. Jumlah keluarga Desil 1 & 2 per RW (Kebutuhan Akses Pangan Terjangkau & Graduasi Mandiri)
    let desilRentan = [];
    try {
      const [dr] = await pool.query(`
        SELECT 
          kk.rw,
          COUNT(*) as total_keluarga_rentan
        FROM desil_keluarga dk
        JOIN kartu_keluarga kk ON dk.no_kk = kk.no_kk
        WHERE COALESCE(dk.desil_saat_ini, dk.desil_usulan) IN (1, 2)
        GROUP BY kk.rw
      `);
      desilRentan = dr;
    } catch (e) {}

    // 4. Toko sembako murah per RW
    let tokoPanganPerRW = [];
    try {
      const [tp] = await pool.query(`
        SELECT 
          rw,
          COUNT(*) as jumlah_toko_pangan
        FROM entitas_usaha
        WHERE apakah_toko_pangan_murah = 1
        GROUP BY rw
      `);
      tokoPanganPerRW = tp;
    } catch (e) {}

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

  // =========================================================================
  // 5. SEKTOR KEAGAMAAN / TEMPAT IBADAH (TERMASUK FASILITAS BERIRISAN)
  // =========================================================================
  async getKeagamaanInventory(scope = {}) {
    let query = `
      SELECT id, nama_tempat_ibadah, jenis_agama, jenis_tempat_ibadah, alamat,
             rt, rw, kelurahan, daya_tampung_jamaah, status_tanah, apakah_beririsan,
             rt_rw_beririsan, nama_pengurus_dkm, no_kontak_pengurus, titik_evakuasi_bencana,
             status_verifikasi, catatan_verifikasi, created_at, updated_at
      FROM fasilitas_keagamaan
      WHERE 1=1
    `;
    const params = [];

    if (scope.rw) {
      if (scope.rt) {
        query += ` AND ( (rw = ? AND rt = ?) OR (apakah_beririsan = 1 AND JSON_SEARCH(rt_rw_beririsan, 'one', ?) IS NOT NULL) )`;
        params.push(scope.rw, scope.rt, `%RT ${scope.rt}%`);
      } else {
        query += ` AND rw = ?`;
        params.push(scope.rw);
      }
    }

    query += ` ORDER BY nama_tempat_ibadah ASC`;
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async createKeagamaan(data, currentUser = null) {
    const isKelurahan = currentUser && ['admin_kelurahan', 'superadmin', 'admin', 'lurah'].includes(currentUser.role);
    const status_verifikasi = isKelurahan ? 'TERVERIFIKASI' : 'MENUNGGU_VERIFIKASI_KELURAHAN';

    const {
      nama_tempat_ibadah, jenis_agama = 'Islam', jenis_tempat_ibadah = 'Masjid',
      alamat, rt = '001', rw = '001', daya_tampung_jamaah = 100, status_tanah = 'Wakaf',
      apakah_beririsan = 0, rt_rw_beririsan = null, nama_pengurus_dkm = null,
      no_kontak_pengurus = null, titik_evakuasi_bencana = 0
    } = data;

    const beririsanJson = Array.isArray(rt_rw_beririsan) ? JSON.stringify(rt_rw_beririsan) : (rt_rw_beririsan || null);

    const [result] = await pool.execute(`
      INSERT INTO fasilitas_keagamaan (
        nama_tempat_ibadah, jenis_agama, jenis_tempat_ibadah, alamat, rt, rw,
        daya_tampung_jamaah, status_tanah, apakah_beririsan, rt_rw_beririsan,
        nama_pengurus_dkm, no_kontak_pengurus, titik_evakuasi_bencana, status_verifikasi,
        created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nama_tempat_ibadah, jenis_agama, jenis_tempat_ibadah, alamat, rt, rw,
      Number(daya_tampung_jamaah) || 100, status_tanah, apakah_beririsan ? 1 : 0, beririsanJson,
      nama_pengurus_dkm, no_kontak_pengurus, titik_evakuasi_bencana ? 1 : 0, status_verifikasi,
      currentUser?.id || null
    ]);

    return { id: result.insertId, ...data, status_verifikasi };
  }

  // =========================================================================
  // 6. SEKTOR HUNIAN SEWA (RUMAH KONTRAKAN & KOS-KOSAN)
  // =========================================================================
  async getHunianSewaInventory(scope = {}) {
    let query = `
      SELECT id, nama_hunian, jenis_hunian, alamat, rt, rw, kelurahan,
             jumlah_kamar_pintu, jumlah_penghuni_aktif, jumlah_penghuni_pelajar,
             jumlah_penghuni_pekerja, nama_pemilik, no_kontak_pemilik,
             apakah_pemilik_tinggal_di_rt, alamat_pemilik, kepatuhan_wajib_lapor_24jam,
             status_verifikasi, catatan_verifikasi, created_at, updated_at
      FROM hunian_sewa
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

    query += ` ORDER BY nama_hunian ASC`;
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async createHunianSewa(data, currentUser = null) {
    const isKelurahan = currentUser && ['admin_kelurahan', 'superadmin', 'admin', 'lurah'].includes(currentUser.role);
    const status_verifikasi = isKelurahan ? 'TERVERIFIKASI' : 'MENUNGGU_VERIFIKASI_KELURAHAN';

    const {
      nama_hunian, jenis_hunian = 'Kos-Kosan', alamat, rt = '001', rw = '001',
      jumlah_kamar_pintu = 1, jumlah_penghuni_aktif = 0, jumlah_penghuni_pelajar = 0,
      jumlah_penghuni_pekerja = 0, nama_pemilik, no_kontak_pemilik,
      apakah_pemilik_tinggal_di_rt = 0, alamat_pemilik = null,
      kepatuhan_wajib_lapor_24jam = 1
    } = data;

    const [result] = await pool.execute(`
      INSERT INTO hunian_sewa (
        nama_hunian, jenis_hunian, alamat, rt, rw,
        jumlah_kamar_pintu, jumlah_penghuni_aktif, jumlah_penghuni_pelajar,
        jumlah_penghuni_pekerja, nama_pemilik, no_kontak_pemilik,
        apakah_pemilik_tinggal_di_rt, alamat_pemilik, kepatuhan_wajib_lapor_24jam,
        status_verifikasi, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nama_hunian, jenis_hunian, alamat, rt, rw,
      Number(jumlah_kamar_pintu) || 1, Number(jumlah_penghuni_aktif) || 0,
      Number(jumlah_penghuni_pelajar) || 0, Number(jumlah_penghuni_pekerja) || 0,
      nama_pemilik, no_kontak_pemilik, apakah_pemilik_tinggal_di_rt ? 1 : 0,
      alamat_pemilik, kepatuhan_wajib_lapor_24jam ? 1 : 0,
      status_verifikasi, currentUser?.id || null
    ]);

    return { id: result.insertId, ...data, status_verifikasi };
  }

  // =========================================================================
  // 7. KELOMPOK RENTAN LINGKUNGAN RT (ANAK YATIM PIATU & LANSIA SEBATANG KARA)
  // =========================================================================
  async getKelompokRentanList(scope = {}, filter = {}) {
    let query = `
      SELECT id, kategori, nik, nama, no_kk, tanggal_lahir, usia, jenis_kelamin,
             alamat, rt, rw, kelurahan, status_tempat_tinggal, nama_wali_pengasuh,
             no_kontak_wali, status_sekolah, nama_sekolah, tingkat_kemandirian_adl,
             riwayat_penyakit_kronis, bansos_diterima, kebutuhan_mendesak,
             sumber_pendataan, status_verifikasi, catatan_verifikasi, created_at, updated_at
      FROM kelompok_rentan_rt
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
    if (filter.kategori) {
      query += ` AND kategori = ?`;
      params.push(filter.kategori);
    }

    query += ` ORDER BY FIELD(kategori, 'ANAK_YATIM_PIATU', 'ANAK_YATIM', 'ANAK_PIATU', 'LANSIA_SEBATANG_KARA', 'LANSIA_PASANGAN_RENTAN'), nama ASC`;
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async createKelompokRentan(data, currentUser = null) {
    const isKelurahan = currentUser && ['admin_kelurahan', 'superadmin', 'admin', 'lurah'].includes(currentUser.role);
    const status_verifikasi = isKelurahan ? 'TERVERIFIKASI' : 'MENUNGGU_VERIFIKASI_KELURAHAN';

    const {
      kategori, nik, nama, no_kk = null, tanggal_lahir = null, usia = null,
      jenis_kelamin = 'L', alamat, rt = '001', rw = '001',
      status_tempat_tinggal = 'Tinggal Sendiri', nama_wali_pengasuh = null,
      no_kontak_wali = null, status_sekolah = 'Tidak Berlaku', nama_sekolah = null,
      tingkat_kemandirian_adl = 'Tidak Berlaku', riwayat_penyakit_kronis = null,
      bansos_diterima = 'Belum Pernah Menerima', kebutuhan_mendesak = null,
      sumber_pendataan = 'INPUT_RT'
    } = data;

    const [result] = await pool.execute(`
      INSERT INTO kelompok_rentan_rt (
        kategori, nik, nama, no_kk, tanggal_lahir, usia, jenis_kelamin,
        alamat, rt, rw, status_tempat_tinggal, nama_wali_pengasuh, no_kontak_wali,
        status_sekolah, nama_sekolah, tingkat_kemandirian_adl, riwayat_penyakit_kronis,
        bansos_diterima, kebutuhan_mendesak, sumber_pendataan, status_verifikasi,
        created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        kategori = VALUES(kategori),
        status_tempat_tinggal = VALUES(status_tempat_tinggal),
        nama_wali_pengasuh = VALUES(nama_wali_pengasuh),
        status_sekolah = VALUES(status_sekolah),
        tingkat_kemandirian_adl = VALUES(tingkat_kemandirian_adl),
        bansos_diterima = VALUES(bansos_diterima),
        kebutuhan_mendesak = VALUES(kebutuhan_mendesak),
        status_verifikasi = VALUES(status_verifikasi)
    `, [
      kategori, nik, nama, no_kk, tanggal_lahir, usia ? Number(usia) : null, jenis_kelamin,
      alamat, rt, rw, status_tempat_tinggal, nama_wali_pengasuh, no_kontak_wali,
      status_sekolah, nama_sekolah, tingkat_kemandirian_adl, riwayat_penyakit_kronis,
      bansos_diterima, kebutuhan_mendesak, sumber_pendataan, status_verifikasi,
      currentUser?.id || null
    ]);

    return { id: result.insertId, ...data, status_verifikasi };
  }

  /**
   * Algoritma Auto-Detect: Deteksi potensi anak yatim piatu dan lansia rentan dari tabel warga & KK
   */
  async autoDetectKelompokRentan(scope = {}) {
    let rtClause = '';
    const params = [];
    if (scope.rt && scope.rw) {
      rtClause = ' AND w.rt = ? AND w.rw = ?';
      params.push(scope.rt, scope.rw);
    } else if (scope.rw) {
      rtClause = ' AND w.rw = ?';
      params.push(scope.rw);
    }

    // 1. Deteksi anak < 18 thn dengan indikasi yatim / piatu
    const [yatimCandidates] = await pool.query(`
      SELECT 
        w.nik, w.nama, w.no_kk, w.tanggal_lahir, w.jenis_kelamin, w.alamat, w.rt, w.rw,
        TIMESTAMPDIFF(YEAR, w.tanggal_lahir, CURDATE()) as usia,
        w.status_hubungan_keluarga,
        kk.kepala_keluarga,
        kk.nik_kepala_keluarga
      FROM warga w
      LEFT JOIN kartu_keluarga kk ON w.no_kk = kk.no_kk
      WHERE TIMESTAMPDIFF(YEAR, w.tanggal_lahir, CURDATE()) < 18
        AND (
          w.status_hubungan_keluarga IN ('Famili Lain', 'Cucu', 'Lainnya')
          OR w.nik = kk.nik_kepala_keluarga
        )
        ${rtClause}
      LIMIT 50
    `, params);

    // 2. Deteksi lansia >= 60 thn yang tinggal sendiri atau pasangan lansia
    const [lansiaCandidates] = await pool.query(`
      SELECT 
        w.nik, w.nama, w.no_kk, w.tanggal_lahir, w.jenis_kelamin, w.alamat, w.rt, w.rw,
        TIMESTAMPDIFF(YEAR, w.tanggal_lahir, CURDATE()) as usia,
        member_counts.total_anggota_kk
      FROM warga w
      JOIN (
        SELECT no_kk, COUNT(*) as total_anggota_kk
        FROM warga
        GROUP BY no_kk
        HAVING total_anggota_kk <= 2
      ) member_counts ON w.no_kk = member_counts.no_kk
      WHERE TIMESTAMPDIFF(YEAR, w.tanggal_lahir, CURDATE()) >= 60
        ${rtClause}
      LIMIT 50
    `, params);

    return {
      potensi_yatim_piatu: yatimCandidates,
      potensi_lansia_rentan: lansiaCandidates
    };
  }

  /**
   * Verifikasi oleh Kelurahan
   */
  async verifyFasilitas(kategori, id, verifiedByUserId, status = 'TERVERIFIKASI', catatan = null) {
    const tableMap = {
      keagamaan: 'fasilitas_keagamaan',
      hunian: 'hunian_sewa',
      rentan: 'kelompok_rentan_rt',
      kesehatan: 'fasilitas_kesehatan',
      pendidikan: 'fasilitas_pendidikan',
      usaha: 'entitas_usaha'
    };

    const targetTable = tableMap[kategori];
    if (!targetTable) {
      throw new Error(`Kategori fasilitas '${kategori}' tidak valid`);
    }

    const [result] = await pool.execute(`
      UPDATE \`${targetTable}\`
      SET status_verifikasi = ?, catatan_verifikasi = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, catatan, id]);

    return { success: true, table: targetTable, id, status, catatan };
  }
}

module.exports = new FasilitasRepository();

