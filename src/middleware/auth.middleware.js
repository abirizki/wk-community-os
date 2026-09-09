/**
 * src/middleware/auth.middleware.js
 * Multi-Tier Role-Based Access Control (RBAC) & Scope Guard
 * Bumi Warga - Jabar Pintar Digital
 */

// Hierarki tingkat peran (makin kecil angkanya makin tinggi kuasanya)
const ROLE_HIERARCHY = {
  superadmin: 0,
  admin_kelurahan: 1,
  admin: 1, // Alias kompatibilitas
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

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Harap login terlebih dahulu.' });
    }

    const userRole = req.session.user.role;
    // Normalisasi 'admin' menjadi 'admin_kelurahan'
    const normalizedRole = userRole === 'admin' ? 'admin_kelurahan' : userRole;

    const isAllowed = allowedRoles.some(role => {
      if (role === 'admin' && (normalizedRole === 'admin_kelurahan' || normalizedRole === 'superadmin')) return true;
      if (role === 'admin_kelurahan' && (normalizedRole === 'admin_kelurahan' || normalizedRole === 'superadmin')) return true;
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

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  canManageUserRole,
  ROLE_HIERARCHY
};
