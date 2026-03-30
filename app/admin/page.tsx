'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiUpload, FiPlus, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'art' | 'photography'>('art');
    const [catalog, setCatalog] = useState<{ artWorks: any[], photographyItems: any[] }>({ artWorks: [], photographyItems: [] });
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Form states
    const [artForm, setArtForm] = useState({ title: '', year: '', medium: '', size: '', image: '' });
    const [photoForm, setPhotoForm] = useState({ title: '', category: '', span: 'md:col-span-1 md:row-span-1', image: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const res = await fetch('/api/catalog');
            const data = await res.json();
            if (data.artWorks) setCatalog(data);
        } catch (error) {
            console.error('Failed to fetch catalog', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return null;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                return data.url;
            }
            throw new Error(data.error || 'Upload failed');
        } catch (error) {
            setMessage({ text: 'Upload failed: ' + (error as Error).message, type: 'error' });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const imageUrl = await handleUpload() || (activeTab === 'art' ? artForm.image : photoForm.image);
        if (!imageUrl && !selectedFile) {
            setMessage({ text: 'Please select an image or provide a URL', type: 'error' });
            return;
        }

        const item = activeTab === 'art'
            ? { ...artForm, image: imageUrl }
            : { ...photoForm, image: imageUrl };

        try {
            const res = await fetch('/api/catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeTab, item }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: 'Item added successfully', type: 'success' });
                setCatalog(data.catalog);
                setArtForm({ title: '', year: '', medium: '', size: '', image: '' });
                setPhotoForm({ title: '', category: '', span: 'md:col-span-1 md:row-span-1', image: '' });
                setSelectedFile(null);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ text: 'Failed to add item: ' + (error as Error).message, type: 'error' });
        }
    };

    return (
        <main className="bg-background min-h-screen text-foreground font-body">
            <Navbar />

            <section className="pt-40 pb-20 container mx-auto px-6 md:px-12">
                <header className="mb-16 space-y-4">
                    <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Control Panel</span>
                    <h1 className="text-5xl md:text-7xl font-heading text-white italic">Catalog Admin</h1>
                    <p className="text-white/40 max-w-lg text-sm leading-relaxed">
                        Manage your collection. Add new works to the Fine Art archive or update your Photography portfolio.
                    </p>
                </header>

                <div className="flex gap-8 mb-12 border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('art')}
                        className={`pb-4 text-[10px] tracking-[0.4em] uppercase transition-colors ${activeTab === 'art' ? 'text-gold border-b border-gold' : 'text-white/40 hover:text-white'}`}
                    >
                        Fine Art
                    </button>
                    <button
                        onClick={() => setActiveTab('photography')}
                        className={`pb-4 text-[10px] tracking-[0.4em] uppercase transition-colors ${activeTab === 'photography' ? 'text-gold border-b border-gold' : 'text-white/40 hover:text-white'}`}
                    >
                        Photography
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Add Form */}
                    <div className="space-y-12">
                        <section className="bg-surface/30 p-8 md:p-12 border border-white/5 backdrop-blur-sm">
                            <h2 className="text-2xl font-heading text-white italic mb-8">Add New {activeTab === 'art' ? 'Work' : 'Item'}</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {activeTab === 'art' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40">Title</label>
                                            <input
                                                type="text"
                                                value={artForm.title}
                                                onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                                placeholder="e.g. Form No. 1"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40">Year</label>
                                                <input
                                                    type="text"
                                                    value={artForm.year}
                                                    onChange={(e) => setArtForm({ ...artForm, year: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                                    placeholder="2025"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40">Medium</label>
                                                <input
                                                    type="text"
                                                    value={artForm.medium}
                                                    onChange={(e) => setArtForm({ ...artForm, medium: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                                    placeholder="Oil on Canvas"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40">Size / Details</label>
                                            <input
                                                type="text"
                                                value={artForm.size}
                                                onChange={(e) => setArtForm({ ...artForm, size: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                                placeholder="120x150cm"
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40">Title</label>
                                            <input
                                                type="text"
                                                value={photoForm.title}
                                                onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                                placeholder="Quiet Presence"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40">Category</label>
                                            <input
                                                type="text"
                                                value={photoForm.category}
                                                onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                                placeholder="Editorial"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40">Image Upload</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept="image/*"
                                        />
                                        <div className="w-full bg-white/5 border-2 border-dashed border-white/10 p-8 flex flex-col items-center justify-center gap-4 group-hover:border-gold/50 transition-colors">
                                            <FiUpload className="text-2xl text-white/20 group-hover:text-gold transition-colors" />
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                                {selectedFile ? selectedFile.name : 'Choose File or Drag & Drop'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 text-[10px] uppercase tracking-widest flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                                    >
                                        {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                                        {message.text}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-gold hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {uploading ? 'Processing...' : (
                                        <>
                                            <FiPlus /> Add to {activeTab === 'art' ? 'Fine Art' : 'Photography'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Preview / List */}
                    <div className="space-y-8">
                        <h2 className="text-[10px] uppercase tracking-[0.5em] text-gold mb-8">Current {activeTab === 'art' ? 'Art Works' : 'Photography'}</h2>
                        <div className="grid grid-cols-1 gap-6 max-h-[1000px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                            {(activeTab === 'art' ? catalog.artWorks : catalog.photographyItems).map((item, idx) => (
                                <div key={item.id} className="bg-surface/20 border border-white/5 p-4 flex gap-6 items-center group">
                                    <div className="w-24 h-24 bg-neutral-950 flex-shrink-0 relative overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-white font-heading italic text-lg">{item.title}</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                            {activeTab === 'art' ? `${item.year} — ${item.medium}` : item.category}
                                        </p>
                                    </div>
                                    {/* Delete functionality can be added later if needed */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
