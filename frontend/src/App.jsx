import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import VerifySuratPage from './pages/VerifySuratPage';
import VerifyKkPage from './pages/VerifyKkPage';
import ScannerPage from './pages/ScannerPage';

// Resilient Lazy Loader: Automatically retries and refreshes cache on deployment chunk mismatch
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const hasReloaded = window.sessionStorage.getItem('bw_chunk_reload');
    try {
      const module = await componentImport();
      window.sessionStorage.removeItem('bw_chunk_reload');
      return module;
    } catch (error) {
      if (!hasReloaded) {
        window.sessionStorage.setItem('bw_chunk_reload', 'true');
        window.location.reload();
        return;
      }
      throw error;
    }
  });
}

// Code-split route pages (Lazy Loaded with Auto-Retry)
const PBBPage = lazyWithRetry(() => import('./pages/PBBPage'));
const PosyanduPage = lazyWithRetry(() => import('./pages/PosyanduPage'));
const ComplaintPage = lazyWithRetry(() => import('./pages/ComplaintPage'));
const DokumenPage = lazyWithRetry(() => import('./pages/DokumenPage'));
const BansosPage = lazyWithRetry(() => import('./pages/BansosPage'));
const DesilPage = lazyWithRetry(() => import('./pages/DesilPage'));
const DataMaturityPage = lazyWithRetry(() => import('./pages/DataMaturityPage'));
const DayaDukungPage = lazyWithRetry(() => import('./pages/DayaDukungPage'));
const CommandCenterPage = lazyWithRetry(() => import('./pages/CommandCenterPage'));
const IntegrasiPage = lazyWithRetry(() => import('./pages/IntegrasiPage'));
const WhatsAppGatewayPage = lazyWithRetry(() => import('./pages/WhatsAppGatewayPage'));
const WargaList = lazyWithRetry(() => import('./pages/WargaList'));
const WargaDetail = lazyWithRetry(() => import('./pages/WargaDetail'));
const KartuKeluargaPage = lazyWithRetry(() => import('./pages/KartuKeluargaPage'));
const KontrakanPage = lazyWithRetry(() => import('./pages/KontrakanPage'));
const UserManagementPage = lazyWithRetry(() => import('./pages/UserManagementPage'));
const PanduanOperasionalPage = lazyWithRetry(() => import('./pages/PanduanOperasionalPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const KeuanganPage = lazyWithRetry(() => import('./pages/KeuanganPage'));
const AparaturPage = lazyWithRetry(() => import('./pages/AparaturPage'));
const AnalyticsDashboardPage = lazyWithRetry(() => import('./pages/AnalyticsDashboardPage'));

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('[RouteErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900">Pembaruan Sistem Tersedia</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Modul halaman telah diperbarui di server. Silakan klik tombol di bawah untuk menyinkronkan data terbaru.
            </p>
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.clear();
                window.location.reload();
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center" aria-label="Memuat modul halaman...">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-surat/:hash" element={<VerifySuratPage />} />
            <Route path="/verify-kk/:noKk" element={<VerifyKkPage />} />
            <Route path="/verify/kk/:noKk" element={<VerifyKkPage />} />
            <Route path="/verify/:hash" element={<VerifySuratPage />} />
            <Route path="/scanner" element={<ScannerPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <DashboardLayout />
                </AuthGuard>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="command-center" element={<CommandCenterPage />} />
              <Route path="integrasi" element={<IntegrasiPage />} />
              <Route path="whatsapp" element={<WhatsAppGatewayPage />} />
              <Route path="scanner" element={<ScannerPage />} />
              <Route path="kk" element={<KartuKeluargaPage />} />
              <Route path="kontrakan" element={<KontrakanPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="warga" element={<WargaList />} />
              <Route path="warga/:nik" element={<WargaDetail />} />
              <Route path="dokumen" element={<DokumenPage />} />
              <Route path="analitik" element={<AnalyticsDashboardPage />} />
              <Route path="bansos" element={<BansosPage />} />
              <Route path="desil" element={<DesilPage />} />
              <Route path="data-maturity" element={<DataMaturityPage />} />
              <Route path="daya-dukung" element={<DayaDukungPage />} />
              <Route path="pbb" element={<PBBPage />} />
              <Route path="keuangan" element={<KeuanganPage />} />
              <Route path="posyandu" element={<PosyanduPage />} />
              <Route path="pengaduan" element={<ComplaintPage />} />
              <Route path="profil" element={<ProfilePage />} />
              <Route path="panduan" element={<PanduanOperasionalPage />} />
              <Route path="aparatur" element={<AparaturPage />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
