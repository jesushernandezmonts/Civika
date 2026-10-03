import { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, CheckCircle2, Send, Clock, AlertCircle, FileText, Check, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

function CorteCaja() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState({
    totalColegiaturas: 0,
    totalUniformes: 0,
    totalEfectivo: 0,
    cantidadPagosColegiatura: 0,
    cantidadVentasUniformes: 0,
  });
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resResumen, resCortes] = await Promise.all([
        api.get('/civika/cortes/resumen-actual'),
        api.get('/civika/cortes'),
      ]);
      setResumen(resResumen.data);
      setCortes(resCortes.data);
    } catch (err) {
      console.error('Error cargando corte de caja', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCorte = async () => {
    if (resumen.totalEfectivo <= 0 && !confirm('El efectivo acumulado es $0.00. ¿Deseas generar el corte de caja de todas formas?')) {
      return;
    }
    setProcesando(true);
    try {
      await api.post('/civika/cortes/crear', {
        secretariaId: user?.id,
        observaciones,
      });
      setObservaciones('');
      await cargarDatos();
      alert('¡Corte de caja generado exitosamente! Ahora puedes notificar la entrega física a la Doctora.');
    } catch (err) {
      console.error('Error al crear corte', err);
      alert('Error al generar el corte de caja');
    } finally {
      setProcesando(false);
    }
  };

  const handleNotificarEntrega = async (corteId) => {
    if (!confirm('¿Confirmas que ya entregaste este dinero en efectivo físicamente a la Doctora (Dirección)?')) {
      return;
    }
    try {
      await api.post(`/civika/cortes/${corteId}/entregar`);
      await cargarDatos();
      alert('¡Entrega notificada a Dirección! La Doctora recibirá la solicitud para confirmar la recepción en su panel.');
    } catch (err) {
      console.error('Error al notificar entrega', err);
      alert('Error al notificar la entrega');
    }
  };

  return (
    <div className="space-y-8 font-['Outfit'] pb-12">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
          <DollarSign size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Corte de Caja y Traspaso</h1>
          <p className="text-sm font-semibold text-purple-300/80">
            Control de Efectivo y Notificación de Entrega a Dirección (Doctora)
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen en Efectivo del Turno */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Colegiaturas Cobradas Hoy
          </p>
          <p className="text-3xl font-black text-blue-400">
            ${Number(resumen.totalColegiaturas).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {resumen.cantidadPagosColegiatura} pago(s) registrado(s)
          </p>
        </div>

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Venta de Uniformes Hoy
          </p>
          <p className="text-3xl font-black text-purple-400">
            ${Number(resumen.totalUniformes).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {resumen.cantidadVentasUniformes} nota(s) de uniformes
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
            Total Efectivo en Caja
          </p>
          <p className="text-3xl font-black text-emerald-400">
            ${Number(resumen.totalEfectivo).toFixed(2)} MXN
          </p>
          <p className="text-xs text-emerald-400/80 mt-2 font-semibold">
            Dinero físico listo para entregar a Dirección
          </p>
        </div>
      </div>

      {/* Formulario de Cierre de Caja */}
      <div className="bg-slate-900/95 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-purple-400" /> Generar Nuevo Corte de Caja
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Al generar el corte, se congelan los cobros realizados en el turno y se crea el comprobante digital para entregarle el dinero en efectivo a la Doctora (Dirección General).
        </p>

        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Observaciones o notas del turno (Opcional):
          </label>
          <textarea
            rows="2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ejemplo: Se entregan $3,500 en billetes de 500 y monedas correspondientes al turno matutino..."
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          onClick={handleCrearCorte}
          disabled={procesando}
          className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 size={16} />
          {procesando ? 'Generando corte...' : 'Generar Corte y Preparar Traspaso'}
        </button>
      </div>

      {/* Historial de Cortes de Caja y Entregas */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Clock size={18} className="text-purple-400" /> Historial de Cortes y Entregas a Dirección
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 rounded-l-xl">Folio</th>
                <th className="p-3.5">Fecha Corte</th>
                <th className="p-3.5">Secretaría</th>
                <th className="p-3.5">Colegiaturas</th>
                <th className="p-3.5">Uniformes</th>
                <th className="p-3.5">Total Efectivo</th>
                <th className="p-3.5">Estatus de Entrega</th>
                <th className="p-3.5 rounded-r-xl text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cortes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No se han generado cortes de caja todavía.
                  </td>
                </tr>
              ) : (
                cortes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-black text-purple-300">{c.folio}</td>
                    <td className="p-3.5 text-slate-400">{new Date(c.fechaCorte).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-white">{c.secretaria?.nombre || 'Secretaría'}</td>
                    <td className="p-3.5 text-blue-300 font-bold">${Number(c.montoColegiaturas).toFixed(2)}</td>
                    <td className="p-3.5 text-purple-300 font-bold">${Number(c.montoUniformes).toFixed(2)}</td>
                    <td className="p-3.5 font-black text-emerald-400 text-sm">
                      ${Number(c.totalEfectivo).toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      {c.estatus === 'pendiente_entrega' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                          <Clock size={12} /> Pendiente de Entrega
                        </span>
                      )}
                      {c.estatus === 'entregado_a_direccion' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 w-max">
                          <Send size={12} /> Entregado a Dirección
                        </span>
                      )}
                      {c.estatus === 'confirmado_por_direccion' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <Check size={12} /> Recibido por la Doctora
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {c.estatus === 'pendiente_entrega' ? (
                        <button
                          onClick={() => handleNotificarEntrega(c.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1 mx-auto"
                        >
                          <Send size={13} /> Avisar que entregué el dinero
                        </button>
                      ) : c.estatus === 'entregado_a_direccion' ? (
                        <span className="text-[11px] text-slate-400 italic">En espera de que la Doctora valide</span>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold">
                          ✓ Confirmado el {c.fechaConfirmacion ? new Date(c.fechaConfirmacion).toLocaleDateString() : ''}
                        </span>
                      )}
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

export default CorteCaja;
