import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Compass, Music, Video, BarChart2, FileText, LogOut, Globe, Bell, Plus, Link as LinkIcon, ChevronLeft } from 'lucide-react';
import GlobalAudioPlayer from '../components/GlobalAudioPlayer';
import { supabase } from '../lib/supabaseClient';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [notesBalance, setNotesBalance] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour générer l'URL de l'avatar de façon sécurisée (encodeURIComponent)
  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    const name = user?.user_metadata?.full_name || user?.email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        // Charger le solde de Notes
        supabase
          .from('profiles')
          .select('notes_balance')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setNotesBalance(data.notes_balance);
          });
      }
    });

    // Écouter les changements en temps réel sur la table profiles (optionnel mais recommandé)
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        if (payload.new.id === user?.id) {
          setNotesBalance(payload.new.notes_balance);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/fr/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
             <span className="logo-icon">🎵</span>
             <span className="logo-text">Ndule</span>
          </div>
          <button className="back-btn"><ChevronLeft size={18} /></button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/fr/accueil" className="nav-item">
            <Home size={20} />
            <span className="nav-text">Accueil</span>
          </NavLink>
          
          <div className="nav-create-wrapper">
             <button className="nav-create-btn" onClick={() => navigate('/fr/dashboard', { state: { openCreateModal: true } })}>
               <PlusCircle size={20} className="create-icon" />
               <span className="nav-text">Créer</span>
             </button>
          </div>
          
          <NavLink to="/fr/explore" className="nav-item">
            <Compass size={20} />
            <span className="nav-text">Explorer</span>
          </NavLink>
          
          <NavLink to="/fr/dashboard" className="nav-item" end>
            <Music size={20} />
            <span className="nav-text">Ma Musique</span>
          </NavLink>
          
          <NavLink to="/fr/shorts" className="nav-item">
            <Video size={20} />
            <span className="nav-text">Shorts</span>
          </NavLink>
          
          <NavLink to="/fr/stats" className="nav-item">
            <BarChart2 size={20} />
            <span className="nav-text">Stats</span>
          </NavLink>
          
          <NavLink to="/fr/credits" className="nav-item">
            <FileText size={20} />
            <span className="nav-text">Crédits</span>
            <span className="badge-notes">{notesBalance} Crédits</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <img 
              src={getAvatarUrl()} 
              alt="Avatar" 
              className="avatar-small" 
            />
            <div className="user-info">
              <span className="user-name">{user?.user_metadata?.full_name || 'Membre Ndule'}</span>
              <span className="user-email">{user?.email || 'Chargement...'}</span>
            </div>
          </div>
          
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span className="nav-text">Déconnexion</span>
          </button>
          
          <div className="language-selector">
            <Globe size={18} className="text-stone-400" />
            <span className="text-stone-500">English</span>
            <span className="lang-active">FR</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
           {/* Mobile Logo */}
           <div className="topbar-left mobile-only">
             <span className="logo-icon" style={{fontSize: '24px'}}>🎵</span>
             <span className="logo-text" style={{fontSize: '20px', fontWeight: 800, color: 'var(--blue-600)'}}>Ndule</span>
           </div>
           
           <div className="topbar-right">
             <div className="topbar-notes-pill">
               <LinkIcon size={14} className="text-blue-500" />
               <span className="font-medium text-stone-700" style={{fontSize: '12px'}}>{notesBalance} Crédits</span>
               <button className="plus-round-btn"><Plus size={14} /></button>
             </div>
             <button className="icon-btn-round mobile-only" onClick={handleLogout}>
               <LogOut size={16} className="text-red-500" />
             </button>
             <button className="icon-btn-round hidden-mobile"><Bell size={18} className="text-stone-600" /></button>
             <img 
               src={getAvatarUrl()} 
               alt="Avatar" 
               className="avatar-medium cursor-pointer" 
             />
           </div>
        </header>

        {/* Content View */}
        <main className="content-view">
          <Outlet />
        </main>
      </div>

      <GlobalAudioPlayer />
    </div>
  );
};

export default DashboardLayout;
