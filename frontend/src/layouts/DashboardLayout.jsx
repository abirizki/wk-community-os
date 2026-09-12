import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  Network,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import OfflineIndicator from '../components/OfflineIndicator';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export default function DashboardLayout() {
  const { user, logout, selectProfile } = useAuth();
  const navigate = useNavigate();
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

  const normalizedRole = user?.role === 'admin' ? 'admin_kelurahan' : user?.role;
  const canManageUsers = ['superadmin', 'admin_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt'].includes(normalizedRole);
  const isCityExecutive = ['superadmin', 'walikota', 'camat', 'admin_kelurahan', 'admin'].includes(normalizedRole);

  const navItems = [
    { name: 'Beranda', path: '/dashboard', icon: <Home size={20} /> },
  ];

  if (isCityExecutive) {
    navItems.push({
      name: 'Command Center Kota',
      path: '/dashboard/command-center',
      icon: <Landmark size={20} />
    });
    navItems.push({
      name: 'Integrasi Pemda',
      path: '/dashboard/integrasi',
      icon: <Network size={20} />
    });
    navItems.push({
      name: 'WhatsApp Gateway',
      path: '/dashboard/whatsapp',
      icon: <MessageSquare size={20} />
    });
  }

  navItems.push(
    { name: 'Kartu Keluarga', path: '/dashboard/kk', icon: <Users size={20} /> },
    { name: 'Data Warga', path: '/dashboard/warga', icon: <User size={20} /> },
    { name: 'Pengajuan Dokumen', path: '/dashboard/dokumen', icon: <FileCheck size={20} /> },
    { name: 'Bantuan Sosial', path: '/dashboard/bansos', icon: <Gift size={20} /> },
    { name: 'Desil DTSEN', path: '/dashboard/desil', icon: <Sparkles size={20} /> },
    { name: 'Kematangan Data & AI', path: '/dashboard/data-maturity', icon: <Award size={20} /> },
    { name: 'Daya Dukung & Fasilitas', path: '/dashboard/daya-dukung', icon: <Building2 size={20} /> },
    { name: 'Layanan PBB', path: '/dashboard/pbb', icon: <FileText size={20} /> },
    { name: 'Posyandu', path: '/dashboard/posyandu', icon: <HeartPulse size={20} /> },
    { name: 'Pengaduan', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={20} /> },
    { name: 'Panduan & SOP', path: '/dashboard/panduan', icon: <BookOpen size={20} /> }
  );

  if (canManageUsers) {
    navItems.push({
      name: 'Kelola Pengguna',
      path: '/dashboard/users',
      icon: <ShieldCheck size={20} />
    });
  }

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

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/notifikasi/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setNotifDropdownOpen(false);
        navigate(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifikasi/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMember = async (nik) => {
    try {
      await selectProfile(nik);
      setFamilyModalOpen(false);
    } catch (e) {
      alert('Gagal memilih anggota keluarga: ' + e.message);
    }
  };

  const displayName = user?.active_nama || user?.nama || (user?.nik ? `Warga ${user.nik.slice(0, 6)}...` : 'Warga');
  const activeHubungan = user?.active_hubungan || (user?.role !== 'warga' ? user?.role : 'Anggota');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant shadow-sm z-20">
        <div className="p-5 border-b border-outline-variant">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              BW
            </div>
            <div>
              <h1 className="text-body-lg font-bold text-on-surface leading-none">Bumi Warga</h1>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Jabar Pintar Digital</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-label-md transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Family Profile Switcher */}
        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {activeHubungan} · {user?.rw ? `RW ${user.rw}` : 'Kebonjati'}
              </p>
            </div>
          </div>

          {user?.family_members && user.family_members.length > 1 && (
            <button
              onClick={() => setFamilyModalOpen(true)}
              className="w-full mb-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-primary hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Sparkles size={13} />
              <span>Ganti Persona Anggota</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-error hover:bg-error-container transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-20">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              BW
            </div>
            <h1 className="text-body-md font-bold text-on-surface">Bumi Warga</h1>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <p className="text-xs text-on-surface-variant font-medium">
              Kelurahan Kebonjati · Kec. Andir · Kota Bandung
            </p>
            {user?.active_nama && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-primary border border-blue-200">
                <UserCheck size={12} /> {user.active_nama} ({user.active_hubungan || 'Warga'})
              </span>
            )}
          </div>

          {/* Right Actions: Family Switcher, Notification Bell & Mobile Toggle */}
          <div className="flex items-center gap-2 relative">
            {/* Quick Family Switcher Pill for Mobile / Desktop */}
            {user?.family_members && user.family_members.length > 1 && (
              <button
                onClick={() => setFamilyModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Users size={14} />
                <span>Keluarga ({user.family_members.length})</span>
              </button>
            )}

            {/* Bell Icon & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                aria-label="Notifikasi"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setNotifDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-elevated z-40 overflow-hidden"
                    >
                      <div className="p-3.5 border-b border-outline-variant flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface">Notifikasi In-App</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] font-medium text-primary hover:underline"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/60">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleMarkAsRead(notif.id, notif.link)}
                              className={`p-3.5 hover:bg-surface-container-low/60 cursor-pointer transition-colors ${
                                notif.is_read ? 'opacity-70' : 'bg-blue-50/30'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-on-surface leading-snug">
                                  {notif.judul}
                                </p>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                                {notif.pesan}
                              </p>
                              <p className="text-[10px] text-on-surface-variant/60 mt-1.5">
                                {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-on-surface-variant">
                            Belum ada pemberitahuan baru.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-on-surface/20 z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-72 bg-surface-container-lowest shadow-elevated z-50 flex flex-col lg:hidden"
              >
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      {activeHubungan} · {user?.rw ? `RW ${user.rw}` : 'Kebonjati'}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md"
                  >
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
                        `flex items-center gap-3 px-3 py-3 rounded-md text-xs transition-colors ${
                          isActive
                            ? 'bg-primary-container text-on-primary-container font-semibold'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`
                      }
                    >
                      {item.icon}
                      {item.name}
                    </NavLink>
                  ))}
                </nav>

                <div className="p-4 border-t border-outline-variant space-y-2">
                  {user?.family_members && user.family_members.length > 1 && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); setFamilyModalOpen(true); }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-blue-50 text-primary border border-blue-200"
                    >
                      <Sparkles size={14} /> Ganti Persona Anggota
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-error hover:bg-error-container transition-colors border border-error/20"
                  >
                    <LogOut size={16} />
                    Keluar Akun
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

              <div className="p-5 space-y-2.5 max-h-80 overflow-y-auto">
                {user?.family_members && user.family_members.map((member) => {
                  const isSelected = user?.active_nik === member.nik;
                  return (
                    <div
                      key={member.nik}
                      onClick={() => handleSelectMember(member.nik)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-variant text-primary'
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
    </div>
  );
}
