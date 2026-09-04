import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  HeartPulse,
  MessageSquareWarning,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Beranda', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Layanan PBB', path: '/dashboard/pbb', icon: <FileText size={20} /> },
    { name: 'Posyandu', path: '/dashboard/posyandu', icon: <HeartPulse size={20} /> },
    { name: 'Pengaduan', path: '/dashboard/pengaduan', icon: <MessageSquareWarning size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant shadow-sm z-20">
        <div className="p-5 border-b border-outline-variant">
          <h1 className="text-body-lg font-bold text-on-surface">Portal Warga</h1>
          <p className="text-label-sm text-on-surface-variant">WK Community OS</p>
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
                {user?.nik || 'Warga'}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">Terverifikasi</p>
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

      {/* Mobile Header & Overlay */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
              <span className="text-label-md font-bold">WK</span>
            </div>
            <h1 className="text-body-md font-bold text-on-surface">Portal Warga</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md"
          >
            <Menu size={24} />
          </button>
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
                      {user?.nik || 'Warga'}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Menu Navigasi</span>
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

