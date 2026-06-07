import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { user, logout, isManager } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLangOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇲🇦' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const isRtl = i18n.language === 'ar';

    const navLinks = [
        { path: '/', label: t('nav_home') },
        { path: '/explore', label: t('nav_explore') },
        { path: '/recommend', label: t('nav_ai') },
        { path: '/compare', label: t('nav_compare') }
    ];

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10 text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-extrabold tracking-wider font-sans uppercase">
                            VELOCE<span className="text-[#FF7A00]">.</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-semibold tracking-wide uppercase transition-colors duration-200 ${
                                    location.pathname === link.path 
                                    ? 'text-[#FF7A00]' 
                                    : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Toolbar (Language, Theme, Auth) */}
                    <div className="hidden md:flex items-center space-x-6">
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition duration-200"
                        >
                            {theme === 'dark' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="25 25 50 50" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="25 25 50 50" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                </svg>
                            )}
                        </button>

                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full text-sm font-medium transition duration-200"
                            >
                                <span>{currentLang.flag}</span>
                                <span>{currentLang.name}</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {langOpen && (
                                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-40 rounded-xl bg-[#0f0f0f] border border-white/10 shadow-2xl overflow-hidden py-1 z-50`}>
                                    {languages.map((lng) => (
                                        <button
                                            key={lng.code}
                                            onClick={() => changeLanguage(lng.code)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center space-x-3 transition duration-150"
                                        >
                                            <span>{lng.flag}</span>
                                            <span>{lng.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Actions */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserOpen(!userOpen)}
                                    className="flex items-center space-x-3 focus:outline-none"
                                >
                                    <img
                                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-full object-cover border border-white/20"
                                    />
                                    <span className="text-sm font-medium hover:text-gray-300">{user.name.split(' ')[0]}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {userOpen && (
                                    <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-52 rounded-xl bg-[#0f0f0f] border border-white/10 shadow-2xl overflow-hidden py-1 z-50`}>
                                        <div className="px-4 py-2.5 border-b border-white/5">
                                            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                                            <p className="text-sm font-semibold truncate text-white">{user.email}</p>
                                            <p className="text-[10px] text-[#FF7A00] uppercase font-bold mt-0.5">{user.role?.name}</p>
                                        </div>
                                        <Link to="/dashboard" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition duration-150">
                                            {t('nav_dashboard')}
                                        </Link>
                                        {isManager() && (
                                            <Link to="/admin" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition duration-150">
                                                {t('nav_admin')}
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { setUserOpen(false); handleLogout(); }}
                                            className="w-full text-left block px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/10 hover:text-red-300 transition duration-150"
                                        >
                                            {t('nav_logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-semibold hover:text-[#FF7A00] transition duration-200">
                                    {t('nav_login')}
                                </Link>
                                <Link to="/register" className="bg-[#FF7A00] hover:bg-[#E06B00] px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide shadow-lg hover:shadow-[#FF7A00]/20 transform hover:-translate-y-0.5 transition duration-200">
                                    {t('nav_register')}
                                </Link>
                            </div>
                        )}

                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        {/* Theme button */}
                        <button onClick={toggleTheme} className="text-gray-300 hover:text-white p-2">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
                        >
                            <svg className="h-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-[#0A0A0A] border-t border-white/10 px-4 pt-2 pb-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2"></div>
                    
                    {/* Mobile Languages */}
                    <div className="flex justify-around py-2">
                        {languages.map((lng) => (
                            <button
                                key={lng.code}
                                onClick={() => { changeLanguage(lng.code); setIsOpen(false); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i18n.language === lng.code ? 'bg-[#FF7A00]' : 'bg-white/5'}`}
                            >
                                {lng.flag} {lng.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    <div className="h-px bg-white/10 my-2"></div>

                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
                                {t('nav_dashboard')}
                            </Link>
                            {isManager() && (
                                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
                                    {t('nav_admin')}
                                </Link>
                            )}
                            <button
                                onClick={() => { setIsOpen(false); handleLogout(); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-950/20"
                            >
                                {t('nav_logout')}
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2.5 rounded-full border border-white/20 text-sm font-semibold hover:bg-white/5">
                                {t('nav_login')}
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-2.5 rounded-full bg-[#FF7A00] text-sm font-semibold hover:bg-[#E06B00]">
                                {t('nav_register')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
