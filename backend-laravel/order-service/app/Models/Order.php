<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    /**
     * Database-per-service pattern: db_orders
     */
    protected $connection = 'mysql_orders';

    protected $fillable = [
        'user_id',
        'status',
        'subtotal',
        'tax_amount', // IGV (18%)
        'total_amount',
        'shipping_address',
        'reference_district',
        'phone',
        'payment_method',
        'transaction_id',
    ];

    /**
     * Order items relationship.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * User/Customer relationship inside the same service db.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
