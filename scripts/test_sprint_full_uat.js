/**
 * scripts/test_sprint_full_uat.js
 * End-to-End Automated Verification & UAT Multi-Scenario Test Suite
 * Bumi Warga Smart Governance & Kanaya AI Reasoning (Sprint 1 - 5)
 * Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi, Jawa Barat
 */

process.env.NODE_ENV = 'test';
const PORT = 5057;
process.env.PORT = PORT;

const http = require('http');
const bcrypt = require('bcryptjs');

// 1. In-Memory Mock Database Store
const PASSWORD_HASH = bcrypt.hashSync('BumiWarga@2026', 10);

const mockAparatur = [
  {
    id: 1, kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
    kategori: 'KELURAHAN', jabatan: 'Lurah Kebonjati', wilayah_rw: null, wilayah_rt: null,
    nama_pejabat: 'Drs. H. Maman Suryaman, M.Si', nip_nrp: '197405121999031004', pangkat_golongan: 'Pembina / IV-a',
    no_telp: '0266-221155', no_wa: '081122334466', email: 'kelurahan.kebonjati@sukabumikota.go.id',
    alamat_kantor: 'Jl. Surya Kencana No. 42, Kebonjati, Cikole, Kota Sukabumi 43111', jam_layanan: 'Senin - Jumat, 08.00 - 15.30 WIB',
    is_active: 1
  },
  {
    id: 2, kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
    kategori: 'KEAMANAN', jabatan: 'Babinsa TNI AD', wilayah_rw: null, wilayah_rt: null,
    nama_pejabat: 'Serma Dedi Supriadi', nip_nrp: '21950341250775', pangkat_golongan: 'Sersan Mayor (Koramil 0701/Cikole)',
    no_telp: '0266-221100', no_wa: '081322110099', email: 'babinsa.kebonjati@tniad.mil.id',
    alamat_kantor: 'Pos Koramil 0701 Cikole / Kelurahan Kebonjati', jam_layanan: 'Siaga 24 Jam',
    is_active: 1
  },
  {
    id: 3, kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
    kategori: 'KEAMANAN', jabatan: 'Bhabinkamtibmas Polri', wilayah_rw: null, wilayah_rt: null,
    nama_pejabat: 'Aipda Agus Maulana', nip_nrp: '82040987', pangkat_golongan: 'Ajun Inspektur Polisi Dua (Polsek Cikole)',
    no_telp: '0266-221110', no_wa: '081299001122', email: 'bhabin.kebonjati@polri.go.id',
    alamat_kantor: 'Pos Bhabinkamtibmas Kelurahan Kebonjati / Polsek Cikole', jam_layanan: 'Siaga 24 Jam',
    is_active: 1
  },
  {
    id: 4, kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
    kategori: 'RW', jabatan: 'Ketua RW 001', wilayah_rw: '001', wilayah_rt: null,
    nama_pejabat: 'H. Ahmad Sanusi', nik_pejabat: '3272030101700001', nip_nrp: null, pangkat_golongan: null,
    no_telp: '081233445566', no_wa: '081233445566', email: null,
    alamat_kantor: 'Balai Pertemuan RW 001 Kebonjati', jam_layanan: 'Senin - Sabtu, 08.00 - 20.00 WIB',
    is_active: 1
  },
  {
    id: 5, kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
    kategori: 'RT', jabatan: 'Ketua RT 001', wilayah_rw: '001', wilayah_rt: '001',
    nama_pejabat: 'Dadang Ruhiyat', nik_pejabat: '3272030101750002', nip_nrp: null, pangkat_golongan: null,
    no_telp: '081344556677', no_wa: '081344556677', email: null,
    alamat_kantor: 'Sekretariat RT 001/RW 001 Kebonjati', jam_layanan: 'Senin - Minggu, 08.00 - 21.00 WIB',
    is_active: 1
  },
  {
    id: 6, kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi',
    kategori: 'POSYANDU', jabatan: 'Koordinator Kader Posyandu', wilayah_rw: '001', wilayah_rt: '001',
    nama_posyandu: 'Posyandu Melati RW 001', nama_pejabat: 'Ny. Hj. Yayah Rokayah', nik_pejabat: '3272030101800003', nip_nrp: null, pangkat_golongan: null,
    no_telp: '081234567890', no_wa: '081234567890', email: null,
    alamat_kantor: 'Pos RW 001 Kebonjati', jam_layanan: 'Jadwal Posyandu & Layanan Warga',
    is_active: 1
  }
];

const mockUsers = [
  { id: 1, username: 'admin.kebonjati', nama: 'Admin Kelurahan Kebonjati', email: 'admin.kebonjati@sukabumi.go.id', role: 'admin_kelurahan', rt: null, rw: null, password_hash: PASSWORD_HASH, status: 'active' },
  { id: 2, username: 'lurah.kebonjati', nama: 'Drs. H. Maman Suryaman, M.Si', email: 'lurah.kebonjati@sukabumi.go.id', role: 'lurah', rt: null, rw: null, password_hash: PASSWORD_HASH, status: 'active' },
  { id: 3, username: '3272030101700001', nama: 'H. Ahmad Sanusi', email: 'rw01@kebonjati.go.id', role: 'ketua_rw', rt: null, rw: '001', password_hash: PASSWORD_HASH, status: 'active' },
  { id: 4, username: '3272030101750002', nama: 'Dadang Ruhiyat', email: 'rt01@kebonjati.go.id', role: 'ketua_rt', rt: '001', rw: '001', password_hash: PASSWORD_HASH, status: 'active' },
  { id: 5, username: '3272030103810001', nama: 'Budi Santoso', email: 'budi.santoso@warga.id', role: 'warga', rt: '001', rw: '001', password_hash: PASSWORD_HASH, status: 'active' }
];

const mockWarga = [
  {
    id: 101, nik: '3272030103810001', no_kk: '3272030101900101', nama: 'Budi Santoso', user_id: 5,
    rt: '001', rw: '001', tempat_lahir: 'Sukabumi', tanggal_lahir: '1981-03-01', jenis_kelamin: 'L',
    agama: 'Islam', status_perkawinan: 'Kawin', status_hubungan_keluarga: 'Kepala Keluarga', hubungan_keluarga: 'Kepala Keluarga',
    pekerjaan: 'Wiraswasta', pendidikan_terakhir: 'S1', golongan_darah: 'O',
    alamat: 'Jl. Surya Kencana No. 12', no_telepon: '081234567891', email: 'budi.santoso@warga.id',
    kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi', status_kependudukan: 'Tetap',
    bpjs_kesehatan: '0001234567890', bpjs_kesehatan_status: 'AKTIF'
  },
  {
    id: 102, nik: '3272030103850002', no_kk: '3272030101900101', nama: 'Siti Aminah', user_id: null,
    rt: '001', rw: '001', tempat_lahir: 'Sukabumi', tanggal_lahir: '1985-03-15', jenis_kelamin: 'P',
    agama: 'Islam', status_perkawinan: 'Kawin', status_hubungan_keluarga: 'Istri', hubungan_keluarga: 'Istri',
    pekerjaan: 'Mengurus Rumah Tangga', pendidikan_terakhir: 'SMA', golongan_darah: 'A',
    alamat: 'Jl. Surya Kencana No. 12', no_telepon: '081234567892', email: 'siti.aminah@warga.id',
    kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi', status_kependudukan: 'Tetap',
    bpjs_kesehatan: '0001234567891', bpjs_kesehatan_status: 'AKTIF'
  },
  {
    id: 103, nik: '3272030103050003', no_kk: '3272030101900101', nama: 'Rizki Pratama', user_id: null,
    rt: '001', rw: '001', tempat_lahir: 'Sukabumi', tanggal_lahir: '2005-07-20', jenis_kelamin: 'L',
    agama: 'Islam', status_perkawinan: 'Belum Kawin', status_hubungan_keluarga: 'Anak', hubungan_keluarga: 'Anak',
    pekerjaan: 'Pelajar/Mahasiswa', pendidikan_terakhir: 'SMA', golongan_darah: 'B',
    alamat: 'Jl. Surya Kencana No. 12', no_telepon: '081234567893', email: 'rizki.pratama@warga.id',
    kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi', status_kependudukan: 'Tetap',
    bpjs_kesehatan: '0001234567892', bpjs_kesehatan_status: 'AKTIF'
  },
  {
    id: 104, nik: '3272030101700001', no_kk: '3272030101700000', nama: 'H. Ahmad Sanusi', user_id: 3,
    rt: '001', rw: '001', tempat_lahir: 'Sukabumi', tanggal_lahir: '1970-01-01', jenis_kelamin: 'L',
    agama: 'Islam', status_perkawinan: 'Kawin', status_hubungan_keluarga: 'Kepala Keluarga', hubungan_keluarga: 'Kepala Keluarga',
    pekerjaan: 'Pensiunan', pendidikan_terakhir: 'S1', golongan_darah: 'B',
    alamat: 'Jl. Surya Kencana RW 01', no_telepon: '081233445566', email: 'rw01@kebonjati.go.id',
    kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi', status_kependudukan: 'Tetap'
  },
  {
    id: 105, nik: '3272030101750002', no_kk: '3272030101750000', nama: 'Dadang Ruhiyat', user_id: 4,
    rt: '001', rw: '001', tempat_lahir: 'Sukabumi', tanggal_lahir: '1975-01-01', jenis_kelamin: 'L',
    agama: 'Islam', status_perkawinan: 'Kawin', status_hubungan_keluarga: 'Kepala Keluarga', hubungan_keluarga: 'Kepala Keluarga',
    pekerjaan: 'Pedagang', pendidikan_terakhir: 'SMA', golongan_darah: 'A',
    alamat: 'Jl. Surya Kencana RT 01', no_telepon: '081344556677', email: 'rt01@kebonjati.go.id',
    kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi', status_kependudukan: 'Tetap'
  }
];

const mockKK = [
  {
    no_kk: '3272030101900101', kepala_keluarga: 'Budi Santoso', alamat: 'Jl. Surya Kencana No. 12',
    rt: '001', rw: '001', kelurahan: 'Kebonjati', kecamatan: 'Cikole', kota: 'Kota Sukabumi', kode_pos: '43111'
  }
];

const mockDokumenRequest = [];
let nextDocId = 1;
const mockWorkflowHistory = [];

// In-Memory Query Engine Mock for pool
const mockPool = {
  async execute(sql, params = []) {
    return this.query(sql, params);
  },
  async query(sql, params = []) {
    const s = String(sql).trim();

    // 1. aparatur_kelurahan
    if (s.includes('aparatur_kelurahan')) {
      if (s.includes('nik_pejabat = ?')) {
        const nik = params[0];
        const row = mockAparatur.find(a => a.nik_pejabat === nik && a.is_active === 1);
        return [row ? [row] : []];
      }
      if (s.includes('id = ?')) {
        const id = params[0];
        const row = mockAparatur.find(a => a.id === Number(id));
        return [row ? [row] : []];
      }
      let filtered = [...mockAparatur];
      return [filtered];
    }

    // 2. users
    if (s.includes('FROM users')) {
      if (s.includes('username = ?') || s.includes('email = ?')) {
        const u = params[0];
        const row = mockUsers.find(usr => usr.username === u || usr.email === u);
        return [row ? [row] : []];
      }
      if (s.includes('id = ?')) {
        const id = params[0];
        const row = mockUsers.find(usr => usr.id === Number(id));
        return [row ? [row] : []];
      }
    }
    if (s.includes('UPDATE users')) {
      return [{ affectedRows: 1 }];
    }

    // 3. warga
    if (s.includes('FROM warga') || s.includes('from warga')) {
      if (s.includes('nik = ?')) {
        const nik = params[0];
        const row = mockWarga.find(w => w.nik === nik);
        return [row ? [row] : []];
      }
      if (s.includes('no_kk = ?')) {
        const no_kk = params[0];
        const rows = mockWarga.filter(w => w.no_kk === no_kk);
        return [rows];
      }
      if (s.includes('no_telepon = ?') || s.includes('email = ?')) {
        const val = params[0];
        const row = mockWarga.find(w => w.no_telepon === val || w.email === val);
        return [row ? [row] : []];
      }
      if (s.includes('LIMIT 1') || s.includes('limit 1')) {
        return [[]];
      }
      return [mockWarga];
    }
    if (s.includes('UPDATE warga')) {
      return [{ affectedRows: 1 }];
    }

    // 4. kartu_keluarga
    if (s.includes('kartu_keluarga')) {
      if (s.includes('no_kk = ?')) {
        const no_kk = params[0];
        const row = mockKK.find(k => k.no_kk === no_kk);
        return [row ? [row] : []];
      }
    }

    // 5. dokumen_request
    if (s.includes('INSERT INTO dokumen_request')) {
      const doc = {
        id: nextDocId++,
        nomor_registrasi: params[0] || ('REG-' + Date.now()),
        nomor_surat: null,
        jenis_surat: params[7] || params[8] || 'Surat Keterangan Usaha (SKU)',
        jenis_dokumen: params[7] || params[8] || 'Surat Keterangan Usaha (SKU)',
        keperluan: params[9] || '',
        nik_pemohon: params[1] || '3272030103810001',
        nama_pemohon: 'Budi Santoso',
        diajukan_oleh_nik: params[2] || null,
        rt: params[10] || '001',
        rw: params[11] || '001',
        kelurahan: 'Kebonjati',
        kecamatan: 'Cikole',
        kota: 'Kota Sukabumi',
        status: 'SUBMITTED',
        approval_step: 'RT',
        data_tambahan: typeof params[5] === 'string' ? JSON.parse(params[5] || '{}') : (params[5] || {}),
        syarat_berkas: typeof params[6] === 'string' ? JSON.parse(params[6] || '[]') : (params[6] || []),
        qr_code_hash: null,
        created_at: new Date()
      };
      mockDokumenRequest.push(doc);
      return [{ insertId: doc.id, affectedRows: 1 }];
    }

    if (s.includes('FROM dokumen_request')) {
      if (s.includes('WHERE d.id = ?') || s.includes('WHERE id = ?')) {
        const id = Number(params[0]);
        const doc = mockDokumenRequest.find(d => d.id === id);
        return [doc ? [doc] : []];
      }
      if (s.includes('d.qr_code_hash = ?') || s.includes('qr_code_hash = ?')) {
        const hash = params[0];
        const doc = mockDokumenRequest.find(d => d.qr_code_hash === hash || d.nomor_registrasi === hash || d.nomor_surat === hash);
        return [doc ? [doc] : []];
      }
      if (s.includes('nik_pemohon = ?')) {
        const nik = params[0];
        return [mockDokumenRequest.filter(d => d.nik_pemohon === nik)];
      }
      return [mockDokumenRequest];
    }

    if (s.includes('UPDATE dokumen_request')) {
      const id = Number(params[params.length - 1]);
      const doc = mockDokumenRequest.find(d => d.id === id);
      if (doc) {
        if (s.includes("approval_step = 'RW'") || params.includes('RW')) {
          doc.approval_step = 'RW';
          doc.status = 'VERIFYING';
          doc.catatan_rt = params.find(p => typeof p === 'string' && p.length > 5) || 'Disetujui RT';
        } 
        if (s.includes("approval_step = 'KELURAHAN'") || params.includes('KELURAHAN')) {
          doc.approval_step = 'KELURAHAN';
          doc.status = 'VERIFYING';
          doc.catatan_rw = params.find(p => typeof p === 'string' && p.length > 5) || 'Disetujui RW';
        }
        if (params.includes('APPROVED')) {
          doc.status = 'APPROVED';
          doc.approval_step = 'COMPLETED';
          const noSurat = params.find(p => typeof p === 'string' && p.includes('470/'));
          const hash = params.find(p => typeof p === 'string' && p.length === 64);
          if (noSurat) doc.nomor_surat = noSurat;
          if (hash) doc.qr_code_hash = hash;
          doc.catatan_kelurahan = 'Dokumen resmi disahkan oleh Kelurahan Kebonjati';
        }
      }
      return [{ affectedRows: 1 }];
    }

    if (s.includes('dokumen_workflow_history')) {
      if (s.includes('INSERT')) {
        mockWorkflowHistory.push({ params, created_at: new Date() });
        return [{ insertId: mockWorkflowHistory.length, affectedRows: 1 }];
      }
      return [mockWorkflowHistory];
    }

    if (s.includes('bansos') || s.includes('posyandu') || s.includes('notifikasi')) {
      return [[]];
    }

    // Default fallback
    return [[]];
  },
  async getConnection() {
    return {
      query: this.query.bind(this),
      execute: this.execute.bind(this),
      release: () => {}
    };
  },
  end() {
    return Promise.resolve();
  }
};

// 2. Intercept require cache for pool before loading application
const poolPath = require.resolve('../src/db/pool');
require.cache[poolPath] = {
  id: poolPath,
  filename: poolPath,
  loaded: true,
  exports: mockPool
};

// 3. Helper makeRequest
function makeRequest({ method = 'GET', path, headers = {}, body = null, cookie = '' }) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { ...headers };
    if (cookie) reqHeaders['Cookie'] = cookie;
    let payload = null;
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch (e) {
            json = raw;
          }
          const setCookie = res.headers['set-cookie'];
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            cookie: setCookie ? setCookie[0].split(';')[0] : '',
            data: json
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// 4. Main UAT Execution
async function runUATSuite() {
  console.log('================================================================');
  console.log('🚀 MEMULAI PENGUJIAN MENYELURUH UAT SPRINT 1 - 5 BUMI WARGA');
  console.log('Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi, Jawa Barat');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;
  let server = null;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // Start Express Monolith Server
    const app = require('../server');
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`[Test Server] Aktif di http://127.0.0.1:${PORT}\n`);
        resolve();
      });
    });

    // =========================================================================
    // SKENARIO 1: DIREKTORI APARATUR KELURAHAN & MITRA KEAMANAN (SPRINT 1)
    // =========================================================================
    console.log('📋 SKENARIO 1: Direktori Aparatur Kelurahan & Mitra Keamanan');
    const aparaturRes = await makeRequest({ path: '/api/aparatur?kelurahan=Kebonjati' });
    assert(aparaturRes.statusCode === 200, 'Endpoint GET /api/aparatur merespons 200 OK');
    assert(Array.isArray(aparaturRes.data.data), 'Data aparatur berbentuk Array');
    
    const lurah = aparaturRes.data.data.find(a => a.jabatan && a.jabatan.includes('Lurah'));
    assert(lurah && lurah.nama_pejabat.includes('Maman Suryaman'), 'Lurah Kebonjati: Drs. H. Maman Suryaman, M.Si');
    
    const babinsa = aparaturRes.data.data.find(a => a.jabatan && a.jabatan.includes('Babinsa'));
    assert(babinsa && babinsa.nama_pejabat.includes('Dedi Supriadi'), 'Babinsa TNI AD: Serma Dedi Supriadi terdaftar');

    const bhabin = aparaturRes.data.data.find(a => a.jabatan && a.jabatan.includes('Bhabinkamtibmas'));
    assert(bhabin && bhabin.nama_pejabat.includes('Agus Maulana'), 'Bhabinkamtibmas Polri: Aipda Agus Maulana terdaftar');

    const rw = aparaturRes.data.data.find(a => a.jabatan && a.jabatan.includes('RW 001'));
    assert(rw && rw.nama_pejabat.includes('Sanusi'), 'Ketua RW 001: H. Ahmad Sanusi terdaftar');
    console.log('');

    // =========================================================================
    // SKENARIO 2: UNIFIED NIK LOGIN & PERSONA SWITCHER (SPRINT 2)
    // =========================================================================
    console.log('📋 SKENARIO 2: Unified NIK Login & Persona Switcher');
    // Login Ketua RW H. Ahmad Sanusi via NIK
    const loginRwRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        username: '3272030101700001',
        password: 'BumiWarga@2026'
      }
    });

    assert(loginRwRes.statusCode === 200, 'Login NIK Ketua RW H. Ahmad Sanusi berhasil (200 OK)');
    assert(loginRwRes.data.user && loginRwRes.data.user.has_official_role === true, 'Akun mendeteksi jabatan resmi aparatur kelurahan');
    assert(loginRwRes.data.user.role === 'ketua_rw', 'Role awal aktif terdeteksi sebagai ketua_rw');
    const rwCookie = loginRwRes.cookie;

    // Switch persona ke Mode Warga (citizen)
    const switchCitizenRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/switch-persona',
      body: { mode: 'citizen' },
      cookie: rwCookie
    });
    assert(switchCitizenRes.statusCode === 200 && switchCitizenRes.data.user.role === 'warga', 'Beralih peran ke Mode Warga Mandiri berhasil');

    // Switch persona kembali ke Mode Pejabat (official)
    const switchOfficialRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/switch-persona',
      body: { mode: 'official' },
      cookie: rwCookie
    });
    assert(switchOfficialRes.statusCode === 200 && switchOfficialRes.data.user.role === 'ketua_rw', 'Beralih peran kembali ke Mode Pejabat (ketua_rw) berhasil');
    console.log('');

    // =========================================================================
    // SKENARIO 3: KANAYA AI CONTEXT-AWARE REASONING ENGINE (SPRINT 3)
    // =========================================================================
    console.log('📋 SKENARIO 3: Kanaya AI Context-Aware Reasoning Engine');
    const kanayaChatRes = await makeRequest({
      method: 'POST',
      path: '/api/ai/kanaya/chat',
      body: {
        message: 'Siapa nama lurah, Babinsa, dan Bhabinkamtibmas di Kelurahan Kebonjati?'
      },
      cookie: rwCookie
    });

    assert(kanayaChatRes.statusCode === 200, 'Endpoint Kanaya AI merespons 200 OK');
    assert(kanayaChatRes.data.reply && kanayaChatRes.data.reply.length > 50, 'Kanaya memberikan jawaban penjelasan komprehensif');
    assert(kanayaChatRes.data.reply.toLowerCase().includes('maman') || kanayaChatRes.data.reply.toLowerCase().includes('kebonjati'), 'Kanaya mengidentifikasi konteks Kelurahan Kebonjati Sukabumi');
    assert(Array.isArray(kanayaChatRes.data.action_chips), 'Kanaya menghasilkan Action Chips navigasi & WhatsApp');
    console.log('');

    // =========================================================================
    // SKENARIO 4: TIERED APPROVAL WORKFLOW & TTE QR CODE KELURAHAN (SPRINT 4)
    // =========================================================================
    console.log('📋 SKENARIO 4: Alur Persetujuan Bertingkat (Warga -> RT -> RW -> Kelurahan) & TTE QR Code');
    
    // 1. Warga Budi Santoso login & mengajukan surat
    const loginWargaRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: '3272030103810001', password: 'BumiWarga@2026' }
    });
    const wargaCookie = loginWargaRes.cookie;

    const requestDocRes = await makeRequest({
      method: 'POST',
      path: '/api/dokumen',
      body: {
        jenis_dokumen: 'Surat Keterangan Usaha (SKU)',
        keperluan: 'Persyaratan Pengajuan Kredit Usaha Rakyat (KUR) BRI Kebonjati',
        nik_pemohon: '3272030103810001',
        data_tambahan: { nama_usaha: 'Warung Nasi Kebonjati Berkah' }
      },
      cookie: wargaCookie
    });
    assert(requestDocRes.statusCode === 201, 'Warga berhasil mengajukan permohonan surat (201 Created)');
    const createdDocId = requestDocRes.data.data.id;
    assert(createdDocId > 0, `ID permohonan surat terbit: #${createdDocId}`);

    // 2. Ketua RT 001 Dadang Ruhiyat menyetujui rekomendasi
    const loginRtRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: '3272030101750002', password: 'BumiWarga@2026' }
    });
    const rtCookie = loginRtRes.cookie;

    const approveRtRes = await makeRequest({
      method: 'PATCH',
      path: `/api/dokumen/${createdDocId}/approve`,
      body: { catatan: 'Berkas dan domisili usaha warga RT 001 tervalidasi benar.' },
      cookie: rtCookie
    });
    assert(approveRtRes.statusCode === 200 && approveRtRes.data.step === 'RW', 'Ketua RT berhasil menyetujui, alur berpindah ke tingkat RW');

    // 3. Ketua RW 001 H. Ahmad Sanusi memvalidasi rekomendasi
    const approveRwRes = await makeRequest({
      method: 'PATCH',
      path: `/api/dokumen/${createdDocId}/approve`,
      body: { catatan: 'Rekomendasi RT disetujui Pengurus RW 001.' },
      cookie: rwCookie
    });
    assert(approveRwRes.statusCode === 200 && approveRwRes.data.step === 'KELURAHAN', 'Ketua RW berhasil memvalidasi, alur berpindah ke tingkat Kelurahan');

    // 4. Lurah / Admin Kelurahan mengesahkan surat & menerbitkan TTE QR Code
    const loginLurahRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'admin.kebonjati', password: 'BumiWarga@2026' }
    });
    const lurahCookie = loginLurahRes.cookie;

    const approveKelRes = await makeRequest({
      method: 'PATCH',
      path: `/api/dokumen/${createdDocId}/approve`,
      body: { catatan: 'Dokumen sah disetujui dan ditandatangani elektronik.' },
      cookie: lurahCookie
    });
    assert(approveKelRes.statusCode === 200 && approveKelRes.data.status === 'APPROVED', 'Kelurahan berhasil mengesahkan surat (status APPROVED)');
    assert(approveKelRes.data.nomor_surat && approveKelRes.data.nomor_surat.includes('Ktr.Kbjt'), `Nomor Surat Resmi terbit: ${approveKelRes.data.nomor_surat}`);
    assert(approveKelRes.data.qr_code_hash, `TTE QR Code Hash terbit: ${approveKelRes.data.qr_code_hash.substring(0, 16)}...`);
    const docQrHash = approveKelRes.data.qr_code_hash;

    // 5. Verifikasi Publik TTE QR Code (Tanpa Login)
    const publicVerifyRes = await makeRequest({
      path: `/api/dokumen/verify/${docQrHash}`
    });
    assert(publicVerifyRes.statusCode === 200 && publicVerifyRes.data.valid === true, 'Verifikasi Publik TTE QR Code sah dan valid 100%');
    assert(publicVerifyRes.data.dokumen.kelurahan === 'Kebonjati', 'Verifikasi mencantumkan Kelurahan Kebonjati');
    console.log('');

    // =========================================================================
    // SKENARIO 5: UNIVERSAL QR SCANNER & CITIZEN PASS (SPRINT 5)
    // =========================================================================
    console.log('📋 SKENARIO 5: Universal QR Scanner & Smart Citizen Pass');
    const scannerLookupRes = await makeRequest({
      method: 'POST',
      path: '/api/scanner/lookup',
      body: {
        code: '3272030103810001',
        mode: 'loket'
      },
      cookie: lurahCookie
    });

    assert(scannerLookupRes.statusCode === 200, 'Universal Scanner Lookup merespons 200 OK');
    assert(scannerLookupRes.data.warga && scannerLookupRes.data.warga.nama === 'Budi Santoso', 'Scanner berhasil mendeteksi identitas 360 warga: Budi Santoso');
    assert(Array.isArray(scannerLookupRes.data.family_members), 'Scanner memuat data seluruh anggota keluarga dalam 1 KK');
    assert(Array.isArray(scannerLookupRes.data.quick_actions) && scannerLookupRes.data.quick_actions.length >= 3, 'Scanner menyediakan Quick Action Chips untuk Loket, Bansos, dan Posyandu');

    // Cek endpoint Citizen Pass
    const passRes = await makeRequest({
      path: '/api/scanner/citizen-pass/3272030103810001',
      cookie: wargaCookie
    });
    assert(passRes.statusCode === 200 && passRes.data.citizen_pass.qr_payload, 'Digital Citizen Pass QR Payload berhasil digenerate');
    console.log('');

    // =========================================================================
    // RINGKASAN HASIL PENGUJIAN
    // =========================================================================
    console.log('================================================================');
    console.log(`🏁 HASIL AKHIR UAT: ${passedTests} DARI ${totalTests} PENGUJIAN BERHASIL (${Math.round((passedTests / totalTests) * 100)}% PASS)`);
    console.log('================================================================');

  } catch (err) {
    console.error('❌ Terjadi kesalahan fatal saat eksekusi UAT:', err);
  } finally {
    if (server) server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

runUATSuite();
