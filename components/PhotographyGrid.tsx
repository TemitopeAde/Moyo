'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

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

export default function PhotographyGrid() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/photography-catalog')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
            })
            .catch(err => console.error('Failed to fetch photography catalog', err))
            .finally(() => setIsLoading(false));
    }, []);

    const items = useMemo(() => {
        return categories.flatMap((category) =>
            (category.images || []).map((image, index) => ({
                ...image,
                categoryName: category.name,
                categorySlug: category.slug,
                span: index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1',
            }))
        );
    }, [categories]);

    const visibleItems =
        activeCategory === 'all' ? items : items.filter((item) => item.categorySlug === activeCategory);

    return (
        <section id="photography" className="bg-background py-24 md:py-32">
            <div className="container mx-auto px-6 md:px-12">
                <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end md:gap-8">
                    <div className="space-y-4">
                        <span className="block text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">{t('photography.selectedPortfolio')}</span>
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
                        All
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
                            {category.name}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="border border-foreground/10 py-20 text-center text-[10px] uppercase tracking-[0.4em] text-foreground/30">
                        Loading portfolio
                    </div>
                )}

                {!isLoading && visibleItems.length === 0 && (
                    <div className="border border-foreground/10 py-20 text-center text-[10px] uppercase tracking-[0.4em] text-foreground/30">
                        No photography catalog images yet.
                    </div>
                )}

                {visibleItems.length > 0 && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:auto-rows-[minmax(280px,1fr)] md:gap-8">
                    {visibleItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`relative group min-h-[280px] overflow-hidden bg-surface sm:min-h-[340px] md:min-h-[360px] ${item.span}`}
                        >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 z-10" />
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: `url(${item.image_url})` }}
                                role="img"
                                aria-label={item.alt_text || item.title || item.categoryName}
                            />

                            <div className="absolute bottom-8 left-8 z-20 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-accent">{item.categoryName}</p>
                                {item.title && <h3 className="text-xl font-heading text-white">{item.title}</h3>}
                            </div>
                        </motion.div>
                    ))}
                </div>
                )}
            </div>
        </section>
    );
}
