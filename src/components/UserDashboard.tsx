import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, History, MapPin, Key, LogOut, Package, 
  Clock, CheckCircle, ArrowRight, ShieldCheck, Compass, FileCode, Check, Trash2, Plus, Edit
} from "lucide-react";
import { Order, ShippingDetails } from "../types";

interface UserDashboardProps {
  onLogout: () => void;
  currentUser: { name: string; email: string };
  completedOrder: Order | null;
  onNavigateToTracking: () => void;
}

interface CustomQuote {
  id: string;
  droneName: string;
  qty: number;
  status: "Pendiente" | "Aprobado" | "En Revisión";
  date: string;
  total: number;
}

export default function UserDashboard({ 
  onLogout, 
  currentUser, 
  completedOrder,
  onNavigateToTracking 
}: UserDashboardProps) {
  // Tabs: "resumen" | "perfil" | "ordenes" | "cotizaciones" | "direcciones" | "cuenta"
  const [activeTab, setActiveTab] = useState<"resumen" | "perfil" | "ordenes" | "cotizaciones" | "direcciones" | "cuenta">("resumen");
  
  // Simulated historic client orders (prefilled like Page 10 screenshot)
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "OD-2026-49210",
      items: [],
      shipping: {
        fullName: "Juan Delgado",
        email: "juan@omnidrones.com",
        phone: "+51 999 888 777",
        address: "Av. de la Innovación 450, Urb. Tech",
        city: "San Borja, Lima",
        reference: "Frente al parque central"
      },
      paymentMethod: "card",
      subtotal: 10592.37,
      discount: 0,
      tax: 1906.63,
      total: 12499.00,
      status: "delivered",
      createdAt: "10 Oct, 2024"
    },
    {
      id: "OD-2026-49215",
      items: [],
      shipping: {
        fullName: "Juan Delgado",
        email: "juan@omnidrones.com",
        phone: "+51 999 888 777",
        address: "Av. Los Pioneros 123",
        city: "San Isidro, Lima",
        reference: "Cerca al centro empresarial"
      },
      paymentMethod: "yape",
      subtotal: 3559.32,
      discount: 0,
      tax: 640.68,
      total: 4200.00,
      status: "en_route",
      createdAt: "13 Oct, 2024"
    }
  ]);

  // If there's a newly completed order in the active session, list it dynamically
  React.useEffect(() => {
    if (completedOrder && !orders.some(o => o.id === completedOrder.id)) {
      setOrders(prev => [completedOrder, ...prev]);
    }
  }, [completedOrder]);

  // B2C / B2B Simulated Custom Quote requests (Page 10 lists B2B Cotizaciones like #COT-8812)
  const [quotes, setQuotes] = useState<CustomQuote[]>([
    {
      id: "COT-2026-8812",
      droneName: "Aero Cinema Pro Octo (Flota Corporativa)",
      qty: 6,
      status: "Aprobado",
      date: "14 Oct, 2024",
      total: 34000.00
    },
    {
      id: "COT-2026-2910",
      droneName: "AgriRobot S-20 Sprayer + Kit de repuesto",
      qty: 2,
      status: "En Revisión",
      date: "08 Nov, 2024",
      total: 25800.00
    },
    {
      id: "COT-2026-1102",
      droneName: "Mavic Pro Gen-3 Enterprise Bundle",
      qty: 1,
      status: "Pendiente",
      date: "24 Nov, 2024",
      total: 4850.00
    }
  ]);

  // Manage addresses list (mis direcciones)
  const [addresses, setAddresses] = useState<ShippingDetails[]>([
    {
      fullName: "Juan Delgado - Sede Principal",
      email: "juan@omnidrones.com",
      phone: "+51 999 888 777",
      address: "Av. de la Innovación 450, Parque Industrial Norte",
      city: "San Borja, Lima",
      reference: "Edificio TechCorp Piso 4"
    },
    {
      fullName: "Juan Delgado - Residencial",
      email: "juan@omnidrones.com",
      phone: "+51 995 222 111",
      address: "Jr. Los Jazmines 302, Urb. Primavera",
      city: "Surco, Lima",
      reference: "A un bloque de la Estación Cabitos"
    }
  ]);

  const [newAddressForm, setNewAddressForm] = useState<boolean>(false);
  const [addressInput, setAddressInput] = useState<ShippingDetails>({
    fullName: "",
    email: currentUser.email,
    phone: "",
    address: "",
    city: "Lima",
    reference: ""
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.fullName || !addressInput.address || !addressInput.phone) return;
    setAddresses(prev => [...prev, addressInput]);
    setAddressInput({
      fullName: "",
      email: currentUser.email,
      phone: "",
      address: "",
      city: "Lima",
      reference: ""
    });
    setNewAddressForm(false);
  };

  const handleDeleteAddress = (idx: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== idx));
  };

  // Profile data forms State
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: "+51 999 888 777",
    company: "Studio Creative S.A.C.",
    role: "Director de Operaciones Aéreas",
    passCurrent: "",
    passNew: "",
    passConfirm: ""
  });
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess("¡Datos de perfil actualizados exitosamente!");
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.passNew !== profileData.passConfirm) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    setSaveSuccess("¡Tu contraseña ha sido cambiada de forma segura!");
    setProfileData(prev => ({ ...prev, passCurrent: "", passNew: "", passConfirm: "" }));
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 font-sans">
      
      {/* Banner de Bienvenida */}
      <div className="bg-gray-950 border border-gray-900 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4.5">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-2xl tracking-tighter">
            JD
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-xl md:text-2.5xl font-sans font-black text-white">
              Bienvenido de nuevo, {profileData.name}
            </h1>
            <p className="text-xs text-gray-400">
              Último acceso al hangar de control: <span className="text-gray-300 font-mono">Hoy, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • (San Borja, Lima)</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-900/60 border border-gray-850 px-4 py-2.5 rounded-2xl text-center min-w-[80px]">
            <span className="text-xs text-gray-500 block font-mono font-bold">ROL</span>
            <span className="text-xs text-emerald-400 font-black tracking-wide uppercase">CLIENTE B2C</span>
          </div>
          <button 
            onClick={onLogout}
            className="bg-red-950/40 hover:bg-red-500 hover:text-black border border-red-500/20 text-red-400 font-extrabold text-xs px-4.5 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Navigation Menu */}
        <div className="lg:col-span-3 bg-gray-950 border border-gray-900 rounded-2xl p-4 space-y-2">
          <div className="pb-3 border-b border-gray-900 px-2 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
              Navegación de Cuenta
            </span>
          </div>

          <nav className="flex flex-col gap-1.5 pt-2">
            {[
              { id: "resumen", label: "Resumen de Cuenta", icon: User },
              { id: "perfil", label: "Mi Perfil Corporativo", icon: ShieldCheck },
              { id: "ordenes", label: "Historial de Pedidodos", icon: Package },
              { id: "cotizaciones", label: "Mis Cotizaciones B2B", icon: FileCode },
              { id: "direcciones", label: "Direcciones de Envío", icon: MapPin },
              { id: "cuenta", label: "Preferencias y Seguridad", icon: Key }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? "bg-emerald-500 text-black shadow-md" 
                      : "text-gray-400 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  <IconComp className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side Active Tab Widget */}
        <div className="lg:col-span-9 bg-gray-950 border border-gray-900 rounded-2xl p-6 md:p-8 min-h-[460px]">
          
          <AnimatePresence mode="wait">
            
            {/* 1. RESUMEN DE CUENTA */}
            {activeTab === "resumen" && (
              <motion.div
                key="resumen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-gray-900 pb-3 flex justify-between items-center">
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    Resumen de Actividades Recientes
                  </h2>
                </div>

                {/* Dashboard Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-900/40 border border-gray-900 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase">PEDIDOS TOTALES</span>
                    <div className="flex items-baseline gap-2.5 mt-2">
                      <span className="text-3xl font-mono font-bold text-white">{orders.length}</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/25">ACTIVOS</span>
                    </div>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-900 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase">COTIZACIONES SOLICITADAS</span>
                    <div className="flex items-baseline gap-2.5 mt-2">
                      <span className="text-3xl font-mono font-bold text-white">{quotes.length}</span>
                      <span className="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-mono font-bold border border-sky-500/25">B2B/B2C</span>
                    </div>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-900 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase">DIRECCIONES GUARDADAS</span>
                    <div className="flex items-baseline gap-2.5 mt-2">
                      <span className="text-3xl font-mono font-bold text-white">{addresses.length}</span>
                      <span className="text-[10px] text-gray-500">Lima Metropolitana</span>
                    </div>
                  </div>
                </div>

                {/* Main section: Última Actividad (Matches page 10 design exactly) */}
                <div className="bg-gray-900/20 border border-gray-900 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/25 px-2 py-0.5 rounded uppercase">
                        ÚLTIMA COMPRA DE FLOTA
                      </span>
                      <span className="text-xs text-gray-500">• Hangar Central de Despegues</span>
                    </div>
                    {orders.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Orden #{orders[0].id} ({orders[0].createdAt})
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Enviado a: <strong className="text-gray-300">{orders[0].shipping.fullName}</strong> en {orders[0].shipping.address}, {orders[0].shipping.city}.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 font-medium">No hay compras históricas aún en este perfil.</p>
                    )}
                  </div>
                  <div className="md:col-span-4 flex flex-col items-center justify-center md:items-end p-2 border-t md:border-t-0 md:border-l border-gray-900">
                    {orders.length > 0 && (
                      <div className="space-y-2 text-center md:text-right">
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded inline-block uppercase ${
                          orders[0].status === "delivered" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                        }`}>
                          {orders[0].status === "delivered" ? "Entregado con Éxito" : "En Ruta GPS Satelital"}
                        </span>
                        <div>
                          <button
                            onClick={onNavigateToTracking}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center md:justify-end gap-1.5 cursor-pointer mt-1"
                          >
                            <span>Rastrear en Satélite (Radar)</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Address information box */}
                <div className="bg-gray-900/30 border border-gray-900 rounded-2xl p-5 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider block uppercase">
                    DIRECCIÓN FISCAL / DESPACHO CORPORATIVO PRINCIPAL
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-500 block">Sede Corporativa Tech</span>
                      <p className="text-white font-semibold">Av. de la Innovación 450, San Borja, Lima, Perú</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 block">Celular de Enlace de Seguridad</span>
                      <p className="text-white font-semibold font-mono">+51 999 888 777</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. MI PERFIL CORPORATIVO */}
            {activeTab === "perfil" && (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-900 pb-3 flex justify-between items-center">
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    Ficha de Operador y Datos de Perfil
                  </h2>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {saveSuccess && (
                    <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl font-bold">
                      {saveSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Nombre Completo</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Correo de Operador</label>
                      <input
                        type="email"
                        value={profileData.email}
                        className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-3 text-xs text-gray-400 focus:outline-none cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Teléfono de Enlace</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Razón Social de Empresa</label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Cargo Técnico</label>
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer"
                    >
                      Guardar Cambios de Ficha
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 3. HISTORIAL DE PEDIDOS */}
            {activeTab === "ordenes" && (
              <motion.div
                key="ordenes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-900 pb-3 flex justify-between items-center">
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    Historial de Compras B2C
                  </h2>
                </div>

                <div className="border border-gray-900 rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900/60 text-gray-400 font-mono text-[9px] uppercase tracking-wider border-b border-gray-900">
                        <th className="p-4">REferencia / ID</th>
                        <th className="p-4">FECHA</th>
                        <th className="p-4">DESTINATARIO</th>
                        <th className="p-4">TOTAL CARGO</th>
                        <th className="p-4">ESTADO DE VUELO</th>
                        <th className="p-4 text-center">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 text-xs">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-900/10">
                          <td className="p-4 font-mono font-bold text-white">{order.id}</td>
                          <td className="p-4 text-gray-400">{order.createdAt}</td>
                          <td className="p-4">
                            <span className="font-semibold block">{order.shipping.fullName}</span>
                            <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">{order.shipping.address}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400">
                            ${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                              order.status === "delivered" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : order.status === "en_route"
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            }`}>
                              {order.status === "delivered" ? "✅ ENTREGADO" : order.status === "en_route" ? "🛰️ EN CRUCO DE VÍA" : "🛸 PREPARANDO"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={onNavigateToTracking}
                              className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-black font-black px-3 py-1.5 rounded-lg cursor-pointer transition-all uppercase"
                            >
                              Rastrear GPS
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* 4. MIS COTIZACIONES B2B */}
            {activeTab === "cotizaciones" && (
              <motion.div
                key="cotizaciones"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-900 pb-3 flex justify-between items-center">
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    Mesa de Cotizaciones Empresariales (B2B)
                  </h2>
                </div>

                <div className="border border-gray-900 rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900/60 text-gray-400 font-mono text-[9px] uppercase tracking-wider border-b border-gray-900">
                        <th className="p-4">CÓDIGO COTIZA</th>
                        <th className="p-4">EQUIPO SOLICITADO</th>
                        <th className="p-4 text-center">CANTIDAD</th>
                        <th className="p-4">FECHA SOLICITUD</th>
                        <th className="p-4">TOTAL PRESUPUESTO</th>
                        <th className="p-4 border-l border-gray-900">ESTADO COMERCIAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 text-xs text-gray-300">
                      {quotes.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-900/10">
                          <td className="p-4 font-mono font-semibold text-white">{q.id}</td>
                          <td className="p-4 font-semibold">{q.droneName}</td>
                          <td className="p-4 text-center font-mono">{q.qty} u.</td>
                          <td className="p-4 text-gray-400">{q.date}</td>
                          <td className="p-4 font-mono font-bold text-sky-400">
                            ${q.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 border-l border-gray-900">
                            <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              q.status === "Aprobado" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                                : q.status === "En Revisión"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/25 animate-pulse"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                            }`}>
                              {q.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-900/20 border border-gray-900 p-4.5 rounded-2xl text-[11px] leading-relaxed text-gray-400">
                  <span className="font-bold text-white block mb-1">¿Necesitas una cotización industrial a medida?</span>
                  Contáctanos especificando la carga útil, los parámetros de termografía y el volumen de autonomía requerido. Nuestros ingenieros de OmniDrones evaluarán las reglas del negocio y enviarán un presupuesto firmado vía email en menos de 2 horas hábiles.
                </div>
              </motion.div>
            )}

            {/* 5. GESTIÓN DE DIRECCIONES DE ENVÍO */}
            {activeTab === "direcciones" && (
              <motion.div
                key="direcciones"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-900 pb-3 flex justify-between items-center">
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    Tus Direcciones de Despacho
                  </h2>
                  <button
                    onClick={() => setNewAddressForm(!newAddressForm)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Dirección</span>
                  </button>
                </div>

                {newAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-gray-900/40 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Nuevo Destino de Despacho</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-mono uppercase font-bold">Identificador de Dirección (Ej: Oficina)</label>
                        <input
                          type="text"
                          required
                          value={addressInput.fullName}
                          onChange={(e) => setAddressInput(p => ({ ...p, fullName: e.target.value }))}
                          placeholder="Sede San Isidro / Casa de Campo"
                          className="w-full bg-black border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5" style={{ display: "none" }}>
                        <input type="email" value={addressInput.email} readOnly />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-mono uppercase font-bold">Teléfono de Enlace de Entrega</label>
                        <input
                          type="text"
                          required
                          value={addressInput.phone}
                          onChange={(e) => setAddressInput(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+51 900 111 222"
                          className="w-full bg-black border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] text-gray-400 font-mono uppercase font-bold">Dirección de Vía Exacta</label>
                        <input
                          type="text"
                          required
                          value={addressInput.address}
                          onChange={(e) => setAddressInput(p => ({ ...p, address: e.target.value }))}
                          placeholder="Jr. Tarapacá 102, Oficina 402"
                          className="w-full bg-black border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-mono uppercase font-bold">Distrito / Ciudad</label>
                        <input
                          type="text"
                          required
                          value={addressInput.city}
                          onChange={(e) => setAddressInput(p => ({ ...p, city: e.target.value }))}
                          placeholder="Miraflores, Lima"
                          className="w-full bg-black border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-mono uppercase font-bold">Referencia de Entrega</label>
                        <input
                          type="text"
                          required
                          value={addressInput.reference}
                          onChange={(e) => setAddressInput(p => ({ ...p, reference: e.target.value }))}
                          placeholder="Frente a la clínica del Sol"
                          className="w-full bg-black border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewAddressForm(false)}
                        className="text-xs font-bold text-gray-450 hover:text-white px-4 py-2 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-4.5 py-2 rounded-xl cursor-pointer"
                      >
                        Registrar Destino
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr, idx) => (
                    <div 
                      key={idx}
                      className="bg-gray-900/30 border border-gray-900 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white uppercase">{addr.fullName}</span>
                          {idx === 0 && (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase font-mono">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-450">
                          <p><strong className="text-gray-300">Dirección:</strong> {addr.address}</p>
                          <p><strong className="text-gray-300">Ubicación:</strong> {addr.city}</p>
                          <p><strong className="text-gray-300">Referencia:</strong> {addr.reference}</p>
                          <p><strong className="text-gray-300">Contacto:</strong> {addr.phone}</p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-3 border-t border-gray-900/60">
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          className="text-red-400 hover:text-white p-2 hover:bg-red-950/20 rounded-xl cursor-pointer transition-colors"
                          title="Eliminar Dirección"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 6. CONEXIÓN Y SEGURIDAD */}
            {activeTab === "cuenta" && (
              <motion.div
                key="cuenta"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-gray-900 pb-3 flex justify-between items-center">
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    Cambiar Contraseña de Cuenta
                  </h2>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-4">
                  {saveSuccess && (
                    <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl font-bold">
                      {saveSuccess}
                    </div>
                  )}

                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Contraseña Actual</label>
                      <input
                        type="password"
                        required
                        value={profileData.passCurrent}
                        onChange={(e) => setProfileData(p => ({ ...p, passCurrent: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Nueva Contraseña</label>
                      <input
                        type="password"
                        required
                        value={profileData.passNew}
                        onChange={(e) => setProfileData(p => ({ ...p, passNew: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-gray-400 block uppercase">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        required
                        value={profileData.passConfirm}
                        onChange={(e) => setProfileData(p => ({ ...p, passConfirm: e.target.value }))}
                        className="w-full bg-black border border-gray-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  </div>

                  <div className="flex justify-start pt-3">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer"
                    >
                      Actualizar Credenciales
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
