'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Exhibitions from '@/components/Exhibitions';
import { motion } from 'framer-motion';

export default function ArtExhibitionsPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24 space-y-4 text-center max-w-2xl mx-auto"
                >
                    <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Venerations</span>
                    <h1 className="text-5xl md:text-8xl font-heading text-white">Exhibitions</h1>
                    <p className="text-white/40 font-body tracking-widest uppercase text-[10px] pt-4">
                        Solo and Group Presentations (2020 — 2026)
                    </p>
                </motion.header>

                <Exhibitions />

                {/* Catalog Section */}
                <div className="mt-40 border-t border-white/5 pt-32 grid md:grid-cols-2 gap-24 items-center">
                    <div className="space-y-8">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Publications</span>
                        <h2 className="text-3xl font-heading text-white italic leading-tight">Exhibition Catalogs & Monographs</h2>
                        <p className="text-white/40 text-sm leading-relaxed max-w-md">
                            Limited edition prints and catalogs from the latest exhibitions are available for purchase. Each copy is signed and numbered by the artist.
                        </p>
                        <button className="text-[10px] tracking-[0.4em] uppercase text-white border-b border-gold pb-2 hover:text-gold transition-colors">
                            Explore Archive
                        </button>
                    </div>

                    <div className="aspect-square bg-neutral-900 border border-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                        <div className="w-full h-full bg-[url('/exhibition_catalog.webp')] bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105" />
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
