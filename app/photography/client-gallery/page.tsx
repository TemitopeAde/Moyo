'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GalleryMedia from '@/components/GalleryMedia';

type ClientGallery = {
    id: number;
    client_name: string;
    slug: string;
    images: string[];
    approved_images: string[];
    finished_images: string[];
    payment_verified: boolean;
    payment_url: string;
    is_locked: boolean;
    image_count: number;
    finished_count: number;
};

export default function ClientGalleryPage() {
    const [accessCode, setAccessCode] = useState('');
    const [gallery, setGallery] = useState<ClientGallery | null>(null);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const selectedImageSet = useMemo(() => new Set(selectedImages), [selectedImages]);

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    const handleAccessSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const code = accessCode.trim();

        setError('');
        setGallery(null);
        setSelectedImages([]);
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

    return (
        <main className="bg-background min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-grow pt-36 md:pt-52 container mx-auto px-6 md:px-12 pb-32">
                {!gallery ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto py-20 bg-white/5 p-12 text-center space-y-8 backdrop-blur-sm border border-white/5"
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
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
                                    {gallery.images.map((image, index) => {
                                        const isSelected = selectedImageSet.has(image);

                                        return (
                                            <div
                                                key={`${image}-${index}`}
                                                className={`aspect-square relative group overflow-hidden border bg-neutral-900 transition-colors ${
                                                    isSelected ? 'border-accent shadow-[0_0_0_1px_rgba(146,1,16,0.45)]' : 'border-white/5'
                                                }`}
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
                                                    className={`absolute left-3 top-3 z-20 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                                                        isSelected
                                                            ? 'border-accent bg-accent text-black'
                                                            : 'border-white/20 bg-black/40 text-white/60 hover:border-accent hover:text-accent'
                                                    }`}
                                                >
                                                    {isSelected ? t('ui.selected') : `${t('ui.image')} ${index + 1}`}
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
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mx-auto max-w-2xl border border-white/10 bg-white/5 p-6 text-center space-y-4">
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
                                </div>
                            </>
                        ) : (
                            <div className="max-w-xl mx-auto text-center border border-white/10 bg-white/5 p-10 space-y-3">
                                <h2 className="text-2xl font-heading text-white italic">{t('clientGallery.noImagesTitle')}</h2>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    {t('clientGallery.noImagesDescription')}
                                </p>
                            </div>
                        )}

                        {gallery.finished_count > 0 && (
                            <div className="mx-auto max-w-3xl border border-white/10 bg-white/5 p-6 text-center space-y-5">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-heading text-white italic">{t('clientGallery.finishedWorkTitle')}</h2>
                                    <p className="text-white/45 text-sm leading-relaxed">
                                        {gallery.payment_verified
                                            ? t('clientGallery.finishedWorkReady')
                                            : t('clientGallery.paymentRequired')}
                                    </p>
                                </div>

                                {gallery.payment_verified ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {gallery.finished_images.map((image, index) => (
                                            <a
                                                key={`${image}-${index}`}
                                                href={image}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="border border-accent/40 bg-accent/10 px-5 py-4 text-[10px] uppercase tracking-[0.28em] text-accent transition-colors hover:bg-accent hover:text-black"
                                            >
                                                {t('clientGallery.downloadFinishedWork')} {index + 1}
                                            </a>
                                        ))}
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
                            </div>
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
