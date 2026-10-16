import { useState, useEffect, useMemo } from 'react';
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
  Filter,
  HeartPulse,
  Building2,
  Home,
  Award,
  Sparkles,
  Baby
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_DISPLAY = {
  superadmin: { label: 'Super Admin (Diskominfo)', bg: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
  walikota: { label: 'Walikota / Pimpinan Kota', bg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300' },
  camat: { label: 'Camat Wilayah', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
  lurah: { label: 'Lurah (Kepala Kelurahan)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300' },
  admin_kelurahan: { label: 'Admin Kelurahan', bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
  admin: { label: 'Admin Kelurahan', bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
  staf_kelurahan: { label: 'Staf Kelurahan', bg: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300' },
  admin_rw: { label: 'Admin RW', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300' },
  ketua_rw: { label: 'Ketua RW', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ketua_rt: { label: 'Ketua RT', bg: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300' },
  kader_posyandu: { label: 'Kader Posyandu', bg: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300' },
  warga: { label: 'Warga Terdaftar', bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' }
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
    rw: '',
    nama_posyandu: '',
    jabatan: '',
    nomor_sk: ''
  });

  const currentUserRole = user?.role === 'admin' ? 'admin_kelurahan' : user?.role;

  // Determine allowed sub-roles that current user can create
  const getAllowedRolesToCreate = () => {
    if (currentUserRole === 'superadmin') {
      return ['admin_kelurahan', 'staf_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga'];
    }
    if (currentUserRole === 'admin_kelurahan' || currentUserRole === 'lurah') {
      return ['staf_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga'];
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
    const defaultRole = allowedRoles[0] || 'warga';
    setFormData({
      username: '',
      password: '',
      nama: '',
      role: defaultRole,
      rt: currentUserRole === 'ketua_rt' ? user?.rt || '001' : '',
      rw: ['ketua_rw', 'admin_rw', 'ketua_rt'].includes(currentUserRole) ? user?.rw || '001' : '',
      nama_posyandu: '',
      jabatan: '',
      nomor_sk: ''
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

  // Bento Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const aparatur = users.filter(u => ['lurah', 'admin_kelurahan', 'admin', 'staf_kelurahan'].includes(u.role)).length;
    const rtrw = users.filter(u => ['ketua_rw', 'admin_rw', 'ketua_rt'].includes(u.role)).length;
    const posyandu = users.filter(u => u.role === 'kader_posyandu').length;
    const warga = users.filter(u => u.role === 'warga').length;
    return { total, active, aparatur, rtrw, posyandu, warga };
  }, [users]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Wilayah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <ShieldCheck size={14} />
            <span>Otoritas Tata Kelola Bertingkat & Wilayah Kerja</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Manajemen Pengguna & Penugasan Role</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pengelolaan aparatur RT/RW, staf kelurahan, kader posyandu, dan warga sesuai prinsip perlindungan data (UU PDP No. 27/2022).
          </p>
        </div>

        {allowedRoles.length > 0 && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary/90 shadow-sm transition-all"
          >
            <UserPlus size={16} />
            <span>Tambah Akun & Wilayah</span>
          </button>
        )}
      </div>

      {/* Bento Grid Analytics Pengguna */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento 1: Total Pengguna */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Pengguna</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {stats.active} akun aktif dalam lingkup
            </p>
          </div>
        </div>

        {/* Bento 2: Aparatur Kelurahan */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Aparatur Kelurahan</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">{stats.aparatur}</div>
            <p className="text-[11px] text-on-surface-variant mt-1">Lurah, Admin & Staf Operasional</p>
          </div>
        </div>

        {/* Bento 3: Pengurus RT & RW */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Ketua RT & RW</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
              <Home size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">{stats.rtrw}</div>
            <p className="text-[11px] text-on-surface-variant mt-1">Verifikator akar rumput di wilayah</p>
          </div>
        </div>

        {/* Bento 4: Kader Posyandu */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Kader Posyandu</span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 flex items-center justify-center">
              <HeartPulse size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">{stats.posyandu}</div>
            <p className="text-[11px] text-pink-600 font-medium mt-1">Pencatatan Balita & Lansia</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Quick Selector */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Cari nama, NIK, username, atau posyandu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-on-surface-variant" />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === '' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Semua Peran ({stats.total})
            </button>
            <button
              onClick={() => setRoleFilter('kader_posyandu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'kader_posyandu' ? 'bg-pink-600 text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Kader Posyandu ({stats.posyandu})
            </button>
            <button
              onClick={() => setRoleFilter('ketua_rt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'ketua_rt' ? 'bg-teal-600 text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Ketua RT
            </button>
            <button
              onClick={() => setRoleFilter('ketua_rw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'ketua_rw' ? 'bg-emerald-600 text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Ketua RW
            </button>
            <button
              onClick={() => setRoleFilter('staf_kelurahan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'staf_kelurahan' ? 'bg-sky-600 text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Staf Kelurahan
            </button>
            <button
              onClick={() => setRoleFilter('warga')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === 'warga' ? 'bg-slate-700 text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Warga ({stats.warga})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-on-surface-variant">Memuat daftar pengguna & hak akses...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <Users className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
            <p className="text-sm font-bold text-on-surface">Tidak ada pengguna ditemukan</p>
            <p className="text-xs text-on-surface-variant">Gunakan filter pencarian lain atau tambahkan akun baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-bold">
                  <th className="p-3.5">Nama & Jabatan</th>
                  <th className="p-3.5">Username / NIK</th>
                  <th className="p-3.5">Peran (Role)</th>
                  <th className="p-3.5">Wilayah Kerja / Posko</th>
                  <th className="p-3.5">SK / Penugasan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-on-surface">
                {users.map((u) => {
                  const roleMeta = ROLE_DISPLAY[u.role] || { label: u.role, bg: 'bg-slate-100 text-slate-800' };
                  return (
                    <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-on-surface">{u.nama}</div>
                        {u.jabatan && (
                          <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">{u.jabatan}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-on-surface-variant">{u.username}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleMeta.bg}`}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.role === 'kader_posyandu' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 font-medium text-[11px]">
                            <HeartPulse size={13} />
                            <span>{u.nama_posyandu || 'Posyandu Wilayah'} {u.rw ? `(RW ${u.rw})` : ''}</span>
                          </div>
                        ) : u.role === 'staf_kelurahan' ? (
                          <div className="inline-flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                            <Building2 size={13} />
                            <span>Kantor Kelurahan</span>
                          </div>
                        ) : (
                          <div className="text-on-surface text-[11px] font-medium">
                            {u.rw ? `RW ${u.rw}` : '-'} {u.rt ? `/ RT ${u.rt}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-on-surface-variant text-[11px]">
                        {u.nomor_sk ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-mono">
                            <Award size={11} /> {u.nomor_sk}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => { setActionError(null); setNewPassword(''); setResetModalUser(u); }}
                          className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
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

      {/* Modal: Tambah Pengguna Baru & Wilayah Penugasan */}
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
                    <h2 className="text-sm font-bold text-on-surface">Daftarkan Akun & Penugasan Wilayah</h2>
                    <p className="text-[11px] text-on-surface-variant">Konfigurasi akun aparatur atau warga dalam yurisdiksi Anda</p>
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
                  <label className="block text-xs font-semibold text-on-surface mb-1">Peran Akun (Role)</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      {formData.role === 'warga' ? 'NIK Warga (16 digit)' : 'Username Akun'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={formData.role === 'warga' ? '3273010203850003' : 'Contoh: rt02_rw01 / posyandu_melati'}
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
                      placeholder="Contoh: Siti Nurhaliza, S.Tr.Keb"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Password Awal Akun</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter (dapat diganti oleh pengguna saat login)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Conditional Fields based on Role */}
                {formData.role === 'kader_posyandu' && (
                  <div className="p-3 bg-pink-50/70 dark:bg-pink-900/10 rounded-xl border border-pink-200/60 dark:border-pink-900/40 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-pink-800 dark:text-pink-300">
                      <HeartPulse size={14} />
                      <span>Unit Posko Posyandu & Wilayah Binaan</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">Nama Unit Posyandu / Posko</label>
                      <input
                        type="text"
                        placeholder="Contoh: Posyandu Melati 01 / Posyandu Mawar Indah"
                        value={formData.nama_posyandu}
                        onChange={(e) => setFormData({ ...formData, nama_posyandu: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'staf_kelurahan' && (
                  <div className="p-3 bg-sky-50/70 dark:bg-sky-900/10 rounded-xl border border-sky-200/60 dark:border-sky-900/40 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300">
                      <Building2 size={14} />
                      <span>Seksi & Jabatan Penugasan Kelurahan</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface mb-1">Nama Seksi / Jabatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Seksi Pelayanan Publik & Kependudukan"
                        value={formData.jabatan}
                        onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Wilayah RT & RW */}
                {['ketua_rw', 'admin_rw', 'ketua_rt', 'kader_posyandu', 'warga'].includes(formData.role) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Wilayah RW Binaan</label>
                      <input
                        type="text"
                        placeholder="Contoh: 001"
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
                        placeholder={formData.role === 'ketua_rw' ? 'Semua RT' : 'Contoh: 001'}
                        disabled={currentUserRole === 'ketua_rt' || formData.role === 'ketua_rw'}
                        value={formData.rt}
                        onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* Nomor SK / Catatan Masa Bakti */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Nomor SK Penetapan / Catatan Penugasan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SK Lurah No. 140/09/2026 / Masa Bakti 2024-2029"
                    value={formData.nomor_sk}
                    onChange={(e) => setFormData({ ...formData, nomor_sk: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
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
                    <span>Simpan & Aktifkan Pengguna</span>
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
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {actionError}
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
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary/90 inline-flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>Simpan Password</span>
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
