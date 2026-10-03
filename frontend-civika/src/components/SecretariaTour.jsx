import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  HelpCircle,
  CreditCard,
  ShoppingBag,
  Receipt,
  Users,
  ClipboardCheck,
  User,
  GraduationCap
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

const TOUR_STEPS = [
  {
    target: null, // Modal central de bienvenida
    title: `¡Bienvenida a ${APP_CONFIG.appName}!`,
    description: 'Te damos la bienvenida al panel de Secretaría y Recepción. Te guiaremos paso a paso por las herramientas que utilizarás a diario para cobro de colegiaturas, venta de uniformes y entrega de caja.',
    icon: Sparkles,
    badge: 'PASO 1 DE 6',
  },
  {
    target: '[data-tour="sidebar-cobro-colegiaturas"]',
    title: 'Cobro de Colegiaturas',
    description: 'Registra los cobros de colegiaturas mensuales en ventanilla (efectivo o transferencia) para los alumnos de Secundaria y Preparatoria, emitiendo su recibo oficial.',
    icon: CreditCard,
    badge: 'PASO 2 DE 6',
  },
  {
    target: '[data-tour="sidebar-uniformes-sec"]',
    title: 'Venta de Uniformes Escolares',
    description: 'Punto de venta oficial (POS) para prendas escolares (suéter, falda, pantalón, polo y pans). Selecciona prendas, tallas, registra comprador y genera tickets de compra con folio.',
    icon: ShoppingBag,
    badge: 'PASO 3 DE 6',
  },
  {
    target: '[data-tour="sidebar-corte-caja"]',
    title: 'Corte de Caja Diario & Entrega a Dirección',
    description: 'Al finalizar tu turno, revisa el arqueo de colegiaturas vs uniformes y presiona "Notificar Entrega a Dirección". Luego entrega físicamente el dinero en efectivo a la Doctora para su validación.',
    icon: Receipt,
    badge: 'PASO 4 DE 6',
  },
  {
    target: '[data-tour="sidebar-alumnos-sec"]',
    title: 'Registro de Alumnos & Tutores',
    description: 'Inscribe y gestiona estudiantes asignándoles Grado escolar (Secundaria 1°-3° o Prepa 1°-3°), Matrícula y registra el nombre, teléfono y correo electrónico de sus tutores.',
    icon: Users,
    badge: 'PASO 5 DE 6',
  },
  {
    target: '[data-tour="sidebar-asistencia-sec"]',
    title: 'Control de Asistencias',
    description: 'Supervisa el registro de puntualidad y asistencia general de los alumnos de la institución.',
    icon: ClipboardCheck,
    badge: 'PASO 6 DE 6',
  },
];

export default function SecretariaTour({ forceOpen = false, onCloseForce }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const storageKey = user?.id ? `civika_secretaria_tour_count_${user.id}` : 'civika_secretaria_tour_count';

  // Manejar apertura automática o forzada
  useEffect(() => {
    const isSecretaria = user?.rol?.toLowerCase() === 'secretaria';

    if (forceOpen) {
      setCurrentStep(0);
      setIsOpen(true);
      return;
    }

    if (!isSecretaria) return;

    const count = parseInt(localStorage.getItem(storageKey) || '0', 10);
    if (count < 1) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, forceOpen, storageKey]);

  // Escuchar evento personalizado global para abrir el tour desde cualquier parte
  useEffect(() => {
    const handleOpenEvent = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-secretaria-tour', handleOpenEvent);
    return () => window.removeEventListener('open-secretaria-tour', handleOpenEvent);
  }, []);

  // Calcular posición del elemento destacado
  const updateTargetRect = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const isVisible = (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.left >= 0 &&
        rect.top >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );

      if (isVisible) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();
    const timer = setTimeout(updateTargetRect, 100);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
    const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
    localStorage.setItem(storageKey, (current + 1).toString());
  };

  const handleComplete = () => {
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
    localStorage.setItem(storageKey, '1');
  };

  // Destacar el elemento en el DOM mientras está activo en el paso actual
  useEffect(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentStep];
    if (!step?.target) return;
    const el = document.querySelector(step.target);
    if (el) {
      el.classList.add('civika-tour-active');
      return () => {
        el.classList.remove('civika-tour-active');
      };
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  // Determinar posicionamiento de tarjeta flotante
  let tooltipStyle = {};
  if (targetRect) {
    const isSidebar = targetRect.left < 300;
    if (isSidebar) {
      tooltipStyle = {
        top: Math.max(20, Math.min(targetRect.top - 20, window.innerHeight - 380)),
        left: Math.min(targetRect.left + targetRect.width + 24, window.innerWidth - 440),
      };
    } else {
      tooltipStyle = {
        top: Math.min(targetRect.top + targetRect.height + 20, window.innerHeight - 380),
        left: Math.max(20, Math.min(targetRect.left, window.innerWidth - 440)),
      };
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
        {/* Fondo oscuro: si hay un objetivo seleccionado, se recorta un hueco para que el botón no quede tapado ni borroso */}
        {targetRect ? (
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <mask id="secretaria-tour-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - 6}
                  y={targetRect.top - 6}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="16"
                  ry="16"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(2, 6, 23, 0.82)"
              mask="url(#secretaria-tour-spotlight-mask)"
              className="pointer-events-auto cursor-pointer"
              onClick={handleClose}
            />
          </svg>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
        )}

        {/* Resaltado del elemento objetivo */}
        {targetRect && (
          <motion.div
            layoutId="secretaria-tour-highlight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute rounded-2xl border-2 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.7)] pointer-events-none z-50 bg-transparent"
          />
        )}

        {/* Tarjeta del Tour */}
        <div className={targetRect ? 'absolute z-50 pointer-events-auto' : 'fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto'}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={targetRect ? tooltipStyle : {}}
            className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-950/50 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Header del paso */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                {step.badge}
              </span>
              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Omitir recorrido"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 text-purple-400 border border-purple-500/30 shrink-0">
                <Icon size={26} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-black text-white leading-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-5">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
              <button
                onClick={handleClose}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1"
              >
                Omitir
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white transition-colors"
                    title="Anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? (
                    <>
                      <span>Finalizar</span>
                      <CheckCircle2 size={15} />
                    </>
                  ) : (
                    <>
                      <span>Siguiente</span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
