import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DroneProduct } from "../types";
import { RotateCw, Shield, Zap, Sparkles, AlertCircle } from "lucide-react";

interface InteractiveViewerProps {
  product: DroneProduct;
}

export default function InteractiveViewer({ product }: InteractiveViewerProps) {
  const [rotation, setRotation] = useState<number>(15); // angle in degrees
  const [pitch, setPitch] = useState<number>(-10); // pitch angle
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);

  // Auto-rotate subtle effect when idle
  useEffect(() => {
    if (isDragging) {
      return;
    }
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 45);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startRotationRef.current = rotation;
    setActiveHotspot(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      // Gentle tilt on hover
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setPitch(-y * 0.08);
      }
      return;
    }
    const dx = e.clientX - startXRef.current;
    // 1 pixel = 0.5 degree of rotation
    const newRotation = (startRotationRef.current + dx * 0.5) % 360;
    setRotation(newRotation);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startRotationRef.current = rotation;
      setActiveHotspot(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) {
      return;
    }
    const dx = e.touches[0].clientX - startXRef.current;
    const newRotation = (startRotationRef.current + dx * 0.7) % 360;
    setRotation(newRotation);
  };

  const activeColorTheme = "#10B981"; // Emerald emerald accent

  const hotspots = [
    {
      id: "camera",
      name: "Súper Sensor",
      title: "Gimbal Ultra-Estabilizado 4K/5K",
      desc: "Montaje amortiguado sobre tres servomotores sin escobillas capaz de compensar rachas de 50 km/h.",
      style: { top: "62%", left: "50%" },
      icon: <Sparkles className="h-4 w-4 text-emerald-400" />
    },
    {
      id: "propellers",
      name: "Propulsores",
      title: "Motores Brushless de Alto Rendimiento",
      desc: "Rodamientos japoneses con bobinados de alta densidad para entregar máxima tracción con un ruido imperceptible.",
      style: { top: "35%", left: "20%" },
      icon: <Zap className="h-4 w-4 text-emerald-400" />
    },
    {
      id: "battery",
      name: "Autonomía",
      title: "Bloque de Celdas de Litio Inteligente",
      desc: "Microcontrolador integrado que auto-balancea los canales y reporta estado de degradación en tiempo real.",
      style: { top: "45%", left: "75%" },
      icon: <Shield className="h-4 w-4 text-emerald-400" />
    }
  ];

  return (
    <div className="flex flex-col h-full select-none">
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        className="relative flex-1 bg-gradient-to-b from-gray-950 to-gray-900 rounded-3xl p-6 flex flex-col items-center justify-center border border-gray-800/60 overflow-hidden cursor-grab active:cursor-grabbing group min-h-[350px] md:min-h-[460px]"
        style={{ perspective: 1000 }}
      >
        {/* Glow ambient background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-60 h-60 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Instructions overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-800 text-[10px] md:text-xs text-gray-400">
          <RotateCw className="h-3 w-3 animate-spin text-emerald-400" style={{ animationDuration: "6s" }} />
          <span>Arrastra horizontalmente para rotar en 3D</span>
        </div>

        {/* 3D Container */}
        <motion.div
          className="relative w-full max-w-[280px] md:max-w-[380px] aspect-square flex items-center justify-center transition-shadow"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${-pitch}deg) rotateY(${rotation}deg) scale(1.05)`,
          }}
        >
          {/* Main Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain pointer-events-none transition-all duration-300 drop-shadow-[0_20px_45px_rgba(16,185,129,0.15)]"
            referrerPolicy="no-referrer"
          />

          {/* Interactive Hotspots visible when rotation is stabilized */}
          <div className="absolute inset-0 pointer-events-auto" style={{ transform: `rotateY(${-rotation}deg) rotateX(${pitch}deg)` }}>
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                className="absolute z-20"
                style={spot.style}
              >
                {/* Visual pulse */}
                <span className="absolute inline-flex h-6 w-6 rounded-full bg-emerald-400/30 animate-ping -left-1 -top-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(activeHotspot === spot.id ? null : spot.id);
                  }}
                  className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                    activeHotspot === spot.id 
                      ? "bg-emerald-400 border-white scale-125 shadow-[0_0_15px_rgba(16,185,129,0.8)]" 
                      : "bg-gray-950 border-emerald-400 hover:scale-110"
                  }`}
                  aria-label={`Hotspot ${spot.name}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </button>

                {/* Info bubble */}
                <AnimatePresence>
                  {activeHotspot === spot.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-30 bottom-6 left-1/2 -translate-x-1/2 w-48 md:w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-800 p-3 rounded-xl shadow-2xl text-left pointer-events-auto"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                        {spot.icon}
                        <span>{spot.title}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-300 leading-relaxed">
                        {spot.desc}
                      </p>
                      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-800 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stats overview for the selected drone model */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between bg-gray-900/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-800 text-[10px] md:text-xs">
          <div className="text-center flex-1 border-r border-gray-800/80">
            <div className="text-gray-400 mb-0.5">Vuelo</div>
            <div className="font-mono font-medium text-emerald-400">{product.specs.flightTime.split(" ")[0]} Min</div>
          </div>
          <div className="text-center flex-1 border-r border-gray-800/80">
            <div className="text-gray-400 mb-0.5">Rango</div>
            <div className="font-mono font-medium text-emerald-400">{product.specs.range.split(" ")[0]} Km</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-gray-400 mb-0.5">Velocidad</div>
            <div className="font-mono font-medium text-emerald-400">{product.specs.speed.split(" ")[0]} Km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
