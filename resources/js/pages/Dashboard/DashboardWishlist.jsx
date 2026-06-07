import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function DashboardWishlist() {
    const { t } = useTranslation();
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        axios.get('/api/dashboard/wishlist')
            .then(res => setWishlist(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('dashboard_wishlist')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlist.map(car => (
                    <div key={car.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                        <img src={car.primary_image?.image_path} alt={car.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
                        <h3 className="font-bold">{car.name}</h3>
                        <p className="text-[#FF7A00] font-bold">${car.price_per_day} / {t('day')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
