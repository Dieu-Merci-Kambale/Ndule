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
import ProtectedRoute from './components/ProtectedRoute';
import { PlayerProvider } from './context/PlayerContext';

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/fr" replace />} />
          
          <Route path="/fr" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>
          
          <Route path="/fr/login" element={<Login />} />
          <Route path="/fr/explore" element={<Explore />} />
          
          <Route path="/fr" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="accueil" element={<DashboardHome />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="shorts" element={<Shorts />} />
              <Route path="stats" element={<Stats />} />
              <Route path="credits" element={<Credits />} />
            </Route>
          </Route>

          <Route path="/en" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>
          
          <Route path="/en" element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Catch all to redirect back to FR */}
          <Route path="*" element={<Navigate to="/fr" replace />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;
