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
  Edit2,
  Save,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  BadgeCheck,
  RefreshCw,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MaskedField from '../components/MaskedField';

// Standardized Soft Sky Blue Civic Utility Role Meta
const ROLE_DISPLAY = {
  superadmin: { 
    label: 'Super Admin (Diskominfo)', 
    category: 'aparatur',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' 
  },
  walikota: { 
    label: 'Walikota / Pimpinan Kota', 
    category: 'aparatur',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' 
  },
  camat: { 
    label: 'Camat Wilayah', 
    category: 'aparatur',
    badge: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' 
  },
  lurah: { 
    label: 'Lurah (Kepala Kelurahan)', 
    category: 'aparatur',
    badge: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' 
  },
  admin_kelurahan: { 
    label: 'Admin Kelurahan', 
    category: 'aparatur',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' 
  },
  admin: { 
    label: 'Admin Kelurahan', 
    category: 'aparatur',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' 
  },
  staf_kelurahan: { 
    label: 'Staf Kelurahan', 
    category: 'aparatur',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' 
  },
  admin_rw: { 
    label: 'Admin RW', 
    category: 'rtrw',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' 
  },
  ketua_rw: { 
    label: 'Ketua RW', 
    category: 'rtrw',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
  },
  ketua_rt: { 
    label: 'Ketua RT', 
    category: 'rtrw',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
  },
  kader_posyandu: { 
    label: 'Kader Posyandu', 
    category: 'posyandu',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' 
  },
  warga: { 
    label: 'Warga Terdaftar', 
    category: 'warga',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
  }
};

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua Pengguna' },
  { id: 'aparatur', label: 'Aparatur & Pimpinan' },
  { id: 'rtrw', label: 'Pengurus RT & RW' },
  { id: 'posyandu', label: 'Kader Posyandu' },
  { id: 'warga', label: 'Warga Terdaftar' },
];

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab and Filters
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [rwFilter, setRwFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Government Profile State (Kelurahan, Lurah, Camat, Walikota)
  const [govProfile, setGovProfile] = useState(() => {
    const saved = localStorage.getItem('bw_gov_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      nama_kelurahan: 'Kebonjati',
      nama_kecamatan: 'Sukabumi',
      nama_kota: 'Kota Sukabumi',
      nama_lurah: 'Drs. H. Mulyadi, M.Si',
      nip_lurah: '19740512 199903 1 002',
      nama_camat: 'Drs. H. Hendra, M.Si',
      nip_camat: '19680914 199402 1 001',
      nama_walikota: 'H. Achmad Fahmi, S.Ag, M.M.Pd',
      wilayah_binaan: 'RW 001 s.d RW 006'
    };
  });
  const [govModalOpen, setGovModalOpen] = useState(false);
  const [govForm, setGovForm] = useState(govProfile);
  const [savingGov, setSavingGov] = useState(false);

  // Form State for Create
  const [createForm, setCreateForm] = useState({
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

  // Form State for Edit
  const [editForm, setEditForm] = useState({
    nama: '',
    username: '',
    role: '',
    status: 'active',
    rt: '',
    rw: '',
    nama_posyandu: '',
    jabatan: '',
    nomor_sk: '',
    new_password: ''
  });

  const currentUserRole = user?.role === 'admin' ? 'admin_kelurahan' : user?.role;

  // Allowed roles that current user can create / assign
  const getAllowedRolesToCreate = () => {
    if (currentUserRole === 'superadmin') {
      return ['walikota', 'camat', 'lurah', 'admin_kelurahan', 'staf_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'kader_posyandu', 'warga'];
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
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setActionError(err.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered RW list for dropdown
  const availableRws = useMemo(() => {
    const rws = new Set();
    users.forEach(u => {
      if (u.rw) rws.add(u.rw);
    });
    return Array.from(rws).sort();
  }, [users]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const aparatur = users.filter(u => ['superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin', 'staf_kelurahan'].includes(u.role)).length;
    const rtrw = users.filter(u => ['ketua_rw', 'admin_rw', 'ketua_rt'].includes(u.role)).length;
    const posyandu = users.filter(u => u.role === 'kader_posyandu').length;
    const warga = users.filter(u => u.role === 'warga').length;
    return { total, active, aparatur, rtrw, posyandu, warga };
  }, [users]);

  // Tab count lookup
  const tabCounts = useMemo(() => ({
    all: stats.total,
    aparatur: stats.aparatur,
    rtrw: stats.rtrw,
    posyandu: stats.posyandu,
    warga: stats.warga
  }), [stats]);

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // 1. Category Tab Filter
      if (activeTab === 'aparatur' && !['superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin', 'staf_kelurahan'].includes(u.role)) return false;
      if (activeTab === 'rtrw' && !['ketua_rw', 'admin_rw', 'ketua_rt'].includes(u.role)) return false;
      if (activeTab === 'posyandu' && u.role !== 'kader_posyandu') return false;
      if (activeTab === 'warga' && u.role !== 'warga') return false;

      // 2. Specific Role Filter
      if (roleFilter && u.role !== roleFilter) return false;

      // 3. Status Filter
      if (statusFilter && u.status !== statusFilter) return false;

      // 4. RW Filter
      if (rwFilter && u.rw !== rwFilter) return false;

      // 5. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchNama = (u.nama || '').toLowerCase().includes(q);
        const matchUsername = (u.username || '').toLowerCase().includes(q);
        const matchPosyandu = (u.nama_posyandu || '').toLowerCase().includes(q);
        const matchJabatan = (u.jabatan || '').toLowerCase().includes(q);
        const matchSK = (u.nomor_sk || '').toLowerCase().includes(q);
        return matchNama || matchUsername || matchPosyandu || matchJabatan || matchSK;
      }

      return true;
    });
  }, [users, activeTab, roleFilter, statusFilter, rwFilter, search]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setActionError(null);
    const defaultRole = allowedRoles[0] || 'warga';
    setCreateForm({
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

  // Submit Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    try {
      const res = await api.post('/users', createForm);
      setCreateModalOpen(false);
      setActionSuccess(res.message || `Pengguna '${createForm.nama}' berhasil didaftarkan.`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchUsers();
    } catch (err) {
      setActionError(err.message || 'Gagal mendaftarkan pengguna baru.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (targetUser) => {
    setActionError(null);
    setEditUser(targetUser);
    setEditForm({
      nama: targetUser.nama || '',
      username: targetUser.username || '',
      role: targetUser.role || 'warga',
      status: targetUser.status || 'active',
      rt: targetUser.rt || '',
      rw: targetUser.rw || '',
      nama_posyandu: targetUser.nama_posyandu || '',
      jabatan: targetUser.jabatan || '',
      nomor_sk: targetUser.nomor_sk || '',
      new_password: ''
    });
    // If detail modal was open, close it
    setDetailUser(null);
  };

  // Submit Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setActionError(null);
    setSubmitting(true);
    try {
      const payload = {
        nama: editForm.nama,
        username: editForm.username,
        role: editForm.role,
        status: editForm.status,
        rt: editForm.rt,
        rw: editForm.rw,
        nama_posyandu: editForm.nama_posyandu,
        jabatan: editForm.jabatan,
        nomor_sk: editForm.nomor_sk
      };
      if (editForm.new_password && editForm.new_password.trim().length >= 6) {
        payload.password = editForm.new_password.trim();
      }
      
      const res = await api.put(`/users/${editUser.id}`, payload);
      setEditUser(null);
      setActionSuccess(res.message || `Data pengguna '${editForm.nama}' berhasil diperbarui.`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchUsers();
    } catch (err) {
      setActionError(err.message || 'Gagal memperbarui data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setActionError(null);
    setSubmitting(true);
    try {
      const res = await api.delete(`/users/${deleteUser.id}`);
      setDeleteUser(null);
      setDetailUser(null);
      setActionSuccess(res.message || `Pengguna '${deleteUser.nama}' berhasil dihapus.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    } catch (err) {
      setActionError(err.message || 'Gagal menghapus pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${userId}/status`, { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      if (detailUser && detailUser.id === userId) {
        setDetailUser(prev => ({ ...prev, status: nextStatus }));
      }
      setActionSuccess(`Status pengguna berhasil diubah menjadi ${nextStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert('Gagal mengubah status: ' + (err.message || 'Akses ditolak'));
    }
  };

  // Reset Password Action
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/users/${resetModalUser.id}/reset-password`, { new_password: newPassword });
      setActionSuccess(`Password untuk ${resetModalUser.nama} berhasil diperbarui.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      setActionError(err.message || 'Gagal mereset password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Government Profile
  const handleSaveGovProfile = (e) => {
    e.preventDefault();
    setSavingGov(true);
    setGovProfile(govForm);
    localStorage.setItem('bw_gov_profile', JSON.stringify(govForm));
    setSavingGov(false);
    setGovModalOpen(false);
    setActionSuccess(`Profil Wilayah & Pejabat Kelurahan ${govForm.nama_kelurahan} berhasil disimpan.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Wilayah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 text-xs font-semibold mb-2 border border-sky-200 dark:border-sky-800">
            <ShieldCheck size={14} className="text-sky-600 dark:text-sky-400" />
            <span>Otoritas Tata Kelola Bertingkat & Wilayah Kerja</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Pengguna & Penugasan Role</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengelolaan aparatur RT/RW, staf kelurahan, kader posyandu, dan warga sesuai prinsip perlindungan data (UU PDP No. 27/2022).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['superadmin', 'admin', 'admin_kelurahan', 'lurah'].includes(currentUserRole) && (
            <button
              onClick={() => {
                setGovForm(govProfile);
                setGovModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Building2 size={16} />
              <span>Profil Wilayah & Pejabat</span>
            </button>
          )}
          {allowedRoles.length > 0 && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-700 shadow-sm transition-colors"
            >
              <UserPlus size={16} />
              <span>Tambah Pengguna Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Alerts (Success / Error) */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Profil Wilayah & Pejabat Eksekutif Banner (Soft Sky Blue Civic Palette) */}
      <div className="p-5 bg-slate-900 rounded-2xl text-white border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-sky-950/80 rounded-xl text-sky-400 border border-sky-800/60 shrink-0">
            <Building2 size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-300 tracking-wider uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                Pemerintahan Daerah & Wilayah Binaan
              </span>
              <span className="text-xs text-sky-200">
                {govProfile.wilayah_binaan}
              </span>
            </div>
            <h4 className="text-base font-bold text-white">
              Kelurahan {govProfile.nama_kelurahan}, Kec. {govProfile.nama_kecamatan}, {govProfile.nama_kota}
            </h4>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
              <span>Lurah: <strong className="text-white">{govProfile.nama_lurah}</strong> <span className="text-[10px] text-slate-400 font-mono">({govProfile.nip_lurah})</span></span>
              <span>&bull; Camat: <strong className="text-white">{govProfile.nama_camat}</strong></span>
              <span>&bull; Walikota: <strong className="text-white">{govProfile.nama_walikota}</strong></span>
            </div>
          </div>
        </div>
        {['superadmin', 'admin', 'admin_kelurahan', 'lurah'].includes(currentUserRole) && (
          <button
            onClick={() => {
              setGovForm(govProfile);
              setGovModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <Edit2 size={14} /> Edit Pejabat & Wilayah
          </button>
        )}
      </div>

      {/* Bento Grid Analytics Pengguna */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento 1: Total Pengguna */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Pengguna</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stats.active} akun aktif dalam yurisdiksi
            </p>
          </div>
        </div>

        {/* Bento 2: Aparatur Kelurahan */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aparatur & Pimpinan</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.aparatur}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Lurah, Staf & Pejabat Wilayah</p>
          </div>
        </div>

        {/* Bento 3: Pengurus RT & RW */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pengurus RT & RW</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <Home size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.rtrw}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Verifikator akar rumput di RW/RT</p>
          </div>
        </div>

        {/* Bento 4: Kader Posyandu */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kader Posyandu</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
              <HeartPulse size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.posyandu}</div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">Pencatatan Balita & Lansia</p>
          </div>
        </div>
      </div>

      {/* Structured Category Tabs & Clean Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Row 1: Category Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setRoleFilter(''); // reset specific role when switching category tab
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-sky-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Search Input and Secondary Granular Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama, NIK, username, SK, posyandu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Specific Role Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Semua Peran Spesifik</option>
              {Object.keys(ROLE_DISPLAY).map((r) => (
                <option key={r} value={r}>{ROLE_DISPLAY[r].label}</option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* RW Dropdown (if multiple RWs available) */}
            {availableRws.length > 0 && (
              <select
                value={rwFilter}
                onChange={(e) => setRwFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Semua RW</option>
                {availableRws.map((rw) => (
                  <option key={rw} value={rw}>RW {rw}</option>
                ))}
              </select>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              title="Segarkan data pengguna"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs text-slate-500">Memuat daftar pengguna & hak akses...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Tidak ada pengguna yang cocok</p>
            <p className="text-xs text-slate-500">Gunakan filter pencarian lain atau tambahkan akun baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="p-3.5">Nama & Jabatan</th>
                  <th className="p-3.5">Username / NIK</th>
                  <th className="p-3.5">Peran (Role)</th>
                  <th className="p-3.5">Wilayah Kerja / Posko</th>
                  <th className="p-3.5">SK / Penugasan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Aksi Pengelolaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                {filteredUsers.map((u) => {
                  const roleMeta = ROLE_DISPLAY[u.role] || { 
                    label: u.role, 
                    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300' 
                  };
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <button
                          onClick={() => setDetailUser(u)}
                          className="font-bold text-slate-900 dark:text-white text-left hover:text-sky-600 transition"
                        >
                          {u.nama}
                        </button>
                        {u.jabatan && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{u.jabatan}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {u.role === 'warga' || (u.username && u.username.length === 16) ? (
                          <MaskedField value={u.username} type="nik" />
                        ) : (
                          u.username
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleMeta.badge}`}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.role === 'kader_posyandu' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-medium text-[11px] border border-rose-200 dark:border-rose-900">
                            <HeartPulse size={13} />
                            <span>{u.nama_posyandu || 'Posyandu Wilayah'} {u.rw ? `(RW ${u.rw})` : ''}</span>
                          </div>
                        ) : u.role === 'staf_kelurahan' || ['lurah', 'admin_kelurahan', 'admin'].includes(u.role) ? (
                          <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                            <Building2 size={13} className="text-sky-600" />
                            <span>Kantor Kelurahan</span>
                          </div>
                        ) : (
                          <div className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {u.rw ? `RW ${u.rw}` : '-'} {u.rt ? `/ RT ${u.rt}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                        {u.nomor_sk ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                            <Award size={11} className="text-amber-500" /> {u.nomor_sk}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Detail Button */}
                          <button
                            onClick={() => setDetailUser(u)}
                            title="Lihat Detail Pengguna"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700 transition"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit Data Pengguna"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-slate-700 transition"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            title={u.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            className={`p-1.5 rounded-lg transition ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}
                          >
                            {u.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => { setActionError(null); setNewPassword(''); setResetModalUser(u); }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700 transition"
                          >
                            <KeyRound size={13} />
                          </button>

                          {/* Delete Button (Danger) */}
                          <button
                            onClick={() => { setActionError(null); setDeleteUser(u); }}
                            title="Hapus Akun Pengguna"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. MODAL: READ / LIHAT DETAIL PENGGUNA                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {detailUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Detail Profil & Penugasan Pengguna</h2>
                    <p className="text-[11px] text-slate-500">ID Akun: #{detailUser.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDetailUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* User Header Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{detailUser.nama}</h3>
                    <p className="font-mono text-slate-500 mt-0.5">
                      Username: {detailUser.role === 'warga' || (detailUser.username && detailUser.username.length === 16) ? (
                        <MaskedField value={detailUser.username} type="nik" />
                      ) : (
                        detailUser.username
                      )}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      ROLE_DISPLAY[detailUser.role]?.badge || 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {ROLE_DISPLAY[detailUser.role]?.label || detailUser.role}
                    </span>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        detailUser.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${detailUser.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {detailUser.status === 'active' ? 'Status: Aktif' : 'Status: Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Wilayah Rukun Warga</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {detailUser.rw ? `RW ${detailUser.rw}` : 'Seluruh Wilayah Kelurahan'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Wilayah Rukun Tetangga</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {detailUser.rt ? `RT ${detailUser.rt}` : 'Seluruh RT di RW'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Posko / Posyandu</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {detailUser.nama_posyandu || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Jabatan Formal</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {detailUser.jabatan || '-'}
                    </p>
                  </div>
                </div>

                {/* SK & Legalitas */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Nomor SK Penetapan / Masa Bakti</span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {detailUser.nomor_sk || 'Belum ada SK terdaftar'}
                  </p>
                </div>

                {/* Audit Trail */}
                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Terdaftar pada: {detailUser.created_at ? new Date(detailUser.created_at).toLocaleString('id-ID') : '-'}</span>
                  </div>
                  {detailUser.created_by && (
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck size={13} />
                      <span>ID Pembuat / Pendaftar Akun: #{detailUser.created_by}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const userToDel = detailUser;
                      setDetailUser(null);
                      setDeleteUser(userToDel);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1.5 transition"
                  >
                    <Trash2 size={13} /> Hapus Akun
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const userToReset = detailUser;
                        setDetailUser(null);
                        setResetModalUser(userToReset);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 inline-flex items-center gap-1.5 transition"
                    >
                      <KeyRound size={13} /> Reset Password
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(detailUser)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Edit2 size={13} /> Edit Data
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. MODAL: CREATE / TAMBAH PENGGUNA BARU                   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftarkan Akun & Penugasan Wilayah</h2>
                    <p className="text-[11px] text-slate-500">Konfigurasi akun aparatur atau warga dalam yurisdiksi Anda</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Peran Akun (Role)</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {allowedRoles.map(r => (
                      <option key={r} value={r}>{ROLE_DISPLAY[r]?.label || r}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {createForm.role === 'warga' ? 'NIK Warga (16 digit)' : 'Username Akun'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={createForm.role === 'warga' ? '3273010203850003' : 'Contoh: rt02_rw01 / posyandu_melati'}
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Siti Nurhaliza, S.Tr.Keb"
                      value={createForm.nama}
                      onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Password Awal Akun</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Conditional Fields based on Role */}
                {createForm.role === 'kader_posyandu' && (
                  <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                      <HeartPulse size={14} />
                      <span>Unit Posko Posyandu & Wilayah Binaan</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Unit Posyandu / Posko</label>
                      <input
                        type="text"
                        placeholder="Contoh: Posyandu Melati 01"
                        value={createForm.nama_posyandu}
                        onChange={(e) => setCreateForm({ ...createForm, nama_posyandu: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}

                {createForm.role === 'staf_kelurahan' && (
                  <div className="p-3 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300">
                      <Building2 size={14} />
                      <span>Seksi & Jabatan Penugasan Kelurahan</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Seksi / Jabatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Seksi Pelayanan Publik & Kependudukan"
                        value={createForm.jabatan}
                        onChange={(e) => setCreateForm({ ...createForm, jabatan: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}

                {/* Wilayah RT & RW */}
                {['ketua_rw', 'admin_rw', 'ketua_rt', 'kader_posyandu', 'warga'].includes(createForm.role) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Wilayah RW Binaan</label>
                      <input
                        type="text"
                        placeholder="Contoh: 001"
                        disabled={['ketua_rw', 'admin_rw', 'ketua_rt'].includes(currentUserRole)}
                        value={createForm.rw}
                        onChange={(e) => setCreateForm({ ...createForm, rw: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Wilayah RT</label>
                      <input
                        type="text"
                        placeholder={createForm.role === 'ketua_rw' ? 'Semua RT' : 'Contoh: 001'}
                        disabled={currentUserRole === 'ketua_rt' || createForm.role === 'ketua_rw'}
                        value={createForm.rt}
                        onChange={(e) => setCreateForm({ ...createForm, rt: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* Nomor SK */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Nomor SK Penetapan / Catatan Penugasan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SK Lurah No. 140/09/2026 / Masa Bakti 2024-2029"
                    value={createForm.nomor_sk}
                    onChange={(e) => setCreateForm({ ...createForm, nomor_sk: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-2 shadow-sm"
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

      {/* ========================================================= */}
      {/* 3. MODAL: UPDATE / EDIT PENGGUNA LENGKAP                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Edit2 size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit Data & Penugasan Pengguna</h2>
                    <p className="text-[11px] text-slate-500">Memperbarui informasi akun #{editUser.id} ({editUser.nama})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditUser(null)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-5 space-y-4">
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={editForm.nama}
                      onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Username / NIK</label>
                    <input
                      type="text"
                      required
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Peran (Role)</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      disabled={currentUserRole !== 'superadmin' && currentUserRole !== 'lurah' && currentUserRole !== 'admin_kelurahan'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                    >
                      {Object.keys(ROLE_DISPLAY).map((r) => (
                        <option key={r} value={r}>{ROLE_DISPLAY[r].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Status Akun</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="active">Aktif (Dapat Login)</option>
                      <option value="inactive">Nonaktif (Akses Dinonaktifkan)</option>
                    </select>
                  </div>
                </div>

                {/* Wilayah RT & RW */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Wilayah RW</label>
                    <input
                      type="text"
                      placeholder="Contoh: 001"
                      value={editForm.rw}
                      onChange={(e) => setEditForm({ ...editForm, rw: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Wilayah RT</label>
                    <input
                      type="text"
                      placeholder="Contoh: 001"
                      value={editForm.rt}
                      onChange={(e) => setEditForm({ ...editForm, rt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Nama Posyandu & Jabatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Nama Posyandu / Posko</label>
                    <input
                      type="text"
                      placeholder="Contoh: Posyandu Melati 01"
                      value={editForm.nama_posyandu}
                      onChange={(e) => setEditForm({ ...editForm, nama_posyandu: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Jabatan Formal / Seksi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kepala Seksi Tata Praja"
                      value={editForm.jabatan}
                      onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Nomor SK */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Nomor SK Penetapan / Catatan Penugasan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SK Lurah No. 140/09/2026"
                    value={editForm.nomor_sk}
                    onChange={(e) => setEditForm({ ...editForm, nomor_sk: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Optional Change Password */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Ganti Password (Opsional)
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    value={editForm.new_password}
                    onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-2 shadow-sm"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. MODAL: DELETE / HAPUS PENGGUNA (CONFIRMATION)          */}
      {/* ========================================================= */}
      <AnimatePresence>
        {deleteUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Trash2 size={16} />
                  </div>
                  <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">Konfirmasi Hapus Akun</h2>
                </div>
                <button 
                  onClick={() => setDeleteUser(null)}
                  className="p-1 rounded-md text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun pengguna berikut secara permanen?
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{deleteUser.nama}</div>
                  <div className="font-mono text-slate-500">Username/NIK: {deleteUser.username}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Peran: <strong className="text-slate-800 dark:text-slate-200">{ROLE_DISPLAY[deleteUser.role]?.label || deleteUser.role}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  <strong>Catatan Integritas Data:</strong> Akun autentikasi akan dihapus. Jika akun ini terhubung dengan data master warga, keterhubungan akun akan dilepas secara aman tanpa menghapus riwayat kependudukan.
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-2 shadow-sm"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Ya, Hapus Akun Ini</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. MODAL: EDIT PROFIL WILAYAH & PEJABAT PEMERINTAHAN      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {govModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Profil Wilayah & Pejabat Eksekutif</h3>
                    <p className="text-[11px] text-slate-500">Konfigurasi nama kelurahan, kecamatan, kota, lurah, camat, dan walikota</p>
                  </div>
                </div>
                <button
                  onClick={() => setGovModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveGovProfile} className="space-y-3.5">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Kelurahan</label>
                    <input
                      type="text"
                      value={govForm.nama_kelurahan}
                      onChange={(e) => setGovForm({ ...govForm, nama_kelurahan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={govForm.nama_kecamatan}
                      onChange={(e) => setGovForm({ ...govForm, nama_kecamatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Kota / Kab.</label>
                    <input
                      type="text"
                      value={govForm.nama_kota}
                      onChange={(e) => setGovForm({ ...govForm, nama_kota: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lurah</label>
                    <input
                      type="text"
                      value={govForm.nama_lurah}
                      onChange={(e) => setGovForm({ ...govForm, nama_lurah: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">NIP Lurah</label>
                    <input
                      type="text"
                      value={govForm.nip_lurah}
                      onChange={(e) => setGovForm({ ...govForm, nip_lurah: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Camat</label>
                    <input
                      type="text"
                      value={govForm.nama_camat}
                      onChange={(e) => setGovForm({ ...govForm, nama_camat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">NIP Camat</label>
                    <input
                      type="text"
                      value={govForm.nip_camat}
                      onChange={(e) => setGovForm({ ...govForm, nip_camat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Walikota / Pj. Walikota</label>
                  <input
                    type="text"
                    value={govForm.nama_walikota}
                    onChange={(e) => setGovForm({ ...govForm, nama_walikota: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Cakupan Wilayah Binaan RW</label>
                  <input
                    type="text"
                    value={govForm.wilayah_binaan}
                    onChange={(e) => setGovForm({ ...govForm, wilayah_binaan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setGovModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingGov}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={14} /> Simpan Profil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 6. MODAL: RESET PASSWORD                                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {resetModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-sky-600" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Reset Password Pengguna</h3>
                </div>
                <button onClick={() => setResetModalUser(null)}>
                  <X size={16} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="p-5 space-y-4">
                <p className="text-xs text-slate-500">
                  Masukkan password baru untuk akun <strong>{resetModalUser.nama}</strong> ({resetModalUser.username}).
                </p>

                {actionError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {actionError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1.5 shadow-sm"
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
