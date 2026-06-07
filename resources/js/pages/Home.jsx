import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SearchWidget from '../components/SearchWidget';
import CarCard from '../components/CarCard';
import TestimonialCarousel from '../components/TestimonialCarousel';
import FaqAccordion from '../components/FaqAccordion';

export default function Home() {
    const { t, i18n } = useTranslation();
    const [featuredCars, setFeaturedCars] = useState([]);
    
    // Stats counters
    const [carsCount, setCarsCount] = useState(0);
    const [clientsCount, setClientsCount] = useState(0);
    const [citiesCount, setCitiesCount] = useState(0);
    const [bookingsCount, setBookingsCount] = useState(0);

    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        // Fetch featured cars
        axios.get('/api/cars?sort_by=rating')
            .then(res => {
                setFeaturedCars(res.data.data.slice(0, 3));
            })
            .catch(() => {});

        // Simple counter animations
        const duration = 1500;
        const steps = 50;
        const stepTime = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
            step++;
            setCarsCount(Math.floor((120 / steps) * step));
            setClientsCount(Math.floor((4800 / steps) * step));
            setCitiesCount(Math.floor((12 / steps) * step));
            setBookingsCount(Math.floor((8500 / steps) * step));

            if (step >= steps) {
                clearInterval(timer);
                setCarsCount(120);
                setClientsCount(4800);
                setCitiesCount(12);
                setBookingsCount(8500);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, []);

    // Brand lists with hover effects
    const brands = [
        { name: 'Mercedes-Benz', logo: 'https://logos-world.net/wp-content/uploads/2020/05/Mercedes-Benz-Logo.png' },
        { name: 'BMW', logo: 'https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png' },
        { name: 'Audi', logo: 'https://logos-world.net/wp-content/uploads/2021/02/Audi-Logo.png' },
        { name: 'Porsche', logo: 'https://logos-world.net/wp-content/uploads/2021/04/Porsche-Logo.png' },
        { name: 'Lamborghini', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Lamborghini-Logo.png' },
        { name: 'Ferrari', logo: 'https://logos-world.net/wp-content/uploads/2020/05/Ferrari-Logo.png' },
        { name: 'Bentley', logo: 'https://logos-world.net/wp-content/uploads/2021/04/Bentley-Logo.png' }
    ];

    const whyCards = [
        { title: 'Best Prices', desc: 'Pre-negotiated competitive pricing with no hidden charges.', icon: '🏷️' },
        { title: 'Premium Cars', desc: 'Handpicked fleet of top-tier brands in pristine condition.', icon: '🏎️' },
        { title: '24/7 Support', desc: 'Dedicated personal concierge service around the clock.', icon: '📞' },
        { title: 'Insurance Included', desc: 'Comprehensive damage coverage included in all bookings.', icon: '🛡️' },
        { title: 'Secure Payment', desc: 'Encrypted checkout using Stripe, PayPal, and CMI.', icon: '🔒' },
        { title: 'Instant Booking', desc: 'Zero wait. Secure reservation confirmation in seconds.', icon: '⚡' }
    ];

    return (
        <div className="space-y-24 pb-24 text-white bg-[#0A0A0A]">
            
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Luxury dark mask */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600"
                        alt="Porsche 911 Hero"
                        className="w-full h-full object-cover object-center opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20 pb-28">
                    <div className={`max-w-3xl space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
                            <span>★</span>
                            <span>The Pinnacle of Rental Prestige</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase leading-tight font-sans">
                            {t('tagline').split(' ')[0]} <span className="text-[#FF7A00]">{t('tagline').split(' ')[1]}</span> {t('tagline').split(' ').slice(2).join(' ')}
                        </h1>
                        <p className="text-gray-300 text-base sm:text-xl max-w-2xl leading-relaxed">
                            {t('hero_subtitle')}
                        </p>
                        
                        <div className={`flex flex-wrap gap-4 pt-4 ${isRtl ? 'justify-start' : ''}`}>
                            <Link
                                to="/explore"
                                className="bg-[#FF7A00] hover:bg-[#E06B00] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/40 transform hover:-translate-y-0.5 transition duration-200"
                            >
                                {t('rent_now')}
                            </Link>
                            <Link
                                to="/explore"
                                className="border border-white/20 hover:bg-white/5 px-8 py-4 rounded-full font-bold uppercase tracking-wider text-xs transition duration-200"
                            >
                                {t('explore_cars')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEARCH WIDGET FLOATER */}
            <section className="px-4">
                <SearchWidget />
            </section>

            {/* BRANDS LOGOS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                    <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
                        DRIVE ELITE BRANDS
                    </h2>
                    <div className="flex flex-wrap items-center justify-around gap-8">
                        {brands.map((b) => (
                            <Link
                                key={b.name}
                                to={`/explore?brand=${b.name.toLowerCase()}`}
                                className="grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                            >
                                <img src={b.logo} alt={b.name} className="h-10 md:h-12 w-auto object-contain" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED CARS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className={`flex flex-col md:flex-row justify-between items-end gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                        <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">{t('featured_cars')}</h2>
                        <p className="text-gray-500 text-sm mt-2">{t('featured_subtitle')}</p>
                    </div>
                    <Link
                        to="/explore"
                        className="text-[#FF7A00] font-bold text-sm hover:underline flex items-center space-x-1 shrink-0"
                    >
                        <span>View All Garage</span>
                        <span>→</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredCars.map((car) => (
                        <CarCard key={car.id} car={car} />
                    ))}
                </div>
            </section>

            {/* STATISTICS STATS */}
            <section className="bg-gradient-to-r from-black via-[#0f0f0f] to-black border-y border-white/10 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <p className="text-4xl md:text-5xl font-extrabold text-[#FF7A00] tracking-tight">{carsCount}+</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('stats_cars')}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl md:text-5xl font-extrabold text-[#FF7A00] tracking-tight">{clientsCount}+</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('stats_customers')}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl md:text-5xl font-extrabold text-[#FF7A00] tracking-tight">{citiesCount}+</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('stats_cities')}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl md:text-5xl font-extrabold text-[#FF7A00] tracking-tight">{bookingsCount}+</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('stats_bookings')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">{t('why_choose_us')}</h2>
                    <p className="text-gray-500 text-sm max-w-2xl mx-auto">{t('why_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {whyCards.map((card, i) => (
                        <div
                            key={i}
                            className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-[#FF7A00]/20 transition duration-300 flex items-start space-x-5"
                            style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 flex items-center justify-center text-2xl shrink-0">
                                {card.icon}
                            </div>
                            <div className={`space-y-2 ${isRtl ? 'text-right pr-4 pl-0' : 'text-left pl-4'}`}>
                                <h3 className="text-lg font-bold text-white tracking-wide">{card.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">{t('testimonials_title')}</h2>
                    <p className="text-gray-500 text-sm max-w-2xl mx-auto">{t('testimonials_subtitle')}</p>
                </div>
                <TestimonialCarousel />
            </section>

            {/* FAQ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">{t('faq_title')}</h2>
                </div>
                <FaqAccordion />
            </section>

        </div>
    );
}
