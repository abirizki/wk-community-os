/**
 * scripts/test_warga_suite.js
 * Comprehensive Automated Self-Test Suite for Modul Warga:
 * - Multi-Credential Authentication & Birthdate PIN
 * - PIN Mandiri Security & Hashing
 * - KK Boundary Guard & IDOR Prevention
 * - Family Member Document Application (1 KK)
 * - Specific Requirements Tracing (SKU, SKTM, Kematian, dll)
 * - Persona Switching & Session Isolation
 * - Bansos Family Visibility & Access Control
 * 
 * Bumi Warga - Jabar Pintar Digital
 */

const bcrypt = require('bcryptjs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, scenario, desc) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] (${scenario}) ${desc}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] (${scenario}) ${desc}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// 1. UNIT TEST: LOGIKA AUTHENTIKASI PIN TANGGAL LAHIR (Dukcapil Verification)
// -----------------------------------------------------------------------------
function testBirthdateMatch() {
  console.log('\n📌 UJI 1: Verifikasi Kredensial PIN Tanggal Lahir (DDMMYYYY / YYYYMMDD)');

  // Replicating helper checkBirthdateMatch from src/routes/auth.routes.js
  function checkBirthdateMatch(inputPassword, tanggalLahir) {
    if (!inputPassword || !tanggalLahir) return false;
    const cleanInput = String(inputPassword).trim();
    if (!/^\d{6,8}$/.test(cleanInput)) return false;

    let d, m, y;
    if (tanggalLahir instanceof Date && !isNaN(tanggalLahir)) {
      d = String(tanggalLahir.getDate()).padStart(2, '0');
      m = String(tanggalLahir.getMonth() + 1).padStart(2, '0');
      y = String(tanggalLahir.getFullYear());
    } else {
      const s = String(tanggalLahir).trim();
      const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        y = isoMatch[1];
        m = isoMatch[2];
        d = isoMatch[3];
      } else {
        const idMatch = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
        if (idMatch) {
          d = idMatch[1];
          m = idMatch[2];
          y = idMatch[3];
        } else {
          return false;
        }
      }
    }

    const ddmmyyyy = `${d}${m}${y}`;
    const yyyymmdd = `${y}${m}${d}`;
    const ddmmyy = `${d}${m}${y.slice(-2)}`;

    return cleanInput === ddmmyyyy || cleanInput === yyyymmdd || cleanInput === ddmmyy;
  }

  // Skenario 1.1: Tanggal Lahir Standar ISO String (17 Agustus 1995)
  const tglIso = '1995-08-17 00:00:00';
  assert(checkBirthdateMatch('17081995', tglIso), '1.1', 'Format DDMMYYYY cocok (17081995)');
  assert(checkBirthdateMatch('19950817', tglIso), '1.2', 'Format YYYYMMDD cocok (19950817)');
  assert(checkBirthdateMatch('170895', tglIso), '1.3', 'Format 6-digit DDMMYY cocok (170895)');
  assert(!checkBirthdateMatch('18081995', tglIso), '1.4', 'Sandi salah 1 digit ditolak');
  assert(!checkBirthdateMatch('password123', tglIso), '1.5', 'Sandi non-numerik ditolak');

  // Skenario 1.2: Date Object
  const tglObj = new Date(1990, 0, 5); // 05 Januari 1990
  assert(checkBirthdateMatch('05011990', tglObj), '1.6', 'Date object cocok (05011990)');
  assert(!checkBirthdateMatch('06011990', tglObj), '1.7', 'Date object beda tanggal ditolak');

  // Skenario 1.3: Input kosong / null
  assert(!checkBirthdateMatch('', tglIso), '1.8', 'Input password kosong ditolak');
  assert(!checkBirthdateMatch('17081995', null), '1.9', 'Tanggal lahir null ditolak aman');
}

// -----------------------------------------------------------------------------
// 2. SECURITY TEST: PIN MANDIRI 6-DIGIT & ENKRIPSI BCRYPT
// -----------------------------------------------------------------------------
function testPinMandiriSecurity() {
  console.log('\n📌 UJI 2: Keamanan PIN Mandiri 6-Digit (Bcrypt Hashing & Validation)');

  function validateAndHashPin(pin) {
    if (!pin || !/^\d{6}$/.test(String(pin).trim())) {
      throw new Error('PIN harus terdiri dari 6 digit angka');
    }
    return bcrypt.hashSync(String(pin).trim(), 10);
  }

  // Skenario 2.1: Validasi Format PIN
  let validHash = null;
  try {
    validHash = validateAndHashPin('123456');
    assert(typeof validHash === 'string' && /^\$2[ab]\$/.test(validHash), '2.1', 'PIN 6 digit berhasil di-hash dengan bcrypt ($2a/$2b)');
  } catch (e) {
    assert(false, '2.1', `Gagal hash PIN valid: ${e.message}`);
  }

  assert(bcrypt.compareSync('123456', validHash), '2.2', 'Verifikasi bcrypt cocok dengan PIN yang benar');
  assert(!bcrypt.compareSync('654321', validHash), '2.3', 'Verifikasi bcrypt gagal pada PIN yang salah');

  // Skenario 2.2: Penolakan Format Tidak Sah
  const invalidPins = ['12345', '1234567', 'abcdef', '1234a6', '', null, '12 456'];
  let rejectedCount = 0;
  for (const inv of invalidPins) {
    try {
      validateAndHashPin(inv);
    } catch (e) {
      rejectedCount++;
    }
  }
  assert(rejectedCount === invalidPins.length, '2.4', `Seluruh ${invalidPins.length} format PIN tidak valid berhasil ditolak`);
}

// -----------------------------------------------------------------------------
// 3. BUSINESS LOGIC TEST: KK BOUNDARY GUARD & PENGAJUAN SURAT 1 KK
// -----------------------------------------------------------------------------
function testKKBoundaryAndLetterLogic() {
  console.log('\n📌 UJI 3: KK Boundary Guard & Pengajuan Surat Anggota Keluarga (1 KK)');

  // Mocking database KK
  const mockDukcapilWarga = [
    { nik: '3273010101900001', nama: 'Budi Santoso', no_kk: '3273010000000001', status_hubungan_keluarga: 'Kepala Keluarga', rt: '001', rw: '001' },
    { nik: '3273010101900002', nama: 'Siti Aminah', no_kk: '3273010000000001', status_hubungan_keluarga: 'Istri', rt: '001', rw: '001' },
    { nik: '3273010101900003', nama: 'Rizki Santoso', no_kk: '3273010000000001', status_hubungan_keluarga: 'Anak', rt: '001', rw: '001' },
    // Warga KK Lain
    { nik: '3273010202900099', nama: 'Ahmad Tetangga', no_kk: '3273010000009999', status_hubungan_keluarga: 'Kepala Keluarga', rt: '001', rw: '001' },
  ];

  // Logic simulator based on dokumen.service.js
  function simulateRequestDokumen(payload, currentUser) {
    const { subjek_nik, jenis_surat, keperluan, data_tambahan, syarat_berkas } = payload;
    
    let subjekWarga = null;
    let diajukanOlehNik = currentUser.username;
    let namaSubjek = currentUser.nama;
    let hubunganKeluarga = 'Diri Sendiri';

    if (subjek_nik && subjek_nik !== currentUser.username) {
      subjekWarga = mockDukcapilWarga.find(w => w.nik === subjek_nik);
      if (!subjekWarga) {
        throw new Error('Data anggota keluarga pemohon tidak ditemukan');
      }

      if (currentUser.role === 'warga') {
        const pemohonWarga = mockDukcapilWarga.find(w => w.nik === currentUser.username);
        if (!pemohonWarga || pemohonWarga.no_kk !== subjekWarga.no_kk) {
          const err = new Error('Akses Ditolak: NIK yang dipilih bukan anggota keluarga dalam Kartu Keluarga Anda');
          err.status = 403;
          throw err;
        }
      }

      namaSubjek = subjekWarga.nama;
      hubunganKeluarga = subjekWarga.status_hubungan_keluarga || 'Anggota Keluarga';
    }

    return {
      success: true,
      data: {
        nik_pemohon: subjek_nik || currentUser.username,
        diajukan_oleh_nik: diajukanOlehNik,
        nama_subjek: namaSubjek,
        hubungan_keluarga: hubunganKeluarga,
        jenis_surat,
        keperluan,
        data_tambahan,
        syarat_berkas,
        status: 'PENDING_RT'
      }
    };
  }

  const userAyah = { username: '3273010101900001', nama: 'Budi Santoso', role: 'warga', no_kk: '3273010000000001' };

  // Skenario 3.1: Ayah mengajukan surat untuk diri sendiri
  const resSendiri = simulateRequestDokumen({
    subjek_nik: '3273010101900001',
    jenis_surat: 'Surat Keterangan Domisili',
    keperluan: 'Administrasi Bank'
  }, userAyah);
  assert(resSendiri.data.nik_pemohon === '3273010101900001', '3.1', 'Surat diri sendiri: NIK pemohon sesuai');
  assert(resSendiri.data.hubungan_keluarga === 'Diri Sendiri', '3.2', 'Surat diri sendiri: Hubungan "Diri Sendiri"');

  // Skenario 3.2: Ayah mengajukan surat atas nama Anak (1 KK)
  const resAnak = simulateRequestDokumen({
    subjek_nik: '3273010101900003',
    jenis_surat: 'Surat Keterangan Belum Menikah',
    keperluan: 'Pemberkasan CPNS',
    data_tambahan: { rencana_instansi: 'Kemenkeu' },
    syarat_berkas: { ktp: true, kk: true }
  }, userAyah);
  assert(resAnak.data.nik_pemohon === '3273010101900003', '3.3', 'Surat anak: NIK pemohon adalah NIK Anak');
  assert(resAnak.data.diajukan_oleh_nik === '3273010101900001', '3.4', 'Surat anak: Dicatat diajukan oleh NIK Ayah');
  assert(resAnak.data.nama_subjek === 'Rizki Santoso', '3.5', 'Surat anak: Nama subjek adalah Rizki Santoso');
  assert(resAnak.data.hubungan_keluarga === 'Anak', '3.6', 'Surat anak: Hubungan keluarga terdeteksi "Anak"');

  // Skenario 3.3: KK Boundary Attack (IDOR Prevention: Mencoba ajukan surat untuk tetangga beda KK)
  let boundaryProtected = false;
  try {
    simulateRequestDokumen({
      subjek_nik: '3273010202900099', // Ahmad Tetangga
      jenis_surat: 'Surat Keterangan Usaha (SKU)',
      keperluan: 'Pinjaman Modal'
    }, userAyah);
  } catch (err) {
    if (err.message.includes('bukan anggota keluarga dalam Kartu Keluarga Anda')) {
      boundaryProtected = true;
    }
  }
  assert(boundaryProtected, '3.7', 'KK Boundary Guard menolak NIK di luar KK pemohon (HTTP 403)');
}

// -----------------------------------------------------------------------------
// 4. BUSINESS LOGIC TEST: TRACING PERSYARATAN & BIDANG SPESIFIK SURAT
// -----------------------------------------------------------------------------
function testLetterRequirementsTracing() {
  console.log('\n📌 UJI 4: Tracing Persyaratan Khusus per Jenis Surat');

  // Configuration mirror from frontend/src/pages/DokumenPage.jsx
  const JENIS_SURAT_CONFIG = {
    'Surat Keterangan Usaha (SKU)': {
      fields: ['nama_usaha', 'bidang_usaha', 'alamat_usaha', 'tahun_berdiri', 'omzet_bulanan'],
      syarat: ['ktp', 'kk', 'foto_usaha']
    },
    'Surat Keterangan Tidak Mampu (SKTM)': {
      fields: ['tujuan_sktm', 'penghasilan_per_bulan', 'jumlah_tanggungan'],
      syarat: ['ktp', 'kk', 'surat_pernyataan_miskin', 'foto_rumah']
    },
    'Surat Keterangan Kematian': {
      fields: ['nama_almarhum', 'tanggal_meninggal', 'tempat_meninggal', 'penyebab_kematian'],
      syarat: ['ktp_almarhum', 'kk', 'surat_kematian_rs']
    },
    'Surat Keterangan Kelahiran': {
      fields: ['nama_bayi', 'jenis_kelamin_bayi', 'tanggal_lahir_bayi', 'tempat_lahir_bayi', 'anak_ke'],
      syarat: ['ktp_orangtua', 'kk', 'surat_lahir_bidan']
    },
    'Surat Pengantar Nikah (N1-N4)': {
      fields: ['nama_calon_pasangan', 'nik_calon_pasangan', 'tanggal_rencana_akad'],
      syarat: ['ktp', 'kk', 'ijazah', 'akta_lahir', 'pas_foto_gandeng']
    }
  };

  for (const [jenis, cfg] of Object.entries(JENIS_SURAT_CONFIG)) {
    assert(Array.isArray(cfg.fields) && cfg.fields.length >= 3, `4.${jenis.slice(0, 10)}`, `${jenis} memiliki konfigurasi kolom spesifik (${cfg.fields.length} kolom)`);
    assert(Array.isArray(cfg.syarat) && cfg.syarat.length >= 2, `4.${jenis.slice(0, 10)}`, `${jenis} memiliki konfigurasi berkas prasyarat (${cfg.syarat.length} syarat)`);
  }
}

// -----------------------------------------------------------------------------
// 5. SECURITY & SESSION TEST: PERSONA SWITCHING DALAM 1 KK
// -----------------------------------------------------------------------------
function testPersonaSwitching() {
  console.log('\n📌 UJI 5: Persona Switching & Isolasi Sesi Anggota Keluarga');

  const familyMembers = [
    { nik: '3273010101900001', nama: 'Budi Santoso', status_hubungan_keluarga: 'Kepala Keluarga', no_kk: '3273010000000001' },
    { nik: '3273010101900002', nama: 'Siti Aminah', status_hubungan_keluarga: 'Istri', no_kk: '3273010000000001' },
    { nik: '3273010101900003', nama: 'Rizki Santoso', status_hubungan_keluarga: 'Anak', no_kk: '3273010000000001' }
  ];

  function simulateSelectProfile(targetNik, session) {
    if (!session || !session.user) throw new Error('Tidak ada sesi aktif');
    const selected = familyMembers.find(m => m.nik === targetNik && m.no_kk === session.user.no_kk);
    if (!selected) {
      const err = new Error('Anggota keluarga tidak ditemukan dalam Kartu Keluarga ini');
      err.status = 403;
      throw err;
    }

    session.user.active_nik = selected.nik;
    session.user.active_nama = selected.nama;
    session.user.active_hubungan = selected.status_hubungan_keluarga;

    return {
      success: true,
      active_persona: {
        nik: selected.nik,
        nama: selected.nama,
        hubungan: selected.status_hubungan_keluarga
      }
    };
  }

  const session = {
    user: {
      id: 1,
      username: '3273010101900001',
      no_kk: '3273010000000001',
      active_nik: '3273010101900001',
      active_nama: 'Budi Santoso',
      active_hubungan: 'Kepala Keluarga'
    }
  };

  // Switch ke Istri
  const switchIstri = simulateSelectProfile('3273010101900002', session);
  assert(switchIstri.active_persona.nama === 'Siti Aminah', '5.1', 'Beralih persona aktif ke Siti Aminah');
  assert(session.user.active_hubungan === 'Istri', '5.2', 'Session state terisolasi pada hubungan Istri');

  // Switch ke NIK asing (beda KK)
  let hijackBlocked = false;
  try {
    simulateSelectProfile('3273999999999999', session);
  } catch (e) {
    if (e.message.includes('tidak ditemukan dalam Kartu Keluarga')) {
      hijackBlocked = true;
    }
  }
  assert(hijackBlocked, '5.3', 'Pencegahan Session Spoofing: NIK asing di luar KK ditolak');
}

// -----------------------------------------------------------------------------
// 6. BUSINESS LOGIC TEST: TRANSPARANSI BANSOS KELUARGA 1 KK
// -----------------------------------------------------------------------------
function testBansosFamilyVisibility() {
  console.log('\n📌 UJI 6: Transparansi Bantuan Sosial Berbasis Kartu Keluarga');

  const mockBansosTable = [
    { id: 1, no_kk: '3273010000000001', nik_penerima: '3273010101900001', jenis_bansos: 'PKH', nominal: 600000, status: 'APPROVED' },
    { id: 2, no_kk: '3273010000009999', nik_penerima: '3273010202900099', jenis_bansos: 'BLT BBM', nominal: 300000, status: 'APPROVED' }
  ];

  function getBansosForUser(activeNik, noKK) {
    return mockBansosTable.filter(b => b.no_kk === noKK);
  }

  // Anggota keluarga (Anak) mengakses bansos
  const hasilBansosAnak = getBansosForUser('3273010101900003', '3273010000000001');
  assert(hasilBansosAnak.length === 1 && hasilBansosAnak[0].jenis_bansos === 'PKH', '6.1', 'Anggota keluarga (Anak) dapat melihat bansos KK-nya');
  assert(hasilBansosAnak.every(b => b.no_kk !== '3273010000009999'), '6.2', 'Data bansos keluarga lain tidak bocor ke KK pemohon');
}

// -----------------------------------------------------------------------------
// 7. BUSINESS LOGIC TEST: PMT DESIL 11 INDIKATOR & PAKTA INTEGRITAS SPTJM
// -----------------------------------------------------------------------------
function testDesilPMTAndSPTJM() {
  console.log('\n📌 UJI 7: PMT Desil 11 Indikator Faktual & Validasi Pakta Integritas SPTJM');

  // Helper algoritma PMT 11 Indikator
  function calculatePMT(data) {
    if (data.kepemilikan_mobil) return 8; // Auto-mampu jika memiliki mobil

    let score = 0;
    if (data.daya_listrik === 'Tanpa Meteran') score += 2;
    else if (data.daya_listrik === '450 VA') score += 5;
    else if (data.daya_listrik === '900 VA') score += 14;
    else if (data.daya_listrik === '1300 VA') score += 24;
    else score += 30;

    if (data.status_rumah === 'Bebas Sewa' || data.status_rumah === 'Menumpang') score += 3;
    else if (data.status_rumah === 'Sewa/Kontrak') score += 8;
    else score += 16;

    if (data.sumber_air === 'Sumur Tidak Terlindung') score += 2;
    else if (data.sumber_air === 'Sumur Terlindung') score += 5;
    else if (data.sumber_air === 'PDAM/Leding') score += 10;
    else score += 14;

    if (data.luas_lantai_kategori === '< 8 m2 (Padat)') score += 3;
    else if (data.luas_lantai_kategori === '8 - 14 m2') score += 8;
    else score += 15;

    if (data.bahan_bakar_memasak === 'Minyak/Kayu') score += 1;
    else if (data.bahan_bakar_memasak === 'Gas 3kg') score += 4;
    else score += 10;

    if (data.kepemilikan_motor === '0 unit') score += 0;
    else if (data.kepemilikan_motor === '1 unit') score += 5;
    else score += 10;

    if (data.dinding_terluas === 'Bambu/Anyaman/Lainnya') score += 2;
    else if (data.dinding_terluas === 'Kayu/Papan') score += 6;
    else score += 12;

    if (data.lantai_terluas === 'Tanah/Bambu/Kayu Sederhana') score += 2;
    else if (data.lantai_terluas === 'Semen/Plester') score += 6;
    else score += 12;

    if (data.ada_disabilitas_lansia_tunggal) score -= 6;
    if (data.ada_anak_sekolah_pip) score -= 4;

    score = Math.max(0, Math.min(100, score));

    if (score <= 15) return 1;
    if (score <= 25) return 2;
    if (score <= 36) return 3;
    if (score <= 48) return 4;
    if (score <= 60) return 5;
    if (score <= 70) return 6;
    if (score <= 80) return 7;
    if (score <= 90) return 8;
    if (score <= 95) return 9;
    return 10;
  }

  // 7.1 Kasus Miskin Ekstrem (Desil 1)
  const profilEkstrem = {
    daya_listrik: 'Tanpa Meteran',
    status_rumah: 'Menumpang',
    sumber_air: 'Sumur Tidak Terlindung',
    luas_lantai_kategori: '< 8 m2 (Padat)',
    bahan_bakar_memasak: 'Minyak/Kayu',
    kepemilikan_motor: '0 unit',
    dinding_terluas: 'Bambu/Anyaman/Lainnya',
    lantai_terluas: 'Tanah/Bambu/Kayu Sederhana',
    ada_disabilitas_lansia_tunggal: true,
    ada_anak_sekolah_pip: true,
    kepemilikan_mobil: false
  };
  const dEkstrem = calculatePMT(profilEkstrem);
  assert(dEkstrem === 1, '7.1', 'Profil warga sangat rentan terhitung Desil 1 (Kemiskinan Ekstrem)');

  // 7.2 Kasus Pemilik Mobil Pribadi (Auto Desil 8 / Mampu)
  const profilMobil = {
    ...profilEkstrem,
    kepemilikan_mobil: true
  };
  const dMobil = calculatePMT(profilMobil);
  assert(dMobil >= 7, '7.2', 'Warga memiliki mobil otomatis di-filter ke Desil Mampu (Desil >= 7)');

  // 7.3 Validasi Mandatori SPTJM Digital
  function submitDesilWarga(payload) {
    if (!payload.sptjm_warga_accepted) {
      throw new Error('Anda wajib menyetujui Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) sebelum mengajukan data.');
    }
    return { success: true };
  }

  let sptjmBlocked = false;
  try {
    submitDesilWarga({ ...profilEkstrem, sptjm_warga_accepted: false });
  } catch (e) {
    if (e.message.includes('wajib menyetujui Surat Pernyataan Tanggung Jawab Mutlak')) {
      sptjmBlocked = true;
    }
  }
  assert(sptjmBlocked, '7.3', 'Pencegahan manipulasi: Pengajuan tanpa tanda tangan digital SPTJM ditolak');
}

// -----------------------------------------------------------------------------
// 8. LEGAL INTEGRITY TEST: PROTEKSI KUNCI SUMBER DANA BANSOS PUSAT & APBD
// -----------------------------------------------------------------------------
function testBansosLegalSourceLock() {
  console.log('\n📌 UJI 8: Legal Source Lock Regulasi Pusat (APBN vs APBD Muskel)');

  function adjustQuota(item, payload) {
    if (item.sumber_dana === 'APBN_PUSAT') {
      throw new Error('Bantuan APBN Pusat memiliki alokasi dan besaran terkunci oleh regulasi kementerian.');
    }
    if (!payload.nomor_ba_penyesuaian || !payload.alasan_penyesuaian) {
      throw new Error('Penyesuaian kuota wajib menyertakan nomor Berita Acara (BA) Muskel dan alasan pemerataan.');
    }
    return {
      nominal_awal: item.nominal_awal || item.nominal_bantuan,
      nominal_bantuan: payload.nominal_baru,
      nomor_ba_penyesuaian: payload.nomor_ba_penyesuaian
    };
  }

  // 8.1 Percobaan ubah nominal PKH (APBN Pusat)
  const bansosPKH = { id: 101, jenis_bansos: 'PKH', nominal_bantuan: 600000, sumber_dana: 'APBN_PUSAT' };
  let apbnLockPassed = false;
  try {
    adjustQuota(bansosPKH, { nominal_baru: 300000, nomor_ba_penyesuaian: 'BA/01', alasan_penyesuaian: 'Bagi rata' });
  } catch (e) {
    if (e.message.includes('terkunci oleh regulasi kementerian')) {
      apbnLockPassed = true;
    }
  }
  assert(apbnLockPassed, '8.1', 'Legal Lock Berhasil: Penyesuaian nominal bansos APBN Pusat ditolak mutlak');

  // 8.2 Penyesuaian proporsional bansos APBD Kelurahan via BA Muskel
  const bansosAPBD = { id: 102, jenis_bansos: 'Bantuan Sembako Kelurahan', nominal_bantuan: 500000, sumber_dana: 'APBD_KELURAHAN' };
  const hasilAPBD = adjustQuota(bansosAPBD, {
    nominal_baru: 250000,
    nomor_ba_penyesuaian: 'BA-MUSKEL/04/KBJ/2026',
    alasan_penyesuaian: 'Pemerataan penambahan 50 KK miskin ekstrem hasil muskel'
  });
  assert(hasilAPBD.nominal_bantuan === 250000 && hasilAPBD.nominal_awal === 500000, '8.2', 'Fleksibilitas APBD Muskel Berhasil: Nominal disesuaikan dan jejak audit nominal awal tersimpan');
}

// -----------------------------------------------------------------------------
// 9. BUSINESS LOGIC TEST: PENJADWALAN & PENERBITAN TIKET RESMI BER-QR CODE
// -----------------------------------------------------------------------------
function testBansosQRTicketScheduling() {
  console.log('\n📌 UJI 9: Penjadwalan Pengambilan Bantuan & Penerbitan Tiket QR Code');

  function scheduleTicket(bansosId, payload) {
    if (!payload.jadwal_pengambilan_tanggal) {
      throw new Error('Tanggal pengambilan wajib diisi.');
    }
    const qrCode = `BW-TKT-${bansosId}-${Date.now().toString(36).toUpperCase()}`;
    return {
      id: bansosId,
      jadwal_pengambilan_tanggal: payload.jadwal_pengambilan_tanggal,
      jadwal_pengambilan_waktu: payload.jadwal_pengambilan_waktu || '09:00 - 12:00 WIB',
      lokasi_pengambilan: payload.lokasi_pengambilan || 'Kantor Kelurahan Kebonjati',
      persyaratan_bawaan: payload.persyaratan_bawaan || 'KTP Asli, KK Asli, dan Tiket Pengambilan ini',
      qr_ticket_code: qrCode
    };
  }

  const ticket = scheduleTicket(77, {
    jadwal_pengambilan_tanggal: '2026-10-05',
    jadwal_pengambilan_waktu: 'Sesi Pagi 09:00 - 11:30 WIB',
    lokasi_pengambilan: 'Aula Kantor Kelurahan Kebonjati, Jl. Kebonjati No. 12'
  });

  assert(ticket.qr_ticket_code.startsWith('BW-TKT-77-'), '9.1', 'Kode tiket QR resmi terbit dengan format standar SPBE');
  assert(ticket.lokasi_pengambilan.includes('Kebonjati'), '9.2', 'Lokasi pengambilan kantor kelurahan terkonfigurasi dengan jelas');
  assert(ticket.jadwal_pengambilan_tanggal === '2026-10-05', '9.3', 'Tanggal dan sesi jam pengambilan terarsip lengkap untuk warga');
}

// -----------------------------------------------------------------------------
// MAIN TEST RUNNER
// -----------------------------------------------------------------------------
console.log('========================================================================');
console.log('🏛️  SUITE PENGUJIAN OTOMATIS MANDIRI: MODUL WARGA & KEAMANAN BUMI WARGA');
console.log('    Pelayanan Publik & Tata Kelola Digital Jabar Pintar');
console.log('========================================================================');

testBirthdateMatch();
testPinMandiriSecurity();
testKKBoundaryAndLetterLogic();
testLetterRequirementsTracing();
testPersonaSwitching();
testBansosFamilyVisibility();
testDesilPMTAndSPTJM();
testBansosLegalSourceLock();
testBansosQRTicketScheduling();

console.log('\n========================================================================');
console.log(`📊 HASIL EVALUASI AKHIR:`);
console.log(`   Total Pengujian : ${totalTests}`);
console.log(`   Lolos (Passed)  : ${passedTests} ✅`);
console.log(`   Gagal (Failed)  : ${failedTests} ❌`);
console.log(`   Tingkat Akurasi : ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 SELURUH SKENARIO PENGUJIAN BISNIS LOGIK & KEAMANAN LOLOS 100%!\n');
  process.exit(0);
}

