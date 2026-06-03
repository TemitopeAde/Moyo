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
        <section id="photography" className="py-32 bg-background">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div className="space-y-4">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase block">{t('photography.selectedPortfolio')}</span>
                        <h2 className="text-4xl md:text-6xl font-heading text-foreground font-light">
                            <span className="italic">{t('photography.visualProximity')}</span>
                        </h2>
                    </div>
                    <p className="text-foreground/40 text-sm max-w-xs font-body tracking-wide leading-relaxed">
                        {t('photography.gridDescription')}
                    </p>
                </div>

                <div className="mb-12 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={`px-5 py-3 text-[10px] uppercase tracking-[0.3em] border transition-colors ${
                            activeCategory === 'all'
                                ? 'border-gold bg-gold text-black'
                                : 'border-foreground/10 text-foreground/50 hover:border-gold hover:text-gold'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveCategory(category.slug)}
                            className={`px-5 py-3 text-[10px] uppercase tracking-[0.3em] border transition-colors ${
                                activeCategory === category.slug
                                    ? 'border-gold bg-gold text-black'
                                    : 'border-foreground/10 text-foreground/50 hover:border-gold hover:text-gold'
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
                <div className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[minmax(280px,1fr)] gap-8">
                    {visibleItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`relative group min-h-[360px] overflow-hidden bg-surface ${item.span}`}
                        >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 z-10" />
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: `url(${item.image_url})` }}
                                role="img"
                                aria-label={item.alt_text || item.title || item.categoryName}
                            />

                            <div className="absolute bottom-8 left-8 z-20 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gold">{item.categoryName}</p>
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
