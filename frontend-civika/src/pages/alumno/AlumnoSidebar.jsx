import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Palette,
  CreditCard,
  ClipboardList,
  User,
  LogOut,
  X,
  HeartHandshake,
} from 'lucide-react';

import { APP_CONFIG } from '../../config/appConfig';

function AlumnoSidebar({ isOpen, onClose, alumno, onLogout, tipo }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold ${
      isActive
        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border border-purple-400/40 shadow-lg shadow-purple-900/50'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const tieneTalleres = tipo === 'talleres' || tipo === 'ambos';
  const tieneSS = tipo === 'servicio_social' || tipo === 'ambos';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/90 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/40 bg-white flex items-center justify-center p-1 shadow-lg shadow-purple-900/40 shrink-0">
              <img src={APP_CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-tight">{APP_CONFIG.appName}</span>
              <span className="text-[10px] text-purple-400 font-bold tracking-[0.15em] uppercase leading-none mt-0.5">Portal Tutores & Alumnos</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white rounded-xl hover:bg-slate-800/90 transition">
            <X size={20} />
          </button>
        </div>

        {/* Navegación Colegio Cívika */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {/* Inicio & Avisos Escolares */}
          <NavLink to="/alumno/dashboard" onClick={onClose} className={linkClass}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Inicio & Avisos</span>
          </NavLink>

          {/* Estado de Pagos y Recibos — Siempre visible para todos los tutores */}
          <NavLink to="/alumno/pagos" onClick={onClose} className={linkClass}>
            <CreditCard size={20} />
            <span className="font-medium">Colegiaturas & Recibos</span>
          </NavLink>

          {/* Asistencias Escolares */}
          <NavLink to="/alumno/asistencias" onClick={onClose} className={linkClass}>
            <ClipboardList size={20} />
            <span className="font-medium">Asistencia Escolar</span>
          </NavLink>

          {/* Talleres Extracurriculares — opcional si aplica */}
          {tieneTalleres && (
            <NavLink to="/alumno/talleres" onClick={onClose} className={linkClass}>
              <Palette size={20} />
              <span className="font-medium">Talleres Artísticos</span>
            </NavLink>
          )}

          {/* Servicio Social — solo si aplica para preparatoria */}
          {tieneSS && (
            <NavLink to="/alumno/servicio-social" onClick={onClose} className={linkClass}>
              <HeartHandshake size={20} />
              <span className="font-medium">Servicio Social</span>
            </NavLink>
          )}
        </nav>

        {/* Perfil y logout */}
        <div className="border-t border-white/15 pt-4 mt-4">
          <NavLink to="/alumno/perfil" onClick={onClose}
            className="w-full flex items-center gap-3 mb-3 px-1 hover:bg-slate-800/80 rounded-2xl py-2 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px] flex-shrink-0 shadow-lg shadow-purple-900/30">
              <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center">
                <User size={20} className="text-white/80" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white/90 truncate group-hover:text-purple-300 transition-colors">{alumno?.nombre || alumno?.email}</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Alumno</span>
            </div>
          </NavLink>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-red-600/20 hover:text-red-400 text-white/50 py-3 rounded-2xl border border-white/15 transition-all duration-300 font-semibold"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default AlumnoSidebar;
