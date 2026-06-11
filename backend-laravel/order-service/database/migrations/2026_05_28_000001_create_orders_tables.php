<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Provisions 'db_orders' with users, orders, and item relations.
     */
    public function up(): void
    {
        Schema::connection('mysql_orders')->create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamps();
        });

        Schema::connection('mysql_orders')->create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('preparing'); // preparing, takeoff, en_route, delivered
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 10, 2); // IGV 18%
            $table->decimal('total_amount', 10, 2);
            $table->string('shipping_address');
            $table->string('reference_district');
            $table->string('phone');
            $table->string('payment_method'); // card, yape, plin
            $table->string('transaction_id')->nullable(); // MercadoPago ticket id or token
            $table->timestamps();
        });

        Schema::connection('mysql_orders')->create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->unsignedBigInteger('product_id_reference'); // Loose link to Catalog Service
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql_orders')->dropIfExists('order_items');
        Schema::connection('mysql_orders')->dropIfExists('orders');
        Schema::connection('mysql_orders')->dropIfExists('users');
    }
};
