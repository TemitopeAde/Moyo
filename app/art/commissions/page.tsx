'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function ArtCommissionsPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-24"
                >
                    <header className="space-y-6 text-center">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Bespoke Creations</span>
                        <h1 className="text-5xl md:text-7xl font-heading text-white font-light italic">Art Commissions</h1>
                        <p className="text-white/50 font-body text-lg max-w-2xl mx-auto tracking-wide">
                            Collaborate on a unique piece of art tailored to your space or personal narrative.
                            Each commission is a journey of discovery and co-creation.
                        </p>
                    </header>

                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-heading text-white">The Process</h3>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    From initial consultation to final installation, the commissioning process is transparent and deeply engaging. We begin with a dialogue about your vision, heritage, or specific conceptual interests.
                                </p>
                            </div>

                            <ul className="space-y-6">
                                {[
                                    { step: "01", title: "Dialogue", desc: "Understanding the emotional and physical context." },
                                    { step: "02", title: "Conceptualization", desc: "Developing sketches and material studies." },
                                    { step: "03", title: "Creation", desc: "Hand-crafted production with regular updates." },
                                    { step: "04", title: "Unveiling", desc: "Final presentation and documentation." }
                                ].map((item) => (
                                    <li key={item.step} className="flex gap-6 border-b border-white/5 pb-6 last:border-0">
                                        <span className="text-gold text-xs font-heading">{item.step}</span>
                                        <div className="space-y-1">
                                            <p className="text-white text-xs tracking-widest uppercase font-medium">{item.title}</p>
                                            <p className="text-white/30 text-[10px] tracking-wide">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="aspect-[3/4] bg-neutral-900 overflow-hidden relative border border-white/5">
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="w-full h-full bg-[url('/art_commission.webp')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000" />
                        </div>
                    </div>

                    <div className="glass p-12 md:p-20 text-center space-y-12">
                        <h2 className="text-3xl font-heading text-white italic">Start a conversation.</h2>
                        <button className="bg-white text-black px-12 py-5 text-[10px] tracking-[0.5em] uppercase font-bold hover:bg-gold transition-colors">
                            Inquire Now
                        </button>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
