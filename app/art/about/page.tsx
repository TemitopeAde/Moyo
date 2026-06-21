'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function ArtAboutPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="container mx-auto px-6 pb-24 pt-36 md:px-12 md:pb-32 md:pt-52">
                <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
                    <div className="space-y-10 lg:col-span-7 lg:space-y-16">
                        <header className="space-y-6">
                            <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">Biography</span>
                            <h1 className="text-5xl font-heading italic text-white md:text-8xl">The Artist</h1>
                        </header>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            className="max-w-2xl space-y-8 text-base leading-relaxed text-white/60 md:space-y-12 md:text-xl"
                        >
                            <p>
                                Ijabiken Moyo’s fine art practice explores identity, memory, and human presence through form and symbolism. His works exist between personal history and shared experience, often referencing heritage, emotion, and quiet tension.
                            </p>
                            <p>
                                Each piece is created as a standalone statement — meant to be lived with, not just observed. By abstracting the human form and focusing on textural narratives, Moyo invites viewers into a space of contemplation and introspection.
                            </p>
                            <p className="italic text-white">
                                &ldquo;Art is the physical manifestation of things unsaid. It is a bridge between the internal landscape and the external world.&rdquo;
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-10 border-t border-white/5 pt-10 sm:grid-cols-3 md:gap-16 md:pt-12">
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-accent">Focus</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">Identity<br />Memory<br />Presence</p>
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-accent">Mediums</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">Acrylic<br />Digital Composite<br />Textiles</p>
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-accent">Base</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">Amsterdam<br />London<br />Lagos</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 lg:col-span-5 lg:space-y-12">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="aspect-[3/4] bg-neutral-900 border border-white/5 grayscale hover:grayscale-0 transition-all duration-1000"
                            style={{ backgroundImage: "url('/art_artist.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <div className="space-y-2">
                            <p className="text-[10px] tracking-[0.5em] uppercase text-white/20">Studio Portrait, 2026</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
