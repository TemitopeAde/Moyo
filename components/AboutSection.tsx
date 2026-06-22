'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import { useEffect, useState } from 'react';
interface AboutSectionProps {
    profileType: 'photography' | 'art';
}

export default function AboutSection({ profileType }: AboutSectionProps) {
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const [cmsAbout, setCmsAbout] = useState<{ text: string; image: string } | null>(null);

    useEffect(() => {
        fetch('/api/content')
            .then((res) => res.json())
            .then((data) => setCmsAbout(data.content?.about))
            .catch(() => null);
    }, []);

    const headline = profileType === 'photography'
        ? t('about.photography.headline')
        : t('about.art.headline');

    const text1 = cmsAbout?.text || (profileType === 'photography'
        ? t('about.photography.text1')
        : t('about.art.text1'));

    const text2 = profileType === 'photography'
        ? t('about.photography.text2')
        : t('about.art.text2');

    return (
        <section id="about" className="relative overflow-hidden border-t border-foreground/5 bg-background py-24 text-foreground md:py-32 lg:py-40">
            <div className="container mx-auto grid items-center gap-14 px-6 md:grid-cols-2 md:px-12 lg:gap-24">
                {/* Visual Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="relative mx-auto aspect-4/5 w-full max-w-sm overflow-hidden border border-foreground/5 bg-surface md:max-w-none"
                >
                    <div className="absolute inset-0 bg-black/10 z-10" />
                    <div
                        className="h-full w-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${cmsAbout?.image || '/profile-portrait.jpg'}')` }}
                    />
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="space-y-8 md:space-y-12"
                >
                    <div className="space-y-4">
                        <span className="text-accent text-[10px] tracking-[0.28em] uppercase md:tracking-[0.4em]">{t('common.practice')}</span>
                        <h2 className="text-4xl font-heading leading-tight md:text-6xl">
                            {headline}
                        </h2>
                    </div>

                    <div className="max-w-lg space-y-6 md:space-y-8">
                        <p className="text-base leading-relaxed tracking-wide text-foreground/50 md:text-lg">
                            {text1}
                        </p>
                        <p className="text-base leading-relaxed tracking-wide text-foreground/50 md:text-lg">
                            {text2}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-foreground/10 pt-8">
                        <div className="space-y-1">
                            <p className="text-[10px] tracking-widest text-foreground/30 uppercase">Ijabiken Moyo</p>
                            <p className="text-[10px] tracking-widest text-accent uppercase underline underline-offset-8 cursor-pointer hover:text-foreground transition-colors">
                                {t('common.readFullBio')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
