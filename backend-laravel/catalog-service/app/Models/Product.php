<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The database connection that should be used by the model.
     * Database-per-service pattern: db_catalog
     */
    protected $connection = 'mysql_catalog';

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'category',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];
}
