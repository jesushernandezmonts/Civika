import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '../../config/appConfig';

function AlumnoActivarCuenta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Enlace de activación inválido. No se encontró el token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe tener al menos una mayúscula');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos un número');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/alumno/activar-cuenta', { token, password });
      setSuccess(data.message || 'Cuenta activada exitosamente');
      setTimeout(() => {
        navigate('/alumno/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al activar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-['Outfit']">
        <div className="absolute inset-0 z-0 bg-slate-950">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/30 rounded-full filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/25 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 rounded-full filter blur-[140px]" />
          <div 
            className="absolute inset-0 opacity-[0.18]"
            style={{ 
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.4) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 w-full max-w-md px-4"
        >
          <div className="bg-slate-800/90 border border-white/20 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Enlace Inválido</h1>
            <p className="text-white/50 mb-6 text-sm leading-relaxed">
              El enlace de activación es inválido o ya fue usado. Solicita uno nuevo al administrador.
            </p>
            <Link
              to="/alumno/login"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-bold text-sm transition-colors"
            >
              ← Ir al inicio de sesión
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-['Outfit']">
      {/* Fondo Abstracto Moderno Tech - Colegio Cívika */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/30 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/25 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 rounded-full filter blur-[140px]" />
        <div 
          className="absolute inset-0 opacity-[0.18]"
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-lg px-4"
      >
        <div className="bg-slate-800/90 border border-white/20 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 mb-3 rounded-full overflow-hidden shadow-2xl border-2 border-purple-500/50 bg-white p-1 flex items-center justify-center"
            >
              <img src={APP_CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-indigo-300 drop-shadow-sm">
              {APP_CONFIG.appName}
            </h1>
            <p className="text-purple-300/80 mt-1 font-bold tracking-widest uppercase text-[10px]">
              Portal del Alumno — Activar Cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Alertas */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-left"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-300">Error</p>
                    <p className="text-xs text-red-200/80 leading-relaxed mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-left"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-300">¡Cuenta activada!</p>
                    <p className="text-xs text-emerald-200/80 leading-relaxed mt-0.5">{success}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Campo: Nueva Contraseña */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Nueva Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/90 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-slate-800/95 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-white/35 ml-1 mt-1">
                Mínimo 8 caracteres, 1 mayúscula y 1 número
              </p>
            </div>

            {/* Campo: Confirmar Contraseña */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Confirmar Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/90 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-slate-800/95 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón Activar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !!success}
              className="w-full relative group h-12 overflow-hidden rounded-2xl font-bold text-white transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-orange-600 to-pink-600 bg-[length:200%_auto] group-hover:bg-right transition-all duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Activando cuenta...</>
                ) : success ? (
                  <><CheckCircle2 className="w-5 h-5" /> ¡Cuenta activada!</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Activar Cuenta</>
                )}
              </span>
            </motion.button>
          </form>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/40 mt-8 text-sm"
        >
          {APP_CONFIG.copyright}
        </motion.p>
      </motion.div>
    </div>
  );
}

export default AlumnoActivarCuenta;
