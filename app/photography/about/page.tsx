'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function PhotographyAboutPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32">
                <div className="grid lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-6 space-y-12">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            className="aspect-[4/5] bg-neutral-900 border border-white/5"
                            style={{ backgroundImage: "url('/photo_about_main.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <div className="flex justify-between items-center text-[10px] tracking-[0.4em] uppercase text-white/20">
                            <p>In Process</p>
                            <p>Paris, France</p>
                        </div>
                    </div>

                    <div className="lg:col-span-6 space-y-16">
                        <header className="space-y-6">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Philosophy</span>
                            <h1 className="text-5xl md:text-8xl font-heading text-white">The Lens</h1>
                        </header>

                        <div className="space-y-12 text-lg md:text-xl text-white/50 font-body leading-relaxed">
                            <p>
                                Ijabiken Moyo is a photographer focused on creating images that feel intentional, timeless, and emotionally grounded. His work balances precision and intuition — capturing people, moments, and narratives with clarity and restraint.
                            </p>
                            <p>
                                Each project is approached with respect for the subject and an understanding that strong images are built, not rushed. For Moyo, the camera is a tool for subtraction, removing the noise of the world to reveal the quiet truth of the subject.
                            </p>
                            <div className="h-px w-20 bg-gold/50" />
                            <p className="italic text-white font-heading text-2xl">
                                "Precision over volume. Emotion over perfection."
                            </p>
                        </div>

                        <div className="space-y-8">
                            <span className="text-[10px] tracking-[0.5em] uppercase text-gold">Selected Clients</span>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                {['Vogue', 'L\'Officiel', 'The New York Times', 'Nike', 'Apple', 'Aesthetica'].map((client) => (
                                    <span key={client} className="text-[10px] tracking-[0.3em] uppercase text-white/30 border-l border-white/5 pl-4">
                                        {client}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
