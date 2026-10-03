import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Send,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const GRADOS = [
  'Todos',
  'Secundaria 1°',
  'Secundaria 2°',
  'Secundaria 3°',
  'Preparatoria 1°',
  'Preparatoria 2°',
  'Preparatoria 3°'
];

export default function AvisosEscolares() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filtroGrado, setFiltroGrado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form state
  const [form, setForm] = useState({
    titulo: '',
    contenido: '',
    grado: 'Todos',
    prioridad: 'normal'
  });

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/civika/avisos');
      setAvisos(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error', 'No se pudieron cargar los avisos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.contenido.trim()) {
      showToast('Atención', 'Ingresa título y contenido del aviso', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/civika/avisos', form);
      showToast('¡Publicado!', 'Aviso escolar publicado exitosamente');
      setForm({
        titulo: '',
        contenido: '',
        grado: 'Todos',
        prioridad: 'normal'
      });
      fetchAvisos();
    } catch (err) {
      console.error(err);
      showToast('Error', 'No se pudo publicar el aviso', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el aviso "${titulo}"?`)) return;

    try {
      await api.delete(`/civika/avisos/${id}`);
      showToast('Eliminado', 'Aviso escolar eliminado');
      fetchAvisos();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Error al eliminar aviso', 'error');
    }
  };

  const avisosFiltrados = avisos.filter((a) => {
    const coincideGrado = filtroGrado === 'Todos' || a.grado === filtroGrado || a.grado === 'Todos';
    const coincideBusqueda = 
      a.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
      a.contenido.toLowerCase().includes(busqueda.toLowerCase());
    return coincideGrado && coincideBusqueda;
  });

  const getPrioridadBadge = (p) => {
    if (p === 'urgente') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Urgente</span>;
    }
    if (p === 'alta') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Alta</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Normal</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-slate-900/60 to-blue-900/30 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40">
              <Megaphone size={24} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Avisos y Comunicados Escolares</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Publicación oficial de circulares, recordatorios y noticias para tutores y alumnos de Secundaria y Preparatoria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Creación */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl sticky top-6">
            <div className="flex items-center gap-2 mb-4 text-purple-300 font-bold">
              <PlusCircle size={20} />
              <span>Nuevo Comunicado</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título del Aviso *</label>
                <input
                  type="text"
                  placeholder="Ej. Suspensión de labores por CTE"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dirigido a</label>
                  <select
                    value={form.grado}
                    onChange={(e) => setForm({ ...form, grado: e.target.value })}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {GRADOS.map((g) => (
                      <option key={g} value={g} className="bg-slate-900">{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="normal" className="bg-slate-900">Normal</option>
                    <option value="alta" className="bg-slate-900">Alta</option>
                    <option value="urgente" className="bg-slate-900">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mensaje / Contenido *</label>
                <textarea
                  rows={4}
                  placeholder="Escribe el contenido detallado de la circular escolar..."
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200 text-sm disabled:opacity-50"
              >
                <Send size={16} />
                <span>{submitting ? 'Publicando...' : 'Publicar Circular'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Avisos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-white/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por palabra clave..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filtroGrado}
                onChange={(e) => setFiltroGrado(e.target.value)}
                className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g} className="bg-slate-900">Grado: {g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards de Avisos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Cargando comunicados...</p>
            </div>
          ) : avisosFiltrados.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-10 text-center">
              <Megaphone size={40} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Sin avisos escolares</h3>
              <p className="text-xs text-slate-400">
                {busqueda || filtroGrado !== 'Todos' 
                  ? 'No hay comunicados que coincidan con los filtros seleccionados.' 
                  : 'Aún no se ha publicado ningún comunicado. Utiliza el formulario a la izquierda.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {avisosFiltrados.map((aviso) => (
                <div
                  key={aviso.id}
                  className="bg-slate-900/80 border border-white/10 hover:border-purple-500/30 transition-all rounded-2xl p-5 backdrop-blur-md shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPrioridadBadge(aviso.prioridad)}
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {aviso.grado || 'Todos los grados'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 ml-2">
                          <Calendar size={13} />
                          <span>{new Date(aviso.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white pt-1">{aviso.titulo}</h3>
                    </div>

                    <button
                      onClick={() => handleDelete(aviso.id, aviso.titulo)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar aviso"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                    {aviso.contenido}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
