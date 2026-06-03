'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

type ClientGallery = {
    id: number;
    client_name: string;
    slug: string;
    images: string[];
    approved_images: string[];
    is_locked: boolean;
    image_count: number;
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
            setError('Please enter your access code.');
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
                setError(data.error || 'Unable to open this gallery.');
                return;
            }

            setGallery(data.gallery);
            setSelectedImages(data.gallery.approved_images || []);
        } catch {
            setError('Unable to open this gallery. Please try again.');
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
        setSelectedImages((current) =>
            current.includes(image)
                ? current.filter((selected) => selected !== image)
                : [...current, image]
        );
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
                setError(data.error || 'Unable to approve your selection.');
                return;
            }

            setSelectedImages(data.approved_images || selectedImages);
            setGallery((current) =>
                current ? { ...current, approved_images: data.approved_images || selectedImages } : current
            );
            setApprovalMessage(`${data.approved_count} ${data.approved_count === 1 ? 'image' : 'images'} approved.`);
        } catch {
            setError('Unable to approve your selection. Please try again.');
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <main className="bg-background min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-grow pt-40 container mx-auto px-6 md:px-12 pb-32">
                {!gallery ? (
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

                        <form onSubmit={handleAccessSubmit} className="space-y-6">
                            <input
                                type="password"
                                placeholder={t('clientGallery.accessCodePlaceholder')}
                                value={accessCode}
                                onChange={(event) => {
                                    setAccessCode(event.target.value);
                                    setError('');
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-sm py-4 text-center text-white text-[10px] tracking-[0.5em] focus:outline-none focus:border-gold transition-colors placeholder:text-white/20"
                            />
                            {error && (
                                <p className="text-red-300 text-xs leading-relaxed">
                                    {error}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black text-[10px] tracking-[0.4em] uppercase py-4 font-bold hover:bg-gold transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Checking...' : t('clientGallery.enterGallery')}
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
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase">
                                {gallery.slug}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-heading text-white italic">
                                {gallery.client_name}
                            </h1>
                            <p className="text-white/40 text-sm italic">
                                {gallery.image_count} {gallery.image_count === 1 ? 'image' : 'images'} in this private gallery.
                            </p>
                            <p className="text-white/50 text-xs uppercase tracking-[0.25em]">
                                {t('clientGallery.selectionStatus')
                                    .replace('{count}', selectedImages.length.toString())
                                    .replace('{total}', gallery.image_count.toString())}
                            </p>
                        </div>

                        {gallery.images.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {gallery.images.map((image, index) => {
                                        const isSelected = selectedImages.includes(image);

                                        return (
                                            <div
                                                key={`${image}-${index}`}
                                                className={`aspect-square relative group overflow-hidden border bg-neutral-900 transition-colors ${
                                                    isSelected ? 'border-gold shadow-[0_0_0_1px_rgba(212,175,55,0.45)]' : 'border-white/5'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleImageSelection(image)}
                                                    aria-pressed={isSelected}
                                                    className="absolute inset-0 z-10"
                                                >
                                                    <span className="sr-only">
                                                        {isSelected ? 'Remove image from selection' : 'Select image'}
                                                    </span>
                                                </button>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={image}
                                                    alt={`${gallery.client_name} gallery image ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                <div
                                                    className={`absolute left-3 top-3 z-20 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                                                        isSelected
                                                            ? 'border-gold bg-gold text-black'
                                                            : 'border-white/20 bg-black/40 text-white/60'
                                                    }`}
                                                >
                                                    {isSelected ? 'Selected' : `Image ${index + 1}`}
                                                </div>
                                                <a
                                                    href={image}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="absolute bottom-3 right-3 z-20 border border-white/20 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-gold hover:text-gold"
                                                >
                                                    Preview
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mx-auto max-w-2xl border border-white/10 bg-white/5 p-6 text-center space-y-4">
                                    <p className="text-white/45 text-sm">
                                        Select the images you want approved, then submit your selection to the studio.
                                    </p>
                                    {error && <p className="text-red-300 text-xs leading-relaxed">{error}</p>}
                                    {approvalMessage && <p className="text-gold text-xs leading-relaxed">{approvalMessage}</p>}
                                    <button
                                        type="button"
                                        onClick={approveSelection}
                                        disabled={selectedImages.length === 0 || isApproving}
                                        className="w-full bg-white text-black text-[10px] tracking-[0.4em] uppercase py-4 font-bold hover:bg-gold transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isApproving ? 'Approving...' : t('clientGallery.approveSelection')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="max-w-xl mx-auto text-center border border-white/10 bg-white/5 p-10 space-y-3">
                                <h2 className="text-2xl font-heading text-white italic">No images uploaded yet</h2>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    This gallery is open, but the studio has not added images to it yet.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-8 py-12 border-t border-white/5">
                            <button
                                onClick={resetGallery}
                                className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.4em] uppercase text-white hover:border-gold hover:text-gold transition-colors duration-500"
                            >
                                Use Another Code
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <Footer />
        </main>
    );
}
