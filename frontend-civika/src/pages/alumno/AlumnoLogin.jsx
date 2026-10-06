import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { setAccessToken } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '../../config/appConfig';

function AlumnoLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/alumno/login', { email, password }, { withCredentials: true });
      setAccessToken(data.accessToken);
      navigate('/alumno/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-['Outfit']">
      {/* Fondo Abstracto Moderno Tech - Colegio Cívika */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {/* Orbes de luz degradada */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/30 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/25 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 rounded-full filter blur-[140px]" />

        {/* Malla Geométrica Tecnológica */}
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
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 md:w-44 md:h-44 mb-4 rounded-full overflow-hidden shadow-[0_0_35px_rgba(147,51,234,0.5)] border-4 border-purple-500 bg-white flex items-center justify-center p-1"
            >
              <img src={APP_CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain scale-[1.05]" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-indigo-300 drop-shadow-sm text-center">
              {APP_CONFIG.appName}
            </h1>
            <p className="text-purple-300/80 mt-1 font-bold tracking-widest uppercase text-[10px]">
              Portal de Padres de Familia & Alumnos — {APP_CONFIG.appName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
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
                    <p className="text-sm font-bold text-red-300">Error de Acceso</p>
                    <p className="text-xs text-red-200/80 leading-relaxed mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Correo */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tutor@civika.edu.mx"
                  className="w-full bg-slate-800/90 border border-white/20 rounded-2xl px-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/95 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/90 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/95 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón Iniciar Sesión */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full relative group h-12 overflow-hidden rounded-2xl font-bold text-white transition-all shadow-lg disabled:opacity-60"
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] group-hover:bg-right transition-all duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Iniciando sesión...</>
                ) : (
                  <><LogIn className="w-5 h-5" /> Iniciar Sesión en Portal</>
                )}
              </span>
            </motion.button>

            {/* Volver */}
            <div className="text-center pt-1">
              <Link
                to="/login"
                className="text-xs text-white/40 hover:text-purple-400 transition-colors font-medium"
              >
                ← Volver al acceso del personal escolar (Dirección / Secretaría)
              </Link>
            </div>
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

export default AlumnoLogin;
