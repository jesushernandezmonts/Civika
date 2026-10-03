import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', cancelText = 'Cancelar' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-slate-900/95 border border-white/15 rounded-3xl p-7 md:p-8 w-full max-w-md shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="flex flex-col items-center text-center relative z-10">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 bg-rose-500/15 rounded-2xl flex items-center justify-center text-rose-400 mb-5 border border-rose-500/30 shadow-lg shadow-rose-950/30"
              >
                <AlertTriangle size={32} />
              </motion.div>

              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-7">
                {message}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-white/80 hover:text-white font-semibold rounded-2xl transition-all border border-white/10"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(225, 29, 72, 0.4)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-5 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold tracking-wide rounded-2xl shadow-lg transition-all"
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
