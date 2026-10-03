import { motion } from 'framer-motion';

const statusConfig = {
  activo: {
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Activo',
    pulse: true,
  },
  pendiente: {
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Pendiente',
    pulse: false,
  },
  inactivo: {
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Inactivo',
    pulse: false,
  },
  completo: {
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Completo',
    pulse: false,
  },
  critico: {
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Crítico',
    pulse: true,
  },
  incompleto: {
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Incompleto',
    pulse: false,
  },
  validado: {
    classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
    label: 'Validado',
    pulse: false,
  },
  rechazado: {
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Rechazado',
    pulse: false,
  },
  en_progreso: {
    classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
    label: 'En progreso',
    pulse: true,
  },
};

/**
 * StatusBadge mejorado con:
 * - Dot pulsante para estados activos/críticos
 * - Micro-animación de entrada
 *
 * Props:
 *  status   – clave del config
 *  label    – texto custom (sobrescribe)
 *  classes  – clases custom (sobrescribe)
 *  dotColor – color del dot custom
 *  size     – 'sm' | 'md'
 */
function StatusBadge({ status, label, classes, dotColor, size = 'sm' }) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm'
    ? 'px-3 py-1 text-[10px]'
    : 'px-4 py-1.5 text-xs';

  const shouldPulse = config?.pulse && !classes;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-tighter border ${sizeClasses} ${
        classes || config?.classes || 'bg-slate-800/80 text-white/40 border-white/15'
      }`}
    >
      <span className="relative flex items-center justify-center">
        {shouldPulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping ${
              dotColor || config?.dot || 'bg-white/30'
            }`}
          />
        )}
        <span
          className={`relative w-1.5 h-1.5 rounded-full ${
            dotColor || config?.dot || 'bg-white/30'
          }`}
        />
      </span>
      {label || config?.label || status}
    </motion.span>
  );
}

export default StatusBadge;
