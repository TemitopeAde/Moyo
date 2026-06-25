'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GalleryMedia from '@/components/GalleryMedia';
import GlareHover from '@/components/GlareHover';

type ClientGallery = {
    id: number;
    client_name: string;
    slug: string;
    images: string[];
    approved_images: string[];
    finished_images: string[];
    payment_verified: boolean;
    payment_url: string;
    review_rating: number | null;
    review_text: string;
    review_submitted_at: string | null;
    is_locked: boolean;
    image_count: number;
    finished_count: number;
};

export default function ClientGalleryPage() {
    const [accessCode, setAccessCode] = useState('');
    const [gallery, setGallery] = useState<ClientGallery | null>(null);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isApproving, setIsApproving] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [approvalMessage, setApprovalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const selectedImageSet = useMemo(() => new Set(selectedImages), [selectedImages]);

    const getFinishedDownloadUrl = (image: string) =>
        `/api/galleries/download?galleryId=${gallery?.id || ''}&accessCode=${encodeURIComponent(accessCode.trim())}&file=${encodeURIComponent(image)}`;

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    const handleAccessSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const code = accessCode.trim();

        setError('');
        setGallery(null);
        setSelectedImages([]);
        setReviewRating(5);
        setReviewText('');
        setReviewMessage('');
        setReviewError('');
        setApprovalMessage('');

        if (!code) {
            setError(t('clientGallery.accessCodeRequired'));
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/galleries/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: code }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t('clientGallery.openError'));
                return;
            }

            setGallery(data.gallery);
            setSelectedImages(data.gallery.approved_images || []);
            setReviewRating(data.gallery.review_rating || 5);
            setReviewText(data.gallery.review_text || '');
            setReviewMessage('');
            setReviewError('');
        } catch {
            setError(t('clientGallery.openRetryError'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetGallery = () => {
        setGallery(null);
        setAccessCode('');
        setError('');
        setSelectedImages([]);
        setReviewRating(5);
        setReviewText('');
        setReviewMessage('');
        setReviewError('');
        setApprovalMessage('');
    };

    const toggleImageSelection = (image: string) => {
        setApprovalMessage('');
        setSelectedImages((current) => {
            const next = new Set(current);
            if (next.has(image)) {
                next.delete(image);
            } else {
                next.add(image);
            }
            return Array.from(next);
        });
    };

    const approveSelection = async () => {
        if (!gallery || selectedImages.length === 0) return;

        setIsApproving(true);
        setError('');
        setApprovalMessage('');

        try {
            const res = await fetch('/api/galleries/approve-selection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessCode: accessCode.trim(),
                    galleryId: gallery.id,
                    images: selectedImages,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t('clientGallery.approveError'));
                return;
            }

            setSelectedImages(data.approved_images || selectedImages);
            setGallery((current) =>
                current ? { ...current, approved_images: data.approved_images || selectedImages } : current
            );
            setApprovalMessage(
                t('clientGallery.approvedMessage')
                    .replace('{count}', data.approved_count.toString())
                    .replace('{unit}', data.approved_count === 1 ? t('ui.imageSingular') : t('ui.images'))
            );
        } catch {
            setError(t('clientGallery.approveRetryError'));
        } finally {
            setIsApproving(false);
        }
    };

    const submitReview = async () => {
        if (!gallery || isSubmittingReview) return;

        setIsSubmittingReview(true);
        setReviewError('');
        setReviewMessage('');

        try {
            const res = await fetch('/api/galleries/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessCode: accessCode.trim(),
                    galleryId: gallery.id,
                    rating: reviewRating,
                    reviewText,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setReviewError(data.error || t('clientGallery.reviewError'));
                return;
            }

            setGallery((current) =>
                current
                    ? {
                        ...current,
                        review_rating: data.review_rating,
                        review_text: data.review_text || reviewText.trim(),
                        review_submitted_at: data.review_submitted_at,
                    }
                    : current
            );
            setReviewText(data.review_text || reviewText.trim());
            setReviewMessage(t('clientGallery.reviewThanks'));
        } catch {
            setReviewError(t('clientGallery.reviewRetryError'));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <main className="bg-background min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-grow pt-36 md:pt-52 container mx-auto px-6 md:px-12 pb-32">
                {!gallery ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto max-w-md"
                    >
                        <GlareHover
                            width="100%"
                            height="auto"
                            background="rgba(255,255,255,0.05)"
                            borderRadius="2px"
                            borderColor="rgba(255,255,255,0.08)"
                            glareOpacity={0.16}
                            glareAngle={-30}
                            glareSize={170}
                            transitionDuration={780}
                            contentClassName="space-y-8 p-12 py-20 text-center backdrop-blur-sm"
                        >
                            <div className="space-y-4">
                                <span className="text-accent text-[10px] tracking-[0.5em] uppercase">{t('clientGallery.privateAccess')}</span>
                                <h1 className="text-3xl font-heading text-white">{t('clientGallery.clientPortfolio')}</h1>
                                <p className="text-white/40 text-xs font-body tracking-wider leading-relaxed">
                                    {t('clientGallery.enterAccessCodeText')}
                                </p>
                            </div>

                            <form onSubmit={handleAccessSubmit} className="space-y-6">
                                <input
                                    type="password"
                                    placeholder={t('clientGallery.accessCodePlaceholder')}
                                    value={accessCode}
                                    onChange={(event) => {
                                        setAccessCode(event.target.value);
                                        setError('');
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-sm py-4 text-center text-white text-[10px] tracking-[0.5em] focus:outline-none focus:border-accent transition-colors placeholder:text-white/20"
                                />
                                {error && (
                                    <p className="text-red-300 text-xs leading-relaxed">
                                        {error}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-white text-black text-[10px] tracking-[0.4em] uppercase py-4 font-bold hover:bg-accent transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? t('ui.checking') : t('clientGallery.enterGallery')}
                                </button>
                            </form>

                            <p className="text-[10px] text-white/20 tracking-widest uppercase cursor-pointer hover:text-white transition-colors">
                                {t('clientGallery.lostCode')}
                            </p>
                        </GlareHover>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-16"
                    >
                        <div className="text-center space-y-4">
                            <span className="text-accent text-[10px] tracking-[0.5em] uppercase">
                                {gallery.slug}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-heading text-white italic">
                                {gallery.client_name}
                            </h1>
                            <p className="text-white/40 text-sm italic">
                                {gallery.image_count} {gallery.image_count === 1 ? t('ui.imageSingular') : t('ui.images')} {t('clientGallery.privateGalleryCountText')}
                            </p>
                            <p className="text-white/50 text-xs uppercase tracking-[0.25em]">
                                {t('clientGallery.selectionStatus')
                                    .replace('{count}', selectedImages.length.toString())
                                    .replace('{total}', gallery.image_count.toString())}
                            </p>
                        </div>

                        {gallery.images.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                                    {gallery.images.map((image, index) => {
                                        const isSelected = selectedImageSet.has(image);

                                        return (
                                            <GlareHover
                                                key={`${image}-${index}`}
                                                width="100%"
                                                height="auto"
                                                background="#111"
                                                borderRadius="2px"
                                                borderColor="rgba(255,255,255,0.1)"
                                                glareOpacity={0.18}
                                                glareAngle={-30}
                                                glareSize={180}
                                                transitionDuration={720}
                                                className="aspect-[4/5] group border-white/10 transition-colors hover:border-white/25"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleImageSelection(image)}
                                                    aria-pressed={isSelected}
                                                    className="absolute inset-0 z-10 cursor-pointer"
                                                >
                                                    <span className="sr-only">
                                                        {isSelected ? t('ui.removeImage') : t('ui.selectImage')}
                                                    </span>
                                                </button>
                                                <GalleryMedia
                                                    src={image}
                                                    alt={`${gallery.client_name} ${t('clientGallery.galleryImageAlt')} ${index + 1}`}
                                                    className="pointer-events-none w-full h-full object-cover"
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleImageSelection(image)}
                                                    aria-pressed={isSelected}
                                                    aria-label={isSelected ? t('ui.removeImage') : t('ui.selectImage')}
                                                    className={`absolute left-3 top-3 z-20 h-6 w-6 rounded-full border transition-all ${
                                                        isSelected
                                                            ? 'border-white bg-white shadow-[0_0_18px_rgba(255,255,255,0.22)]'
                                                            : 'border-white/65 bg-black/20 hover:border-white hover:bg-white/10'
                                                    }`}
                                                >
                                                    <span className="sr-only">
                                                        {isSelected ? t('ui.removeImage') : t('ui.selectImage')}
                                                    </span>
                                                </button>
                                                <a
                                                    href={image}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="absolute bottom-3 right-3 z-30 border border-white/20 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-accent hover:text-accent"
                                                >
                                                    {t('ui.preview')}
                                                </a>
                                            </GlareHover>
                                        );
                                    })}
                                </div>

                                <GlareHover
                                    width="100%"
                                    height="auto"
                                    background="rgba(255,255,255,0.05)"
                                    borderRadius="2px"
                                    borderColor="rgba(255,255,255,0.1)"
                                    glareOpacity={0.16}
                                    glareAngle={-30}
                                    glareSize={170}
                                    transitionDuration={780}
                                    className="mx-auto max-w-2xl"
                                    contentClassName="space-y-4 p-6 text-center"
                                >
                                    <p className="text-white/45 text-sm">
                                        {t('clientGallery.selectionInstructions')}
                                    </p>
                                    {error && <p className="text-red-300 text-xs leading-relaxed">{error}</p>}
                                    {approvalMessage && <p className="text-accent text-xs leading-relaxed">{approvalMessage}</p>}
                                    <button
                                        type="button"
                                        onClick={approveSelection}
                                        disabled={selectedImages.length === 0 || isApproving}
                                        className="w-full bg-white text-black text-[10px] tracking-[0.4em] uppercase py-4 font-bold hover:bg-accent transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isApproving ? t('ui.approving') : t('clientGallery.approveSelection')}
                                    </button>
                                </GlareHover>
                            </>
                        ) : (
                            <GlareHover width="100%" height="auto" background="rgba(255,255,255,0.05)" borderRadius="2px" borderColor="rgba(255,255,255,0.1)" glareOpacity={0.16} className="max-w-xl mx-auto" contentClassName="text-center p-10 space-y-3">
                                <h2 className="text-2xl font-heading text-white italic">{t('clientGallery.noImagesTitle')}</h2>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    {t('clientGallery.noImagesDescription')}
                                </p>
                            </GlareHover>
                        )}

                        {gallery.finished_count > 0 && (
                            <GlareHover width="100%" height="auto" background="rgba(255,255,255,0.05)" borderRadius="2px" borderColor="rgba(255,255,255,0.1)" glareOpacity={0.16} className="mx-auto max-w-3xl" contentClassName="p-6 text-center space-y-5">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-heading text-white italic">{t('clientGallery.finishedWorkTitle')}</h2>
                                    <p className="text-white/45 text-sm leading-relaxed">
                                        {gallery.payment_verified
                                            ? t('clientGallery.finishedWorkReady')
                                            : t('clientGallery.paymentRequired')}
                                    </p>
                                </div>

                                {gallery.payment_verified ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                                            {gallery.finished_images.map((image, index) => (
                                                <div
                                                    key={`${image}-${index}`}
                                                    className="group relative aspect-[4/5] overflow-hidden border border-white/10 bg-black transition-colors hover:border-white/25"
                                                >
                                                    <GalleryMedia
                                                        src={image}
                                                        alt={`${gallery.client_name} ${t('clientGallery.finishedWorkTitle')} ${index + 1}`}
                                                        className="pointer-events-none h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/0" />
                                                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
                                                        {t('clientGallery.finishedWorkTitle')} {index + 1}
                                                    </span>
                                                    <a
                                                        href={getFinishedDownloadUrl(image)}
                                                        className="absolute bottom-3 left-3 right-3 z-10 border border-white/25 bg-white px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-black transition-colors hover:border-accent hover:bg-accent"
                                                    >
                                                        {t('clientGallery.downloadFinishedWork')}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-white/10 pt-8 text-left">
                                            {gallery.review_submitted_at ? (
                                                <div className="space-y-4 text-center">
                                                    <p className="text-[10px] uppercase tracking-[0.35em] text-accent">
                                                        {t('clientGallery.reviewReceived')}
                                                    </p>
                                                    <div className="flex justify-center gap-1 text-lg text-accent" aria-label={`${gallery.review_rating || 5} ${t('clientGallery.reviewStars')}`}>
                                                        {Array.from({ length: 5 }).map((_, index) => (
                                                            <span key={index} className={index < (gallery.review_rating || 0) ? 'opacity-100' : 'opacity-25'}>
                                                                &#9733;
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/55">
                                                        &quot;{gallery.review_text}&quot;
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-5">
                                                    <div className="space-y-2 text-center">
                                                        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">
                                                            {t('clientGallery.reviewPromptTitle')}
                                                        </p>
                                                        <p className="text-sm leading-relaxed text-white/45">
                                                            {t('clientGallery.reviewPromptDescription')}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-center gap-2" aria-label={t('clientGallery.rateTransaction')}>
                                                        {Array.from({ length: 5 }).map((_, index) => {
                                                            const value = index + 1;
                                                            const isActive = value <= reviewRating;
                                                            return (
                                                                <button
                                                                    key={value}
                                                                    type="button"
                                                                    onClick={() => setReviewRating(value)}
                                                                    className={`text-2xl leading-none transition-colors ${
                                                                        isActive ? 'text-accent' : 'text-white/25 hover:text-white/60'
                                                                    }`}
                                                                    aria-label={`${value} ${t('clientGallery.reviewStars')}`}
                                                                >
                                                                    &#9733;
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <textarea
                                                        value={reviewText}
                                                        onChange={(event) => {
                                                            setReviewText(event.target.value);
                                                            setReviewError('');
                                                        }}
                                                        maxLength={1000}
                                                        rows={4}
                                                        placeholder={t('clientGallery.reviewPlaceholder')}
                                                        className="w-full resize-none border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/25 focus:border-accent"
                                                    />
                                                    {reviewError && (
                                                        <p className="text-center text-xs leading-relaxed text-red-300">
                                                            {reviewError}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                                                            {reviewText.length}/1000
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={submitReview}
                                                            disabled={isSubmittingReview || reviewText.trim().length < 10}
                                                            className="w-full bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.35em] text-black transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                                        >
                                                            {isSubmittingReview ? t('clientGallery.submittingReview') : t('clientGallery.submitReview')}
                                                        </button>
                                                    </div>
                                                    {reviewMessage && (
                                                        <p className="text-center text-xs leading-relaxed text-accent">
                                                            {reviewMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {gallery.payment_url && (
                                            <a
                                                href={gallery.payment_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex w-full justify-center bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.35em] text-black transition-colors hover:bg-accent sm:w-auto"
                                            >
                                                {t('clientGallery.payOnline')}
                                            </a>
                                        )}
                                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                                            {t('clientGallery.paymentVerificationNote')}
                                        </p>
                                    </div>
                                )}
                            </GlareHover>
                        )}

                        <div className="flex flex-col items-center gap-8 py-12 border-t border-white/5">
                            <button
                                onClick={resetGallery}
                                className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.4em] uppercase text-white hover:border-accent hover:text-accent transition-colors duration-500"
                            >
                                {t('ui.useAnotherCode')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <Footer />
        </main>
    );
}
