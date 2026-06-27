import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useSocket from './hooks/useSocket';

// Pages
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TrackingPage  from './pages/TrackingPage';
import DevicesPage   from './pages/DevicesPage';
import AlertsPage    from './pages/AlertsPage';
import GeofencePage  from './pages/GeofencePage';
import ReportsPage   from './pages/ReportsPage';

// Layout
import Sidebar from './components/Sidebar/Sidebar';
import Header  from './components/Header/Header';

// ════════════════════════════════════════
//  PROTECTED ROUTE
// ════════════════════════════════════════
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ════════════════════════════════════════
//  MAIN LAYOUT
// ════════════════════════════════════════
const MainLayout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
//  APP
// ════════════════════════════════════════
function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  useSocket();

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" />
              : <LoginPage />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }/>

        <Route path="/tracking" element={
          <ProtectedRoute>
            <MainLayout>
              <TrackingPage />
            </MainLayout>
          </ProtectedRoute>
        }/>

        <Route path="/devices" element={
          <ProtectedRoute>
            <MainLayout>
              <DevicesPage />
            </MainLayout>
          </ProtectedRoute>
        }/>

        <Route path="/alerts" element={
          <ProtectedRoute>
            <MainLayout>
              <AlertsPage />
            </MainLayout>
          </ProtectedRoute>
        }/>

        <Route path="/geofence" element={
          <ProtectedRoute>
            <MainLayout>
              <GeofencePage />
            </MainLayout>
          </ProtectedRoute>
        }/>

        <Route path="/reports" element={
          <ProtectedRoute>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }/>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;