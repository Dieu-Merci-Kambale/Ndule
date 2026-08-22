import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LayoutDashboard, Users, Music, Settings, LogOut, Wallet } from 'lucide-react';
import '../pages/admin/Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login_admin');
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>NDULE <span>ADMIN</span></h2>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/dashboard_admin" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"} end>
            <LayoutDashboard size={20} />
            <span>Tableau de bord</span>
          </NavLink>
          <NavLink to="/dashboard_admin_payments" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Wallet size={20} />
            <span>Paiements</span>
          </NavLink>
          <button className="admin-nav-item disabled" title="Prochainement">
            <Users size={20} />
            <span>Utilisateurs</span>
          </button>
          <button className="admin-nav-item disabled" title="Prochainement">
            <Music size={20} />
            <span>Musiques</span>
          </button>
          <button className="admin-nav-item disabled" title="Prochainement">
            <Settings size={20} />
            <span>Paramètres</span>
          </button>
        </nav>
        
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Espace d'Administration</h1>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
