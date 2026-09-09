import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import PBBPage from './pages/PBBPage';
import PosyanduPage from './pages/PosyanduPage';
import ComplaintPage from './pages/ComplaintPage';
import DokumenPage from './pages/DokumenPage';
import WargaList from './pages/WargaList';
import WargaDetail from './pages/WargaDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

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
            <Route path="warga" element={<WargaList />} />
            <Route path="warga/:nik" element={<WargaDetail />} />
            <Route path="dokumen" element={<DokumenPage />} />
            <Route path="pbb" element={<PBBPage />} />
            <Route path="posyandu" element={<PosyanduPage />} />
            <Route path="pengaduan" element={<ComplaintPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
