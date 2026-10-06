import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  User, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  DollarSign, 
  FileText,
  KeyRound,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

export default function CuentasSecretarias() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState(null);

  // Modal Crear
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [creando, setCreando] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'secretaria',
  });
  const [showPassCrear, setShowPassCrear] = useState(false);

  // Modal Editar
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [secretariaEdit, setSecretariaEdit] = useState(null);
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    email: '',
    password: '',
  });
  const [showPassEditar, setShowPassEditar] = useState(false);

  // Modal Confirmar Eliminar / Desactivar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const res = await api.get('/civika/personal');
      setPersonal(res.data || []);
    } catch (err) {
      console.error('Error al cargar personal:', err);
      // Fallback para modo demo / sin backend
      setPersonal([
        {
          id: 2,
          nombre: 'Secretaria de Caja y Recepción',
          email: 'secretaria@civika.edu.mx',
          rol: 'secretaria',
          bloqueadoHasta: null,
          creadoEn: new Date().toISOString(),
          _count: { cortesCaja: 4, pagos: 28, ventasUniformes: 12 },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonal();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!formCrear.nombre.trim() || !formCrear.email.trim() || !formCrear.password.trim()) {
      showToast('Campos requeridos', 'Por favor llena todos los campos.', 'error');
      return;
    }
    if (formCrear.password.length < 6) {
      showToast('Contraseña débil', 'La contraseña debe tener mínimo 6 caracteres.', 'error');
      return;
    }

    try {
      setCreando(true);
      await api.post('/civika/personal', formCrear);
      showToast('Secretaria registrada', 'La cuenta ha sido creada exitosamente.');
      setModalCrearOpen(false);
      setFormCrear({ nombre: '', email: '', password: '', rol: 'secretaria' });
      fetchPersonal();
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'No se pudo crear la cuenta.', 'error');
    } finally {
      setCreando(false);
    }
  };

  const handleAbrirEditar = (item) => {
    setSecretariaEdit(item);
    setFormEditar({
      nombre: item.nombre,
      email: item.email,
      password: '',
    });
    setShowPassEditar(false);
    setModalEditarOpen(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!formEditar.nombre.trim() || !formEditar.email.trim()) {
      showToast('Campos requeridos', 'El nombre y correo son obligatorios.', 'error');
      return;
    }

    try {
      setEditando(true);
      const payload = {
        nombre: formEditar.nombre.trim(),
        email: formEditar.email.trim(),
      };
      if (formEditar.password.trim()) {
        payload.password = formEditar.password.trim();
      }

      await api.patch(`/civika/personal/${secretariaEdit.id}`, payload);
      showToast('Cuenta actualizada', 'Los datos del usuario han sido actualizados.');
      setModalEditarOpen(false);
      fetchPersonal();
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'No se pudo actualizar.', 'error');
    } finally {
      setEditando(false);
    }
  };

  const handleToggleBloqueo = async (item) => {
    const estaSuspendida = item.bloqueadoHasta && new Date(item.bloqueadoHasta) > new Date();
    const accion = estaSuspendida ? 'Reactivar' : 'Suspender temporalmente';

    setConfirmConfig({
      title: `${accion} acceso`,
      message: `¿Estás segura de ${accion.toLowerCase()} el acceso de ${item.nombre}? ${
        estaSuspendida
          ? 'Podrá volver a iniciar sesión de inmediato.'
          : 'No podrá iniciar sesión en caja hasta que reactives su cuenta.'
      }`,
      onConfirm: async () => {
        try {
          await api.patch(`/civika/personal/${item.id}/toggle-bloqueo`);
          showToast(
            estaSuspendida ? 'Cuenta reactivada' : 'Cuenta suspendida',
            `El acceso de ${item.nombre} ha sido actualizado.`
          );
          fetchPersonal();
        } catch (err) {
          showToast('Error', 'No se pudo cambiar el estado de la cuenta.', 'error');
        }
      },
    });
    setConfirmOpen(true);
  };

  const handleEliminar = (item) => {
    setConfirmConfig({
      title: 'Eliminar cuenta de personal',
      message: `¿Confirmas eliminar la cuenta de ${item.nombre}? Si ya tiene registros de cobros o cortes, se inhabilitará para conservar el historial de auditoría fiscal.`,
      onConfirm: async () => {
        try {
          await api.delete(`/civika/personal/${item.id}`);
          showToast('Cuenta removida', 'La cuenta ha sido procesada correctamente.');
          fetchPersonal();
        } catch (err) {
          showToast('Error', err.response?.data?.message || 'No se pudo eliminar.', 'error');
        }
      },
    });
    setConfirmOpen(true);
  };

  const filtrados = personal.filter((p) => {
    const term = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.rol?.toLowerCase().includes(term)
    );
  });

  const secretarias = personal.filter((p) => p.rol === 'secretaria');
  const totalActivas = secretarias.filter(
    (s) => !s.bloqueadoHasta || new Date(s.bloqueadoHasta) <= new Date()
  ).length;
  const totalCortes = secretarias.reduce((acc, s) => acc + (s._count?.cortesCaja || 0), 0);
  const totalPagos = secretarias.reduce((acc, s) => acc + (s._count?.pagos || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-slate-900/80 to-slate-900/90 p-6 md:p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Cuentas de Secretarias & Personal
                <Sparkles size={20} className="text-amber-400" />
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Administra los accesos de caja, recepción y cobros de colegiaturas del Colegio Cívika.
              </p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setFormCrear({ nombre: '', email: '', password: '', rol: 'secretaria' });
            setShowPassCrear(false);
            setModalCrearOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all cursor-pointer shrink-0"
        >
          <UserPlus size={18} />
          Nueva Secretaria
        </motion.button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Secretarias</span>
            <Users size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{secretarias.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Cuentas registradas</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Activas en Caja</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{totalActivas}</p>
          <p className="text-[11px] text-slate-400 mt-1">Con acceso habilitado</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cortes de Caja</span>
            <DollarSign size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{totalCortes}</p>
          <p className="text-[11px] text-slate-400 mt-1">Arqueos reportados</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cobros Hechos</span>
            <FileText size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2">{totalPagos}</p>
          <p className="text-[11px] text-slate-400 mt-1">Colegiaturas registradas</p>
        </div>
      </div>

      {/* BUSCADOR Y LISTA */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            onClick={fetchPersonal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer self-end sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* TABLA DE PERSONAL */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Personal</th>
                <th className="py-3 px-4">Rol en Sistema</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Cortes Caja</th>
                <th className="py-3 px-4 text-center">Cobros</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Acciones de Dirección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    {loading ? 'Cargando personal...' : 'No se encontraron cuentas de personal.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((item) => {
                  const estaSuspendida =
                    item.bloqueadoHasta && new Date(item.bloqueadoHasta) > new Date();
                  const esAdmin = item.rol === 'admin';

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            esAdmin 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}>
                            {item.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center gap-2">
                              {item.nombre}
                              {esAdmin && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                                  Dirección General
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">{item.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.rol === 'secretaria'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        }`}>
                          {item.rol === 'secretaria' ? '👩‍💼 Secretaría (Caja)' : '👑 Dirección'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {estaSuspendida ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle size={12} />
                            Suspendida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={12} />
                            Activa
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center font-semibold text-white">
                        {item._count?.cortesCaja || 0}
                      </td>

                      <td className="py-4 px-4 text-center font-semibold text-white">
                        {item._count?.pagos || 0}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Editar datos y contraseña"
                            onClick={() => handleAbrirEditar(item)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>

                          {!esAdmin && (
                            <>
                              <button
                                title={estaSuspendida ? 'Reactivar acceso' : 'Suspender acceso'}
                                onClick={() => handleToggleBloqueo(item)}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                  estaSuspendida
                                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                                }`}
                              >
                                {estaSuspendida ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                              </button>

                              <button
                                title="Eliminar / Inhabilitar"
                                onClick={() => handleEliminar(item)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR SECRETARIA */}
      <Modal
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        title="Registrar Nueva Secretaria de Caja"
      >
        <form onSubmit={handleCrear} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nombre Completo:
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={formCrear.nombre}
                onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                placeholder="Ej. Carmen Ramírez Sánchez"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Correo Electrónico (Acceso):
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={formCrear.email}
                onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
                placeholder="secretaria@civika.edu.mx"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Contraseña de Acceso:
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassCrear ? 'text' : 'password'}
                required
                value={formCrear.password}
                onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassCrear(!showPassCrear)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassCrear ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              La secretaria podrá iniciar sesión con este correo y contraseña para cobrar colegiaturas, vender uniformes y hacer cortes de caja.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalCrearOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creando}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              {creando ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL EDITAR SECRETARIA */}
      <Modal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        title="Editar Cuenta de Personal"
      >
        <form onSubmit={handleEditar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nombre Completo:
            </label>
            <input
              type="text"
              required
              value={formEditar.nombre}
              onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Correo Electrónico:
            </label>
            <input
              type="email"
              required
              value={formEditar.email}
              onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Restablecer Contraseña (Opcional):
            </label>
            <div className="relative">
              <input
                type={showPassEditar ? 'text' : 'password'}
                value={formEditar.password}
                onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })}
                placeholder="Dejar vacío si no deseas cambiarla"
                className="w-full px-3 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassEditar(!showPassEditar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassEditar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Solo escribe una nueva contraseña si la secretaria olvidó su clave anterior.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalEditarOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editando}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
            >
              {editando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        confirmText="Confirmar"
      />
    </div>
  );
}
