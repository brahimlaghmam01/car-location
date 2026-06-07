import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Compare from './pages/Compare';
import CarDetails from './pages/CarDetails';
import AIQuiz from './pages/AIQuiz';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import DashboardBookings from './pages/Dashboard/DashboardBookings';
import DashboardProfile from './pages/Dashboard/DashboardProfile';
import DashboardWishlist from './pages/Dashboard/DashboardWishlist';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminStats from './pages/Admin/AdminStats';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const AppRoutes = () => (
    <BrowserRouter>
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/cars/:slug" element={<CarDetails />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/recommend" element={<AIQuiz />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardOverview />} />
                    <Route path="bookings" element={<DashboardBookings />} />
                    <Route path="profile" element={<DashboardProfile />} />
                    <Route path="wishlist" element={<DashboardWishlist />} />
                </Route>

                {/* Admin */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminStats />} />
                </Route>

                {/* Auth */}
                <Route
                    path="/login"
                    element={
                        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
                            Login page not implemented
                        </div>
                    }
                />
            </Routes>
        </div>
    </BrowserRouter>
);

const container = document.getElementById('app');
if (!container) {
    console.error('Root container #app not found');
} else {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
}

