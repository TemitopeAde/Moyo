'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import { useEffect, useState } from 'react';

// Exported Masked Line inside Hero so we don't need another file optionally,
// or we can import from MaskedText
import { MaskedLine } from '@/components/ui/MaskedText';

interface HeroProps {
    profileType: 'photography' | 'art';
}

export default function Hero({ profileType }: HeroProps) {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    const [isInitialLoad, setIsInitialLoad] = useState<boolean | null>(null);

    useEffect(() => {
        const played = sessionStorage.getItem('moreli_intro_played');
        if (!played) {
            setIsInitialLoad(true);
            sessionStorage.setItem('moreli_intro_played', 'true');
        } else {
            setIsInitialLoad(false);
        }
    }, []);

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

    const parts = headline.split(',').map((part: string, i: number, arr: string[]) =>
        part + (i < arr.length - 1 ? ',' : '')
    );

    // Timing parameters according to Moreli animation analysis
    const isFirst = isInitialLoad === true;
    const durationText = isFirst ? 0.7 : 0.5;
    const delayTextStart = isFirst ? 0.35 : 0.1;
    const staggerText = isFirst ? 0.08 : 0.05;

    // Do not render anything until we know if it's initial load, to prevent flash
    if (isInitialLoad === null) return null;

    return (
        <section className="relative h-[90vh] md:h-screen w-full overflow-hidden flex items-center justify-center p-6 prose-none">
            {/* Background Image: No parallax, only relax scale */}
            <div className="absolute inset-0 z-0 bg-background overflow-hidden">
                <div className="absolute inset-0 bg-background/60 z-10" />
                <motion.div
                    initial={isFirst ? { opacity: 0, scale: 1.035 } : { opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: isFirst ? 1.0 : 0.8,
                        ease: [0.22, 1, 0.36, 1] // Moreli exact easing
                    }}
                    className="w-full h-full bg-neutral-900"
                    style={{
                        backgroundImage: `url('/${profileType}_hero.webp')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        willChange: 'transform, opacity'
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-20 text-center max-w-5xl">
                <div className="space-y-8">

                    <div className="overflow-hidden">
                        <motion.p
                            initial={isFirst ? { y: "110%", opacity: 0 } : { y: 0, opacity: 1 }}
                            animate={{ y: "0%", opacity: 1 }}
                            transition={{ duration: durationText, delay: delayTextStart - 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-gold"
                        >
                            {profileType}
                        </motion.p>
                    </div>

                    <h2 className="text-4xl md:text-7xl lg:text-8xl font-heading text-foreground leading-[1.1] font-light">
                        {parts.map((p: string, i: number) => (
                            <MaskedLine
                                key={i}
                                delay={delayTextStart + i * staggerText}
                                duration={durationText}
                            >
                                <span className="block">{p}</span>
                            </MaskedLine>
                        ))}
                    </h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: delayTextStart + parts.length * staggerText + 0.2 }}
                        className="flex flex-col items-center gap-10 pt-4"
                    >
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
                    </motion.div>
                </div>
            </div>

            {/* Profile specific detail */}
            <div className="absolute bottom-12 right-12 hidden lg:block overflow-hidden">
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
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
