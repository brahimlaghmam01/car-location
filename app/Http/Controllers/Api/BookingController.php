<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Coupon;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Get user bookings (History)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookings = Booking::with(['car.brand', 'car.primaryImage', 'pickupCity', 'returnCity'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Create a booking (Checkout initiation)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'car_id' => 'required|exists:cars,id',
            'pickup_city_id' => 'required|exists:cities,id',
            'return_city_id' => 'required|exists:cities,id',
            'pickup_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:pickup_date',
            'coupon_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $car = Car::findOrFail($request->car_id);

        if (!$car->is_available) {
            return response()->json(['message' => 'This car is currently not active for rent.'], 400);
        }

        $pickup = Carbon::parse($request->pickup_date);
        $return = Carbon::parse($request->return_date);

        // 1. Verify availability overlapping
        $overlap = Booking::where('car_id', $car->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($pickup, $return) {
                $q->whereBetween('pickup_date', [$pickup, $return])
                  ->orWhereBetween('return_date', [$pickup, $return])
                  ->orWhere(function ($inner) use ($pickup, $return) {
                      $inner->where('pickup_date', '<=', $pickup)
                            ->where('return_date', '>=', $return);
                  });
            })->exists();

        if ($overlap) {
            return response()->json(['message' => 'This vehicle is already booked for the selected dates.'], 400);
        }

        // 2. Calculate Pricing
        $days = max(1, $pickup->diffInDays($return));
        $subtotal = $car->price_per_day * $days;
        $total = $subtotal;
        $couponId = null;

        // 3. Handle Coupon
        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $couponId = $coupon->id;
                if ($coupon->discount_type === 'percent') {
                    $total = $subtotal - ($subtotal * ($coupon->discount_value / 100));
                } else {
                    $total = max(0, $subtotal - $coupon->discount_value);
                }
            } else {
                return response()->json(['message' => 'Invalid or expired coupon code.'], 400);
            }
        }

        // 4. Create Booking
        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'car_id' => $car->id,
            'pickup_city_id' => $request->pickup_city_id,
            'return_city_id' => $request->return_city_id,
            'pickup_date' => $pickup,
            'return_date' => $return,
            'total_price' => $total,
            'status' => 'pending',
            'coupon_id' => $couponId,
        ]);

        // Log Activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Booking Created',
            'description' => "Booking #{$booking->id} created for car: {$car->name}. Total Price: {$total} MAD.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Booking created successfully.',
            'booking' => $booking->load(['car.brand', 'pickupCity', 'returnCity']),
        ], 201);
    }

    /**
     * Show booking details
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $booking = Booking::with(['car.brand', 'car.primaryImage', 'pickupCity', 'returnCity', 'payments', 'invoice'])
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($booking);
    }

    /**
     * Cancel a booking
     */
    public function cancel(int $id, Request $request): JsonResponse
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking is already cancelled.'], 400);
        }

        if (in_array($booking->status, ['completed'])) {
            return response()->json(['message' => 'Cannot cancel a completed rental.'], 400);
        }

        // Cancel policy: Can cancel if pending, or if confirmed and at least 24 hours before pickup
        if ($booking->status === 'confirmed') {
            $pickupDate = Carbon::parse($booking->pickup_date);
            if ($pickupDate->diffInHours(now(), false) >= -24) {
                return response()->json(['message' => 'Confirmed bookings can only be cancelled at least 24 hours in advance.'], 400);
            }
        }

        $booking->status = 'cancelled';
        $booking->save();

        // Refund loyalty points or perform transaction offsets if needed
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Booking Cancelled',
            'description' => "Booking #{$booking->id} was cancelled by the user.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'booking' => $booking,
        ]);
    }

    /**
     * Check coupon code validity
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'coupon_code' => 'required|string',
            'subtotal' => 'required|numeric',
        ]);

        $coupon = Coupon::where('code', $request->coupon_code)->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['message' => 'Coupon code is invalid or expired.'], 400);
        }

        $discount = 0;
        if ($coupon->discount_type === 'percent') {
            $discount = $request->subtotal * ($coupon->discount_value / 100);
        } else {
            $discount = min($request->subtotal, $coupon->discount_value);
        }

        $total = $request->subtotal - $discount;

        return response()->json([
            'coupon_code' => $coupon->code,
            'discount' => $discount,
            'discount_value' => $coupon->discount_value,
            'discount_type' => $coupon->discount_type,
            'total' => $total,
        ]);
    }
}
