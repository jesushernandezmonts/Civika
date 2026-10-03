import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import api from '../services/api';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  ClipboardList,
  ClipboardCheck,
  LogOut,
  User,
  X,
  BarChart3,
  HeartHandshake,
  MapPin,
  HelpCircle,
  CalendarDays,
  ShoppingBag,
  Receipt,
  Megaphone,
  CheckCircle2
} from 'lucide-react';

import { APP_CONFIG } from '../config/appConfig';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  
  const linkClass = ({ isActive }) =>
    `relative group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-purple-600/35 via-indigo-600/25 to-blue-600/15 text-white font-semibold border border-purple-500/40 shadow-[0_4px_20px_rgba(147,51,234,0.2)]' 
        : 'text-white/60 hover:text-white hover:bg-white/[0.06] hover:translate-x-1.5'
    }`;

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900  z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 lg:bg-slate-900/95  border-r border-white/15 flex flex-col p-6 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/40 bg-white flex items-center justify-center p-1 shadow-lg shadow-purple-900/40 shrink-0">
              <img src={APP_CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-tight">{APP_CONFIG.appName}</span>
              <span className="text-[10px] text-purple-400 font-bold tracking-[0.15em] uppercase leading-none mt-0.5">{APP_CONFIG.appSubName}</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {/* Menú según rol */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {user?.rol === 'admin' ? (
            <>
              {/* --- ROL DIRECCIÓN GENERAL / ADMIN --- */}
              <div data-tour="sidebar-dashboard">
                <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Finanzas & Inicio</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-alumnos">
                <NavLink to="/alumnos" onClick={onClose} className={linkClass}>
                  <Users size={20} />
                  <span className="font-medium">Directorio de Alumnos</span>
                </NavLink>
              </div>
              <div>
                <NavLink to="/pagos" onClick={onClose} className={linkClass}>
                  <CreditCard size={20} />
                  <span className="font-medium">Cobro de Colegiaturas</span>
                </NavLink>
              </div>
              <div>
                <NavLink to="/uniformes" onClick={onClose} className={linkClass}>
                  <ShoppingBag size={20} />
                  <span className="font-medium">Catálogo & Precios Uniformes</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-cortes-direccion">
                <NavLink to="/cortes-direccion" onClick={onClose} className={linkClass}>
                  <CheckCircle2 size={20} />
                  <span className="font-medium">Validación de Cortes</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-avisos-escolares">
                <NavLink to="/avisos-escolares" onClick={onClose} className={linkClass}>
                  <Megaphone size={20} />
                  <span className="font-medium">Avisos Escolares</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-secretarias">
                <NavLink to="/instructores" onClick={onClose} className={linkClass}>
                  <UserSquare2 size={20} />
                  <span className="font-medium">Cuentas de Secretarias</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-reportes">
                <NavLink to="/reportes" onClick={onClose} className={linkClass}>
                  <BarChart3 size={20} />
                  <span className="font-medium">Reportes Financieros</span>
                </NavLink>
              </div>
            </>
          ) : user?.rol === 'secretaria' ? (
            <>
              {/* --- ROL SECRETARÍA / CAJA Y RECEPCIÓN --- */}
              <div data-tour="sidebar-cobro-colegiaturas">
                <NavLink to="/pagos" onClick={onClose} className={linkClass}>
                  <CreditCard size={20} />
                  <span className="font-medium">Cobro de Colegiaturas</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-uniformes-sec">
                <NavLink to="/uniformes" onClick={onClose} className={linkClass}>
                  <ShoppingBag size={20} />
                  <span className="font-medium">Venta de Uniformes</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-corte-caja">
                <NavLink to="/corte-caja" onClick={onClose} className={linkClass}>
                  <Receipt size={20} />
                  <span className="font-medium">Corte de Caja</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-alumnos-sec">
                <NavLink to="/alumnos" onClick={onClose} className={linkClass}>
                  <Users size={20} />
                  <span className="font-medium">Registro de Alumnos</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-asistencia-sec">
                <NavLink to="/asistencia-admin" onClick={onClose} className={linkClass}>
                  <ClipboardCheck size={20} />
                  <span className="font-medium">Control de Asistencias</span>
                </NavLink>
              </div>
            </>
          ) : (
            <>
              {/* --- ROL DOCENTE / OTROS --- */}
              <div data-tour="sidebar-mis-grupos">
                <NavLink to="/mis-grupos" onClick={onClose} className={linkClass}>
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Mis Grupos</span>
                </NavLink>
              </div>
              <div data-tour="sidebar-asistencia">
                <NavLink to="/asistencia" onClick={onClose} className={linkClass}>
                  <ClipboardList size={20} />
                  <span className="font-medium">Pasar Lista</span>
                </NavLink>
              </div>
            </>
          )}
        </nav>

        {/* Botón Guía Interactiva del Sistema */}
        <div className="pt-2 pb-1" data-tour="sidebar-help-tour">
          <button
            onClick={() => {
              if (user?.rol === 'admin') {
                window.dispatchEvent(new Event('open-admin-tour'));
              } else if (user?.rol === 'secretaria') {
                window.dispatchEvent(new Event('open-secretaria-tour'));
              } else {
                window.dispatchEvent(new Event('open-teacher-tour'));
              }
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 py-2.5 rounded-2xl border border-purple-500/30 transition-all duration-300 font-bold text-xs cursor-pointer"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {/* Información del usuario y logout */}
        <div className="border-t border-white/15 pt-4 mt-2">
          <button
            data-tour="sidebar-perfil"
            onClick={() => { navigate('/mi-perfil'); onClose(); }}
            className="w-full flex items-center gap-3 mb-3 px-1 hover:bg-slate-800/80 rounded-2xl py-2 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px] flex-shrink-0 shadow-lg shadow-purple-900/30">
              <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center overflow-hidden">
                {user?.fotoUrl && !photoError ? (
                  <img
                    src={user.fotoUrl}
                    alt={user?.nombre}
                    className="w-full h-full object-cover"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <User size={20} className="text-white/80" />
                )}
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white/90 truncate group-hover:text-purple-300 transition-colors">{user?.nombre || user?.email}</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{user?.rol}</span>
            </div>
          </button>
          <button 
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-red-600/20 hover:text-red-400 text-white/50 py-3 rounded-2xl border border-white/15 transition-all duration-300 font-semibold"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <ConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="¿Cerrar sesión?"
        message="Tu sesión actual se cerrará y tendrás que iniciar sesión nuevamente para continuar. ¿Deseas salir?"
        confirmText="Sí, cerrar"
        cancelText="Cancelar"
      />
    </>
  );
}

export default Sidebar;
