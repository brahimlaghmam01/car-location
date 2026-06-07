<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['name_en', 'name_fr', 'name_ar'];

    public function pickupBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'pickup_city_id');
    }

    public function returnBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'return_city_id');
    }
}
