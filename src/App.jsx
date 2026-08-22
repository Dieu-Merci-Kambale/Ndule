import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Shorts from './pages/Shorts';
import Explore from './pages/Explore';
import Stats from './pages/Stats';
import Credits from './pages/Credits';
import Login from './pages/Login';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import { PlayerProvider } from './context/PlayerContext';

// Admin Components
import AdminLayout from './layouts/AdminLayout';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LoginAdmin from './pages/admin/LoginAdmin';
import DashboardAdmin from './pages/admin/DashboardAdmin';

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/fr" replace />} />
          
          <Route path="/:lang" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          
          <Route path="/:lang/login" element={<Login />} />
          <Route path="/:lang/explore" element={<Explore />} />
          
          {/* Admin Routes */}
          <Route path="/login_admin" element={<LoginAdmin />} />
          <Route path="/" element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard_admin" element={<DashboardAdmin />} />
            </Route>
          </Route>
          
          <Route path="/:lang" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="accueil" element={<DashboardHome />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="shorts" element={<Shorts />} />
              <Route path="stats" element={<Stats />} />
              <Route path="credits" element={<Credits />} />
            </Route>
          </Route>

          {/* Catch all to redirect back to FR */}
          <Route path="*" element={<Navigate to="/fr" replace />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;
