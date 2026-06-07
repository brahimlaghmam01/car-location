import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import CarCard from '../components/CarCard';

export default function Explore() {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Responsive filter toggle on mobile
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Form inputs matching query params
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brand') ? searchParams.get('brand').split(',') : []);
    const [selectedCategories, setSelectedCategories] = useState(searchParams.get('category') ? searchParams.get('category').split(',') : []);
    const [transmission, setTransmission] = useState(searchParams.get('transmission') ? searchParams.get('transmission').split(',') : []);
    const [fuelType, setFuelType] = useState(searchParams.get('fuel_type') ? searchParams.get('fuel_type').split(',') : []);
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'featured');
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

    // Dynamic select data
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        // Fetch Brands and Categories directories
        axios.get('/api/cars/brands').then(res => setBrands(res.data)).catch(() => {});
        axios.get('/api/cars/categories').then(res => setCategories(res.data)).catch(() => {});
    }, []);

    // Sync state values when URL params change
    useEffect(() => {
        setSearch(searchParams.get('search') || '');
        setSelectedBrands(searchParams.get('brand') ? searchParams.get('brand').split(',') : []);
        setSelectedCategories(searchParams.get('category') ? searchParams.get('category').split(',') : []);
        setTransmission(searchParams.get('transmission') ? searchParams.get('transmission').split(',') : []);
        setFuelType(searchParams.get('fuel_type') ? searchParams.get('fuel_type').split(',') : []);
        setMinPrice(searchParams.get('min_price') || '');
        setMaxPrice(searchParams.get('max_price') || '');
        setSortBy(searchParams.get('sort_by') || 'featured');
        setPage(parseInt(searchParams.get('page')) || 1);
    }, [searchParams]);

    // Build URL search params and query
    const updateQueryParams = (newParams = {}) => {
        const current = new URLSearchParams(searchParams);
        
        Object.entries(newParams).forEach(([key, val]) => {
            if (val === null || val === undefined || val === '') {
                current.delete(key);
            } else {
                current.set(key, val);
            }
        });

        setSearchParams(current);
    };

    // Query fetch function using React Query
    const { data, isLoading, isError } = useQuery({
        queryKey: ['cars', searchParams.toString()],
        queryFn: async () => {
            const res = await axios.get('/api/cars', { params: Object.fromEntries(searchParams) });
            return res.data;
        }
    });

    const handleFilterChange = (type, value) => {
        let list = [];
        if (type === 'brand') {
            list = selectedBrands.includes(value) ? selectedBrands.filter(b => b !== value) : [...selectedBrands, value];
            setSelectedBrands(list);
            updateQueryParams({ brand: list.join(','), page: 1 });
        } else if (type === 'category') {
            list = selectedCategories.includes(value) ? selectedCategories.filter(c => c !== value) : [...selectedCategories, value];
            setSelectedCategories(list);
            updateQueryParams({ category: list.join(','), page: 1 });
        } else if (type === 'transmission') {
            list = transmission.includes(value) ? transmission.filter(t => t !== value) : [...transmission, value];
            setTransmission(list);
            updateQueryParams({ transmission: list.join(','), page: 1 });
        } else if (type === 'fuel_type') {
            list = fuelType.includes(value) ? fuelType.filter(f => f !== value) : [...fuelType, value];
            setFuelType(list);
            updateQueryParams({ fuel_type: list.join(','), page: 1 });
        }
    };

    const applySearch = (e) => {
        e?.preventDefault();
        updateQueryParams({ search: search, page: 1 });
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white bg-[#0A0A0A] min-h-screen">
            
            {/* Header Title */}
            <div className={`mb-12 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wide">
                    {t('explore_cars').split(' ')[0]} <span className="text-[#FF7A00]">{t('explore_cars').split(' ').slice(1).join(' ') || 'Fleet'}</span>
                </h1>
                <p className="text-gray-500 text-sm mt-2">Explore our collection of the world's most desired luxury rentals.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                
                {/* 1. FILTER SIDEBAR (Desktop) */}
                <aside className="hidden lg:block space-y-8 bg-white/5 border border-white/5 p-8 rounded-3xl backdrop-blur-md h-fit sticky top-28">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h3 className="font-bold uppercase tracking-wider text-sm">Filters</h3>
                        <button onClick={clearFilters} className="text-xs text-[#FF7A00] hover:underline font-semibold">
                            Clear All
                        </button>
                    </div>

                    {/* Brand Filter */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Brand</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {brands.map(brand => (
                                <label key={brand.id} className="flex items-center space-x-3 text-sm cursor-pointer hover:text-white text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand.slug)}
                                        onChange={() => handleFilterChange('brand', brand.slug)}
                                        className="rounded border-white/10 bg-white/5 text-[#FF7A00] focus:ring-0 w-4.5 h-4.5"
                                    />
                                    <span>{brand.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</h4>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center space-x-3 text-sm cursor-pointer hover:text-white text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.slug)}
                                        onChange={() => handleFilterChange('category', cat.slug)}
                                        className="rounded border-white/10 bg-white/5 text-[#FF7A00] focus:ring-0 w-4.5 h-4.5"
                                    />
                                    <span>{i18n.language === 'ar' ? cat.name_ar : (i18n.language === 'fr' ? cat.name_fr : cat.name_en)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Transmission Filter */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Transmission</h4>
                        <div className="space-y-2">
                            {['Automatic', 'Manual'].map(trans => (
                                <label key={trans} className="flex items-center space-x-3 text-sm cursor-pointer hover:text-white text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={transmission.includes(trans)}
                                        onChange={() => handleFilterChange('transmission', trans)}
                                        className="rounded border-white/10 bg-white/5 text-[#FF7A00] focus:ring-0 w-4.5 h-4.5"
                                    />
                                    <span>{trans}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Price (MAD / day)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                onBlur={() => updateQueryParams({ min_price: minPrice, page: 1 })}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                onBlur={() => updateQueryParams({ max_price: maxPrice, page: 1 })}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                            />
                        </div>
                    </div>

                </aside>

                {/* 2. RESULTS CONTAINER (Grid & Search & Sort) */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* Toolbar: Search input, Mobile Filter Toggle, Sort Selector */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/5 p-4 rounded-3xl backdrop-blur-md">
                        
                        {/* Search Input */}
                        <form onSubmit={applySearch} className="w-full sm:max-w-md relative">
                            <input
                                type="text"
                                placeholder="Search cars..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                            />
                            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </form>

                        {/* Controls: Mobile Filter Button & Sort */}
                        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4">
                            
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center space-x-2"
                            >
                                <span>⚡</span>
                                <span>Filters</span>
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); updateQueryParams({ sort_by: e.target.value, page: 1 }); }}
                                className="bg-[#0f0f0f] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                            >
                                <option value="featured">Featured</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Loader Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {[1, 2, 4].map(idx => (
                                <div key={idx} className="bg-white/5 rounded-3xl aspect-[9/10] animate-pulse"></div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-20 text-gray-500">
                            Failed to load fleet listings. Please try again.
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 space-y-4">
                            <p className="text-lg font-bold">No vehicles found matching your criteria.</p>
                            <button onClick={clearFilters} className="bg-[#FF7A00] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Grid of cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {data?.data?.map((car) => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {data?.last_page > 1 && (
                                <div className="flex justify-center items-center space-x-3 pt-6">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => { setPage(page - 1); updateQueryParams({ page: page - 1 }); }}
                                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/10 transition"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm text-gray-400">
                                        Page {data?.current_page} of {data?.last_page}
                                    </span>
                                    <button
                                        disabled={page === data?.last_page}
                                        onClick={() => { setPage(page + 1); updateQueryParams({ page: page + 1 }); }}
                                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/10 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>

            {/* Mobile slide-out Filter drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
                    <div className="w-80 max-w-full bg-[#0A0A0A] border-l border-white/10 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="font-bold text-lg">Filters</h3>
                                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 text-lg">
                                    ✕
                                </button>
                            </div>
                            
                            {/* Brand */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Brand</h4>
                                <div className="space-y-2">
                                    {brands.map(b => (
                                        <label key={b.id} className="flex items-center space-x-3 text-sm cursor-pointer hover:text-white">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(b.slug)}
                                                onChange={() => handleFilterChange('brand', b.slug)}
                                                className="rounded border-white/10 bg-white/5 text-[#FF7A00]"
                                            />
                                            <span>{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileFiltersOpen(false)}
                            className="w-full bg-[#FF7A00] py-3 rounded-full font-bold uppercase tracking-widest text-xs"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
