'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function ClientGalleryPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    // Selection state for demo
    const [selectedImages, setSelectedImages] = useState<number[]>([]);
    const totalImages = 8;

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    const toggleSelection = (id: number) => {
        if (selectedImages.includes(id)) {
            setSelectedImages(selectedImages.filter(i => i !== id));
        } else {
            setSelectedImages([...selectedImages, id]);
        }
    };

    const selectionStatusText = t('clientGallery.selectionStatus')
        .replace('{count}', selectedImages.length.toString())
        .replace('{total}', totalImages.toString());

    return (
        <main className="bg-background min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-grow pt-40 container mx-auto px-6 md:px-12 pb-32">
                {!isLoggedIn ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto py-20 bg-white/5 p-12 text-center space-y-8 backdrop-blur-sm border border-white/5"
                    >
                        <div className="space-y-4">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('clientGallery.privateAccess')}</span>
                            <h1 className="text-3xl font-heading text-white">{t('clientGallery.clientPortfolio')}</h1>
                            <p className="text-white/40 text-xs font-body tracking-wider leading-relaxed">
                                {t('clientGallery.enterAccessCodeText')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <input
                                type="password"
                                placeholder={t('clientGallery.accessCodePlaceholder')}
                                className="w-full bg-white/5 border border-white/10 rounded-sm py-4 text-center text-white text-[10px] tracking-[0.5em] focus:outline-none focus:border-gold transition-colors placeholder:text-white/20"
                            />
                            <button
                                onClick={() => setIsLoggedIn(true)}
                                className="w-full bg-white text-black text-[10px] tracking-[0.4em] uppercase py-4 font-bold hover:bg-gold transition-colors duration-500"
                            >
                                {t('clientGallery.enterGallery')}
                            </button>
                        </div>

                        <p className="text-[10px] text-white/20 tracking-widest uppercase cursor-pointer hover:text-white transition-colors">
                            {t('clientGallery.lostCode')}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-16"
                    >
                        <div className="text-center space-y-4">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('clientGallery.galleryId')}</span>
                            <h1 className="text-4xl md:text-6xl font-heading text-white italic">{t('clientGallery.collectionName')}</h1>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: totalImages }, (_, i) => i + 1).map((i) => (
                                <div
                                    key={i}
                                    className={`aspect-square relative group cursor-pointer overflow-hidden border ${selectedImages.includes(i) ? 'border-gold' : 'border-transparent'}`}
                                    onClick={() => toggleSelection(i)}
                                >
                                    <div className={`absolute inset-0 bg-black/40 transition-opacity z-10 flex items-center justify-center ${selectedImages.includes(i) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button className={`text-[10px] border px-4 py-2 uppercase tracking-widest transition-colors ${selectedImages.includes(i) ? 'bg-gold border-gold text-black' : 'border-white text-white hover:bg-white hover:text-black'}`}>
                                            {selectedImages.includes(i) ? 'Selected' : t('clientGallery.select')}
                                        </button>
                                    </div>
                                    <div className="w-full h-full bg-neutral-900 group-hover:scale-105 transition-transform duration-700 bg-cover bg-center" style={{ backgroundImage: `url('/photo_${i % 5 + 1}.webp')` }} />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-8 py-12 border-t border-white/5 sticky bottom-0 bg-background/90 backdrop-blur-lg z-30">
                            <p className="text-white/40 text-sm italic">{selectionStatusText}</p>
                            <button className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.4em] uppercase text-white hover:border-gold hover:text-gold transition-colors duration-500">
                                {t('clientGallery.approveSelection')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <Footer />
        </main>
    );
}
