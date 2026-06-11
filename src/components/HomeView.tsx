import React from "react";
import { DroneProduct } from "../types";
import { drones } from "../data";
import { 
  Compass, Shield, AlertTriangle, ArrowRight, Star, 
  Settings, Award, Heart, MessageSquare, Zap, Eye, Check, Plus
} from "lucide-react";

interface HomeViewProps {
  onStartQuiz: () => void;
  onSelectProduct: (product: DroneProduct) => void;
  onQuickAdd: (product: DroneProduct) => void;
}

export default function HomeView({ onStartQuiz, onSelectProduct, onQuickAdd }: HomeViewProps) {
  
  // Choose key specimens for bento display or features
  const specs = [
    {
      title: "Radar de Evasión 360°",
      desc: "Evasión omnidireccional en tiempo real con sensores infrarrojos binoculares activos.",
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      tag: "Seguridad Avanzada"
    },
    {
      title: "Retorno Inteligente Seguro",
      desc: "Regreso a casa (RTH) redundante que se activa automáticamente al perder señal.",
      icon: <AlertTriangle className="h-6 w-6 text-blue-400" />,
      tag: "Failsafe Satelital"
    },
    {
      title: "Estructuras Monocasco",
      desc: "Chasis livianos de fibra de carbono aeroespacial de alta resistencia a torsiones.",
      icon: <Settings className="h-6 w-6 text-purple-400" />,
      tag: "Resistencia Extrema"
    },
    {
      title: "Hasselblad Optik 5.1K",
      desc: "Sensores de gran formato con calibración natural de color directamente incorporados.",
      icon: <Award className="h-6 w-6 text-amber-400" />,
      tag: "Calidad de Cine"
    }
  ];

  return (
    <div className="space-y-16 py-6 md:py-12">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[450px]">
        
        {/* Glow Effects in BG */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Hero Left Content */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-full z-10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] md:text-xs font-semibold font-mono tracking-wider text-gray-400 uppercase">
              Nueva Generación DJI & Aero Pro-3
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight text-white leading-tight">
            Domina el Cielo con <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">
              Tecnología Inteligente
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Descubre drones premium diseñados para capturas ultra cinemáticas y velocidades inmersivas. Encuentra tu compañero de despegue perfecto en un par de clics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
            <button
              onClick={onStartQuiz}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-7 py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <span>Encuentra tu drone ideal en 4 pasos</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <a
              href="#products-catalog"
              className="w-full sm:w-auto bg-gray-900/60 border border-gray-800 hover:border-gray-700 hover:bg-gray-900 text-xs font-bold text-white px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Ver Catálogo
            </a>
          </div>

          {/* Social Proof metrics */}
          <div className="flex justify-center lg:justify-start gap-8 pt-4 text-gray-400 text-xs font-mono">
            <div>
              <div className="text-white font-sans text-xl font-bold">12k+</div>
              <div>Pilotos Activos</div>
            </div>
            <div>
              <div className="text-white font-sans text-xl font-bold">99.8%</div>
              <div>Failsafe Automático</div>
            </div>
            <div>
              <div className="text-white font-sans text-xl font-bold">2 Años</div>
              <div>Garantía Oficial</div>
            </div>
          </div>
        </div>

        {/* Hero Right Visual: Floating rotating illustration mockup */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          <div className="relative w-full max-w-[340px] md:max-w-[420px] aspect-square flex items-center justify-center">
            
            {/* Ambient decorative orbital lines */}
            <div className="absolute inset-0 border border-gray-800/60 rounded-full animate-spin" style={{ animationDuration: "25s" }} />
            <div className="absolute inset-4 border border-dashed border-gray-850 rounded-full animate-spin" style={{ animationDuration: "35s", animationDirection: "reverse" }} />
            
            {/* Visual core floating drone */}
            <img
              src={drones[0].image}
              alt="Mavic Pro floating"
              className="w-4/5 h-4/5 object-contain animate-bounce drop-shadow-[0_25px_40px_rgba(16,185,129,0.18)] pointer-events-none"
              style={{ animationDuration: "5s" }}
              referrerPolicy="no-referrer"
            />

            {/* Float visual card 1: Failsafe info badge */}
            <div className="absolute top-[20%] -left-4 bg-gray-900/90 backdrop-blur-md border border-gray-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xl animate-pulse">
              <div className="h-6.5 w-6.5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wide">Evasión IA</div>
                <div className="text-[10px] font-bold text-white">Activo en tiempo real</div>
              </div>
            </div>

            {/* Float visual card 2: Hasselblad tag badge */}
            <div className="absolute bottom-[20%] -right-4 bg-gray-900/90 backdrop-blur-md border border-gray-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xl">
              <div className="h-6.5 w-6.5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div>
                <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wide">Enlace O3+</div>
                <div className="text-[10px] font-bold text-white">15km Sin Pérdidas</div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 2. SPECIFICATIONS BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center md:text-left space-y-1.5">
          <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-bold uppercase">
            Ingeniería de Vant
          </span>
          <h2 className="text-2.5xl md:text-3.5xl font-sans font-extrabold tracking-tight text-white leading-none">
            Diseño Robusto e Inteligencia Predictiva
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {specs.map((spec, i) => (
            <div 
              key={i}
              className="bg-gray-950 p-6 rounded-2xl border border-gray-900 flex flex-col justify-between space-y-4 hover:border-gray-800 hover:bg-gray-950/80 transition-all group"
            >
              <div className="space-y-3">
                <div className="p-3 w-fit bg-gray-900 rounded-xl group-hover:bg-gray-850 transition-colors">
                  {spec.icon}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {spec.title}
                </h3>
                <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed font-normal">
                  {spec.desc}
                </p>
              </div>
              <span className="text-[9px] font-mono tracking-wider font-semibold text-gray-500 block uppercase">
                {spec.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. RECOMMENDED MODELS CATALOG */}
      <section id="products-catalog" className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="text-center sm:text-left space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-bold uppercase">
              Catálogo de Flotas de Vuelo
            </span>
            <h2 className="text-2.5xl md:text-3.5xl font-sans font-extrabold tracking-tight text-white leading-none">
              Nuestros Modelos Recomendados
            </h2>
          </div>

          <button
            onClick={onStartQuiz}
            className="text-xs font-bold text-[#10B981] hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/10"
          >
            <span>¿Cuál es el mío? Tomar Quiz</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {drones.map((product) => (
            <div 
              key={product.id}
              className="group bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)] transition-all cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              {/* Product Thumbnail image frame */}
              <div className="relative aspect-square w-full bg-gray-1000 p-6 flex items-center justify-center overflow-hidden border-b border-gray-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual spec pills overlaid on card */}
                <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur px-2 py-1 rounded-md text-[9px] font-mono font-medium text-gray-400 border border-gray-800">
                  {product.specs.flightTime.split(" ")[0]} min Vuelo
                </div>

                <button 
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-900/60 hover:bg-gray-900/95 hover:text-red-400 text-gray-400 border border-gray-800/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Product Body details */}
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {product.name}
                    </h3>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      ${product.price ? product.price.toLocaleString() : "0.00"}
                    </span>
                  </div>
                  
                  <p className="text-[10.5px] md:text-xs text-gray-400 font-normal line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 flex gap-2 w-full z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(product);
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-850 hover:text-white text-gray-300 font-semibold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Configurar</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(product);
                    }}
                    className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Comprar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOOTER AND NEWSLETTER */}
      <footer className="border-t border-gray-900 bg-gray-1000/30 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-8">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-emerald-400 animate-spin" style={{ animationDuration: "15s" }} />
              <span className="text-lg font-sans font-black tracking-wider text-white">OMNIDRONES</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              La plataforma de comercio electrónico líder en el mercado de vehículos aéreos no tripulados e inmersivos (FPV) para América Latina.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">Flota de Modelos</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li><button onClick={() => onSelectProduct(drones[0])} className="hover:text-emerald-400 cursor-pointer">Omni Mavic Pro Gen-3</button></li>
              <li><button onClick={() => onSelectProduct(drones[1])} className="hover:text-emerald-400 cursor-pointer">Aero Stealth X-1 FPV</button></li>
              <li><button onClick={() => onSelectProduct(drones[2])} className="hover:text-emerald-400 cursor-pointer">Aero Cinema Pro Octo</button></li>
              <li><button onClick={() => onSelectProduct(drones[3])} className="hover:text-emerald-400 cursor-pointer">Aero Nano Selfie Air</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">Suscríbete a Novedades</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Ingresa tu correo" 
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 flex-1"
              />
              <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 rounded-lg cursor-pointer">
                Unirse
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-normal">
              Recibe notificaciones sobre actualizaciones de firmware, ofertas y lanzamientos. No spam.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] md:text-xs text-gray-600">
          <div>
            © 2026 OmniDrones S.A. Todos los derechos reservados.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400">Términos de Servicio</a>
            <a href="#" className="hover:text-gray-400">Políticas de Privacidad</a>
            <a href="#" className="hover:text-gray-400">Soporte Técnico de DJI</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

interface ChevronRightProps {
  className?: string;
}

function ChevronRight({ className }: ChevronRightProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
