import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* ── Animated number counter ── */
function useCounter(target, duration = 1200, start = 0) {
  const [count, setCount] = useState(start);
  const raf = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const startVal = start;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return count;
}

/* ── Glow color maps ── */
const glowMap = {
  white:   'shadow-white/10  hover:shadow-white/20  border-white/20',
  emerald: 'shadow-emerald-500/20 hover:shadow-emerald-500/40 border-emerald-500/30',
  amber:   'shadow-amber-500/20 hover:shadow-amber-500/40 border-amber-500/30',
  rose:    'shadow-rose-500/20 hover:shadow-rose-500/40 border-rose-500/30',
  purple:  'shadow-purple-500/20 hover:shadow-purple-500/40 border-purple-500/30',
  cyan:    'shadow-cyan-500/20 hover:shadow-cyan-500/40 border-cyan-500/30',
  blue:    'shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/30',
};

const iconBgMap = {
  white:   'bg-white/10 text-white',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber:   'bg-amber-500/15 text-amber-400',
  rose:    'bg-rose-500/15 text-rose-400',
  purple:  'bg-purple-500/15 text-purple-400',
  cyan:    'bg-cyan-500/15 text-cyan-400',
  blue:    'bg-blue-500/15 text-blue-400',
};

const gradientMap = {
  white:   'from-slate-800 to-slate-900',
  emerald: 'from-emerald-950/50 to-slate-900',
  amber:   'from-amber-950/50 to-slate-900',
  rose:    'from-rose-950/50 to-slate-900',
  purple:  'from-purple-950/50 to-slate-900',
  cyan:    'from-cyan-950/50 to-slate-900',
  blue:    'from-blue-950/50 to-slate-900',
};

/**
 * StatCard mejorado con:
 * - Counter animation al montar
 * - Glow animado al hover
 * - Icono con fondo circular de color
 * - Gradiente interno sutil
 *
 * Props:
 *  icon     – componente Lucide
 *  label    – texto descriptivo
 *  value    – número o string
 *  color    – 'white' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'blue'
 *  prefix   – prefijo opcional (ej. "$")
 *  suffix   – sufijo opcional (ej. "%")
 *  animate  – si animar el número (default true si value es number)
 */
function StatCard({
  icon: Icon,
  label,
  value,
  color = 'white',
  prefix = '',
  suffix = '',
  animate = true,
}) {
  const isNumber = typeof value === 'number';
  const displayValue = useCounter(isNumber && animate ? value : 0, 1400);

  const glow = glowMap[color] || glowMap.white;
  const iconBg = iconBgMap[color] || iconBgMap.white;
  const gradient = gradientMap[color] || gradientMap.white;

  const shown = isNumber && animate
    ? `${prefix}${displayValue.toLocaleString()}${suffix}`
    : `${prefix}${typeof value === 'number' ? value.toLocaleString() : value ?? '—'}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
      className={`
        relative overflow-hidden rounded-2xl p-5 border
        bg-gradient-to-br ${gradient}
        shadow-lg ${glow}
        transition-colors duration-300 cursor-pointer group
      `}
    >
      {/* Efecto Shimmer de luz que cruza la tarjeta en hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />

      {/* Glow blob suave */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-2xl bg-current pointer-events-none" style={{ color: 'inherit' }} />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/50 mb-2 truncate group-hover:text-white/70 transition-colors">
            {label}
          </p>
          <p className="text-2xl font-black tracking-tight text-white leading-none">
            {shown}
          </p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg} shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-sm`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
