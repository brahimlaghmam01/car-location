<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class DashboardController extends Controller
{
    /**
     * Get user dashboard summary data
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookingsCount = $user->bookings()->count();
        $wishlistCount = $user->wishlists()->count();

        // Active booking (if any)
        $activeBooking = $user->bookings()
            ->with(['car.brand', 'pickupCity', 'returnCity'])
            ->whereIn('status', ['confirmed'])
            ->where('pickup_date', '<=', now())
            ->where('return_date', '>=', now())
            ->first();

        return response()->json([
            'user' => $user->load('role'),
            'bookings_count' => $bookingsCount,
            'wishlist_count' => $wishlistCount,
            'active_rental' => $activeBooking,
        ]);
    }

    /**
     * Update profile info
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // Log Activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Profile Updated',
            'description' => 'User updated profile contact details.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->load('role'),
        ]);
    }

    /**
     * Change user password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'The provided password does not match your current password.'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Log Activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Password Changed',
            'description' => 'User changed password.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * Upload user avatar (Direct move to public folder to support local XAMPP environment)
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = time() . '_avatar_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            // Move file directly to public directory to ensure it is immediately accessible
            $file->move(public_path('uploads/avatars'), $filename);
            
            // Delete old avatar if it was local
            if ($user->avatar && str_starts_with($user->avatar, '/uploads/avatars/')) {
                $oldPath = public_path(substr($user->avatar, 1));
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $user->avatar = '/uploads/avatars/' . $filename;
            $user->save();

            return response()->json([
                'message' => 'Avatar uploaded successfully.',
                'avatar_url' => $user->avatar,
            ]);
        }

        return response()->json(['message' => 'No file uploaded.'], 400);
    }

    /**
     * Upload Driving License (Direct move to public folder for easy setup)
     */
    public function uploadLicense(Request $request): JsonResponse
    {
        $request->validate([
            'license' => 'required|file|mimes:pdf,jpeg,png,jpg|max:4096',
        ]);

        $user = $request->user();

        if ($request->hasFile('license')) {
            $file = $request->file('license');
            $filename = time() . '_license_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            $file->move(public_path('uploads/licenses'), $filename);

            if ($user->driving_license && str_starts_with($user->driving_license, '/uploads/licenses/')) {
                $oldPath = public_path(substr($user->driving_license, 1));
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $user->driving_license = '/uploads/licenses/' . $filename;
            $user->save();

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'License Uploaded',
                'description' => 'User uploaded driving license document.',
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Driving license uploaded successfully.',
                'license_url' => $user->driving_license,
            ]);
        }

        return response()->json(['message' => 'No file uploaded.'], 400);
    }

    /**
     * Get user wishlist
     */
    public function getWishlist(Request $request): JsonResponse
    {
        $user = $request->user();
        $wishlists = Wishlist::with(['car.brand', 'car.primaryImage'])
            ->where('user_id', $user->id)
            ->get()
            ->pluck('car'); // Extract the car objects directly

        return response()->json($wishlists);
    }

    /**
     * Toggle car wishlist status
     */
    public function toggleWishlist(Request $request): JsonResponse
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
        ]);

        $user = $request->user();
        $carId = $request->car_id;

        $wish = Wishlist::where('user_id', $user->id)->where('car_id', $carId)->first();

        if ($wish) {
            $wish->delete();
            $status = 'removed';
            $message = 'Car removed from wishlist.';
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'car_id' => $carId,
            ]);
            $status = 'added';
            $message = 'Car added to wishlist.';
        }

        return response()->json([
            'message' => $message,
            'status' => $status,
        ]);
    }

    /**
     * Get user notifications feed (Mocked or real)
     */
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        // We can return a beautiful list of custom structured notifications based on bookings
        $notifications = [
            [
                'id' => 1,
                'title' => 'Welcome to Veloce',
                'message' => 'Welcome to Morocco\'s premium luxury car rental platform. Explore our garage to start your experience.',
                'time' => now()->subDays(2)->diffForHumans(),
                'read' => true,
            ],
            [
                'id' => 2,
                'title' => 'Special Promo Code Available',
                'message' => 'Use code LUXURY20 at checkout to get a 20% discount on any vehicle booking!',
                'time' => now()->subDay()->diffForHumans(),
                'read' => false,
            ]
        ];

        // Add booking specific mock notifications if user has bookings
        $recentBooking = $user->bookings()->first();
        if ($recentBooking) {
            $notifications[] = [
                'id' => 3,
                'title' => 'Booking #' . $recentBooking->id . ' Update',
                'message' => 'Your booking for the ' . $recentBooking->car->name . ' is currently ' . strtoupper($recentBooking->status) . '.',
                'time' => $recentBooking->updated_at->diffForHumans(),
                'read' => false,
            ];
        }

        return response()->json($notifications);
    }
}
