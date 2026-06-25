'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';

const products = [
    { id: 1, title: 'Editorial Presets Vol. 1', price: '$45.00', details: '10 Lightroom Presets', image: '/digital_1.webp' },
    { id: 2, title: 'Darkroom Masterclass', price: '$120.00', details: 'Video Course (3 Hours)', image: '/digital_2.webp' },
    { id: 3, title: 'Fine Art Texture Pack', price: '$30.00', details: '50 High-Res Overlays', image: '/digital_3.webp' }
];

export default function DigitalProducts() {
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);

    return (
        <section id="digital-shop" className="border-t border-white/5 bg-background py-24 md:py-32 lg:py-40">
            <div className="container mx-auto px-6 md:px-12">
                <header className="mb-14 flex flex-col items-start justify-between gap-8 md:mb-24 md:flex-row md:items-end">
                    <div className="space-y-4">
                        <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">{t('shop.creativeToolkit')}</span>
                        <h2 className="text-3xl font-heading italic text-white sm:text-4xl md:text-5xl">{t('shop.digitalShop')}</h2>
                    </div>
                    <p className="max-w-xs border-l border-white/10 pb-2 pl-6 text-[10px] uppercase tracking-[0.22em] text-white/40 md:max-w-[200px] md:tracking-[0.3em]">
                        {t('shop.description')}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="group cursor-pointer space-y-6 md:space-y-8"
                        >
                            <GlareHover
                                width="100%"
                                height="auto"
                                background="transparent"
                                borderRadius="2px"
                                borderColor="rgba(255,255,255,0.08)"
                                glareOpacity={0.2}
                                glareAngle={-30}
                                glareSize={180}
                                transitionDuration={760}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                                    <div
                                        className="h-full w-full bg-cover bg-center grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                                        style={{ backgroundImage: `url(${product.image})` }}
                                    />
                                    <button className="absolute inset-x-0 bottom-0 z-20 translate-y-0 bg-white py-5 text-center transition-transform duration-500 md:translate-y-full md:group-hover:translate-y-0">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-black md:tracking-[0.4em]">{t('shop.purchaseNow')}</span>
                                    </button>
                                </div>

                                <div className="flex items-start justify-between gap-4 border-t border-white/10 px-4 py-6">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-heading text-white transition-colors group-hover:text-accent">{translateText(product.title)}</h3>
                                        <span className="font-body text-[10px] uppercase tracking-widest text-white/30">{translateText(product.details)}</span>
                                    </div>
                                    <span className="font-body pr-2 text-[10px] uppercase tracking-widest text-accent">{product.price}</span>
                                </div>
                            </GlareHover>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
