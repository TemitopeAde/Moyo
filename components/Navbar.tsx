'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { socialLinks } from '@/lib/socialLinks';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isInitialLoad] = useState(() => {
        if (typeof window === 'undefined') return false;
        const played = sessionStorage.getItem('moreli_nav_played');
        if (!played) {
            sessionStorage.setItem('moreli_nav_played', 'true');
            return true;
        }
        return false;
    });
    const { profile, setProfile } = useProfile(); // We need setProfile for the mobile switcher
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const pathname = usePathname();
    const router = useRouter();

    const handleProfileSelect = (choice: 'photography' | 'art') => {
        setProfile(choice);
        setMobileMenuOpen(false);
        router.push(choice === 'photography' ? '/photography' : '/art');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        const timeout = window.setTimeout(() => setMobileMenuOpen(false), 0);
        return () => window.clearTimeout(timeout);
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
                    'fixed left-0 right-0 top-0 z-50 flex min-h-18 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl transition-all duration-700 ease-in-out sm:min-h-20 sm:px-6 md:min-h-24 md:px-8 xl:gap-10 xl:px-12',
                    scrolled ? 'border-foreground/10 bg-background/85 shadow-[0_18px_60px_rgba(0,0,0,0.08)]' : 'border-transparent bg-background/20'
                )}
            >
                {/* Brand */}
                <motion.div
                    initial={isInitialLoad ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: isInitialLoad ? 0.6 : 0, ease: "easeOut" }}
                    className="shrink-0"
                >
                    <Link href="/" className="group z-50 relative">
                        <Image
                            src="/brand/moyo-logo.png"
                            alt="Ijabiken Moyo"
                            width={160}
                            height={160}
                            priority
                            className="theme-logo h-9 w-9 object-contain transition-opacity duration-300 group-hover:opacity-80 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16"
                        />
                    </Link>
                </motion.div>

                {/* Profile Toggle In Mini Mode (Desktop) */}
                <motion.div
                    initial={isInitialLoad ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: isInitialLoad ? 0.9 : 0, ease: "easeOut" }}
                    className="entry-selector-frost hidden items-center rounded-full px-2 py-1 gap-1 xl:flex"
                >
                    <Link
                        href="/photography"
                        className={cn(
                            "relative whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-colors duration-500",
                            profile === 'photography' ? "text-background" : "text-foreground/40 hover:text-foreground"
                        )}
                    >
                        {t('common.photography')}
                        {profile === 'photography' && (
                            <motion.div layoutId="navToggleKnob" className="absolute inset-0 bg-foreground rounded-full -z-10" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                        )}
                    </Link>
                    <Link
                        href="/art"
                        className={cn(
                            "relative whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-colors duration-500",
                            profile === 'art' ? "text-background" : "text-foreground/40 hover:text-foreground"
                        )}
                    >
                        {t('common.fineArt')}
                        {profile === 'art' && (
                            <motion.div layoutId="navToggleKnob" className="absolute inset-0 bg-foreground rounded-full -z-10" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                        )}
                    </Link>
                </motion.div>

                {/* Desktop Nav Links */}
                <motion.div
                    initial={isInitialLoad ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: isInitialLoad ? 1.0 : 0, staggerChildren: 0.1, ease: "easeOut" }}
                    className="ml-auto hidden min-w-0 items-center gap-5 lg:flex xl:gap-8"
                >
                    <div className="flex min-w-0 items-center gap-3 text-[9px] font-body tracking-[0.12em] text-foreground/60 xl:gap-6 xl:text-[10px] xl:tracking-[0.2em]">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "whitespace-nowrap hover:text-foreground transition-colors duration-300 uppercase",
                                    pathname === link.href && "text-foreground font-medium"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-10 w-px shrink-0 bg-foreground/10" />

                    <div className="flex items-center gap-2 xl:gap-3">
                        <ThemeToggle className="h-14 w-14 rounded-lg border-foreground/10" />
                        <LanguageSwitcher className="h-14 rounded-lg border-foreground/10 px-4 xl:px-5" />
                        {profile === 'photography' ? (
                            <Link
                                href="/photography/bookings"
                                className="inline-flex h-14 shrink-0 items-center justify-center rounded-lg border border-foreground bg-foreground px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-all duration-300 hover:border-accent hover:bg-accent hover:text-background xl:px-7"
                            >
                                {t('common.bookNow')}
                            </Link>
                        ) : (
                            <Link
                                href="/art/newsletter"
                                className="inline-flex h-14 shrink-0 items-center justify-center rounded-lg border border-foreground/20 px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-accent hover:text-accent xl:px-7"
                            >
                                {t('common.newsletter')}
                            </Link>
                        )}
                    </div>
                </motion.div>

                <div className="ml-auto flex items-center gap-2 lg:hidden">
                    <ThemeToggle className="h-11 w-11" />

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="group relative z-50 flex h-11 w-11 flex-col items-end justify-center gap-1.5 rounded-md border border-transparent transition-colors duration-300 hover:border-foreground/10 hover:bg-white/10 focus:outline-none"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <motion.div
                            animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                            className="h-[1px] w-8 bg-foreground transition-colors duration-300 group-hover:bg-accent"
                        />
                        <motion.div
                            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="h-[1px] w-5 self-end bg-foreground transition-colors duration-300 group-hover:bg-accent"
                        />
                        <motion.div
                            animate={mobileMenuOpen ? { rotate: -45, y: -6, width: 32 } : { rotate: 0, y: 0, width: 20 }}
                            className="h-[1px] w-5 self-end bg-foreground transition-colors duration-300 group-hover:bg-accent"
                        />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl lg:hidden overflow-y-auto"
                    >
                        <div className="flex min-h-screen flex-col items-center justify-center space-y-10 px-5 py-28 sm:p-8">

                            {/* Profile Switcher Mobile */}
                            <div className="entry-selector-frost mb-4 flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full px-2 py-1">
                                <button
                                    onClick={() => handleProfileSelect('photography')}
                                    aria-pressed={profile === 'photography'}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[10px] tracking-widest uppercase transition-all duration-500 sm:px-6 sm:text-xs",
                                        profile === 'photography' ? "bg-foreground text-background" : "text-foreground/40"
                                    )}
                                >
                                    {t('common.photography')}
                                </button>
                                <button
                                    onClick={() => handleProfileSelect('art')}
                                    aria-pressed={profile === 'art'}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[10px] tracking-widest uppercase transition-all duration-500 sm:px-6 sm:text-xs",
                                        profile === 'art' ? "bg-foreground text-background" : "text-foreground/40"
                                    )}
                                >
                                    {t('common.fineArt')}
                                </button>
                            </div>

                            {/* Links */}
                            <div className="flex flex-col items-center space-y-6">
                                {links.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="text-center font-heading text-2xl text-foreground hover:text-accent transition-colors sm:text-3xl"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="w-12 h-px bg-foreground/10" />

                            <div className="flex flex-col items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <ThemeToggle />
                                    <LanguageSwitcher />
                                </div>

                                <div className="flex gap-8 text-foreground/40">
                                    {socialLinks.map((link) => (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={link.name}
                                            className="hover:text-foreground transition-colors text-xs tracking-widest uppercase"
                                        >
                                            {link.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
