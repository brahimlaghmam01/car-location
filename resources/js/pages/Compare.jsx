import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Compare() {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // List of selected cars to compare
    const [comparedCars, setComparedCars] = useState([]);
    
    // Search suggestions dropdown states
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [allCars, setAllCars] = useState([]);

    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        // Load all available cars for search suggestion lists
        axios.get('/api/cars?per_page=100')
            .then(res => setAllCars(res.data.data))
            .catch(() => {});
        
        // Initial sync from URL search query e.g. ?ids=1,2
        const ids = searchParams.get('ids');
        if (ids) {
            axios.post('/api/cars/compare', { ids: ids.split(',').map(Number) })
                .then(res => setComparedCars(res.data))
                .catch(() => {});
        }
    }, []);

    // Filter suggestions based on input query
    useEffect(() => {
        if (!searchQuery) {
            setSuggestions([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = allCars.filter(car => 
            (car.name.toLowerCase().includes(query) || car.brand?.name.toLowerCase().includes(query)) &&
            !comparedCars.some(comp => comp.id === car.id)
        );
        setSuggestions(filtered.slice(0, 5));
    }, [searchQuery, allCars, comparedCars]);

    const addCarToCompare = (car) => {
        if (comparedCars.length >= 3) {
            alert("You can compare a maximum of 3 vehicles.");
            return;
        }

        const newList = [...comparedCars, car];
        setComparedCars(newList);
        setSearchQuery('');
        setSuggestions([]);

        // Sync to URL
        setSearchParams({ ids: newList.map(c => c.id).join(',') });
    };

    const removeCarFromCompare = (carId) => {
        const newList = comparedCars.filter(c => c.id !== carId);
        setComparedCars(newList);

        if (newList.length === 0) {
            setSearchParams({});
        } else {
            setSearchParams({ ids: newList.map(c => c.id).join(',') });
        }
    };

    // Helper: extract specifications values or return N/A
    const getSpec = (car, specKey) => {
        return car.specifications?.[specKey] || 'N/A';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white bg-[#0A0A0A] min-h-screen space-y-12">
            
            {/* Header Title */}
            <div className={`mb-12 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wide">
                    Vehicle <span className="text-[#FF7A00]">Comparison</span>
                </h1>
                <p className="text-gray-500 text-sm mt-2">Evaluate and match specifications of our exotic collections side-by-side.</p>
            </div>

            {/* Car Search input box */}
            <div className="max-w-xl relative">
                <input
                    type="text"
                    placeholder="Search and add a vehicle to compare (Max 3)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={comparedCars.length >= 3}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:border-[#FF7A00] disabled:opacity-40"
                />
                
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute top-16 left-0 right-0 rounded-2xl bg-[#0f0f0f] border border-white/10 overflow-hidden shadow-2xl z-40 py-1">
                        {suggestions.map(car => (
                            <button
                                key={car.id}
                                onClick={() => addCarToCompare(car)}
                                className="w-full px-6 py-3 text-left hover:bg-white/5 text-sm text-gray-300 hover:text-white flex justify-between items-center transition duration-150"
                            >
                                <span>{car.brand?.name} {car.name}</span>
                                <span className="text-xs text-[#FF7A00] uppercase font-bold">{car.category?.name_en}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Comparison Grid */}
            {comparedCars.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl space-y-4 bg-white/2">
                    <p className="text-gray-500 text-base">Select at least two cars from the search box above to start comparing specs.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm min-w-[600px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-6 font-bold uppercase text-gray-500 tracking-wider w-1/4">Specification</th>
                                {comparedCars.map(car => (
                                    <th key={car.id} className="py-6 px-4 w-1/4 relative group">
                                        
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeCarFromCompare(car.id)}
                                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400 text-xs font-bold"
                                        >
                                            Remove ✕
                                        </button>

                                        <div className="space-y-4 pt-4">
                                            {/* Preview image */}
                                            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-white/5 border border-white/5">
                                                <img src={car.primary_image?.image_path || car.image_path || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=300'} alt={car.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-white">{car.brand?.name} {car.name}</h3>
                                                <span className="text-xs text-gray-500 uppercase tracking-widest">{car.category?.name_en}</span>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                {/* Fill remaining column widths in table */}
                                {Array.from({ length: Math.max(0, 3 - comparedCars.length) }).map((_, i) => (
                                    <th key={i} className="py-6 px-4 w-1/4 border-l border-white/5 border-dashed">
                                        <div className="h-40 flex items-center justify-center text-xs text-gray-600 font-semibold uppercase tracking-widest">
                                            Slot Empty
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            
                            {/* Price per Day */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Rate / Day</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 font-bold text-lg text-[#FF7A00]">
                                        {parseInt(car.price_per_day)} MAD
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Engine */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Engine</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {getSpec(car, 'Engine')}
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Horsepower */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Horsepower</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {getSpec(car, 'Horsepower')}
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Acceleration */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">0 - 100 km/h</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {getSpec(car, 'Acceleration (0-100)')}
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Top Speed */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Top Speed</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {getSpec(car, 'Top Speed')}
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Transmission */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Transmission</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {car.transmission}
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Fuel type */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Fuel</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {car.fuel_type}
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* Seats */}
                            <tr>
                                <td className="py-5 font-bold uppercase text-gray-400 tracking-wider text-xs">Capacity</td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4 text-white">
                                        {car.seats} Seats
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                            {/* CTAs */}
                            <tr>
                                <td className="py-5"></td>
                                {comparedCars.map(car => (
                                    <td key={car.id} className="py-5 px-4">
                                        <Link
                                            to={`/cars/${car.slug}`}
                                            className="block w-full text-center bg-[#FF7A00] hover:bg-[#E06B00] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition duration-200"
                                        >
                                            Book Now
                                        </Link>
                                    </td>
                                ))}
                                {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <td key={i} className="py-5 px-4"></td>)}
                            </tr>

                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
