import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
        className="relative z-20 w-full max-w-lg px-4"
      >
        <div className="bg-slate-800/90 border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium mb-6">
              <ArrowLeft size={16} />
              Volver al login
            </Link>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Recuperar Acceso</h1>
            <p className="text-white/60 text-sm">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-white/80 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    className="w-full bg-slate-800/90 border border-white/20 rounded-2xl px-12 py-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                    type="email"
                    placeholder="tu-correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl shadow-lg text-left"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-red-300">Error de Recuperación</h4>
                      <p className="text-xs font-medium text-red-200/80 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2"
                type="submit"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar enlace"}
              </motion.button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Correo enviado!</h2>
              <p className="text-white/60 text-sm mb-8">
                Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.
              </p>
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                Regresar al inicio de sesión
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
