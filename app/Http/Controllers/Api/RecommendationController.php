<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    /**
     * Match user preferences with available cars using compatibility scoring
     */
    public function recommend(Request $request): JsonResponse
    {
        $request->validate([
            'budget' => 'required|string|in:standard,premium,exotic', // standard (<500), premium (500-1000), exotic (>1000)
            'purpose' => 'required|string|in:sport,business,family,leisure', // sport (coupe/hypercar), family (suv/sedan), business (sedan)
            'transmission' => 'required|string|in:Automatic,Manual,any',
            'passengers' => 'required|integer|min:1|max:7',
            'power' => 'required|string|in:raw,efficient,hybrid',
        ]);

        $budgetTier = $request->budget;
        $purpose = $request->purpose;
        $prefTransmission = $request->transmission;
        $passengers = $request->passengers;
        $powerPref = $request->power;

        $cars = Car::with(['brand', 'category', 'primaryImage'])
            ->where('is_available', true)
            ->get();

        $recommendations = [];

        foreach ($cars as $car) {
            $score = 0;
            $reasons = [];

            // 1. Budget scoring (Max 25 points)
            $price = $car->price_per_day;
            if ($budgetTier === 'standard' && $price <= 500) {
                $score += 25;
                $reasons[] = 'Fits perfectly in your daily budget.';
            } elseif ($budgetTier === 'premium' && $price > 500 && $price <= 1000) {
                $score += 25;
                $reasons[] = 'Matches your request for hyper-premium luxury.';
            } elseif ($budgetTier === 'exotic' && $price > 1000) {
                $score += 25;
                $reasons[] = 'Uncompromised exotic supercar performance matching your tier.';
            } else {
                // partial score for close tiers
                $score += 10;
            }

            // 2. Purpose / Category scoring (Max 25 points)
            $cat = $car->category->slug;
            if ($purpose === 'sport' && in_array($cat, ['hypercar', 'coupe', 'convertible'])) {
                $score += 25;
                $reasons[] = 'Aerodynamic chassis designed for track-level speed.';
            } elseif ($purpose === 'family' && in_array($cat, ['suv', 'sedan']) && $car->seats >= 4) {
                $score += 25;
                $reasons[] = 'Spacious premium interior suitable for passengers and luggage.';
            } elseif ($purpose === 'business' && in_array($cat, ['sedan', 'coupe'])) {
                $score += 25;
                $reasons[] = 'Elegantly understated executive aesthetic.';
            } elseif ($purpose === 'leisure' && in_array($cat, ['convertible', 'suv', 'hypercar'])) {
                $score += 25;
                $reasons[] = 'Perfect for a scenic, open-top luxury tour of Morocco.';
            } else {
                $score += 8;
            }

            // 3. Transmission matching (Max 15 points)
            if ($prefTransmission === 'any' || $car->transmission === $prefTransmission) {
                $score += 15;
                $reasons[] = "Features your preferred {$car->transmission} transmission.";
            }

            // 4. Passenger capacity (Max 20 points)
            if ($car->seats >= $passengers) {
                $score += 20;
                if ($car->seats === $passengers) {
                    $reasons[] = "Perfect fit for exactly {$passengers} passengers.";
                } else {
                    $reasons[] = "Offers ample seating capacity ({$car->seats} seats) for your party.";
                }
            } else {
                // Major penalty: cannot fit required passengers
                $score -= 30;
            }

            // 5. Power Affinity (Max 15 points)
            $specs = $car->specifications ?? [];
            $hp = isset($specs['Horsepower']) ? intval(filter_var($specs['Horsepower'], FILTER_SANITIZE_NUMBER_INT)) : 0;
            
            if ($powerPref === 'raw') {
                if ($hp >= 600) {
                    $score += 15;
                    $reasons[] = "Vicious {$car->specifications['Engine']} engine generating a massive {$car->specifications['Horsepower']}.";
                } elseif ($hp >= 400) {
                    $score += 10;
                    $reasons[] = "High-performance outputs ({$car->specifications['Horsepower']}).";
                }
            } else {
                // other fuels
                $score += 10;
            }

            // Ensure scores are bound within 0 - 100
            $finalScore = max(0, min(100, $score));

            // Only recommend if score is positive and fits passenger limit
            if ($finalScore >= 40) {
                $recommendations[] = [
                    'car' => $car,
                    'compatibility_score' => $finalScore,
                    'reasons' => array_slice(array_unique($reasons), 0, 3), // Return top 3 reasons
                ];
            }
        }

        // Sort by compatibility score descending
        usort($recommendations, function ($a, $b) {
            return $b['compatibility_score'] <=> $a['compatibility_score'];
        });

        return response()->json(array_slice($recommendations, 0, 3));
    }
}
