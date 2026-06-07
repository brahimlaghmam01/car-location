import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#050505] border-t border-white/10 text-gray-400 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    
                    {/* Brand Description */}
                    <div className="space-y-4">
                        <Link to="/" className="text-xl font-bold tracking-wider text-white uppercase">
                            VELOCE<span className="text-[#FF7A00]">.</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-500">
                            {t('footer_desc')}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {/* Social Icons */}
                            {['instagram', 'facebook', 'twitter', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href={`https://${social}.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#FF7A00] hover:text-white text-gray-400 flex items-center justify-center transition duration-200"
                                >
                                    <span className="sr-only">{social}</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Navigation</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link to="/" className="hover:text-white transition duration-150">{t('nav_home')}</Link></li>
                            <li><Link to="/explore" className="hover:text-white transition duration-150">{t('nav_explore')}</Link></li>
                            <li><Link to="/recommend" className="hover:text-white transition duration-150">{t('nav_ai')}</Link></li>
                            <li><Link to="/compare" className="hover:text-white transition duration-150">{t('nav_compare')}</Link></li>
                        </ul>
                    </div>

                    {/* Contacts Info */}
                    <div>
                        <h3 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Contact</h3>
                        <ul className="space-y-3.5 text-sm text-gray-500">
                            <li className="flex items-start space-x-3">
                                <span className="text-white">📍</span>
                                <span>Boulevard d'Anfa, Casablanca, Morocco</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="text-white">📞</span>
                                <span>+212 522 123 456</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="text-white">✉️</span>
                                <span>support@veloce-luxury.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Subscription */}
                    <div>
                        <h3 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Newsletter</h3>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                            Subscribe to receive news, updates, and exclusive private offers on our exotics collection.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-[#FF7A00] transition duration-200"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-[#FF7A00] hover:bg-[#E06B00] text-white rounded-full py-3 text-sm font-semibold tracking-wider uppercase transition duration-200"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
                    <p>&copy; {new Date().getFullYear()} VELOCE. All rights reserved. Designed with premium luxury engineering.</p>
                </div>
            </div>
        </footer>
    );
}
