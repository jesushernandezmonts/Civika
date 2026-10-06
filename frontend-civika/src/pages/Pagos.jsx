import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import { CreditCard, Plus, Trash2, Search, Calendar, User, AlertCircle, FileSpreadsheet, BellRing, FileText, CheckCircle2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocket from '../hooks/useSocket';
import { generarReciboOficialPDF } from '../utils/receiptGenerator';
import { exportToExcel } from '../utils/excelExporter';
import ModalRecordatorioColegiatura from '../components/ModalRecordatorioColegiatura';

function Pagos() {
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pagosPerPage = 8;
  const [form, setForm] = useState({
    alumnoId: '',
    monto: '',
    mesCorrespondiente: new Date().toLocaleString('default', { month: 'long' }),
  });
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  useEffect(() => {
    fetchPagos();
    fetchAlumnos();
  }, []);

  // Refrescar en tiempo real
  useSocket('pagos:updated', () => {
    fetchPagos();
    fetchAlumnos();
  });

  const fetchPagos = async () => {
    try {
      const { data } = await api.get('/pagos');
      setPagos(data);
    } catch (err) {
      console.error('Error al cargar pagos', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const endpoint = user?.rol === 'profesor' ? '/grupos/alumnos-disponibles' : '/alumnos';
      const { data } = await api.get(endpoint);
      setAlumnos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar alumnos', err);
      setAlumnos([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pagos', {
        ...form,
        alumnoId: parseInt(form.alumnoId),
        monto: parseFloat(form.monto),
        metodoPago: 'efectivo',
      });
      setModalOpen(false);
      setForm({ ...form, alumnoId: '', monto: '' });
      fetchPagos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este registro de pago?')) {
      await api.delete(`/pagos/${id}`);
      fetchPagos();
    }
  };

  const handleDescargarRecibo = async (pago) => {
    try {
      setDownloadingPdfId(pago.id);
      const alumnoNombre = pago.alumno 
        ? `${pago.alumno.nombre} ${pago.alumno.apellidoPaterno || ''} ${pago.alumno.apellidoMaterno || ''}`.trim() 
        : 'Alumno Registrado';
      
      const matricula = pago.alumno?.matricula || `CIV-${pago.alumnoId || pago.alumno?.id || '2026'}`;
      const tutorNombre = pago.alumno?.tutorNombre || pago.alumno?.tutor || 'Padre de Familia / Tutor';
      const folio = `REC-${new Date(pago.fechaPago || Date.now()).getFullYear()}-${String(pago.id).padStart(5, '0')}`;

      await generarReciboOficialPDF({
        folio,
        fecha: pago.fechaPago || new Date(),
        alumnoNombre,
        matricula,
        tutorNombre,
        concepto: `Colegiatura Mensual`,
        mesCorrespondiente: pago.mesCorrespondiente || 'Mes en curso',
        monto: pago.monto,
        metodoPago: pago.metodoPago || 'Efectivo',
        atendio: pago.usuario?.nombre || user?.nombre || 'Administración Cívika'
      });
    } catch (err) {
      console.error('Error generando recibo', err);
      alert('Hubo un error al generar el recibo PDF.');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleExportarExcel = () => {
    if (filteredPagos.length === 0) {
      alert('No hay registros de pago para exportar.');
      return;
    }
    const dataToExport = filteredPagos.map((p) => {
      const alumnoNombre = p.alumno
        ? `${p.alumno.nombre} ${p.alumno.apellidoPaterno || ''} ${p.alumno.apellidoMaterno || ''}`.trim()
        : 'N/A';
      return {
        folio: `REC-${new Date(p.fechaPago || Date.now()).getFullYear()}-${String(p.id).padStart(5, '0')}`,
        alumno: alumnoNombre,
        mes: p.mesCorrespondiente,
        monto: p.monto,
        metodo: p.metodoPago,
        fecha: p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-MX') : 'N/A',
        registradoPor: p.usuario?.nombre || 'Administración'
      };
    });

    const columns = [
      { key: 'folio', header: 'Folio Oficial' },
      { key: 'alumno', header: 'Nombre del Alumno' },
      { key: 'mes', header: 'Mes Correspondiente' },
      { key: 'monto', header: 'Monto Pagado ($)', formatter: (v) => `$${Number(v).toFixed(2)}` },
      { key: 'metodo', header: 'Método de Pago' },
      { key: 'fecha', header: 'Fecha de Registro' },
      { key: 'registradoPor', header: 'Registrado Por' }
    ];

    exportToExcel({
      filename: `Civika-Reporte-Pagos-${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Pagos Registrados',
      columns,
      data: dataToExport
    });
  };

  // Filtrar o estimar alumnos morosos
  const mesActualStr = new Date().toLocaleString('es-MX', { month: 'long' });
  const mesActualCapitalized = mesActualStr.charAt(0).toUpperCase() + mesActualStr.slice(1);
  const alumnosConPago = new Set(
    pagos
      .filter(p => (p.mesCorrespondiente || '').toLowerCase() === mesActualStr.toLowerCase())
      .map(p => p.alumnoId || p.alumno?.id)
  );

  const alumnosMorosos = alumnos
    .filter(a => a.id && !alumnosConPago.has(a.id))
    .map((a, idx) => ({
      id: a.id,
      nombre: `${a.nombre} ${a.apellidoPaterno || ''} ${a.apellidoMaterno || ''}`.trim(),
      matricula: a.matricula || `CIV-${a.id}`,
      grado: a.grado || 'Secundaria / Primaria',
      tutorNombre: a.tutor || a.tutorNombre || 'Tutor de Familia',
      telefonoTutor: a.telefono || a.telefonoTutor || '2471012345',
      emailTutor: a.email || a.emailTutor || '',
      mesAdeudo: mesActualCapitalized,
      monto: 1500,
      diasVencido: 4 + ((idx % 4) * 3)
    }));

  const filteredPagos = pagos.filter(p => {
    const nombre = `${p.alumno?.nombre || ''} ${p.alumno?.apellidoPaterno || ''} ${p.alumno?.apellidoMaterno || ''}`.toLowerCase();
    const mes = (p.mesCorrespondiente || '').toLowerCase();
    const searchTerm = search.toLowerCase();
    return nombre.includes(searchTerm) || mes.includes(searchTerm);
  });
  const totalPages = Math.max(1, Math.ceil(filteredPagos.length / pagosPerPage));
  const startIndex = (currentPage - 1) * pagosPerPage;
  const paginatedPagos = filteredPagos.slice(startIndex, startIndex + pagosPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Registro de Pagos
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Gestiona los ingresos mensuales del centro
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setReminderModalOpen(true)}
            className="flex-1 sm:flex-initial bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold px-4 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer text-sm"
            title="Recordatorio de colegiaturas vencidas a padres vía WhatsApp"
          >
            <BellRing size={18} className="text-amber-400 animate-pulse" />
            <span>Recordar saldos vencidos</span>
          </button>

          <button 
            type="button"
            onClick={handleExportarExcel}
            className="flex-1 sm:flex-initial bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold px-4 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer text-sm"
            title="Exportar registros a archivo Excel (.xlsx)"
          >
            <FileSpreadsheet size={18} className="text-emerald-400" />
            <span>Exportar a Excel</span>
          </button>

          <button 
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Nuevo Pago</span>
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
        <input
          className="w-full bg-slate-800/95 border-2 border-emerald-500/40 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/20 transition-all text-base font-medium"
          placeholder="🔍 Buscar por alumno o mes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="responsive-table-container mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Mes</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Fecha Registro</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando pagos...</td></tr>
              ) : filteredPagos.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-white/20 italic font-medium">No hay registros de pagos.</td></tr>
              ) : (
                paginatedPagos.map((p, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={p.id} 
                    className="hover:bg-slate-800/80 transition-colors group"
                  >
                    <td data-label="Alumno">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white/90">{p.alumno?.nombre} {p.alumno?.apellidoPaterno}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Registrado por: {p.usuario?.nombre}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Mes">
                      <span className="text-white/70 font-medium capitalize">{p.mesCorrespondiente}</span>
                    </td>
                    <td data-label="Monto">
                      <span className="text-emerald-400 font-black text-lg">${p.monto}</span>
                    </td>
                    <td data-label="Método">
                      <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-white/15 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        {p.metodoPago}
                      </span>
                    </td>
                    <td data-label="Fecha">
                      <div className="flex items-center gap-2 text-white/40 text-sm">
                        <Calendar size={14} />
                        {new Date(p.fechaPago).toLocaleDateString()}
                      </div>
                    </td>
                    <td data-label="Acciones" className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => handleDescargarRecibo(p)}
                          disabled={downloadingPdfId === p.id}
                          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                          title="Descargar Recibo Membretado Oficial (PDF con QR de validación)"
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const tel = p.alumno?.telefonoTutor || p.alumno?.telefono || '';
                            const cleanTel = tel.replace(/\D/g, '');
                            const alumnoNombre = p.alumno ? `${p.alumno.nombre} ${p.alumno.apellidoPaterno || ''}`.trim() : 'el alumno';
                            const msg = `*Colegio Cívika* 🎓\nEstimado tutor de *${alumnoNombre}*:\nConfirmamos la recepción de su pago de colegiatura mensual:\n• Folio: REC-${new Date(p.fechaPago || Date.now()).getFullYear()}-${String(p.id).padStart(5, '0')}\n• Mes: ${p.mesCorrespondiente}\n• Monto: $${Number(p.monto).toFixed(2)} MXN\n• Fecha: ${p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-MX') : 'Hoy'}\n\n¡Muchas gracias por su puntualidad!`;
                            const url = cleanTel ? `https://api.whatsapp.com/send?phone=52${cleanTel}&text=${encodeURIComponent(msg)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                            window.open(url, '_blank');
                          }}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all cursor-pointer"
                          title="Compartir comprobante vía WhatsApp con el tutor"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                          title="Eliminar pago"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {!loading && filteredPagos.length > pagosPerPage && (
        <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-950/80 px-5 py-4 shadow-lg shadow-black/20">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Mostrando {startIndex + 1}-{Math.min(startIndex + pagosPerPage, filteredPagos.length)} de {filteredPagos.length} pagos
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-white/15 bg-slate-800/90 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-purple-400/40 hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-slate-800/90 disabled:hover:shadow-none"
            >
              Anterior
            </button>
            <span className="min-w-28 text-center text-xs font-black uppercase tracking-wider text-white/80">
              Página <span className="text-emerald-400">{currentPage}</span> de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/15 bg-slate-800/90 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-purple-400/40 hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-slate-800/90 disabled:hover:shadow-none"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Pago">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Alumno</label>
            <select 
              value={form.alumnoId} 
              onChange={(e) => setForm({...form, alumnoId: e.target.value})}
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              required
            >
              <option value="" className="text-black">Seleccionar alumno</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id} className="text-black">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.monto}
                onChange={(e) => setForm({...form, monto: e.target.value})}
                className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Mes</label>
              <select 
                value={form.mesCorrespondiente}
                onChange={(e) => setForm({...form, mesCorrespondiente: e.target.value})}
                className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(m => (
                  <option key={m} value={m} className="text-black">{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Método de Pago</label>
            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Efectivo</span>
              <span className="text-emerald-400/50 text-xs">(Único método disponible)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              className="px-6 py-3 bg-slate-800/80 hover:bg-slate-800/90 text-white rounded-2xl transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              Confirmar Pago
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Recordatorio de Colegiaturas Vencidas */}
      <ModalRecordatorioColegiatura
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        alumnosMorosos={alumnosMorosos}
        mesActual={mesActualCapitalized}
      />
    </div>
  );
}

export default Pagos;
