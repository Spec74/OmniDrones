import React, { useState, useEffect } from "react";
import { CartItem, ShippingDetails, PaymentMethod, Order } from "../types";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trash2, ArrowLeft, ShieldCheck, CreditCard, 
  ChevronRight, CheckCircle, Check, Loader, 
  Compass, Sparkles, Percent, X, Printer, FileText, Download, FileCode 
} from "lucide-react";

interface CartAndCheckoutProps {
  cart: CartItem[];
  hasDiscount: boolean;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onBackToShop: () => void;
  completedOrder?: Order | null;
  onSetCompletedOrder?: (order: Order | null) => void;
  currentUser?: { name: string; email: string } | null;
  onSetCurrentUser?: (user: { name: string; email: string } | null) => void;
}

export default function CartAndCheckout({
  cart,
  hasDiscount,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToShop,
  completedOrder,
  onSetCompletedOrder,
  currentUser,
  onSetCurrentUser,
}: CartAndCheckoutProps) {
  // Navigation internal flow step: "cart" | "auth_gate" | "checkout" | "success"
  const [step, setStep] = useState<"cart" | "auth_gate" | "checkout" | "success">("cart");
  
  // Checkout Form Variables
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Lima",
    reference: "",
  });

  // Pre-fill fields whenever currentUser logs in
  useEffect(() => {
    if (currentUser) {
      setShipping({
        fullName: currentUser.name,
        email: currentUser.email,
        phone: "+51 999 888 777",
        address: "Av. de la Innovación 450, Urb. Tech",
        city: "San Borja, Lima",
        reference: "Frente al parque central"
      });
    }
  }, [currentUser]);
  const [formErrors, setFormErrors] = useState<Partial<ShippingDetails>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardDetails, setCardDetails] = useState({
    num: "",
    expiry: "",
    cvv: "",
  });
  
  // Custom manual coupon code State
  const [couponCode, setCouponCode] = useState<string>(hasDiscount ? "MATCH10" : "");
  const [couponApplied, setCouponApplied] = useState<boolean>(hasDiscount);
  const [couponError, setCouponError] = useState<string>("");

  // Simulated Loading & Custom Component States
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [invoiceTab, setInvoiceTab] = useState<"pdf" | "xml">("pdf");

  // Local completed order if parent didn't provide one
  const [localCompletedOrder, setLocalCompletedOrder] = useState<Order | null>(null);
  const activeCompletedOrder = completedOrder !== undefined ? completedOrder : localCompletedOrder;
  const setActiveCompletedOrder = onSetCompletedOrder || setLocalCompletedOrder;

  // Use the advanced customer order tracking hook
  const {
    status: successTrackingStatus,
    advanceTracking,
    resetTracking,
    jumpToStatus,
    telemetry,
    progressPercent
  } = useOrderTracking();

  // Keep tracking status synchronized when there's a finalized order
  useEffect(() => {
    if (activeCompletedOrder) {
      jumpToStatus(activeCompletedOrder.status);
    }
  }, [activeCompletedOrder, jumpToStatus]);

  // Handle auto closing Toast after 6 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Prices calculation helpers
  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const itemAccessoriesTotal = item.selectedAccessories.reduce((accSum, a) => accSum + a.price, 0);
      return sum + (item.product.price + itemAccessoriesTotal) * item.quantity;
    }, 0);
  };

  const calculateDiscount = (sub: number) => {
    return couponApplied ? sub * 0.1 : 0;
  };

  const subtotal = getSubtotal();
  const discount = calculateDiscount(subtotal);
  const taxedSubtotal = subtotal - discount;
  const tax = taxedSubtotal * 0.18; // 18% standard IGV
  const shippingFee = subtotal > 1500 ? 0 : 25; // FREE shipping above 1500 USD
  const totalAmount = taxedSubtotal + tax + shippingFee;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "MATCH10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Código de cupón inválido o caducado");
      setCouponApplied(false);
    }
  };

  // Checkout submission handler with STRICT REGEX validation and loading times
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<ShippingDetails> = {};

    // Standard high-fidelity Email Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Phone validation for international or local digits (at least 9 digits)
    const phoneRegex = /^\+?(\d[\s-]?){9,}$/;

    // 1. Full name validation
    if (!shipping.fullName.trim()) {
      errors.fullName = "Ingresa tu nombre completo.";
    } else if (shipping.fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = "Por favor ingresa nombre y apellido.";
    }

    // 2. Email Validation
    if (!shipping.email.trim()) {
      errors.email = "Ingresa tu correo para recibir las notificaciones de tracking.";
    } else if (!emailRegex.test(shipping.email.trim())) {
      errors.email = "Formato de correo electrónico inválido (ejemplo: piloto@omnidrones.com).";
    }

    // 3. Phone Validation
    if (!shipping.phone.trim()) {
      errors.phone = "Ingresa tu número telefónico celular de enlace.";
    } else if (!phoneRegex.test(shipping.phone.trim())) {
      errors.phone = "Formato de teléfono inválido (debe contener al menos 9 dígitos numéricos).";
    }

    // 4. Address Validation
    if (!shipping.address.trim()) {
      errors.address = "Ingresa tu dirección exacta de envío.";
    } else if (shipping.address.trim().length < 10) {
      errors.address = "La dirección de flete debe ser detallada (mínimo 10 caracteres).";
    }

    // 5. Referencia / Distrito Validation
    if (!shipping.reference.trim()) {
      errors.reference = "Ingresa tu distrito o una referencia.";
    } else if (shipping.reference.trim().length < 4) {
      errors.reference = "La referencia o distrito debe tener al menos 4 caracteres.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    // Enter processing payment loading screen for exactly 3 seconds
    setIsProcessingPayment(true);

    setTimeout(() => {
      // Generate simulated high-fidelity order compliant with diagram format (#APX-2026-6digits)
      const simulatedOrder: Order = {
        id: "APX-2026-" + Math.floor(100000 + Math.random() * 900000),
        items: [...cart],
        shipping: { ...shipping },
        paymentMethod,
        subtotal,
        discount,
        tax,
        total: totalAmount,
        status: "preparing",
        createdAt: new Date().toLocaleDateString("es-PE"),
      };

      setActiveCompletedOrder(simulatedOrder);
      setIsProcessingPayment(false);
      onClearCart();
      setStep("success");
      // Fire the interactive top Toast immediately after payment completes successfully
      setShowToast(true);
    }, 3000);
  };

  // View 1: Shopping Cart Outline (SCREEN_2)
  if (step === "cart") {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">
        
        {/* Progress Bar / Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-950 pb-5">
          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Seguir Comprando</span>
          </button>
          
          <h2 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-wider">
            Tu Carrito de Vuelo
          </h2>

          <div className="text-[10px] sm:text-xs text-gray-500 font-medium font-mono uppercase">
            Moneda: USD (Dólares Americanos)
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-gray-950 rounded-2xl border border-gray-900 p-12 text-center space-y-4 max-w-md mx-auto">
            <Compass className="h-12 w-12 text-gray-700 mx-auto animate-spin" style={{ animationDuration: "12s" }} />
            <h3 className="text-base font-bold text-gray-350">Tu hangar está vacío</h3>
            <p className="text-xs text-gray-500">
              Aún no has agregado ninguna configuración de aeronaves a tu hangar.
            </p>
            <button
              onClick={onBackToShop}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Inspeccionar Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Listed custom configurations */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                const itemAccPrice = item.selectedAccessories.reduce((accS, a) => accS + a.price, 0);
                const itemSinglePrice = item.product.price + itemAccPrice;

                return (
                  <div 
                    key={item.id}
                    className="bg-gray-950 rounded-2xl border border-gray-900/80 p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-center justify-between"
                  >
                    {/* Visual Asset */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="h-20 w-20 rounded-xl bg-gray-1000/80 border border-gray-900 p-2 flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-contain pointer-events-none drop-shadow"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs md:text-sm font-bold text-white truncate">{item.product.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-mono tracking-wider uppercase text-gray-500">Color:</span>
                          <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.selectedColor.hex }} />
                          <span className="text-[10px] text-gray-400 font-semibold">{item.selectedColor.name}</span>
                        </div>
                        
                        {/* Optional specifications addons listed */}
                        {item.selectedAccessories.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.selectedAccessories.map((acc) => (
                              <span 
                                key={acc.id}
                                className="bg-gray-900 border border-gray-850 px-2 py-0.5 rounded text-[9px] text-gray-450 font-medium"
                              >
                                + {acc.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Numeric managers and pricing */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-gray-900/40 sm:border-t-0 pt-3 sm:pt-0">
                      
                      {/* Quantity buttons */}
                      <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg h-8">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 text-xs text-gray-400 hover:text-white cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold text-white min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 text-xs text-gray-400 hover:text-white cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total price */}
                      <div className="text-right">
                        <div className="text-xs md:text-sm font-mono font-black text-white">
                          ${(itemSinglePrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[9px] text-gray-500">
                          ${itemSinglePrice.toLocaleString("en-US")} c/u
                        </div>
                      </div>

                      {/* Trash action */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-500 hover:text-red-400 p-2 border border-transparent hover:border-gray-900 rounded-xl transition-all cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Box: Totals Outline sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-950 rounded-2xl border border-gray-900 p-5 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold border-b border-gray-900 pb-3">
                  Resumen de Compra
                </h3>

                {/* Coupon Code Input block */}
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="coupon" className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                    ¿Tienes un cupón de descuento?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                      placeholder="Ej. MATCH10"
                      disabled={couponApplied}
                      className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500 flex-1 font-mono"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponApplied}
                      className={`text-xs font-bold px-4 rounded-xl cursor-pointer transition-all ${
                        couponApplied 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-gray-900 border border-gray-800 hover:border-gray-700 text-white"
                      }`}
                    >
                      {couponApplied ? "Aplicado" : "Aplicar"}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-450 font-medium">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <Percent className="h-3.5 w-3.5" />
                      <span>Fórmula MATCH10 aplicada: Recibes 10% de descuento</span>
                    </p>
                  )}
                </div>

                <hr className="border-gray-900" />

                {/* Subtotals outline */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal hangar:</span>
                    <span className="font-mono text-white">${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-400 font-extrabold">
                      <span>Descuento del cupón (10%):</span>
                      <span className="font-mono">-${discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-400">
                    <span>Impuestos (IGV 18%):</span>
                    <span className="font-mono text-white">${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Costos de envío:</span>
                    <span className="font-mono text-white">
                      {shippingFee === 0 ? "Envío Gratis (Fletes > $1500)" : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-900" />

                {/* Ultimate output price */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-mono uppercase text-gray-500">Gran Total Seguro:</span>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-mono font-black text-[#10B981]">
                      ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[9px] text-gray-500">En dólares americanos</div>
                  </div>
                </div>

                {/* Proceed button */}
                <button
                  onClick={() => {
                    if (currentUser) {
                      setStep("checkout");
                    } else {
                      setStep("auth_gate");
                    }
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <span>Proceder al Pago Seguro</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 bg-gray-950 border border-gray-900 rounded-xl p-3.5 text-[10px] md:text-xs text-gray-500 justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Pasarela encriptada SSL de 256 bits</span>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // View 1.5: Checkout Authentication Checkpoint (Page 8 "Inicio de Sesión")
  if (step === "auth_gate") {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 font-sans">
        
        {/* Navigation Step Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-900/60 pb-5">
          <button
            onClick={() => setStep("cart")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Carrito</span>
          </button>
          
          <h2 className="text-xl font-sans font-black text-white uppercase tracking-wider">
            Control de Acceso de Operador
          </h2>

          <div className="text-[10px] sm:text-xs text-gray-500 font-medium font-mono uppercase">
            Paso Intermedio • Registro de Canal
          </div>
        </div>

        {/* High-fidelity dual column panel */}
        <div className="bg-gray-950 border border-gray-900 rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.85)] grid grid-cols-1 md:grid-cols-12">
          
          {/* Column 1: Iniciar Sesión (7 Cols) */}
          <div className="p-6 md:p-8 md:col-span-7 space-y-5 border-b md:border-b-0 md:border-r border-gray-900">
            <div className="space-y-1.5">
              <h3 className="text-lg md:text-xl font-sans font-black text-white uppercase tracking-wider">
                Iniciar Sesión
              </h3>
              <p className="text-xs text-gray-400">
                Accede a tu cuenta de operador OmniDrones.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (onSetCurrentUser) {
                  onSetCurrentUser({ name: "Juan Delgado", email: "juan@omnidrones.com" });
                }
                setStep("checkout");
              }} 
              className="space-y-4 pt-2"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest block">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  defaultValue="nombre@omnidrones.com"
                  className="bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 w-full"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest block">Contraseña</label>
                  <span className="text-[10px] font-bold text-gray-550 hover:text-emerald-400 font-mono cursor-pointer">
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
                <input
                  type="password"
                  required
                  defaultValue="••••••••"
                  className="bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                ENTRAR AL PANEL y Continuar
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-900"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-gray-550 uppercase tracking-widest">O continuar con</span>
              <div className="flex-grow border-t border-gray-900"></div>
            </div>

            {/* Social Logins row */}
            <div className="grid grid-cols-3 gap-3">
              {["Google", "Apple", "Facebook"].map((provider) => (
                <button
                  key={provider}
                  onClick={() => {
                    if (onSetCurrentUser) {
                      onSetCurrentUser({ name: "Juan Delgado", email: "juan@omnidrones.com" });
                    }
                    setStep("checkout");
                  }}
                  className="bg-gray-900 border border-gray-850 hover:border-gray-700 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:bg-gray-850 text-[11px] font-bold text-gray-350 hover:text-white"
                >
                  <span>{provider}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Compra Directa Guest (5 Cols) */}
          <div className="bg-gray-950/45 p-6 md:p-8 flex flex-col justify-between md:col-span-5 space-y-6">
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
                onClick={() => {
                  setStep("checkout");
                }}
                className="w-full h-11 bg-transparent hover:bg-gray-900 border border-gray-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>COMPRAR COMO INVITADO</span>
              </button>

              <div className="flex gap-2.5 items-start bg-gray-900/30 p-3.5 rounded-xl border border-gray-900 text-[10px] text-gray-400 leading-relaxed">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>
                  <strong>OmniCare Protection:</strong> Incluida de forma totalmente gratuita en todas las compras como invitado por los primeros 12 meses de vuelo.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // View 2: Shipping Details Form & Payment selectors (SCREEN_27)
  if (step === "checkout") {
    return (
      <div className="relative">
        <AnimatePresence>
          {isProcessingPayment && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center space-y-5"
            >
              <Loader className="h-10 w-10 text-emerald-400 animate-spin" />
              <div className="space-y-1.5 text-center">
                <h3 className="text-base font-bold text-white tracking-widest uppercase font-mono animate-pulse">Procesando pago seguro...</h3>
                <p className="text-xs text-gray-400 max-w-xs">Escribiendo registros criptográficos e iniciando telemetría satelital en el hangar central OmniDrones.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleCheckoutSubmit} className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">
          
          {/* Navigation Step Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-950 pb-5">
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a Modificar Carrito</span>
            </button>

            <h2 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-wider">
              Datos de Envío y Método de Pago
            </h2>

            <div className="text-xs text-gray-500 font-mono">
              Hangar ➜ Envío ➜ Tracking
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form payload */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Box A: Address destination fields */}
              <div className="bg-gray-950 rounded-2xl border border-gray-900 p-5 space-y-5">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold border-b border-gray-900 pb-3">
                  1. Dirección de Entrega
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="fnObj" className="block text-[11px] font-semibold text-gray-400 mb-1.5">Nombre Completo</label>
                    <input
                      id="fnObj"
                      type="text"
                      value={shipping.fullName}
                      onChange={(e) => {
                        setShipping({ ...shipping, fullName: e.target.value });
                        if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                      }}
                      className={`w-full bg-gray-990 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all ${
                        formErrors.fullName ? "border-red-500" : "border-gray-850"
                      }`}
                      placeholder="Ej. Roberto Benavente Alva"
                    />
                    {formErrors.fullName && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="emObj" className="block text-[11px] font-semibold text-gray-400 mb-1.5">Email</label>
                    <input
                      id="emObj"
                      type="text"
                      value={shipping.email}
                      onChange={(e) => {
                        setShipping({ ...shipping, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                      }}
                      className={`w-full bg-gray-990 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all ${
                        formErrors.email ? "border-red-500" : "border-gray-850"
                      }`}
                      placeholder="piloto@ejemplo.com"
                    />
                    {formErrors.email && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phObj" className="block text-[11px] font-semibold text-gray-400 mb-1.5">Teléfono</label>
                    <input
                      id="phObj"
                      type="text"
                      value={shipping.phone}
                      onChange={(e) => {
                        setShipping({ ...shipping, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      className={`w-full bg-gray-990 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all ${
                        formErrors.phone ? "border-red-500" : "border-gray-850"
                      }`}
                      placeholder="Ej. +51 987 654 321"
                    />
                    {formErrors.phone && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="adObj" className="block text-[11px] font-semibold text-gray-400 mb-1.5">Dirección de Envío</label>
                    <input
                      id="adObj"
                      type="text"
                      value={shipping.address}
                      onChange={(e) => {
                        setShipping({ ...shipping, address: e.target.value });
                        if (formErrors.address) setFormErrors({ ...formErrors, address: undefined });
                      }}
                      className={`w-full bg-gray-990 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all ${
                        formErrors.address ? "border-red-500" : "border-gray-850"
                      }`}
                      placeholder="Av. Javier Prado Este 2465, Dpto 402"
                    />
                    {formErrors.address && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.address}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="refObj" className="block text-[11px] font-semibold text-gray-400 mb-1.5">Referencia / Distrito</label>
                    <input
                      id="refObj"
                      type="text"
                      value={shipping.reference}
                      onChange={(e) => {
                        setShipping({ ...shipping, reference: e.target.value });
                        if (formErrors.reference) setFormErrors({ ...formErrors, reference: undefined });
                      }}
                      className={`w-full bg-gray-990 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all ${
                        formErrors.reference ? "border-red-500" : "border-gray-850"
                      }`}
                      placeholder="Ej. San Borja, frente al Parque de la Felicidad"
                    />
                    {formErrors.reference && <p className="text-[10px] text-red-500 mt-1 font-semibold">{formErrors.reference}</p>}
                  </div>
                </div>
              </div>

              {/* Box B: Payment platform options */}
              <div className="bg-gray-950 rounded-2xl border border-gray-900 p-5 space-y-5">
                {/* Visual Header simulating Mercado Pago Protection */}
                <div className="bg-sky-500/10 border border-sky-450/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#009EE3] text-white flex items-center justify-center rounded-xl font-sans font-black text-xs shrink-0 tracking-tighter uppercase px-1">
                      mp
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                        🛡️ Pago Protegido por Mercado Pago
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        La transacción se procesará mediante la pasarela segura encriptada de 256 bits de Mercado Pago.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-md uppercase font-bold animate-pulse">
                    CONEXIÓN SEGURA SSL
                  </span>
                </div>

                <h3 className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold border-b border-gray-900 pb-3">
                  2. Selecciona un Método de Pago
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "card", name: "Tarjeta de Crédito/Débito (VISA/Mastercard)", desc: "Pago en línea express instantáneo" },
                    { id: "yape", name: "Yape", desc: "Pago rápido vía código QR" },
                    { id: "plin", name: "Plin", desc: "Pago rápido vía código QR" }
                  ].map((m) => {
                    const isMethodActive = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 h-24 hover:bg-gray-900/40 cursor-pointer ${
                          isMethodActive 
                            ? "border-emerald-500 bg-gray-900/60" 
                            : "border-gray-900 bg-transparent hover:border-gray-850"
                        }`}
                      >
                        {/* Custom Radio Button element */}
                        <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isMethodActive ? "border-emerald-500 bg-emerald-500/10" : "border-gray-700"
                        }`}>
                          {isMethodActive && (
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        
                        <div className="space-y-1 min-w-0">
                          <span className="text-xs font-black text-white block leading-tight">{m.name}</span>
                          <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider">{m.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic displays based on selection */}
                {paymentMethod === "card" && (
                  <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-900 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3">
                        <label htmlFor="card-n" className="block text-[10px] text-gray-400 uppercase tracking-wide mb-1.5 font-semibold">Número de Tarjeta</label>
                        <input 
                          id="card-n"
                          type="text" 
                          placeholder="4512 8560 2154 9632" 
                          value={cardDetails.num}
                          onChange={(e) => setCardDetails({ ...cardDetails, num: e.target.value })}
                          className="w-full bg-gray-950 border border-gray-850 px-3 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="card-e" className="block text-[10px] text-gray-400 uppercase tracking-wide mb-1.5 font-semibold">Vencimiento</label>
                        <input 
                          id="card-e"
                          type="text" 
                          placeholder="MM/AA" 
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full bg-gray-950 border border-gray-850 px-3 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-c" className="block text-[10px] text-gray-400 uppercase tracking-wide mb-1.5 font-semibold">CVV / CVV2</label>
                        <input 
                          id="card-c"
                          type="text" 
                          placeholder="123" 
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full bg-gray-950 border border-gray-850 px-3 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === "yape" || paymentMethod === "plin") && (
                  <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Simulated QR Code box with appropriate branding styles */}
                    <div className="flex flex-col items-center gap-2.5 shrink-0">
                      <div className={`h-36 w-36 bg-white rounded-2xl p-3 shadow-xl flex items-center justify-center border-4 relative overflow-hidden ${
                        paymentMethod === "yape" ? "border-[#74226C]" : "border-[#00D4C5]"
                      }`}>
                        {/* Simulated QR Pattern inside layout */}
                        <div className="w-full h-full bg-cover bg-center brightness-95" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=150)` }} />
                        <div className="absolute inset-0 bg-[#00F3A2]/5 flex items-center justify-center pointer-events-none">
                          <div className={`h-0.5 w-full animate-bounce absolute top-1/2 ${
                            paymentMethod === "yape" ? "bg-[#74226C]" : "bg-[#00D4C5]"
                          }`} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {paymentMethod === "yape" ? (
                          <span className="px-3 py-1 rounded-md bg-[#74226C] text-[10px] font-black text-white font-mono uppercase tracking-widest shadow">
                            💜 YAPE oficial • Escanea para pagar
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-md bg-[#00D4C5] text-[10px] font-black text-white font-mono uppercase tracking-widest shadow">
                            🩵 PLIN oficial • Escanea para pagar
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                        Pago Seguro con {paymentMethod === "yape" ? "Yape" : "Plin"} QR
                      </h4>
                      <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed font-normal">
                        1. Abre la aplicación de <strong>{paymentMethod.toUpperCase()}</strong> en tu celular.<br />
                        2. Escanea el código QR interactivo de arriba.<br />
                        3. Envía el monto de <strong>${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong> (o su equivalente en Soles) a nombre de <strong className="text-white">OmniDrones SAC</strong>.<br />
                        4. Una vez enviado, haz clic en el botón de abajo "Confirmar Pago Seguro" para que nuestros drones pilotos del hangar central verifiquen tu pago en tiempo real y den de alta el vuelo.
                      </p>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Right Column: Order breakdown column widget */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-950 rounded-2xl border border-gray-900 p-5 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold border-b border-gray-900 pb-3">
                  Resumen de Pedido
                </h3>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const lineSinglePrice = item.product.price + item.selectedAccessories.reduce((sum, a) => sum + a.price, 0);
                    return (
                      <div key={item.id} className="flex justify-between items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{item.product.name}</div>
                          <div className="text-[9px] text-gray-400 mt-0.5 font-medium font-mono">
                            Q: {item.quantity} • {item.selectedColor.name}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                          ${(lineSinglePrice * item.quantity).toLocaleString("en-US")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <hr className="border-gray-900" />

                {/* Subtotal metrics */}
                <div className="space-y-1.5 text-xs text-gray-400 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal hangar:</span>
                    <span className="font-mono text-white">${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-400 font-extrabold">
                      <span>Cupón (10%):</span>
                      <span className="font-mono">-${discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Impuestos (IGV 18%):</span>
                    <span className="font-mono text-white">${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flete de envío:</span>
                    <span className="font-mono text-white">{shippingFee === 0 ? "Gratis" : `$${shippingFee}`}</span>
                  </div>
                </div>

                <hr className="border-gray-900" />

                {/* Total values */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-mono uppercase text-gray-500">Importe Final:</span>
                  <span className="text-lg md:text-xl font-mono font-black text-emerald-400">
                    ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Confirmar Pago Seguro</span>
                </button>
              </div>
            </div>

          </div>

        </form>
      </div>
    );
  }

  // View 3: Purchase success and interactive flight mechanics tracking (SCREEN_13 & Tracking)
  if (step === "success" && activeCompletedOrder) {
    
    // Tracking points config
    const trackingSteps = [
      { id: "preparing", title: "Preparando Motores", desc: "El hangar está calibrando los rotores del dron principal." },
      { id: "takeoff", title: "En Zona de Despegue", desc: "La aeronave ha completado el pre-vuelo y fijado satélites GPS." },
      { id: "en_route", title: "Vuelo Autónomo En Camino", desc: "El dron vuela autónomamente enviando datos telemétricos." },
      { id: "delivered", title: "Nave Aterrizada", desc: "Tu cargamento ha aterrizado con suavidad extrema en tu dirección de flete." },
    ];

    const currentTrackingIndex = trackingSteps.findIndex(s => s.id === successTrackingStatus);

    const getDronePos = () => {
      switch (successTrackingStatus) {
        case "preparing": return { x: 40, y: 130 };
        case "takeoff": return { x: 50, y: 110 };
        case "en_route": return { x: 140, y: 75 };
        case "delivered": return { x: 240, y: 35 };
        default: return { x: 40, y: 130 };
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-14 space-y-10 relative">
        
        {/* Dynamic Framer Motion Toast centered at the top */}
        <AnimatePresence>
          {showToast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-gray-950 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-2xl shadow-[0_15px_45px_10px_rgba(0,0,0,0.8)] flex items-center gap-3 w-full"
              >
                <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-semibold text-white leading-normal">
                    📧 ¡Ding! Hemos enviado tu comprobante de pago electrónico y detalles de vuelo a tu correo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowToast(false)}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* E-Invoice Custom Printable Modal */}
        <AnimatePresence>
          {showInvoice && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-950 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 text-left relative shadow-2xl overflow-hidden print:bg-white print:text-black print:border-none"
              >
                {/* Background soft lighting effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none print:hidden" />

                {/* Close Trigger Icon */}
                <button
                  onClick={() => setShowInvoice(false)}
                  className="absolute top-4 right-4 text-gray-505 hover:text-white p-2 hover:bg-gray-905 rounded-full cursor-pointer transition-colors print:hidden z-10"
                >
                  <X className="h-4.5 w-4.5" />
                </button>

                {/* Visual Tab Switcher: E-Invoice Printable / Raw SUNAT UBL-XML */}
                <div className="flex border-b border-gray-900 pb-1.5 gap-2.5 print:hidden">
                  <button
                    onClick={() => setInvoiceTab("pdf")}
                    className={`text-xs font-bold py-1.5 px-3 border-b-2 transition-all cursor-pointer ${
                      invoiceTab === "pdf"
                        ? "border-[#10B981] text-emerald-400"
                        : "border-transparent text-gray-450 hover:text-white"
                    }`}
                  >
                    Representación Impresa (PDF)
                  </button>
                  <button
                    onClick={() => setInvoiceTab("xml")}
                    className={`text-xs font-mono font-bold py-1.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      invoiceTab === "xml"
                        ? "border-sky-500 text-sky-400"
                        : "border-transparent text-gray-450 hover:text-white"
                    }`}
                  >
                    <FileCode className="h-4 w-4 text-sky-400" />
                    <span>xml_ubl_generator.php (XML)</span>
                  </button>
                </div>

                {invoiceTab === "pdf" ? (
                  <>
                    {/* E-Invoice Title Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-900 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                      <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
                      <span className="text-sm font-sans tracking-widest uppercase">OMNIDRONES S.A.</span>
                    </div>
                    <h3 className="text-base md:text-lg font-black font-sans text-white print:text-black">COMPROBANTE ELECTRÓNICO</h3>
                    <p className="text-[10px] font-mono text-gray-500">Orden de Venta: {activeCompletedOrder.id}</p>
                  </div>
                  <div className="text-left sm:text-right text-[10px] font-mono text-gray-400 space-y-1 print:text-black">
                    <div>RUC: 20491839210</div>
                    <div>Fecha Emisión: {activeCompletedOrder.createdAt}</div>
                    <div>Régimen Especial de Operaciones</div>
                  </div>
                </div>

                {/* Customer Details Frame */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-900/40 border border-gray-900 p-4 rounded-xl print:bg-gray-100 print:text-black print:border-solid">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold block print:text-[#10B981]">REGISTRO DE PILOTO</span>
                    <div className="text-white font-bold print:text-black">{activeCompletedOrder.shipping.fullName}</div>
                    <div className="text-gray-400 print:text-black">{activeCompletedOrder.shipping.email}</div>
                    <div className="text-gray-400 print:text-black">{activeCompletedOrder.shipping.phone}</div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold block print:text-[#10B981]">COORDENADAS DE EXPEDICIÓN</span>
                    <div className="text-gray-400 print:text-black">{activeCompletedOrder.shipping.address}</div>
                    <div className="text-gray-450 print:text-black">{activeCompletedOrder.shipping.city}</div>
                    <div className="text-gray-500 font-mono text-[9px]">Soporte: Prioridad Alta</div>
                  </div>
                </div>

                {/* Items Bought Detailing */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold block print:text-[#10B981]">DETALLE DE COMPRA (DRONES & ACCESORIOS)</span>
                  <div className="border border-gray-900 rounded-xl overflow-hidden text-xs print:border-black">
                    <div className="grid grid-cols-12 bg-gray-900/60 p-2.5 font-bold text-gray-400 border-b border-gray-900 print:bg-gray-200 print:text-black">
                      <div className="col-span-6">Descripción Nave / Accesorio</div>
                      <div className="col-span-2 text-center">Cant.</div>
                      <div className="col-span-2 text-right">Unit.</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    <div className="divide-y divide-gray-900 max-h-[160px] overflow-y-auto print:max-h-none print:divide-black">
                      {activeCompletedOrder.items.map((item) => {
                        const itemAccPrice = item.selectedAccessories.reduce((sum, a) => sum + a.price, 0);
                        const unitP = item.product.price + itemAccPrice;
                        return (
                          <div key={item.id} className="grid grid-cols-12 p-3 text-gray-300 print:text-black">
                            <div className="col-span-6 space-y-0.5">
                              <div className="text-white font-bold print:text-black">{item.product.name}</div>
                              <div className="text-[10px] text-gray-500 print:text-black">Color: {item.selectedColor.name}</div>
                              {item.selectedAccessories.length > 0 && (
                                <div className="text-[10px] text-gray-500 print:text-black leading-tight">
                                  Accesorios: {item.selectedAccessories.map(a => a.name).join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="col-span-2 text-center text-white print:text-black">{item.quantity}</div>
                            <div className="col-span-2 text-right">${unitP.toLocaleString()}</div>
                            <div className="col-span-2 text-right text-emerald-400 font-mono print:text-black font-bold">${(unitP * item.quantity).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Barcode and Breakdown totals */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-900 print:border-black">
                  {/* barcode */}
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 bg-white rounded p-1 flex items-center justify-center shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=80"
                        alt="Security scan Stamp"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono leading-tight">
                      <div>HASH FIRMA DIGITAL:</div>
                      <div className="break-all font-semibold">OD-{activeCompletedOrder.id}-HASHSECURED9B</div>
                      <div>AUTORIZADO POR SUNAT - PERÚ</div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="w-full sm:w-auto text-xs space-y-1.5 text-right font-medium min-w-[200px]">
                    <div className="flex justify-between text-gray-400 print:text-black">
                      <span>Subtotal:</span>
                      <span className="font-mono text-white print:text-black">${activeCompletedOrder.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {activeCompletedOrder.discount > 0 && (
                      <div className="flex justify-between text-[#10B981] font-bold">
                        <span>Descuento (MATCH10):</span>
                        <span className="font-mono">-${activeCompletedOrder.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400 print:text-black">
                      <span>IGV (18%):</span>
                      <span className="font-mono text-white print:text-black">${activeCompletedOrder.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 print:text-black border-b border-gray-900 pb-1 print:border-black">
                      <span>Flete de Envío:</span>
                      <span className="font-mono text-white print:text-black">
                        {activeCompletedOrder.total - (activeCompletedOrder.subtotal - activeCompletedOrder.discount + activeCompletedOrder.tax) < 5 ? "Gratis" : "$25.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-white pt-1 print:text-black">
                      <span>GRAN TOTAL:</span>
                      <span className="font-mono text-emerald-400 print:text-black font-black">${activeCompletedOrder.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-sky-400 font-bold block uppercase">
                      UBL 2.1 INVOICE XML SCHEMAS (SUNAT PERÚ)
                    </span>
                    <p className="text-[10px] text-gray-450 leading-relaxed max-w-md">
                      Visualización de la trama XML de Facturación Electrónica firmada digitalmente con algoritmo SHA-256 de SUNAT.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const xmlStr = generateXml(activeCompletedOrder);
                      const blob = new Blob([xmlStr], { type: "text/xml" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `comprobante-${activeCompletedOrder.id}.xml`;
                      a.click();
                    }}
                    className="text-[9px] bg-sky-950 border border-sky-500/20 hover:bg-sky-500 hover:text-black font-extrabold px-3 py-2 rounded-xl text-sky-400 transition-all cursor-pointer shadow-md"
                  >
                    Descargar XML
                  </button>
                </div>

                <div className="bg-black/80 border border-gray-900 p-4.5 rounded-2xl overflow-x-auto max-h-[340px] text-[10px] font-mono text-emerald-400 line-clamp-none scrollbar-thin print:hidden">
                  <pre className="whitespace-pre overflow-auto">{generateXml(activeCompletedOrder)}</pre>
                </div>
              </div>
            )}

            {/* Printable close action panel */}
                <div className="flex justify-end gap-2.5 pt-3 print:hidden">
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="bg-gray-900 border border-gray-800 hover:bg-gray-850 hover:text-white text-gray-300 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer text-center"
                  >
                    Cerrar Recibo
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-[#10B981] hover:bg-emerald-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir Factura</span>
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Animated Celebration Card */}
        <div className="bg-gray-950 rounded-3xl border border-gray-900 p-6 md:p-10 text-center space-y-6 relative overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Success Title Header */}
          <div className="space-y-3 relative z-10">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce border-2 border-emerald-500/20">
              <CheckCircle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-bold uppercase">
                Código de Operación: {activeCompletedOrder.id}
              </span>
              <h2 className="text-2.5xl md:text-4xl font-sans font-black text-white px-2 uppercase tracking-wide">
                ¡Gracias por tu compra!
              </h2>
              <p className="text-xs md:text-sm text-gray-400 font-medium tracking-tight">
                Tu dron está preparándose para el despegue e inicio de flete prioritario.
              </p>
            </div>

            {/* Electronic invoice action button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowInvoice(true)}
                className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-400 text-black font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <Download className="h-4 w-4 shrink-0 text-black" />
                <span>Descargar Factura (XML / PDF)</span>
              </button>
            </div>
          </div>

          <hr className="border-gray-900/40" />

          {/* Core Interactive Flight Tracker */}
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900/30 p-3 rounded-xl border border-gray-900 gap-2.5">
              <span className="text-[11px] font-semibold text-gray-400 font-mono">Simulador de Despegue de Entrega:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const statuses: Order["status"][] = ["preparing", "takeoff", "en_route", "delivered"];
                    const currentIdx = statuses.indexOf(successTrackingStatus);
                    if (currentIdx < statuses.length - 1) {
                      const nextStatus = statuses[currentIdx + 1];
                      jumpToStatus(nextStatus);
                      if (activeCompletedOrder) {
                        setActiveCompletedOrder({
                          ...activeCompletedOrder,
                          status: nextStatus,
                        });
                      }
                    }
                  }}
                  disabled={successTrackingStatus === "delivered"}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    successTrackingStatus === "delivered" 
                      ? "bg-gray-800 text-gray-650 cursor-not-allowed" 
                      : "bg-[#00F3A2]/10 border border-[#00F3A2]/20 hover:bg-emerald-500 hover:text-black text-emerald-400"
                  }`}
                >
                  {successTrackingStatus === "delivered" ? "Transmisión Completada" : "Avanzar Estado de Vuelo"}
                </button>
                <button
                  onClick={() => {
                    // Pre-fill with dynamic message depending on status sequence
                    const dynamicText = successTrackingStatus === "preparing"
                      ? `Hola, mi orden ${activeCompletedOrder.id} tiene el Pago Aprobado. Solicito mi comprobante.`
                      : `Hola, veo que mi orden ${activeCompletedOrder.id} está en camino. Solicito ubicación satelital.`;
                    window.open(`https://wa.me/51987654321?text=${encodeURIComponent(dynamicText)}`, "_blank");
                  }}
                  className="text-[10px] font-mono font-black border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Soporte de Vuelo (WhatsApp)
                </button>
              </div>
            </div>

            {/* Horizontal tracking nodes line */}
            <div className="relative flex justify-between items-center pt-2">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-850 z-0 -translate-y-1/2" />
              <div 
                className="absolute left-0 top-1/2 h-0.5 bg-emerald-500 z-0 -translate-y-1/2 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />

              {trackingSteps.map((step, idx) => {
                const isChecked = idx <= trackingSteps.findIndex(s => s.id === successTrackingStatus);
                const isActive = step.id === successTrackingStatus;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      jumpToStatus(step.id as Order["status"]);
                      if (activeCompletedOrder) {
                        setActiveCompletedOrder({
                          ...activeCompletedOrder,
                          status: step.id as Order["status"],
                        });
                      }
                    }}
                    className="relative z-10 flex flex-col items-center group focus:outline-none cursor-pointer"
                    aria-label={`Tracking step: ${step.title}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-205 ${
                      isActive 
                        ? "bg-gray-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-110" 
                        : isChecked 
                          ? "bg-emerald-500 border-emerald-500 text-black" 
                          : "bg-gray-950 border-gray-800 text-gray-600 hover:border-gray-700"
                    }`}>
                      {isChecked ? (
                        <Check className="h-4 w-4 stroke-[3.5]" />
                      ) : (
                        <span className="text-xs font-mono font-bold font-semibold">{idx + 1}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Vector GPS Tracking Map */}
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 md:p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#10B981] font-bold">
                <span>🛰️ RADAR DE VUELO SATELITAL (ACTIVO)</span>
                <span className="text-gray-500">ZOOM: 18x • SAN BORJA - SURCO</span>
              </div>
              
              <div className="h-44 w-full bg-gray-900/30 border border-gray-900/60 rounded-xl relative overflow-hidden flex items-center justify-center">
                {/* Visual grid background */}
                <div 
                  className="absolute inset-[1px] rounded-[11px] opacity-10 pointer-events-none" 
                  style={{
                    backgroundImage: "radial-gradient(ellipse at center, transparent 0%, #030712 100%), linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
                    backgroundSize: "100% 100%, 16px 16px, 16px 16px"
                  }}
                />
                
                {/* SVG Map Lines & Vector components */}
                <svg className="w-full h-full absolute inset-0 text-gray-800" viewBox="0 0 280 160">
                  {/* Street grids simulated */}
                  <path d="M 10,20 Q 90,40 180,20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
                  <path d="M 5,80 Q 95,90 270,75" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
                  <path d="M 10,130 Q 140,140 270,125" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" strokeOpacity="0.4" />
                  <path d="M 30,10 L 45,150" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M 90,12 L 110,152" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <path d="M 170,8 L 190,148" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M 230,10 L 250,150" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />

                  {/* Flightpath path */}
                  <path 
                    d="M 40,130 L 50,110 L 140,75 L 240,35" 
                    fill="none" 
                    stroke="rgba(16,185,129,0.2)" 
                    strokeWidth="2.5" 
                    id="trackLine" 
                    strokeLinecap="round"
                  />
                  {/* Active segment of travel line colored in primary */}
                  <path 
                    d="M 40,130 L 50,110 L 140,75 L 240,35" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    strokeDasharray="400"
                    strokeDashoffset={400 - (400 * (progressPercent / 100))}
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Pulsing Hangar Base */}
                  <circle cx="40" cy="130" r="5" fill="#10B981" />
                  <circle cx="40" cy="130" r="10" fill="none" stroke="#10B981" strokeWidth="1" className="animate-ping" strokeDasharray="4 2" />

                  {/* Pulsing Target delivery Pad */}
                  <circle cx="240" cy="35" r="5" fill="#EF4444" />
                  <circle cx="240" cy="35" r="12" fill="none" stroke="#EF4444" strokeWidth="1" className="animate-ping" />

                  {/* Hangar label */}
                  <text x="50" y="135" fill="rgba(16,185,129,0.9)" fontSize="7" fontFamily="monospace" className="font-bold">HANGAR CIVIL</text>
                  
                  {/* Recipient label */}
                  <text x="160" y="25" fill="#F87171" fontSize="7" fontFamily="monospace" className="font-bold">TU DIRECCIÓN (ENTREGA)</text>

                  {/* Interactive Drone marker indicator */}
                  <g 
                    transform={`translate(${getDronePos().x - 6}, ${getDronePos().y - 6})`}
                    className="transition-all duration-700 ease-out"
                  >
                    {/* Pulsing glow ring */}
                    <circle cx="6" cy="6" r="8" fill="rgba(6,253,162,0.15)" />
                    {/* Simple geometric Drone icon SVG path representation */}
                    <path 
                      d="M 1,6 L 11,6 M 6,1 L 6,11 M 3,3 L 9,9 M 9,3 L 3,9" 
                      stroke="#00F3A2" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      className={successTrackingStatus !== "delivered" ? "animate-spin" : ""}
                      style={{ transformOrigin: "6px 6px", animationDuration: "3s" }}
                    />
                    <circle cx="6" cy="6" r="2.5" fill="#FFFFFF" />
                  </g>
                </svg>

                {/* Satellite overlay stats */}
                <div className="absolute bottom-2 left-2 bg-black/85 border border-gray-900 px-2 py-1 rounded text-[8px] font-mono space-y-0.5 text-gray-400">
                  <div>LAT/LNG: {telemetry.coordinates.replace("Lat: ", "").replace("Long: ", "")}</div>
                  <div>ALT: {telemetry.altitude}</div>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/85 border border-gray-900 px-2 py-1 rounded text-[8px] font-mono space-y-0.5 text-right text-gray-400">
                  <div>BATERÍA: {telemetry.battery}</div>
                  <div>VEL: {telemetry.speed}</div>
                </div>
              </div>
            </div>

            {/* Tracking Status Card Details description */}
            <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-900 flex gap-4 min-h-[90px] items-center">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                <Compass className={`h-5.5 w-5.5 ${successTrackingStatus !== "delivered" ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-mono tracking-wider font-extrabold uppercase text-emerald-400">
                  {trackingSteps[currentTrackingIndex].title}
                </h4>
                <p className="text-xs text-gray-400 font-normal leading-normal mt-0.5">
                  {trackingSteps[currentTrackingIndex].desc}
                </p>
              </div>
            </div>

            {/* Simulated Live Flight Coordinates details with live telemetry values */}
            <div className="grid grid-cols-2 gap-4 text-[10px] md:text-xs">
              <div className="bg-gray-900/20 p-3 rounded-lg border border-gray-900">
                <span className="text-gray-500 block font-mono">COORDINADAS DE DESPLAZAMIENTO FLIGHTPLAN (GPS)</span>
                <span className="font-mono text-gray-350 block mt-0.5">
                  {telemetry.coordinates} • Altitud: {telemetry.altitude}
                </span>
              </div>
              <div className="bg-gray-900/20 p-3 rounded-lg border border-gray-900">
                <span className="text-gray-500 block font-mono">TELEMETRÍA DE COMPONENTES DE VANT</span>
                <span className="font-mono text-gray-350 block mt-0.5">
                  Velocidad: {telemetry.speed} • Batería Celda: {telemetry.battery}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-900/40" />

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center max-w-sm mx-auto z-10 relative">
            <button
              onClick={() => {
                resetTracking();
                onBackToShop();
              }}
              className="w-full bg-gray-900 hover:bg-gray-850 hover:text-white text-gray-300 font-bold py-3.5 px-4 rounded-xl text-xs cursor-pointer"
            >
              Cerrar e Ir a Inicio
            </button>
            <button
              onClick={resetTracking}
              className="w-full bg-[#10B981] hover:bg-emerald-400 text-black font-extrabold py-3.5 px-4 rounded-xl text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              Re-calibrar Trayecto
            </button>
          </div>

        </div>

      </div>
    );
  }

  return null;
}

const generateXml = (order: Order) => {
  const dateStr = order.createdAt ? order.createdAt.split("T")[0] : "2026-06-11";
  const itemsXml = order.items.map((item, idx) => {
    const itemAccPrice = item.selectedAccessories.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.product.price + itemAccPrice;
    const total = unitPrice * item.quantity;
    return `    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="NIU">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="USD">${total.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Description>${item.product.name} [Color: ${item.selectedColor.name}]</cbc:Description>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="USD">${unitPrice.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${order.id}</cbc:ID>
  <cbc:IssueDate>${dateStr}</cbc:IssueDate>
  <cbc:InvoiceTypeCode listID="0101">01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>

  <cac:Signature>
    <cbc:ID>SignOmniDrones</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification>
        <cbc:ID>RUC20491839210</cbc:ID>
      </cac:PartyIdentification>
    </cac:SignatoryParty>
  </cac:Signature>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>OMNIDRONES S.A.C.</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Av. Pilotos Centrales 402, San Borja</cbc:StreetName>
        <cbc:CityName>Lima</cbc:CityName>
        <cbc:CountrySubentity>Lima</cbc:CountrySubentity>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${order.shipping.fullName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${order.shipping.address}</cbc:StreetName>
        <cbc:CityName>${order.shipping.city}</cbc:CityName>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="USD">${order.tax.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="USD">${(order.subtotal - order.discount).toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="USD">${order.tax.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="USD">${(order.subtotal - order.discount).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="USD">${order.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="USD">${order.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

${itemsXml}
</Invoice>`;
};
