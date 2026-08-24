import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Compass, Music, Video, BarChart2, FileText, LogOut, Globe, Bell, Plus, Link as LinkIcon, ChevronLeft } from 'lucide-react';
import GlobalAudioPlayer from '../components/GlobalAudioPlayer';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [notesBalance, setNotesBalance] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

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
             <span className="logo-text">Ndules</span>
          </div>
          <button className="back-btn"><ChevronLeft size={18} /></button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to={`/${lang}/accueil`} className="nav-item">
            <Home size={20} />
            <span className="nav-text">{t.dashboardMenu?.home || 'Accueil'}</span>
          </NavLink>
          
          <div className="nav-create-wrapper">
             <button className="nav-create-btn" onClick={() => navigate(`/${lang}/dashboard`, { state: { openCreateModal: true } })}>
               <PlusCircle size={20} className="create-icon" />
               <span className="nav-text">{t.dashboardMenu?.create || 'Créer'}</span>
             </button>
          </div>
          
          <NavLink to={`/${lang}/explore`} className="nav-item">
            <Compass size={20} />
            <span className="nav-text">{t.dashboardMenu?.explore || 'Explorer'}</span>
          </NavLink>
          
          <NavLink to={`/${lang}/dashboard`} className="nav-item" end>
            <Music size={20} />
            <span className="nav-text">{t.dashboardMenu?.music || 'Musiques'}</span>
          </NavLink>
          
          <NavLink to={`/${lang}/shorts`} className="nav-item">
            <Video size={20} />
            <span className="nav-text">{t.dashboardMenu?.shorts || 'Shorts'}</span>
          </NavLink>
          
          <NavLink to={`/${lang}/stats`} className="nav-item">
            <BarChart2 size={20} />
            <span className="nav-text">{t.dashboardMenu?.stats || 'Stats'}</span>
          </NavLink>
          
          <NavLink to={`/${lang}/credits`} className="nav-item">
            <FileText size={20} />
            <span className="nav-text">{t.dashboardMenu?.credits || 'Crédits'}</span>
            <span className="badge-notes">{notesBalance} {t.dashboardMenu?.credits || 'Crédits'}</span>
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
              <span className="user-name">{user?.user_metadata?.full_name || 'Membre Ndules'}</span>
              <span className="user-email">{user?.email || 'Chargement...'}</span>
            </div>
          </div>
          
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} color="#ef4444" />
            <span className="nav-text" style={{ color: '#ef4444', fontWeight: 'bold' }}>{t.dashboardMenu?.logout || 'Déconnexion'}</span>
          </button>
          
          <div 
            className="language-selector cursor-pointer" 
            onClick={() => navigate(location.pathname.replace(/^\/(fr|en)/, `/${lang === 'fr' ? 'en' : 'fr'}`))}
          >
            <Globe size={18} className="text-stone-400" />
            <span className={lang === 'en' ? "lang-active" : "text-stone-500"}>EN</span>
            <span className={lang === 'fr' ? "lang-active" : "text-stone-500"}>FR</span>
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
             <span className="logo-text" style={{fontSize: '20px', fontWeight: 800, color: 'var(--blue-600)'}}>Ndules</span>
           </div>
           
           <div className="topbar-right">
             <div className="topbar-notes-pill">
               <LinkIcon size={14} className="text-blue-500" />
               <span className="font-medium text-stone-700" style={{fontSize: '12px'}}>{notesBalance} {t.dashboardMenu?.credits || 'Crédits'}</span>
               <button className="plus-round-btn" onClick={() => navigate(`/${lang}/credits`)}><Plus size={14} /></button>
             </div>
             <button className="icon-btn-round hidden-mobile"><Bell size={18} className="text-stone-600" /></button>
             
             <div style={{ position: 'relative' }}>
               <img 
                 src={getAvatarUrl()} 
                 alt="Avatar" 
                 className="avatar-medium cursor-pointer" 
                 onClick={() => setShowDropdown(!showDropdown)}
               />
               
               {showDropdown && (
                 <div className="avatar-dropdown">
                   <button onClick={handleLogout} className="dropdown-item">
                     <LogOut size={16} color="#ef4444" />
                     <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{t.dashboardMenu?.logout || 'Déconnexion'}</span>
                   </button>
                 </div>
               )}
             </div>
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
