<?php

namespace App\Http/Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of active flight and custom drones.
     * GET /api/products
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        
        $query = Product::query();
        
        if ($category) {
            $query->where('category', $category);
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Catálogo de drones recuperado exitosamente.',
            'timestamp' => now()->toIso8601String(),
            'data' => $products->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'stock' => (int) $product->stock,
                'category' => $product->category,
                'in_stock' => $product->stock > 0,
            ]),
        ], 200);
    }

    /**
     * API tool for Order & Payment Microservice to verify stock availability.
     * GET /api/products/{id}/check-stock?qty=X
     */
    public function checkStock(Request $request, int $id): JsonResponse
    {
        $quantityRequested = (int) $request->query('qty', 1);
        
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => "Producto con ID #{$id} no existe en el Catálogo.",
                'error_code' => 'PRODUCT_NOT_FOUND'
            ], 404);
        }

        $hasEnoughStock = $product->stock >= $quantityRequested;

        return response()->json([
            'success' => true,
            'product_id' => $product->id,
            'current_stock' => $product->stock,
            'requested_quantity' => $quantityRequested,
            'has_sufficient_stock' => $hasEnoughStock,
            'price_at_check' => (float) $product->price,
        ], 200);
    }
}
