<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Database-per-service pattern: db_orders
     */
    protected $connection = 'mysql_orders';

    protected $fillable = [
        'name',
        'email',
    ];
}
