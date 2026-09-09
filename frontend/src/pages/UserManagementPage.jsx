import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Users, 
  ShieldCheck, 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Lock, 
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_DISPLAY = {
  superadmin: { label: 'Super Admin (Owner)', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  admin_kelurahan: { label: 'Admin Kelurahan', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  admin: { label: 'Admin Kelurahan', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  admin_rw: { label: 'Admin RW', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ketua_rw: { label: 'Ketua RW', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ketua_rt: { label: 'Ketua RT', bg: 'bg-teal-100 text-teal-800 border-teal-200' },
  kader_posyandu: { label: 'Kader Posyandu', bg: 'bg-pink-100 text-pink-800 border-pink-200' },
  warga: { label: 'Warga', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    role: '',
    rt: '',
    rw: ''
  });

  const currentUserRole = user?.role === 'admin' ? 'admin_kelurahan' : user?.role;

  // Determine allowed sub-roles that current user can create
  const getAllowedRolesToCreate = () => {
    if (currentUserRole === 'superadmin') {
      return ['admin_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga'];
    }
    if (currentUserRole === 'admin_kelurahan') {
      return ['admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga'];
    }
    if (currentUserRole === 'ketua_rw' || currentUserRole === 'admin_rw') {
      return ['ketua_rt'];
    }
    if (currentUserRole === 'ketua_rt') {
      return ['warga'];
    }
    return [];
  };

  const allowedRoles = getAllowedRolesToCreate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenCreateModal = () => {
    setActionError(null);
    setFormData({
      username: '',
      password: '',
      nama: '',
      role: allowedRoles[0] || 'warga',
      rt: currentUserRole === 'ketua_rt' ? user?.rt || '001' : '',
      rw: ['ketua_rw', 'admin_rw', 'ketua_rt'].includes(currentUserRole) ? user?.rw || '001' : ''
    });
    setCreateModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    try {
      await api.post('/users', formData);
      setCreateModalOpen(false);
      fetchUsers();
    } catch (err) {
      setActionError(err.message || 'Gagal mendaftarkan pengguna baru.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${userId}/status`, { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    } catch (err) {
      alert('Gagal mengubah status: ' + (err.message || 'Akses ditolak'));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/users/${resetModalUser.id}/reset-password`, { new_password: newPassword });
      alert(`Password untuk ${resetModalUser.nama} berhasil direset.`);
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      setActionError(err.message || 'Gagal mereset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <ShieldCheck size={14} />
            <span>Otoritas Manajemen Bertingkat</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Manajemen Pengguna</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pengelolaan akun warga dan aparatur lingkungan sesuai lingkup wewenang Anda ({ROLE_DISPLAY[currentUserRole]?.label || currentUserRole}).
          </p>
        </div>

        {allowedRoles.length > 0 && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary/90 shadow-sm transition-all"
          >
            <UserPlus size={16} />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama atau NIK/username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-on-surface-variant" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={15} className="text-on-surface-variant hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Peran</option>
            {allowedRoles.map(r => (
              <option key={r} value={r}>{ROLE_DISPLAY[r]?.label || r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-on-surface-variant">Memuat daftar pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <Users className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
            <p className="text-sm font-bold text-on-surface">Tidak ada pengguna ditemukan</p>
            <p className="text-xs text-on-surface-variant">Gunakan filter pencarian lain atau tambahkan pengguna baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-bold">
                  <th className="p-3.5">Nama Pengguna</th>
                  <th className="p-3.5">Username / NIK</th>
                  <th className="p-3.5">Peran (Role)</th>
                  <th className="p-3.5">Wilayah</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Didaftarkan Oleh</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-on-surface">
                {users.map((u) => {
                  const roleMeta = ROLE_DISPLAY[u.role] || { label: u.role, bg: 'bg-slate-100 text-slate-800' };
                  return (
                    <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="p-3.5 font-bold text-on-surface">{u.nama}</td>
                      <td className="p-3.5 font-mono text-on-surface-variant">{u.username}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleMeta.bg}`}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.rw ? `RW ${u.rw}` : '-'} {u.rt ? `/ RT ${u.rt}` : ''}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3.5 text-on-surface-variant text-[11px]">{u.created_by_name || 'Sistem Master'}</td>
                      <td className="p-3.5 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => { setActionError(null); setNewPassword(''); setResetModalUser(u); }}
                          className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <KeyRound size={12} /> Reset
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah Pengguna Baru */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-on-surface">Daftarkan Pengguna Baru</h2>
                    <p className="text-[11px] text-on-surface-variant">Buat akun bawahan dalam otoritas wilayah Anda</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{actionError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Peran (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {allowedRoles.map(r => (
                      <option key={r} value={r}>{ROLE_DISPLAY[r]?.label || r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {formData.role === 'warga' ? 'NIK Warga (16 digit)' : 'Username Akun'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={formData.role === 'warga' ? 'Contoh: 3273010203850003' : 'Contoh: rt002rw001'}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Password Awal</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Wilayah RW</label>
                    <input
                      type="text"
                      placeholder="001"
                      disabled={['ketua_rw', 'admin_rw', 'ketua_rt'].includes(currentUserRole)}
                      value={formData.rw}
                      onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface font-mono disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Wilayah RT</label>
                    <input
                      type="text"
                      placeholder="001"
                      disabled={currentUserRole === 'ketua_rt'}
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface font-mono disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary/90 inline-flex items-center gap-2"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Simpan Pengguna</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Reset Password */}
      <AnimatePresence>
        {resetModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated w-full max-w-sm overflow-hidden"
            >
              <div className="p-5 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  <h3 className="text-xs font-bold text-on-surface">Reset Password Pengguna</h3>
                </div>
                <button onClick={() => setResetModalUser(null)}>
                  <X size={16} className="text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="p-5 space-y-4">
                <p className="text-xs text-on-surface-variant">
                  Masukkan password baru untuk akun <strong>{resetModalUser.nama}</strong> ({resetModalUser.username}).
                </p>

                {actionError && (
                  <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{actionError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary/90 inline-flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
