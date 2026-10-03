import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldAlert, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config/appConfig';
import api, { setAccessToken } from '../services/api';

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginDemo, bloqueoMsg, setBloqueoMsg, user, setUser, setLoading: setAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      if (user.rol === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (user.rol === 'secretaria') {
        navigate('/pagos', { replace: true });
      } else if (user.rol === 'alumno') {
        navigate('/alumno/dashboard', { replace: true });
      } else {
        navigate('/mis-grupos', { replace: true });
      }
    }
  }, [user, navigate]);

  // Capturar error de Google OAuth redirigido desde el backend
  useEffect(() => {
    const googleError = searchParams.get('error');
    if (googleError) {
      setError(decodeURIComponent(googleError));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBloqueoMsg(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.rol === 'admin') {
        navigate('/dashboard');
      } else if (loggedUser.rol === 'secretaria') {
        navigate('/pagos');
      } else if (loggedUser.rol === 'alumno') {
        navigate('/alumno/dashboard');
      } else {
        navigate('/mis-grupos');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response?.data?.message || 'Credenciales inválidas. Verifique su correo y contraseña.');
      } else if (err.response?.status === 403) {
        if (!bloqueoMsg) {
          setError(err.response?.data?.message || 'Cuenta bloqueada temporalmente.');
        }
      } else if (err.response?.status === 429) {
        setError('Demasiados intentos. Espere un minuto antes de intentar de nuevo.');
      } else {
        setError('Error de conexión con el servidor. Puedes usar los botones de Acceso Demo abajo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    setError('');
    setBloqueoMsg(null);
    setLoading(true);
    try {
      const demoUser = loginDemo(role);
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'secretaria') {
        navigate('/pagos');
      } else if (role === 'instructor') {
        navigate('/mis-grupos');
      } else if (role === 'alumno') {
        navigate('/alumno/dashboard');
      }
    } catch (err) {
      console.error('Error en demo login:', err);
      setError('Error al acceder en modo demo');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
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
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 w-full max-w-lg px-4 gpu-accelerated"
      >
        <div className="bg-slate-800/90 border border-white/20 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
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
            <p className="text-purple-300/80 mt-1 font-bold tracking-widest uppercase text-[10px]">{APP_CONFIG.appSubName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Correo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                <input
                  className="w-full bg-slate-800/90 border border-white/20 rounded-2xl px-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/95 transition-all"
                  type="email"
                  placeholder="usuario@civika.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                <input
                  className="w-full bg-slate-800/90 border border-white/20 rounded-2xl px-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/95 transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <AnimatePresence>
              {bloqueoMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 text-amber-300 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20"
                >
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Cuenta Bloqueada</p>
                    <p className="text-xs font-medium text-amber-200/80">{bloqueoMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && !bloqueoMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl shadow-lg text-left"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-red-300">Error de Acceso</h4>
                    <p className="text-xs font-medium text-red-200/80 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full relative group h-12 overflow-hidden rounded-2xl font-bold text-white transition-all shadow-lg disabled:opacity-60"
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] group-hover:bg-right transition-all duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar sesión"}
              </span>
            </motion.button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/15"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/30 font-medium">O continuar con</span>
              </div>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 h-12 bg-slate-800/90 hover:bg-slate-800/95 border border-white/20 hover:border-purple-500/50 rounded-2xl font-bold text-white transition-all shadow-lg"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Iniciar sesión con Google</span>
            </motion.button>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  ⚡ Acceso Rápido de Prueba (Demo):
                </p>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                  1 Clic
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('admin')}
                  className="p-2.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 hover:border-purple-400 rounded-xl text-xs font-bold text-purple-200 transition-all text-center flex flex-col items-center gap-1 cursor-pointer group shadow-sm hover:scale-[1.02]"
                >
                  <span className="text-base">👑</span>
                  <span className="font-semibold text-[11px] text-white">Dirección</span>
                  <span className="text-[9px] text-purple-300/70 font-normal">Dashboard</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('secretaria')}
                  className="p-2.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 rounded-xl text-xs font-bold text-blue-200 transition-all text-center flex flex-col items-center gap-1 cursor-pointer group shadow-sm hover:scale-[1.02]"
                >
                  <span className="text-base">👩‍💼</span>
                  <span className="font-semibold text-[11px] text-white">Secretaría</span>
                  <span className="text-[9px] text-blue-300/70 font-normal">Caja & Cobros</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('instructor')}
                  className="p-2.5 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold text-amber-200 transition-all text-center flex flex-col items-center gap-1 cursor-pointer group shadow-sm hover:scale-[1.02]"
                >
                  <span className="text-base">👨‍🏫</span>
                  <span className="font-semibold text-[11px] text-white">Docente</span>
                  <span className="text-[9px] text-amber-300/70 font-normal">Mis Grupos</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('alumno')}
                  className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 hover:border-emerald-400 rounded-xl text-xs font-bold text-emerald-200 transition-all text-center flex flex-col items-center gap-1 cursor-pointer group shadow-sm hover:scale-[1.02]"
                >
                  <span className="text-base">👨‍👩‍👧</span>
                  <span className="font-semibold text-[11px] text-white">Padre / Alumno</span>
                  <span className="text-[9px] text-emerald-300/70 font-normal">Portal</span>
                </button>
              </div>
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

export default Login;
