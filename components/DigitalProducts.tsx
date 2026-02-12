'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

const products = [
    { id: 1, title: 'Editorial Presets Vol. 1', price: '$45.00', details: '10 Lightroom Presets', image: '/digital_1.webp' },
    { id: 2, title: 'Darkroom Masterclass', price: '$120.00', details: 'Video Course (3 Hours)', image: '/digital_2.webp' },
    { id: 3, title: 'Fine Art Texture Pack', price: '$30.00', details: '50 High-Res Overlays', image: '/digital_3.webp' }
];

export default function DigitalProducts() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    return (
        <section id="digital-shop" className="py-40 bg-background border-t border-white/5">
            <div className="container mx-auto px-6 md:px-12">
                <header className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="space-y-4">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('shop.creativeToolkit')}</span>
                        <h2 className="text-5xl md:text-7xl font-heading text-white italic">{t('shop.digitalShop')}</h2>
                    </div>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase max-w-[200px] border-l border-white/10 pl-6 pb-2">
                        {t('shop.description')}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="group cursor-pointer space-y-8"
                        >
                            <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden border border-white/5">
                                <div
                                    className="w-full h-full bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                    style={{ backgroundImage: `url(${product.image})` }}
                                />
                                <button className="absolute inset-x-0 bottom-0 py-6 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 bg-white">
                                    <span className="text-[10px] tracking-[0.4em] uppercase text-black font-bold">{t('shop.purchaseNow')}</span>
                                </button>
                            </div>

                            <div className="flex justify-between items-start border-t border-white/10 pt-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-heading text-white group-hover:text-gold transition-colors">{product.title}</h3>
                                    <span className="text-[10px] tracking-widest text-white/30 uppercase font-body">{product.details}</span>
                                </div>
                                <span className="text-[10px] tracking-widest text-gold font-body uppercase pr-2">{product.price}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
