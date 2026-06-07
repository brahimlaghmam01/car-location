import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function SearchWidget() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    // Form fields state
    const [pickupCity, setPickupCity] = useState('');
    const [returnCity, setReturnCity] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [category, setCategory] = useState('');

    // API list data states
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);

    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        // Fetch Cities and Categories
        axios.get('/api/cars/cities')
            .then(res => setCities(res.data))
            .catch(() => setCities([
                { id: 1, name_en: 'Casablanca', name_fr: 'Casablanca', name_ar: 'الدار البيضاء' },
                { id: 2, name_en: 'Marrakech', name_fr: 'Marrakech', name_ar: 'مراكش' },
                { id: 3, name_en: 'Rabat', name_fr: 'Rabat', name_ar: 'الرباط' },
                { id: 4, name_en: 'Tangier', name_fr: 'Tanger', name_ar: 'طنجة' }
            ]));

        axios.get('/api/cars/categories')
            .then(res => setCategories(res.data))
            .catch(() => setCategories([
                { id: 1, name_en: 'Hypercar', slug: 'hypercar' },
                { id: 2, name_en: 'SUV', slug: 'suv' },
                { id: 3, name_en: 'Coupe', slug: 'coupe' },
                { id: 4, name_en: 'Convertible', slug: 'convertible' }
            ]));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        
        // Build query string
        const params = new URLSearchParams();
        if (pickupCity) params.append('pickup_city_id', pickupCity);
        if (returnCity) params.append('return_city_id', returnCity);
        if (pickupDate) params.append('pickup_date', pickupDate);
        if (returnDate) params.append('return_date', returnDate);
        if (category) params.append('category', category);

        navigate(`/explore?${params.toString()}`);
    };

    const getCityName = (city) => {
        if (i18n.language === 'ar') return city.name_ar;
        if (i18n.language === 'fr') return city.name_fr;
        return city.name_en;
    };

    const getCategoryName = (cat) => {
        if (i18n.language === 'ar') return cat.name_ar || cat.name_en;
        if (i18n.language === 'fr') return cat.name_fr || cat.name_en;
        return cat.name_en;
    };

    return (
        <div className="w-full max-w-6xl mx-auto bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative z-20 -mt-16 md:-mt-24">
            <h2 className="text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#FF7A00] rounded-full"></span>
                <span>{t('search_title')}</span>
            </h2>
            
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                
                {/* Pickup City */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                        {t('pickup_city')}
                    </label>
                    <select
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                        required
                    >
                        <option value="" className="bg-black text-white">Select City</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id} className="bg-black text-white">
                                {getCityName(city)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Return City */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                        {t('return_city')}
                    </label>
                    <select
                        value={returnCity}
                        onChange={(e) => setReturnCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                        required
                    >
                        <option value="" className="bg-black text-white">Select City</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id} className="bg-black text-white">
                                {getCityName(city)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pickup Date */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                        {t('pickup_date')}
                    </label>
                    <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                        required
                    />
                </div>

                {/* Return Date */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                        {t('return_date')}
                    </label>
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                        required
                    />
                </div>

                {/* Vehicle Category */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">
                        {t('category')}
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                    >
                        <option value="" className="bg-black text-white">{t('all_categories')}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug} className="bg-black text-white">
                                {getCategoryName(cat)}
                            </option>
                        ))}
                    </select>
                </div>

            </form>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSearch}
                    className="bg-[#FF7A00] hover:bg-[#E06B00] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/40 transform hover:-translate-y-0.5 transition duration-200 flex items-center space-x-2"
                >
                    <span>{t('search')}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
            </div>
        </div>
    );
}
