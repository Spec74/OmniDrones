import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, 
  HelpCircle, ChevronRight, FileCode, ShoppingCart, RefreshCw
} from "lucide-react";
import { DroneProduct, CartItem, Order } from "../types";
import { drones } from "../data";

interface ChatSupportWidgetProps {
  cart: CartItem[];
  completedOrder: Order | null;
  onNavigate: (tab: "home" | "details" | "cart-checkout" | "backend") => void;
  onOpenQuiz: () => void;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatSupportWidget({ 
  cart, 
  completedOrder, 
  onNavigate, 
  onOpenQuiz 
}: ChatSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unread, setUnread] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll down
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initial greeting based on state
  useEffect(() => {
    const getInitialGreeting = (): Message => {
      let greetText = "¡Hola piloto! Soy **AERO-AI**, tu asistente virtual de OmniDrones. ¿En qué puedo ayudarte hoy?";
      let suggestions = [
        "¿Cuáles son los drones recomendados?",
        "¿Cómo funciona la entrega con drones?",
        "¿El backend es Laravel real?"
      ];

      if (completedOrder) {
        greetText = `¡Hola de nuevo! Detecto que tienes un pedido activo (**${completedOrder.id}**). ¿Quieres saber la posición del dron de entrega o necesitas asistencia con tu factura electrónica de SUNAT?`;
        suggestions = [
          "Ver rastreo de mi orden",
          "¿Cómo descargo el XML SUNAT?",
          "Ver código del Order Service"
        ];
      } else if (cart.length > 0) {
        const droneNames = cart.map(c => c.product.name).join(", ");
        greetText = `¡Veo que tienes productos listos en el hangar! Tienes configurado: **${droneNames}**. ¿Quieres aplicar un cupón de descuento o proceder a la caja?`;
        suggestions = [
          "¿Cómo consigo el 10% de descuento?",
          "Completar la compra",
          "Especificaciones de mi dron"
        ];
      }

      return {
        id: "greet-1",
        sender: "bot",
        text: greetText,
        timestamp: new Date(),
        suggestions
      };
    };

    setMessages([getInitialGreeting()]);
    // Notify user with an unread badge if chat starts closed
    if (!isOpen) {
      setUnread(true);
    }
  }, [completedOrder, isOpen === false]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnread(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate thinking of drone AI
    setTimeout(() => {
      const botResponseText = getBotResponse(text);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botResponseText.text,
        timestamp: new Date(),
        suggestions: botResponseText.suggestions
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  // Chatbot simple NLP matching dictionary
  const getBotResponse = (input: string): { text: string; suggestions?: string[] } => {
    const raw = input.toLowerCase();

    // 1. Order tracking & GPS
    if (raw.includes("rastreo") || raw.includes("orden") || raw.includes("pedido") || raw.includes("dónde") || raw.includes("en camino") || raw.includes("entrega") || raw.includes("gps")) {
      if (completedOrder) {
        return {
          text: `Tu pedido **${completedOrder.id}** se encuentra actualmente en estado: **"${completedOrder.status === 'preparing' ? 'Preparando en Hangar' : completedOrder.status === 'takeoff' ? 'Despegue Autorizado' : completedOrder.status === 'en_route' ? 'En ruta de entrega GPS' : 'Entregado en destino'}"**.\n\nPuedes ver el mapa de vuelo con radar satelital interactivo 18x en tiempo real en la pestaña de checkout.`,
          suggestions: ["Ir a ver radar satelital", "Ver facturación SUNAT", "¿El backend es Laravel?"]
        };
      } else {
        return {
          text: `Para activar el rastreo satelital por radar, primero debes simular una compra en la pestaña de **Carrito ("Mi Hangar")**. Al completar los campos y presionar "Aprobar Orden", nuestro dron despegará y se encenderá el satélite GPS de rastreo.`,
          suggestions: ["Ir al Carrito a comprar", "Hacer DroneMatch Quiz"]
        };
      }
    }

    // 2. Click tracking navigator action
    if (raw.includes("ver rastreo") || raw.includes("radar satelital") || raw.includes("ir a ver radar satelital") || raw.includes("rastreo de mi orden")) {
      onNavigate("cart-checkout");
      return {
        text: `¡Excelente! Te he redirigido a la sección de **Rastreo Satelital/Checkout** para que veas el mapa de vuelo interactivo de tu orden en tiempo real.`,
        suggestions: ["¿Cómo se generó el XML?", "¿Cómo descargo el XML SUNAT?"]
      };
    }

    // 3. SUNAT Invoice / XML topics
    if (raw.includes("xml") || raw.includes("sunat") || raw.includes("factura") || raw.includes("boleta") || raw.includes("comprobante") || raw.includes("pdf")) {
      if (completedOrder) {
        return {
          text: `¡Fantástico! Hemos emitido la **Factura Electrónica SUNAT F001-${completedOrder.id.replace(/\D/g, "") || '2831'}**. Cumple con el estándar UBL 2.1 peruano e incluye:\n- Firma digital SHA-256 de OmniDrones\n- Cálculo del 18% de IGV\n- Detalle del hangar local.\n\nPuedes descargar el archivo **XML** real o imprimir la representación física haciendo clic en el botón *xml_ubl_generator.php* en los detalles del comprobante.`,
          suggestions: ["¿Cómo se generó el XML?", "Ver código del Order Service"]
        };
      } else {
        return {
          text: `En OmniDrones emitimos facturación electrónica SUNAT instantánea autorizada. Generamos archivos XML de formato UBL 2.1 y PDFs físicos de forma automática para el mercado peruano. Te invito a agregar un dron al carrito y completar la compra para visualizar un XML real.`,
          suggestions: ["Ir al Carrito a comprar", "Características de Mavic Pro"]
        };
      }
    }

    if (raw.includes("cómo se generó") || raw.includes("cómo integro sunat") || raw.includes("ubl")) {
      return {
        text: `El XML se autogenera en nuestro microservicio de órdenes usando PHP Laravel. Definimos las etiquetas estándar de OASIS UBL 2.1 como \`<cac:AccountingSupplierParty>\` para el emisor de OmniDrones (RUC 20491839210) y \`<cac:TaxTotal>\` para el cálculo del IP/IGV. Puedes inspeccionar la estructura exacta intercambiando de pestaña a XML en el recibo de compra.`,
        suggestions: ["Ver código del Order Service", "Qué drones hay"]
      };
    }

    // 4. Laravel status & details
    if (raw.includes("laravel") || raw.includes("backend") || raw.includes("microservicio") || raw.includes("php") || raw.includes("servicios") || raw.includes("código")) {
      return {
        text: `¡Nuestra arquitectura backend es de vanguardia! Implementamos un patrón **Database-per-Service** con dos microservicios en Laravel:\n\n1. **Catalog Service**: Administra la flota, existencias y realiza comprobaciones rápidas de stock (\`GET /api/products/{id}/check-stock\`).\n2. **Order Service**: Valida el carrito, gestiona la pasarela, realiza los cálculos SUNAT y concreta registros transaccionales en MySQL.\n\nContamos con un simulador de consola en la pestaña **"Mesa Backend (Laravel)"** donde puedes explorar el código fuente PHP y emitir solicitudes HTTP reales con payloads de prueba.`,
        suggestions: ["Ir a la Mesa Backend (Laravel)", "Ver código del Order Service", "¿Qué bases de datos usan?"]
      };
    }

    if (raw.includes("mesa backend") || raw.includes("ir a la mesa backend")) {
      onNavigate("backend");
      return {
        text: `¡Listo! Te he transferido a la **Mesa de APIs y Terminal Laravel**. Allí puedes presionar "Visualizar Código" o disparar peticiones HTTP inter-servicios en el Playground.`,
        suggestions: ["Probar GET /api/products", "Probar POST checkout", "Volver al catálogo"]
      };
    }

    if (raw.includes("bases de datos") || raw.includes("db") || raw.includes("mysql")) {
      return {
        text: `Para asegurar el desacoplamiento total de microservicios, usamos el patrón "Database-per-Service". En producción cada microservicio corre en su propio esquema de base de datos:\n- Catalog Service usa la conexión \`mysql_catalog\` para la base de datos \`db_catalog\`.\n- Order Service usa la conexión \`mysql_orders\` para la base de datos \`db_orders\`.\n\nEsto previene interferencias y cuellos de botella directos en el pool de conexiones SQL.`,
        suggestions: ["Ver código del Order Service", "Hacer DroneMatch Quiz"]
      };
    }

    // 5. Cupón / descuento topics
    if (raw.includes("cupón") || raw.includes("descuento") || raw.includes("ahorrar") || raw.includes("rebaja") || raw.includes("10%")) {
      return {
        text: `¡Excelente iniciativa piloto! Puedes desbloquear de forma garantizada un **cupón de 10% de descuento** para cualquier dron completando nuestro test interactivo **"DroneMatch Quiz"**. El quiz consta de 4 preguntas rápidas sobre tu profesión o hobbie y te dirá cuál es tu dron perfecto.`,
        suggestions: ["Iniciar DroneMatch Quiz", "¿Cuáles son los drones recomendados?"]
      };
    }

    if (raw.includes("iniciar dronematch mini") || raw.includes("iniciar dronematch quiz") || raw.includes("tomar quiz") || raw.includes("tomar el quiz")) {
      onOpenQuiz();
      return {
        text: `¡Entendido! Acabo de abrir en pantalla el **DroneMatch Wizard**. Responde a los parámetros para descubrir tu nave ideal y conseguir tu bono promocional.`,
        suggestions: ["Cerrar chat", "¿Cuáles son los drones recomendados?"]
      };
    }

    // 6. Drone models info
    if (raw.includes("dron") || raw.includes("drones") || raw.includes("flota") || raw.includes("mavic") || raw.includes("stealth") || raw.includes("nano") || raw.includes("cinema") || raw.includes("modelos")) {
      return {
        text: `Nuestra flota insignia está compuesta por 4 naves premium:\n\n1. **Omni Mavic Pro Gen-3** ($1,899): El todoterreno de vuelo silencioso y cámara Hasselblad 5.1K. El más popular.\n2. **Aero Stealth X-1 FPV** ($2,450): Estructura de carbono robusta para inmersiones a alta velocidad (hasta 140km/h).\n3. **Aero Cinema Pro Octo** ($3,999): Ocho motores redundantes para soporte de cámaras de cine profesional.\n4. **Aero Nano Selfie Air** ($840): Super ligero (249g), control de gestos y evasión inteligente para principiantes.`,
        suggestions: ["Quiero el Mavic Pro", "Quiero el Stealth X-1 FPV", "Hacer DroneMatch Quiz"]
      };
    }

    if (raw.includes("mavic pro") || raw.includes("quiero el mavic")) {
      const drone = drones[0];
      return {
        text: `El **Mavic Pro Gen-3** cuenta con un sensor CMOS de 4/3 pulgadas que graba en 5.1K, transmisión de video O3+ estable a 15 kilómetros y una increíble autonomía de **46 minutos de vuelo continuo**.`,
        suggestions: ["Agregar Mavic Pro al carro", "Ver otros drones"]
      };
    }

    if (raw.includes("agregar mavic") || raw.includes("comprar mavic")) {
      onNavigate("details");
      return {
        text: `Te he llevado a la pestaña de configuración del **Mavic Pro Gen-3** para que elijas sus colores, accesorios de repuesto (baterías, hélices de carbono) y lo añadas al carrito.`,
        suggestions: ["Ir al Carrito a comprar"]
      };
    }

    // 7. General help or fallback
    return {
      text: `Entendido. Te comento que en OmniDrones ofrecemos:\n- **Drones Profesionales** listos para certificar.\n- **Simulador de APIs Backend** para aprender Laravel e integraciones SUNAT.\n- **Rastreo GPS Satelital** de tus órdenes electrónicas.\n- **Atención personalizada** las 24 horas por pilotos certificados.\n\n¿Tienes alguna duda específica sobre el código PHP de SUNAT, las características de las naves, o cómo usar el cupón?`,
      suggestions: [
        "¿Cuáles son los drones recomendados?",
        "¿El backend es Laravel real?",
        "¿Cómo funciona la entrega con drones?"
      ]
    };
  };

  return (
    <>
      {/* 1. FLOATING ACTION TRIGGER BUBBLE (Bottom-Left as requested, instead of blocked alert) */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start font-sans print:hidden">
        <button
          onClick={handleOpenToggle}
          className={`relative p-3.5 rounded-full shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)] cursor-pointer transition-all duration-300 border flex items-center justify-center ${
            isOpen 
              ? "bg-red-500 border-red-400 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]" 
              : "bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-850 text-emerald-400"
          }`}
          aria-label="Open support AI Chat"
        >
          {isOpen ? <X className="h-5.5 w-5.5" /> : <MessageSquare className="h-5.5 w-5.5" />}
          
          {/* Animated notification ping */}
          {unread && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* 2. CHAT DRAWER PANEL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-24 left-6 z-45 max-w-[350px] sm:max-w-[400px] w-[calc(100vw-3rem)] h-[480px] bg-gray-950 border border-gray-900 rounded-3xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden font-sans"
          >
            {/* Header Area */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-900 px-4.5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-white">SOPORTE DE VUELO AI</span>
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-[9px] font-mono font-medium text-gray-500 tracking-wider">AERO-PILOT AI • ACTIVO</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-550 hover:text-white p-1 rounded-full hover:bg-gray-900 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Body Area */}
            <div 
              ref={scrollRef}
              className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin bg-black/40"
            >
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar icon */}
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border text-[10px] ${
                      msg.sender === "user" 
                        ? "bg-gray-900 border-gray-800 text-gray-400" 
                        : "bg-emerald-500/10 border-emerald-500/10 text-emerald-400"
                    }`}>
                      {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>

                    {/* Chat bubbles */}
                    <div className={`rounded-2xl px-3.5 py-2.5 max-w-[80%] text-xs leading-relaxed space-y-1 ${
                      msg.sender === "user"
                        ? "bg-emerald-500 text-black font-semibold rounded-tr-sm"
                        : "bg-gray-900/80 border border-gray-900 text-gray-300 rounded-tl-sm whitespace-pre-wrap"
                    }`}>
                      {/* Formatter for bold markdown syntax (**bold**) */}
                      <div>
                        {msg.text.split("**").map((chunk, index) => 
                          index % 2 === 1 ? <strong key={index} className={msg.sender === "user" ? "text-black font-black" : "text-emerald-400 font-bold"}>{chunk}</strong> : chunk
                        )}
                      </div>
                      <span className={`block text-[8px] mt-1 font-mono text-right ${msg.sender === "user" ? "text-emerald-950" : "text-gray-600"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic FAQ Recommendations suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-9.5 pt-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[10px] text-gray-400 bg-gray-950 border border-gray-900 hover:border-emerald-500/30 hover:text-emerald-400 px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium text-left leading-tight"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Bot thinking placeholder loader */}
              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/10 text-emerald-400">
                    <Bot className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                  <div className="bg-gray-900 border border-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-gray-400 flex items-center gap-1.5 shadow-md">
                    <span>Navegando base de conocimientos</span>
                    <span className="flex gap-1 items-center">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Action Form Area */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="bg-gray-900/90 border-t border-gray-900/85 p-3 flex gap-2 shrink-0 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu consulta sobre drone o Laravel..."
                className="bg-black border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 flex-1 placeholder:text-gray-600 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-2.5 rounded-xl shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                  inputValue.trim() 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md" 
                    : "bg-gray-950 border border-gray-850 text-gray-700 pointer-events-none"
                }`}
                aria-label="Send query message"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
