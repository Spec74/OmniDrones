import { DroneProduct, QuizAnswers } from "./types";

// Import generated imagery to resolve paths correctly in Vite
import mavicProImg from "./assets/images/mavic_pro_1779326027573.png";
import stealthDroneImg from "./assets/images/stealth_drone_1779326042080.png";

export const drones: DroneProduct[] = [
  {
    id: "mavic-pro",
    name: "Omni Mavic Pro Gen-3",
    tagline: "El estándar de oro en cinematografía compacta e inteligente",
    price: 2499.00,
    image: mavicProImg,
    description: "Equipado con un sensor tri-cam de última generación y estabilización activa de grado militar. El Omni Mavic Pro Gen-3 te permite capturar imágenes cinemáticas imponentes con piloto automático mejorado por IA y evasión de obstáculos omnidireccional.",
    specs: {
      camera: "Hasselblad 4/3 CMOS de 5.1K / Apple ProRes",
      flightTime: "46 minutos por carga",
      range: "15 km de transmisión O3+",
      speed: "75 km/h",
      weight: "895 gramos (plegable)"
    },
    features: [
      "Transmisión FHD a 60 fps sobre súper distancias",
      "Evasión omnidireccional inteligente de obstáculos activa",
      "Modo nocturno mejorado con reducción de ruido por IA",
      "Regreso a casa (RTH) avanzado mejorado de forma autónoma"
    ],
    colors: [
      { name: "Titanio", hex: "#4B5563", desc: "Acabado anodizado de alta resistencia" },
      { name: "Negro Mate", hex: "#1F2937", desc: "Apariencia discreta y sigilosa" },
      { name: "Oro de Carreras", hex: "#D97706", desc: "Acentos premium pintados a mano" }
    ],
    accessories: [
      { id: "smart-controller", name: "Smart Controller V2", price: 650.00, description: "Pantalla ultrabrillante integrada de 5.5 pulgadas a 1000 nits" },
      { id: "extra-battery", name: "Batería de Vuelo Inteligente Plus", price: 120.00, description: "Hasta 46 minutos adicionales de captura ininterrumpida" },
      { id: "nd-filters", name: "Set Filtros ND Profesionales (ND8/16/32/64)", price: 45.00, description: "Control perfecto de velocidad de obturación bajo sol fuerte" },
      { id: "propellers", name: "Hélices de Bajo Ruido (Repuesto)", price: 15.00, description: "Aerodinámica optimizada para mayor autonomía y menor zumbido" }
    ]
  },
  {
    id: "stealth-x1",
    name: "Aero Stealth X-1 FPV",
    tagline: "Velocidad adrenalínica, agilidad extrema y control inmersivo",
    price: 1850.00,
    image: stealthDroneImg,
    description: "Diseñado para los pilotos que buscan máxima velocidad y giros acrobáticos cerrados en primera persona. El Aero Stealth X-1 es estructuralmente indestructible debido a su armazón de fibra de carbono híbrida 3K y cuenta con iluminación LED ajustable, ideal para carreras y freestyle.",
    specs: {
      camera: "Cámara FPV 4K de Latencia Cero / HDR activo",
      flightTime: "25 minutos de vuelo de alto rendimiento",
      range: "10 km con señales de baja latencia",
      speed: "140 km/h (0 a 100 en 1.5s)",
      weight: "410 gramos"
    },
    features: [
      "Estructura monocasco de fibra de carbono ultra-resistente",
      "Transmisión FPV digital a 120 fps con visores inmersivos incluidos",
      "Luces LED RGB interconectadas programables",
      "Modo manual puro (Acro) adaptable y Modo Estabilizado automático"
    ],
    colors: [
      { name: "Gris Carbón", hex: "#1F2937", desc: "Fibra de carbono mate al descubierto" },
      { name: "Verde Neón", hex: "#22C55E", desc: "Acentos de alta visibilidad para carreras" },
      { name: "Rojo Nitro", hex: "#EF4444", desc: "Apariencia agresiva inspirada en deportes motorizados" }
    ],
    accessories: [
      { id: "fpv-goggles", name: "Goggles FPV Dynamic Pro", price: 550.00, description: "Pantallas duales Micro-OLED 1080p con refresco de 120Hz" },
      { id: "pro-controller", name: "Radiocontrol Profesional Hall V3", price: 220.00, description: "Gimbals magnéticos de ultra-precisión para maniobras extremas" },
      { id: "battery-pack", name: "Pack 2x Baterías LiPo de Alta Tasa (6S)", price: 160.00, description: "Descarga de 150C para empuje máximo y respuestas instantáneas" },
      { id: "frame-guards", name: "Protectores Industriales de Hélices", price: 30.00, description: "Amortiguadores ideales para prácticas interiores o espacios reducidos" }
    ]
  },
  {
    id: "cinema-pro",
    name: "Aero Cinema Pro Octo",
    tagline: "El monstruo del cine, soporte para cámaras profesionales RED/ARRI",
    price: 4500.00,
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600",
    description: "Un octocóptero de carga pesada diseñado específicamente para directores de fotografía. Soporta gimbals pesados de cine y provee máxima estabilidad redundante con 8 motores para resguardar equipos costosos.",
    specs: {
      camera: "Compatible con RED Komodo, ARRI Alexa Mini, Sony FX3",
      flightTime: "28 minutos (con carga útil de 5 kg)",
      range: "8 km con transmisión redundante",
      speed: "90 km/h con frenado dinámico amortiguado",
      weight: "5900 gramos (profesional)"
    },
    features: [
      "Sistema de propulsión redundante con 8 rotores activos",
      "Gimbal integrado estabilizado mediante servo brushless de precisión",
      "Salidas de energía auxiliares D-Tap y Lemo",
      "Control cooperativo multifunción (Piloto de drone + Operador de cámara)"
    ],
    colors: [
      { name: "Rutenio Sigiloso", hex: "#111827", desc: "Acero anodizado antireflejo de cine" },
      { name: "Amarillo Industrial", hex: "#EAB308", desc: "Identidad clásica de herramientas profesionales de rodaje" }
    ],
    accessories: [
      { id: "heavy-case", name: "Pelican Case Estanco Custom", price: 380.00, description: "Esponja premoldeada de alta densidad y vscosidad contra impactos" },
      { id: "battery-charger", name: "Estación de Carga Rápida Quad-Channel", price: 290.00, description: "Carga inteligente en paralelo de 4 baterías pesadas en 35 minutos" },
      { id: "video-transmitter", name: "Transmisor Inalámbrico SDI/HDMI Wireless", price: 420.00, description: "Flujo de video directo y sin compresión al monitor del director" }
    ]
  },
  {
    id: "nano-air",
    name: "Aero Nano Selfie Air",
    tagline: "Inconmensurable ligereza para tu día a día en redes sociales",
    price: 699.00,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=600",
    description: "Tan pequeño que cabe en la palma de tu mano y no requiere licencias registradas para volar. Perfecto para capturar reels, tiktoks y momentos familiares cotidianos mediante seguimiento de rostro automático.",
    specs: {
      camera: "Sensor de 4K HDR a 30 fps optimizado para retrato",
      flightTime: "31 minutos por batería avanzada",
      range: "6 km vía Wifi-6 estable",
      speed: "45 km/h",
      weight: "249 gramos (Sin restricciones de vuelo)"
    },
    features: [
      "Modos de video vertical integrados ideales para Historias de Instagram",
      "Despegue y aterrizaje directo de la palma de la mano guiado de forma gestual",
      "Seguimiento visual Activo con centrado inteligente en movimiento",
      "Aplicación móvil con edición inmediata por IA para redes sociales"
    ],
    colors: [
      { name: "Blanco Glaciar", hex: "#F3F4F6", desc: "Elegante y limpio acrílico pulido" },
      { name: "Azul Brisa", hex: "#60A5FA", desc: "Pastel amigable para exteriores" },
      { name: "Rosa Aura", hex: "#F472B6", desc: "Audaz y vistoso estilo contemporáneo" }
    ],
    accessories: [
      { id: "charging-hub", name: "Estuche Cargador Bidireccional", price: 80.00, description: "Carga 3 baterías secuencialmente y funciona como Powerbank utilitario" },
      { id: "propeller-guards", name: "Jaulas Circulares Anticolisiones", price: 25.00, description: "Jaulas 360° para volar en interiores de manera segura con niños y mascotas" },
      { id: "hard-case", name: "Funda de Transporte Compacta", price: 30.00, description: "Acolchado ultraligero que cabe dentro de cualquier bolso escolar o mochila" }
    ]
  }
];

export const quizQuestions = [
  {
    id: "step1_purpose",
    title: "¿Qué quieres grabar hoy?",
    subtitle: "Paso 1 de 4 • Selecciona tu enfoque de grabación principal",
    options: [
      {
        value: "cinematografia",
        label: "Cinematografía Paisajística",
        description: "Tomas épicas, naturaleza, atardeceres majestuosos con máxima resolución del sensor.",
        icon: "Camera",
        bgUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400"
      },
      {
        value: "carreras",
        label: "Carreras / Freestyle FPV",
        description: "Adrenalina pura, giros acrobáticos cerrados a alta velocidad y grabación en primera persona.",
        icon: "Zap",
        bgUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=400"
      },
      {
        value: "social",
        label: "Contenido para Redes Sociales",
        description: "Reels, TikToks rápidos, vlogs, seguimientos faciales automatizados y formato vertical sencillo.",
        icon: "Share2",
        bgUrl: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=400"
      },
      {
        value: "recreativa",
        label: "Exploración Recreativa",
        description: "Vuelos familiares, hobbies de fin de semana e inspección pasiva de entornos naturales bellos.",
        icon: "Compass",
        bgUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "step2_budget",
    title: "¿Cuál es tu presupuesto estimado?",
    subtitle: "Paso 2 de 4 • Preferencias de Inversión",
    options: [
      {
        value: "under_1000",
        label: "Menos de $1,000",
        description: "Soluciones compactas, divertidas y altamente portables ideales para comenzar.",
        icon: "Coins"
      },
      {
        value: "mid_2500",
        label: "$1,000 - $2,500",
        description: "Rango medio avanzado con cámaras Hasselblad y estabilización profesional integrada.",
        icon: "TrendingUp"
      },
      {
        value: "high_5000",
        label: "$2,500 - $5,000",
        description: "Equipos de gama alta cinemática o FPV de carreras con visores virtuales de vanguardia.",
        icon: "Crown"
      },
      {
        value: "pro_unlimited",
        label: "Sin límite • Profesional",
        description: "Octocópteros industriales listos para montar cámaras de cine de gran formato.",
        icon: "Sparkles"
      }
    ]
  },
  {
    id: "step3_experience",
    title: "¿Cuál es tu nivel de experiencia?",
    subtitle: "Paso 3 de 4 • Adaptaremos los controles y sistemas de asistencia",
    options: [
      {
        value: "principiante",
        label: "Principiante",
        description: "Primera vez piloteando. Requiere despegue automático, asistencia activa total y jaulas anticaídas.",
        icon: "ShieldQuestion"
      },
      {
        value: "intermedio",
        label: "Intermedio",
        description: "Ya he volado drones básicos. Busco automatismos inteligentes en un equipo estable.",
        icon: "CheckCircle2"
      },
      {
        value: "avanzado",
        label: "Avanzado",
        description: "Piloto hábil. Quiero control absoluto de parámetros y mayor velocidad libre.",
        icon: "Gauge"
      },
      {
        value: "experto_fpv",
        label: "Experto FPV",
        description: "Vuelo manual (Acro) de forma fluida. Prefiero control milimétrico sobre el motor y latencias imperceptibles.",
        icon: "Eye"
      }
    ]
  },
  {
    id: "step4_priority",
    title: "¿Qué es lo más importante para ti?",
    subtitle: "Paso 4 de 4 • Último paso para encontrar tu match perfecto",
    options: [
      {
        value: "camera",
        label: "Calidad de Cámara",
        description: "Resolución del color, soporte de códecs profesionales (ProRes) e inmenso rango dinámico.",
        icon: "Camera"
      },
      {
        value: "battery",
        label: "Autonomía de Vuelo",
        description: "Mayor cantidad de minutos continuos en el aire sin tener que descender a reemplazar baterías.",
        icon: "BatteryCharging"
      },
      {
        value: "speed",
        label: "Velocidad y Agilidad",
        description: "Aceleraciones instantáneas, acrobacias tridimensionales y resistencia a ráfagas de viento hostiles.",
        icon: "Zap"
      },
      {
        value: "portability",
        label: "Portabilidad",
        description: "Peso ultraligero menor a 250 gramos que no requiere registro y se transporta de bolsillo.",
        icon: "Maximize"
      }
    ]
  }
];

export function calculateMatch(answers: QuizAnswers): DroneProduct {
  // 1st Priority based on Purpose & Priority
  const isRacing = answers.step1_purpose === "carreras" || answers.step4_priority === "speed";
  const isSocial = answers.step1_purpose === "social" || answers.step4_priority === "portability";
  const isBigProFilm = answers.step1_purpose === "cinematografia" && answers.step2_budget === "pro_unlimited";

  if (isRacing) {
    return drones.find(d => d.id === "stealth-x1") || drones[1];
  }
  if (isBigProFilm) {
    return drones.find(d => d.id === "cinema-pro") || drones[2];
  }
  if (isSocial || (answers.step2_budget === "under_1000")) {
    return drones.find(d => d.id === "nano-air") || drones[3];
  }

  // Default standard high-end is Mavic Pro
  return drones.find(d => d.id === "mavic-pro") || drones[0];
}
