import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import CarCard from '../components/CarCard';

export default function AIQuiz() {
    const { t } = useTranslation();

    // Quiz steps: 0 to 4. Result view is step 5.
    const [step, setStep] = useState(0);
    
    // Quiz state selections
    const [budget, setBudget] = useState('');
    const [purpose, setPurpose] = useState('');
    const [transmission, setTransmission] = useState('');
    const [passengers, setPassengers] = useState(2);
    const [power, setPower] = useState('');

    // Matched results state
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Questions and options definition
    const questions = [
        {
            key: 'budget',
            question: t('quiz_budget_q'),
            options: [
                { label: 'Exotic Supercar (1000+ MAD/day)', value: 'exotic', icon: '🏎️' },
                { label: 'Hyper-Premium Luxury (500-1000 MAD/day)', value: 'premium', icon: '💎' },
                { label: 'Executive Sport (Under 500 MAD/day)', value: 'standard', icon: '💼' }
            ]
        },
        {
            key: 'purpose',
            question: t('quiz_purpose_q'),
            options: [
                { label: 'Track-level speed & cornering', value: 'sport', icon: '🏁' },
                { label: 'Scenic coastal touring & honeymoon', value: 'leisure', icon: '☀️' },
                { label: 'Understated corporate business meeting', value: 'business', icon: '👔' },
                { label: 'Spacious family holiday cruise', value: 'family', icon: '🏡' }
            ]
        },
        {
            key: 'transmission',
            question: t('quiz_trans_q'),
            options: [
                { label: 'Dual-Clutch Automatic (Paddles)', value: 'Automatic', icon: '⚙️' },
                { label: 'Raw Gate-Shifter Manual', value: 'Manual', icon: '🕹️' },
                { label: 'No Preference', value: 'any', icon: '🔄' }
            ]
        },
        {
            key: 'passengers',
            question: t('quiz_passengers_q'),
            options: [
                { label: '1 - 2 Passengers (Coupe/Hyper)', value: 2, icon: '👥' },
                { label: '3 - 4 Passengers (Sedan/SUV)', value: 4, icon: '👨‍👩‍👦' },
                { label: '5+ Passengers (Large SUV)', value: 5, icon: '🚌' }
            ]
        },
        {
            key: 'power',
            question: t('quiz_power_q'),
            options: [
                { label: 'Raw horsepowers & roaring engines', value: 'raw', icon: '🔥' },
                { label: 'Balanced GT comfort & cruise efficiency', value: 'efficient', icon: '⚖️' },
                { label: 'Silent immediate torque & hybrid options', value: 'hybrid', icon: '⚡' }
            ]
        }
    ];

    const handleNext = (val) => {
        // Save current step selection
        if (step === 0) setBudget(val);
        else if (step === 1) setPurpose(val);
        else if (step === 2) setTransmission(val);
        else if (step === 3) setPassengers(val);
        else if (step === 4) setPower(val);

        if (step < 4) {
            setStep(step + 1);
        } else {
            submitQuiz(val);
        }
    };

    const submitQuiz = async (finalVal) => {
        setLoading(true);
        setStep(5);
        
        const payload = {
            budget,
            purpose,
            transmission,
            passengers,
            power: finalVal
        };

        try {
            const res = await axios.post('/api/recommend', payload);
            setResults(res.data);
        } catch (err) {
            console.error('Quiz submission failure', err);
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setBudget('');
        setPurpose('');
        setTransmission('');
        setPassengers(2);
        setPower('');
        setResults([]);
        setStep(0);
    };

    const currentQuestion = questions[step];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white bg-[#0A0A0A] min-h-screen flex flex-col justify-center items-center">
            
            {step < 5 ? (
                // QUIZ QUESTION CARD
                <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md space-y-8 relative overflow-hidden">
                    
                    {/* Top Progress bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#FF7A00] to-yellow-500 transition-all duration-300"
                            style={{ width: `${(step / 5) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest pt-2">
                        <span>{t('ai_quiz_title')}</span>
                        <span>Step {step + 1} of 5</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide leading-relaxed">
                                {currentQuestion.question}
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {currentQuestion.options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        type="button"
                                        onClick={() => handleNext(opt.value)}
                                        className="w-full text-left bg-white/5 hover:bg-[#FF7A00]/10 border border-white/10 hover:border-[#FF7A00]/50 rounded-2xl px-6 py-4.5 flex items-center space-x-4 transition duration-200 group"
                                    >
                                        <span className="text-2xl shrink-0 group-hover:scale-115 transition duration-200">{opt.icon}</span>
                                        <span className="text-sm md:text-base font-semibold text-gray-300 group-hover:text-white">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest pt-4 block"
                        >
                            ← Previous Question
                        </button>
                    )}
                </div>
            ) : (
                // RESULTS VIEW
                <div className="w-full max-w-5xl space-y-12">
                    
                    <div className="text-center space-y-3">
                        <div className="inline-block bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
                            AI Engine Matched
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">{t('quiz_match_title')}</h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto">{t('quiz_match_subtitle')}</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-10 h-10 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Running Compatibility Algorithms...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                            <p className="text-gray-400">Our garage couldn't find vehicles matching your passenger constraints.</p>
                            <button onClick={resetQuiz} className="bg-[#FF7A00] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                Restart Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Grid of matched cars */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {results.map(({ car, compatibility_score, reasons }) => (
                                    <div key={car.id} className="relative group">
                                        
                                        {/* Compatibility score badge floating */}
                                        <div className="absolute -top-3.5 -right-3.5 bg-gradient-to-r from-[#FF7A00] to-yellow-500 px-3 py-1.5 rounded-2xl text-xs font-black text-black z-30 shadow-lg">
                                            {compatibility_score}% Match
                                        </div>

                                        <div className="flex flex-col h-full bg-white/5 border border-white/15 rounded-3xl overflow-hidden p-1">
                                            <CarCard car={car} />
                                            
                                            {/* AI matching reasons list */}
                                            <div className="p-5 border-t border-white/5 bg-black/40 rounded-b-3xl space-y-2 mt-auto">
                                                <span className="text-[9px] uppercase font-bold text-[#FF7A00] tracking-widest">Match Diagnostics</span>
                                                <ul className="space-y-1.5 text-xs text-gray-400">
                                                    {reasons.map((r, i) => (
                                                        <li key={i} className="flex items-start space-x-2">
                                                            <span className="text-green-500 font-bold shrink-0">•</span>
                                                            <span>{r}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            <div className="text-center pt-6">
                                <button
                                    onClick={resetQuiz}
                                    className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest"
                                >
                                    Restart AI Quiz
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
