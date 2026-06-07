import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import DashboardBookings from './pages/Dashboard/DashboardBookings';
import DashboardProfile from './pages/Dashboard/DashboardProfile';
import DashboardWishlist from './pages/Dashboard/DashboardWishlist';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminStats from './pages/Admin/AdminStats';

console.log('App component mounting');
const App = () => (
    <div style={{color: 'white', padding: '100px', fontSize: '50px'}}>TEST RENDER</div>
);

const container = document.getElementById('app');
console.log('Container found:', !!container);
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
