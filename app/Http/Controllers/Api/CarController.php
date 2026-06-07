<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Car;
use App\Models\Category;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Get a list of cars with advanced filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Car::with(['brand', 'category', 'primaryImage']);

        // Filter by availability status
        $query->where('is_available', true);

        // Filter by Brand
        if ($request->filled('brand')) {
            $brandSlugs = explode(',', $request->brand);
            $query->whereHas('brand', function ($q) use ($brandSlugs) {
                $q->whereIn('slug', $brandSlugs);
            });
        }

        // Filter by Category
        if ($request->filled('category')) {
            $categorySlugs = explode(',', $request->category);
            $query->whereHas('category', function ($q) use ($categorySlugs) {
                $q->whereIn('slug', $categorySlugs);
            });
        }

        // Filter by Transmission
        if ($request->filled('transmission')) {
            $transmissions = explode(',', $request->transmission);
            $query->whereIn('transmission', $transmissions);
        }

        // Filter by Fuel Type
        if ($request->filled('fuel_type')) {
            $fuels = explode(',', $request->fuel_type);
            $query->whereIn('fuel_type', $fuels);
        }

        // Filter by Seats
        if ($request->filled('seats')) {
            $seats = explode(',', $request->seats);
            $query->whereIn('seats', $seats);
        }

        // Filter by Price Range
        if ($request->filled('min_price')) {
            $query->where('price_per_day', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price_per_day', '<=', $request->max_price);
        }

        // Search Query (Brand Name or Car Name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('brand', function ($b) use ($search) {
                      $b->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Date Availability Filtering
        if ($request->filled('pickup_date') && $request->filled('return_date')) {
            $pickup = $request->pickup_date;
            $return = $request->return_date;
            
            $query->whereDoesntHave('bookings', function ($q) use ($pickup, $return) {
                $q->whereIn('status', ['pending', 'confirmed'])
                  ->where(function ($b) use ($pickup, $return) {
                      $b->whereBetween('pickup_date', [$pickup, $return])
                        ->orWhereBetween('return_date', [$pickup, $return])
                        ->orWhere(function ($inner) use ($pickup, $return) {
                            $inner->where('pickup_date', '<=', $pickup)
                                  ->where('return_date', '>=', $return);
                        });
                  });
            });
        }

        // Sort Options
        $sortBy = $request->get('sort_by', 'featured');
        if ($sortBy === 'price_low') {
            $query->orderBy('price_per_day', 'asc');
        } elseif ($sortBy === 'price_high') {
            $query->orderBy('price_per_day', 'desc');
        } elseif ($sortBy === 'rating') {
            $query->orderBy('rating', 'desc');
        } else {
            $query->orderBy('rating', 'desc'); // Featured
        }

        $cars = $query->paginate(12);

        return response()->json($cars);
    }

    /**
     * Get single car details
     */
    public function show(string $slug): JsonResponse
    {
        $car = Car::with([
            'brand', 
            'category', 
            'images', 
            'reviews.user' => function($q) {
                $q->select('id', 'name', 'avatar');
            }
        ])->where('slug', $slug)->firstOrFail();

        // Retrieve booked dates to help build the availability calendar
        $bookedDates = $car->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('return_date', '>=', now())
            ->get(['pickup_date', 'return_date'])
            ->map(function ($booking) {
                return [
                    'start' => $booking->pickup_date->toDateString(),
                    'end' => $booking->return_date->toDateString(),
                ];
            });

        return response()->json([
            'car' => $car,
            'booked_dates' => $bookedDates,
        ]);
    }

    /**
     * Get similar cars
     */
    public function similar(string $slug): JsonResponse
    {
        $car = Car::where('slug', $slug)->firstOrFail();

        $similarCars = Car::with(['brand', 'category', 'primaryImage'])
            ->where('id', '!=', $car->id)
            ->where(function ($q) use ($car) {
                $q->where('category_id', $car->category_id)
                  ->orWhereBetween('price_per_day', [$car->price_per_day * 0.7, $car->price_per_day * 1.3]);
            })
            ->where('is_available', true)
            ->limit(4)
            ->get();

        return response()->json($similarCars);
    }

    /**
     * Compare multiple vehicles
     */
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:2|max:3',
            'ids.*' => 'integer|exists:cars,id',
        ]);

        $cars = Car::with(['brand', 'category', 'primaryImage'])
            ->whereIn('id', $request->ids)
            ->get();

        return response()->json($cars);
    }

    /**
     * Get all Brands
     */
    public function brands(): JsonResponse
    {
        return response()->json(Brand::all());
    }

    /**
     * Get all Categories
     */
    public function categories(): JsonResponse
    {
        return response()->json(Category::all());
    }

    /**
     * Get all Cities
     */
    public function cities(): JsonResponse
    {
        return response()->json(City::all());
    }
}
