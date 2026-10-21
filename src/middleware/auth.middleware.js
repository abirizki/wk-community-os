/**
 * src/middleware/auth.middleware.js
 * Multi-Tier Role-Based Access Control (RBAC) & Scope Guard
 * Bumi Warga - Jabar Pintar Digital
 */

// Hierarki tingkat peran (makin kecil angkanya makin tinggi kuasanya)
const ROLE_HIERARCHY = {
  superadmin: 0,
  walikota: 0,
  camat: 0.5,
  lurah: 1,
  admin_kelurahan: 1,
  admin: 1, // Alias kompatibilitas
  staf_kelurahan: 1.5,
  admin_rw: 2,
  ketua_rw: 2,
  ketua_rt: 3,
  kader_posyandu: 3,
  warga: 4
};

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Harap login terlebih dahulu.' });
}

function requireRole(...roles) {
  // Dukung format array requireRole(['a', 'b']) maupun variadic requireRole('a', 'b')
  const allowedRoles = roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles.flat();

  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Harap login terlebih dahulu.' });
    }

    const userRole = req.session.user.role;
    // Normalisasi role
    let normalizedRole = userRole;
    if (userRole === 'admin') normalizedRole = 'admin_kelurahan';

    const isAllowed = allowedRoles.some(role => {
      if (role === 'admin' && (normalizedRole === 'admin_kelurahan' || normalizedRole === 'superadmin')) return true;
      if (role === 'admin_kelurahan' && (normalizedRole === 'admin_kelurahan' || normalizedRole === 'superadmin')) return true;
      if (role === 'superadmin' && normalizedRole === 'superadmin') return true;
      if (role === 'pimpinan' && ['walikota', 'camat', 'lurah'].includes(normalizedRole)) return true;
      return role === normalizedRole;
    });

    if (isAllowed || normalizedRole === 'superadmin') {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Akses ditolak. Peran '${userRole}' tidak memiliki wewenang untuk tindakan ini.` 
    });
  };
}

// Kompatibilitas dengan middleware requireAdmin yang sudah ada
const requireAdmin = requireRole(['admin_kelurahan', 'superadmin']);

/**
 * Middleware untuk memvalidasi bahwa pembuat user hanya dapat membuat role di bawahnya
 * dan tidak melompat scope wilayah (RT/RW)
 */
function canManageUserRole(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  const creator = req.session.user;
  const creatorRole = creator.role === 'admin' ? 'admin_kelurahan' : creator.role;
  const targetRole = req.body.role;
  const targetRT = req.body.rt;
  const targetRW = req.body.rw;

  const creatorLevel = ROLE_HIERARCHY[creatorRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];

  if (creatorLevel === undefined) {
    return res.status(403).json({ success: false, message: 'Role pembuat tidak valid.' });
  }

  if (targetLevel === undefined) {
    return res.status(400).json({ success: false, message: `Role target '${targetRole}' tidak valid.` });
  }

  // Aturan 1: Hanya boleh membuat role dengan level LEBIH RENDAH (angka lebih besar)
  if (creatorLevel >= targetLevel) {
    return res.status(403).json({ 
      success: false, 
      message: `Pelanggaran hirarki. Role '${creatorRole}' tidak berhak membuat akun dengan role '${targetRole}'.` 
    });
  }

  // Aturan 2: Scoping Wilayah RW
  if (creatorRole === 'ketua_rw' || creatorRole === 'admin_rw') {
    if (!creator.rw || creator.rw !== targetRW) {
      return res.status(403).json({ 
        success: false, 
        message: `Pelanggaran wilayah. Anda hanya dapat mengelola akun di RW ${creator.rw}.` 
      });
    }
  }

  // Aturan 3: Scoping Wilayah RT
  if (creatorRole === 'ketua_rt') {
    if (!creator.rt || !creator.rw || creator.rt !== targetRT || creator.rw !== targetRW) {
      return res.status(403).json({ 
        success: false, 
        message: `Pelanggaran wilayah. Anda hanya dapat mengelola akun di RT ${creator.rt}/RW ${creator.rw}.` 
      });
    }
  }

  next();
}

/**
 * Anti-IDOR Family & Citizen Scope Guard
 * Memastikan warga hanya dapat mengakses NIK / KK miliknya sendiri,
 * sedangkan RT/RW/Lurah berwenang mengakses data sesuai yurisdiksi.
 */
function requireFamilyOrStaffScope(paramType = 'noKk') {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Harap login terlebih dahulu.' });
    }

    const currentUser = req.session.user;
    const isStaff = ['superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin', 'ketua_rw', 'admin_rw', 'ketua_rt', 'kader_posyandu'].includes(currentUser.role);

    if (isStaff) {
      return next();
    }

    if (paramType === 'noKk') {
      const requestedNoKk = String(req.params.noKk || req.query.noKk || '').trim();
      const userNoKk = String(currentUser.no_kk || '').trim();

      if (userNoKk && requestedNoKk && userNoKk === requestedNoKk) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Akses ditolak (Anti-IDOR). Anda hanya berhak mengakses dokumen keluarga Anda sendiri.'
      });
    }

    if (paramType === 'nik') {
      const requestedNik = String(req.params.nik || '').trim();
      const userNik = String(currentUser.active_nik || currentUser.username || '').trim();

      if (userNik && requestedNik && userNik === requestedNik) {
        return next();
      }

      if (currentUser.family_members && currentUser.family_members.some(m => m.nik === requestedNik)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Akses ditolak (Anti-IDOR). Anda hanya berhak mengakses data anggota keluarga Anda sendiri.'
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireFamilyOrStaffScope,
  canManageUserRole,
  ROLE_HIERARCHY
};
