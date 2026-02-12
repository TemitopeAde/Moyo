'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const items = [
    { id: 1, name: "Presence (Limited Edition)", price: "€450.00", category: "Hand-finished Print", image: "/shop_1.webp" },
    { id: 2, name: "The Quiet Archive", price: "€120.00", category: "Monograph", image: "/shop_2.webp" },
    { id: 3, name: "Identity Fragment III", price: "€2,800.00", category: "Original Work", image: "/shop_3.webp" },
    { id: 4, name: "Memory Study #4", price: "€650.00", category: "Framed Edition", image: "/shop_4.webp" },
];

export default function ArtShopPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32">
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Editions</span>
                        <h1 className="text-5xl md:text-8xl font-heading text-white italic leading-tight">Shop</h1>
                    </div>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase max-w-[200px] border-l border-white/10 pl-6 pb-2">
                        Worldwide shipping available on all editions and original works.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="group space-y-6"
                        >
                            <div className="aspect-[4/5] bg-neutral-900 overflow-hidden relative border border-white/5">
                                <div className="absolute inset-x-0 bottom-0 py-6 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 bg-white">
                                    <span className="text-[10px] tracking-[0.4em] uppercase text-black font-bold">Add to Collection</span>
                                </div>
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-heading text-white group-hover:text-gold transition-colors">{item.name}</h3>
                                    <span className="text-[10px] text-white/40">{item.price}</span>
                                </div>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 font-body">{item.category}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-40 text-center py-20 border-t border-white/5">
                    <p className="text-white/20 text-xs tracking-[0.4em] uppercase">Private viewings by appointment only.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
