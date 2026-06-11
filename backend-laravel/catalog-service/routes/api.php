<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Catalog Service API Routes
|--------------------------------------------------------------------------
| Bindings for db_catalog. Running asynchronously from Order Service.
|
*/

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}/check-stock', [ProductController::class, 'checkStock']);
