import { motion } from 'framer-motion';

/* ── Base shimmer pulse ── */
const shimmer = {
  initial: { opacity: 0.4 },
  animate: { opacity: [0.4, 0.8, 0.4] },
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
};

/* ── Single skeleton block ── */
export function SkeletonBlock({ className = '' }) {
  return (
    <motion.div
      {...shimmer}
      className={`bg-slate-700/60 rounded-xl ${className}`}
    />
  );
}

/* ── Stat card skeleton ── */
export function SkeletonStatCard() {
  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-5 w-5 rounded-full" />
      </div>
      <SkeletonBlock className="h-9 w-32 mb-2" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  );
}

/* ── Table row skeleton ── */
export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-6">
          <SkeletonBlock className={`h-4 ${i === 0 ? 'w-36' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

/* ── Table skeleton (multiple rows) ── */
export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </>
  );
}

/* ── Card grid skeleton ── */
export function SkeletonCardGrid({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

/* ── Page header skeleton ── */
export function SkeletonHeader() {
  return (
    <div className="mb-8 space-y-3">
      <SkeletonBlock className="h-9 w-64" />
      <SkeletonBlock className="h-4 w-48" />
    </div>
  );
}

/* ── Form skeleton ── */
export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      ))}
      <SkeletonBlock className="h-12 w-full mt-2" />
    </div>
  );
}

/* ── Profile card skeleton ── */
export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-6 bg-slate-900/95 rounded-2xl border border-slate-700/80">
      <SkeletonBlock className="w-16 h-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
    </div>
  );
}
