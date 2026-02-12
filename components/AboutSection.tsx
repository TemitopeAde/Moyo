'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

interface AboutSectionProps {
    profileType: 'photography' | 'art';
}

export default function AboutSection({ profileType }: AboutSectionProps) {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    const headline = profileType === 'photography'
        ? t('about.photography.headline')
        : t('about.art.headline');

    const text1 = profileType === 'photography'
        ? t('about.photography.text1')
        : t('about.art.text1');

    const text2 = profileType === 'photography'
        ? t('about.photography.text2')
        : t('about.art.text2');

    return (
        <section id="about" className="relative py-40 bg-background text-foreground overflow-hidden border-t border-foreground/5">
            <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-24 items-center">
                {/* Visual Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="relative aspect-4/5 bg-surface group"
                >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000 z-10" />
                    <div
                        className="w-full h-full grayscale hover:grayscale-0 transition-all duration-1000 bg-cover bg-center"
                        style={{ backgroundImage: `url('/${profileType}_about.webp')` }}
                    />
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-t border-l border-gold/50" />
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b border-r border-gold/50" />
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="space-y-12"
                >
                    <div className="space-y-4">
                        <span className="text-gold text-[10px] tracking-[0.4em] uppercase">{t('common.practice')}</span>
                        <h2 className="text-4xl md:text-6xl font-heading leading-tight">
                            {headline}
                        </h2>
                    </div>

                    <div className="space-y-8 max-w-lg">
                        <p className="text-foreground/50 font-body leading-relaxed text-lg tracking-wide">
                            {text1}
                        </p>
                        <p className="text-foreground/50 font-body leading-relaxed text-lg tracking-wide">
                            {text2}
                        </p>
                    </div>

                    <div className="pt-8 border-t border-foreground/10 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] tracking-widest text-foreground/30 uppercase">Ijabiken Moyo</p>
                            <p className="text-[10px] tracking-widest text-gold uppercase underline underline-offset-8 cursor-pointer hover:text-foreground transition-colors">
                                {t('common.readFullBio')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
