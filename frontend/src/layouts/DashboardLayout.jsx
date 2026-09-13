import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  FileCheck,
  HeartPulse,
  MessageSquareWarning,
  LogOut,
  Menu,
  X,
  User,
  Users,
  ShieldCheck,
  Bell,
  Sparkles,
  UserCheck,
  Gift,
  Award,
  Building2,
  Landmark,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import OfflineIndicator from '../components/OfflineIndicator';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import ForceChangePasswordModal from '../components/ForceChangePasswordModal';

export default function DashboardLayout() {
  const { user, logout, selectProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In-App Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Family Switcher Modal State
  const [familyModalOpen, setFamilyModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const normalizedRole = user?.role === 'admin' ? 'admin_kelurahan' : (user?.role || 'warga');
  const isExecutiveDesktop = ['superadmin', 'walikota', 'camat', 'admin_kelurahan'].includes(normalizedRole);
  const isRT = normalizedRole === 'ketua_rt';
  const isRW = ['ketua_rw', 'admin_rw'].includes(normalizedRole);
  const isPosyandu = normalizedRole === 'kader_posyandu';
  const isWarga = normalizedRole === 'warga';

  // Penentuan Menu Sidebar Berdasarkan Role (Role-Based Access Navigation)
  const getNavItems = () => {
    const items = [
      { name: 'Beranda', path: '/dashboard', icon: <Home size={19} /> }
    ];

    if (isExecutiveDesktop) {
      // Menu Admin Kelurahan & Eksekutif (Dashboard Desktop Profesional)
      items.push(
        { name: 'Command Center Kota', path: '/dashboard/command-center', icon: <Landmark size={19} /> },
        { name: 'Verifikasi Surat Dinas', path: '/dashboard/dokumen', icon: <FileCheck size={19} /> },
        { name: 'Audit & Penyaluran Bansos', path: '/dashboard/bansos', icon: <Gift size={19} /> },
        { name: 'Analisis Kemiskinan (Desil)', path: '/dashboard/desil', icon: <Sparkles size={19} /> },
        { name: 'Pangkalan Data Warga', path: '/dashboard/warga', icon: <User size={19} /> },
        { name: 'Register Kartu Keluarga', path: '/dashboard/kk', icon: <Users size={19} /> },
        { name: 'Monitoring Stunting Posyandu', path: '/dashboard/posyandu', icon: <HeartPulse size={19} /> },
        { name: 'Evaluasi Data & AI', path: '/dashboard/data-maturity', icon: <Award size={19} /> },
        { name: 'Fasilitas & Tata Ruang', path: '/dashboard/daya-dukung', icon: <Building2 size={19} /> },
        { name: 'Pajak Bumi & Bangunan (PBB)', path: '/dashboard/pbb', icon: <FileText size={19} /> },
        { name: 'Pusat Pengaduan Publik', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={19} /> },
        { name: 'Gerbang Pesan WhatsApp', path: '/dashboard/whatsapp', icon: <MessageSquare size={19} /> },
        { name: 'Kelola Hak Akses Pengguna', path: '/dashboard/users', icon: <ShieldCheck size={19} /> }
      );
    } else if (isRT || isRW) {
      // Menu Pengurus RT & RW (Fokus Verifikasi Lingkungan)
      items.push(
        { name: 'Verifikasi Permohonan Surat', path: '/dashboard/dokumen', icon: <FileCheck size={19} /> },
        { name: 'Validasi & Audit Bansos RT/RW', path: '/dashboard/bansos', icon: <Gift size={19} /> },
        { name: 'Pangkalan Data Warga Lingkungan', path: '/dashboard/warga', icon: <User size={19} /> },
        { name: 'Daftar Kartu Keluarga', path: '/dashboard/kk', icon: <Users size={19} /> },
        { name: 'Pemetaan Kemiskinan Lingkungan', path: '/dashboard/desil', icon: <Sparkles size={19} /> },
        { name: 'Laporan Pengaduan Lingkungan', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={19} /> },
        { name: 'Pemantauan Posyandu Lingkungan', path: '/dashboard/posyandu', icon: <HeartPulse size={19} /> }
      );
    } else if (isPosyandu) {
      // Menu Khusus Kader Posyandu
      items.push(
        { name: 'Layanan Balita & Antropometri', path: '/dashboard/posyandu', icon: <HeartPulse size={19} /> },
        { name: 'Pencarian Data Warga/Ibu', path: '/dashboard/warga', icon: <User size={19} /> },
        { name: 'Pemberitahuan & Pengaduan', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={19} /> }
      );
    } else {
      // Menu Warga Masyarakat (Layanan Mandiri Ramah Pengguna)
      items.push(
        { name: 'Pengajuan Surat Mandiri', path: '/dashboard/dokumen', icon: <FileCheck size={19} /> },
        { name: 'Kartu Keluarga Digital', path: '/dashboard/kk', icon: <Users size={19} /> },
        { name: 'Informasi Bantuan Sosial', path: '/dashboard/bansos', icon: <Gift size={19} /> },
        { name: 'Kesehatan Keluarga & Posyandu', path: '/dashboard/posyandu', icon: <HeartPulse size={19} /> },
        { name: 'Lapor Pengaduan Warga', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={19} /> },
        { name: 'Informasi Tagihan PBB', path: '/dashboard/pbb', icon: <FileText size={19} /> }
      );
    }

    // Panduan & SOP Operasional tersedia untuk semua peran
    items.push({ name: 'Panduan & SOP Resmi', path: '/dashboard/panduan', icon: <BookOpen size={19} /> });

    return items;
  };

  const navItems = getNavItems();

  // Bottom navigation khusus mobile untuk user non-eksekutif (Mobile-First)
  const mobileBottomNav = isWarga ? [
    { name: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Surat', path: '/dashboard/dokumen', icon: <FileCheck size={18} /> },
    { name: 'Bansos', path: '/dashboard/bansos', icon: <Gift size={18} /> },
    { name: 'Posyandu', path: '/dashboard/posyandu', icon: <HeartPulse size={18} /> },
    { name: 'SOP', path: '/dashboard/panduan', icon: <BookOpen size={18} /> },
  ] : (isRT || isRW) ? [
    { name: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Surat RT', path: '/dashboard/dokumen', icon: <FileCheck size={18} /> },
    { name: 'Bansos', path: '/dashboard/bansos', icon: <Gift size={18} /> },
    { name: 'Warga', path: '/dashboard/warga', icon: <User size={18} /> },
    { name: 'SOP', path: '/dashboard/panduan', icon: <BookOpen size={18} /> },
  ] : null;

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.allSettled([
        api.get('/notifikasi/me'),
        api.get('/notifikasi/unread-count')
      ]);

      if (listRes.status === 'fulfilled' && listRes.value?.data) {
        setNotifications(listRes.value.data);
      }
      if (countRes.status === 'fulfilled' && countRes.value?.data) {
        setUnreadCount(countRes.value.data.unread || 0);
      }
    } catch (e) {
      console.warn('Gagal memuat notifikasi:', e.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifikasi/mark-all-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, dibaca: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
      case 'walikota':
        return 'Pimpinan Kota';
      case 'camat':
        return 'Pimpinan Kecamatan';
      case 'admin_kelurahan':
      case 'admin':
        return 'Admin Kelurahan';
      case 'lurah':
        return 'Lurah Kebonjati';
      case 'ketua_rw':
      case 'admin_rw':
        return 'Ketua RW';
      case 'ketua_rt':
        return 'Ketua RT';
      case 'kader_posyandu':
        return 'Kader Posyandu';
      case 'warga':
      default:
        return 'Warga Masyarakat';
    }
  };

  const displayName = user?.active_nama || user?.nama || user?.username || 'Pengguna';
  const activeHubungan = user?.active_hubungan || getRoleBadge(user?.role);

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Sidebar Desktop (Dioptimalkan Lebar & Elegan untuk Executive & Admin) */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant flex-shrink-0 z-30 shadow-sm">
        <div className="p-4 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
              <img src="/icon-bumi-warga.png" alt="BW" className="w-full h-full object-contain rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
              <span className="font-bold text-xs hidden only:block">BW</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface leading-tight">Bumi Warga</h2>
              <span className="inline-block text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 mt-0.5">
                {getRoleBadge(user?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigasi Berdasarkan Role */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
                }`
              }
            >
              {item.icon}
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Family Profile Switcher */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {activeHubungan} · {user?.rt ? `RT ${user.rt}/RW ${user.rw}` : 'Bumi Warga'}
              </p>
            </div>
          </div>

          {user?.family_members && user.family_members.length > 1 && (
            <button
              onClick={() => setFamilyModalOpen(true)}
              className="w-full mb-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors border border-sky-200"
            >
              <Sparkles size={13} />
              <span>Ganti Persona Anggota</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-error-container transition-colors border border-error/20"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-20">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-on-surface hover:bg-surface-container"
              aria-label="Buka Menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
                <img src="/icon-bumi-warga.png" alt="BW" className="w-full h-full object-contain rounded-md" onError={(e) => { e.target.style.display = 'none'; }} />
                <span className="font-bold text-xs hidden only:block">BW</span>
              </div>
              <div>
                <span className="text-xs font-extrabold text-on-surface block leading-none">Bumi Warga</span>
                <span className="text-[9px] text-sky-600 font-semibold">Jabar Pintar Digital</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <p className="text-xs text-on-surface-variant font-medium">
              Bumi Warga · Dikembangkan oleh <strong className="text-sky-700 font-semibold">Jabar Pintar Digital</strong>
            </p>
            {user?.active_nama && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                <UserCheck size={12} /> {user.active_nama} ({user.active_hubungan || 'Pengguna'})
              </span>
            )}
          </div>

          {/* Top Right Notifications */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen && unreadCount > 0) markAllRead();
                }}
                className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Pemberitahuan"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-elevated overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-outline-variant flex items-center justify-between">
                      <h4 className="text-xs font-bold text-on-surface">Pemberitahuan Layanan</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-medium">
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-outline-variant">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-on-surface-variant">Tidak ada pemberitahuan baru.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-3 text-xs ${!n.dibaca ? 'bg-primary/5 font-semibold' : ''}`}>
                            <p className="text-on-surface font-medium">{n.judul}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">{n.pesan}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Slide-Out Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-surface-container-lowest z-50 flex flex-col lg:hidden shadow-elevated"
              >
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center p-0.5 shadow-sm flex-shrink-0">
                      <img src="/icon-bumi-warga.png" alt="BW" className="w-full h-full object-contain rounded-md" onError={(e) => { e.target.style.display = 'none'; }} />
                      <span className="font-bold text-xs hidden only:block">BW</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-on-surface leading-none">Bumi Warga</h2>
                      <span className="text-[10px] text-sky-700 font-semibold">{getRoleBadge(user?.role)}</span>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container">
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-on-primary font-bold'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="p-4 border-t border-outline-variant space-y-2 bg-surface-container-low/50">
                  {user?.family_members && user.family_members.length > 1 && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); setFamilyModalOpen(true); }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                    >
                      <Sparkles size={14} /> Ganti Persona Anggota
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-error-container transition-colors border border-error/20"
                  >
                    <LogOut size={16} /> Keluar Akun
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Offline & Sync Indicator Banner */}
        <OfflineIndicator />

        {/* Main Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Navigation Bar Khusus Mobile-First (Warga & RT/RW) */}
        {mobileBottomNav && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around z-30 shadow-lg px-2">
            {mobileBottomNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <div className={`p-1 rounded-md ${isActive ? 'bg-primary/10 text-primary' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="truncate mt-0.5">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {/* Family Member Profile Switcher Modal */}
      <AnimatePresence>
        {familyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Pilih Persona Anggota Keluarga</h3>
                    <p className="text-[11px] text-on-surface-variant">
                      Surat & pelayanan akan diproses atas nama yang Anda pilih.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setFamilyModalOpen(false)}
                  className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                {user?.family_members?.map((member) => {
                  const isSelected = (user?.active_nik || user?.username) === member.nik;
                  return (
                    <div
                      key={member.nik}
                      onClick={async () => {
                        await selectProfile(member.nik);
                        setFamilyModalOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                        }`}>
                          {member.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{member.nama}</p>
                          <p className="text-[11px] text-on-surface-variant">
                            {member.status_hubungan_keluarga} · NIK: {member.nik}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary flex items-center gap-1">
                          <UserCheck size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-primary">Pilih</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 border-t border-outline-variant text-center">
                <NavLink
                  to="/dashboard/kk"
                  onClick={() => setFamilyModalOpen(false)}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Buka Dokumen Lengkap Kartu Keluarga Digital &rarr;
                </NavLink>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA App Install Invitation Prompt */}
      <PWAInstallPrompt />

      {/* Force Change Password on First Login (BSSN Security Policy) */}
      <ForceChangePasswordModal />
    </div>
  );
}
