import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Check, Clock, DollarSign, AlertCircle, ArrowDownCircle, UserCheck } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

function CortesDireccion() {
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmandoId, setConfirmandoId] = useState(null);

  useEffect(() => {
    fetchCortes();
  }, []);

  const fetchCortes = async () => {
    try {
      const res = await api.get('/civika/cortes');
      setCortes(res.data);
    } catch (err) {
      console.error('Error cargando cortes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarRecepcion = async (corteId, total) => {
    if (!confirm(`¿Confirmas que recibiste físicamente en efectivo la cantidad de $${Number(total).toFixed(2)} MXN entregada por la secretaría?`)) {
      return;
    }
    setConfirmandoId(corteId);
    try {
      await api.patch(`/civika/cortes/${corteId}/confirmar`);
      await fetchCortes();
      alert('¡Recepción de efectivo confirmada con éxito! El corte ha quedado cerrado y validado.');
    } catch (err) {
      console.error('Error al confirmar corte', err);
      alert('Error al confirmar el corte');
    } finally {
      setConfirmandoId(null);
    }
  };

  const pendientesConfirmacion = cortes.filter((c) => c.estatus === 'entregado_a_direccion');
  const confirmados = cortes.filter((c) => c.estatus === 'confirmado_por_direccion');
  const totalRecibidoConfirmado = confirmados.reduce((acc, c) => acc + Number(c.totalEfectivo), 0);

  return (
    <div className="space-y-8 font-['Outfit'] pb-12">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Validación de Cortes de Caja</h1>
          <p className="text-sm font-semibold text-purple-300/80">
            Recepción y Auditoría de Efectivo Entregado por Secretaría — Dirección General (Doctora)
          </p>
        </div>
      </div>

      {/* Resumen Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            Cortes Pendientes por Validar
          </p>
          <p className="text-3xl font-black text-amber-400">{pendientesConfirmacion.length}</p>
          <p className="text-xs text-slate-400 mt-2">
            Entregas de dinero esperando tu confirmación
          </p>
        </div>

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total en Efectivo Validado
          </p>
          <p className="text-3xl font-black text-emerald-400">
            ${totalRecibidoConfirmado.toFixed(2)} MXN
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold">
            {confirmados.length} corte(s) auditado(s) y firmados
          </p>
        </div>

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Institución
          </p>
          <p className="text-xl font-black text-white">{APP_CONFIG.appName}</p>
          <p className="text-xs text-purple-300 font-semibold mt-2">{APP_CONFIG.appSubName}</p>
        </div>
      </div>

      {/* Bandeja de Dinero Entregado esperando Confirmación de la Doctora */}
      <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <ArrowDownCircle size={20} className="text-amber-400" /> Dinero Entregado por Secretaría (Por Validar)
        </h2>

        {pendientesConfirmacion.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
            <Check size={36} className="text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-300">¡Al día! No hay entregas de efectivo pendientes de confirmar.</p>
            <p className="text-xs text-slate-500 mt-1">Cuando una secretaria haga un corte y te entregue el dinero, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendientesConfirmacion.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-400">
                      Folio: {c.folio}
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">
                      Entregado por: {c.secretaria?.nombre || 'Secretaría'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Fecha de entrega: {c.fechaEntrega ? new Date(c.fechaEntrega).toLocaleString() : new Date(c.fechaCorte).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pendiente
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Colegiaturas cobradas:</span>
                    <span className="font-bold text-blue-400">${Number(c.montoColegiaturas).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Venta de uniformes:</span>
                    <span className="font-bold text-purple-400">${Number(c.montoUniformes).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-800 text-sm font-black">
                    <span className="text-white">Total a Recibir en Efectivo:</span>
                    <span className="text-emerald-400">${Number(c.totalEfectivo).toFixed(2)} MXN</span>
                  </div>
                </div>

                {c.observaciones && (
                  <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                    "{c.observaciones}"
                  </p>
                )}

                <button
                  disabled={confirmandoId === c.id}
                  onClick={() => handleConfirmarRecepcion(c.id, c.totalEfectivo)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck size={16} />
                  {confirmandoId === c.id ? 'Confirmando recepción...' : '✅ Confirmar que Recibí el Dinero'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial General de Cortes Validados */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Clock size={18} className="text-purple-400" /> Registro Histórico de Cortes Validados
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 rounded-l-xl">Folio</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Secretaría</th>
                <th className="p-3.5">Colegiaturas</th>
                <th className="p-3.5">Uniformes</th>
                <th className="p-3.5">Total Efectivo</th>
                <th className="p-3.5 rounded-r-xl">Validado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {confirmados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Aún no hay cortes confirmados en el historial.
                  </td>
                </tr>
              ) : (
                confirmados.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-black text-purple-300">{c.folio}</td>
                    <td className="p-3.5 text-slate-400">{new Date(c.fechaCorte).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-white">{c.secretaria?.nombre || 'Secretaría'}</td>
                    <td className="p-3.5 text-blue-300">${Number(c.montoColegiaturas).toFixed(2)}</td>
                    <td className="p-3.5 text-purple-300">${Number(c.montoUniformes).toFixed(2)}</td>
                    <td className="p-3.5 font-black text-emerald-400">${Number(c.totalEfectivo).toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">
                      ✓ {c.confirmadoPor?.nombre || 'Doctora'} ({c.fechaConfirmacion ? new Date(c.fechaConfirmacion).toLocaleDateString() : 'Aprobado'})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CortesDireccion;
