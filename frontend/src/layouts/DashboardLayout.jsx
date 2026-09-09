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
  Bell
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In-App Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Beranda', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Data Warga', path: '/dashboard/warga', icon: <User size={20} /> },
    { name: 'Pengajuan Dokumen', path: '/dashboard/dokumen', icon: <FileCheck size={20} /> },
    { name: 'Layanan PBB', path: '/dashboard/pbb', icon: <FileText size={20} /> },
    { name: 'Posyandu', path: '/dashboard/posyandu', icon: <HeartPulse size={20} /> },
    { name: 'Pengaduan', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={20} /> },
  ];

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

        <nav className="flex-1 p-3 space-y-1">
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

        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-md font-semibold text-on-surface truncate">
                {user?.nama || user?.nik || 'Warga'}
              </p>
              <NavLink to={`/dashboard/warga/${user?.nik}`} className="text-[11px] text-primary hover:underline truncate block">
                Lihat Profil
              </NavLink>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-label-md font-medium text-error hover:bg-error-container transition-colors"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Notification Bell */}
        <header className="flex items-center justify-between px-4 lg:px-8 py-3.5 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-20">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              BW
            </div>
            <h1 className="text-body-md font-bold text-on-surface">Bumi Warga</h1>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs text-on-surface-variant">
              Kelurahan Kebonjati · Kec. Andir · Kota Bandung
            </p>
          </div>

          {/* Right Actions: Notification Bell & Mobile Toggle */}
          <div className="flex items-center gap-2 relative">
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

              {/* Notification Dropdown Panel */}
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
                    <span className="text-label-md font-semibold text-on-surface truncate">
                      {user?.nama || user?.nik || 'Warga'}
                    </span>
                    <NavLink
                      to={`/dashboard/warga/${user?.nik}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[11px] text-primary hover:underline mt-0.5"
                    >
                      Lihat Profil
                    </NavLink>
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
                        `flex items-center gap-3 px-3 py-3 rounded-md text-label-md transition-colors ${
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
                <div className="p-4 border-t border-outline-variant">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-label-md font-medium text-error hover:bg-error-container transition-colors border border-error/20"
                  >
                    <LogOut size={18} />
                    Keluar Akun
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
