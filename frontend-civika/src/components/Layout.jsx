import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TeacherTour from './TeacherTour';
import AdminTour from './AdminTour';
import SecretariaTour from './SecretariaTour';
import InstallPwaModal from './InstallPwaModal';
import { useAuth } from '../context/AuthContext';
import { Menu, HelpCircle, Bookmark, X } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';


function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const prevPath = useRef(location.pathname);

  // Top progress bar on route change
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setNavLoading(true);
      const t = setTimeout(() => setNavLoading(false), 600);
      prevPath.current = location.pathname;
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  useEffect(() => {
    const dismissed = localStorage.getItem('civika_pwa_banner_dismissed');
    if (!dismissed) {
      setBannerDismissed(false);
    }
  }, []);

  const handleDismissBanner = () => {
    localStorage.setItem('civika_pwa_banner_dismissed', 'true');
    setBannerDismissed(true);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-['Outfit'] overflow-hidden relative">
      {/* Top progress bar on route change */}
      {navLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-[length:200%_auto]"
            style={{
              animation: 'progressBar 0.6s ease-out forwards, shimmer 1s linear infinite',
            }}
          />
        </div>
      )}   
      {/* Fondo Tech Ambiental - Colegio Cívika */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full filter blur-[130px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/12 rounded-full filter blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-900/10 rounded-full filter blur-[150px]" />
        <div 
          className="absolute inset-0 opacity-[0.12]"
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.35) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Tours interactivos según rol del usuario */}
      {user?.rol === 'admin' ? (
        <AdminTour />
      ) : user?.rol === 'secretaria' ? (
        <SecretariaTour />
      ) : (
        <TeacherTour />
      )}

      {/* Modal para guardar URL / Instalar PWA */}
      <InstallPwaModal isOpen={pwaModalOpen} onClose={() => setPwaModalOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Barra superior de escritorio / Botones flotantes móviles */}
        <div className="fixed top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none lg:static lg:p-6 lg:pb-0 lg:flex lg:justify-end lg:gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-3 bg-slate-900 border border-white/15 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl pointer-events-auto cursor-pointer"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setPwaModalOpen(true)}
              className="p-3 lg:px-4 lg:py-2.5 bg-slate-900/90 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl text-purple-300 hover:text-white transition-all shadow-xl cursor-pointer flex items-center gap-2 text-xs font-bold backdrop-blur-md"
              title="Guardar enlace / Instalar App"
            >
              <Bookmark size={18} className="text-purple-400" />
              <span className="hidden sm:inline">Guardar App / URL</span>
            </button>

            <button
              onClick={() => {
                if (user?.rol === 'admin') {
                  window.dispatchEvent(new Event('open-admin-tour'));
                } else if (user?.rol === 'secretaria') {
                  window.dispatchEvent(new Event('open-secretaria-tour'));
                } else {
                  window.dispatchEvent(new Event('open-teacher-tour'));
                }
              }}
              className="p-3 lg:px-4 lg:py-2.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 rounded-2xl text-purple-300 hover:text-white transition-all shadow-2xl cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
            >
              <HelpCircle size={18} />
              Guía
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 lg:pt-4">
          <div className="max-w-7xl mx-auto">
            {/* Banner recordatorio para profesores y usuarios */}
            {!bannerDismissed && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-['Outfit'] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30 shrink-0">
                    <Bookmark size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-200">📌 ¿Cómo volver a entrar a {APP_CONFIG.appName} todos los días?</p>
                    <p className="text-xs text-slate-300">Guarda esta página en tus Marcadores (⭐) o instálala como aplicación en tu teléfono celular o computadora.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setPwaModalOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Bookmark size={14} /> Guardar / Instalar
                  </button>
                  <button
                    onClick={handleDismissBanner}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl cursor-pointer transition-all"
                    title="Cerrar aviso"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;


