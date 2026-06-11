<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class OrderController extends Controller
{
    protected PaymentService $paymentService;

    /**
     * Inject PaymentService through Constructor.
     */
    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Store a new, verified purchase order.
     * POST /api/orders/checkout
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Rigorous request validation
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:40',
            'shipping_address' => 'required|string|min:10',
            'reference_district' => 'required|string|min:4',
            'payment_method' => 'required|in:card,yape,plin',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $items = $request->input('items');

        // Microservices Inter-service verification: Check Catalog Database Stock through HTTP client.
        // Catalog service URL configured in .env as CATALOG_SERVICE_URL
        $catalogServiceUrl = env('CATALOG_SERVICE_URL', 'http://catalog-service.omnidrones.internal/api');

        foreach ($items as $item) {
            try {
                // Perform HTTP GET request to check item stock levels on Catalog Service
                $response = Http::timeout(3.0)
                    ->get("{$catalogServiceUrl}/products/{$item['product_id']}/check-stock", [
                        'qty' => $item['quantity'],
                    ]);

                if ($response->failed()) {
                    return response()->json([
                        'success' => false,
                        'message' => "El Catalog Service no pudo validar el producto ID #{$item['product_id']}.",
                        'error_code' => 'CATALOG_COMMUNICATION_ERROR'
                    ], 502);
                }

                $stockData = $response->json();

                if (!($stockData['has_sufficient_stock'] ?? false)) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente en hangar central para el producto ID #{$item['product_id']}. Disponibilidad actual: {$stockData['current_stock']}.",
                        'error_code' => 'INSUFFICIENT_STOCK'
                    ], 422);
                }

            } catch (Exception $e) {
                Log::error("Falla de comunicación entre microservicios (Catalog Service): " . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio de Catálogo fuera de línea temporalmente. Intente nuevamente en unos minutos.',
                    'error_code' => 'MICROSERVICE_TIMEOUT'
                ], 504);
            }
        }

        // 2. Perform transactional database routines
        DB::connection('mysql_orders')->beginTransaction();

        try {
            // Locate or create local User profile
            $user = User::firstOrCreate(
                ['email' => $validated['customer_email']],
                ['name' => $validated['customer_name']]
            );

            // Fetch live pricing from Catalog Service to calculate transactional amount
            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($items as $item) {
                // Fetch product detail securely
                $catalogRes = Http::get("{$catalogServiceUrl}/products/{$item['product_id']}/check-stock", ['qty' => $item['quantity']]);
                $price = (float) $catalogRes->json('price_at_check');
                $itemTotal = $price * $item['quantity'];
                
                $subtotal += $itemTotal;
                
                $itemsToCreate[] = [
                    'product_id_reference' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price
                ];
            }

            // TAX CALCULATION (Peru SUNAT Normative: Total includes 18% IGV)
            // IGV is calculated as portion of the total amount or added depending on internal ERP mapping.
            // Under SUNAT rules, Total = Subtotal + IGV. 
            $taxRate = 0.18;
            $taxAmount = round($subtotal * $taxRate, 2);
            $totalAmount = round($subtotal + $taxAmount, 2);

            // 3. Trigger Mock Mercado Pago Gate authorization
            $mpTicket = $this->paymentService->authorizeAndPreApprove(
                $validated['payment_method'], 
                $totalAmount
            );

            // Create Order Header record
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'preparing',
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'shipping_address' => $validated['shipping_address'],
                'reference_district' => $validated['reference_district'],
                'phone' => $validated['customer_phone'],
                'payment_method' => $validated['payment_method'],
                'transaction_id' => $mpTicket['transaction']['id'],
            ]);

            // Create related Item records
            foreach ($itemsToCreate as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            DB::connection('mysql_orders')->commit();

            // Format Order Invoice reference in compliant APX-2026-X format
            $sunatFormattedId = "APX-2026-" . str_pad($order->id, 6, "0", STR_PAD_LEFT);

            return response()->json([
                'success' => true,
                'message' => '¡Orden procesada y verificada exitosamente!',
                'timestamp' => now()->toIso8601String(),
                'data' => [
                    'order_reference' => $sunatFormattedId,
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'currency' => 'USD',
                    'financials' => [
                        'subtotal' => (float)$order->subtotal,
                        'tax_igv' => (float)$order->tax_amount,
                        'total_amount' => (float)$order->total_amount,
                        'tax_percentage' => '18%',
                        'invoice_type' => 'Boleta/Factura Electrónica SUNAT (XML / PDF)'
                    ],
                    'shipping' => [
                        'address' => $order->shipping_address,
                        'reference_district' => $order->reference_district,
                        'recipient' => $user->name,
                        'phone' => $order->phone
                    ],
                    'payment' => [
                        'gateway_authorized' => true,
                        'ticket_id' => $order->transaction_id,
                        'payment_method' => $order->payment_method,
                        'hash' => $mpTicket['secure_hash']
                    ],
                    'whatsapp_status_strings' => [
                        'preparing' => "Hola, mi orden {$sunatFormattedId} tiene el Pago Aprobado. Solicito mi comprobante.",
                        'en_route' => "Hola, veo que mi orden {$sunatFormattedId} está en camino. Solicito ubicación satelital."
                    ]
                ]
            ], 201);

        } catch (Exception $e) {
            DB::connection('mysql_orders')->rollBack();
            Log::error("Error Fatal de Registro en Checkout de Órdenes: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Un error interno interrumpió el registro o el pago remoto de su orden.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}
