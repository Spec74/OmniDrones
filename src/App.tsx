import React, { useState, useEffect } from "react";
import { DroneProduct, CartItem, Order } from "./types";
import { drones } from "./data";
import HomeView from "./components/HomeView";
import ProductDetails from "./components/ProductDetails";
import DroneMatchWizard from "./components/DroneMatchWizard";
import CartAndCheckout from "./components/CartAndCheckout";
import LaravelTerminal from "./components/LaravelTerminal";
import ChatSupportWidget from "./components/ChatSupportWidget";
import AuthModal from "./components/AuthModal";
import UserDashboard from "./components/UserDashboard";
import { useWhatsApp } from "./hooks/useWhatsApp";
import { motion } from "motion/react";
import { 
  Compass, ShoppingCart, Percent, Laptop, 
  HelpCircle, Menu, X, ArrowUpRight, User 
} from "lucide-react";

export default function App() {
  // Navigation State: "home" | "details" | "cart-checkout" | "backend" | "profile"
  const [activeTab, setActiveTab] = useState<"home" | "details" | "cart-checkout" | "backend" | "profile">("home");
  
  // User authentication states
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  
  // Selected Individual product for detail specifications config page
  const [selectedProduct, setSelectedProduct] = useState<DroneProduct>(drones[0]);
  
  // Shopping Cart items list
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Unlocked discount status from completion of the matching assistant
  const [hasDiscountUnlocked, setHasDiscountUnlocked] = useState<boolean>(false);
  
  // Quiz Active Overlay status
  const [showQuizOverlay, setShowQuizOverlay] = useState<boolean>(false);
  
  // Mobile responsive list toggler
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Active compiled completed order for dynamic tracking/receipt
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Use dynamic omnichannel WhatsApp redirection logic
  const { whatsAppUrl } = useWhatsApp({ cart, completedOrder });

  // Auto scroll to top on tab swap
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, selectedProduct, showQuizOverlay]);

  // Unified add-to-cart dispatch tool
  const handleAddToCart = (config: Omit<CartItem, "id" | "quantity">) => {
    // Generate unique key for distinct personalized combinations
    const accSignature = config.selectedAccessories
      .map((a) => a.id)
      .sort()
      .join("-");
    const uniqueCombinationId = `${config.product.id}_${config.selectedColor.name.replace(/\s+/g, "")}_${accSignature}`;

    setCart((prevCart) => {
      const matchIndex = prevCart.findIndex((x) => x.id === uniqueCombinationId);
      if (matchIndex > -1) {
        const incremented = [...prevCart];
        incremented[matchIndex].quantity += 1;
        return incremented;
      }
      return [
        ...prevCart,
        {
          id: uniqueCombinationId,
          product: config.product,
          selectedColor: config.selectedColor,
          selectedAccessories: config.selectedAccessories,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Immediate Quick buy on catalog
  const handleQuickAdd = (p: DroneProduct) => {
    handleAddToCart({
      product: p,
      selectedColor: { name: p.colors[0].name, hex: p.colors[0].hex },
      selectedAccessories: [],
    });
    // Direct switch to review shopping cart drawer
    setActiveTab("cart-checkout");
  };

  const handleMatchAcquired = (matchedProduct: DroneProduct, discountAwarded: boolean) => {
    setSelectedProduct(matchedProduct);
    setHasDiscountUnlocked(discountAwarded);
    setShowQuizOverlay(false);
    setActiveTab("details");
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Dynamic Header Navigation */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo with interactive hover rotation */}
          <button 
            onClick={() => {
              setActiveTab("home");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-1 focus:outline-none cursor-pointer group"
          >
            <Compass className="h-6 w-6 text-emerald-400 group-hover:rotate-184 transition-transform duration-500" />
            <span className="text-base font-sans font-black uppercase tracking-widest text-white">
              OmniDrones
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <button 
              onClick={() => setActiveTab("home")}
              className={`hover:text-white transition-colors cursor-pointer ${activeTab === "home" ? "text-emerald-400" : ""}`}
            >
              Inicio
            </button>
            <a 
              href="#products-catalog"
              onClick={() => {
                setActiveTab("home");
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Flotas
            </a>

            <button 
              onClick={() => setActiveTab("backend")}
              className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === "backend" ? "text-red-400 font-extrabold" : ""}`}
            >
              <span className="h-1.5 w-1.5 bg-[#FF2D20] rounded-full animate-pulse shrink-0" />
              Mesa Backend (Laravel)
            </button>
            
            {/* Launch Quiz CTA */}
            <button 
              onClick={() => setShowQuizOverlay(true)}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-emerald-400/90 font-bold"
            >
              <span>DroneMatch Quiz</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </nav>

          {/* Desktop Action Handles */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Lead Reward coupon active status badge */}
            {hasDiscountUnlocked && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 py-1.5 px-3 rounded-full text-[10px] font-mono font-bold tracking-tight uppercase">
                <Percent className="h-3 w-3 animate-pulse" />
                <span>10% Cupón Activo</span>
              </div>
            )}

            {/* Main Checkout Cart trigger */}
            <button
              onClick={() => setActiveTab("cart-checkout")}
              className={`relative h-10 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                activeTab === "cart-checkout"
                  ? "bg-emerald-500 border-emerald-500 text-black font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  : "bg-gray-900/60 border-gray-800 text-white hover:border-gray-700"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Mi Hangar</span>
              {cartTotalItems > 0 && (
                <span className={`inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full text-[10px] font-bold font-mono ${
                  activeTab === "cart-checkout" ? "bg-black text-white" : "bg-emerald-500 text-black"
                }`}>
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* User Profile trigger */}
            {currentUser ? (
              <button
                onClick={() => setActiveTab("profile")}
                className={`relative h-10 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-emerald-500 border-emerald-500 text-black font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    : "bg-gray-900/60 border-gray-800 text-emerald-400 hover:border-gray-700 hover:bg-gray-850"
                }`}
              >
                <div className="h-4.5 w-4.5 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-[9px] border border-emerald-500/25">
                  JD
                </div>
                <span>Área Privada</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="h-10 px-4 rounded-xl border bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger toggler */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setActiveTab("cart-checkout")}
              className="relative p-2.5 rounded-lg bg-gray-900 border border-gray-850 text-gray-400 hover:text-white"
              aria-label="Cart mobile"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartTotalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-gray-900 border border-gray-850 rounded-lg text-gray-400 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-950 border-b border-gray-900 px-4 py-5 space-y-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <button
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-white"
            >
              Inicio
            </button>
            <a
              href="#products-catalog"
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-white"
            >
              Flotas de Vuelo
            </a>
            <button
              onClick={() => {
                setActiveTab("backend");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-red-400 hover:text-red-300"
            >
              Mesa Backend (Laravel)
            </button>
            <button
              onClick={() => {
                setShowQuizOverlay(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-emerald-400 hover:text-emerald-300"
            >
              Iniciar DroneMatch Assistant
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-xs font-bold text-left py-2 text-emerald-400 hover:text-emerald-300 border-t border-gray-900/40 pt-3"
              >
                Área Privada ({currentUser.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-300 hover:text-white border-t border-gray-900/40 pt-3"
              >
                Iniciar Sesión / Registro
              </button>
            )}

            {hasDiscountUnlocked && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1.5 px-3.5 rounded-full text-[10px] font-mono font-bold tracking-tight uppercase">
                <Percent className="h-3 w-3" />
                <span>10% Cupón Activo</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Core Router View Body Nodes */}
      <main className="flex-grow">
        
        {/* Route view switchboard */}
        {activeTab === "home" && (
          <HomeView
            onStartQuiz={() => setShowQuizOverlay(true)}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setActiveTab("details");
            }}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeTab === "details" && selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={() => setActiveTab("home")}
            onGoToCart={() => setActiveTab("cart-checkout")}
          />
        )}

        {activeTab === "cart-checkout" && (
          <CartAndCheckout
            cart={cart}
            hasDiscount={hasDiscountUnlocked}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onBackToShop={() => setActiveTab("home")}
            completedOrder={completedOrder}
            onSetCompletedOrder={setCompletedOrder}
            currentUser={currentUser}
            onSetCurrentUser={setCurrentUser}
          />
        )}

        {activeTab === "backend" && (
          <LaravelTerminal completedOrder={completedOrder} />
        )}

        {activeTab === "profile" && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            completedOrder={completedOrder}
            onLogout={() => {
              setCurrentUser(null);
              setActiveTab("home");
            }}
            onNavigateToTracking={() => {
              setActiveTab("cart-checkout");
            }}
          />
        )}

      </main>

      {/* FULL-SCREEN OVERLAY DIALOG FOR ASSISTANT WIZARD */}
      {showQuizOverlay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto px-4 py-8 flex items-center justify-center">
          <div className="relative w-full max-w-4xl">
            {/* Close Floater indicator button */}
            <button
              onClick={() => setShowQuizOverlay(false)}
              className="absolute top-4 right-4 z-[60] p-2 bg-gray-900 hover:bg-gray-850 hover:text-white border border-gray-800 rounded-full cursor-pointer transition-colors text-gray-400"
              aria-label="Close assistant"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <DroneMatchWizard
              onMatchFound={handleMatchAcquired}
              onClose={() => setShowQuizOverlay(false)}
            />
          </div>
        </div>
      )}

      {/* GLOBAL FLOATING OMNICHANNEL WHATSAPP WIDGET */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
      >
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] cursor-pointer transition-all duration-300 relative group flex items-center justify-center border border-[#1ebd52]/40"
          aria-label="Contáctanos por WhatsApp"
        >
          {/* Custom WhatsApp SVG Icon */}
          <svg className="h-5.5 w-5.5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-11.559c-.055-.093-.2-.148-.42-.258-.22-.11-1.3-.642-1.501-.715-.201-.073-.348-.11-.497.11-.148.22-.574.715-.704.862-.13.147-.26.165-.48.055-.22-.11-.93-.343-1.773-1.095-.655-.584-1.097-1.306-1.225-1.527-.128-.221-.014-.34.097-.449.1-.098.22-.257.33-.385.11-.128.147-.22.22-.367.073-.147.036-.275-.018-.385-.055-.11-.497-1.196-.681-1.637-.179-.43-.36-.372-.497-.378-.129-.006-.276-.007-.424-.007-.148 0-.389.055-.591.275-.201.221-.77.752-.77 1.838 0 1.085.79 2.135.9 2.282.11.147 1.55 2.366 3.755 3.321.524.227.934.363 1.254.465.527.168 1.007.144 1.387.088.423-.063 1.3-.532 1.485-1.045.184-.513.184-.954.129-1.046-.054-.093-.2-.147-.42-.257z" />
          </svg>

          {/* Interactive Tooltip indicator text */}
          <span className="absolute right-14 whitespace-nowrap bg-gray-950 border border-emerald-500/20 text-[10px] text-gray-200 font-mono font-bold py-1.5 px-3.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none uppercase tracking-widest hidden sm:inline-block">
            {completedOrder 
              ? completedOrder.status === "preparing" 
                ? "Pago Aprobado - Comprobante 📧" 
                : "Dron en Camino - Satelital 🛰️" 
              : "Asesoría Técnica Preventa 🛒"}
          </span>
        </a>
      </motion.div>
      
      {/* GLOBAL CHATBOT SUPPORT WIDGET */}
      <ChatSupportWidget
        cart={cart}
        completedOrder={completedOrder}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        onOpenQuiz={() => {
          setShowQuizOverlay(true);
          setMobileMenuOpen(false);
        }}
      />

      {/* GLOBAL HIGH-FIDELITY LOGIN MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab("profile");
        }}
      />

    </div>
  );
}
