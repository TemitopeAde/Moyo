'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { getCloudinaryPreviewUrl, getImagePreviewSrcSet } from '@/lib/mediaUrl';

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
    cover_image_url: string;
    images: CatalogImage[];
};

type CatalogGridItem = CatalogImage & {
    categoryName: string;
    categorySlug: string;
    categoryDescription: string;
};

type PortfolioCardProps = {
    item: CatalogGridItem;
    index: number;
    activeCategory: string;
    shouldReduceMotion: boolean | null;
    enablePointerMotion: boolean;
    translateText: (text: string) => string;
    onSelect: (item: CatalogGridItem) => void;
};

type CategoryOverviewCardProps = {
    category: CatalogCategory;
    index: number;
    shouldReduceMotion: boolean | null;
    enablePointerMotion: boolean;
    translateText: (text: string) => string;
    onSelect: (slug: string) => void;
};

const initialCategoryCount = 6;
const categoryBatchSize = 6;

function getCategoryDisplayImage(category: CatalogCategory) {
    return category.cover_image_url || category.images?.[0]?.image_url || '';
}

function CategoryOverviewCard({
    category,
    index,
    shouldReduceMotion,
    enablePointerMotion,
    translateText,
    onSelect,
}: CategoryOverviewCardProps) {
    const canAnimatePointer = enablePointerMotion && !shouldReduceMotion;
    const imageUrl = getCategoryDisplayImage(category);
    const imageCount = category.images?.length || 0;

    return (
        <motion.button
            type="button"
            onClick={() => onSelect(category.slug)}
            layout={!shouldReduceMotion}
            variants={{
                hidden: { opacity: 0, y: 48, filter: 'blur(10px)' },
                visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: {
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1],
                    },
                },
            }}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-10% 0px" }}
            whileHover={canAnimatePointer ? { y: index % 2 === 0 ? -10 : -14 } : undefined}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group block min-w-0 w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            <GlareHover
                width="100%"
                height="auto"
                background="var(--color-surface)"
                borderRadius="2px"
                borderColor="rgba(255,255,255,0.08)"
                glareOpacity={0.16}
                glareAngle={-30}
                glareSize={180}
                transitionDuration={760}
            >
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <motion.img
                        src={getCloudinaryPreviewUrl(imageUrl, { width: 900 })}
                        srcSet={getImagePreviewSrcSet(imageUrl, [450, 900, 1350])}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        alt={translateText(category.name)}
                        className="h-full w-full object-cover will-change-transform"
                        loading="lazy"
                        decoding="async"
                        initial={shouldReduceMotion ? false : { scale: 1.04 }}
                        animate={shouldReduceMotion ? undefined : { scale: 1.01 }}
                        whileHover={canAnimatePointer ? { scale: 1.08 } : undefined}
                        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/38 to-black/0" />
                    <div className="absolute inset-x-0 bottom-0 min-w-0 p-4 sm:p-6">
                        <h3 className="image-overlay-caption font-heading text-2xl italic [overflow-wrap:anywhere] sm:text-3xl">
                            {translateText(category.name)}
                        </h3>
                        <p className="image-overlay-meta mt-3 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.24em]">
                            {imageCount} {translateText(imageCount === 1 ? 'image' : 'images')}
                        </p>
                    </div>
                    <div className="catalogue-explore-overlay pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 ease-out md:group-hover:opacity-100">
                        <span className="catalogue-explore-badge translate-y-2 px-5 py-3 text-[10px] uppercase tracking-[0.3em] opacity-0 transition-all duration-500 ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100">
                            {translateText('Explore')}
                        </span>
                    </div>
                </div>
            </GlareHover>
        </motion.button>
    );
}

function PortfolioCard({
    item,
    index,
    activeCategory,
    shouldReduceMotion,
    enablePointerMotion,
    translateText,
    onSelect,
}: PortfolioCardProps) {
    const canAnimatePointer = enablePointerMotion && !shouldReduceMotion;
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const smoothX = useSpring(pointerX, { stiffness: 90, damping: 22, mass: 0.35 });
    const smoothY = useSpring(pointerY, { stiffness: 90, damping: 22, mass: 0.35 });
    const rotateX = useTransform(smoothY, [-1, 1], [3.5, -3.5]);
    const rotateY = useTransform(smoothX, [-1, 1], [-3.5, 3.5]);
    const imageX = useTransform(smoothX, [-1, 1], ['-3.5%', '3.5%']);
    const imageY = useTransform(smoothY, [-1, 1], ['-3%', '3%']);

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!canAnimatePointer || event.pointerType !== 'mouse') return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        pointerX.set(x);
        pointerY.set(y);
    };

    const handlePointerLeave = () => {
        pointerX.set(0);
        pointerY.set(0);
    };

    return (
        <motion.button
            key={`${activeCategory}-${item.id}`}
            type="button"
            onClick={() => onSelect(item)}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            layout={!shouldReduceMotion}
            variants={{
                hidden: { opacity: 0, y: 48, filter: 'blur(10px)' },
                visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: {
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1],
                    },
                },
            }}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 24, filter: 'blur(8px)', transition: { duration: 0.28 } }}
            viewport={{ once: true, margin: "-10% 0px" }}
            whileHover={canAnimatePointer ? { y: index % 2 === 0 ? -10 : -14 } : undefined}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={canAnimatePointer ? { rotateX, rotateY, transformPerspective: 1200 } : undefined}
            className="group mb-5 block min-w-0 w-full cursor-pointer break-inside-avoid text-left outline-none focus-visible:ring-2 focus-visible:ring-accent md:mb-8"
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
                    <motion.img
                        src={getCloudinaryPreviewUrl(item.image_url, { width: 900, crop: 'fit' })}
                        srcSet={getImagePreviewSrcSet(item.image_url, [450, 900, 1350])}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        alt={translateText(item.alt_text || item.title || item.categoryName)}
                        className="h-auto w-full will-change-transform"
                        loading="lazy"
                        decoding="async"
                        initial={shouldReduceMotion ? false : { scale: 1.045, y: 0 }}
                        animate={shouldReduceMotion ? undefined : { scale: 1.015, y: 0 }}
                        whileHover={canAnimatePointer ? { scale: 1.08, y: index % 2 === 0 ? -12 : 12 } : undefined}
                        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                        style={canAnimatePointer ? { x: imageX, y: imageY } : undefined}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out md:group-hover:bg-black/20" />
                </div>

                {item.title && (
                    <motion.div
                        className="px-4 py-4 sm:px-5"
                        initial={false}
                        whileHover={canAnimatePointer ? { y: -2 } : undefined}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h3 className="mt-2 text-lg font-heading text-foreground transition-colors [overflow-wrap:anywhere] group-hover:text-accent">
                            {translateText(item.title)}
                        </h3>
                    </motion.div>
                )}
            </GlareHover>
        </motion.button>
    );
}

export default function PhotographyGrid() {
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);
    const settings = useSiteSettings();
    const shouldReduceMotion = useReducedMotion();
    const [enablePointerMotion, setEnablePointerMotion] = useState(false);
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<CatalogGridItem | null>(null);
    const [renderedCategoryCount, setRenderedCategoryCount] = useState(initialCategoryCount);
    const infiniteScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetch('/api/photography-catalog')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories || []);
            })
            .catch((err) => console.error('Failed to fetch photography catalog', err))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
        const updatePointerMotion = () => setEnablePointerMotion(mediaQuery.matches);

        updatePointerMotion();
        mediaQuery.addEventListener('change', updatePointerMotion);

        return () => mediaQuery.removeEventListener('change', updatePointerMotion);
    }, []);

    const items = useMemo(() => {
        return categories.flatMap((category) => {
            const orderedImages = [...(category.images || [])].sort((a, b) => {
                if (!category.cover_image_url) return 0;
                if (a.image_url === category.cover_image_url) return -1;
                if (b.image_url === category.cover_image_url) return 1;
                return 0;
            });

            return orderedImages.map((image) => ({
                ...image,
                categoryName: category.name,
                categorySlug: category.slug,
                categoryDescription: category.description,
            }));
        });
    }, [categories]);

    const visibleItems = useMemo(
        () => (activeCategory === 'all' ? items : items.filter((item) => item.categorySlug === activeCategory)),
        [activeCategory, items]
    );
    const isAllCategory = activeCategory === 'all';
    const overviewCategories = useMemo(
        () => categories.filter((category) => getCategoryDisplayImage(category)),
        [categories]
    );
    const hasVisibleContent = isAllCategory ? overviewCategories.length > 0 : visibleItems.length > 0;
    const renderedCategories = overviewCategories.slice(0, renderedCategoryCount);
    const hasMoreContent = isAllCategory && renderedCategoryCount < overviewCategories.length;
    const selectedIndex = selectedItem ? visibleItems.findIndex((item) => item.id === selectedItem.id) : -1;
    const canNavigateSelection = visibleItems.length > 1 && selectedIndex >= 0;

    const resetInfiniteScroll = () => {
        setRenderedCategoryCount(initialCategoryCount);
    };

    const showAllCategories = () => {
        resetInfiniteScroll();
        setActiveCategory('all');
    };

    const showCategory = (slug: string) => {
        resetInfiniteScroll();
        setActiveCategory(slug);
    };

    useEffect(() => {
        if (!hasMoreContent) return;
        const sentinel = infiniteScrollRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;

                setRenderedCategoryCount((current) =>
                    Math.min(current + categoryBatchSize, overviewCategories.length)
                );
            },
            { rootMargin: '720px 0px 720px 0px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMoreContent, overviewCategories.length]);

    const showPreviousItem = useCallback(() => {
        if (!canNavigateSelection) return;
        const nextIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
        setSelectedItem(visibleItems[nextIndex]);
    }, [canNavigateSelection, selectedIndex, visibleItems]);

    const showNextItem = useCallback(() => {
        if (!canNavigateSelection) return;
        const nextIndex = (selectedIndex + 1) % visibleItems.length;
        setSelectedItem(visibleItems[nextIndex]);
    }, [canNavigateSelection, selectedIndex, visibleItems]);

    useEffect(() => {
        if (!selectedItem) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedItem(null);
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPreviousItem();
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNextItem();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedItem, showNextItem, showPreviousItem]);

    return (
        <section id="photography" className="bg-background py-20 sm:py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 md:px-12">
                <div className="mb-10 flex min-w-0 flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end md:gap-8">
                    <div className="min-w-0 space-y-4">
                        <span className="block text-accent text-[10px] uppercase tracking-[0.22em] [overflow-wrap:anywhere] md:tracking-[0.5em]">
                            {translateText(settings.portfolio.eyebrow || t('photography.selectedPortfolio'))}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading text-foreground font-light [overflow-wrap:anywhere]">
                            <span className="italic">{translateText(settings.portfolio.title || t('photography.visualProximity'))}</span>
                        </h2>
                    </div>
                    <p className="max-w-xs text-sm leading-relaxed tracking-wide text-foreground/40 [overflow-wrap:anywhere] md:text-right">
                        {translateText(settings.portfolio.description || t('photography.gridDescription'))}
                    </p>
                </div>

                <div className="mb-10 flex flex-wrap gap-2 sm:gap-3 md:mb-12">
                    <button
                        type="button"
                        onClick={showAllCategories}
                        className={`px-3 py-2.5 text-[9px] uppercase tracking-[0.16em] border transition-colors sm:px-5 sm:py-3 sm:text-[10px] sm:tracking-[0.3em] ${
                            activeCategory === 'all'
                                ? 'border-accent bg-accent text-white'
                                : 'border-foreground/10 text-foreground/50 hover:border-accent hover:text-accent'
                        }`}
                    >
                        {translateText('All')}
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => showCategory(category.slug)}
                            className={`px-3 py-2.5 text-[9px] uppercase tracking-[0.16em] border transition-colors sm:px-5 sm:py-3 sm:text-[10px] sm:tracking-[0.3em] ${
                                activeCategory === category.slug
                                    ? 'border-accent bg-accent text-white'
                                    : 'border-foreground/10 text-foreground/50 hover:border-accent hover:text-accent'
                            }`}
                        >
                            {translateText(category.name)}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="border border-foreground/10 px-4 py-20 text-center text-[10px] uppercase tracking-[0.2em] text-foreground/30 sm:tracking-[0.4em]">
                        {translateText('Loading portfolio')}
                    </div>
                )}

                {!isLoading && !hasVisibleContent && (
                    <div className="border border-foreground/10 px-4 py-20 text-center text-[10px] uppercase tracking-[0.2em] text-foreground/30 sm:tracking-[0.4em]">
                        {translateText('No photography catalog images yet.')}
                    </div>
                )}

                {isAllCategory && overviewCategories.length > 0 && (
                    <motion.div
                        key="category-overview"
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.08,
                                    delayChildren: 0.05,
                                },
                            },
                        }}
                    >
                        {renderedCategories.map((category, index) => (
                            <CategoryOverviewCard
                                key={category.id}
                                category={category}
                                index={index}
                                shouldReduceMotion={shouldReduceMotion}
                                enablePointerMotion={enablePointerMotion}
                                translateText={translateText}
                                onSelect={showCategory}
                            />
                        ))}
                    </motion.div>
                )}

                {!isAllCategory && visibleItems.length > 0 && (
                    <motion.div
                        key={activeCategory}
                        className="columns-1 gap-5 sm:columns-2 lg:columns-3 md:gap-8"
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.08,
                                    delayChildren: 0.05,
                                },
                            },
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {visibleItems.map((item, index) => (
                                <PortfolioCard
                                    key={`${activeCategory}-${item.id}`}
                                    item={item}
                                    index={index}
                                    activeCategory={activeCategory}
                                    shouldReduceMotion={shouldReduceMotion}
                                    enablePointerMotion={enablePointerMotion}
                                    translateText={translateText}
                                    onSelect={setSelectedItem}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!isLoading && hasVisibleContent && (
                    <div ref={infiniteScrollRef} className="flex min-h-24 items-center justify-center py-12">
                        {hasMoreContent ? (
                            <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/25 sm:tracking-[0.4em]">
                                {translateText('Loading more')}
                            </span>
                        ) : (
                            <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/20 sm:tracking-[0.4em]">
                                {translateText('End of catalogue')}
                            </span>
                        )}
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
                            {canNavigateSelection && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            showPreviousItem();
                                        }}
                                        className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/55 text-xl text-white/75 backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:left-4 sm:h-12 sm:w-12"
                                        aria-label={translateText('Previous image')}
                                    >
                                        ←
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            showNextItem();
                                        }}
                                        className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/55 text-xl text-white/75 backdrop-blur-md transition-colors hover:border-accent hover:text-accent sm:right-4 sm:h-12 sm:w-12 lg:right-[340px]"
                                        aria-label={translateText('Next image')}
                                    >
                                        →
                                    </button>
                                </>
                            )}
                            <div className="flex max-h-[62vh] items-center justify-center bg-black lg:max-h-[92vh]">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedItem.id}
                                        src={getCloudinaryPreviewUrl(selectedItem.image_url, { width: 1800, crop: 'fit' })}
                                        srcSet={getImagePreviewSrcSet(selectedItem.image_url, [900, 1400, 1800])}
                                        sizes="(min-width: 1024px) calc(100vw - 320px), 100vw"
                                        alt={translateText(selectedItem.alt_text || selectedItem.title || selectedItem.categoryName)}
                                        className="max-h-[62vh] w-auto max-w-full object-contain lg:max-h-[92vh]"
                                        decoding="async"
                                        initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={shouldReduceMotion ? undefined : { opacity: 0, x: -24 }}
                                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </AnimatePresence>
                            </div>

                            <div className="flex min-w-0 flex-col gap-6 overflow-y-auto p-5 sm:p-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-accent [overflow-wrap:anywhere] sm:tracking-[0.35em]">
                                        {translateText(selectedItem.categoryName)}
                                    </p>
                                    <h2 className="text-3xl font-heading italic text-foreground [overflow-wrap:anywhere] sm:text-4xl">
                                        {translateText(selectedItem.title || selectedItem.categoryName)}
                                    </h2>
                                    {selectedItem.categoryDescription && (
                                        <p className="text-sm leading-relaxed text-foreground/45 [overflow-wrap:anywhere]">
                                            {translateText(selectedItem.categoryDescription)}
                                        </p>
                                    )}
                                </div>

                                {selectedItem.alt_text && (
                                    <p className="border-t border-foreground/10 pt-5 text-sm leading-relaxed text-foreground/55 [overflow-wrap:anywhere]">
                                        {translateText(selectedItem.alt_text)}
                                    </p>
                                )}

                                <p className="mt-auto border-t border-foreground/10 pt-5 text-[10px] uppercase tracking-[0.24em] text-foreground/25">
                                    {canNavigateSelection
                                        ? `${selectedIndex + 1} / ${visibleItems.length} · ${translateText('Use arrows to browse')}`
                                        : translateText('Tap outside to close')}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
