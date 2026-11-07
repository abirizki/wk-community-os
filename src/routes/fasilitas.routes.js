/**
 * src/routes/fasilitas.routes.js
 * API Endpoints for Public Facilities, Regional Carrying Capacity & Local Economy Ecosystem
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const fasilitasRepository = require('../repositories/fasilitas.repository');
const dayaDukungService = require('../services/daya_dukung.service');
const { generateCsv, generateExcelXml } = require('../utils/export.util');

const router = express.Router();

/**
 * Helper untuk menentukan scope wilayah user
 */
function resolveScope(user) {
  if (!user) return {};
  if (user.role === 'ketua_rt') {
    return { rt: user.rt || '001', rw: user.rw || '001', kelurahan: user.kelurahan || 'Kebonjati' };
  }
  if (['ketua_rw', 'admin_rw'].includes(user.role)) {
    return { rw: user.rw || '001', kelurahan: user.kelurahan || 'Kebonjati' };
  }
  if (['lurah', 'admin_kelurahan', 'admin'].includes(user.role)) {
    return { kelurahan: user.kelurahan || 'Kebonjati' };
  }
  if (user.role === 'camat') {
    return { kecamatan: user.kecamatan || 'Cikole' };
  }
  return {};
}

// =========================================================================
// 1. RINGKASAN DAYA DUKUNG KOMPREHENSIF & AI STRATEGY ENGINE
// =========================================================================

// GET /api/fasilitas/ai-strategy - AI Strategy & Decision Support Engine (Insight di bawah Hero Section)
router.get('/ai-strategy', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    if (req.query.rw && ['superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin'].includes(req.session.user.role)) {
      scope.rw = req.query.rw;
    }
    if (req.query.rt && ['superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin', 'ketua_rw'].includes(req.session.user.role)) {
      scope.rt = req.query.rt;
    }
    const result = await dayaDukungService.getStrategicAiInsight(scope);
    res.json({ success: true, data: result });
  } catch (error) {
    console.warn('Fallback on AI strategy insight:', error.message);
    const fallback = dayaDukungService.getFallbackStrategicAiInsight({ rw: req.query.rw, rt: req.query.rt });
    res.json({ success: true, data: fallback, fallback: true });
  }
});

// GET /api/fasilitas/summary - 4 Pilar Daya Dukung Wilayah
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const result = await dayaDukungService.getComprehensiveCarryingCapacity(scope);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching carrying capacity summary:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat ringkasan daya dukung wilayah' });
  }
});

// =========================================================================
// 2. SEKTOR PENDIDIKAN
// =========================================================================

// GET /api/fasilitas/pendidikan - Inventaris & Analisis Zonasi PPDB
router.get('/pendidikan', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const [inventory, summary] = await Promise.all([
      fasilitasRepository.getPendidikanInventory(scope),
      fasilitasRepository.getPendidikanSummary(scope)
    ]);
    const analysis = dayaDukungService.analyzeEducation(summary);

    res.json({
      success: true,
      data: {
        inventory,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching pendidikan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data fasilitas pendidikan' });
  }
});

// POST /api/fasilitas/pendidikan - Tambah Fasilitas Sekolah (Kelurahan & RT/RW)
router.post('/pendidikan', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rt', 'ketua_rw', 'admin_rw'), async (req, res) => {
  try {
    const { nama_sekolah, jenjang, alamat } = req.body;
    if (!nama_sekolah || !jenjang || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama sekolah, jenjang, dan alamat wajib diisi' });
    }
    const payload = {
      ...req.body,
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001',
      status_verifikasi: ['superadmin', 'admin_kelurahan', 'admin', 'lurah'].includes(req.session.user.role)
        ? 'TERVERIFIKASI'
        : 'MENUNGGU_VERIFIKASI_KELURAHAN'
    };
    const created = await fasilitasRepository.createPendidikan(payload);
    res.status(201).json({ success: true, message: 'Fasilitas pendidikan berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating pendidikan:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan fasilitas pendidikan' });
  }
});

// =========================================================================
// 3. SEKTOR KESEHATAN
// =========================================================================

// GET /api/fasilitas/kesehatan - Inventaris & Rasio Daya Dukung Medis
router.get('/kesehatan', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const [inventory, summary] = await Promise.all([
      fasilitasRepository.getKesehatanInventory(scope),
      fasilitasRepository.getKesehatanSummary(scope)
    ]);
    const analysis = dayaDukungService.analyzeHealth(summary);

    res.json({
      success: true,
      data: {
        inventory,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching kesehatan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data fasilitas kesehatan' });
  }
});

// POST /api/fasilitas/kesehatan - Tambah Faskes & Nakes (Kelurahan & RT/RW)
router.post('/kesehatan', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rt', 'ketua_rw', 'admin_rw'), async (req, res) => {
  try {
    const { nama_faskes, jenis_faskes, alamat } = req.body;
    if (!nama_faskes || !jenis_faskes || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama faskes, jenis faskes, dan alamat wajib diisi' });
    }
    const payload = {
      ...req.body,
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001',
      status_verifikasi: ['superadmin', 'admin_kelurahan', 'admin', 'lurah'].includes(req.session.user.role)
        ? 'TERVERIFIKASI'
        : 'MENUNGGU_VERIFIKASI_KELURAHAN'
    };
    const created = await fasilitasRepository.createKesehatan(payload);
    res.status(201).json({ success: true, message: 'Fasilitas kesehatan berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating kesehatan:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan fasilitas kesehatan' });
  }
});

// =========================================================================
// 4. SEKTOR EKONOMI LOKAL & UMKM
// =========================================================================

// GET /api/fasilitas/usaha - Direktori UMKM & Analisis Serapan Naker
router.get('/usaha', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const { kategori, is_pangan_murah } = req.query;
    const [inventory, summary] = await Promise.all([
      fasilitasRepository.getEntitasUsahaList(scope, { kategori, is_pangan_murah }),
      fasilitasRepository.getEntitasUsahaSummary(scope)
    ]);
    const analysis = dayaDukungService.analyzeEconomy(summary);

    res.json({
      success: true,
      data: {
        inventory,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching usaha:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data direktori UMKM' });
  }
});

// POST /api/fasilitas/usaha - Pendaftaran UMKM Warga Mandiri / Petugas
router.post('/usaha', requireAuth, async (req, res) => {
  try {
    const { nama_usaha, nama_pemilik, kategori_usaha, alamat } = req.body;
    const nik = req.session.user.active_nik || req.session.user.username;
    if (!nama_usaha || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama usaha dan alamat wajib diisi' });
    }

    const payload = {
      ...req.body,
      nik_pemilik: nik,
      nama_pemilik: nama_pemilik || req.session.user.nama || 'Warga',
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001',
      status_verifikasi: ['admin_kelurahan', 'superadmin', 'admin'].includes(req.session.user.role) 
        ? 'TERVERIFIKASI' 
        : 'MENUNGGU_VERIFIKASI'
    };

    const created = await fasilitasRepository.createEntitasUsaha(payload);
    res.status(201).json({ success: true, message: 'Usaha berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating usaha:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan usaha' });
  }
});

// =========================================================================
// 5. SEKTOR SANITASI & KORELASI STUNTING
// =========================================================================

// GET /api/fasilitas/sanitasi - Profil Sanitasi Lingkungan & Matriks Risiko Stunting
router.get('/sanitasi', requireAuth, async (req, res) => {
  try {
    const rawData = await fasilitasRepository.getSanitasiSummaryByRT();
    const analysis = dayaDukungService.analyzeSanitation(rawData);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error fetching sanitasi:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat profil sanitasi lingkungan' });
  }
});

// =========================================================================
// 6. SEKTOR KEAGAMAAN / TEMPAT IBADAH (TERMASUK FASILITAS BERIRISAN)
// =========================================================================

// GET /api/fasilitas/keagamaan - Daftar Tempat Ibadah di RT/RW atau yang Beririsan
router.get('/keagamaan', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const data = await fasilitasRepository.getKeagamaanInventory(scope);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching keagamaan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data tempat ibadah' });
  }
});

// POST /api/fasilitas/keagamaan - Pendaftaran Tempat Ibadah (Kelurahan & RT/RW)
router.post('/keagamaan', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rt', 'ketua_rw', 'admin_rw'), async (req, res) => {
  try {
    const { nama_tempat_ibadah, alamat } = req.body;
    if (!nama_tempat_ibadah || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama tempat ibadah dan alamat wajib diisi' });
    }
    const payload = {
      ...req.body,
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001'
    };
    const created = await fasilitasRepository.createKeagamaan(payload, req.session.user);
    res.status(201).json({ success: true, message: 'Tempat ibadah berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating keagamaan:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan tempat ibadah' });
  }
});

// =========================================================================
// 7. SEKTOR HUNIAN SEWA (RUMAH KONTRAKAN & KOS-KOSAN)
// =========================================================================

// GET /api/fasilitas/hunian-sewa - Daftar Rumah Kos & Kontrakan Warga
router.get('/hunian-sewa', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const data = await fasilitasRepository.getHunianSewaInventory(scope);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching hunian sewa:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data hunian sewa' });
  }
});

// POST /api/fasilitas/hunian-sewa - Pendaftaran Rumah Kos / Kontrakan
router.post('/hunian-sewa', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rt', 'ketua_rw', 'admin_rw', 'warga'), async (req, res) => {
  try {
    const { nama_hunian, nama_pemilik, no_kontak_pemilik, alamat } = req.body;
    if (!nama_hunian || !nama_pemilik || !no_kontak_pemilik || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama hunian, pemilik, nomor kontak, dan alamat wajib diisi' });
    }
    const payload = {
      ...req.body,
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001'
    };
    const created = await fasilitasRepository.createHunianSewa(payload, req.session.user);
    res.status(201).json({ success: true, message: 'Data kos/kontrakan berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating hunian sewa:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan hunian sewa' });
  }
});

// =========================================================================
// 8. KELOMPOK RENTAN (ANAK YATIM PIATU & LANSIA SEBATANG KARA)
// =========================================================================

// GET /api/fasilitas/kelompok-rentan - Daftar Anak Yatim Piatu & Lansia Sebatang Kara
router.get('/kelompok-rentan', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const { kategori } = req.query;
    const data = await fasilitasRepository.getKelompokRentanList(scope, { kategori });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching kelompok rentan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data kelompok rentan' });
  }
});

// POST /api/fasilitas/kelompok-rentan - Pendaftaran Warga Rentan Lapangan
router.post('/kelompok-rentan', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rt', 'ketua_rw', 'admin_rw'), async (req, res) => {
  try {
    const { kategori, nik, nama, alamat } = req.body;
    if (!kategori || !nik || !nama || !alamat) {
      return res.status(400).json({ success: false, message: 'Kategori, NIK, nama, dan alamat wajib diisi' });
    }
    const payload = {
      ...req.body,
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001',
      sumber_pendataan: ['admin_kelurahan', 'superadmin', 'admin', 'lurah'].includes(req.session.user.role)
        ? 'INPUT_KELURAHAN'
        : 'INPUT_RT'
    };
    const created = await fasilitasRepository.createKelompokRentan(payload, req.session.user);
    res.status(201).json({ success: true, message: 'Data warga rentan berhasil dicatat', data: created });
  } catch (error) {
    console.error('Error creating kelompok rentan:', error);
    res.status(500).json({ success: false, message: 'Gagal mencatat data warga rentan' });
  }
});

// GET /api/fasilitas/kelompok-rentan/auto-detect - Deteksi Otomatis Algoritma KK
router.get('/kelompok-rentan/auto-detect', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const results = await fasilitasRepository.autoDetectKelompokRentan(scope);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error auto-detecting kelompok rentan:', error);
    res.status(500).json({ success: false, message: 'Gagal menjalankan pemindaian otomatis KK' });
  }
});

// =========================================================================
// 9. VERIFIKASI FASILITAS / POTENSI WILAYAH (OLEH KELURAHAN)
// =========================================================================

// PATCH /api/fasilitas/:kategori/:id/verify - Verifikasi & Validasi Lapangan oleh Kelurahan
router.patch('/:kategori/:id/verify', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah'), async (req, res) => {
  try {
    const { kategori, id } = req.params;
    const { status = 'TERVERIFIKASI', catatan } = req.body;
    const result = await fasilitasRepository.verifyFasilitas(kategori, Number(id), req.session.user.id, status, catatan);
    res.json({ success: true, message: `Status verifikasi fasilitas ${kategori} berhasil diperbarui`, data: result });
  } catch (error) {
    console.error('Error verifying fasilitas:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal memverifikasi fasilitas' });
  }
});

// =========================================================================
// 10. PUSAT UNDUH LAPORAN EKSEKUTIF MULTI-SEKTOR (EXCEL & CSV)
// =========================================================================

// GET /api/fasilitas/export/report - Ekspor Laporan Komprehensif Daya Dukung Wilayah
router.get('/export/report', requireAuth, async (req, res) => {
  try {
    const { sector = 'semua', format = 'xlsx' } = req.query;
    const scope = resolveScope(req.session.user);
    if (req.query.rw) scope.rw = req.query.rw;
    if (req.query.rt) scope.rt = req.query.rt;

    const data = await dayaDukungService.getComprehensiveCarryingCapacity(scope);
    const dateStr = new Date().toISOString().split('T')[0];

    // Sektor Pendidikan
    const eduRows = (data.pendidikan?.cohorts || []).map(c => [
      { value: c.jenjang_nama || c.jenjang_kode, type: 'String' },
      { value: c.jumlah_anak_saat_ini || 0, type: 'Number' },
      { value: c.proyeksi_masuk_t1 || 0, type: 'Number' },
      { value: c.kursi_baru || 0, type: 'Number' },
      { value: c.selisih_kursi || 0, type: 'Number' },
      { value: c.status_kapasitas || 'MEMADAI', type: 'String' },
      { value: c.rombel_defisit || 0, type: 'Number' }
    ]);

    // Sektor Kesehatan
    const health = data.kesehatan || {};
    const healthRows = [
      [{ value: 'Total Penduduk Terlayani', type: 'String' }, { value: health.populasi_terlayani || 0, type: 'Number' }],
      [{ value: 'Skor Kesiapan Kesehatan', type: 'String' }, { value: health.health_adequacy_score || 0, type: 'Number' }],
      [{ value: 'Total Posyandu Aktif', type: 'String' }, { value: health.dukungan_layanan?.total_posyandu || 0, type: 'Number' }],
      [{ value: 'Rasio Balita per Posyandu', type: 'String' }, { value: health.dukungan_layanan?.rasio_balita_per_posyandu || 0, type: 'Number' }],
      [{ value: 'Total Balita Terdata', type: 'String' }, { value: health.demografi_kesehatan?.total_balita || 0, type: 'Number' }],
      [{ value: 'Baduta 1000 HPK (0-23 Bulan)', type: 'String' }, { value: health.demografi_kesehatan?.baduta_1000hpk || 0, type: 'Number' }],
      [{ value: 'Ibu Hamil Risiko Tinggi / KEK', type: 'String' }, { value: health.demografi_kesehatan?.ibu_hamil_risti || 0, type: 'Number' }],
      [{ value: 'Proyeksi Kelahiran Baru (T+1)', type: 'String' }, { value: health.demografi_kesehatan?.proyeksi_kelahiran_t1 || 0, type: 'Number' }],
      [{ value: 'Rasio Dokter per 1.000 Penduduk', type: 'String' }, { value: health.dukungan_layanan?.dokter?.rasio_per_1000 || 0, type: 'Number' }]
    ];

    // Sektor Ekonomi
    const econ = data.ekonomi || {};
    const econRows = [
      [{ value: 'Skor Vitalitas Ekonomi', type: 'String' }, { value: econ.economic_vitality_score || 0, type: 'Number' }],
      [{ value: 'Total UMKM Terdata', type: 'String' }, { value: econ.total_umkm || 0, type: 'Number' }],
      [{ value: 'UMKM Ber-SKU Terverifikasi', type: 'String' }, { value: econ.total_terverifikasi_sku || 0, type: 'Number' }],
      [{ value: 'Serapan Tenaga Kerja Warga', type: 'String' }, { value: econ.total_serapan_naker || 0, type: 'Number' }],
      [{ value: 'Persentase Serapan Usia Produktif', type: 'String' }, { value: `${econ.rasio_serapan_persen || 0}%`, type: 'String' }]
    ];

    const sheets = [
      {
        name: 'Daya Tampung Pendidikan',
        headers: ['Jenjang Pendidikan', 'Siswa Aktif (T)', 'Calon Masuk (T+1)', 'Kuota Kursi PPDB', 'Selisih (Surplus/Defisit)', 'Status Kapasitas', 'Kebutuhan Rombel Baru'],
        rows: eduRows
      },
      {
        name: 'Kesehatan & 1000 HPK',
        headers: ['Indikator Layanan Kesehatan', 'Nilai Capaian'],
        rows: healthRows
      },
      {
        name: 'Ekonomi Kerakyatan & UMKM',
        headers: ['Indikator Ekosistem Usaha', 'Nilai Capaian'],
        rows: econRows
      }
    ];

    if (format === 'csv') {
      const csvData = generateCsv(
        sheets[0].headers,
        sheets[0].rows.map(r => r.map(c => c.value))
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="Laporan_Daya_Dukung_${dateStr}.csv"`);
      return res.send(csvData);
    }

    // Default: Microsoft Excel XML SpreadsheetML (.xlsx compatible)
    const xml = generateExcelXml(`Laporan Komprehensif Daya Dukung Wilayah - Kelurahan Kebonjati`, sheets);
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Laporan_Komprehensif_Daya_Dukung_${dateStr}.xls"`);
    return res.send(xml);
  } catch (error) {
    console.error('Error generating daya dukung export report:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat berkas laporan daya dukung' });
  }
});

module.exports = router;

