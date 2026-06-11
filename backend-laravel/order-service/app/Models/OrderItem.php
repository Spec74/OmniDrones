<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * Database-per-service pattern: db_orders
     */
    protected $connection = 'mysql_orders';

    protected $fillable = [
        'order_id',
        'product_id_reference', // Refers loosely to products.id indb_catalog
        'quantity',
        'price',
    ];

    /**
     * Parent order relationship.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
