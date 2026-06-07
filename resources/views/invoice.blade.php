<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1A1A1A;
            background-color: #FFFFFF;
            margin: 0;
            padding: 40px;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #E5E5E5;
            padding: 40px;
            border-radius: 8px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0A0A0A;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #0A0A0A;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .logo span {
            color: #FF7A00;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: 300;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .meta-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .meta-block h3 {
            font-size: 14px;
            text-transform: uppercase;
            color: #777777;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .meta-block p {
            margin: 5px 0;
            font-size: 15px;
            line-height: 1.4;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .table th {
            background-color: #0A0A0A;
            color: #FFFFFF;
            text-align: left;
            padding: 12px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .table td {
            padding: 15px 12px;
            border-bottom: 1px solid #E5E5E5;
            font-size: 15px;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 15px;
        }
        .totals-row.grand-total {
            border-top: 2px solid #0A0A0A;
            font-size: 18px;
            font-weight: 700;
            color: #FF7A00;
            padding-top: 15px;
        }
        .footer {
            margin-top: 60px;
            border-top: 1px solid #E5E5E5;
            padding-top: 20px;
            text-align: center;
            color: #777777;
            font-size: 12px;
            line-height: 1.5;
        }
        .print-btn {
            background-color: #FF7A00;
            color: #FFFFFF;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
            display: inline-block;
        }
        @media print {
            .print-btn {
                display: none;
            }
            body {
                padding: 0;
            }
            .invoice-container {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div style="text-align: right; max-width: 800px; margin: 0 auto;">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
    </div>
    <div class="invoice-container">
        <div class="header">
            <div class="logo">VELOCE<span>.</span></div>
            <div class="invoice-title">Invoice</div>
        </div>

        <div class="meta-section">
            <div class="meta-block">
                <h3>Billed To</h3>
                <p><strong>{{ $user->name }}</strong></p>
                <p>Email: {{ $user->email }}</p>
                <p>Phone: {{ $user->phone ?? 'N/A' }}</p>
            </div>
            <div class="meta-block" style="text-align: right;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> {{ $invoice->invoice_number }}</p>
                <p><strong>Date:</strong> {{ $invoice->created_at->format('M d, Y') }}</p>
                <p><strong>Payment Method:</strong> {{ strtoupper($booking->payments->first()->payment_method ?? 'N/A') }}</p>
                <p><strong>Transaction ID:</strong> {{ $booking->payments->first()->transaction_id ?? 'N/A' }}</p>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Rental Period</th>
                    <th>Rate</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>{{ $car->brand->name }} {{ $car->name }}</strong><br>
                        <span style="font-size: 13px; color: #777777;">
                            Transmission: {{ $car->transmission }} | Fuel: {{ $car->fuel_type }}
                        </span>
                    </td>
                    <td>
                        {{ $booking->pickup_date->format('M d, Y') }} to {{ $booking->return_date->format('M d, Y') }}<br>
                        <span style="font-size: 13px; color: #777777;">
                            Pickup: {{ $booking->pickupCity->name_en }} | Return: {{ $booking->returnCity->name_en }}
                        </span>
                    </td>
                    <td>{{ number_format($car->price_per_day, 2) }} MAD / Day</td>
                    <td style="text-align: right;">
                        @php
                            $days = max(1, $booking->pickup_date->diffInDays($booking->return_date));
                            $subtotal = $car->price_per_day * $days;
                        @endphp
                        {{ number_format($subtotal, 2) }} MAD
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal</span>
                <span>{{ number_format($subtotal, 2) }} MAD</span>
            </div>
            @if($booking->coupon)
                <div class="totals-row" style="color: #4CAF50;">
                    <span>Coupon ({{ $booking->coupon->code }})</span>
                    <span>
                        @if($booking->coupon->discount_type === 'percent')
                            -{{ $booking->coupon->discount_value }}%
                        @else
                            -{{ number_format($booking->coupon->discount_value, 2) }} MAD
                        @endif
                    </span>
                </div>
            @endif
            <div class="totals-row grand-total">
                <span>Total Paid</span>
                <span>{{ number_format($booking->total_price, 2) }} MAD</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing Veloce Luxury Rentals.</p>
            <p>If you have any questions about this invoice, please contact us at support@veloce-luxury.com.</p>
            <p>Veloce Luxury Rentals - Boulevard d'Anfa, Casablanca, Morocco</p>
        </div>
    </div>
</body>
</html>
