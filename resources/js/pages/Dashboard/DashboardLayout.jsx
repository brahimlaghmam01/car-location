import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(res => setUser(res.data))
            .catch(() => navigate('/login'));
    }, [navigate]);

    if (!user) return <div className="p-20 text-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-4">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                            <img src={user.avatar || '/default-avatar.png'} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-[#FF7A00]" />
                            <h2 className="font-bold text-lg">{user.name}</h2>
                            <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        
                        <nav className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-2">
                            <Link to="/dashboard" className="block px-4 py-2 hover:bg-white/10 rounded-xl">{t('dashboard_overview')}</Link>
                            <Link to="/dashboard/bookings" className="block px-4 py-2 hover:bg-white/10 rounded-xl">{t('dashboard_bookings')}</Link>
                            <Link to="/dashboard/profile" className="block px-4 py-2 hover:bg-white/10 rounded-xl">{t('dashboard_profile')}</Link>
                            <Link to="/dashboard/wishlist" className="block px-4 py-2 hover:bg-white/10 rounded-xl">{t('dashboard_wishlist')}</Link>
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 bg-white/5 border border-white/10 p-8 rounded-3xl">
                        <Outlet context={{ user, setUser }} />
                    </main>
                </div>
            </div>
        </div>
    );
}
