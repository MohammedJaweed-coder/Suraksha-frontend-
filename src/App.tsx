import { Navigate, Route, Routes } from 'react-router-dom';
import { BackToHome } from './components/BackToHome';
import { BottomNav } from './components/layout/BottomNav';
import { Navbar } from './components/layout/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { Toast } from './components/ui/Toast';
import { useAuthStore } from './store/auth.store';
import CCTVPage from './pages/CCTVPage';
import HistoryPage from './pages/HistoryPage';
import HeatmapPage from './pages/HeatmapPage';
import LoginPage from './pages/LoginPage';
import ReportPage from './pages/ReportPage';
import SOSPage from './pages/SOSPage';
import SafeRoutePage from './pages/SafeRoutePage';
import HomePage from './pages/HomePage';
import AdminInboxPage from './pages/AdminInboxPage';

function ProtectedLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineBanner />
      <Navbar />
      <BackToHome />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/sos" element={<SOSPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/map" element={<HeatmapPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/routes" element={<SafeRoutePage />} />
        <Route path="/cctv" element={<CCTVPage />} />
        <Route path="/admin/inbox" element={<AdminInboxPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App(): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />} />
      </Routes>
      <Toast />
    </>
  );
}
