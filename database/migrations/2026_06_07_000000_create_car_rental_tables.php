<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Cities
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_fr');
            $table->string('name_ar');
            $table->timestamps();
        });

        // 2. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_fr');
            $table->string('name_ar');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // 3. Brands
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        // 4. Cars
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price_per_day', 10, 2);
            $table->string('fuel_type'); // Gasoline, Diesel, Electric, Hybrid
            $table->string('transmission'); // Automatic, Manual
            $table->integer('seats');
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->boolean('is_available')->default(true);
            $table->text('description_en');
            $table->text('description_fr');
            $table->text('description_ar');
            $table->json('features')->nullable(); // JSON array of features
            $table->json('specifications')->nullable(); // JSON key-value of specs (HP, Top Speed, 0-100 time)
            $table->timestamps();
        });

        // 5. Car Images
        Schema::create('car_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained('cars')->onDelete('cascade');
            $table->string('image_path');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // 6. Coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('discount_type'); // fixed, percent
            $table->decimal('discount_value', 10, 2);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 7. Bookings
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('car_id')->constrained('cars')->onDelete('cascade');
            $table->foreignId('pickup_city_id')->constrained('cities')->onDelete('cascade');
            $table->foreignId('return_city_id')->constrained('cities')->onDelete('cascade');
            $table->dateTime('pickup_date');
            $table->dateTime('return_date');
            $table->decimal('total_price', 10, 2);
            $table->string('status')->default('pending'); // pending, confirmed, completed, cancelled
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->onDelete('set null');
            $table->timestamps();
        });

        // 8. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method'); // stripe, paypal, cmi
            $table->string('transaction_id')->nullable();
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->timestamps();
        });

        // 9. Reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('car_id')->constrained('cars')->onDelete('cascade');
            $table->integer('rating');
            $table->text('comment');
            $table->timestamps();
        });

        // 10. Wishlists
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('car_id')->constrained('cars')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'car_id']);
        });

        // 11. Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });

        // 12. Activity Logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('action');
            $table->text('description');
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 13. Settings
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // 14. Translations
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale');
            $table->string('group');
            $table->string('key');
            $table->text('value');
            $table->timestamps();
            $table->unique(['locale', 'group', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('car_images');
        Schema::dropIfExists('cars');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('cities');
    }
};
