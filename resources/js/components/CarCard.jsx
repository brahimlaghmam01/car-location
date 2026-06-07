import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function CarCard({ car, onWishlistToggle = null, isWishlisted = false }) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [wishActive, setWishActive] = useState(isWishlisted);
    const [wishLoading, setWishLoading] = useState(false);

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        setWishLoading(true);
        try {
            const res = await axios.post('/api/dashboard/wishlist/toggle', { car_id: car.id });
            setWishActive(res.data.status === 'added');
            if (onWishlistToggle) {
                onWishlistToggle(car.id, res.data.status === 'added');
            }
        } catch (err) {
            console.error('Wishlist toggle error', err);
        } finally {
            setWishLoading(false);
        }
    };

    const isRtl = i18n.language === 'ar';

    return (
        <div className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF7A00]/5 flex flex-col justify-between h-full">
            
            {/* Image Container with Zoom & Badge */}
            <div className="relative overflow-hidden aspect-[16/10]">
                <img
                    src={car.primary_image?.image_path || car.image_path || (car.images && car.images[0]?.image_path) || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600'}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    loading="lazy"
                />
                
                {/* Brand Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/10">
                    {car.brand?.name}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    disabled={wishLoading}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-[#FF7A00] transition duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={wishActive ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className={`w-5 h-5 ${wishActive ? 'text-[#FF7A00] fill-[#FF7A00]' : 'text-gray-300'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </button>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                
                <div className="space-y-2">
                    {/* Title & Rating */}
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white tracking-wide truncate pr-2">
                            {car.brand?.name} {car.name}
                        </h3>
                        <div className="flex items-center space-x-1 shrink-0 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg text-xs font-bold text-yellow-500">
                            <span>★</span>
                            <span className="text-white">{parseFloat(car.rating || 5.0).toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-extrabold text-[#FF7A00]">
                            {parseInt(car.price_per_day)}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            MAD / {t('specs_price')}
                        </span>
                    </div>
                </div>

                {/* Specs Badges */}
                <div className="grid grid-cols-3 gap-3 border-t border-b border-white/5 py-4 text-xs font-semibold text-gray-400">
                    <div className="flex flex-col items-center space-y-1 bg-white/5 rounded-2xl py-2 px-1 text-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Trans</span>
                        <span className="text-white truncate max-w-full">{car.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1 bg-white/5 rounded-2xl py-2 px-1 text-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Fuel</span>
                        <span className="text-white truncate max-w-full">{car.fuel_type}</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1 bg-white/5 rounded-2xl py-2 px-1 text-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Seats</span>
                        <span className="text-white">{car.seats} Seats</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                    <Link
                        to={`/cars/${car.slug}`}
                        className="w-full text-center block bg-white/10 hover:bg-[#FF7A00] text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs border border-white/10 hover:border-transparent transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
                    >
                        {t('book_now')}
                    </Link>
                </div>
            </div>

        </div>
    );
}
