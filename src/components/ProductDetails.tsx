import React, { useState } from "react";
import { DroneProduct, CartItem } from "../types";
import InteractiveViewer from "./InteractiveViewer";
import { 
  Check, Plus, ShoppingCart, ShieldCheck, 
  ChevronRight, ArrowLeft, Star, ThumbsUp 
} from "lucide-react";

interface ProductDetailsProps {
  product: DroneProduct;
  onAddToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
  onBack: () => void;
  onGoToCart: () => void;
}

export default function ProductDetails({ product, onAddToCart, onBack, onGoToCart }: ProductDetailsProps) {
  // Configured states
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedAccIds, setSelectedAccIds] = useState<string[]>([]);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Toggle selection of custom accessory
  const handleToggleAccessory = (accId: string) => {
    setSelectedAccIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  // Compile total item price based on selection
  const accessoryTotal = product.accessories
    .filter((acc) => selectedAccIds.includes(acc.id))
    .reduce((curr, acc) => curr + acc.price, 0);
  
  const singleItemPrice = product.price + accessoryTotal;
  const totalPrice = singleItemPrice * quantity;

  // Dispatch add-to-cart call
  const handleAdd = () => {
    const chosenAccs = product.accessories.filter((acc) => selectedAccIds.includes(acc.id));
    
    // Trigger addition handler multiple times if quantity > 1 (or we handle quantity in cart)
    onAddToCart({
      product,
      selectedColor: { name: selectedColor.name, hex: selectedColor.hex },
      selectedAccessories: chosenAccs,
    });

    // Alert toast UI
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 4500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-10 relative">
      
      {/* Floating Add to Cart Success Toast */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-gray-900 border-2 border-emerald-500 p-4 rounded-2xl shadow-[0_15px_30px_rgba(16,185,129,0.25)] animate-bounce flex flex-col gap-2">
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">¡Añadido al carrito con éxito!</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {product.name} ({selectedColor.name}) listo para despegar.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-800">
            <button 
              onClick={onGoToCart}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 py-1.5 px-3 cursor-pointer"
            >
              Ver Carrito
            </button>
            <button 
              onClick={() => setAddedToast(false)}
              className="text-xs font-semibold text-gray-400 hover:text-white py-1.5 px-3 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Navigation Headers */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Catálogo</span>
        </button>

        <div className="text-[10px] md:text-xs text-gray-500 font-medium">
          Drones Premium • Modelo ID: <span className="font-mono text-gray-400 font-semibold">{product.id.toUpperCase()}</span>
        </div>
      </div>

      {/* Main product view split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Interactive 3D Rotation simulation container */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <InteractiveViewer product={product} />
          
          {/* Detailed features text bullet points */}
          <div className="bg-gray-950 p-6 rounded-2xl border border-gray-900 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Características Claves Destacadas
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Custom configurator panel */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Title Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-gray-400 text-xs font-medium ml-2">4.9 (42 Reseñas verificadas)</span>
            </div>
            <h1 className="text-3xl md:text-4.5xl font-sans font-black tracking-tight text-white leading-none">
              {product.name}
            </h1>
            <p className="text-xs md:text-sm text-emerald-400 font-medium italic">
              {product.tagline}
            </p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Real-time Dynamic Stock shortage Warning (Page 12 screenshot) */}
          <div className="bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl flex items-center gap-3 text-red-400">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold font-mono uppercase tracking-wide">
              🔬 Alerta de Hangar: ¡Solo quedan 2 unidades en stock!
            </span>
          </div>

          <hr className="border-gray-900" />

          {/* Color Selecter ("Color de Carcasa") */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
              1. Color de Carcasa
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-gray-900/60"
                        : "border-gray-900 bg-transparent hover:border-gray-800"
                    }`}
                  >
                    <span 
                      className="h-4.5 w-4.5 rounded-full border border-white/20 flex-shrink-0" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <div className="text-[11px] font-bold text-white line-none">{color.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 italic">
              * {selectedColor.desc}
            </p>
          </div>

          {/* Checklist of Accessories ("Accesorios Recomendados") */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
              2. Accesorios Opcionales Recomendados
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {product.accessories.map((acc) => {
                const isChecked = selectedAccIds.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleToggleAccessory(acc.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      isChecked
                        ? "border-emerald-500/80 bg-gray-900/40"
                        : "border-gray-900 bg-gray-950/40 hover:border-gray-850"
                    }`}
                  >
                    <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      isChecked ? "bg-emerald-500 border-emerald-500" : "bg-transparent border-gray-700"
                    }`}>
                      {isChecked && <Check className="h-3 w-3 text-black stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-white leading-normal truncate">{acc.name}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 flex-shrink-0">
                          +${acc.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-gray-400 font-normal leading-normal truncate mt-0.5">
                        {acc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-900" />

          {/* Pricing Action Bottom Card */}
          <div className="bg-gray-950 p-5 rounded-2xl border border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 font-semibold">Valor Total Configurado</span>
              <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                <span className="text-2.5xl md:text-3xl font-mono font-bold text-white">
                  ${singleItemPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500">USD</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Optional Quantity input */}
              <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl h-11">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 text-xs text-gray-400 hover:text-white h-full cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-mono font-bold text-white px-1">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3.5 text-xs text-gray-400 hover:text-white h-full cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 sm:flex-none h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Añadir al Carrito</span>
              </button>
            </div>
          </div>

          {/* Quality badge assurances */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-[10px] md:text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Garantía de fábrica oficial de 2 años + Envío asegurado con seguimiento satelital</span>
          </div>

        </div>

      </div>

      {/* Embedded tech detailed specs parameters */}
      <div className="bg-gray-950/60 p-6 md:p-8 rounded-3xl border border-gray-900/80 mt-8">
        <h3 className="text-sm md:text-base font-sans font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-900 pb-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Ficha de Especificaciones Técnicas Completas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 block">Sensor Óptico</span>
            <span className="text-xs md:text-sm font-semibold text-gray-100 block">{product.specs.camera}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 block">Autonomía</span>
            <span className="text-xs md:text-sm font-semibold text-gray-100 block">{product.specs.flightTime}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 block">Transmisión de Señal</span>
            <span className="text-xs md:text-sm font-semibold text-gray-100 block">{product.specs.range}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 block">Velocidad Máxima</span>
            <span className="text-xs md:text-sm font-semibold text-gray-100 block">{product.specs.speed}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 block">Peso de Despegue</span>
            <span className="text-xs md:text-sm font-semibold text-gray-100 block">{product.specs.weight}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
