import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function AdminStats() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        axios.get('/api/admin/stats')
            .then(res => setStats(res.data));
    }, []);

    if (!stats) return <div className="text-white">Loading Stats...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">{t('admin_stats')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('total_users')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">{stats.users_count}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('total_cars')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">{stats.cars_count}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('total_bookings')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">{stats.bookings_count}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('total_revenue')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">${stats.revenue}</p>
                </div>
            </div>
        </div>
    );
}
