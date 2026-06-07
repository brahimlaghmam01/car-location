<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Process checkout payment (Mocking Stripe, PayPal, CMI)
     */
    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_method' => 'required|in:stripe,paypal,cmi',
            'card_name' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        if ($booking->status === 'confirmed') {
            return response()->json(['message' => 'Booking is already paid and confirmed.'], 400);
        }

        // Mock payment verification (usually checks Stripe/PayPal intent status)
        $transactionId = 'TXN_' . strtoupper($request->payment_method) . '_' . Str::random(10);
        
        // 1. Create payment record
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'payment_method' => $request->payment_method,
            'transaction_id' => $transactionId,
            'status' => 'completed',
        ]);

        // 2. Confirm booking
        $booking->status = 'confirmed';
        $booking->save();

        // 3. Increment loyalty points for customer
        $user = $booking->user;
        if ($user) {
            // Earn 1 point per 100 MAD spent
            $pointsEarned = floor($booking->total_price / 100);
            $user->loyalty_points += $pointsEarned;
            $user->save();
        }

        // 4. Generate Invoice entry
        $invoiceNumber = 'INV-' . date('Ymd') . '-' . sprintf('%04d', $booking->id);
        $invoice = Invoice::create([
            'booking_id' => $booking->id,
            'invoice_number' => $invoiceNumber,
            'pdf_path' => "/api/payments/invoice/{$invoiceNumber}/view",
        ]);

        // 5. Log activity
        ActivityLog::create([
            'user_id' => $booking->user_id,
            'action' => 'Payment Processed',
            'description' => "Processed payment of {$booking->total_price} MAD via " . strtoupper($request->payment_method) . ". Invoice: {$invoiceNumber}.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Payment processed successfully.',
            'payment' => $payment,
            'invoice_number' => $invoiceNumber,
            'loyalty_points_earned' => $pointsEarned ?? 0,
        ], 200);
    }

    /**
     * Display a premium printable Invoice (Web/HTML format)
     */
    public function viewInvoice(string $invoiceNumber)
    {
        $invoice = Invoice::with(['booking.user', 'booking.car.brand', 'booking.pickupCity', 'booking.returnCity'])
            ->where('invoice_number', $invoiceNumber)
            ->firstOrFail();

        $booking = $invoice->booking;
        $car = $booking->car;
        $user = $booking->user;

        // Return a beautiful, clean printable HTML view of the invoice
        return response()->view('invoice', compact('invoice', 'booking', 'car', 'user'));
    }
}
