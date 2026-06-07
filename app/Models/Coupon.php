<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'discount_type', 'discount_value', 'starts_at', 'expires_at', 'active'];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'active' => 'boolean',
        'discount_value' => 'decimal:2',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function isValid(): bool
    {
        if (!$this->active) {
            return false;
        }

        $now = now();
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
