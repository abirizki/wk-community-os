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

// Code-split route pages (Lazy Loaded on Demand)
const PBBPage = lazy(() => import('./pages/PBBPage'));
const PosyanduPage = lazy(() => import('./pages/PosyanduPage'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const DokumenPage = lazy(() => import('./pages/DokumenPage'));
const BansosPage = lazy(() => import('./pages/BansosPage'));
const DesilPage = lazy(() => import('./pages/DesilPage'));
const DataMaturityPage = lazy(() => import('./pages/DataMaturityPage'));
const DayaDukungPage = lazy(() => import('./pages/DayaDukungPage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));
const IntegrasiPage = lazy(() => import('./pages/IntegrasiPage'));
const WhatsAppGatewayPage = lazy(() => import('./pages/WhatsAppGatewayPage'));
const WargaList = lazy(() => import('./pages/WargaList'));
const WargaDetail = lazy(() => import('./pages/WargaDetail'));
const KartuKeluargaPage = lazy(() => import('./pages/KartuKeluargaPage'));
const KontrakanPage = lazy(() => import('./pages/KontrakanPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const PanduanOperasionalPage = lazy(() => import('./pages/PanduanOperasionalPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const KeuanganPage = lazy(() => import('./pages/KeuanganPage'));
const AparaturPage = lazy(() => import('./pages/AparaturPage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/AnalyticsDashboardPage'));

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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
