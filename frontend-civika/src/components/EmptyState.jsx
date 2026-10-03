import { motion } from 'framer-motion';

const configs = {
  empty: {
    emoji: '📭',
    title: 'Sin resultados',
    desc: 'No hay nada que mostrar aquí todavía.',
  },
  alumnos: {
    emoji: '🎓',
    title: 'Sin alumnos registrados',
    desc: 'Aún no hay alumnos en el sistema. Empieza registrando uno.',
  },
  pagos: {
    emoji: '💳',
    title: 'Sin pagos registrados',
    desc: 'No hay movimientos de pago registrados aún.',
  },
  asistencias: {
    emoji: '📋',
    title: 'Sin asistencias',
    desc: 'No hay registros de asistencia para mostrar.',
  },
  talleres: {
    emoji: '🎨',
    title: 'Sin talleres',
    desc: 'No hay talleres activos. Crea uno para empezar.',
  },
  instructores: {
    emoji: '👨‍🏫',
    title: 'Sin instructores',
    desc: 'No hay instructores registrados en el sistema.',
  },
  busqueda: {
    emoji: '🔍',
    title: 'Sin coincidencias',
    desc: 'No se encontraron resultados para tu búsqueda. Intenta con otros términos.',
  },
  actividades: {
    emoji: '📅',
    title: 'Sin actividades',
    desc: 'No hay actividades programadas para este periodo.',
  },
  reportes: {
    emoji: '📊',
    title: 'Sin datos para reportar',
    desc: 'No hay información suficiente para generar un reporte.',
  },
  servicioSocial: {
    emoji: '🤝',
    title: 'Sin registros de servicio social',
    desc: 'No hay prestadores de servicio social registrados.',
  },
  uniformes: {
    emoji: '👕',
    title: 'Sin ventas de uniformes',
    desc: 'No se han registrado ventas de uniformes.',
  },
  error: {
    emoji: '⚠️',
    title: 'Error al cargar',
    desc: 'Ocurrió un problema al obtener los datos. Intenta de nuevo.',
  },
};

/**
 * EmptyState — componente de estado vacío
 * 
 * Props:
 *  type     – clave del config predefinido
 *  title    – título custom (sobrescribe)
 *  desc     – descripción custom
 *  action   – { label, onClick } para botón de acción
 *  compact  – versión más pequeña para uso en tablas
 */
function EmptyState({ type = 'empty', title, desc, action, compact = false }) {
  const cfg = configs[type] || configs.empty;
  const displayTitle = title || cfg.title;
  const displayDesc = desc || cfg.desc;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl mb-3 select-none"
        >
          {cfg.emoji}
        </motion.div>
        <p className="text-sm font-bold text-white/60">{displayTitle}</p>
        {displayDesc && (
          <p className="text-xs text-white/35 mt-1 max-w-xs">{displayDesc}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200 transition-all cursor-pointer"
          >
            {action.label}
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      {/* Emoji flotante */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl mb-6 select-none filter drop-shadow-lg"
      >
        {cfg.emoji}
      </motion.div>

      {/* Glow detrás del emoji */}
      <div className="absolute w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -translate-y-8 pointer-events-none" />

      <h3 className="text-xl font-black text-white/80 mb-2">{displayTitle}</h3>
      <p className="text-sm text-white/40 max-w-sm leading-relaxed">{displayDesc}</p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl text-sm font-bold text-white shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

export default EmptyState;
