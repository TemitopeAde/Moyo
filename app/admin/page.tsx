'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiUpload, FiPlus, FiTrash2, FiCheckCircle, FiXCircle, FiLock, FiUnlock } from 'react-icons/fi';

type Artwork = {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  is_featured: boolean;
  is_available: boolean;
};

type Gallery = {
  id: number;
  slug: string;
  access_code: string;
  client_name: string;
  images: string[];
  approved_images: string[];
  is_locked: boolean;
};

type Content = {
  homepage: { heroText: string; heroImage: string };
  about: { text: string; image: string };
};

type Contact = { phone: string; email: string; address: string };
type Social = { id: number; platform: string; url: string; icon?: string };
type Order = { id: number; items: any[]; total_price: number; status: string; customer_email: string };

const sectionCard = 'bg-surface/30 p-8 md:p-12 border border-white/5 backdrop-blur-sm space-y-6';
const label = 'text-[10px] uppercase tracking-widest text-white/40';
const inputClass =
  'w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-gold outline-none transition-colors';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [content, setContent] = useState<Content>({
    homepage: { heroText: '', heroImage: '' },
    about: { text: '', image: '' },
  });
  const [contact, setContact] = useState<Contact>({ phone: '', email: '', address: '' });
  const [socials, setSocials] = useState<Social[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [artForm, setArtForm] = useState({
    title: '',
    price: '',
    category: '',
    image: '',
    isFeatured: false,
    isAvailable: true,
  });

  const [galleryForm, setGalleryForm] = useState({ clientName: '', slug: '', access_code: '' });
  const [contentForm, setContentForm] = useState(content);
  const [contactForm, setContactForm] = useState(contact);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '', icon: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [galleryUploads, setGalleryUploads] = useState<Record<string, File | null>>({});
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('moyo-admin-key');
    if (saved) setAdminKey(saved);
  }, []);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'x-admin-key': adminKey || '',
    }),
    [adminKey]
  );

  const fetchAll = async () => {
    if (!isAuthed) return;
    try {
      const [artRes, galRes, contentRes, contactRes, socialRes, orderRes] = await Promise.all([
        fetch('/api/artworks'),
        fetch('/api/galleries'),
        fetch('/api/content'),
        fetch('/api/contact'),
        fetch('/api/socials'),
        fetch('/api/orders'),
      ]);

      const artData = await artRes.json();
      const galData = await galRes.json();
      const conData = await contentRes.json();
      const contactData = await contactRes.json();
      const socialData = await socialRes.json();
      const orderData = await orderRes.json();

      setArtworks(artData.artworks || []);
      setGalleries(galData.galleries || []);
      setContent(conData.content || content);
      setContact(contactData.contact || contact);
      setSocials(socialData.socials || []);
      setOrders(orderData.orders || []);
      setContentForm(conData.content || content);
      setContactForm(contactData.contact || contact);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to load data', type: 'error' });
    }
  };

  useEffect(() => {
    fetchAll();
  }, [isAuthed]);

  const verifyAdminKey = async () => {
    setAuthError(null);
    setAuthChecking(true);
    try {
      const res = await fetch('/api/artworks', { headers });
      if (!res.ok) {
        setIsAuthed(false);
        setAuthError('Invalid admin password');
        return false;
      }
      localStorage.setItem('moyo-admin-key', adminKey);
      setIsAuthed(true);
      setMessage({ text: 'Admin unlocked', type: 'success' });
      fetchAll();
      return true;
    } catch (err) {
      setIsAuthed(false);
      setAuthError('Unable to verify password');
      return false;
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyAdminKey();
  };

  useEffect(() => {
    if (adminKey && !isAuthed && !authChecking) {
      verifyAdminKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    console.log('[admin] upload start', { name: file.name, size: file.size, type: file.type });
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: formData,
      });
      console.log('[admin] upload response', { status: res.status });
      const data = await res.json();
      if (data.url) return data.url;
      throw new Error(data.error || 'Upload failed');
    } catch (error) {
      console.error('[admin] upload error', error);
      setMessage({ text: (error as Error).message, type: 'error' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleArtworkFileChange = async (file: File | null) => {
    setSelectedFile(file);
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    if (!adminKey) {
      setMessage({ text: 'Add admin password first', type: 'error' });
      return;
    }
    const url = await handleUpload(file);
    if (url) {
      setArtForm((prev) => ({ ...prev, image: url }));
      setImagePreview(url);
      setMessage({ text: 'Image uploaded', type: 'success' });
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!adminKey) return setMessage({ text: 'Add admin key first', type: 'error' });

    let imageUrl = artForm.image;
    if (selectedFile && !imageUrl) {
      const url = await handleUpload(selectedFile);
      if (!url) return;
      imageUrl = url;
    }

    const res = await fetch('/api/artworks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...artForm,
        price: Number(artForm.price),
        image: imageUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage({ text: data.error || 'Failed', type: 'error' });
    setArtworks((prev) => [data.artwork, ...prev]);
    setArtForm({ title: '', price: '', category: '', image: '', isFeatured: false, isAvailable: true });
    setSelectedFile(null);
    setMessage({ text: 'Artwork saved', type: 'success' });
  };

  const toggleArtwork = async (id: number, field: 'isFeatured' | 'isAvailable', value: boolean) => {
    const res = await fetch('/api/artworks', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, [field]: value }),
    });
    const data = await res.json();
    if (res.ok) {
      setArtworks((prev) => prev.map((a) => (a.id === id ? data.artwork : a)));
    }
  };

  const deleteArtwork = async (id: number) => {
    const res = await fetch(`/api/artworks?id=${id}`, { method: 'DELETE', headers });
    if (res.ok) setArtworks((prev) => prev.filter((a) => a.id !== id));
  };

  const createGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return setMessage({ text: 'Add admin key first', type: 'error' });
    const res = await fetch('/api/galleries', {
      method: 'POST',
      headers,
      body: JSON.stringify(galleryForm),
    });
    const data = await res.json();
    if (!res.ok) return setMessage({ text: data.error || 'Failed', type: 'error' });
    setGalleries((prev) => [data.gallery, ...prev]);
    setGalleryForm({ clientName: '', slug: '', access_code: '' });
    setMessage({ text: 'Gallery created', type: 'success' });
  };

  const updateGallery = async (id: string, action: string, payload?: any) => {
    const res = await fetch('/api/galleries', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, action, payload }),
    });
    const data = await res.json();
    if (res.ok) setGalleries((prev) => prev.map((g) => (g.id === Number(id) ? data.gallery : g)));
  };

  const uploadGalleryImage = async (id: number) => {
    const file = galleryUploads[id];
    if (!file) return;
    const url = await handleUpload(file);
    if (!url) return;
    await updateGallery(id.toString(), 'addImages', { images: [url] });
    setGalleryUploads((prev) => ({ ...prev, [id]: null }));
  };

  const saveContent = async () => {
    const res = await fetch('/api/content', { method: 'PUT', headers, body: JSON.stringify(contentForm) });
    const data = await res.json();
    if (res.ok) {
      setContent(data.content);
      setMessage({ text: 'Content saved', type: 'success' });
    } else setMessage({ text: data.error || 'Failed', type: 'error' });
  };

  const saveContact = async () => {
    const res = await fetch('/api/contact', { method: 'PUT', headers, body: JSON.stringify(contactForm) });
    const data = await res.json();
    if (res.ok) {
      setContact(data.contact);
      setMessage({ text: 'Contact saved', type: 'success' });
    } else setMessage({ text: data.error || 'Failed', type: 'error' });
  };

  const addSocial = async () => {
    const res = await fetch('/api/socials', { method: 'POST', headers, body: JSON.stringify(socialForm) });
    const data = await res.json();
    if (res.ok) {
      setSocials((p) => [data.social, ...p]);
      setSocialForm({ platform: '', url: '', icon: '' });
    }
  };

  const deleteSocial = async (id: string) => {
    const res = await fetch(`/api/socials?id=${id}`, { method: 'DELETE', headers });
    if (res.ok) setSocials((p) => p.filter((s) => s.id !== Number(id)));
  };

  const updateOrder = async (id: string, status: string) => {
    const res = await fetch('/api/orders', { method: 'PUT', headers, body: JSON.stringify({ id, status }) });
    const data = await res.json();
    if (res.ok) setOrders((p) => p.map((o) => (o.id === Number(id) ? data.order : o)));
  };

  return (
    <>
      {!isAuthed && (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
          <Navbar />
          <section className="flex-1 flex items-center justify-center px-6">
            <form
              onSubmit={handleAuthSubmit}
              className="w-full max-w-md space-y-6 bg-surface/40 border border-white/10 p-8 backdrop-blur-md"
            >
              <div className="space-y-2 text-center">
                <p className="text-gold text-[10px] tracking-[0.5em] uppercase">Admin Access</p>
                <h1 className="text-3xl font-heading italic text-white">Enter page password</h1>
                <p className="text-white/50 text-sm">Required to unlock the control panel.</p>
              </div>
              <input
                type="password"
                className={`${inputClass}`}
                placeholder="Page password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
              />
              {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
              <button
                type="submit"
                disabled={authChecking}
                className="w-full bg-gold text-black py-3 text-[11px] uppercase tracking-[0.4em] font-semibold disabled:opacity-50"
              >
                {authChecking ? 'Checking...' : 'Unlock'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminKey('');
                  setIsAuthed(false);
                  setAuthError(null);
                  localStorage.removeItem('moyo-admin-key');
                }}
                className="w-full text-white/60 hover:text-white text-xs underline"
              >
                Clear saved password
              </button>
            </form>
          </section>
        </main>
      )}
      {isAuthed && (
    <main className="bg-background min-h-screen text-foreground font-body">
      <Navbar />

      <section className="pt-40 pb-20 container mx-auto px-6 md:px-12">
        <header className="mb-16 space-y-4">
          <span className="text-gold text-[10px] tracking-[0.5em] uppercase">Control Panel</span>
          <h1 className="text-5xl md:text-7xl font-heading text-white italic">Admin</h1>
          <p className="text-white/40 max-w-2xl text-sm leading-relaxed">
            Manage artworks, galleries, site copy, contact, socials and orders. All changes persist to the database and
            reflect on the live site.
          </p>
        </header>

        <div className="mb-10 grid gap-4 md:grid-cols-4">
          <div className="md:col-span-3 flex flex-wrap gap-3 text-xs text-white/50">
            <span className="px-3 py-2 border border-white/10 bg-white/5 uppercase tracking-[0.25em]">
              Connected to MongoDB
            </span>
            <span className="px-3 py-2 border border-white/10 bg-white/5 uppercase tracking-[0.25em]">
              Cloudinary uploads
            </span>
            <span className="px-3 py-2 border border-white/10 bg-white/5 uppercase tracking-[0.25em]">
              API protected
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="password"
              className={`${inputClass} text-xs`}
              placeholder="Admin key"
              value={adminKey}
              onChange={(e) => {
                setAdminKey(e.target.value);
                localStorage.setItem('moyo-admin-key', e.target.value);
              }}
            />
            <button
              onClick={() => localStorage.removeItem('moyo-admin-key')}
              className="text-[10px] uppercase tracking-[0.3em] px-3 py-2 border border-white/10 text-white/60 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-10 p-4 text-[10px] uppercase tracking-widest flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
            {message.text}
          </motion.div>
        )}

        <div className="space-y-16">
          {/* Artwork */}
          <section className="grid lg:grid-cols-2 gap-12 items-start">
            <div className={sectionCard}>
              <h2 className="text-2xl font-heading text-white italic">Artwork</h2>
              <form className="space-y-4" onSubmit={handleArtworkSubmit}>
                <div className="space-y-2">
                  <label className={label}>Title</label>
                  <input
                    className={inputClass}
                    value={artForm.title}
                    onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={label}>Price</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={artForm.price}
                      onChange={(e) => setArtForm({ ...artForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={label}>Category</label>
                    <input
                      className={inputClass}
                      value={artForm.category}
                      onChange={(e) => setArtForm({ ...artForm, category: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={label}>Image</label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleArtworkFileChange(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*"
                    />
                    <div className="w-full bg-white/5 border-2 border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-3 group-hover:border-gold/50 transition-colors">
                      <FiUpload className="text-xl text-white/20 group-hover:text-gold transition-colors" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {selectedFile ? selectedFile.name : 'Choose File or Drag & Drop'}
                      </span>
                    </div>
                  </div>
                  <input
                    placeholder="or paste image URL"
                    className={inputClass}
                    value={artForm.image}
                    onChange={(e) => {
                      setArtForm({ ...artForm, image: e.target.value });
                      setImagePreview(e.target.value || null);
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-3 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                      <img src={imagePreview} alt="Artwork preview" className="w-full h-48 object-cover" />
                      <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
                        Preview
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-white/70">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={artForm.isFeatured}
                      onChange={(e) => setArtForm({ ...artForm, isFeatured: e.target.checked })}
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={artForm.isAvailable}
                      onChange={(e) => setArtForm({ ...artForm, isAvailable: e.target.checked })}
                    />
                    Available
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gold hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Save Artwork'}
                </button>
              </form>
            </div>
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-gold">Existing</h3>
              {artworks.map((art) => (
                <div key={art.id} className="bg-surface/20 border border-white/5 p-4 flex gap-4 items-center group">
                  <div className="w-20 h-20 bg-neutral-950 overflow-hidden">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-heading italic">{art.title}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                      {art.category} • ${art.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      onClick={() => toggleArtwork(art.id, 'isFeatured', !art.is_featured)}
                      className={`px-3 py-2 border ${art.is_featured ? 'border-gold text-gold' : 'border-white/10 text-white/60'}`}
                    >
                      Featured
                    </button>
                    <button
                      onClick={() => toggleArtwork(art.id, 'isAvailable', !art.is_available)}
                      className={`px-3 py-2 border ${art.is_available ? 'border-white/10 text-white/60' : 'border-red-500/40 text-red-300'}`}
                    >
                      {art.is_available ? 'Hide' : 'Show'}
                    </button>
                    <button
                    onClick={() => deleteArtwork(art.id)}
                      className="p-2 text-red-400 hover:text-red-200 border border-white/10"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Galleries */}
          <section className="grid lg:grid-cols-2 gap-12 items-start">
            <div className={sectionCard}>
              <h2 className="text-2xl font-heading text-white italic">Galleries</h2>
              <form className="space-y-4" onSubmit={createGallery}>
                <div className="space-y-2">
                  <label className={label}>Client Name</label>
                  <input
                    className={inputClass}
                    value={galleryForm.clientName}
                    onChange={(e) => setGalleryForm({ ...galleryForm, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={label}>Slug (optional)</label>
                    <input
                      className={inputClass}
                      value={galleryForm.slug}
                      onChange={(e) => setGalleryForm({ ...galleryForm, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={label}>Access Code (optional)</label>
                    <input
                      className={inputClass}
                      value={galleryForm.access_code}
                      onChange={(e) => setGalleryForm({ ...galleryForm, access_code: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
                >
                  Create Gallery
                </button>
              </form>
            </div>
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-gold">Existing</h3>
              {galleries.map((gal) => (
                <div key={gal.id} className="bg-surface/20 border border-white/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-heading italic">{gal.client_name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">
                        slug: {gal.slug} • code: {gal.access_code}
                      </p>
                    </div>
                    <button
                      onClick={() => updateGallery(gal.id.toString(), gal.is_locked ? 'unlock' : 'lock')}
                      className="p-2 border border-white/10 text-white/60 hover:text-white"
                    >
                      {gal.is_locked ? <FiUnlock /> : <FiLock />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-white/60">
                    <span>Uploads: {gal.images.length}</span>
                    <span>Approved: {gal.approved_images.length}</span>
                  </div>
                  {gal.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {gal.images.map((img) => (
                        <img key={img} src={img} className="h-20 w-full object-cover border border-white/10" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setGalleryUploads((prev) => ({ ...prev, [gal.id]: e.target.files?.[0] || null }))
                      }
                      className="text-white/70"
                    />
                    <button
                      onClick={() => uploadGalleryImage(gal.id)}
                      className="px-3 py-2 border border-white/10 text-white/60 hover:text-white"
                    >
                      Upload Image
                    </button>
                  </div>
                  {gal.images.length > gal.approved_images.length && (
                    <button
                      onClick={() =>
                        updateGallery(
                          gal.id.toString(),
                          'approve',
                          { images: gal.images.filter((i) => !gal.approved_images.includes(i)) }
                        )
                      }
                      className="text-[10px] uppercase tracking-[0.3em] px-3 py-2 border border-gold text-gold"
                    >
                      Approve New Uploads
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Content & Contact */}
          <section className="grid lg:grid-cols-2 gap-12 items-start">
            <div className={sectionCard}>
              <h2 className="text-2xl font-heading text-white italic">Homepage & About</h2>
              <div className="space-y-3">
                <label className={label}>Hero Text</label>
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  value={contentForm.homepage.heroText}
                  onChange={(e) => setContentForm({ ...contentForm, homepage: { ...contentForm.homepage, heroText: e.target.value } })}
                />
                <label className={label}>Hero Image</label>
                <input
                  className={inputClass}
                  value={contentForm.homepage.heroImage}
                  onChange={(e) => setContentForm({ ...contentForm, homepage: { ...contentForm.homepage, heroImage: e.target.value } })}
                />
              </div>
              <div className="space-y-3">
                <label className={label}>About Text</label>
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  value={contentForm.about.text}
                  onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, text: e.target.value } })}
                />
                <label className={label}>About Image</label>
                <input
                  className={inputClass}
                  value={contentForm.about.image}
                  onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, image: e.target.value } })}
                />
              </div>
              <button
                onClick={saveContent}
                className="w-full bg-gold hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
              >
                Save Content
              </button>
            </div>

            <div className={sectionCard}>
              <h2 className="text-2xl font-heading text-white italic">Contact & Social</h2>
              <div className="space-y-3">
                <label className={label}>Phone</label>
                <input
                  className={inputClass}
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
                <label className={label}>Email</label>
                <input
                  className={inputClass}
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
                <label className={label}>Address</label>
                <input
                  className={inputClass}
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                />
                <button
                  onClick={saveContact}
                  className="w-full bg-gold hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
                >
                  Save Contact
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gold">Social Links</h3>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    className={inputClass}
                    placeholder="Platform"
                    value={socialForm.platform}
                    onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="URL"
                    value={socialForm.url}
                    onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Icon (optional)"
                    value={socialForm.icon}
                    onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                  />
                </div>
                <button
                  onClick={addSocial}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 text-[10px] uppercase tracking-[0.3em]"
                >
                  Add Social
                </button>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {socials.map((s) => (
                    <div key={s.id} className="flex items-center justify-between border border-white/10 px-3 py-2 text-xs">
                      <span>{s.platform}</span>
                      <div className="flex items-center gap-2">
                        <a href={s.url} className="text-gold underline" target="_blank" rel="noreferrer">
                          View
                        </a>
                        <button onClick={() => deleteSocial(s.id.toString())} className="text-red-400 hover:text-red-200">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Orders */}
          <section className={sectionCard}>
            <h2 className="text-2xl font-heading text-white italic mb-4">Orders</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {orders.map((order) => (
                <div key={order.id} className="border border-white/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-white">
                    <span>{order.customer_email}</span>
                    <span className="text-white/50">Total: ${order.total_price}</span>
                  </div>
                  <div className="text-xs text-white/60">Items: {order.items?.length || 0}</div>
                  <select
                    className={`${inputClass} text-xs`}
                    value={order.status}
                    onChange={(e) => updateOrder(order.id.toString(), e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
              {orders.length === 0 && <p className="text-white/40 text-xs">No orders yet.</p>}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
      )}
    </>
  );
}
