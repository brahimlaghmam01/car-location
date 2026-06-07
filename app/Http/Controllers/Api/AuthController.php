<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get default customer role
        $customerRole = Role::where('slug', 'customer')->first();
        if (!$customerRole) {
            return response()->json(['error' => 'Default user role not configured.'], 500);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $customerRole->id,
            'phone' => $request->phone,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Register',
            'description' => 'User registered a new account.',
            'ip_address' => $request->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * User Login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Login',
            'description' => 'User logged in successfully.',
            'ip_address' => $request->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * User Logout
     */
    public function logout(Request $request): JsonResponse
    {
        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Logout',
            'description' => 'User logged out.',
            'ip_address' => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('role'));
    }

    /**
     * Forgot Password Mock
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'If this email exists, a password reset link has been sent.'], 200);
        }

        // Mock password reset link
        return response()->json([
            'message' => 'Password reset link sent successfully (Mocked)',
            'reset_token' => Str::random(60),
            'email' => $request->email,
        ]);
    }

    /**
     * Reset Password Mock
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid email or token'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Password Reset',
            'description' => 'User reset their password.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    /**
     * Verify Email Mock
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json(['message' => 'Email verified successfully.']);
    }
}
