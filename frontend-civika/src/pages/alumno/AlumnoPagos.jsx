import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { 
  Loader2, 
  CreditCard, 
  ShoppingBag, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Eye, 
  X,
  FileText
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

export default function AlumnoPagos() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState([]);
  const [ventasUniformes, setVentasUniformes] = useState([]);
  const [tabActiva, setTabActiva] = useState('colegiaturas'); // 'colegiaturas' | 'uniformes'
  const [reciboModal, setReciboModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pagosRes, perfilRes] = await Promise.all([
          api.get('/alumnos/me/pagos').catch(() => ({ data: [] })),
          api.get('/alumnos/me/perfil').catch(() => ({ data: {} })),
        ]);
        setPagos(pagosRes.data || []);

        const alumnoId = perfilRes.data?.id || alumno?.id;
        if (alumnoId) {
          const uniformesRes = await api.get(`/civika/uniformes/ventas?alumnoId=${alumnoId}`).catch(() => ({ data: [] }));
          setVentasUniformes(uniformesRes.data || []);
        }
      } catch (err) {
        console.error('Error loading pagos/uniformes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [alumno]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  const totalColegiaturas = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  const totalUniformes = ventasUniformes.reduce((sum, v) => sum + Number(v.total), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-900/40 via-slate-900/60 to-blue-900/30 p-6 rounded-3xl border border-purple-500/20 backdrop-blur-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Recibos & Pagos
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Historial de colegiaturas y uniformes escolares en {APP_CONFIG.appName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl px-5 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Colegiaturas Pagadas</p>
            <p className="text-xl font-black text-white">${totalColegiaturas.toFixed(2)}</p>
          </div>
          <div className="bg-slate-950/70 border border-purple-500/30 rounded-2xl px-5 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-400">Total en Uniformes</p>
            <p className="text-xl font-black text-white">${totalUniformes.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setTabActiva('colegiaturas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
            tabActiva === 'colegiaturas'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard size={16} />
          <span>Colegiaturas ({pagos.length})</span>
        </button>

        <button
          onClick={() => setTabActiva('uniformes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
            tabActiva === 'uniformes'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShoppingBag size={16} />
          <span>Uniformes Escolares ({ventasUniformes.length})</span>
        </button>
      </div>

      {/* Tabla Colegiaturas */}
      {tabActiva === 'colegiaturas' && (
        <>
          {pagos.length === 0 ? (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-12 text-center">
              <CreditCard size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">No hay recibos de colegiatura registrados aún.</p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-white/10">
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Concepto / Mes</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Monto</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Método de Pago</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Fecha</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Estatus</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Recibo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="text-white font-medium capitalize">Colegiatura - {p.mesCorrespondiente}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-emerald-400 font-black text-lg">${Number(p.monto).toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold">
                            {p.metodoPago || 'Efectivo en ventanilla'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar size={14} />
                            {new Date(p.fechaPago).toLocaleDateString('es-MX')}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 size={15} />
                            Pagado
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setReciboModal({ tipo: 'colegiatura', item: p })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Ver Recibo</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tabla Uniformes */}
      {tabActiva === 'uniformes' && (
        <>
          {ventasUniformes.length === 0 ? (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-12 text-center">
              <ShoppingBag size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">No hay compras de uniformes registradas para este alumno.</p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-white/10">
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Folio</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Prendas Adquiridas</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Total</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Fecha</th>
                      <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ventasUniformes.map((v) => {
                      const detalles = Array.isArray(v.detalles) ? v.detalles : [];
                      return (
                        <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 font-mono text-purple-300 font-bold text-sm">
                            {v.folio}
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              {detalles.map((d, idx) => (
                                <div key={idx} className="text-xs text-white">
                                  <span className="font-bold">{d.cantidad}x </span>
                                  <span>{d.prenda} (Talla {d.talla})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-emerald-400 font-black text-lg">${Number(v.total).toFixed(2)}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs">
                            {new Date(v.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setReciboModal({ tipo: 'uniforme', item: v })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Ver Ticket</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Recibo Imprimible */}
      {reciboModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="text-purple-400" size={20} />
                <h3 className="font-bold text-white text-base">Comprobante Oficial de Pago</h3>
              </div>
              <button 
                onClick={() => setReciboModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Recibo Printable Body */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl space-y-4 shadow-inner text-xs font-mono">
              <div className="text-center border-b pb-3 border-slate-200">
                <h4 className="font-black text-sm uppercase tracking-wider">{APP_CONFIG.appName}</h4>
                <p className="text-[10px] text-slate-500">{APP_CONFIG.appSubName}</p>
                <p className="text-[10px] text-slate-500 mt-1">Huamantla, Tlaxcala</p>
              </div>

              {reciboModal.tipo === 'colegiatura' ? (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Folio:</span>
                    <span className="font-bold">REC-COL-00{reciboModal.item.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Fecha:</span>
                    <span>{new Date(reciboModal.item.fechaPago).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Concepto:</span>
                    <span className="font-bold">Colegiatura {reciboModal.item.mesCorrespondiente}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Método de Pago:</span>
                    <span>{reciboModal.item.metodoPago || 'Efectivo'}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-black">
                    <span>TOTAL PAGADO:</span>
                    <span className="text-base text-emerald-700">${Number(reciboModal.item.monto).toFixed(2)} MXN</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Folio Uniforme:</span>
                    <span className="font-bold">{reciboModal.item.folio}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Fecha:</span>
                    <span>{new Date(reciboModal.item.fecha).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="border-t border-b border-slate-200 py-2 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Detalle de Prendas:</span>
                    {(Array.isArray(reciboModal.item.detalles) ? reciboModal.item.detalles : []).map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{d.cantidad}x {d.prenda} (Talla {d.talla})</span>
                        <span>${Number(d.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm font-black pt-1">
                    <span>TOTAL:</span>
                    <span className="text-base text-emerald-700">${Number(reciboModal.item.total).toFixed(2)} MXN</span>
                  </div>
                </>
              )}

              <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-slate-100">
                Documento administrativo de control escolar.<br />
                ¡Gracias por su puntualidad en sus pagos!
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition-all text-xs cursor-pointer"
              >
                <Printer size={15} />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
