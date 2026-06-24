'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';

type CatalogImage = {
    id: number;
    category_id: number;
    image_url: string;
    title: string;
    alt_text: string;
    display_order: number;
};

type CatalogCategory = {
    id: number;
    name: string;
    slug: string;
    description: string;
    images: CatalogImage[];
};

type CatalogGridItem = CatalogImage & {
    categoryName: string;
    categorySlug: string;
    categoryDescription: string;
};

export default function PhotographyGrid() {
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<CatalogGridItem | null>(null);

    useEffect(() => {
        fetch('/api/photography-catalog')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories || []);
            })
            .catch((err) => console.error('Failed to fetch photography catalog', err))
            .finally(() => setIsLoading(false));
    }, []);

    const items = useMemo(() => {
        return categories.flatMap((category) =>
            (category.images || []).map((image) => ({
                ...image,
                categoryName: category.name,
                categorySlug: category.slug,
                categoryDescription: category.description,
            }))
        );
    }, [categories]);

    const visibleItems =
        activeCategory === 'all' ? items : items.filter((item) => item.categorySlug === activeCategory);

    useEffect(() => {
        if (!selectedItem) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedItem(null);
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedItem]);

    return (
        <section id="photography" className="bg-background py-24 md:py-32">
            <div className="container mx-auto px-6 md:px-12">
                <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end md:gap-8">
                    <div className="space-y-4">
                        <span className="block text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">
                            {t('photography.selectedPortfolio')}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-heading text-foreground font-light">
                            <span className="italic">{t('photography.visualProximity')}</span>
                        </h2>
                    </div>
                    <p className="text-foreground/40 text-sm max-w-xs font-body tracking-wide leading-relaxed">
                        {t('photography.gridDescription')}
                    </p>
                </div>

                <div className="mb-10 flex flex-wrap gap-3 md:mb-12">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-3 text-[10px] uppercase tracking-[0.2em] border transition-colors sm:px-5 sm:tracking-[0.3em] ${
                            activeCategory === 'all'
                                ? 'border-accent bg-accent text-black'
                                : 'border-foreground/10 text-foreground/50 hover:border-accent hover:text-accent'
                        }`}
                    >
                        {translateText('All')}
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveCategory(category.slug)}
                            className={`px-4 py-3 text-[10px] uppercase tracking-[0.2em] border transition-colors sm:px-5 sm:tracking-[0.3em] ${
                                activeCategory === category.slug
                                    ? 'border-accent bg-accent text-black'
                                    : 'border-foreground/10 text-foreground/50 hover:border-accent hover:text-accent'
                            }`}
                        >
                            {translateText(category.name)}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="border border-foreground/10 py-20 text-center text-[10px] uppercase tracking-[0.4em] text-foreground/30">
                        {translateText('Loading portfolio')}
                    </div>
                )}

                {!isLoading && visibleItems.length === 0 && (
                    <div className="border border-foreground/10 py-20 text-center text-[10px] uppercase tracking-[0.4em] text-foreground/30">
                        {translateText('No photography catalog images yet.')}
                    </div>
                )}

                {visibleItems.length > 0 && (
                    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 md:gap-8">
                        {visibleItems.map((item, index) => (
                            <motion.button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: index * 0.06 }}
                                className="group mb-5 block w-full cursor-pointer break-inside-avoid text-left outline-none focus-visible:ring-2 focus-visible:ring-accent md:mb-8"
                            >
                                <GlareHover
                                    width="100%"
                                    height="auto"
                                    background="var(--color-surface)"
                                    borderRadius="2px"
                                    borderColor="rgba(255,255,255,0.08)"
                                    glareOpacity={0.18}
                                    glareAngle={-30}
                                    glareSize={180}
                                    transitionDuration={760}
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={item.image_url}
                                            alt={translateText(item.alt_text || item.title || item.categoryName)}
                                            className="h-auto w-full transition-transform duration-1000 group-hover:scale-[1.02]"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-100 transition-colors duration-500 group-hover:bg-black/35 sm:opacity-0 sm:group-hover:opacity-100">
                                            <span className="border border-white/40 bg-black/50 px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-white">
                                                {translateText('View')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-4 py-4 sm:px-5">
                                        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
                                            {translateText(item.categoryName)}
                                        </p>
                                        {item.title && (
                                            <h3 className="mt-2 text-lg font-heading text-foreground transition-colors group-hover:text-accent">
                                                {translateText(item.title)}
                                            </h3>
                                        )}
                                    </div>
                                </GlareHover>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-sm sm:px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={translateText(selectedItem.title || selectedItem.categoryName)}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 cursor-default"
                            aria-label={translateText('Close catalogue preview')}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden border border-white/10 bg-background shadow-2xl lg:grid-cols-[minmax(0,1fr)_320px]"
                        >
                            <div className="flex max-h-[62vh] items-center justify-center bg-black lg:max-h-[92vh]">
                                <img
                                    src={selectedItem.image_url}
                                    alt={translateText(selectedItem.alt_text || selectedItem.title || selectedItem.categoryName)}
                                    className="max-h-[62vh] w-auto max-w-full object-contain lg:max-h-[92vh]"
                                />
                            </div>

                            <div className="flex flex-col gap-6 overflow-y-auto p-6 sm:p-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-accent">
                                        {translateText(selectedItem.categoryName)}
                                    </p>
                                    <h2 className="text-3xl font-heading italic text-foreground sm:text-4xl">
                                        {translateText(selectedItem.title || selectedItem.categoryName)}
                                    </h2>
                                    {selectedItem.categoryDescription && (
                                        <p className="text-sm leading-relaxed text-foreground/45">
                                            {translateText(selectedItem.categoryDescription)}
                                        </p>
                                    )}
                                </div>

                                {selectedItem.alt_text && (
                                    <p className="border-t border-foreground/10 pt-5 text-sm leading-relaxed text-foreground/55">
                                        {translateText(selectedItem.alt_text)}
                                    </p>
                                )}

                                <div className="mt-auto flex flex-col gap-3">
                                    <a
                                        href={selectedItem.image_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border border-accent/50 px-5 py-4 text-center text-[10px] uppercase tracking-[0.28em] text-accent transition-colors hover:bg-accent hover:text-black"
                                    >
                                        {translateText('Open Full Image')}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedItem(null)}
                                        className="border border-foreground/10 px-5 py-4 text-[10px] uppercase tracking-[0.28em] text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground"
                                    >
                                        {translateText('Close')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
