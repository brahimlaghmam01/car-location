<?php

use Illuminate\Support\Facades\Route;

// Redirect all web traffic to the React SPA except for API endpoints and print invoices
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|payments/invoice).*$');
