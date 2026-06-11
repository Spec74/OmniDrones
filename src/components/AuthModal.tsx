import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, Shield, Sparkles, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
  allowGuest?: boolean;
  onGuestContinue?: () => void;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  allowGuest = false,
  onGuestContinue 
}: AuthModalProps) {
  const [email, setEmail] = useState("nombre@omnidrones.com");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Mimic database call and log them in as Juan Delgado (compliant with PDF)
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: "Juan Delgado",
        email: email === "nombre@omnidrones.com" ? "juan@omnidrones.com" : email
      });
      onClose();
    }, 1200);
  };

  // Dynamic social login provider buttons
  const handleSocialLogin = (provider: "google" | "apple" | "facebook") => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: "Juan Delgado",
        email: "juan@omnidrones.com"
      });
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 bg-black/90 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`bg-gray-950 border border-gray-900 rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.85)] w-full max-w-4xl relative ${allowGuest ? "grid grid-cols-1 md:grid-cols-12" : "block max-w-md"}`}
      >
        
        {/* Close Button overlay */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-white hover:bg-gray-900 rounded-full cursor-pointer transition-colors"
          aria-label="Cerrar modal de acceso"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Column 1: Main "Iniciar Sesión" (Fills full width if allowGuest matches false, or matches 7 cols if true) */}
        <div className={`p-6 md:p-8 space-y-5 ${allowGuest ? "md:col-span-7 border-b md:border-b-0 md:border-r border-gray-900" : "w-full"}`}>
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-wider">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-gray-400">
              Accede a tu cuenta de operador OmniDrones.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest block">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-600">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@omnidrones.com"
                  className="bg-black border border-gray-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest block">Contraseña</label>
                <a 
                  href="#forgot-password" 
                  onClick={(e) => { e.preventDefault(); alert("Enlace de restablecimiento enviado a " + email); }}
                  className="text-[10px] font-bold text-gray-550 hover:text-emerald-400 font-mono"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-600">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border border-gray-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 w-full"
                />
              </div>
            </div>

            {errorMsg && <p className="text-xs font-bold text-red-400">{errorMsg}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-850 disabled:text-gray-500 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "ENTRAR AL PANEL"
              )}
            </button>
          </form>

          {/* Social login divider (Page 8 screenshot) */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-900"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-gray-550 uppercase tracking-widest">O continuar con</span>
            <div className="flex-grow border-t border-gray-900"></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Google icon with standard color layout */}
            <button
              onClick={() => handleSocialLogin("google")}
              className="bg-gray-900 border border-gray-850 hover:border-gray-700 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:bg-gray-850"
              title="Google Sign-In"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15c-1.92-1.79-4.42-2.88-7.37-2.88-4.58 0-8.5 2.63-10.4 6.47l3.65 2.83c.85-2.55 3.23-4.43 6.75-4.43z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.65 2.83c2.13-1.97 3.36-4.87 3.36-8.54zm-11.49 11.45c3.24 0 5.95-1.08 7.93-2.91l-3.65-2.83c-1 .67-2.28 1.07-3.72 1.07-3.52 0-5.9-1.88-6.75-4.43H1.05v2.93c1.9 3.84 5.82 2.17 10.95 2.17z" />
                <path fill="#FBBC05" d="M5.25 14.62c-.22-.67-.35-1.39-.35-2.14s.13-1.47.35-2.14V7.41H1.05c-.68 1.36-1.05 2.9-1.05 4.5s.37 3.14 1.05 4.5l4.2-3.29z" />
                <path fill="#34A853" d="M12 23.45c3.24 0 5.96-1.08 7.93-2.91l-3.65-2.83c-1 .67-2.28 1.07-3.72 1.07-3.52 0-6.47-2.63-7.37-6.47H1.05v2.93c1.9 3.84 5.82 6.47 10.95 6.47z" />
              </svg>
            </button>
            <button
              onClick={() => handleSocialLogin("apple")}
              className="bg-gray-900 border border-gray-850 hover:border-gray-700 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:bg-gray-850"
              title="Apple ID Sign-In"
            >
              <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
              </svg>
            </button>
            <button
              onClick={() => handleSocialLogin("facebook")}
              className="bg-gray-900 border border-gray-850 hover:border-gray-700 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:bg-gray-850"
              title="Facebook Sign-In"
            >
              <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Column 2: Guest Checkout Gate (Fills 5 cols on MD, hides when allowGuest is false) */}
        {allowGuest && (
          <div className="bg-gray-950/40 p-6 md:p-8 flex flex-col justify-between md:col-span-10 lg:col-span-5 space-y-6">
            <div className="space-y-3.5">
              <span className="text-[9px] font-mono font-bold bg-[#FF2D20]/10 border border-[#FF2D20]/25 text-[#FF2D20] px-2 py-0.5 rounded uppercase max-w-fit block">
                COMPRA DIRECTA GUEST
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ¿Primera vez aquí?
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Puedes adquirir tus drones de precisión y accesorios recomendados de forma inmediata sin necesidad de crear una cuenta en este momento.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={onGuestContinue}
                className="w-full h-11 bg-transparent hover:bg-gray-900 border border-gray-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>COMPRAR COMO INVITADO</span>
              </button>

              {/* OmniCare note from base design (Page 8 screenshot) */}
              <div className="flex gap-2.5 items-start bg-gray-900/30 p-3 rounded-xl border border-gray-900 text-[10px] text-gray-400 leading-relaxed">
                <Shield className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  <strong>OmniCare Protection:</strong> Incluida de forma totalmente gratuita en todas las compras como invitado por los primeros 12 meses de vuelo.
                </span>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
