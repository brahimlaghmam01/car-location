import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const testimonials = [
    {
        name: "Yassine Benjelloun",
        role: "Business Executive",
        rating: 5,
        review: " renting the AMG GT Black Series for my business trip to Casablanca was incredible. The car was spotless, delivered right to my hotel, and the service was absolutely first-class. Highly recommended!",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150"
    },
    {
        name: "Sophia Martinez",
        role: "Luxury Travel Creator",
        rating: 5,
        review: "Veloce offered me the dream ride. The Porsche 911 Carrera S performed perfectly on the roads from Marrakech to the Atlas Mountains. The language switcher and booking widget made checkout incredibly simple.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"
    },
    {
        name: "Mehdi Alami",
        role: "Exotic Car Enthusiast",
        rating: 5,
        review: "Veloce's AI Recommendation quiz recommended the Huracán Evo and it was the perfect fit. Hearing the roar of that V10 on the highway was unforgettable. Will definitely rent again next month.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150"
    }
];

export default function TestimonialCarousel() {
    const { t, i18n } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const isRtl = i18n.language === 'ar';

    const handleNext = () => {
        setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const active = testimonials[activeIndex];

    // Variants for Framer Motion sliding
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" }
        },
        exit: (direction) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            transition: { duration: 0.3, ease: "easeIn" }
        })
    };

    const [direction, setDirection] = useState(1);

    const triggerNext = () => {
        setDirection(1);
        handleNext();
    };

    const triggerPrev = () => {
        setDirection(-1);
        handlePrev();
    };

    return (
        <div className="relative max-w-4xl mx-auto px-4 py-10">
            
            {/* Main Carousel Area */}
            <div className="min-h-[320px] md:min-h-[260px] flex items-center justify-center relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md">
                
                {/* Floating Quote Icon */}
                <span className="absolute top-6 left-8 text-7xl font-serif text-white/5 select-none">“</span>
                
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={activeIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 text-center md:text-left relative z-10"
                        style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FF7A00] to-yellow-500 rounded-full blur opacity-40"></div>
                            <img
                                src={active.image}
                                alt={active.name}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover relative z-10 border-2 border-black"
                            />
                        </div>

                        {/* Review Content */}
                        <div className={`space-y-4 flex-grow ${isRtl ? 'md:text-right md:pl-0 md:pr-8' : 'md:text-left md:pl-8'}`}>
                            {/* Stars */}
                            <div className="flex justify-center md:justify-start space-x-1">
                                {Array.from({ length: active.rating }).map((_, i) => (
                                    <span key={i} className="text-yellow-500 text-lg">★</span>
                                ))}
                            </div>
                            
                            <p className="text-gray-300 italic text-base leading-relaxed">
                                "{active.review}"
                            </p>

                            <div>
                                <h4 className="text-white font-bold text-lg">{active.name}</h4>
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{active.role}</p>
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Nav Controls */}
            <div className={`flex justify-center space-x-4 mt-8 ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <button
                    onClick={triggerPrev}
                    className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-[#FF7A00] text-white flex items-center justify-center transition duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                {/* Dots indicator */}
                <div className="flex items-center space-x-2.5">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                            className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-[#FF7A00]' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={triggerNext}
                    className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-[#FF7A00] text-white flex items-center justify-center transition duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

        </div>
    );
}
