'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

import { FaInstagram, FaBehance } from 'react-icons/fa';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { profile, setProfile } = useProfile(); // We need setProfile for the mobile switcher
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const photographyLinks = [
        { name: t('common.photography'), href: '/photography' },
        { name: t('common.bookings'), href: '/photography/bookings' },
        { name: t('common.clientGallery'), href: '/photography/client-gallery' },
        { name: t('common.about'), href: '/photography/about' },
    ];

    const artLinks = [
        { name: t('common.fineArt'), href: '/art' },
        { name: t('common.works'), href: '/art/works' },
        { name: t('common.exhibitions'), href: '/art/exhibitions' },
        { name: t('common.shop'), href: '/art/shop' },
        { name: t('common.about'), href: '/art/about' },
    ];

    const links = profile === 'art' ? artLinks : photographyLinks;

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out py-6 md:py-8 px-6 md:px-12 flex justify-between items-center',
                    scrolled ? 'bg-background/80 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent'
                )}
            >
                {/* Brand */}
                <Link href="/" className="group z-50 relative">
                    <div className="text-xl md:text-2xl font-heading tracking-tight text-white flex items-center gap-1">
                        MOYO<span className="text-gold transition-transform duration-500 group-hover:rotate-180">.</span>
                    </div>
                </Link>

                {/* Profile Toggle In Mini Mode (Desktop) */}
                <div className="hidden lg:flex items-center glass rounded-full px-2 py-1 gap-1">
                    <Link
                        href="/photography"
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all duration-500",
                            profile === 'photography' ? "bg-white text-black" : "text-white/40 hover:text-white"
                        )}
                    >
                        {t('common.photography')}
                    </Link>
                    <Link
                        href="/art"
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all duration-500",
                            profile === 'art' ? "bg-white text-black" : "text-white/40 hover:text-white"
                        )}
                    >
                        {t('common.fineArt')}
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center space-x-10">
                    <div className="flex items-center space-x-8 text-[10px] font-body tracking-[0.2em] text-white/60">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "hover:text-white transition-colors duration-300 uppercase",
                                    pathname === link.href && "text-white font-medium"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <div className="flex items-center gap-6">
                        <LanguageSwitcher />
                        {profile === 'photography' ? (
                            <Link
                                href="/photography/bookings"
                                className="bg-white text-black text-[10px] tracking-[0.2em] font-medium px-6 py-2.5 rounded-sm hover:bg-gold hover:text-black transition-all duration-300 uppercase"
                            >
                                {t('common.bookNow')}
                            </Link>
                        ) : (
                            <Link
                                href="/art/newsletter"
                                className="border border-white/20 text-white text-[10px] tracking-[0.2em] font-medium px-6 py-2.5 rounded-sm hover:border-gold hover:text-gold transition-all duration-300 uppercase"
                            >
                                {t('common.newsletter')}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 focus:outline-none group z-50 relative"
                >
                    <motion.div
                        animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                        className="w-8 h-[1px] bg-white group-hover:bg-gold transition-colors duration-300"
                    />
                    <motion.div
                        animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                        className="w-5 h-[1px] bg-white group-hover:bg-gold transition-colors duration-300 self-end"
                    />
                    <motion.div
                        animate={mobileMenuOpen ? { rotate: -45, y: -6, width: 32 } : { rotate: 0, y: 0, width: 20 }}
                        className="w-5 h-[1px] bg-white group-hover:bg-gold transition-colors duration-300 self-end" // Adjusted initial width to match design
                    />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl md:hidden overflow-y-auto"
                    >
                        <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12">

                            {/* Profile Switcher Mobile */}
                            <div className="flex items-center glass rounded-full px-2 py-1 gap-1 mb-8">
                                <button
                                    onClick={() => setProfile('photography')}
                                    className={cn(
                                        "px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-500",
                                        profile === 'photography' ? "bg-white text-black" : "text-white/40"
                                    )}
                                >
                                    {t('common.photography')}
                                </button>
                                <button
                                    onClick={() => setProfile('art')}
                                    className={cn(
                                        "px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-500",
                                        profile === 'art' ? "bg-white text-black" : "text-white/40"
                                    )}
                                >
                                    {t('common.fineArt')}
                                </button>
                            </div>

                            {/* Links */}
                            <div className="flex flex-col items-center space-y-8">
                                {links.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="text-3xl font-heading text-white hover:text-gold transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="w-12 h-px bg-white/10" />

                            <div className="flex flex-col items-center gap-8">
                                <LanguageSwitcher />

                                <div className="flex gap-8 text-white/40">
                                    <a href="#" className="hover:text-white transition-colors text-xs tracking-widest uppercase"><FaInstagram size={18} /></a>
                                    <a href="#" className="hover:text-white transition-colors text-xs tracking-widest uppercase"><FaBehance size={18} /></a>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
