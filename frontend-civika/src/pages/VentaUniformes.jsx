import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Tag, 
  User, 
  Edit3, 
  ShieldCheck, 
  Package, 
  AlertCircle,
  X
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

function VentaUniformes() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [uniformes, setUniformes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState([]);
  const [tab, setTab] = useState(isAdmin ? 'catalogo' : 'caja'); // 'catalogo' | 'caja' | 'historial'

  // Formulario de venta
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [compradorExterno, setCompradorExterno] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [reciboModal, setReciboModal] = useState(null);
  const [searchAlumno, setSearchAlumno] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Gestión de Catálogo y Precios (Admin)
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [nuevoItem, setNuevoItem] = useState({ prenda: '', talla: '', precio: '', stock: 0 });
  const [guardandoPrenda, setGuardandoPrenda] = useState(false);
  const [filtroCatalogo, setFiltroCatalogo] = useState('todas');
  const [searchCatalogo, setSearchCatalogo] = useState('');

  useEffect(() => {
    fetchCatalogos();
    fetchVentas();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const [resUniformes, resAlumnos] = await Promise.all([
        api.get('/civika/uniformes'),
        api.get('/alumnos'),
      ]);
      setUniformes(resUniformes.data);
      setAlumnos(resAlumnos.data);
    } catch (err) {
      console.error('Error cargando uniformes o alumnos', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVentas = async () => {
    try {
      const res = await api.get('/civika/uniformes/ventas');
      setVentas(res.data);
    } catch (err) {
      console.error('Error cargando ventas', err);
    }
  };

  // Crear uniforme (Admin)
  const handleCrearUniforme = async (e) => {
    e.preventDefault();
    if (!nuevoItem.prenda.trim() || !nuevoItem.talla.trim() || !nuevoItem.precio) {
      alert('Por favor completa prenda, talla y precio.');
      return;
    }
    setGuardandoPrenda(true);
    try {
      await api.post('/civika/uniformes', {
        prenda: nuevoItem.prenda.trim(),
        talla: nuevoItem.talla.trim(),
        precio: parseFloat(nuevoItem.precio),
        stock: parseInt(nuevoItem.stock || 0, 10),
      });
      setModalCrear(false);
      setNuevoItem({ prenda: '', talla: '', precio: '', stock: 0 });
      await fetchCatalogos();
    } catch (err) {
      console.error('Error al crear uniforme', err);
      alert(err.response?.data?.message || 'Error al guardar el uniforme');
    } finally {
      setGuardandoPrenda(false);
    }
  };

  // Actualizar precio / stock (Admin)
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!modalEditar) return;
    setGuardandoPrenda(true);
    try {
      await api.patch(`/civika/uniformes/${modalEditar.id}`, {
        prenda: modalEditar.prenda.trim(),
        talla: modalEditar.talla.trim(),
        precio: parseFloat(modalEditar.precio),
        stock: parseInt(modalEditar.stock || 0, 10),
      });
      setModalEditar(null);
      await fetchCatalogos();
    } catch (err) {
      console.error('Error al actualizar uniforme', err);
      alert(err.response?.data?.message || 'Error al actualizar el uniforme');
    } finally {
      setGuardandoPrenda(false);
    }
  };

  // Eliminar / Desactivar uniforme (Admin)
  const handleEliminarUniforme = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${nombre}" del catálogo?`)) return;
    try {
      await api.delete(`/civika/uniformes/${id}`);
      await fetchCatalogos();
    } catch (err) {
      console.error('Error al eliminar uniforme', err);
      alert('No se pudo eliminar el uniforme');
    }
  };

  const agregarAlCarrito = (u) => {
    const existeIndex = carrito.findIndex((item) => item.id === u.id);
    if (existeIndex >= 0) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[existeIndex].cantidad += 1;
      nuevoCarrito[existeIndex].subtotal = nuevoCarrito[existeIndex].cantidad * Number(u.precio);
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([
        ...carrito,
        {
          id: u.id,
          prenda: u.prenda,
          talla: u.talla,
          precioUnitario: Number(u.precio),
          cantidad: 1,
          subtotal: Number(u.precio),
        },
      ]);
    }
  };

  const cambiarCantidad = (index, delta) => {
    const nuevoCarrito = [...carrito];
    const nuevaCant = nuevoCarrito[index].cantidad + delta;
    if (nuevaCant <= 0) {
      nuevoCarrito.splice(index, 1);
    } else {
      nuevoCarrito[index].cantidad = nuevaCant;
      nuevoCarrito[index].subtotal = nuevaCant * nuevoCarrito[index].precioUnitario;
    }
    setCarrito(nuevoCarrito);
  };

  const totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCobrar = async () => {
    if (carrito.length === 0) {
      alert('Agrega al menos una prenda al carrito');
      return;
    }
    const nombreComprador = alumnoSeleccionado
      ? `${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellidoPaterno} (${alumnoSeleccionado.grado || 'Colegio Cívika'})`
      : compradorExterno || 'Público General / Tutor';

    setGuardando(true);
    try {
      const { data } = await api.post('/civika/uniformes/venta', {
        alumnoId: alumnoSeleccionado ? alumnoSeleccionado.id : undefined,
        comprador: nombreComprador,
        detalles: carrito,
        total: totalVenta,
        metodoPago,
      });

      setReciboModal(data);
      setCarrito([]);
      setAlumnoSeleccionado(null);
      setCompradorExterno('');
      fetchVentas();
      fetchCatalogos();
    } catch (err) {
      console.error('Error al registrar venta', err);
      alert('Ocurrió un error al registrar la venta');
    } finally {
      setGuardando(false);
    }
  };

  const alumnosFiltrados = alumnos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(searchAlumno.toLowerCase()) ||
      a.apellidoPaterno.toLowerCase().includes(searchAlumno.toLowerCase()) ||
      (a.matricula && a.matricula.toLowerCase().includes(searchAlumno.toLowerCase()))
  );

  const tiposPrendas = ['todas', ...Array.from(new Set(uniformes.map((u) => u.prenda)))];

  const uniformesFiltrados = uniformes.filter((u) => {
    const matchFiltro = filtroCatalogo === 'todas' || u.prenda === filtroCatalogo;
    const matchSearch =
      u.prenda.toLowerCase().includes(searchCatalogo.toLowerCase()) ||
      u.talla.toLowerCase().includes(searchCatalogo.toLowerCase());
    return matchFiltro && matchSearch;
  });

  return (
    <div className="space-y-6 font-['Outfit'] pb-12">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Venta de Uniformes</h1>
              <p className="text-sm font-semibold text-purple-300/80">
                Control de Caja y Mostrador — {APP_CONFIG.appName}
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas según rol */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {isAdmin && (
            <button
              onClick={() => setTab('catalogo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'catalogo'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag size={14} /> Catálogo & Precios (Admin)
            </button>
          )}
          <button
            onClick={() => setTab('caja')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'caja'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={14} /> Mostrador de Venta
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'historial'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={14} /> Historial de Ventas
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CATÁLOGO Y PRECIOS (ADMIN) */}
      {tab === 'catalogo' && isAdmin && (
        <div className="space-y-6">
          {/* Banner explicativo */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Administración de Precios y Catálogo Oficial</h3>
                <p className="text-xs text-slate-300">
                  Los precios y stock que definas aquí se actualizan automáticamente en el mostrador de las secretarias para su venta.
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalCrear(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-900/40 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={16} /> Nueva Prenda / Talla
            </button>
          </div>

          {/* Filtros de búsqueda */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar prenda o talla..."
                value={searchCatalogo}
                onChange={(e) => setSearchCatalogo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {tiposPrendas.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroCatalogo(tipo)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filtroCatalogo === tipo
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tipo === 'todas' ? 'Todas las Prendas' : tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Uniformes con Edición de Precios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uniformesFiltrados.map((u) => (
              <div
                key={u.id}
                className="p-5 rounded-3xl bg-slate-900/95 border border-white/10 hover:border-purple-500/50 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Talla: {u.talla}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        u.stock > 10
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : u.stock > 0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Stock: {u.stock}
                    </span>
                  </div>

                  <h3 className="font-black text-white text-base mb-1">{u.prenda}</h3>
                  <p className="text-xs text-slate-400">Prenda escolar oficial</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Precio Oficial</span>
                    <span className="text-xl font-black text-emerald-400">${Number(u.precio).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModalEditar({ ...u })}
                      className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition cursor-pointer"
                      title="Modificar precio o stock"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleEliminarUniforme(u.id, `${u.prenda} (Talla ${u.talla})`)}
                      className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/30 text-rose-400 transition cursor-pointer"
                      title="Eliminar prenda"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CAJA REGISTRADORA / VENTA (MOSTRADOR) */}
      {tab === 'caja' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Catálogo de Uniformes para Cobrar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Tag size={18} className="text-purple-400" /> Catálogo de Prendas Escolares
                </h2>
                {!isAdmin && (
                  <span className="text-[11px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={13} className="text-purple-400" /> Precios fijados por Dirección General
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {uniformes.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => agregarAlCarrito(u)}
                    className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Talla: {u.talla}
                        </span>
                        <span className="text-[11px] text-slate-400">Stock: {u.stock}</span>
                      </div>
                      <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm">
                        {u.prenda}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <span className="text-base font-black text-emerald-400">
                        ${Number(u.precio).toFixed(2)}
                      </span>
                      <span className="p-1.5 rounded-xl bg-purple-600/30 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Plus size={16} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Carrito y Cobro */}
          <div className="space-y-4">
            <div className="bg-slate-900/95 border border-purple-500/30 rounded-3xl p-6 shadow-2xl sticky top-4">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-purple-400" /> Resumen de Venta
              </h2>

              {/* Asignar Alumno */}
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Asignar a Alumno o Tutor:
                </label>

                {alumnoSeleccionado ? (
                  <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-white">
                        {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellidoPaterno}
                      </p>
                      <p className="text-xs text-purple-300 font-semibold">
                        {alumnoSeleccionado.grado || 'Sin grado'} · Matrícula: {alumnoSeleccionado.matricula || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => setAlumnoSeleccionado(null)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar alumno por nombre o matrícula..."
                        value={searchAlumno}
                        onChange={(e) => setSearchAlumno(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    {searchAlumno.trim().length > 1 && (
                      <div className="max-h-36 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl p-1 space-y-1">
                        {alumnosFiltrados.slice(0, 5).map((a) => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setAlumnoSeleccionado(a);
                              setSearchAlumno('');
                            }}
                            className="p-2 hover:bg-purple-600/30 rounded-lg cursor-pointer text-xs flex justify-between items-center"
                          >
                            <span className="font-bold text-white">
                              {a.nombre} {a.apellidoPaterno}
                            </span>
                            <span className="text-[10px] text-purple-300">{a.grado || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="O escribe nombre del comprador / tutor..."
                      value={compradorExterno}
                      onChange={(e) => setCompradorExterno(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Items en el carrito */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto mb-4">
                {carrito.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    El carrito está vacío. Selecciona prendas del catálogo.
                  </p>
                ) : (
                  carrito.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-white truncate">{item.prenda}</p>
                        <p className="text-[10px] text-purple-300">
                          Talla: {item.talla} · ${item.precioUnitario} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => cambiarCantidad(idx, -1)}
                          className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold hover:bg-slate-600"
                        >
                          -
                        </button>
                        <span className="font-black text-white w-4 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(idx, 1)}
                          className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold hover:bg-slate-600"
                        >
                          +
                        </button>
                        <span className="font-black text-emerald-400 w-16 text-right">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Método de Pago */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('efectivo')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      metodoPago === 'efectivo'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('transferencia')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      metodoPago === 'transferencia'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    💳 Transferencia
                  </button>
                </div>
              </div>

              {/* Total y Botón de Cobro */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-300">Total a Cobrar:</span>
                  <span className="text-2xl font-black text-emerald-400">${totalVenta.toFixed(2)}</span>
                </div>

                <button
                  disabled={carrito.length === 0 || guardando}
                  onClick={handleCobrar}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle size={18} />
                  {guardando ? 'Registrando cobro...' : 'Cobrar e Imprimir Recibo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Pestaña Historial de Ventas */
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" /> Registro de Ventas Realizadas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Folio</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Comprador</th>
                  <th className="p-3.5">Prendas</th>
                  <th className="p-3.5">Método</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5 rounded-r-xl text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No hay ventas de uniformes registradas aún.
                    </td>
                  </tr>
                ) : (
                  ventas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-black text-purple-300">{v.folio}</td>
                      <td className="p-3.5 text-slate-400">{new Date(v.fecha).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-white">{v.comprador}</td>
                      <td className="p-3.5 text-slate-300">
                        {Array.isArray(v.detalles)
                          ? v.detalles.map((d, i) => `${d.cantidad}x ${d.prenda} (T-${d.talla})`).join(', ')
                          : 'Prendas'}
                      </td>
                      <td className="p-3.5 capitalize font-medium">{v.metodoPago}</td>
                      <td className="p-3.5 font-black text-emerald-400">${Number(v.total).toFixed(2)}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setReciboModal(v)}
                          className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg font-bold border border-purple-500/30 transition flex items-center gap-1 mx-auto"
                        >
                          <Printer size={13} /> Recibo
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE RECIBO DIGITAL IMPRIMIBLE */}
      {reciboModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative font-sans">
            {/* Cabecera del recibo */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-purple-600 flex items-center justify-center p-1 bg-white">
                <img src={APP_CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{APP_CONFIG.appName}</h3>
              <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">{APP_CONFIG.appSubName}</p>
              <p className="text-[11px] text-slate-500 mt-1">COMPROBANTE DE VENTA DE UNIFORMES</p>
            </div>

            {/* Datos del folio */}
            <div className="py-3 border-b border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio:</span>
                <span className="font-black text-purple-800">{reciboModal.folio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha:</span>
                <span className="font-bold">{new Date(reciboModal.fecha).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comprador:</span>
                <span className="font-bold text-slate-800">{reciboModal.comprador}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-bold capitalize">{reciboModal.metodoPago}</span>
              </div>
            </div>

            {/* Lista de prendas */}
            <div className="py-3 border-b border-slate-200 text-xs space-y-2">
              <p className="font-black text-slate-700 uppercase tracking-wider text-[10px]">Detalle de Artículos:</p>
              {Array.isArray(reciboModal.detalles) &&
                reciboModal.detalles.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{d.prenda}</p>
                      <p className="text-[10px] text-slate-500">
                        {d.cantidad} pza(s) · Talla: {d.talla}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">${Number(d.subtotal).toFixed(2)}</span>
                  </div>
                ))}
            </div>

            {/* Total */}
            <div className="pt-3 pb-4 flex justify-between items-center">
              <span className="text-sm font-black text-slate-800">TOTAL PAGADO:</span>
              <span className="text-2xl font-black text-purple-900">
                ${Number(reciboModal.total).toFixed(2)} MXN
              </span>
            </div>

            <p className="text-[10px] text-center text-slate-400 italic mb-4">
              Gracias por su compra. Conserve este comprobante para cualquier aclaración de talla.
            </p>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Recibo
              </button>
              <button
                onClick={() => setReciboModal(null)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADMIN: NUEVA PRENDA / TALLA */}
      {modalCrear && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Agregar al Catálogo</h3>
                  <p className="text-xs text-purple-300">Fija el precio oficial de venta</p>
                </div>
              </div>
              <button
                onClick={() => setModalCrear(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearUniforme} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Prenda:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Suéter Escolar Oficial, Playera Polo..."
                  value={nuevoItem.prenda}
                  onChange={(e) => setNuevoItem({ ...nuevoItem, prenda: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Talla:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 14, 16, CH, M, G..."
                    value={nuevoItem.talla}
                    onChange={(e) => setNuevoItem({ ...nuevoItem, talla: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Precio Oficial ($ MXN):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      required
                      placeholder="0.00"
                      value={nuevoItem.precio}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, precio: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-800 border border-purple-500/50 rounded-xl text-sm font-black text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Piezas en Stock (Existencias):</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={nuevoItem.stock}
                  onChange={(e) => setNuevoItem({ ...nuevoItem, stock: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPrenda}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-900/40 transition cursor-pointer flex items-center gap-1.5"
                >
                  {guardandoPrenda ? 'Guardando...' : 'Guardar en Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN: EDITAR PRECIO / STOCK */}
      {modalEditar && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Modificar Precio & Stock</h3>
                  <p className="text-xs text-purple-300">Actualiza los datos oficiales de la prenda</p>
                </div>
              </div>
              <button
                onClick={() => setModalEditar(null)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Prenda:</label>
                <input
                  type="text"
                  required
                  value={modalEditar.prenda}
                  onChange={(e) => setModalEditar({ ...modalEditar, prenda: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Talla:</label>
                  <input
                    type="text"
                    required
                    value={modalEditar.talla}
                    onChange={(e) => setModalEditar({ ...modalEditar, talla: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Precio Oficial ($ MXN):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      required
                      value={modalEditar.precio}
                      onChange={(e) => setModalEditar({ ...modalEditar, precio: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-800 border border-purple-500/60 rounded-xl text-sm font-black text-emerald-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Piezas en Stock (Existencias):</label>
                <input
                  type="number"
                  min="0"
                  value={modalEditar.stock}
                  onChange={(e) => setModalEditar({ ...modalEditar, stock: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 flex items-start gap-2">
                <ShieldCheck size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <span>Al guardar, este nuevo precio se aplicará automáticamente en el punto de cobro de secretaría.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalEditar(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPrenda}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-900/40 transition cursor-pointer flex items-center gap-1.5"
                >
                  {guardandoPrenda ? 'Guardando...' : 'Actualizar Prenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VentaUniformes;
