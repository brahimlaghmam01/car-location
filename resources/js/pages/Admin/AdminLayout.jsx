import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        // Verify admin access
        axios.get('/api/auth/me')
            .then(res => {
                if (!res.data.role || !['super-admin', 'admin'].includes(res.data.role.slug)) {
                    navigate('/');
                }
                setAdmin(res.data);
            })
            .catch(() => navigate('/login'));
    }, [navigate]);

    if (!admin) return <div className="p-20 text-center text-white">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 p-6 flex flex-col">
                <h1 className="text-xl font-bold text-[#FF7A00] mb-10">ADMIN PANEL</h1>
                <nav className="space-y-4 flex-1">
                    <Link to="/admin" className="block p-3 hover:bg-white/5 rounded-xl">{t('admin_stats')}</Link>
                    <Link to="/admin/cars" className="block p-3 hover:bg-white/5 rounded-xl">{t('admin_cars')}</Link>
                    <Link to="/admin/bookings" className="block p-3 hover:bg-white/5 rounded-xl">{t('admin_bookings')}</Link>
                    <Link to="/admin/users" className="block p-3 hover:bg-white/5 rounded-xl">{t('admin_users')}</Link>
                </nav>
            </aside>

            {/* Admin Content */}
            <main className="flex-1 p-8">
                <Outlet context={{ admin }} />
            </main>
        </div>
    );
}
