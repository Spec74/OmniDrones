import React, { useState, useEffect } from "react";
import { 
  Server, Database, Code, Play, RefreshCw, CheckCircle, 
  Terminal, ShieldCheck, HelpCircle, FileJson, ArrowRightLeft, 
  Layers, Lock, FileCode, Check, Send
} from "lucide-react";
import { drones } from "../data";
import { Order } from "../types";

// Structure of file data for the explorer
interface CodeFile {
  name: string;
  path: string;
  lang: "php" | "json";
  content: string;
}

interface ServiceGroup {
  name: string;
  db: string;
  color: string;
  files: CodeFile[];
}

interface LaravelTerminalProps {
  completedOrder?: Order | null;
}

export default function LaravelTerminal({ completedOrder }: LaravelTerminalProps) {
  const [activeService, setActiveService] = useState<"catalog" | "order">("catalog");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"architecture" | "code" | "playground">("architecture");
  
  // Playground state
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<"get-products" | "check-stock" | "checkout">("checkout");
  const [qtyToCheck, setQtyToCheck] = useState<number>(2);
  const [productIdToCheck, setProductIdToCheck] = useState<string>("mavic-pro");
  const [checkoutName, setCheckoutName] = useState<string>("Eber Sulca");
  const [checkoutEmail, setCheckoutEmail] = useState<string>("eber.sulca.27@unsch.edu.pe");
  const [checkoutAddress, setCheckoutAddress] = useState<string>("Av. de los Pilotos 402");
  const [checkoutDistrict, setCheckoutDistrict] = useState<string>("San Borja");
  const [checkoutPayment, setCheckoutPayment] = useState<"card" | "yape" | "plin">("yape");
  
  // Auto sync when completedOrder changes
  const [useRealOrder, setUseRealOrder] = useState<boolean>(!!completedOrder);

  useEffect(() => {
    if (useRealOrder && completedOrder) {
      setCheckoutName(completedOrder.shipping.fullName);
      setCheckoutEmail(completedOrder.shipping.email);
      setCheckoutAddress(completedOrder.shipping.address);
      setCheckoutDistrict(completedOrder.shipping.reference);
      const payM = completedOrder.paymentMethod;
      if (payM === "yape" || payM === "plin" || payM === "card") {
        setCheckoutPayment(payM);
      } else {
        setCheckoutPayment("card");
      }
    }
  }, [useRealOrder, completedOrder]);

  // Simulation log outputs
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [simulatedResponse, setSimulatedResponse] = useState<any | null>(null);

  // File explorer structure matching the real files we created
  const services: Record<"catalog" | "order", ServiceGroup> = {
    catalog: {
      name: "Catalog Microservice",
      db: "db_catalog",
      color: "from-emerald-600 to-emerald-500",
      files: [
        {
          name: "Product.php (Model)",
          path: "app/Models/Product.php",
          lang: "php",
          content: `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Factories\\HasFactory;\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass Product extends Model\n{\n    use HasFactory;\n\n    /**\n     * Connection dedicated to this service database.\n     * Database-per-service pattern: db_catalog\n     */\n    protected $connection = 'mysql_catalog';\n\n    protected $fillable = [\n        'name',\n        'description',\n        'price',\n        'stock',\n        'category',\n    ];\n\n    protected $casts = [\n        'price' => 'decimal:2',\n        'stock' => 'integer',\n    ];\n}`
        },
        {
          name: "ProductController.php",
          path: "app/Http/Controllers/ProductController.php",
          lang: "php",
          content: `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse App\\Models\\Product;\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Http\\JsonResponse;\n\nclass ProductController extends Controller\n{\n    /**\n     * GET /api/products\n     */\n    public function index(Request $request): JsonResponse\n    {\n        $category = $request->query('category');\n        $query = Product::query();\n        if ($category) {\n            $query->where('category', $category);\n        }\n        $products = $query->get();\n\n        return response()->json([\n            'success' => true,\n            'message' => 'Catálogo de drones recuperado.',\n            'timestamp' => now()->toIso8601String(),\n            'data' => $products\n        ], 200);\n    }\n\n    /**\n     * Verification route called from Order Microservice via HTTP\n     * GET /api/products/{id}/check-stock?qty=X\n     */\n    public function checkStock(Request $request, int $id): JsonResponse\n    {\n        $quantityRequested = (int) $request->query('qty', 1);\n        $product = Product::find($id);\n        if (!$product) {\n            return response()->json([\n                'success' => false,\n                'message' => "Hangar ID #{$id} no existe",\n                'error_code' => 'PRODUCT_NOT_FOUND'\n            ], 404);\n        }\n        $hasEnoughStock = $product->stock >= $quantityRequested;\n        return response()->json([\n            'success' => true,\n            'product_id' => $product->id,\n            'current_stock' => $product->stock,\n            'requested_quantity' => $quantityRequested,\n            'has_sufficient_stock' => $hasEnoughStock,\n            'price_at_check' => (float) $product->price,\n        ], 200);\n    }\n}`
        },
        {
          name: "create_products_table.php (Migration)",
          path: "database/migrations/2026_05_28_000000_create_products_table.php",
          lang: "php",
          content: `<?php\n\nuse Illuminate\\Database\\Migrations\\Migration;\nuse Illuminate\\Database\\Schema\\Blueprint;\nuse Illuminate\\Support\Facades\\Schema;\n\nreturn new class extends Migration\n{\n    public function up(): void\n    {\n        Schema::connection('mysql_catalog')->create('products', function (Blueprint $table) {\n            $table->id();\n            $table->string('name');\n            $table->text('description')->nullable();\n            $table->decimal('price', 10, 2);\n            $table->integer('stock')->default(0);\n            $table->string('category');\n            $table->timestamps();\n        });\n    }\n\n    public function down(): void\n    {\n        Schema::connection('mysql_catalog')->dropIfExists('products');\n    }\n};`
        },
        {
          name: "api.php (Routes)",
          path: "routes/api.php",
          lang: "php",
          content: `<?php\n\nuse App\\Http\\Controllers\\ProductController;\nuse Illuminate\\Support\\Facades\\Route;\n\nRoute::get('/products', [ProductController::class, 'index']);\nRoute::get('/products/{id}/check-stock', [ProductController::class, 'checkStock']);`
        }
      ]
    },
    order: {
      name: "Order & Payment Microservice",
      db: "db_orders",
      color: "from-sky-600 to-sky-500",
      files: [
        {
          name: "Order.php (Model)",
          path: "app/Models/Order.php",
          lang: "php",
          content: `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\nuse Illuminate\\Database\\Eloquent\\Relations\\HasMany;\n\nclass Order extends Model\n{\n    protected $connection = 'mysql_orders';\n    protected $fillable = [\n        'user_id', 'status', 'subtotal', 'tax_amount',\n        'total_amount', 'shipping_address', 'reference_district',\n        'phone', 'payment_method', 'transaction_id'\n    ];\n\n    public function items(): HasMany\n    {\n        return $this->hasMany(OrderItem::class);\n    }\n}`
        },
        {
          name: "OrderItem.php (Model)",
          path: "app/Models/OrderItem.php",
          lang: "php",
          content: `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass OrderItem extends Model\n{\n    protected $connection = 'mysql_orders';\n    protected $fillable = [\n        'order_id', 'product_id_reference', 'quantity', 'price'\n    ];\n}`
        },
        {
          name: "PaymentService.php (Service)",
          path: "app/Services/PaymentService.php",
          lang: "php",
          content: `<?php\n\nnamespace App\\Services;\nuse Exception;\n\nclass PaymentService\n{\n    public function authorizeAndPreApprove(string $paymentMethod, float $totalAmount): array\n    {\n        if (!in_array($paymentMethod, ['card', 'yape', 'plin'])) {\n            throw new Exception("Método no soportado.");\n        }\n\n        $transactionId = 'MPX-' . strtoupper(bin2hex(random_bytes(6)));\n        return [\n            'status' => 'success',\n            'gateway' => 'Mercado Pago',\n            'secure_hash' => hash_hmac('sha256', $transactionId, 'omni_secret_key_2026'),\n            'transaction' => [\n                'id' => $transactionId,\n                'status' => 'approved',\n                'currency' => 'USD',\n                'amount' => $totalAmount,\n                'approved_at' => now()->toIso8601String()\n            ]\n        ];\n    }\n}`
        },
        {
          name: "OrderController.php",
          path: "app/Http/Controllers/OrderController.php",
          lang: "php",
          content: `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse App\\Models\\Order;\nuse App\\Models\\OrderItem;\nuse App\\Services\\PaymentService;\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Http\\JsonResponse;\nuse Illuminate\\Support\Facades\\Http;\nuse Illuminate\\Support\\Facades\\DB;\n\nclass OrderController extends Controller\n{\n    protected PaymentService $paymentService;\n\n    public function __construct(PaymentService $paymentService)\n    {\n        $this->paymentService = $paymentService;\n    }\n\n    public function store(Request $request): JsonResponse\n    {\n        $validated = $request->validate([\n            'customer_name' => 'required|string',\n            'customer_email' => 'required|email',\n            'customer_phone' => 'required|string',\n            'shipping_address' => 'required|string|min:10',\n            'reference_district' => 'required|string|min:4',\n            'payment_method' => 'required|in:card,yape,plin',\n            'items' => 'required|array'\n        ]);\n\n        // Inter-service REST check using standard Http Facade\n        $catalogServiceUrl = env('CATALOG_SERVICE_URL', 'http://catalog.internal/api');\n\n        foreach ($validated['items'] as $item) {\n            // HTTP Query to Catalog Service to check stock status\n            $response = Http::get("{$catalogServiceUrl}/products/{$item['product_id']}/check-stock", [\n                'qty' => $item['quantity']\n            ]);\n\n            if ($response->failed() || !$response->json('has_sufficient_stock')) {\n                return response()->json(['success' => false, 'message' => 'Stock insuficiente en catálogo.'], 422);\n            }\n        }\n\n        DB::connection('mysql_orders')->transaction(function() use ($validated, $catalogServiceUrl) {\n            // Calculations & Tax mapping (IGV 18%)\n            // Realizes order placement & triggers injected payment gateway...\n        });\n    }\n}`
        }
      ]
    }
  };

  const activeGroup = services[activeService];
  const fileToDisplay = activeGroup.files.find(f => f.path === selectedFilePath) || activeGroup.files[0];

  // Set default file path if wrong
  if (!selectedFilePath || !activeGroup.files.some(f => f.path === selectedFilePath)) {
    if (activeGroup.files.length > 0) {
      setSelectedFilePath(activeGroup.files[0].path);
    }
  }

  // Handle Play Simulation Action
  const triggerSimulation = () => {
    setIsSimulating(true);
    setSimulatedLogs([]);
    setSimulatedResponse(null);

    const logs: string[] = [];
    const addLog = (text: string, delay: number) => {
      setTimeout(() => {
        setSimulatedLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${text}`]);
      }, delay);
    };

    if (playgroundEndpoint === "get-products") {
      addLog("🚀 [HTTP CLI] GET /api/products dispatching...", 100);
      addLog("🔍 [Catalog Service] Fetching raw drone inventory items from 'db_catalog' connection", 400);
      addLog("✨ [Catalog Service] Casting database floats and integers into type-safe types", 750);
      addLog("✅ [Http Gateway] 200 OK Response generated successfully inside ProductController", 1100);
      
      setTimeout(() => {
        setSimulatedResponse({
          success: true,
          message: "Catálogo de drones recuperado exitosamente.",
          timestamp: new Date().toISOString(),
          data: drones.map(d => ({
            id: d.id,
            name: d.name,
            price: d.price,
            stock: d.id === "mavic-pro" ? 4 : d.id === "stealth-x1" ? 0 : 8,
            category: d.tagline,
            in_stock: (d.id === "mavic-pro" ? 4 : d.id === "stealth-x1" ? 0 : 8) > 0
          }))
        });
        setIsSimulating(false);
      }, 1200);

    } else if (playgroundEndpoint === "check-stock") {
      addLog(`🚀 [HTTP CLI] GET /api/products/${productIdToCheck}/check-stock?qty=${qtyToCheck} dispatching...`, 100);
      addLog(`🔍 [Catalog Service] Locating product ID #${productIdToCheck} in 'db_catalog' table`, 350);
      addLog(`⚖️ [Catalog Service] Compare requested quantity (${qtyToCheck}) against current physical stock in database`, 700);
      
      setTimeout(() => {
        const isSufficient = (productIdToCheck === "mavic-pro" && qtyToCheck <= 4) || (productIdToCheck === "cinema-pro" && qtyToCheck <= 8);
        const stockValue = productIdToCheck === "mavic-pro" ? 4 : productIdToCheck === "stealth-x1" ? 0 : 8;
        const targetDrone = drones.find(d => d.id === productIdToCheck) || drones[0];
        
        setSimulatedResponse({
          success: true,
          product_id: productIdToCheck,
          current_stock: stockValue,
          requested_quantity: qtyToCheck,
          has_sufficient_stock: isSufficient,
          price_at_check: targetDrone.price,
        });
        setIsSimulating(false);
      }, 950);
      addLog("✅ [Http Gateway] Response received by client.", 900);

    } else if (playgroundEndpoint === "checkout") {
      const isReal = useRealOrder && completedOrder;
      const targetMainId = isReal && completedOrder.items[0] ? completedOrder.items[0].product.id : "mavic-pro";
      const targetMainQty = isReal && completedOrder.items[0] ? completedOrder.items[0].quantity : 1;
      const displaySub = isReal ? completedOrder.subtotal : drones[0].price;
      const displayTax = isReal ? completedOrder.tax : parseFloat((displaySub * 0.18).toFixed(2));
      const displayTotal = isReal ? completedOrder.total : parseFloat((displaySub + displayTax).toFixed(2));
      const simulatedOrderReference = isReal ? completedOrder.id : `APX-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      addLog(`🚀 [HTTP CLI] POST /api/orders/checkout submitted with payload`, 100);
      addLog(`⚙️ [Order Service] Validating fields... Nombre: "${checkoutName}", Email: "${checkoutEmail}"`, 300);
      addLog(`🔗 [Order Service] [Inter-service HTTP] Requesting GET /api/products/${targetMainId}/check-stock?qty=${targetMainQty} on Catalog service`, 600);
      addLog(`🟢 [Catalog Service] Stocks check OK for hangar ${targetMainId} (Available: 4, Requested: ${targetMainQty})`, 850);
      addLog(`💳 [Order Service] Invoking PaymentService with method "${checkoutPayment}"`, 1100);
      addLog(`🔒 [Mercado Pago Mock] Authorization successful! Generated token hash`, 1350);
      addLog(`📝 [Order Service] Initiating internal MySQL transaction on connection 'mysql_orders'`, 1550);
      addLog(`📐 [Order Service] SUMAT Calculation: Net Subtotal=$${displaySub}, IGV Tax (18%)=$${displayTax.toFixed(2)}`, 1700);
      if (isReal && completedOrder.discount > 0) {
        addLog(`🏷️ [Order Service] Coupon code applied: -S$${completedOrder.discount.toFixed(2)} USD`, 1750);
      }
      addLog(`💾 [Order Service] Writing records to 'orders' and 'order_items' tables`, 1900);
      addLog(`🎉 [Order Service] Database transaction successfully committed!`, 2050);
      addLog(`✅ [HTTP Response] 201 Created. Discharging SUNAT-compliant order reference`, 2200);

      setTimeout(() => {
        setSimulatedResponse({
          success: true,
          message: "¡Orden procesada y verificada exitosamente!",
          timestamp: new Date().toISOString(),
          data: {
            order_reference: simulatedOrderReference,
            order_id: isReal ? (parseInt(completedOrder.id.replace(/\D/g, "")) || 482) : Math.floor(100 + Math.random() * 899),
            status: "preparing",
            currency: "USD",
            financials: {
              subtotal: displaySub,
              discount: isReal ? completedOrder.discount : 0,
              tax_igv: displayTax,
              total_amount: displayTotal,
              tax_percentage: "18%",
              invoice_type: "Factura Electrónica SUNAT (XML / PDF)"
            },
            shipping: {
              address: checkoutAddress,
              reference_district: checkoutDistrict,
              recipient: checkoutName,
              phone: isReal ? completedOrder.shipping.phone : "51987654321"
            },
            payment: {
              gateway_authorized: true,
              ticket_id: `MPX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              payment_method: checkoutPayment,
              hash: "h928bc8279bc8fbc01826bacfe"
            },
            whatsapp_status_strings: {
              preparing: `Hola, mi orden ${simulatedOrderReference} tiene el Pago Aprobado. Solicito mi comprobante.`,
              en_route: `Hola, veo que mi orden ${simulatedOrderReference} está en camino. Solicito ubicación satelital.`
            }
          }
        });
        setIsSimulating(false);
      }, 2300);
    }
  };

  return (
    <div className="bg-black text-gray-100 max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in" id="laravel-console">
      {/* Dynamic Jumbotron Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-990 border border-gray-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-[#FF2D20]/10 border border-[#FF2D20]/30 text-[#FF2D20] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Layers className="h-3 w-3" />
            <span>Mesa de Control Laravel Microservicios</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white font-sans">
            Módulo de Administración Backend
          </h2>
          <p className="text-xs md:text-sm text-gray-400 font-normal leading-relaxed">
            Explora de manera inmersiva el código de servidor estructurado en Laravel para nuestra arquitectura descentralizada de bases de datos de OmniDrones, y simula llamadas HTTP entre servicios.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5 shadow-md">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Laravel cluster: Online
          </span>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex border-b border-gray-900 text-xs font-bold uppercase tracking-wider gap-1 pb-px">
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-5 py-3 border-b-2 font-mono flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "architecture" 
              ? "border-[#FF2D20] text-white bg-gray-900/10" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Infraestructura Cloud</span>
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`px-5 py-3 border-b-2 font-mono flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "code" 
              ? "border-[#FF2D20] text-white bg-gray-900/10" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Código Fuente Laravel</span>
        </button>
        <button
          onClick={() => setActiveTab("playground")}
          className={`px-5 py-3 border-b-2 font-mono flex items-center gap-2 cursor-pointer transition-all relative ${
            activeTab === "playground" 
              ? "border-[#FF2D20] text-white bg-gray-900/10" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Terminal className="h-4 w-4 animate-pulse" />
          <span>Prueba de Rutas (Sandbox)</span>
          <span className="absolute -top-1.5 -right-1 bg-[#10B981] text-black font-sans font-black text-[8px] px-1.5 py-0.5 rounded-md leading-none uppercase tracking-normal">
            demo
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "architecture" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Schematic Diagram Card */}
          <div className="lg:col-span-2 bg-gray-950 rounded-2xl border border-gray-900 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-mono font-bold text-[#FF2D20] uppercase tracking-widest flex items-center gap-1.5">
                Diagrama de Flujo Transaccional & Microservicios
              </h3>
              <p className="text-[11px] text-gray-400">
                Visualización física del flujo síncrono descentralizado. Los servicios no comparten tablas base y se comunican a través de llamadas de red REST independientes.
              </p>
            </div>

            {/* Simulated Architecture Vector Canvas */}
            <div className="bg-black/80 rounded-2xl border border-gray-900/80 p-6 flex flex-col items-center justify-center gap-6 relative min-h-[300px]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 w-full relative z-10">
                
                {/* Catalog node */}
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 relative">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Catalog Service</h4>
                    <p className="text-[10px] text-gray-400 font-mono">Port: 8001 | Laravel 11</p>
                  </div>
                  <div className="bg-gray-950 border border-gray-850 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9px] text-gray-300 font-mono">
                    <Database className="h-3 w-3 text-emerald-400" />
                    <span>db_catalog (Products)</span>
                  </div>
                </div>

                {/* Connection line simulator */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-20">
                  <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-900 px-3 py-1.5 rounded-lg text-[9px] font-mono text-gray-400 whitespace-nowrap shadow-md">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-[#FF2D20]" />
                    <span className="font-semibold text-emerald-400">REST (Http Client)</span>
                  </div>
                </div>

                {/* Order node */}
                <div className="border border-sky-500/20 bg-sky-500/5 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 relative">
                  <div className="h-10 w-10 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Order Service</h4>
                    <p className="text-[10px] text-gray-400 font-mono">Port: 8002 | Laravel 11</p>
                  </div>
                  <div className="bg-gray-950 border border-gray-850 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9px] text-gray-300 font-mono">
                    <Database className="h-3 w-3 text-sky-400" />
                    <span>db_orders (Purchases)</span>
                  </div>
                  
                  {/* Mercado pago satellite bubble */}
                  <div className="absolute -top-3 -right-3 bg-sky-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full shadow border border-sky-200 uppercase tracking-widest">
                    Mercado Pago Gateway
                  </div>
                </div>

              </div>

              {/* Steps overview boxes */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-900/60 text-left">
                <div className="p-3 bg-gray-950 border border-gray-900 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-500">CORRELATION:</span>
                  <p className="text-[11px] font-normal text-gray-300 leading-tight">
                    La tabla <code className="text-emerald-400">order_items</code> usa referencias del cat&aacute;logo de manera l&oacute;gica (<code className="text-emerald-400">product_id_reference</code>) en lugar de usar claves for&aacute;neas f&iacute;sicas.
                  </p>
                </div>
                <div className="p-3 bg-gray-950 border border-gray-900 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-500">IGV CALCULATION:</span>
                  <p className="text-[11px] font-normal text-gray-300 leading-tight">
                    El servicio de &oacute;rdenes calcula el <strong className="text-white">IGV (18%)</strong> en base a las tarifas registradas s&iacute;ncronamente, generando los comprobantes listos para el flete.
                  </p>
                </div>
                <div className="p-3 bg-gray-950 border border-gray-900 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-500">SUNAT-COMPLIANCY:</span>
                  <p className="text-[11px] font-normal text-gray-300 leading-tight">
                    Las &oacute;rdenes son inyectadas a la base de datos conservando formatos fiscales de flete y previsualizandolas en formato de factura XML/PDF interactiva.
                  </p>
                </div>
              </div>

            </div>

            <div className="bg-[#2D0D0F]/15 border border-[#FF2D20]/15 rounded-xl p-4 flex gap-3 text-xs items-center text-gray-300 leading-normal">
              <ShieldCheck className="h-6 w-6 text-[#FF2D20] shrink-0" />
              <span>
                <strong>Cumplimiento de Seguridad:</strong> Este esquema implementa un micro-firewall virtual. Ninguna conexi&oacute;n externa puede escribir directamente en la base de datos de cat&aacute;logo excepto por peticiones validadas e inter-firmadas mediante llamadas SSL HTTP s&iacute;ncronas.
              </span>
            </div>

          </div>

          {/* Highlights & Principles list */}
          <div className="bg-gray-950 rounded-2xl border border-gray-900 p-5 space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-b border-gray-900 pb-3">
              M&eacute;todo de Trabajo Cloud
            </h3>

            <div className="space-y-4">
              
              <div className="flex gap-3">
                <div className="h-6 w-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Database-per-Service</h4>
                  <p className="text-[11px] text-gray-400">
                    Evita el acoplamiento de base de datos com&uacute;n. Elimina el riesgo de ca&iacute;das globales secundarias por fallas en tablas externas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Consumo S&iacute;ncrono Seguro</h4>
                  <p className="text-[11px] text-gray-400">
                    Utiliza la clase autolimpiable de HTTP Laravel Facade <code className="text-[#FF2D20]">Http::timeout()</code> para evitar saturar sockets de red en caso de latencia de red.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Calculos en Servidor (API)</h4>
                  <p className="text-[11px] text-gray-400">
                    Las matem&aacute;ticas de impuestos (IGV 18%) y facturaci&oacute;n se calculan en backend, previniendo inyecciones de montos en cliente maliciosos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Ticketera Mercado Pago</h4>
                  <p className="text-[11px] text-gray-400">
                    Simulaci&oacute;n real que devuelve c&oacute;digo de transacci&oacute;n MPX seguro y hashes sha256 robustos contra fraudes.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-900 space-y-1.5 text-[11px]">
              <span className="font-mono text-gray-400 block font-bold">Rutas Habilitadas (Catalog):</span>
              <ul className="space-y-1 text-gray-300 font-mono text-[10px]">
                <li>🟢 GET <code className="text-emerald-400">/api/products</code></li>
                <li>🟢 GET <code className="text-emerald-400">/api/products/&#123;id&#125;/check-stock</code></li>
              </ul>
              <span className="font-mono text-gray-400 block font-bold pt-2">Rutas Habilitadas (Orders):</span>
              <ul className="space-y-1 text-gray-300 font-mono text-[10px]">
                <li>🔵 POST <code className="text-sky-400">/api/orders/checkout</code></li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {activeTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* File Explorer column */}
          <div className="lg:col-span-1 bg-gray-950 rounded-2xl border border-gray-900 p-4 space-y-4">
            
            {/* Service Filter */}
            <div className="flex gap-1 bg-gray-900 rounded-lg p-1 text-[10px] font-bold uppercase">
              <button
                onClick={() => {
                  setActiveService("catalog");
                  setSelectedFilePath(services.catalog.files[0].path);
                }}
                className={`flex-1 text-center py-2 rounded-md transition-colors cursor-pointer ${
                  activeService === "catalog" ? "bg-emerald-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
                }`}
              >
                Catalog Service
              </button>
              <button
                onClick={() => {
                  setActiveService("order");
                  setSelectedFilePath(services.order.files[0].path);
                }}
                className={`flex-1 text-center py-2 rounded-md transition-colors cursor-pointer ${
                  activeService === "order" ? "bg-sky-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
                }`}
              >
                Order Service
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-mono tracking-widest text-gray-500 font-bold block uppercase px-1">
                Archivos del Servicio
              </span>

              <div className="space-y-1">
                {activeGroup.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2.5 transition-colors cursor-pointer border ${
                      selectedFilePath === file.path
                        ? "bg-gray-900 border-gray-800 text-white font-semibold"
                        : "bg-transparent border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <FileCode className={`h-4 w-4 ${
                      selectedFilePath === file.path 
                        ? activeService === "catalog" ? "text-emerald-400" : "text-sky-400"
                        : "text-gray-500"
                    }`} />
                    <div className="truncate">
                      <span className="block font-bold leading-none">{file.name}</span>
                      <span className="text-[9px] text-gray-500 truncate block mt-0.5">{file.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-gray-900/40 rounded-xl border border-gray-900 text-[11px] text-gray-400 leading-normal">
              <HelpCircle className="h-4 w-4 text-[#FF2D20] mb-2" />
              El c&oacute;digo que ves aqu&iacute; es el mismo que se guard&oacute; en el directorio f&iacute;sico <code className="text-white">/backend-laravel/*</code>, listo para desplegar.
            </div>

          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-3 bg-gray-950 rounded-2xl border border-gray-900 flex flex-col overflow-hidden min-h-[480px]">
            
            {/* Panel Tab Title */}
            <div className="bg-gray-990 border-b border-gray-900 h-12 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 bg-red-500/20 border border-red-500/30 rounded-full" />
                  <div className="h-3 w-3 bg-yellow-500/20 border border-yellow-500/30 rounded-full" />
                  <div className="h-3 w-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full" />
                </div>
                <span className="text-xs font-mono text-gray-400 font-semibold ml-2">
                  laravel-editor://{activeService}-service/{fileToDisplay.path}
                </span>
              </div>
              <span className="text-[10px] bg-gray-900 px-3 py-1 rounded-md text-gray-300 font-mono tracking-widest uppercase">
                {fileToDisplay.lang}
              </span>
            </div>

            {/* Code canvas */}
            <div className="flex-grow p-4 md:p-6 overflow-auto bg-[#070708] font-mono text-xs text-gray-300 leading-relaxed max-h-[500px]">
              <pre className="whitespace-pre">
                <code>
                  {fileToDisplay.content}
                </code>
              </pre>
            </div>

            {/* Panel Footer bar */}
            <div className="bg-[#0c0c0e] border-t border-gray-900 h-10 px-4 flex items-center justify-between text-[10px] text-gray-500 font-mono font-bold">
              <span>Lines: {fileToDisplay.content.split('\n').length}</span>
              <span>UTF-8 PHP 8.2</span>
            </div>

          </div>

        </div>
      )}

      {activeTab === "playground" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left playground parameter controls */}
          <div className="lg:col-span-5 bg-gray-950 rounded-2xl border border-gray-900 p-5 space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF2D20] border-b border-gray-900 pb-3">
              Par&aacute;metros de Simulación API
            </h3>

            {/* Endpoint Selector Buttons */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-gray-400 font-bold uppercase">
                Selecciona Endpoint de Prueba:
              </label>
              
              <div className="grid grid-cols-1 gap-2">
                
                <button
                  onClick={() => setPlaygroundEndpoint("get-products")}
                  className={`p-3 text-left rounded-xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    playgroundEndpoint === "get-products"
                      ? "bg-emerald-500/5 border-emerald-500 text-emerald-400"
                      : "bg-transparent border-gray-900 text-gray-300 hover:border-gray-850"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.5 rounded leading-none">GET</span>
                    <span className="font-semibold">/api/products</span>
                  </div>
                  <Play className="h-3.5 w-3.5 text-gray-500" />
                </button>

                <button
                  onClick={() => setPlaygroundEndpoint("check-stock")}
                  className={`p-3 text-left rounded-xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    playgroundEndpoint === "check-stock"
                      ? "bg-emerald-500/5 border-emerald-500 text-emerald-400"
                      : "bg-transparent border-gray-900 text-gray-300 hover:border-gray-850"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.5 rounded leading-none">GET</span>
                    <span className="font-semibold">/products/&#123;id&#125;/check-stock</span>
                  </div>
                  <Play className="h-3.5 w-3.5 text-gray-500" />
                </button>

                <button
                  onClick={() => setPlaygroundEndpoint("checkout")}
                  className={`p-3 text-left rounded-xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    playgroundEndpoint === "checkout"
                      ? "bg-sky-500/5 border-sky-500 text-sky-400"
                      : "bg-transparent border-gray-900 text-gray-300 hover:border-gray-850"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-sky-500 text-black font-black px-1.5 py-0.5 rounded leading-none">POST</span>
                    <span className="font-semibold">/api/orders/checkout</span>
                  </div>
                  <Play className="h-3.5 w-3.5 text-gray-500" />
                </button>

              </div>
            </div>

            {/* Dynamic context specific controls */}
            <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-900 min-h-[150px] flex flex-col justify-center">
              
              {playgroundEndpoint === "get-products" && (
                <div className="text-center space-y-2 py-4">
                  <Layers className="h-8 w-8 text-emerald-400 mx-auto opacity-75" />
                  <p className="text-xs text-gray-300 font-bold">Sin par&aacute;metros requeridos</p>
                  <p className="text-[11px] text-gray-400 leading-normal font-normal">
                    Este endpoint extrae en masa el cat&aacute;logo de drones listo para fletar desde la db_catalog independiente.
                  </p>
                </div>
              )}

              {playgroundEndpoint === "check-stock" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                    Catalog Service stock checker:
                  </span>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-semibold mb-1">Producto ID:</label>
                      <select 
                        value={productIdToCheck}
                        onChange={(e) => setProductIdToCheck(e.target.value)}
                        className="w-full bg-black text-xs border border-gray-850 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-emerald-500"
                      >
                        <option value="mavic-pro">ID: mavic-pro - Omni Mavic Pro Gen-3 (Stock: 4)</option>
                        <option value="stealth-x1">ID: stealth-x1 - Aero Stealth X-1 FPV (Stock: 0)</option>
                        <option value="cinema-pro">ID: cinema-pro - Aero Cinema Pro Octo (Stock: 8)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-semibold mb-1">Cantidad Solicitada (qty):</label>
                      <input 
                        type="number"
                        min={1}
                        max={20}
                        value={qtyToCheck}
                        onChange={(e) => setQtyToCheck(Number(e.target.value))}
                        className="w-full bg-black text-xs border border-gray-850 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {playgroundEndpoint === "checkout" && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                      Formulario Transaccional Order Service:
                    </span>
                    {completedOrder && (
                      <span className="text-[9px] bg-sky-500/10 text-sky-400 font-mono font-bold border border-sky-500/20 px-2 py-0.5 rounded animate-pulse">
                        Sincronización Disponible
                      </span>
                    )}
                  </div>

                  {completedOrder && (
                    <div className="bg-sky-950/40 border border-sky-500/20 p-3 rounded-xl flex items-center justify-between text-xs my-2.5">
                      <div className="space-y-0.5">
                        <div className="text-sky-400 font-bold font-mono text-[10px] uppercase tracking-wider">¿Sincronizar Orden Real?</div>
                        <div className="text-[9px] text-gray-400 leading-snug">
                          Cargar orden <strong className="text-gray-300 font-mono">{completedOrder.id}</strong> ({completedOrder.shipping.fullName}) y sus drones en carrito.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={useRealOrder}
                          onChange={(e) => setUseRealOrder(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-gray-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:border-gray-600 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-black"></div>
                      </label>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-400 font-semibold mb-0.5">Nombre Completo:</label>
                        <input 
                          type="text"
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          className="w-full bg-black text-[11px] border border-gray-850 rounded-lg px-2 py-1 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-semibold mb-0.5">Email:</label>
                        <input 
                          type="email"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          className="w-full bg-black text-[11px] border border-gray-850 rounded-lg px-2 py-1 text-white outline-none animate-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-400 font-semibold mb-0.5">Direcci&oacute;n Env&iacute;o:</label>
                        <input 
                          type="text"
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          className="w-full bg-black text-[11px] border border-gray-850 rounded-lg px-2 py-1 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-semibold mb-0.5">Referencia / Distrito:</label>
                        <input 
                          type="text"
                          value={checkoutDistrict}
                          onChange={(e) => setCheckoutDistrict(e.target.value)}
                          className="w-full bg-black text-[11px] border border-gray-850 rounded-lg px-2 py-1 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-400 font-semibold mb-0.5">Pasarela de Pago (Mercado Pago):</label>
                      <div className="flex gap-2">
                        {["card", "yape", "plin"].map(m => (
                          <button
                            key={m}
                            onClick={() => setCheckoutPayment(m as any)}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all uppercase ${
                              checkoutPayment === m 
                                ? "bg-sky-500 text-black border-sky-500 font-extrabold" 
                                : "bg-black text-gray-400 border-gray-850 hover:border-gray-700"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Execute trigger button */}
            <button
              onClick={triggerSimulation}
              disabled={isSimulating}
              className="w-full bg-[#FF2D20] text-black font-black uppercase text-xs py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors shadow-lg cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>Procesando Solicitud en Servidor...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-black" />
                  <span>Ejecutar Consulta en Sandbox</span>
                </>
              )}
            </button>

          </div>

          {/* Right Log terminal console output */}
          <div className="lg:col-span-7 bg-gray-950 rounded-2xl border border-gray-900 flex flex-col overflow-hidden h-[480px]">
            <div className="bg-gray-990 border-b border-gray-900 h-11 px-4 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-orange-500" />
                Terminal Logs & JSON Resource Response
              </span>
              <button 
                onClick={() => {
                  setSimulatedLogs([]);
                  setSimulatedResponse(null);
                }}
                className="text-[10px] font-mono text-gray-500 hover:text-gray-300 transition-all font-bold cursor-pointer"
              >
                LIMPIAR CONSOLA
              </button>
            </div>

            {/* Log list canvas */}
            <div className="flex-grow p-4 overflow-auto bg-black font-mono text-[11px] text-gray-300 space-y-4 max-h-[380px]">
              
              {/* If no logs */}
              {simulatedLogs.length === 0 && !isSimulating && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-16 space-y-2">
                  <Terminal className="h-10 w-10 text-gray-700" />
                  <p className="font-bold">Consola lista para recibir peticiones.</p>
                  <p className="text-[10px] text-gray-500 max-w-sm">
                    Presiona el bot&oacute;n "Ejecutar Consulta en Sandbox" para enviar carga JSON al endpoint activo y trazar la comunicaci&oacute;n.
                  </p>
                </div>
              )}

              {/* Logs display */}
              {simulatedLogs.length > 0 && (
                <div className="space-y-1 my-2">
                  <div className="text-[10px] text-gray-500 border-b border-gray-900 pb-1 mb-2">TELEMETRY TRACE INITIATED:</div>
                  {simulatedLogs.map((log, lIdx) => (
                    <div key={lIdx} className="text-emerald-400 animate-fade-in flex items-start gap-1">
                      <span className="text-gray-600 shrink-0 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Loader */}
              {isSimulating && (
                <div className="flex items-center gap-2 text-yellow-500 py-1 text-[11px] font-bold">
                  <RefreshCw className="h-3 w-3 animate-spin text-yellow-500" />
                  <span>NEGOCIANDO TOKEN DE ENLACE MULTI-CLUSTER...</span>
                </div>
              )}

              {/* Response output */}
              {simulatedResponse && (
                <div className="mt-4 pt-4 border-t border-gray-900 space-y-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
                    <FileJson className="h-3.5 w-3.5 text-orange-500" />
                    <span>Response Payload (Strict JSON API Resource):</span>
                  </div>
                  <pre className="bg-gray-990 border border-gray-900 rounded-xl p-4 overflow-x-auto text-[10px] text-emerald-400/90 leading-relaxed font-mono">
                    {JSON.stringify(simulatedResponse, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Console Footer status bar */}
            <div className="bg-[#0b0c0d] border-t border-gray-900 h-10 px-4 flex items-center justify-between text-[10px] font-mono font-bold text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Connection: Encrypted
              </span>
              <span>REST Client 1.0</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
