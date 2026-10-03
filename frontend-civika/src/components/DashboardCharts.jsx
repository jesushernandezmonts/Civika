import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight, CheckCircle2, DollarSign, Calendar, Layers } from 'lucide-react';

export default function DashboardCharts({ civikaStats = {} }) {
  const [activeMonthHover, setActiveMonthHover] = useState(null);

  // Datos simulados realistas de cobranza mensual 2026
  const dataCobranza = [
    { mes: 'Ene', cobrado: 48500, morosidad: 6200, totalEsperado: 54700 },
    { mes: 'Feb', cobrado: 52000, morosidad: 4500, totalEsperado: 56500 },
    { mes: 'Mar', cobrado: 51200, morosidad: 5800, totalEsperado: 57000 },
    { mes: 'Abr', cobrado: 49800, morosidad: 7100, totalEsperado: 56900 },
    { mes: 'May', cobrado: 54000, morosidad: 3200, totalEsperado: 57200 },
    { mes: 'Jun', cobrado: 53500, morosidad: 3800, totalEsperado: 57300 },
    { mes: 'Jul', cobrado: 46000, morosidad: 11000, totalEsperado: 57000 },
    { mes: 'Ago', cobrado: 68000, morosidad: 4200, totalEsperado: 72200 }, // Reinscripciones
    { mes: 'Sep', cobrado: 58500, morosidad: 5100, totalEsperado: 63600 },
    { mes: 'Oct', cobrado: Number(civikaStats.totalColegiaturas || 45200), morosidad: 9500, totalEsperado: 54700 },
    { mes: 'Nov', cobrado: 0, morosidad: 0, totalEsperado: 55000, futuro: true },
    { mes: 'Dic', cobrado: 0, morosidad: 0, totalEsperado: 55000, futuro: true },
  ];

  const maxVal = Math.max(...dataCobranza.map(d => d.totalEsperado || 1));

  // Datos de prendas de uniformes más demandadas
  const prendasData = [
    { prenda: 'Playera Polo Oficial', talla: 'Tallas 14-16', vendidas: 94, ingresos: 26320, stock: 45, estado: 'suficiente' },
    { prenda: 'Suéter Escolar Oficial', talla: 'Tallas CH-M', vendidas: 76, ingresos: 38760, stock: 12, estado: 'bajo' },
    { prenda: 'Pans Deportivo Completo', talla: 'Tallas 16-CH', vendidas: 68, ingresos: 44200, stock: 8, estado: 'critico' },
    { prenda: 'Pantalón Escolar Gabardina', talla: 'Tallas 30-32', vendidas: 52, ingresos: 19760, stock: 24, estado: 'suficiente' },
    { prenda: 'Falda Escolar Oficial', talla: 'Tallas 14-16', vendidas: 41, ingresos: 14350, stock: 19, estado: 'suficiente' },
  ];

  const maxPrendas = Math.max(...prendasData.map(p => p.vendidas));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. GRÁFICA DE TENDENCIA DE COBRANZA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="lg:col-span-7 bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              <TrendingUp size={16} />
              <span>Flujo de Cobranza Mensual</span>
            </div>
            <h3 className="text-xl font-black text-white">Colegiaturas Cobradas vs Morosidad</h3>
            <p className="text-xs text-slate-400">Comparativa histórica de ingresos y saldos vencidos</p>
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 text-xs font-semibold shrink-0 bg-slate-950/60 border border-white/10 px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span>Cobrado</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
              <span>Pendiente</span>
            </div>
          </div>
        </div>

        {/* Gráfica de Barras Interactivas */}
        <div className="relative pt-6 pb-2">
          {/* Tooltip dinámico al pasar el cursor */}
          {activeMonthHover && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 right-4 bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-[11px] shadow-xl text-white z-20 flex items-center gap-3"
            >
              <span className="font-bold text-purple-300">{activeMonthHover.mes} 2026:</span>
              <span className="text-emerald-400 font-bold">Cobrado: ${activeMonthHover.cobrado.toLocaleString()}</span>
              {activeMonthHover.morosidad > 0 && (
                <span className="text-rose-400 font-bold">Pendiente: ${activeMonthHover.morosidad.toLocaleString()}</span>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-52 border-b border-white/10 pb-2">
            {dataCobranza.map((item, idx) => {
              const pctCobrado = (item.cobrado / maxVal) * 100;
              const pctMoroso = (item.morosidad / maxVal) * 100;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => !item.futuro && setActiveMonthHover(item)}
                  onMouseLeave={() => setActiveMonthHover(null)}
                >
                  <div className="w-full max-w-[28px] flex flex-col justify-end items-center h-full relative">
                    {item.futuro ? (
                      <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-t-lg h-12" />
                    ) : (
                      <div className="w-full flex flex-col justify-end items-center h-full">
                        {/* Barra morosa (rojo arriba) */}
                        {item.morosidad > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${pctMoroso}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.03 }}
                            className="w-full bg-rose-500/80 hover:bg-rose-400 rounded-t-sm transition-colors"
                          />
                        )}
                        {/* Barra cobrado (verde abajo) */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pctCobrado}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.03 }}
                          className={`w-full bg-gradient-to-t from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-colors ${item.morosidad === 0 ? 'rounded-t-sm' : ''}`}
                        />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${item.mes === 'Oct' ? 'text-emerald-400 underline font-black' : 'text-slate-400'}`}>
                    {item.mes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 text-[11px] text-slate-400 border-t border-white/5">
          <span>Tasa de Recuperación Promedio: <strong className="text-emerald-400">91.4%</strong></span>
          <span className="text-purple-400 font-semibold">• Los cobros vencen los días 10 de cada mes</span>
        </div>
      </motion.div>

      {/* 2. GRÁFICA DE UNIFORMES Y DEMANDA DE INVENTARIO */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="lg:col-span-5 bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-wider">
              <ShoppingBag size={16} />
              <span>Rotación de Inventario</span>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
              Ciclo 2026-2027
            </span>
          </div>
          <h3 className="text-xl font-black text-white">Prendas Más Vendidas</h3>
          <p className="text-xs text-slate-400 mb-5">Demanda de piezas oficiales para planificar resurtido</p>

          <div className="space-y-4">
            {prendasData.map((item, idx) => {
              const pct = (item.vendidas / maxPrendas) * 100;
              return (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-purple-300 transition-colors">{item.prenda}</span>
                      <span className="text-[10px] text-slate-400">({item.talla})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{item.vendidas} pzas</span>
                      {item.estado === 'critico' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          Stock Crítico ({item.stock})
                        </span>
                      ) : item.estado === 'bajo' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          Stock Bajo ({item.stock})
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          {item.stock} disp.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${
                        item.estado === 'critico'
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Ingreso total por uniformes:</span>
          <span className="font-black text-purple-300 text-sm">
            ${prendasData.reduce((acc, p) => acc + p.ingresos, 0).toLocaleString()} MXN
          </span>
        </div>
      </motion.div>
    </div>
  );
}
