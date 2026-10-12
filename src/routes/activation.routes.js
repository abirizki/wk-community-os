/**
 * src/routes/activation.routes.js
 * Endpoints for Secure Citizen Onboarding & One-Time Activation Coupons
 * Bumi Warga - Jabar Pintar Digital
 * Compliant with BSSN Cybersecurity Guidelines & UU PDP No. 27/2022
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Helper to match birthdate against civil registry date
 */
function checkBirthdateMatch(inputDate, tanggalLahir) {
  if (!inputDate || !tanggalLahir) return false;
  const cleanInput = String(inputDate).trim().replace(/[-/.\s]/g, '');

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

/**
 * Generate secure random 8-character token (format: BW-XXXXXX)
 * Uses unambiguous characters (no 0/O, 1/I)
 */
function generateSecureToken() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BW-${rand}`;
}

// =========================================================================
// 1. GENERATE KUPON AKTIVASI SEKALI PAKAI (RT / RW / KELURAHAN)
// =========================================================================
router.post(
  '/generate-coupon',
  requireAuth,
  requireRole('ketua_rt', 'ketua_rw', 'admin_kelurahan', 'lurah', 'superadmin', 'admin'),
  async (req, res) => {
    try {
      const { nik } = req.body;
      if (!nik || String(nik).trim().length !== 16) {
        return res.status(400).json({ success: false, message: 'NIK wajib 16 digit angka.' });
      }

      const cleanNik = String(nik).trim();
      const currentUser = req.session.user;

      // Cari data warga di database
      const [wRows] = await pool.execute(
        'SELECT id, nik, no_kk, nama, rt, rw, alamat, user_id FROM warga WHERE nik = ? LIMIT 1',
        [cleanNik]
      );

      if (wRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Warga dengan NIK ${cleanNik} tidak ditemukan di database kelurahan. Harap daftarkan identitas warga terlebih dahulu.`
        });
      }

      const targetWarga = wRows[0];

      // Verifikasi scoping wilayah: RT hanya boleh buat kupon untuk RT-nya, RW untuk RW-nya
      if (currentUser.role === 'ketua_rt') {
        if (currentUser.rt && targetWarga.rt !== currentUser.rt) {
          return res.status(403).json({
            success: false,
            message: `Anda hanya dapat menerbitkan kupon untuk warga RT ${currentUser.rt}. Warga ini berada di RT ${targetWarga.rt}.`
          });
        }
      } else if (currentUser.role === 'ketua_rw') {
        if (currentUser.rw && targetWarga.rw !== currentUser.rw) {
          return res.status(403).json({
            success: false,
            message: `Anda hanya dapat menerbitkan kupon untuk warga RW ${currentUser.rw}.`
          });
        }
      }

      // Revoke token aktif lama jika ada
      await pool.execute(
        "UPDATE activation_tokens SET status = 'revoked' WHERE nik = ? AND status = 'active'",
        [cleanNik]
      );

      // Buat token unik
      let token = generateSecureToken();
      let exists = true;
      let attempts = 0;
      while (exists && attempts < 5) {
        const [cRows] = await pool.execute('SELECT id FROM activation_tokens WHERE token = ? LIMIT 1', [token]);
        if (cRows.length === 0) exists = false;
        else {
          token = generateSecureToken();
          attempts++;
        }
      }

      // Simpan kupon aktif berlaku 24 jam
      await pool.execute(
        `INSERT INTO activation_tokens 
          (token, nik, no_kk, nama, rt, rw, created_by_role, created_by_user_id, expires_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), 'active')`,
        [
          token,
          targetWarga.nik,
          targetWarga.no_kk,
          targetWarga.nama,
          targetWarga.rt,
          targetWarga.rw,
          currentUser.role,
          currentUser.id || null
        ]
      );

      // Tentukan domain publik secara aman (hindari localhost:3000 pada reverse proxy)
      const forwardedHost = req.headers['x-forwarded-host'] || req.get('host') || 'bumiwarga.online';
      const forwardedProto = req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : req.protocol);
      const isLocal = forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1');
      const baseOrigin = process.env.FRONTEND_ORIGIN || (isLocal && process.env.NODE_ENV === 'production' ? 'https://bumiwarga.online' : `${forwardedProto}://${forwardedHost}`);

      return res.status(201).json({
        success: true,
        message: `Kupon aktivasi untuk ${targetWarga.nama} berhasil diterbitkan.`,
        data: {
          token,
          nik: targetWarga.nik,
          no_kk: targetWarga.no_kk,
          nama: targetWarga.nama,
          rt: targetWarga.rt,
          rw: targetWarga.rw,
          validity: '24 Jam',
          claim_url: `${baseOrigin}/login?tab=claim&token=${token}&nik=${targetWarga.nik}`
        }
      });
    } catch (err) {
      console.error('[Activation] generate-coupon error:', err);
      return res.status(500).json({ success: false, message: 'Gagal menerbitkan kupon aktivasi.' });
    }
  }
);

// =========================================================================
// 2. DAFTAR KUPON AKTIVASI AKTIF DI WILAYAH RT/RW
// =========================================================================
router.get(
  '/list',
  requireAuth,
  requireRole('ketua_rt', 'ketua_rw', 'admin_kelurahan', 'lurah', 'superadmin', 'admin'),
  async (req, res) => {
    try {
      const currentUser = req.session.user;

      // Update token yang sudah lewat waktu menjadi 'expired'
      await pool.execute(
        "UPDATE activation_tokens SET status = 'expired' WHERE status = 'active' AND expires_at < NOW()"
      );

      let sql = 'SELECT * FROM activation_tokens';
      const params = [];

      if (currentUser.role === 'ketua_rt' && currentUser.rt) {
        sql += ' WHERE rt = ? AND rw = ?';
        params.push(currentUser.rt, currentUser.rw || '001');
      } else if (currentUser.role === 'ketua_rw' && currentUser.rw) {
        sql += ' WHERE rw = ?';
        params.push(currentUser.rw);
      }

      sql += ' ORDER BY created_at DESC LIMIT 50';

      const [rows] = await pool.execute(sql, params);

      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[Activation] list coupons error:', err);
      return res.status(500).json({ success: false, message: 'Gagal memuat daftar kupon aktivasi.' });
    }
  }
);

// =========================================================================
// 3. VERIFIKASI KEABSAHAN KUPON (PUBLIC PRE-CHECK)
// =========================================================================
router.post('/verify-coupon', async (req, res) => {
  try {
    const { token, nik } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Kode kupon wajib diisi.' });
    }

    const cleanToken = String(token).trim().toUpperCase();
    const cleanNik = nik ? String(nik).trim() : '';

    // Periksa token aktif
    const [rows] = await pool.execute(
      `SELECT token, nik, nama, rt, rw, expires_at, status 
       FROM activation_tokens 
       WHERE token = ? LIMIT 1`,
      [cleanToken]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kode kupon aktivasi tidak ditemukan.' });
    }

    const item = rows[0];

    if (item.status === 'used') {
      return res.status(400).json({ success: false, message: 'Kupon aktivasi ini sudah pernah digunakan sebelumnya.' });
    }

    if (item.status === 'revoked' || item.status === 'expired' || new Date(item.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Kupon aktivasi ini sudah kedaluwarsa atau ditarik oleh RT/RW.' });
    }

    if (cleanNik && item.nik !== cleanNik) {
      return res.status(400).json({ success: false, message: 'NIK tidak cocok dengan kupon aktivasi yang diterbitkan.' });
    }

    return res.json({
      success: true,
      valid: true,
      data: {
        token: item.token,
        nik: item.nik,
        nama: item.nama,
        rt: item.rt,
        rw: item.rw,
        expires_at: item.expires_at
      }
    });
  } catch (err) {
    console.error('[Activation] verify-coupon error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi kupon.' });
  }
});

// =========================================================================
// 4. KLAIM KUPON & PEMBUATAN PASSWORD BARU (PUBLIC REDEMPTION)
// =========================================================================
router.post('/claim-coupon', async (req, res) => {
  try {
    const { token, nik, new_password, confirm_password } = req.body;

    if (!token || !nik || !new_password) {
      return res.status(400).json({ success: false, message: 'Kode kupon, NIK, dan kata sandi baru wajib diisi.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Konfirmasi kata sandi tidak cocok.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'Kata sandi minimal 8 karakter dengan kombinasi huruf dan angka.' });
    }

    const cleanToken = String(token).trim().toUpperCase();
    const cleanNik = String(nik).trim();

    // Verifikasi kupon
    const [tRows] = await pool.execute(
      `SELECT * FROM activation_tokens 
       WHERE token = ? AND nik = ? AND status = 'active' AND expires_at > NOW() 
       LIMIT 1`,
      [cleanToken, cleanNik]
    );

    if (tRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kupon aktivasi tidak valid, salah NIK, atau sudah kedaluwarsa. Silakan minta kupon baru ke Ketua RT Anda.'
      });
    }

    const tokenData = tRows[0];

    // Buat hash kata sandi baru (Bcrypt 10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    // Cek apakah akun users sudah ada
    const [uRows] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [cleanNik]);
    let userId = null;

    if (uRows.length > 0) {
      userId = uRows[0].id;
      await pool.execute(
        `UPDATE users 
         SET password_hash = ?, status = 'active', must_change_password = 0, nama = ? 
         WHERE id = ?`,
        [passwordHash, tokenData.nama, userId]
      );
    } else {
      const [ins] = await pool.execute(
        `INSERT INTO users (username, password_hash, nama, role, rt, rw, status, must_change_password)
         VALUES (?, ?, ?, 'warga', ?, ?, 'active', 0)`,
        [cleanNik, passwordHash, tokenData.nama, tokenData.rt, tokenData.rw]
      );
      userId = ins.insertId;
    }

    // Hubungkan warga ke user_id
    await pool.execute('UPDATE warga SET user_id = ? WHERE nik = ?', [userId, cleanNik]);

    // Tandai kupon sebagai 'used'
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    await pool.execute(
      `UPDATE activation_tokens 
       SET status = 'used', used_at = NOW(), used_by_ip = ? 
       WHERE id = ?`,
      [String(clientIp).slice(0, 50), tokenData.id]
    );

    return res.json({
      success: true,
      message: `Selamat, akun Bumi Warga untuk ${tokenData.nama} berhasil diaktifkan! Silakan masuk menggunakan NIK dan kata sandi baru Anda.`
    });
  } catch (err) {
    console.error('[Activation] claim-coupon error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengaktifkan akun warga.' });
  }
});

// =========================================================================
// 5. PENDAFTARAN & AKTIVASI MANDIRI ONLINE (SELF-SERVICE e-KYC RINGAN)
// =========================================================================
router.post('/self-register', async (req, res) => {
  try {
    const { nik, no_kk, tanggal_lahir, no_telepon, new_password, confirm_password } = req.body;

    if (!nik || !no_kk || !tanggal_lahir || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'NIK, Nomor KK, Tanggal Lahir, dan Kata Sandi Baru wajib diisi.'
      });
    }

    const cleanNik = String(nik).trim();
    const cleanKK = String(no_kk).trim();

    if (cleanNik.length !== 16 || cleanKK.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'NIK dan Nomor KK harus terdiri dari tepat 16 digit angka.'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Konfirmasi kata sandi tidak cocok.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi minimal 8 karakter (kombinasi huruf dan angka).'
      });
    }

    // Cari warga di basis data kependudukan
    const [wRows] = await pool.execute(
      `SELECT id, nik, no_kk, nama, tanggal_lahir, rt, rw, user_id 
       FROM warga 
       WHERE nik = ? AND no_kk = ? LIMIT 1`,
      [cleanNik, cleanKK]
    );

    if (wRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kombinasi NIK dan Nomor KK tidak terdaftar dalam database kelurahan. Silakan hubungi Ketua RT setempat untuk pendataan kependudukan.'
      });
    }

    const targetWarga = wRows[0];

    // Challenge Validasi: Tanggal Lahir (DDMMYYYY atau YYYY-MM-DD)
    if (!checkBirthdateMatch(tanggal_lahir, targetWarga.tanggal_lahir)) {
      return res.status(400).json({
        success: false,
        message: 'Verifikasi identitas gagal: Tanggal lahir tidak sesuai dengan data Kartu Keluarga resmi.'
      });
    }

    // Hash kata sandi baru (Bcrypt 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    // Cek apakah akun users sudah ada
    const [uRows] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [cleanNik]);
    let userId = null;

    if (uRows.length > 0) {
      userId = uRows[0].id;
      await pool.execute(
        `UPDATE users 
         SET password_hash = ?, status = 'active', must_change_password = 0, nama = ? 
         WHERE id = ?`,
        [passwordHash, targetWarga.nama, userId]
      );
    } else {
      const [ins] = await pool.execute(
        `INSERT INTO users (username, password_hash, nama, role, rt, rw, status, must_change_password)
         VALUES (?, ?, ?, 'warga', ?, ?, 'active', 0)`,
        [cleanNik, passwordHash, targetWarga.nama, targetWarga.rt, targetWarga.rw]
      );
      userId = ins.insertId;
    }

    // Hubungkan warga ke user_id dan simpan nomor telepon bila ada
    if (no_telepon && String(no_telepon).trim()) {
      await pool.execute(
        'UPDATE warga SET user_id = ?, no_telepon = ? WHERE nik = ?',
        [userId, String(no_telepon).trim(), cleanNik]
      );
    } else {
      await pool.execute('UPDATE warga SET user_id = ? WHERE nik = ?', [userId, cleanNik]);
    }

    return res.json({
      success: true,
      message: `Pendaftaran mandiri berhasil! Akun atas nama ${targetWarga.nama} kini telah aktif. Silakan masuk menggunakan NIK dan kata sandi Anda.`
    });
  } catch (err) {
    console.error('[Activation] self-register error:', err);
    return res.status(500).json({ success: false, message: 'Gagal melakukan pendaftaran mandiri.' });
  }
});

module.exports = router;

