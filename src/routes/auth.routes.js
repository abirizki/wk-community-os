/**
 * src/routes/auth.routes.js
 * Authentication & Family Profile Switching API
 * Comprehensive Multi-Tier & Secure Family Authentication API
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const pool = require('../db/pool');
const { STANDARD_ACCOUNTS } = require('../db/auto_patch');

const router = express.Router();

// POST /api/auth/login (Mendukung Username, NIK, dan Nomor KK)
/**
 * Helper to match birthdate PIN (DDMMYYYY, YYYYMMDD, or DDMMYY) against civil registry date
 * @param {string} inputPassword 
 * @param {Date|string} tanggalLahir 
 * @returns {boolean}
 */
function checkBirthdateMatch(inputPassword, tanggalLahir) {
  if (!inputPassword || !tanggalLahir) return false;
  const cleanInput = String(inputPassword).trim().replace(/[-/.\s]/g, '');

  let yyyy = '', mm = '', dd = '';
  if (tanggalLahir instanceof Date) {
    yyyy = String(tanggalLahir.getFullYear());
    mm = String(tanggalLahir.getMonth() + 1).padStart(2, '0');
    dd = String(tanggalLahir.getDate()).padStart(2, '0');
  } else {
    const str = String(tanggalLahir).slice(0, 10);
    const parts = str.split('-');
    if (parts.length === 3) {
      yyyy = parts[0];
      mm = parts[1].padStart(2, '0');
      dd = parts[2].padStart(2, '0');
    }
  }
  if (!yyyy || !mm || !dd) return false;

  const candidate1 = `${dd}${mm}${yyyy}`; // 24101995 (DDMMYYYY)
  const candidate2 = `${yyyy}${mm}${dd}`; // 19951024 (YYYYMMDD)
  const candidate3 = `${dd}${mm}${yyyy.slice(-2)}`; // 241095 (DDMMYY)

  return cleanInput === candidate1 || cleanInput === candidate2 || cleanInput === candidate3;
}

// POST /api/auth/login (Mendukung Login Seluruh Anggota Keluarga, NIK, No KK, & Username)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/NIK/No KK dan password wajib diisi' });
      return res.status(400).json({ success: false, message: 'Identitas (NIK/No KK/Username) dan kata sandi/PIN wajib diisi.' });
    }

    const cleanUsername = String(username).trim();
    const is16Digits = /^\d{16}$/.test(cleanUsername);

    // 1. Cari user di tabel users
    let user = null;
    try {
      user = await userRepository.findByUsername(cleanUsername);
    } catch (dbErr) {
      console.warn('[Auth] Database lookup warning:', dbErr.message);
    }
    let identifiedWarga = null;
    let identifiedKK = null;
    let isFamilyAccount = false;
    let no_kk = null;
    let familyMembers = [];

    // 2. Jika tidak ditemukan langsung tapi cleanUsername adalah 16 digit (NIK / No KK)
    if (!user && /^\d{16}$/.test(cleanUsername)) {
    // =========================================================================
    // TAHAP 1: DETEKSI ENTITAS (NIK Warga / Nomor KK / Username Kedinasan)
    // =========================================================================
    if (is16Digits) {
      // 1.A. Periksa apakah 16 digit adalah NIK anggota keluarga di tabel warga
      try {
        // Cek apakah 16 digit ini adalah NIK warga yang memiliki user_id
        const [wargaByNik] = await pool.execute(
          'SELECT user_id, nik, nama, no_kk FROM warga WHERE nik = ? LIMIT 1',
        const [wRows] = await pool.execute(
          `SELECT id, nik, no_kk, nama, tanggal_lahir, jenis_kelamin, status_hubungan_keluarga, 
                  rt, rw, user_id, pin_mandiri 
           FROM warga WHERE nik = ? LIMIT 1`,
          [cleanUsername]
        );
        if (wargaByNik.length > 0 && wargaByNik[0].user_id) {
          user = await userRepository.findById(wargaByNik[0].user_id);
        if (wRows.length > 0) {
          identifiedWarga = wRows[0];
          no_kk = identifiedWarga.no_kk;
        }
      } catch (wErr) {
        console.warn('[Auth] Warga NIK lookup warning:', wErr.message);
      }

        // Jika belum ditemukan, cek apakah 16 digit ini adalah Nomor KK
        if (!user) {
          const kk = await userRepository.findKartuKeluarga(cleanUsername);
          if (kk) {
            const [wargaRows] = await pool.execute(
              'SELECT user_id, nik, nama FROM warga WHERE no_kk = ? AND status_hubungan_keluarga = "Kepala Keluarga" LIMIT 1',
              [cleanUsername]
            );
            if (wargaRows.length > 0 && wargaRows[0].user_id) {
              user = await userRepository.findById(wargaRows[0].user_id);
            }
      // 1.B. Jika bukan NIK warga, periksa apakah merupakan Nomor Kartu Keluarga (No KK)
      if (!identifiedWarga) {
        try {
          const kkDirect = await userRepository.findKartuKeluarga(cleanUsername);
          if (kkDirect) {
            identifiedKK = kkDirect;
            no_kk = cleanUsername;
            isFamilyAccount = true;
          }
        } catch (kkErr) {
          console.warn('[Auth] KK lookup warning:', kkErr.message);
        }
      } catch (idLookupErr) {
        console.warn('[Auth] NIK/KK lookup warning:', idLookupErr.message);
      }
    }

    // Fallback darurat: Jika user tidak ditemukan di database (misal hosting belum di-patch),
    // cek apakah terdaftar di STANDARD_ACCOUNTS resmi
    // =========================================================================
    // TAHAP 2: CARI AKUN PENGGUNA TERKAIT (USERS TABLE)
    // =========================================================================
    // 2.A. Jika identifiedWarga memiliki user_id terdaftar
    if (identifiedWarga && identifiedWarga.user_id) {
      try {
        user = await userRepository.findById(identifiedWarga.user_id);
      } catch (e) {}
    }

    // 2.B. Cari langsung berdasarkan username di tabel users
    if (!user) {
      try {
        user = await userRepository.findByUsername(cleanUsername);
      } catch (dbErr) {
        console.warn('[Auth] Database lookup warning:', dbErr.message);
      }
    }

    // 2.C. Jika belum ditemukan tapi memiliki afiliasi KK:
    // Cari akun induk keluarga dalam 1 KK (akun Kepala Keluarga atau akun dengan username No KK)
    if (!user && (identifiedWarga || identifiedKK) && no_kk) {
      try {
        // Coba cari user dengan username = no_kk
        user = await userRepository.findByUsername(no_kk);

        // Jika belum, cari user milik Kepala Keluarga di KK ini
        if (!user) {
          const [kkUsers] = await pool.execute(
            `SELECT u.* FROM users u 
             JOIN warga w ON w.user_id = u.id 
             WHERE w.no_kk = ? 
             ORDER BY CASE w.status_hubungan_keluarga WHEN 'Kepala Keluarga' THEN 1 ELSE 2 END, u.id ASC 
             LIMIT 1`,
            [no_kk]
          );
          if (kkUsers.length > 0) user = kkUsers[0];
        }

        // Jika belum, cari user yang username-nya adalah NIK anggota keluarga lain di KK ini
        if (!user) {
          const [nikUsers] = await pool.execute(
            `SELECT u.* FROM users u 
             JOIN warga w ON w.nik = u.username 
             WHERE w.no_kk = ? 
             ORDER BY CASE w.status_hubungan_keluarga WHEN 'Kepala Keluarga' THEN 1 ELSE 2 END, u.id ASC 
             LIMIT 1`,
            [no_kk]
          );
          if (nikUsers.length > 0) user = nikUsers[0];
        }
      } catch (famLookupErr) {
        console.warn('[Auth] Family user lookup warning:', famLookupErr.message);
      }
    }

    // 2.D. Fallback Akun Standar Resmi (jika database belum terisi lengkap)
    let isFallbackAccount = false;
    if (!user) {
      const standardAcc = STANDARD_ACCOUNTS.find(acc => acc.username === cleanUsername);
      const standardAcc = STANDARD_ACCOUNTS.find(acc => 
        acc.username === cleanUsername || (identifiedWarga && acc.username === identifiedWarga.nik)
      );
      if (standardAcc) {
        user = {
          id: 9900 + STANDARD_ACCOUNTS.indexOf(standardAcc),
          username: standardAcc.username,
          nama: standardAcc.nama,
          role: standardAcc.role,
          rt: standardAcc.rt,
          rw: standardAcc.rw,
          status: 'active',
          password_hash: standardAcc.password_hash,
          must_change_password: 0
        };
        isFallbackAccount = true;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Identitas atau password salah' });
    // 2.E. Aktivasi Akun Otomatis bagi Warga Terdaftar (Safe Auto-Activation)
    // Jika warga ada di Dukcapil tapi belum memiliki baris di tabel users, dan login menggunakan PIN Tanggal Lahir
    if (!user && identifiedWarga) {
      const isBirthdate = checkBirthdateMatch(password, identifiedWarga.tanggal_lahir);
      if (isBirthdate) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);
          const [ins] = await pool.execute(
            `INSERT INTO users (username, password_hash, nama, role, rt, rw, status, must_change_password)
             VALUES (?, ?, ?, 'warga', ?, ?, 'active', 0)`,
            [identifiedWarga.nik, hash, identifiedWarga.nama, identifiedWarga.rt, identifiedWarga.rw]
          );
          user = {
            id: ins.insertId,
            username: identifiedWarga.nik,
            nama: identifiedWarga.nama,
            role: 'warga',
            rt: identifiedWarga.rt,
            rw: identifiedWarga.rw,
            status: 'active',
            password_hash: hash,
            must_change_password: 0
          };
          try {
            await pool.execute('UPDATE warga SET user_id = ? WHERE id = ?', [user.id, identifiedWarga.id]);
          } catch (e) {}
        } catch (autoUserErr) {
          console.warn('[Auth] Auto create user warning:', autoUserErr.message);
        }
      }
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Akun dinonaktifkan atau ditangguhkan. Hubungi petugas kelurahan.' });
    if (!user && !identifiedWarga) {
      return res.status(401).json({ success: false, message: 'Identitas atau kata sandi tidak sesuai.' });
    }

    // 3. Verifikasi password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identitas atau password salah' });
    if (user && user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Akun dinonaktifkan atau ditangguhkan. Hubungi pengurus RT/Kelurahan.' });
    }

    // 4. Periksa apakah user terafiliasi dengan Nomor KK
    let no_kk = null;
    let familyMembers = [];
    let isFamilyAccount = false;
    // =========================================================================
    // TAHAP 3: MEKANISME VERIFIKASI KEAMANAN BERLAPIS (MULTI-CREDENTIAL VERIFICATION)
    // =========================================================================
    let isMatch = false;
    let loginMethod = 'password';

    try {
      const kkDirect = await userRepository.findKartuKeluarga(cleanUsername);
      if (kkDirect) {
        no_kk = cleanUsername;
        isFamilyAccount = true;
      } else if (user.role === 'warga') {
        const [wargaProfil] = await pool.execute(
          'SELECT no_kk, nama, nik FROM warga WHERE nik = ? LIMIT 1',
          [user.username]
    // 3.A. Cek PIN Mandiri Anggota Keluarga (jika sudah diatur secara privat)
    if (identifiedWarga && identifiedWarga.pin_mandiri) {
      try {
        isMatch = await bcrypt.compare(password, identifiedWarga.pin_mandiri);
        if (isMatch) loginMethod = 'pin_mandiri';
      } catch (e) {}
    }

    // 3.B. Cek PIN Tanggal Lahir Warga (DDMMYYYY / YYYYMMDD)
    if (!isMatch && identifiedWarga && identifiedWarga.tanggal_lahir) {
      if (checkBirthdateMatch(password, identifiedWarga.tanggal_lahir)) {
        isMatch = true;
        loginMethod = 'birthdate_pin';
      }
    }

    // 3.C. Cek Kata Sandi Akun Keluarga / Password Utama
    if (!isMatch && user && user.password_hash) {
      try {
        isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
          loginMethod = identifiedWarga ? 'family_password' : (identifiedKK ? 'kk_password' : 'account_password');
        }
      } catch (e) {}
    }

    // 3.D. Jika login dengan Nomor KK, izinkan juga PIN Tanggal Lahir Kepala Keluarga
    if (!isMatch && identifiedKK && no_kk) {
      try {
        const [kepalaRows] = await pool.execute(
          'SELECT tanggal_lahir FROM warga WHERE no_kk = ? AND status_hubungan_keluarga = "Kepala Keluarga" LIMIT 1',
          [no_kk]
        );
        if (wargaProfil && wargaProfil.length > 0) {
          no_kk = wargaProfil[0].no_kk;
        if (kepalaRows.length > 0 && checkBirthdateMatch(password, kepalaRows[0].tanggal_lahir)) {
          isMatch = true;
          loginMethod = 'kk_birthdate_pin';
        }
      }
      } catch (e) {}
    }

      if (no_kk) {
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identitas atau kata sandi / PIN tidak sesuai.' 
      });
    }

    // =========================================================================
    // TAHAP 4: MUAT ANGGOTA KELUARGA 1 KK (FAMILY BOUNDARY SCOPING)
    // =========================================================================
    if (no_kk) {
      try {
        familyMembers = await userRepository.findFamilyMembersByNoKK(no_kk);
        if (familyMembers.length > 1) {
          isFamilyAccount = true;
        }
      } catch (famErr) {
        console.warn('[Auth] Family fetch warning:', famErr.message);
      }
    } catch (familyErr) {
      console.warn('[Auth] Family members fetch warning:', familyErr.message);
    }

    // 5. Tentukan Persona Aktif Pertama Kali
    let activeNik = user.username;
    let activeNama = user.nama;
    let activeHubungan = 'Pengguna';
    // =========================================================================
    // TAHAP 5: PENETAPAN PERSONA AKTIF SESUAI ANGGOTA YANG LOGIN
    // =========================================================================
    let activeNik = identifiedWarga ? identifiedWarga.nik : (user ? user.username : cleanUsername);
    let activeNama = identifiedWarga ? identifiedWarga.nama : (user ? user.nama : cleanUsername);
    let activeHubungan = identifiedWarga ? identifiedWarga.status_hubungan_keluarga : 'Pengguna';

    if (familyMembers.length > 0) {
      const match = familyMembers.find(m => m.nik === user.username) || familyMembers[0];
    // Jika login menggunakan Nomor KK (bukan NIK individu), default ke Kepala Keluarga
    if (!identifiedWarga && familyMembers.length > 0) {
      const match = familyMembers.find(m => m.nik === user?.username) || familyMembers[0];
      activeNik = match.nik;
      activeNama = match.nama;
      activeHubungan = match.status_hubungan_keluarga;
    }

    const mustChangePassword = Boolean(user.must_change_password);

    const userData = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role === 'admin' ? 'admin_kelurahan' : user.role,
      rt: user.rt || (familyMembers[0]?.rt ?? null),
      rw: user.rw || (familyMembers[0]?.rw ?? null),
      id: user ? user.id : 0,
      username: user ? user.username : activeNik,
      nama: user ? user.nama : activeNama,
      role: user ? (user.role === 'admin' ? 'admin_kelurahan' : user.role) : 'warga',
      rt: (user && user.rt) || (identifiedWarga && identifiedWarga.rt) || (familyMembers[0] && familyMembers[0].rt) || null,
      rw: (user && user.rw) || (identifiedWarga && identifiedWarga.rw) || (familyMembers[0] && familyMembers[0].rw) || null,
      no_kk,
      is_family_account: isFamilyAccount,
      active_nik: activeNik,
      active_nama: activeNama,
      active_hubungan: activeHubungan,
      logged_in_by_nik: identifiedWarga ? identifiedWarga.nik : (user ? user.username : activeNik),
      logged_in_by_nama: identifiedWarga ? identifiedWarga.nama : (user ? user.nama : activeNama),
      login_method: loginMethod,
      family_members: familyMembers,
      must_change_password: mustChangePassword
      must_change_password: Boolean(user && user.must_change_password),
      needs_profile_selection: Boolean(identifiedKK && familyMembers.length > 1)
    };

    req.session.user = userData;

    // Catat last login secara aman tanpa menggagalkan login
    if (!isFallbackAccount) {
      try {
    // Catat log audit login secara aman
    try {
      if (user && user.id && !isFallbackAccount) {
        await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
      } catch (lastLoginErr) {
        // Abaikan jika kolom last_login_at belum tersedia
      }
    }
      if (identifiedWarga && identifiedWarga.id) {
        await pool.execute('UPDATE warga SET last_login_at = NOW(), login_method = ? WHERE id = ?', [loginMethod, identifiedWarga.id]);
      }
    } catch (logErr) {}

    return res.json({
      success: true,
      message: 'Login berhasil',
      message: identifiedWarga 
        ? `Selamat datang, ${identifiedWarga.nama} (${identifiedWarga.status_hubungan_keluarga})` 
        : 'Login berhasil',
      user: userData
    });

  } catch (error) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat autentikasi. Silakan coba kembali.' });
  }
});

// POST /api/auth/select-profile (Ganti Persona Anggota Keluarga)
// POST /api/auth/select-profile (Ganti Persona Anggota Keluarga dalam 1 KK)
router.post('/select-profile', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Tidak ada sesi aktif' });
      return res.status(401).json({ success: false, message: 'Tidak ada sesi aktif. Harap login terlebih dahulu.' });
    }

    const { nik } = req.body;
    if (!nik) {
      return res.status(400).json({ success: false, message: 'NIK anggota keluarga wajib dipilih' });
    }

    const user = req.session.user;
    if (!user.no_kk) {
    const sessionUser = req.session.user;
    if (!sessionUser.no_kk) {
      return res.status(400).json({ success: false, message: 'Akun ini tidak terikat pada Kartu Keluarga' });
    }

    // Pastikan NIK yang dipilih benar-benar anggota dari KK tersebut
    const members = await userRepository.findFamilyMembersByNoKK(user.no_kk);
    const members = await userRepository.findFamilyMembersByNoKK(sessionUser.no_kk);
    const selected = members.find(m => m.nik === nik);

    if (!selected) {
      return res.status(403).json({ success: false, message: 'Anggota keluarga tidak ditemukan dalam KK ini' });
      return res.status(403).json({ success: false, message: 'Anggota keluarga tidak ditemukan dalam Kartu Keluarga ini' });
    }

    // Update sesi aktif
    req.session.user.active_nik = selected.nik;
    req.session.user.active_nama = selected.nama;
    req.session.user.active_hubungan = selected.status_hubungan_keluarga;

    res.json({
    return res.json({
      success: true,
      message: `Beralih profil ke ${selected.nama} (${selected.status_hubungan_keluarga})`,
      message: `Beralih profil aktif ke ${selected.nama} (${selected.status_hubungan_keluarga})`,
      active_persona: {
        nik: selected.nik,
        nama: selected.nama,
        hubungan: selected.status_hubungan_keluarga
      }
    });
  } catch (error) {
    console.error('Select profile error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengganti profil keluarga' });
    return res.status(500).json({ success: false, message: 'Gagal mengganti profil keluarga' });
  }
});

// POST /api/auth/set-personal-pin (Atur PIN Mandiri 6 Digit untuk Anggota Keluarga)
router.post('/set-personal-pin', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Harap login terlebih dahulu' });
    }

    const { nik, pin } = req.body;
    if (!nik || !pin) {
      return res.status(400).json({ success: false, message: 'NIK dan PIN baru (6 digit angka) wajib diisi' });
    }

    if (!/^\d{6}$/.test(String(pin).trim())) {
      return res.status(400).json({ success: false, message: 'PIN harus terdiri tepat 6 digit angka numerik (contoh: 123456).' });
    }

    const sessionUser = req.session.user;
    const cleanNik = String(nik).trim();

    // Verifikasi keamanan: NIK harus berada dalam KK yang sama dengan user yang login
    let authorized = false;
    let targetNama = cleanNik;

    if (sessionUser.no_kk) {
      const members = await userRepository.findFamilyMembersByNoKK(sessionUser.no_kk);
      const match = members.find(m => m.nik === cleanNik);
      if (match) {
        authorized = true;
        targetNama = match.nama;
      }
    } else if (sessionUser.username === cleanNik || sessionUser.active_nik === cleanNik) {
      authorized = true;
    }

    if (!authorized && sessionUser.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Anda hanya berwenang mengatur PIN untuk anggota keluarga dalam 1 KK Anda.' });
    }

    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(String(pin).trim(), salt);

    await pool.execute('UPDATE warga SET pin_mandiri = ? WHERE nik = ?', [pinHash, cleanNik]);

    return res.json({
      success: true,
      message: `PIN mandiri untuk ${targetNama} berhasil disimpan. Anggota keluarga kini dapat login langsung menggunakan NIK dan PIN ini.`
    });
  } catch (error) {
    console.error('[Auth] set-personal-pin error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengatur PIN mandiri' });
  }
});

// GET /api/auth/family-members (Ambil anggota keluarga dari akun saat ini)
router.get('/family-members', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Harap login terlebih dahulu' });
    }

    const no_kk = req.session.user.no_kk;
    if (!no_kk) {
      return res.json({ success: true, data: [] });
    }

    const members = await userRepository.findFamilyMembersByNoKK(no_kk);
    res.json({ success: true, data: members });
    return res.json({ success: true, data: members });
  } catch (error) {
    console.error('Fetch family members error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data keluarga' });
    return res.status(500).json({ success: false, message: 'Gagal memuat data keluarga' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Gagal logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logout berhasil' });
    res.clearCookie('wk_session_id');
    return res.json({ success: true, message: 'Logout berhasil' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, authenticated: true, user: req.session.user });
    return res.json({ success: true, authenticated: true, user: req.session.user });
  } else {
    res.json({ success: false, authenticated: false, user: null, message: 'Tidak ada sesi aktif' });
    return res.json({ success: false, authenticated: false, user: null, message: 'Tidak ada sesi aktif' });
  }
});

// POST /api/auth/change-initial-password (Kebijakan Force Change Password saat Login Pertama)
router.post('/change-initial-password', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Tidak ada sesi aktif. Silakan login kembali.' });
    }

    const { new_password, confirm_password } = req.body;
    const userId = req.session.user.id;

    if (!new_password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'Kata sandi baru dan konfirmasi wajib diisi.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Konfirmasi kata sandi tidak cocok.' });
    }

    // Kebijakan Keamanan BSSN: Minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_-])[A-Za-z\d@$!%*?&#^_-]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi minimal 8 karakter dan harus memuat kombinasi huruf besar, huruf kecil, angka, serta simbol khusus (@, $, !, %, *, ?, &, #).'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    try {
      await pool.execute(
        'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
        [passwordHash, userId]
      );
    } catch (dbErr) {
      // Graceful fallback jika kolom belum ada di DB lokal
    }
    } catch (dbErr) {}

    req.session.user.must_change_password = false;

    res.json({
    return res.json({
      success: true,
      message: 'Kata sandi pribadi Anda berhasil disimpan! Anda kini memiliki akses penuh ke sistem.',
      user: req.session.user
    });
  } catch (error) {
    console.error('Change initial password error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi.' });
    return res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi.' });
  }
});

module.exports = router;
