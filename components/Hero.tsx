'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

interface HeroProps {
    profileType: 'photography' | 'art';
}

export default function Hero({ profileType }: HeroProps) {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    const headline = profileType === 'photography'
        ? t('hero.photography')
        : t('hero.art');

    const subtext = profileType === 'photography'
        ? t('hero.photographySub')
        : t('hero.artSub');

    const cta = profileType === 'photography'
        ? t('hero.ctaPhotography')
        : t('hero.ctaArt');

    const link = profileType === 'photography' ? "/photography/bookings" : "/art/works";
    const accent = profileType === 'photography' ? "intentional" : "identity";

    return (
        <section className="relative h-[90vh] md:h-screen w-full overflow-hidden flex items-center justify-center p-6 prose-none">
            {/* Background with slow cinematic pan */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-background/60 z-10" />
                <div
                    className="w-full h-full bg-neutral-900 animate-slow-pan"
                    style={{
                        backgroundImage: `url('/${profileType}_hero.webp')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-20 text-center max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <p className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-gold">
                        {profileType}
                    </p>

                    <h2 className="text-4xl md:text-7xl lg:text-8xl font-heading text-foreground leading-[1.1] font-light">
                        {headline.split(',').map((part: string, i: number) => (
                            <span key={i} className="block">
                                {part}{i < headline.split(',').length - 1 ? ',' : ''}
                            </span>
                        ))}
                    </h2>

                    <div className="flex flex-col items-center gap-10 pt-4">
                        <p className="text-sm md:text-lg text-foreground/50 font-body max-w-xl mx-auto tracking-wide">
                            {subtext}
                        </p>

                        <Link
                            href={link}
                            className="group relative inline-flex items-center gap-4 px-10 py-4 bg-foreground text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-gold transition-colors duration-500"
                        >
                            {cta}
                            <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Profile specific detail */}
            <div className="absolute bottom-12 right-12 hidden lg:block overflow-hidden">
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    transition={{ delay: 1, duration: 2, ease: "circOut" }}
                    className="flex items-center gap-4"
                >
                    <div className="h-[1px] w-24 bg-foreground/20" />
                    <span className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 italic">
                        Exploring {accent}
                    </span>
                </motion.div>
            </div>
        </section>
    );
}
