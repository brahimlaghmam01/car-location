import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import BookingWidget from '../components/BookingWidget';
import CarCard from '../components/CarCard';

export default function CarDetails() {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    
    // Active gallery image state
    const [activeImage, setActiveImage] = useState('');
    const [similarCars, setSimilarCars] = useState([]);

    const isRtl = i18n.language === 'ar';

    // Fetch Car details
    const { data, isLoading, isError } = useQuery({
        queryKey: ['car', slug],
        queryFn: async () => {
            const res = await axios.get(`/api/cars/${slug}`);
            return res.data;
        }
    });

    useEffect(() => {
        if (data?.car) {
            const primary = data.car.images.find(img => img.is_primary) || data.car.images[0];
            setActiveImage(primary?.image_path || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800');

            // Fetch similar cars
            axios.get(`/api/cars/similar/${slug}`)
                .then(res => setSimilarCars(res.data))
                .catch(() => {});
        }
    }, [data, slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
                <div className="space-y-4 text-center">
                    <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Entering Veloce Garage...</p>
                </div>
            </div>
        );
    }

    if (isError || !data?.car) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white space-y-4">
                <p className="text-lg text-gray-500">Vehicle details could not be retrieved.</p>
                <Link to="/explore" className="bg-[#FF7A00] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    Go Back to Fleet
                </Link>
            </div>
        );
    }

    const { car, booked_dates } = data;

    const getDescription = () => {
        if (i18n.language === 'ar') return car.description_ar;
        if (i18n.language === 'fr') return car.description_fr;
        return car.description_en;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white bg-[#0A0A0A] min-h-screen space-y-16">
            
            {/* Breadcrumb / Back Link */}
            <div className={`pt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                <Link to="/explore" className="text-gray-500 hover:text-white transition font-semibold text-sm flex items-center space-x-1.5 w-fit">
                    <span>←</span>
                    <span>Back to Fleet</span>
                </Link>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                
                {/* Left side: Gallery & specs & reviews (Span 2) */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* Gallery section */}
                    <div className="space-y-4">
                        {/* Large Active View */}
                        <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative">
                            <img
                                src={activeImage}
                                alt={car.name}
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {car.images?.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImage(img.image_path)}
                                    className={`w-28 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition duration-200 ${
                                        activeImage === img.image_path ? 'border-[#FF7A00]' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img.image_path} alt={`${car.name} ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Specifications Cards Grid */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-wider">Performance Specifications</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.entries(car.specifications || {}).map(([key, val]) => (
                                <div key={key} className="bg-white/5 border border-white/5 p-5 rounded-2xl backdrop-blur-sm text-center space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{key}</span>
                                    <p className="text-lg font-bold text-white">{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description & Comfort Features */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold uppercase tracking-wider">Overview</h3>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                {getDescription()}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-bold uppercase tracking-wider">Premium Features</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {car.features?.map((feat, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 text-sm text-gray-300">
                                        <span className="text-[#FF7A00]">✓</span>
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Availability Calendar visual */}
                    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-wider">Availability Schedule</h3>
                        <p className="text-xs text-gray-500">Note: Red ranges indicate booked dates. Green indicates available fleet active.</p>
                        <div className="space-y-2">
                            {booked_dates.length === 0 ? (
                                <div className="text-green-500 text-sm font-semibold py-2">
                                    ✓ Available every day this month.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {booked_dates.map((range, idx) => (
                                        <div key={idx} className="bg-red-950/10 border border-red-900/30 px-4 py-3 rounded-xl flex justify-between items-center text-xs">
                                            <span className="text-red-400 font-bold uppercase">Reserved</span>
                                            <span className="text-gray-400">{range.start} to {range.end}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Reviews */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold uppercase tracking-wider">Reviews ({car.reviews?.length || 0})</h3>
                        {car.reviews?.length === 0 ? (
                            <p className="text-sm text-gray-500">No reviews yet for this vehicle. Be the first to rent and leave feedback!</p>
                        ) : (
                            <div className="space-y-6">
                                {car.reviews?.map((rev) => (
                                    <div key={rev.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={rev.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100'}
                                                    alt={rev.user?.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-bold">{rev.user?.name}</h4>
                                                    <span className="text-[10px] text-gray-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-bold text-yellow-500">
                                                <span>★</span>
                                                <span className="text-white">{rev.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right side: Sticky Booking widget (Span 1) */}
                <div className="lg:sticky lg:top-28">
                    <BookingWidget car={car} bookedDates={booked_dates} />
                </div>

            </div>

            {/* Similar Cars Slider */}
            {similarCars.length > 0 && (
                <section className="space-y-8 pt-10 border-t border-white/5">
                    <h3 className="text-2xl font-bold uppercase tracking-wider">Similar Luxury Collections</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {similarCars.map((sCar) => (
                            <CarCard key={sCar.id} car={sCar} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
