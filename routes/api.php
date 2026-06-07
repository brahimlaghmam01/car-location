<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RecommendationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ================= PUBLIC ROUTES =================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::prefix('cars')->group(function () {
    Route::get('/', [CarController::class, 'index']);
    Route::get('/brands', [CarController::class, 'brands']);
    Route::get('/categories', [CarController::class, 'categories']);
    Route::get('/cities', [CarController::class, 'cities']);
    Route::post('/compare', [CarController::class, 'compare']);
    Route::get('/similar/{slug}', [CarController::class, 'similar']);
    Route::get('/{slug}', [CarController::class, 'show']);
});

Route::post('/recommend', [RecommendationController::class, 'recommend']);

// Public invoice preview (for printable receipt)
Route::get('/payments/invoice/{invoiceNumber}/view', [PaymentController::class, 'viewInvoice']);


// ================= PROTECTED ROUTES =================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Actions
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    });

    // Bookings Actions
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'index']);
        Route::post('/', [BookingController::class, 'store']);
        Route::post('/apply-coupon', [BookingController::class, 'applyCoupon']);
        Route::get('/{id}', [BookingController::class, 'show']);
        Route::post('/{id}/cancel', [BookingController::class, 'cancel']);
    });

    // Payment Processing
    Route::post('/payments/process', [PaymentController::class, 'process']);

    // Dashboard Actions
    Route::prefix('dashboard')->group(function () {
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::put('/profile', [DashboardController::class, 'updateProfile']);
        Route::put('/password', [DashboardController::class, 'updatePassword']);
        Route::post('/upload-avatar', [DashboardController::class, 'uploadAvatar']);
        Route::post('/upload-license', [DashboardController::class, 'uploadLicense']);
        Route::get('/wishlist', [DashboardController::class, 'getWishlist']);
        Route::post('/wishlist/toggle', [DashboardController::class, 'toggleWishlist']);
        Route::get('/notifications', [DashboardController::class, 'notifications']);
    });

    // Admin / Manager SaaS Panel Actions
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/charts', [AdminController::class, 'charts']);
        
        // Car Listings CRUD
        Route::get('/cars', [AdminController::class, 'carsIndex']);
        Route::post('/cars', [AdminController::class, 'carStore']);
        Route::put('/cars/{id}', [AdminController::class, 'carUpdate']);
        Route::delete('/cars/{id}', [AdminController::class, 'carDestroy']);
        
        // Bookings Operations
        Route::get('/bookings', [AdminController::class, 'bookingsIndex']);
        Route::put('/bookings/{id}/status', [AdminController::class, 'bookingUpdateStatus']);
        
        // Users Management
        Route::get('/users', [AdminController::class, 'usersIndex']);
        Route::put('/users/{id}/role', [AdminController::class, 'userUpdateRole']);
    });
});
