'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function PhotographyAboutPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="container mx-auto px-6 pb-24 pt-36 md:px-12 md:pb-32 md:pt-52">
                <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
                    <div className="space-y-8 lg:col-span-6 lg:space-y-12">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            className="aspect-[4/5] overflow-hidden border border-white/5 bg-neutral-900 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: "url('/profile-portrait.jpg')" }}
                        />
                        <div className="flex justify-between gap-6 text-[10px] uppercase tracking-[0.24em] text-white/20 md:tracking-[0.4em]">
                            <p>In Process</p>
                            <p>Paris, France</p>
                        </div>
                    </div>

                    <div className="space-y-10 lg:col-span-6 lg:space-y-16">
                        <header className="space-y-6">
                            <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">Philosophy</span>
                            <h1 className="text-5xl font-heading text-white md:text-8xl">The Lens</h1>
                        </header>

                        <div className="space-y-8 text-base leading-relaxed text-white/50 md:space-y-12 md:text-xl">
                            <p>
                                Ijabiken Moyo is a photographer focused on creating images that feel intentional, timeless, and emotionally grounded. His work balances precision and intuition — capturing people, moments, and narratives with clarity and restraint.
                            </p>
                            <p>
                                Each project is approached with respect for the subject and an understanding that strong images are built, not rushed. For Moyo, the camera is a tool for subtraction, removing the noise of the world to reveal the quiet truth of the subject.
                            </p>
                            <div className="h-px w-20 bg-accent/50" />
                            <p className="italic text-white font-heading text-2xl">
                                &ldquo;Precision over volume. Emotion over perfection.&rdquo;
                            </p>
                        </div>

                        <div className="space-y-8">
                            <span className="text-[10px] uppercase tracking-[0.32em] text-accent md:tracking-[0.5em]">Selected Clients</span>
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
