import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Mail, Copy, Check, AlertCircle, Phone, User, Calendar, DollarSign } from 'lucide-react';
import Modal from './Modal';

export default function ModalRecordatorioColegiatura({
  isOpen,
  onClose,
  alumnosMorosos = [],
  mesActual = 'Octubre 2026',
  cuotaSugerida = 1500,
}) {
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [sentSuccessId, setSentSuccessId] = useState(null);

  // Lista con fallbacks para previsualizar si la base está vacía
  const listaAlumnos = alumnosMorosos.length > 0 ? alumnosMorosos : [
    {
      id: 101,
      nombre: 'Mateo González López',
      matricula: 'CIV-2026-001',
      grado: 'Secundaria 3°A',
      tutorNombre: 'Marcela López Mendoza',
      telefonoTutor: '2471012345',
      emailTutor: 'marcela.lopez@gmail.com',
      mesAdeudo: mesActual,
      monto: cuotaSugerida,
      diasVencido: 4,
    },
    {
      id: 102,
      nombre: 'Valentina Hernández Castillo',
      matricula: 'CIV-2026-002',
      grado: 'Secundaria 2°B',
      tutorNombre: 'Carlos Hernández Cruz',
      telefonoTutor: '2471023456',
      emailTutor: 'carlos.hdez@hotmail.com',
      mesAdeudo: mesActual,
      monto: cuotaSugerida,
      diasVencido: 6,
    },
    {
      id: 103,
      nombre: 'Santiago Martínez Vázquez',
      matricula: 'CIV-2026-003',
      grado: 'Preparatoria 1°',
      tutorNombre: 'Elena Vázquez Soto',
      telefonoTutor: '2471034567',
      emailTutor: 'elena.vazquez@yahoo.com',
      mesAdeudo: mesActual,
      monto: cuotaSugerida * 2,
      diasVencido: 15,
    },
  ];

  const current = selectedAlumno || listaAlumnos[0];

  const generarMensaje = (alumno) => {
    if (!alumno) return '';
    const tutor = alumno.tutorNombre || 'Estimado Padre de Familia / Tutor';
    const montoStr = Number(alumno.monto || cuotaSugerida).toLocaleString('es-MX', { minimumFractionDigits: 2 });
    return `Estimado/a ${tutor}:

Le saludamos cordialmente de Dirección y Control Escolar de *Colegio Cívika*.

Le recordamos atentamente que la colegiatura de su hijo(a) *${alumno.nombre}* (${alumno.grado || 'Colegio Cívika'}) correspondiente al periodo de *${alumno.mesAdeudo || mesActual}* tiene fecha límite los primeros 10 días del mes.

💰 *Saldo Pendiente:* $${montoStr} MXN
📌 *Matrícula:* ${alumno.matricula || 'CIV-2026'}

Le recordamos que puede realizar su pago en ventanilla de Secretaría de lunes a viernes de 8:00 AM a 3:00 PM o solicitar datos para transferencia bancaria.

Agradecemos de antemano su puntualidad y quedamos a su entera disposición para cualquier aclaración.

Atentamente,
*Dirección y Control Escolar*
*Colegio Cívika* 🎓`;
  };

  const mensajeTexto = generarMensaje(current);

  const handleEnviarWhatsApp = (alumno) => {
    const rawTel = (alumno.telefonoTutor || alumno.telefono || '').replace(/\D/g, '');
    const tel = rawTel.length === 10 ? `52${rawTel}` : rawTel;
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(generarMensaje(alumno))}`;
    window.open(url, '_blank');
    setSentSuccessId(alumno.id);
  };

  const handleCopiarMensaje = (id) => {
    navigator.clipboard.writeText(mensajeTexto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📢 Seguimiento a Colegiaturas Vencidas" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Banner informativo */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-bold text-amber-300">Recordatorios automáticos a Padres de Familia</p>
            <p>Selecciona un alumno con saldo pendiente para enviar el mensaje oficial por WhatsApp o correo con 1 solo clic.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Lista de Alumnos Deudores */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              Alumnos con Saldo Pendiente ({listaAlumnos.length})
            </p>
            {listaAlumnos.map((a) => {
              const isSelected = current?.id === a.id;
              return (
                <motion.div
                  key={a.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedAlumno(a)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-950/40 text-white'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs truncate text-white">{a.nombre}</span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      ${Number(a.monto || cuotaSugerida).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{a.grado}</span>
                    <span>Tutor: {a.tutorNombre?.split(' ')[0] || 'Tutor'}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Previsualización del Mensaje */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-white/15 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-xs">
                    {current?.nombre ? current.nombre[0] : 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{current?.nombre}</h4>
                    <p className="text-[10px] text-purple-400 font-medium">Tutor: {current?.tutorNombre} ({current?.telefonoTutor || 'Sin teléfono'})</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
                  WhatsApp Formatted
                </span>
              </div>

              {/* Mensaje formateado */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-[240px] overflow-y-auto custom-scrollbar select-all">
                {mensajeTexto}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCopiarMensaje(current.id)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors"
              >
                {copiedId === current.id ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copiar Texto</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEnviarWhatsApp(current)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black tracking-wide rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle size={17} />
                <span>Enviar por WhatsApp</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
