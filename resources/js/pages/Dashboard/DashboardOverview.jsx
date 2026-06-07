import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

export default function DashboardOverview() {
    const { t } = useTranslation();
    const { user } = useOutletContext();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        axios.get('/api/dashboard/summary')
            .then(res => setSummary(res.data));
    }, []);

    if (!summary) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">{t('dashboard_overview')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('total_bookings')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">{summary.bookings_count}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('wishlist_items')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">{summary.wishlist_count}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-gray-400 text-sm">{t('loyalty_points')}</p>
                    <p className="text-3xl font-bold text-[#FF7A00]">{user.loyalty_points}</p>
                </div>
            </div>

            {summary.active_rental && (
                <div className="bg-white/10 border border-[#FF7A00]/20 p-6 rounded-3xl">
                    <h3 className="font-bold mb-2">{t('active_rental')}</h3>
                    <p>{summary.active_rental.car.name}</p>
                </div>
            )}
        </div>
    );
}
