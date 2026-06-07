import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FaqAccordion() {
    const { t, i18n } = useTranslation();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What are the age requirements for renting luxury cars?",
            answer: "For hypercars (Lamborghini, Ferrari) and performance coupes, the minimum age is 25 years with at least 2 years of active driving experience. For SUVs and premium sedans (Porsche Cayenne, BMW M5), the minimum age is 21 years."
        },
        {
            question: "Is comprehensive insurance included in the daily rate?",
            answer: "Yes, all rentals at Veloce include standard fully comprehensive insurance with a deductible. You can choose to upgrade to our Zero Deductible Premium Insurance package during booking for complete peace of mind."
        },
        {
            question: "Can I deliver and pick up the car in different cities?",
            answer: "Absolutely. We support multi-city rentals. You can pick up your vehicle in Casablanca and return it in Marrakech, Tangier, Rabat, or Fes. A minor one-way fee may apply depending on the cities selected."
        },
        {
            question: "What documents do I need to present upon pickup?",
            answer: "You will need to provide a valid passport, a valid national or international driving license (which you can upload directly in your customer dashboard), and the credit card used to pay or reserve the deposit."
        },
        {
            question: "How does the security deposit work?",
            answer: "A pre-authorization hold is placed on your credit card at the start of the rental period. This is not a charge and will be fully released immediately upon returning the vehicle in its original condition."
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const isRtl = i18n.language === 'ar';

    return (
        <div className="max-w-3xl mx-auto space-y-4 px-4">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300"
                    >
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition duration-150 focus:outline-none"
                            style={{ textAlign: isRtl ? 'right' : 'left', flexDirection: isRtl ? 'row-reverse' : 'row' }}
                        >
                            <span className="text-white font-semibold text-base md:text-lg pr-4">
                                {faq.question}
                            </span>
                            <span className={`text-[#FF7A00] font-bold text-xl transform transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                                ＋
                            </span>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${
                                isOpen ? 'max-h-[300px] border-t border-white/5 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                            }`}
                        >
                            <div className="px-6 py-5 text-gray-400 text-sm md:text-base leading-relaxed">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
