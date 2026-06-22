'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiChevronDown,
  FiCheckCircle,
  FiImage,
  FiLock,
  FiTrash2,
  FiUnlock,
  FiUpload,
  FiXCircle,
} from 'react-icons/fi';

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
  finished_images: string[];
  payment_verified: boolean;
  payment_url: string;
  is_locked: boolean;
};

type PhotographyCatalogImage = {
  id: number;
  category_id: number;
  image_url: string;
  title: string;
  alt_text: string;
  display_order: number;
};

type PhotographyCatalogCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
  images: PhotographyCatalogImage[];
};

type Content = {
  homepage: { heroText: string; heroImage: string };
  about: { text: string; image: string };
};

type Contact = { phone: string; email: string; address: string };
type Social = { id: number; platform: string; url: string; icon?: string };
type Order = { id: number; items: unknown[]; total_price: number; status: string; customer_email: string };
type AdminSection = 'artwork' | 'catalog' | 'galleries' | 'content-contact' | 'orders';

const sectionCard = 'bg-black/20 p-6 md:p-8 border border-white/10 space-y-6';
const label = 'text-[10px] uppercase tracking-widest text-white/40';
const inputClass =
  'w-full rounded-sm bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-accent outline-none transition-colors';

function AdminAccordionPanel({
  id,
  title,
  summary,
  openSection,
  onOpen,
  children,
}: {
  id: AdminSection;
  title: string;
  summary: string;
  openSection: AdminSection;
  onOpen: (section: AdminSection) => void;
  children: React.ReactNode;
}) {
  const isOpen = openSection === id;
  const panelId = `admin-panel-${id}`;
  const buttonId = `admin-panel-${id}-button`;

  return (
    <div className={`border transition-colors ${isOpen ? 'border-accent/35 bg-accent/[0.03]' : 'border-white/10 bg-white/[0.02]'}`}>
      <button
        type="button"
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => onOpen(id)}
        className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-white/[0.04] md:px-7"
      >
        <span className="space-y-1">
          <span className={`block font-heading text-2xl italic ${isOpen ? 'text-accent' : 'text-white'}`}>
            {title}
          </span>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-white/35">
            {summary}
          </span>
        </span>
        <FiChevronDown
          className={`shrink-0 text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : 'text-white/40'}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-5 py-8 md:px-7">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openAdminSection, setOpenAdminSection] = useState<AdminSection>('artwork');

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<PhotographyCatalogCategory[]>([]);
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
  const [catalogCategoryForm, setCatalogCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: '',
  });
  const [catalogImageForm, setCatalogImageForm] = useState({
    category_id: '',
    title: '',
    alt_text: '',
    image_url: '',
    display_order: '',
  });
  const [contentForm, setContentForm] = useState(content);
  const [contactForm, setContactForm] = useState(contact);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '', icon: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [catalogImageFile, setCatalogImageFile] = useState<File | null>(null);
  const [galleryUploads, setGalleryUploads] = useState<Record<string, File[]>>({});
  const [finishedGalleryUploads, setFinishedGalleryUploads] = useState<Record<string, File[]>>({});
  const [galleryPaymentUrls, setGalleryPaymentUrls] = useState<Record<string, string>>({});
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [catalogImagePreview, setCatalogImagePreview] = useState<string | null>(null);
  const catalogImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.removeItem('moyo-admin-key');
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
        fetch('/api/galleries', { headers }),
        fetch('/api/content'),
        fetch('/api/contact'),
        fetch('/api/socials'),
        fetch('/api/orders'),
      ]);
      const catalogRes = await fetch('/api/photography-catalog/categories', { headers });

      const artData = await artRes.json();
      const galData = await galRes.json();
      const conData = await contentRes.json();
      const contactData = await contactRes.json();
      const socialData = await socialRes.json();
      const orderData = await orderRes.json();
      const catalogData = await catalogRes.json();

      setArtworks(artData.artworks || []);
      setGalleries(galData.galleries || []);
      setGalleryPaymentUrls(
        (galData.galleries || []).reduce((acc: Record<string, string>, gallery: Gallery) => {
          acc[gallery.id] = gallery.payment_url || '';
          return acc;
        }, {})
      );
      setCatalogCategories(catalogData.categories || []);
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

  const verifyAdminKey = async (keyToVerify: string) => {
    const submittedKey = keyToVerify.trim();
    setAuthError(null);
    setMessage(null);

    if (!submittedKey) {
      setIsAuthed(false);
      setAuthError('Enter the admin password');
      return false;
    }

    setAuthChecking(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': submittedKey,
        },
      });
      if (!res.ok) {
        setIsAuthed(false);
        localStorage.removeItem('moyo-admin-key');
        setAuthError('Invalid admin password');
        return false;
      }
      setAdminKey(submittedKey);
      setIsAuthed(true);
      setMessage({ text: 'Admin unlocked', type: 'success' });
      return true;
    } catch {
      setIsAuthed(false);
      localStorage.removeItem('moyo-admin-key');
      setAuthError('Unable to verify password');
      return false;
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyAdminKey(adminKey);
  };

  const generateAccessCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const uploadSingleFile = async (file: File) => {
    console.log('[admin] upload start', { name: file.name, size: file.size, type: file.type });
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
      body: formData,
    });
    console.log('[admin] upload response', { status: res.status });
    const data = await res.json();
    if (data.url) return data.url;
    throw new Error(data.error || 'Upload failed');
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return [];
    setUploading(true);
    try {
      return await Promise.all(files.map((file) => uploadSingleFile(file)));
    } catch (error) {
      console.error('[admin] upload error', error);
      setMessage({ text: (error as Error).message, type: 'error' });
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const urls = await uploadFiles([file]);
    return urls[0] || null;
  };

  const getSelectedFileLabel = (files: File[] | undefined, fallback: string) => {
    if (!files?.length) return fallback;
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
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

  useEffect(() => {
    return () => {
      if (catalogImagePreview && catalogImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(catalogImagePreview);
      }
    };
  }, [catalogImagePreview]);

  const handleCatalogImageFileChange = async (file: File | null) => {
    setCatalogImageFile(file);
    if (!file) {
      setCatalogImagePreview(catalogImageForm.image_url || null);
      return;
    }
    const localPreview = URL.createObjectURL(file);
    setCatalogImagePreview(localPreview);

    if (!adminKey) {
      setMessage({ text: 'Add admin password first', type: 'error' });
      return;
    }

    const url = await handleUpload(file);
    if (url) {
      setCatalogImageForm((prev) => ({ ...prev, image_url: url }));
      setCatalogImagePreview(url);
      setMessage({ text: 'Catalogue image uploaded from this device', type: 'success' });
    }
  };

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
    setGalleryPaymentUrls((prev) => ({ ...prev, [data.gallery.id]: data.gallery.payment_url || '' }));
    setGalleryForm({ clientName: '', slug: '', access_code: '' });
    setMessage({ text: 'Gallery created', type: 'success' });
  };

  const updateGallery = async (id: string, action: string, payload?: Record<string, unknown>) => {
    const res = await fetch('/api/galleries', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, action, payload }),
    });
    const data = await res.json();
    if (res.ok) {
      setGalleries((prev) => prev.map((g) => (g.id === Number(id) ? data.gallery : g)));
      setGalleryPaymentUrls((prev) => ({ ...prev, [id]: data.gallery.payment_url || '' }));
    } else {
      setMessage({ text: data.error || 'Unable to update gallery', type: 'error' });
    }
  };

  const uploadGalleryImage = async (id: number) => {
    const files = galleryUploads[id] || [];
    if (!files.length) return setMessage({ text: 'Choose client media files first', type: 'error' });
    const urls = await uploadFiles(files);
    if (!urls.length) return;
    await updateGallery(id.toString(), 'addImages', { images: urls });
    setGalleryUploads((prev) => ({ ...prev, [id]: [] }));
    setMessage({ text: `${urls.length} client media ${urls.length === 1 ? 'file' : 'files'} uploaded`, type: 'success' });
  };

  const uploadFinishedGalleryImage = async (id: number) => {
    const files = finishedGalleryUploads[id] || [];
    if (!files.length) return setMessage({ text: 'Choose finished work files first', type: 'error' });
    const urls = await uploadFiles(files);
    if (!urls.length) return;
    await updateGallery(id.toString(), 'addFinishedImages', { images: urls });
    setFinishedGalleryUploads((prev) => ({ ...prev, [id]: [] }));
    setMessage({ text: `${urls.length} finished work ${urls.length === 1 ? 'file' : 'files'} uploaded`, type: 'success' });
  };

  const saveGalleryPayment = async (gallery: Gallery, paymentVerified = gallery.payment_verified) => {
    await updateGallery(gallery.id.toString(), 'payment', {
      paymentVerified,
      paymentUrl: galleryPaymentUrls[gallery.id] ?? gallery.payment_url ?? '',
    });
  };

  const createCatalogCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return setMessage({ text: 'Add admin key first', type: 'error' });

    const res = await fetch('/api/photography-catalog/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...catalogCategoryForm,
        display_order: Number(catalogCategoryForm.display_order || 0),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage({ text: data.error || 'Failed to create category', type: 'error' });

    setCatalogCategories((prev) => [data.category, ...prev]);
    setCatalogCategoryForm({ name: '', slug: '', description: '', display_order: '' });
    setMessage({ text: 'Photography category created', type: 'success' });
  };

  const toggleCatalogCategory = async (category: PhotographyCatalogCategory) => {
    const res = await fetch('/api/photography-catalog/categories', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...category, is_active: !category.is_active }),
    });
    const data = await res.json();
    if (res.ok) {
      setCatalogCategories((prev) =>
        prev.map((item) => (item.id === category.id ? { ...item, ...data.category } : item))
      );
    }
  };

  const deleteCatalogCategory = async (id: number) => {
    const res = await fetch(`/api/photography-catalog/categories?id=${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      setCatalogCategories((prev) => prev.filter((category) => category.id !== id));
      if (catalogImageForm.category_id === String(id)) {
        setCatalogImageForm((prev) => ({ ...prev, category_id: '' }));
      }
      setMessage({ text: 'Photography category deleted', type: 'success' });
    }
  };

  const createCatalogImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return setMessage({ text: 'Add admin key first', type: 'error' });
    if (!catalogImageForm.category_id) {
      return setMessage({ text: 'Choose a category first', type: 'error' });
    }

    let imageUrl = catalogImageForm.image_url;
    if (catalogImageFile) {
      const uploadedUrl = await handleUpload(catalogImageFile);
      if (!uploadedUrl) return;
      imageUrl = uploadedUrl;
    }

    if (!imageUrl) return setMessage({ text: 'Upload an image or paste an image URL', type: 'error' });

    const res = await fetch('/api/photography-catalog/images', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...catalogImageForm,
        category_id: Number(catalogImageForm.category_id),
        image_url: imageUrl,
        display_order: Number(catalogImageForm.display_order || 0),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage({ text: data.error || 'Failed to add image', type: 'error' });

    setCatalogCategories((prev) =>
      prev.map((category) =>
        category.id === Number(catalogImageForm.category_id)
          ? { ...category, images: [...(category.images || []), data.image] }
          : category
      )
    );
    setCatalogImageForm({ category_id: catalogImageForm.category_id, title: '', alt_text: '', image_url: '', display_order: '' });
    setCatalogImageFile(null);
    setCatalogImagePreview(null);
    setMessage({ text: 'Catalog image added', type: 'success' });
  };

  const deleteCatalogImage = async (id: number) => {
    const res = await fetch(`/api/photography-catalog/images?id=${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      setCatalogCategories((prev) =>
        prev.map((category) => ({
          ...category,
          images: category.images.filter((image) => image.id !== id),
        }))
      );
      setMessage({ text: 'Catalog image deleted', type: 'success' });
    }
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
          <section className="flex-1 flex items-center justify-center px-6 pt-36 md:pt-52">
            <form
              onSubmit={handleAuthSubmit}
              className="w-full max-w-md space-y-6 bg-surface/40 border border-white/10 p-8 backdrop-blur-md"
            >
              <div className="space-y-2 text-center">
                <p className="text-accent text-[10px] tracking-[0.5em] uppercase">Admin Access</p>
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
                className="w-full bg-accent text-black py-3 text-[11px] uppercase tracking-[0.4em] font-semibold disabled:opacity-50"
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

      <section className="pt-36 md:pt-52 pb-20 container mx-auto px-6 md:px-12">
        <header className="mb-16 space-y-4">
          <span className="text-accent text-[10px] tracking-[0.5em] uppercase">Control Panel</span>
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
            <Link
              href="/admin/newsletter"
              className="px-3 py-2 border border-accent/30 bg-accent/10 text-accent uppercase tracking-[0.25em] hover:border-accent hover:bg-accent hover:text-black transition-colors"
            >
              Newsletter Studio
            </Link>
            <button
              type="button"
              onClick={() => setOpenAdminSection('catalog')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-accent/30 bg-accent/10 text-accent uppercase tracking-[0.25em] hover:border-accent hover:bg-accent hover:text-black transition-colors"
            >
              <FiImage aria-hidden="true" />
              Upload Catalogue
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="password"
              className={`${inputClass} text-xs`}
              placeholder="Admin key"
              value={adminKey}
              onChange={(e) => {
                setAdminKey(e.target.value);
                setIsAuthed(false);
              }}
            />
            <button
              onClick={() => {
                setAdminKey('');
                setIsAuthed(false);
                setAuthError(null);
                setMessage(null);
                localStorage.removeItem('moyo-admin-key');
              }}
              className="text-[10px] uppercase tracking-[0.3em] px-3 py-2 border border-white/10 text-white/60 hover:text-white"
            >
              Lock
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

        <div className="space-y-4">
          {/* Artwork */}
          <AdminAccordionPanel
            id="artwork"
            title="Artwork"
            summary={`${artworks.length} ${artworks.length === 1 ? 'work' : 'works'}`}
            openSection={openAdminSection}
            onOpen={setOpenAdminSection}
          >
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
                    <div className="w-full bg-white/5 border-2 border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-3 group-hover:border-accent/50 transition-colors">
                      <FiUpload className="text-xl text-white/20 group-hover:text-accent transition-colors" />
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
                  className="w-full bg-accent hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Save Artwork'}
                </button>
              </form>
            </div>
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-accent">Existing</h3>
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
                      className={`px-3 py-2 border ${art.is_featured ? 'border-accent text-accent' : 'border-white/10 text-white/60'}`}
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
          </AdminAccordionPanel>

          {/* Photography Catalog */}
          <AdminAccordionPanel
            id="catalog"
            title="Photography Catalog"
            summary={`${catalogCategories.length} ${catalogCategories.length === 1 ? 'category' : 'categories'}`}
            openSection={openAdminSection}
            onOpen={setOpenAdminSection}
          >
          <section className="grid lg:grid-cols-2 gap-12 items-start">
            <div className={sectionCard}>
              <h2 className="text-2xl font-heading text-white italic">Photography Catalog</h2>
              <form className="space-y-4" onSubmit={createCatalogCategory}>
                <div className="space-y-2">
                  <label className={label}>Category Name</label>
                  <input
                    className={inputClass}
                    placeholder="Wedding, Portrait, Editorial..."
                    value={catalogCategoryForm.name}
                    onChange={(e) => setCatalogCategoryForm({ ...catalogCategoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={label}>Slug (optional)</label>
                    <input
                      className={inputClass}
                      placeholder="wedding"
                      value={catalogCategoryForm.slug}
                      onChange={(e) => setCatalogCategoryForm({ ...catalogCategoryForm, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={label}>Order</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={catalogCategoryForm.display_order}
                      onChange={(e) => setCatalogCategoryForm({ ...catalogCategoryForm, display_order: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={label}>Description</label>
                  <textarea
                    className={`${inputClass} min-h-[90px]`}
                    value={catalogCategoryForm.description}
                    onChange={(e) => setCatalogCategoryForm({ ...catalogCategoryForm, description: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
                >
                  Create Category
                </button>
              </form>

              <form className="pt-6 border-t border-white/5 space-y-4" onSubmit={createCatalogImage}>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-accent">Add Image To Category</h3>
                <div className="space-y-2">
                  <label className={label}>Category</label>
                  <select
                    className={inputClass}
                    value={catalogImageForm.category_id}
                    onChange={(e) => setCatalogImageForm({ ...catalogImageForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">Choose category</option>
                    {catalogCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={label}>Title</label>
                    <input
                      className={inputClass}
                      value={catalogImageForm.title}
                      onChange={(e) => setCatalogImageForm({ ...catalogImageForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={label}>Order</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={catalogImageForm.display_order}
                      onChange={(e) => setCatalogImageForm({ ...catalogImageForm, display_order: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={label}>Alt Text</label>
                  <input
                    className={inputClass}
                    value={catalogImageForm.alt_text}
                    onChange={(e) => setCatalogImageForm({ ...catalogImageForm, alt_text: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className={label}>Image</label>
                  <input
                    ref={catalogImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCatalogImageFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => catalogImageInputRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-white/10 bg-white/[0.04] p-6 text-center transition-colors hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiUpload className="text-xl text-white/25" aria-hidden="true" />
                    <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                      {uploading ? 'Uploading from device...' : catalogImageFile ? catalogImageFile.name : 'Upload from this device'}
                    </span>
                    <span className="text-xs text-white/30">Desktop, phone gallery, or camera roll</span>
                  </button>
                  <input
                    className={inputClass}
                    placeholder="uploaded image URL will appear here"
                    value={catalogImageForm.image_url}
                    onChange={(e) => {
                      setCatalogImageForm({ ...catalogImageForm, image_url: e.target.value });
                      if (!catalogImageFile) setCatalogImagePreview(e.target.value || null);
                    }}
                  />
                  {catalogImagePreview && (
                    <div className="overflow-hidden border border-white/10 bg-white/[0.04]">
                      <img src={catalogImagePreview} alt="Catalogue preview" className="h-48 w-full object-cover" />
                      <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                        Catalogue preview
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Add Catalog Image'}
                </button>
              </form>
            </div>

            <div className="space-y-4 max-h-[760px] overflow-y-auto pr-2">
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-accent">Catalog Categories</h3>
              {catalogCategories.map((category) => (
                <div key={category.id} className="bg-surface/20 border border-white/5 p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-heading italic">{category.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">
                        slug: {category.slug} • images: {category.images?.length || 0}
                      </p>
                      {category.description && (
                        <p className="mt-2 text-xs text-white/50 leading-relaxed">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCatalogCategory(category)}
                        className={`px-3 py-2 border text-[10px] uppercase tracking-[0.2em] ${
                          category.is_active ? 'border-accent text-accent' : 'border-white/10 text-white/50'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCatalogCategory(category.id)}
                        className="p-2 text-red-400 hover:text-red-200 border border-white/10"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {category.images?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {category.images.map((image) => (
                        <div key={image.id} className="relative group overflow-hidden border border-white/10 bg-black">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || image.title || category.name}
                            className="h-28 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => deleteCatalogImage(image.id)}
                            className="absolute right-2 top-2 bg-black/70 p-2 text-red-300 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <FiTrash2 />
                          </button>
                          {image.title && (
                            <p className="px-2 py-2 text-[10px] text-white/60 truncate">{image.title}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/35">No images in this category yet.</p>
                  )}
                </div>
              ))}
              {catalogCategories.length === 0 && (
                <p className="border border-white/10 p-6 text-xs text-white/40">No photography catalog categories yet.</p>
              )}
            </div>
          </section>
          </AdminAccordionPanel>

          {/* Galleries */}
          <AdminAccordionPanel
            id="galleries"
            title="Galleries"
            summary={`${galleries.length} ${galleries.length === 1 ? 'gallery' : 'galleries'}`}
            openSection={openAdminSection}
            onOpen={setOpenAdminSection}
          >
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
                    <div className="flex gap-2">
                      <input
                        className={inputClass}
                        value={galleryForm.access_code}
                        onChange={(e) => setGalleryForm({ ...galleryForm, access_code: e.target.value.toUpperCase() })}
                      />
                      <button
                        type="button"
                        onClick={() => setGalleryForm((prev) => ({ ...prev, access_code: generateAccessCode() }))}
                        className="shrink-0 border border-white/10 px-3 text-[10px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-accent hover:text-accent"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
                >
                  Create Gallery
                </button>
              </form>
            </div>
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-accent">Existing</h3>
              {galleries.map((gal) => (
                <div key={gal.id} className="bg-surface/20 border border-white/5 p-4 space-y-5">
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
                    <span>Selected for retouching: {gal.approved_images.length}</span>
                    <span>Finished: {gal.finished_images?.length || 0}</span>
                    <span className={gal.payment_verified ? 'text-green-300' : 'text-white/40'}>
                      {gal.payment_verified ? 'Payment verified' : 'Payment pending'}
                    </span>
                  </div>
                  {gal.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {gal.images.map((img, index) => (
                        <img
                          key={img}
                          src={img}
                          alt={`${gal.client_name} gallery upload ${index + 1}`}
                          className="h-20 w-full object-cover border border-white/10"
                        />
                      ))}
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <label className="relative block cursor-pointer border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/45 transition-colors hover:border-accent/50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setGalleryUploads((prev) => ({ ...prev, [gal.id]: Array.from(e.target.files || []) }))
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      {getSelectedFileLabel(galleryUploads[gal.id], 'Choose client media')}
                    </label>
                    <button
                      type="button"
                      disabled={uploading || !(galleryUploads[gal.id]?.length)}
                      onClick={() => uploadGalleryImage(gal.id)}
                      className="px-4 py-3 border border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {uploading ? 'Uploading...' : 'Upload Media'}
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
                      className="text-[10px] uppercase tracking-[0.3em] px-3 py-2 border border-accent text-accent"
                    >
                      Approve New Uploads
                    </button>
                  )}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                      <label className="relative block cursor-pointer border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/45 transition-colors hover:border-accent/50">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            setFinishedGalleryUploads((prev) => ({ ...prev, [gal.id]: Array.from(e.target.files || []) }))
                          }
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        {getSelectedFileLabel(finishedGalleryUploads[gal.id], 'Choose finished work')}
                      </label>
                      <button
                        type="button"
                        disabled={uploading || !(finishedGalleryUploads[gal.id]?.length)}
                        onClick={() => uploadFinishedGalleryImage(gal.id)}
                        className="px-4 py-3 border border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {uploading ? 'Uploading...' : 'Upload Finished'}
                      </button>
                    </div>
                    {gal.finished_images?.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {gal.finished_images.map((img, index) => (
                          <div key={img} className="relative">
                            <img
                              src={img}
                              alt={`${gal.client_name} finished work ${index + 1}`}
                              className="h-20 w-full object-cover border border-white/10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateGallery(gal.id.toString(), 'removeFinishedImage', { images: [img] })
                              }
                              className="absolute right-1 top-1 bg-black/70 p-1 text-red-300"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                      <input
                        className={`${inputClass} text-xs`}
                        placeholder="Payment link for client"
                        value={galleryPaymentUrls[gal.id] ?? gal.payment_url ?? ''}
                        onChange={(e) =>
                          setGalleryPaymentUrls((prev) => ({ ...prev, [gal.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => saveGalleryPayment(gal)}
                        className="px-4 py-3 border border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-accent hover:text-accent"
                      >
                        Save Link
                      </button>
                      <button
                        type="button"
                        onClick={() => saveGalleryPayment(gal, !gal.payment_verified)}
                        className={`px-4 py-3 border text-[10px] uppercase tracking-[0.2em] transition-colors ${
                          gal.payment_verified
                            ? 'border-green-400/40 text-green-300 hover:border-white hover:text-white'
                            : 'border-accent/50 text-accent hover:bg-accent hover:text-black'
                        }`}
                      >
                        {gal.payment_verified ? 'Mark Unpaid' : 'Verify Payment'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </AdminAccordionPanel>

          {/* Content & Contact */}
          <AdminAccordionPanel
            id="content-contact"
            title="Homepage & Contact"
            summary={`${socials.length} social ${socials.length === 1 ? 'link' : 'links'}`}
            openSection={openAdminSection}
            onOpen={setOpenAdminSection}
          >
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
                className="w-full bg-accent hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
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
                  className="w-full bg-accent hover:bg-white text-black py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-medium transition-all"
                >
                  Save Contact
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-accent">Social Links</h3>
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
                        <a href={s.url} className="text-accent underline" target="_blank" rel="noreferrer">
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
          </AdminAccordionPanel>

          {/* Orders */}
          <AdminAccordionPanel
            id="orders"
            title="Orders"
            summary={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
            openSection={openAdminSection}
            onOpen={setOpenAdminSection}
          >
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
          </AdminAccordionPanel>
        </div>
      </section>

      <Footer />
    </main>
      )}
    </>
  );
}
