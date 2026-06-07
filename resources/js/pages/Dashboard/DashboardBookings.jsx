import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function DashboardBookings() {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        axios.get('/api/bookings')
            .then(res => setBookings(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('dashboard_bookings')}</h1>
            
            <div className="space-y-4">
                {bookings.map(booking => (
                    <div key={booking.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{booking.car.name}</h3>
                            <p className="text-sm text-gray-400">{booking.pickup_date} - {booking.return_date}</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {booking.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
