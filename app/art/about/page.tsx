'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function ArtAboutPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32">
                <div className="grid lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-7 space-y-16">
                        <header className="space-y-6">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Biography</span>
                            <h1 className="text-5xl md:text-8xl font-heading text-white italic">The Artist</h1>
                        </header>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            className="space-y-12 text-lg md:text-xl text-white/60 font-body leading-relaxed max-w-2xl"
                        >
                            <p>
                                Ijabiken Moyo’s fine art practice explores identity, memory, and human presence through form and symbolism. His works exist between personal history and shared experience, often referencing heritage, emotion, and quiet tension.
                            </p>
                            <p>
                                Each piece is created as a standalone statement — meant to be lived with, not just observed. By abstracting the human form and focusing on textural narratives, Moyo invites viewers into a space of contemplation and introspection.
                            </p>
                            <p className="italic text-white">
                                "Art is the physical manifestation of things unsaid. It is a bridge between the internal landscape and the external world."
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-16 pt-12 border-t border-white/5">
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-gold">Focus</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">Identity<br />Memory<br />Presence</p>
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-gold">Mediums</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">Acrylic<br />Digital Composite<br />Textiles</p>
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-gold">Base</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">Amsterdam<br />London<br />Lagos</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-12">
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
