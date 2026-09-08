/**
 * src/middleware/auth.middleware.js
 * Middleware for authenticating API requests.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Harap login terlebih dahulu.' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden. Akses ditolak.' });
}

module.exports = {
  requireAuth,
  requireAdmin
};
