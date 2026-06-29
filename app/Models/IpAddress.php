<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IpAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'name',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}