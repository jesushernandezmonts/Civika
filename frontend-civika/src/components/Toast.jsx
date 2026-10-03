import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const typeConfig = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    bar: 'bg-emerald-500',
    glow: 'shadow-emerald-500/10',
    label: 'Éxito',
  },
  error: {
    icon: XCircle,
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/15 text-rose-400',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-500/10',
    label: 'Error',
  },
  delete: {
    icon: XCircle,
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/15 text-rose-400',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-500/10',
    label: 'Eliminado',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15 text-amber-400',
    bar: 'bg-amber-500',
    glow: 'shadow-amber-500/10',
    label: 'Advertencia',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/15 text-blue-400',
    bar: 'bg-blue-500',
    glow: 'shadow-blue-500/10',
    label: 'Información',
  },
};

/**
 * Toast mejorado con:
 * - Barra de progreso animada
 * - Icono de tipo con color
 * - Entrada desde abajo-derecha con bounce
 * - Auto-dismiss con timeout
 *
 * Props:
 *  toast   – { type, title, message } | null
 *  onClose – callback para cerrar
 *  duration – ms antes de auto-close (default 3500)
 */
function Toast({ toast, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  const cfg = toast ? (typeConfig[toast.type] || typeConfig.success) : typeConfig.success;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.title + toast.message}
          initial={{ opacity: 0, y: 60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={`
            fixed right-5 bottom-6 z-[300]
            w-[340px] max-w-[calc(100vw-2rem)]
            flex items-start gap-3
            rounded-2xl bg-slate-900/98 backdrop-blur-md
            border ${cfg.border}
            px-4 py-4
            shadow-2xl ${cfg.glow}
            overflow-hidden
          `}
        >
          {/* Icono */}
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
            <Icon size={20} />
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white leading-tight">{toast.title}</p>
            {toast.message && (
              <p className="text-xs text-white/50 mt-0.5 leading-snug">{toast.message}</p>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="p-1 text-white/30 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X size={14} />
          </button>

          {/* Barra de progreso */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className={`absolute bottom-0 left-0 h-[3px] w-full origin-left ${cfg.bar} opacity-60`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
