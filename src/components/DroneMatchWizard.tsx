import React, { useState, useEffect } from "react";
import { QuizAnswers, DroneProduct } from "../types";
import { quizQuestions, calculateMatch } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, Zap, Share2, Compass, Coins, 
  TrendingUp, Crown, Sparkles, ShieldQuestion, 
  CheckCircle2, Gauge, Eye, BatteryCharging, Maximize,
  ArrowRight, ArrowLeft, Mail, Percent, Loader, RefreshCw 
} from "lucide-react";

interface DroneMatchWizardProps {
  onMatchFound: (product: DroneProduct, discountApplied: boolean) => void;
  onClose: () => void;
}

export default function DroneMatchWizard({ onMatchFound, onClose }: DroneMatchWizardProps) {
  // 1. Data Persistence: Load from localStorage or defaults
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const savedStep = localStorage.getItem("drone_match_step_idx");
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(() => {
    const savedAnswers = localStorage.getItem("drone_match_answers");
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  const [showLeadModal, setShowLeadModal] = useState<boolean>(() => {
    return localStorage.getItem("drone_match_show_lead") === "true";
  });

  const [isAnalyzingMatching, setIsAnalyzingMatching] = useState<boolean>(false);
  const [analysisCycleId, setAnalysisCycleId] = useState<number>(0);
  const [leadName, setLeadName] = useState<string>("");
  const [leadEmail, setLeadEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const currentQuestion = quizQuestions[currentStepIndex];

  // 2. Sync to localStorage when answers & indices modify
  useEffect(() => {
    localStorage.setItem("drone_match_answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem("drone_match_step_idx", currentStepIndex.toString());
  }, [currentStepIndex]);

  useEffect(() => {
    localStorage.setItem("drone_match_show_lead", showLeadModal.toString());
  }, [showLeadModal]);

  // Terminal telemetry log cycle simulator during advanced analysis phase
  const sampleTelemetryLogs = [
    "Cargando matriz analítica de OmniDrones...",
    "Examinando perfiles de viento y coeficientes aerodinámicos...",
    "Correlacionando presupuesto disponible vs rendimiento Hasselblad...",
    "Cruzando velocidad máxima requerida con chasis carbono 3K...",
    "Calculando redundancia de 8 octocópteros vs autonomía de celda...",
    "Fórmula de coincidencia DroneMatch 360 finalizada con éxito."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzingMatching) {
      interval = setInterval(() => {
        setAnalysisCycleId((prev) => (prev + 1) % sampleTelemetryLogs.length);
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isAnalyzingMatching]);

  // Helper to render icons dynamically
  const renderIcon = (iconName: string, active: boolean) => {
    const classes = `h-7 w-7 transition-colors ${active ? "text-emerald-400" : "text-gray-400"}`;
    switch (iconName) {
      case "Camera": return <Camera className={classes} />;
      case "Zap": return <Zap className={classes} />;
      case "Share2": return <Share2 className={classes} />;
      case "Compass": return <Compass className={classes} />;
      case "Coins": return <Coins className={classes} />;
      case "TrendingUp": return <TrendingUp className={classes} />;
      case "Crown": return <Crown className={classes} />;
      case "Sparkles": return <Sparkles className={classes} />;
      case "ShieldQuestion": return <ShieldQuestion className={classes} />;
      case "CheckCircle2": return <CheckCircle2 className={classes} />;
      case "Gauge": return <Gauge className={classes} />;
      case "Eye": return <Eye className={classes} />;
      case "BatteryCharging": return <BatteryCharging className={classes} />;
      case "Maximize": return <Maximize className={classes} />;
      default: return <Sparkles className={classes} />;
    }
  };

  const handleSelectOption = (value: string) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(updatedAnswers);
    
    // Auto proceed with small stagger on non-last steps
    setTimeout(() => {
      if (currentStepIndex < quizQuestions.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Trigger simulated 2-second engineering algorithm analysis loader
        setIsAnalyzingMatching(true);
        setTimeout(() => {
          setIsAnalyzingMatching(false);
          setShowLeadModal(true);
        }, 2000);
      }
    }, 250);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      handleResetQuiz();
      onClose();
    }
  };

  const handleResetQuiz = () => {
    localStorage.removeItem("drone_match_answers");
    localStorage.removeItem("drone_match_step_idx");
    localStorage.removeItem("drone_match_show_lead");
    setAnswers({});
    setCurrentStepIndex(0);
    setShowLeadModal(false);
  };

  const handleReveal = (withDiscount: boolean) => {
    if (withDiscount) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!leadEmail || !emailRegex.test(leadEmail)) {
        setEmailError("Por favor ingresa un correo electrónico válido (ej: piloto@omnidrones.com)");
        return;
      }
    }
    
    const finalAnswers = answers as QuizAnswers;
    const recommendedDrone = calculateMatch(finalAnswers);
    
    // Clear storage on successful quiz finalization
    localStorage.removeItem("drone_match_answers");
    localStorage.removeItem("drone_match_step_idx");
    localStorage.removeItem("drone_match_show_lead");
    
    onMatchFound(recommendedDrone, withDiscount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative select-none">
      
      {/* 2-Second Super AI Algorithm Loader Panel */}
      <AnimatePresence>
        {isAnalyzingMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 space-y-6"
          >
            <div className="relative">
              <Loader className="h-12 w-12 text-[#10B981] animate-spin" />
              <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400 animate-pulse" />
            </div>

            <div className="text-center space-y-3 max-w-md w-full">
              <h3 className="text-sm font-mono tracking-widest font-black text-white uppercase">
                Análisis Predictivo de Flota
              </h3>
              
              {/* Progress dynamic text */}
              <div className="bg-gray-900/60 border border-gray-850 p-4 rounded-xl min-h-[64px] flex items-center justify-center">
                <p className="text-xs font-mono text-emerald-400">
                  ⚡ {sampleTelemetryLogs[analysisCycleId]}
                </p>
              </div>

              <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest block">
                Algoritmo cruzando más de 50 especificaciones técnicas...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz content or lead capture */}
      <AnimatePresence mode="wait">
        {!showLeadModal ? (
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col p-6 md:p-10"
          >
            {/* Header / Progress Bar */}
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] md:text-xs font-mono font-semibold uppercase tracking-widest text-[#10B981] font-bold">
                  DroneMatch 360 • Asistente Virtual de IA
                </span>
                <span className="text-[10px] md:text-sm text-gray-400 font-bold font-mono">
                  {currentStepIndex + 1} de {quizQuestions.length}
                </span>
              </div>
              
              <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${((currentStepIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Title */}
            <div className="mb-6 md:mb-8 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-white mb-2 leading-tight uppercase">
                {currentQuestion.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-400">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id as keyof QuizAnswers] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectOption(option.value)}
                    className={`group relative text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden cursor-pointer h-full min-h-[140px] ${
                      isSelected
                        ? "border-emerald-500 bg-gray-900/60 shadow-[0_10px_25px_-10px_rgba(16,185,129,0.3)]"
                        : "border-gray-900 bg-gray-950 hover:border-gray-800 hover:bg-gray-9 group-hover:bg-gray-900/50"
                    }`}
                  >
                    {/* Optional atmospheric bg photo for step 1 only */}
                    {option.bgUrl && (
                      <div className="absolute inset-0 bg-cover bg-center brightness-[0.09] transition-transform duration-500 group-hover:scale-105 pointer-events-none" style={{ backgroundImage: `url(${option.bgUrl})` }} />
                    )}

                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-xl transition-all ${
                          isSelected ? "bg-emerald-500/20" : "bg-gray-900 hover:bg-gray-850"
                        }`}>
                          {renderIcon(option.icon, isSelected)}
                        </div>
                        
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "border-emerald-500 bg-emerald-500" : "border-gray-700 bg-transparent"
                        }`}>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-black font-extrabold" />}
                        </div>
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                        {option.label}
                      </h3>
                      <p className="text-[11px] md:text-xs text-gray-400 font-normal leading-relaxed line-clamp-2 md:line-clamp-none">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Prev/Next Navigation bottom bar */}
            <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-900/60">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-2 px-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Atrás</span>
              </button>

              <button
                type="button"
                onClick={handleResetQuiz}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors py-2 font-mono font-semibold"
                title="Reiniciar todo el asistente"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reiniciar</span>
              </button>

              <div className="text-[10px] md:text-xs text-gray-500">
                Selecciona una opción para avanzar
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="lead-capture"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 p-6 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-center"
          >
            {/* Visual Promo Sidebar */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex gap-2 items-center bg-emerald-500/10 text-emerald-400 font-mono text-[10px] md:text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-bold">
                <Percent className="h-3.5 w-3.5 animate-pulse" />
                <span>Perfil de Vuelo Completado</span>
              </div>
              <h2 className="text-2.5xl md:text-4xl font-sans font-extrabold tracking-tight text-white leading-tight">
                ¡Excelente perfil!<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Encontrado tu match.
                </span>
              </h2>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm">
                Hemos analizado tus respuestas con nuestra matriz técnica. Ingresa tu correo electrónico para desbloquear la recomendación y recibir un **cupón exclusivo de 10% de descuento** en tu adquisición.
              </p>
              
              {/* Highlight Features micro badges */}
              <div className="hidden md:flex flex-col gap-2 pt-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" />
                  <span>Configuración ideal recomendada según tu presupuesto</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" />
                  <span>Compatibilidad garantizada con tu nivel de pericia</span>
                </div>
              </div>
            </div>

            {/* Capture Form Box */}
            <div className="w-full md:max-w-sm bg-gray-900/60 border border-gray-800/80 p-5 md:p-6 rounded-2xl flex flex-col shadow-xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="lead-name" className="block text-[11px] font-semibold font-mono tracking-wider text-gray-400 mb-1.5 uppercase">
                    Nombre Completo
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Escribe tu nombre"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="lead-email" className="block text-[11px] font-semibold font-mono tracking-wider text-gray-400 mb-1.5 uppercase">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      id="lead-email"
                      type="email"
                      value={leadEmail}
                      onChange={(e) => {
                        setLeadEmail(e.target.value);
                        setEmailError("");
                      }}
                      placeholder="nombre@ejemplo.com"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                  {emailError && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold leading-normal">
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleReveal(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold py-3 px-4 rounded-xl text-xs hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Revelar mi Drone + 10% OFF</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleReveal(false)}
                    className="text-[11px] text-gray-500 hover:text-gray-300 underline underline-offset-4 cursor-pointer"
                  >
                    No gracias, ver resultado estándar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
