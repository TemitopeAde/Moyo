'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  Loader2,
  LockKeyhole,
  Mail,
  Minimize2,
  Palette,
  RotateCcw,
  Send,
  ShoppingBag,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { LanguageCode, useLanguage } from '@/context/LanguageContext';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const STORAGE_KEY = 'eniyan-chat-last-pop';
const DISMISS_KEY = 'eniyan-chat-dismissed-at';
const POP_INTERVAL = 1000 * 60 * 8;

const FEATURE_CARDS = [
  {
    id: 'portfolio',
    href: '/photography/portfolio',
    icon: Camera,
  },
  {
    id: 'bookings',
    href: '/photography/bookings',
    icon: CalendarCheck,
  },
  {
    id: 'artShop',
    href: '/art/shop',
    icon: ShoppingBag,
  },
  {
    id: 'commissions',
    href: '/art/commissions',
    icon: Palette,
  },
  {
    id: 'clientGallery',
    href: '/photography/client-gallery',
    icon: LockKeyhole,
  },
  {
    id: 'newsletters',
    href: '/photography/newsletter',
    icon: Mail,
  },
] as const;

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/photography': 'Photography',
  '/photography/portfolio': 'Photography portfolio',
  '/photography/bookings': 'Book photography',
  '/photography/client-gallery': 'Client gallery',
  '/photography/about': 'Photography about',
  '/photography/newsletter': 'Photography newsletter',
  '/art': 'Fine art',
  '/art/works': 'Artworks',
  '/art/shop': 'Art shop',
  '/art/commissions': 'Art commissions',
  '/art/exhibitions': 'Exhibitions',
  '/art/about': 'Art about',
  '/art/newsletter': 'Art newsletter',
};

const ENIYAN_COPY: Record<LanguageCode, {
  eyebrow: string;
  title: string;
  subtitle: string;
  placeholder: string;
  thinking: string;
  greeting: string;
  starterPrompts: string[];
  features: Partial<Record<(typeof FEATURE_CARDS)[number]['id'], { label: string; title: string; action: string }>>;
}> = {
  EN: {
    eyebrow: 'Site companion',
    title: 'Eniyan',
    subtitle: 'Human site guide',
    placeholder: 'Ask Eniyan...',
    thinking: 'Thinking',
    greeting: "Mo ki o. I'm Eniyan, your guide around Ijabiken Moyo's world. Tell me what you want to do and I'll help you find the right page or next step.",
    starterPrompts: ['Help me choose a service', 'Book a photography session', 'Commission an artwork', 'Find my client gallery'],
    features: {
      portfolio: { label: 'See', title: 'Photography work', action: 'Explore' },
      bookings: { label: 'Book', title: 'Start a session', action: 'Inquire' },
      artShop: { label: 'Collect', title: 'Available art', action: 'Shop' },
      commissions: { label: 'Create', title: 'Custom artwork', action: 'Commission' },
      clientGallery: { label: 'Access', title: 'Client gallery', action: 'Open' },
      newsletters: { label: 'Follow', title: 'Studio updates', action: 'Join' },
    },
  },
  FR: {
    eyebrow: 'Compagnon du site',
    title: 'Eniyan',
    subtitle: 'Guide humain du site',
    placeholder: 'Demandez a Eniyan...',
    thinking: 'Reflexion',
    greeting: "Bonjour. Je suis Eniyan, votre guide sur le site d'Ijabiken Moyo. Dites-moi ce que vous voulez faire.",
    starterPrompts: ['Reserver une seance photo', 'Voir la boutique art', 'Voir les travaux recents'],
    features: {
      portfolio: { label: 'Guide', title: 'Voir le travail', action: 'Explorer' },
      bookings: { label: 'Reserver', title: 'Demarrer', action: 'Reserver' },
      artShop: { label: 'Collection', title: 'Acheter art', action: 'Visiter' },
    },
  },
  ES: {
    eyebrow: 'Guia del sitio',
    title: 'Eniyan',
    subtitle: 'Guia humano del sitio',
    placeholder: 'Pregunta a Eniyan...',
    thinking: 'Pensando',
    greeting: 'Hola. Soy Eniyan, tu guia en el sitio de Ijabiken Moyo. Dime que quieres hacer.',
    starterPrompts: ['Reservar una sesion', 'Mostrar la tienda de arte', 'Ver trabajos recientes'],
    features: {
      portfolio: { label: 'Guia', title: 'Ver obras', action: 'Explorar' },
      bookings: { label: 'Reserva', title: 'Iniciar sesion', action: 'Reservar' },
      artShop: { label: 'Coleccion', title: 'Comprar arte', action: 'Visitar' },
    },
  },
  DE: {
    eyebrow: 'Website-Begleiter',
    title: 'Eniyan',
    subtitle: 'Menschlicher Website-Guide',
    placeholder: 'Frag Eniyan...',
    thinking: 'Denke nach',
    greeting: 'Hallo. Ich bin Eniyan, dein Guide auf der Website von Ijabiken Moyo. Sag mir, was du tun moechtest.',
    starterPrompts: ['Fotosession buchen', 'Art-Shop zeigen', 'Aktuelle Arbeiten sehen'],
    features: {
      portfolio: { label: 'Guide', title: 'Arbeiten sehen', action: 'Entdecken' },
      bookings: { label: 'Buchen', title: 'Session starten', action: 'Buchen' },
      artShop: { label: 'Sammeln', title: 'Kunst kaufen', action: 'Besuchen' },
    },
  },
  PT: {
    eyebrow: 'Guia do site',
    title: 'Eniyan',
    subtitle: 'Guia humano do site',
    placeholder: 'Pergunte ao Eniyan...',
    thinking: 'Pensando',
    greeting: 'Ola. Sou Eniyan, seu guia no site de Ijabiken Moyo. Diga-me o que quer fazer.',
    starterPrompts: ['Marcar uma sessao', 'Mostrar loja de arte', 'Ver trabalhos recentes'],
    features: {
      portfolio: { label: 'Guia', title: 'Ver trabalhos', action: 'Explorar' },
      bookings: { label: 'Marcar', title: 'Iniciar sessao', action: 'Marcar' },
      artShop: { label: 'Colecionar', title: 'Comprar arte', action: 'Visitar' },
    },
  },
  AR: {
    eyebrow: 'دليل الموقع',
    title: 'Eniyan',
    subtitle: 'دليل إنساني للموقع',
    placeholder: 'اسأل Eniyan...',
    thinking: 'يفكر',
    greeting: 'مرحبا. أنا Eniyan، دليلك في موقع Ijabiken Moyo. أخبرني بما تريد فعله.',
    starterPrompts: ['حجز جلسة تصوير', 'اعرض متجر الفن', 'أين أرى الأعمال الحديثة؟'],
    features: {
      portfolio: { label: 'دليل', title: 'شاهد الأعمال', action: 'استكشف' },
      bookings: { label: 'حجز', title: 'ابدأ جلسة', action: 'احجز' },
      artShop: { label: 'اقتناء', title: 'تسوق الفن', action: 'زيارة' },
    },
  },
  ZH: {
    eyebrow: '网站向导',
    title: 'Eniyan',
    subtitle: '人性化网站向导',
    placeholder: '问 Eniyan...',
    thinking: '思考中',
    greeting: '你好。我是 Eniyan，是你浏览 Ijabiken Moyo 网站的向导。告诉我你想做什么。',
    starterPrompts: ['预约摄影', '打开艺术商店', '查看近期作品'],
    features: {
      portfolio: { label: '向导', title: '查看作品', action: '探索' },
      bookings: { label: '预约', title: '开始拍摄', action: '预约' },
      artShop: { label: '收藏', title: '购买艺术', action: '访问' },
    },
  },
  YO: {
    eyebrow: 'Oluranlowo oju opo',
    title: 'Eniyan',
    subtitle: 'Olutoju oju opo',
    placeholder: 'Beere lowo Eniyan...',
    thinking: 'N ronu',
    greeting: 'Mo ki o. Emi ni Eniyan, olutoju re lori oju opo Ijabiken Moyo. So ohun ti o fe se fun mi.',
    starterPrompts: ['Mo fe book igba foto', 'Fi shop art han mi', 'Nibo ni mo ti ri ise tuntun?'],
    features: {
      portfolio: { label: 'Itosona', title: 'Wo ise', action: 'Sewo' },
      bookings: { label: 'Book', title: 'Bere igba foto', action: 'Book' },
      artShop: { label: 'Akojo', title: 'Ra art', action: 'Wo' },
    },
  },
  IG: {
    eyebrow: 'Nduzi saịtị',
    title: 'Eniyan',
    subtitle: 'Nduzi mmadu maka saịtị',
    placeholder: 'Juo Eniyan...',
    thinking: 'Na-eche',
    greeting: 'Ndewo. A bu m Eniyan, onye ndu gi na webusaiti Ijabiken Moyo. Gwa m ihe ichoro ime.',
    starterPrompts: ['Book oge foto', 'Gosi m shop art', 'Ebee ka m ga-ahụ ọrụ ọhụrụ?'],
    features: {
      portfolio: { label: 'Nduzi', title: 'Lee ọrụ', action: 'Chọpụta' },
      bookings: { label: 'Book', title: 'Malite foto', action: 'Book' },
      artShop: { label: 'Nchịkọta', title: 'Zụta art', action: 'Gaa' },
    },
  },
  HA: {
    eyebrow: 'Jagoran shafi',
    title: 'Eniyan',
    subtitle: 'Jagoran yanar gizo',
    placeholder: 'Tambayi Eniyan...',
    thinking: 'Tunani',
    greeting: 'Sannu. Ni ne Eniyan, jagoranka a shafin Ijabiken Moyo. Fadi abin da kake son yi.',
    starterPrompts: ['Yi booking na hoto', 'Nuna min shagon art', 'Ina zan ga sabbin ayyuka?'],
    features: {
      portfolio: { label: 'Jagora', title: 'Duba aiki', action: 'Bincika' },
      bookings: { label: 'Booking', title: 'Fara zama', action: 'Book' },
      artShop: { label: 'Tara', title: 'Sayi art', action: 'Ziyarci' },
    },
  },
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getPageContext() {
  if (typeof window === 'undefined') return null;

  const title = document.title;
  const path = window.location.pathname;
  const visibleText = document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1600);

  return { title, path, visibleText };
}

function getMessageLinks(content: string) {
  const paths = content.match(/\/(?:photography|art)(?:\/[a-z-]+)?|\/(?=\s|$|[.,])/g) || [];
  return Array.from(new Set(paths)).filter((path) => ROUTE_LABELS[path]);
}

function EniyanSign({
  compact = false,
  neutral = false,
  light = false,
}: {
  compact?: boolean;
  neutral?: boolean;
  light?: boolean;
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border shadow-lg shadow-black/20 ${
        compact ? 'size-9' : 'size-14'
      } ${
        neutral && light
          ? 'border-black/10 bg-black/[0.035] text-black/70'
          : neutral
          ? 'border-white/15 bg-white/[0.035] text-white/72'
          : light
            ? 'border-black/10 bg-white text-black/70'
            : 'border-accent/24 bg-white/[0.045] text-accent'
      }`}
      aria-hidden="true"
    >
      <span
        className={`absolute left-1/2 top-2 h-[calc(100%-1rem)] w-px -translate-x-1/2 ${
          neutral && light || !neutral && light ? 'bg-black/18' : neutral ? 'bg-white/18' : 'bg-accent/24'
        }`}
      />
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full ${compact ? 'size-1.5' : 'size-2'} ${
          neutral && light || !neutral && light ? 'bg-black/45' : neutral ? 'bg-white/55' : 'bg-accent'
        }`}
      />
      <span
        className={`relative font-heading italic leading-none ${compact ? 'text-base' : 'text-2xl'} ${
          neutral && light || !neutral && light ? 'text-black/70' : neutral ? 'text-white/75' : 'text-accent'
        }`}
      >
        E
      </span>
    </span>
  );
}

export default function EniyanChat() {
  const { language } = useLanguage();
  const { resolvedTheme, theme } = useTheme();
  const copy = ENIYAN_COPY[language] || ENIYAN_COPY.EN;
  const isLight = (resolvedTheme || theme) === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: copy.greeting,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recentMessages = useMemo(() => messages.slice(-8), [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.id !== 'welcome') return current;
      return [{ ...current[0], content: copy.greeting }];
    });
  }, [copy.greeting]);

  useEffect(() => {
    const maybeOpen = () => {
      const now = Date.now();
      const lastPop = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
      const lastDismissed = Number(window.localStorage.getItem(DISMISS_KEY) || 0);

      if (now - lastPop < POP_INTERVAL || now - lastDismissed < POP_INTERVAL) {
        setIsPulsing(true);
        window.setTimeout(() => setIsPulsing(false), 2400);
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, String(now));
      setIsOpen(true);
    };

    const initialTimer = window.setTimeout(maybeOpen, 9000);
    const interval = window.setInterval(() => {
      if (!isOpen) maybeOpen();
    }, POP_INTERVAL);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = { id: createId(), role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);
    setIsOpen(true);

    try {
      const response = await fetch('/api/eniyan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          page: { ...(getPageContext() || {}), language },
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Eniyan is unavailable right now.');
      }

      setMessages((current) => [
        ...current,
        { id: createId(), role: 'assistant', content: data.reply || 'I can help you find the right page.' },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eniyan is unavailable right now.';
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  function closeChat() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsOpen(false);
  }

  function resetChat() {
    setMessages([{ id: 'welcome', role: 'assistant', content: copy.greeting }]);
    setInput('');
    setError('');
  }

  return (
    <div className="fixed bottom-5 right-5 z-[120] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
            className={`relative w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-[18px] border shadow-2xl backdrop-blur-xl ${
              isLight
                ? 'border-black/10 bg-[#fbfaf7]/96 text-[#141414] shadow-black/12'
                : 'border-white/10 bg-[#111111]/96 text-white shadow-black/45'
            }`}
            aria-label="Eniyan AI chat assistant"
          >
            <div className="relative">
              <header className={`overflow-hidden border-b px-5 py-4 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <EniyanSign compact />
                  <div className="min-w-0">
                    <p className={`mb-1 text-[9px] font-medium uppercase tracking-[0.28em] ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      {copy.eyebrow}
                    </p>
                    <h2 className={`truncate font-heading text-2xl italic leading-none ${isLight ? 'text-[#141414]' : 'text-white'}`}>
                      {copy.title}
                    </h2>
                    <p className={`mt-2 truncate text-[10px] uppercase tracking-[0.18em] ${isLight ? 'text-black/45' : 'text-white/45'}`}>
                      {copy.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={resetChat}
                    className={`grid size-9 place-items-center rounded-full transition ${
                      isLight ? 'text-black/45 hover:bg-black/5 hover:text-black' : 'text-white/50 hover:bg-white/8 hover:text-white'
                    }`}
                    aria-label="Reset Eniyan chat"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={`grid size-9 place-items-center rounded-full transition ${
                      isLight ? 'text-black/45 hover:bg-black/5 hover:text-black' : 'text-white/50 hover:bg-white/8 hover:text-white'
                    }`}
                    aria-label="Minimize Eniyan"
                  >
                    <Minimize2 className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={closeChat}
                    className={`grid size-9 place-items-center rounded-full transition ${
                      isLight ? 'text-black/45 hover:bg-black/5 hover:text-black' : 'text-white/50 hover:bg-white/8 hover:text-white'
                    }`}
                    aria-label="Close Eniyan"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                </div>
              </header>

              <div className={`border-b px-5 py-3 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                <div className="flex gap-3 overflow-x-auto pb-1">
                {FEATURE_CARDS.map((card) => {
                  const Icon = card.icon;
                  const cardCopy = copy.features[card.id] || ENIYAN_COPY.EN.features[card.id];
                  if (!cardCopy) return null;
                  return (
                  <a
                    key={card.href}
                    href={card.href}
                    className={`group flex w-[146px] shrink-0 flex-col rounded-[14px] border p-3 transition ${
                      isLight
                        ? 'border-black/10 bg-white/45 hover:bg-white/75'
                        : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`mb-3 grid size-9 place-items-center rounded-[10px] border transition ${
                        isLight
                          ? 'border-black/10 bg-[#111111] text-white'
                          : 'border-white/10 bg-white/[0.045] text-white/64'
                      }`}
                    >
                      <Icon
                        className="size-4"
                        color={isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.72)'}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`mb-1 block text-[8px] font-semibold uppercase tracking-[0.2em] ${isLight ? 'text-black/38' : 'text-white/38'}`}>
                        {cardCopy.label}
                      </span>
                      <span className={`block text-sm font-semibold leading-tight ${isLight ? 'text-black/85' : 'text-white/86'}`}>
                        {cardCopy.title}
                      </span>
                      <span className={`mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold ${isLight ? 'text-black/52' : 'text-white/52'}`}>
                        {cardCopy.action}
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </span>
                  </a>
                  );
                })}
                </div>
              </div>

            <div ref={scrollRef} className="max-h-[34svh] space-y-4 overflow-y-auto px-5 py-4">
              {recentMessages.map((message) => {
                const links = message.role === 'assistant' ? getMessageLinks(message.content) : [];

                return (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <p
                    className={`max-w-[84%] whitespace-pre-wrap rounded-[2px] px-3 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? isLight
                          ? 'bg-[#181818] text-white'
                          : 'bg-white text-[#111111]'
                        : isLight
                          ? 'border-l border-black/18 bg-black/[0.035] text-black/72'
                          : 'border-l border-white/18 bg-white/[0.045] text-white/78'
                    }`}
                  >
                    {message.content}
                  </p>
                  {links.length > 0 && (
                    <div className="mt-2 flex max-w-[84%] flex-wrap gap-2">
                      {links.map((path) => (
                        <a
                          key={path}
                          href={path}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                            isLight
                              ? 'border-black/10 bg-white/70 text-black/62 hover:border-black/22 hover:text-black'
                              : 'border-white/10 bg-white/[0.045] text-white/62 hover:border-white/22 hover:text-white'
                          }`}
                        >
                          {ROUTE_LABELS[path]}
                          <ArrowRight className="size-3" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
              {isSending && (
                <div className="flex justify-start">
                  <div
                    className={`flex items-center gap-2 rounded-[2px] border-l border-accent/45 px-3 py-2 text-sm ${
                      isLight ? 'bg-black/[0.035] text-black/55' : 'bg-white/[0.045] text-white/55'
                    }`}
                  >
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {copy.thinking}
                  </div>
                </div>
              )}
              {error && <p className="text-xs leading-relaxed text-red-500">{error}</p>}
            </div>

            <div className={`border-t px-5 py-4 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
              <div className="mb-3 flex flex-wrap gap-2">
                {copy.starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className={`rounded-full border px-3 py-2 text-left text-[10px] uppercase tracking-[0.12em] transition ${
                      isLight ? 'border-black/10 bg-white/45 text-black/52' : 'border-white/10 bg-white/[0.035] text-white/55'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(input);
                }}
              >
                <label className="sr-only" htmlFor="eniyan-message">
                  Message Eniyan
                </label>
                <textarea
                  id="eniyan-message"
                  value={input}
                  rows={1}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder={copy.placeholder}
                  className={`max-h-24 min-h-11 flex-1 resize-none rounded-full border px-4 py-3 text-sm outline-none transition ${
                    isLight
                      ? 'border-black/10 bg-white/70 text-black placeholder:text-black/30 focus:border-black/24'
                      : 'border-white/10 bg-white/[0.035] text-white placeholder:text-white/30 focus:border-white/24'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className={`grid size-11 shrink-0 place-items-center rounded-full transition disabled:cursor-not-allowed ${
                    isLight
                      ? 'bg-black/[0.08] text-accent hover:bg-black/[0.12]'
                      : 'bg-white/[0.08] text-accent hover:bg-white/[0.12]'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="size-4 text-accent" aria-hidden="true" />
                </button>
              </form>
            </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`group grid size-11 place-items-center rounded-full border shadow-xl shadow-black/20 backdrop-blur-xl transition ${
          isLight
            ? 'border-black/10 bg-white/80 text-black/70 hover:border-black/18 hover:bg-white hover:text-black'
            : 'border-white/10 bg-[#171717]/86 text-white/68 hover:border-white/18 hover:bg-[#1f1f1f]/90 hover:text-white/86'
        } ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        aria-label={isOpen ? 'Hide Eniyan chat' : 'Open Eniyan chat'}
      >
        {isOpen ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <EniyanSign compact neutral light={isLight} />
        )}
      </button>
    </div>
  );
}
