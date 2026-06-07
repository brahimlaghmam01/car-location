<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Brand;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Category;
use App\Models\City;
use App\Models\Payment;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Get SaaS Dashboard Analytics Stats
     */
    public function stats(Request $request): JsonResponse
    {
        // Check permissions
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $totalUsers = User::count();
        $totalCars = Car::count();
        $activeRentals = Booking::where('status', 'confirmed')
            ->where('pickup_date', '<=', now())
            ->where('return_date', '>=', now())
            ->count();
            
        $revenue = Payment::where('status', 'completed')->sum('amount');
        
        // Calculate Occupancy Rate
        $occupancyRate = 0;
        if ($totalCars > 0) {
            $occupancyRate = round(($activeRentals / $totalCars) * 100, 1);
        }

        return response()->json([
            'total_users' => $totalUsers,
            'total_cars' => $totalCars,
            'active_rentals' => $activeRentals,
            'revenue' => $revenue,
            'occupancy_rate' => $occupancyRate,
        ]);
    }

    /**
     * Get SaaS Charts Analytics
     */
    public function charts(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // 1. Monthly Revenue (Last 6 Months)
        $revenueData = Payment::select(
            DB::raw('SUM(amount) as total'),
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month")
        )
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('created_at', 'asc')
        ->get();

        // 2. Monthly Bookings Count (Last 6 Months)
        $bookingData = Booking::select(
            DB::raw('COUNT(*) as total'),
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month")
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('created_at', 'asc')
        ->get();

        // 3. Most Popular Cars (Top 5)
        $popularCars = Car::select('cars.id', 'cars.name', 'brands.name as brand_name')
            ->join('brands', 'cars.brand_id', '=', 'brands.id')
            ->withCount('bookings')
            ->orderBy('bookings_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($car) {
                // Calculate total revenue for this car
                $rev = Booking::where('car_id', $car->id)
                    ->whereHas('payments', function ($q) {
                        $q->where('status', 'completed');
                    })
                    ->sum('total_price');

                return [
                    'id' => $car->id,
                    'name' => $car->brand_name . ' ' . $car->name,
                    'bookings_count' => $car->bookings_count,
                    'revenue' => $rev,
                ];
            });

        return response()->json([
            'revenue_chart' => $revenueData,
            'booking_chart' => $bookingData,
            'popular_cars' => $popularCars,
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /*                               CAR MANAGEMENT                               */
    /* -------------------------------------------------------------------------- */

    public function carsIndex(Request $request): JsonResponse
    {
        if (!$request->user()->isManager()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $cars = Car::with(['brand', 'category', 'primaryImage'])->get();
        return response()->json($cars);
    }

    public function carStore(Request $request): JsonResponse
    {
        if (!$request->user()->isManager()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price_per_day' => 'required|numeric|min:0',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1',
            'description_en' => 'required|string',
            'description_fr' => 'required|string',
            'description_ar' => 'required|string',
            'features' => 'nullable|array',
            'specifications' => 'nullable|array',
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $brand = Brand::findOrFail($request->brand_id);
        $slug = Str::slug($brand->name . ' ' . $request->name);
        
        // Ensure slug is unique
        $originalSlug = $slug;
        $count = 1;
        while (Car::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        $car = Car::create([
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $slug,
            'price_per_day' => $request->price_per_day,
            'fuel_type' => $request->fuel_type,
            'transmission' => $request->transmission,
            'seats' => $request->seats,
            'description_en' => $request->description_en,
            'description_fr' => $request->description_fr,
            'description_ar' => $request->description_ar,
            'features' => $request->features ?? [],
            'specifications' => $request->specifications ?? [],
            'is_available' => true,
        ]);

        // Upload and link multiple images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $filename = time() . '_car_' . $car->id . '_' . $index . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/cars'), $filename);
                
                CarImage::create([
                    'car_id' => $car->id,
                    'image_path' => '/uploads/cars/' . $filename,
                    'is_primary' => ($index === 0),
                ]);
            }
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Car Created',
            'description' => "Created new car listing: {$brand->name} {$car->name}.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Car created successfully.', 'car' => $car], 201);
    }

    public function carUpdate(int $id, Request $request): JsonResponse
    {
        if (!$request->user()->isManager()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $car = Car::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price_per_day' => 'required|numeric|min:0',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1',
            'description_en' => 'required|string',
            'description_fr' => 'required|string',
            'description_ar' => 'required|string',
            'features' => 'nullable|array',
            'specifications' => 'nullable|array',
            'is_available' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $car->update([
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'price_per_day' => $request->price_per_day,
            'fuel_type' => $request->fuel_type,
            'transmission' => $request->transmission,
            'seats' => $request->seats,
            'description_en' => $request->description_en,
            'description_fr' => $request->description_fr,
            'description_ar' => $request->description_ar,
            'features' => $request->features ?? [],
            'specifications' => $request->specifications ?? [],
            'is_available' => $request->is_available,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Car Updated',
            'description' => "Updated details for car ID: {$car->id}.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Car updated successfully.', 'car' => $car]);
    }

    public function carDestroy(int $id, Request $request): JsonResponse
    {
        if (!$request->user()->isManager()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $car = Car::findOrFail($id);

        // Delete associated files
        $images = $car->images;
        foreach ($images as $img) {
            if (str_starts_with($img->image_path, '/uploads/cars/')) {
                $filePath = public_path(substr($img->image_path, 1));
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }
        }

        $car->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Car Deleted',
            'description' => "Deleted car listing: {$car->name} (ID: {$id}).",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Car deleted successfully.']);
    }

    /* -------------------------------------------------------------------------- */
    /*                             BOOKING MANAGEMENT                             */
    /* -------------------------------------------------------------------------- */

    public function bookingsIndex(Request $request): JsonResponse
    {
        if (!$request->user()->isManager()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $bookings = Booking::with(['user', 'car.brand', 'pickupCity', 'returnCity', 'payments'])->get();
        return response()->json($bookings);
    }

    public function bookingUpdateStatus(int $id, Request $request): JsonResponse
    {
        if (!$request->user()->isManager()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $booking->status = $request->status;
        $booking->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Booking Status Updated',
            'description' => "Updated Booking #{$booking->id} status from {$oldStatus} to {$booking->status}.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Booking status updated successfully.', 'booking' => $booking]);
    }

    /* -------------------------------------------------------------------------- */
    /*                               USER MANAGEMENT                              */
    /* -------------------------------------------------------------------------- */

    public function usersIndex(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $users = User::with('role')->get();
        return response()->json($users);
    }

    public function userUpdateRole(int $id, Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized. Super Admin permissions required.'], 403);
        }

        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::findOrFail($id);
        $user->role_id = $request->role_id;
        $user->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'User Role Updated',
            'description' => "Updated role for user: {$user->email} (ID: {$id}).",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'User role updated successfully.', 'user' => $user->load('role')]);
    }
}
