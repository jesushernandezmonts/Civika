import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import {
  Loader2,
  Calendar,
  DollarSign,
  Megaphone,
  CreditCard,
  ShoppingBag,
  User,
  GraduationCap,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

/* ── KPI Card — estilo sólido y de alto contraste ── */
function KpiCard({ title, value, color, subtitle, icon: Icon }) {
  const borderClasses = {
    purple: 'border-l-purple-500 text-purple-400',
    emerald: 'border-l-emerald-500 text-emerald-400',
    blue: 'border-l-blue-500 text-blue-400',
    amber: 'border-l-amber-500 text-amber-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-slate-900/95 border border-slate-700/80 border-l-4 ${borderClasses[color] || borderClasses.purple} rounded-2xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</p>
        {Icon && <Icon size={20} className="text-slate-400 group-hover:text-purple-400 transition-colors" />}
      </div>
      <p className="text-3xl font-black mt-2 tracking-tight text-white">{value}</p>
      {subtitle && (
        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-400">
          <span>{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function AlumnoDashboard() {
  const { alumno, tipo } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    perfil: null,
    talleres: [],
    pagos: [],
    avisos: [],
    ventasUniformes: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfilRes, pagosRes, avisosRes] = await Promise.all([
          api.get('/alumnos/me/perfil'),
          api.get('/alumnos/me/pagos').catch(() => ({ data: [] })),
          api.get('/civika/avisos').catch(() => ({ data: [] })),
        ]);

        let ventasUniformes = [];
        if (perfilRes.data?.id) {
          try {
            const uniformesRes = await api.get(`/civika/uniformes/ventas?alumnoId=${perfilRes.data.id}`);
            ventasUniformes = uniformesRes.data || [];
          } catch (e) {
            console.error('Error fetching uniformes alumno', e);
          }
        }

        setData({
          perfil: perfilRes.data,
          pagos: pagosRes.data || [],
          avisos: avisosRes.data || [],
          ventasUniformes,
        });
      } catch (err) {
        console.error('Error loading alumno data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  const perfil = data.perfil || alumno || {};
  const totalPagado = data.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  const totalUniformes = data.ventasUniformes.reduce((sum, v) => sum + Number(v.total), 0);

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Datos del Alumno */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-slate-900/80 to-blue-900/40 p-6 md:p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap size={14} />
              <span>Portal de Alumnos & Tutores • {APP_CONFIG.appName}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              ¡Hola, {perfil.nombre} {perfil.apellidoPaterno}!
            </h1>
            <p className="text-slate-300 text-sm">
              Consulta el estado de colegiaturas, compras de uniformes y circulares de la dirección.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-1.5 min-w-[240px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Ficha Escolar</span>
            <div className="text-xs text-white">
              <span className="text-slate-400">Grado: </span>
              <span className="font-bold text-white">{perfil.grado || 'Secundaria 1°'}</span>
            </div>
            <div className="text-xs text-white">
              <span className="text-slate-400">Matrícula: </span>
              <span className="font-mono font-bold text-purple-300">{perfil.matricula || 'CIK-2026-001'}</span>
            </div>
            {perfil.nombreTutor && (
              <div className="text-xs text-white pt-1 border-t border-white/5">
                <span className="text-slate-400">Tutor: </span>
                <span className="font-medium text-slate-200">{perfil.nombreTutor}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard
          title="Colegiaturas Pagadas"
          value={`$${totalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          color="emerald"
          subtitle={`${data.pagos.length} recibos registrados`}
          icon={CreditCard}
        />
        <KpiCard
          title="Compras de Uniformes"
          value={`$${totalUniformes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          color="purple"
          subtitle={`${data.ventasUniformes.length} adquisiciones`}
          icon={ShoppingBag}
        />
        <KpiCard
          title="Estatus de Colegiatura"
          value="Al Corriente"
          color="blue"
          subtitle="Ciclo Escolar 2026"
          icon={Sparkles}
        />
      </div>

      {/* Sección de Avisos y Circulares Escolares */}
      <div className="bg-slate-900/95 border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">Avisos Escolares y Circulares</h2>
              <p className="text-xs text-slate-400">Comunicados oficiales de Dirección General</p>
            </div>
          </div>
        </div>

        {data.avisos.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No hay comunicados escolares recientes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.avisos.slice(0, 4).map((aviso) => (
              <div
                key={aviso.id}
                className="bg-slate-800/60 border border-white/10 hover:border-purple-500/30 transition-all rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    aviso.prioridad === 'urgente' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : aviso.prioridad === 'alta'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {aviso.prioridad}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar size={12} />
                    <span>{new Date(aviso.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base">{aviso.titulo}</h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {aviso.contenido}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recibos Recientes de Colegiatura */}
      <div className="bg-slate-900/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">Historial de Colegiaturas</h2>
              <p className="text-xs text-slate-400">Recibos emitidos en ventanilla por Secretaría</p>
            </div>
          </div>
          <Link
            to="/alumno/pagos"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
          >
            Ver todos los recibos →
          </Link>
        </div>

        {data.pagos.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No hay registros de colegiaturas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10">
                  <th className="py-3 px-4">Concepto / Mes</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pagos.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-white font-medium capitalize">
                      Colegiatura - {p.mesCorrespondiente}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      ${Number(p.monto).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {p.metodoPago || 'Efectivo'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(p.fechaPago).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
