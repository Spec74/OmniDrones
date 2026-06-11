<?php

use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Order Service API Routes
|--------------------------------------------------------------------------
| Bindings for db_orders database. Manages order receipts, checkout, and
| triggers mock payment gateway integrations.
|
*/

Route::post('/orders/checkout', [OrderController::class, 'store']);
