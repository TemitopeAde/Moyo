'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Camera, FileText, Folder, Loader2, Minimize2, Send, X } from 'lucide-react';
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
    id: 'guide',
    href: '/photography/portfolio',
    icon: Camera,
  },
  {
    id: 'book',
    href: '/photography/bookings',
    icon: FileText,
  },
  {
    id: 'collect',
    href: '/art/shop',
    icon: Folder,
  },
] as const;

const ENIYAN_COPY: Record<LanguageCode, {
  eyebrow: string;
  title: string;
  subtitle: string;
  placeholder: string;
  thinking: string;
  greeting: string;
  starterPrompts: string[];
  features: Record<(typeof FEATURE_CARDS)[number]['id'], { label: string; title: string; action: string }>;
}> = {
  EN: {
    eyebrow: 'Site companion',
    title: 'Eniyan',
    subtitle: 'Human site guide',
    placeholder: 'Ask Eniyan...',
    thinking: 'Thinking',
    greeting: "Mo ki o. I'm Eniyan, your guide around Ijabiken Moyo's world. Tell me what you want to do and I'll help you find the right page or next step.",
    starterPrompts: ['Book a photography session', 'Show me the art shop', 'Where can I see recent work?'],
    features: {
      guide: { label: 'Guide', title: 'Find work', action: 'Explore' },
      book: { label: 'Book', title: 'Start a session', action: 'Book' },
      collect: { label: 'Collect', title: 'Shop art', action: 'Visit' },
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
      guide: { label: 'Guide', title: 'Voir le travail', action: 'Explorer' },
      book: { label: 'Reserver', title: 'Demarrer', action: 'Reserver' },
      collect: { label: 'Collection', title: 'Acheter art', action: 'Visiter' },
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
      guide: { label: 'Guia', title: 'Ver obras', action: 'Explorar' },
      book: { label: 'Reserva', title: 'Iniciar sesion', action: 'Reservar' },
      collect: { label: 'Coleccion', title: 'Comprar arte', action: 'Visitar' },
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
      guide: { label: 'Guide', title: 'Arbeiten sehen', action: 'Entdecken' },
      book: { label: 'Buchen', title: 'Session starten', action: 'Buchen' },
      collect: { label: 'Sammeln', title: 'Kunst kaufen', action: 'Besuchen' },
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
      guide: { label: 'Guia', title: 'Ver trabalhos', action: 'Explorar' },
      book: { label: 'Marcar', title: 'Iniciar sessao', action: 'Marcar' },
      collect: { label: 'Colecionar', title: 'Comprar arte', action: 'Visitar' },
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
      guide: { label: 'دليل', title: 'شاهد الأعمال', action: 'استكشف' },
      book: { label: 'حجز', title: 'ابدأ جلسة', action: 'احجز' },
      collect: { label: 'اقتناء', title: 'تسوق الفن', action: 'زيارة' },
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
      guide: { label: '向导', title: '查看作品', action: '探索' },
      book: { label: '预约', title: '开始拍摄', action: '预约' },
      collect: { label: '收藏', title: '购买艺术', action: '访问' },
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
      guide: { label: 'Itosona', title: 'Wo ise', action: 'Sewo' },
      book: { label: 'Book', title: 'Bere igba foto', action: 'Book' },
      collect: { label: 'Akojo', title: 'Ra art', action: 'Wo' },
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
      guide: { label: 'Nduzi', title: 'Lee ọrụ', action: 'Chọpụta' },
      book: { label: 'Book', title: 'Malite foto', action: 'Book' },
      collect: { label: 'Nchịkọta', title: 'Zụta art', action: 'Gaa' },
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
      guide: { label: 'Jagora', title: 'Duba aiki', action: 'Bincika' },
      book: { label: 'Booking', title: 'Fara zama', action: 'Book' },
      collect: { label: 'Tara', title: 'Sayi art', action: 'Ziyarci' },
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
          : 'border-accent/35 bg-background text-accent'
      }`}
      aria-hidden="true"
    >
      <span
        className={`absolute left-1/2 top-2 h-[calc(100%-1rem)] w-px -translate-x-1/2 ${
          neutral && light ? 'bg-black/18' : neutral ? 'bg-white/18' : 'bg-accent/30'
        }`}
      />
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full ${compact ? 'size-1.5' : 'size-2'} ${
          neutral && light ? 'bg-black/45' : neutral ? 'bg-white/55' : 'bg-accent'
        }`}
      />
      <span
        className={`relative font-heading italic leading-none ${compact ? 'text-base' : 'text-2xl'} ${
          neutral && light ? 'text-black/70' : neutral ? 'text-white/75' : 'text-accent'
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

  return (
    <div className="fixed bottom-5 right-5 z-[120] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
            className={`relative w-[min(410px,calc(100vw-2rem))] overflow-hidden rounded-[20px] border shadow-2xl backdrop-blur-xl ${
              isLight
                ? 'border-black/10 bg-[#f6f4ef]/96 text-[#141414] shadow-black/15'
                : 'border-white/10 bg-[#161616]/96 text-white shadow-black/45'
            }`}
            aria-label="Eniyan AI chat assistant"
            style={{
              backgroundImage:
                `radial-gradient(circle at 1px 1px, rgba(146, 1, 16, ${isLight ? '0.14' : '0.18'}) 1px, transparent 0), linear-gradient(180deg, ${isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.045)'}, rgba(255,255,255,0))`,
              backgroundSize: '20px 20px, 100% 100%',
            }}
          >
            <div className={`absolute inset-0 ${isLight ? 'bg-[#f6f4ef]/88' : 'bg-[#161616]/88'}`} />
            <div className="relative">
              <header className={`overflow-hidden border-b px-5 py-4 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <EniyanSign compact />
                  <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.28em] text-accent">
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
                  const cardCopy = copy.features[card.id];
                  return (
                  <a
                    key={card.href}
                    href={card.href}
                    className={`group flex w-[150px] shrink-0 flex-col rounded-[16px] border p-3 transition ${
                      isLight
                        ? 'border-black/10 bg-white/45 hover:bg-white/75'
                        : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`mb-3 grid size-9 place-items-center rounded-[12px] border shadow-lg shadow-black/10 transition ${
                        isLight
                          ? 'border-black/10 bg-black/[0.035] text-black/62'
                          : 'border-white/12 bg-white/[0.055] text-white/72'
                      }`}
                    >
                      <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.2em] text-accent/75">
                        {cardCopy.label}
                      </span>
                      <span className={`block text-sm font-semibold leading-tight ${isLight ? 'text-black/85' : 'text-white/86'}`}>
                        {cardCopy.title}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent/85">
                        {cardCopy.action}
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </span>
                  </a>
                  );
                })}
                </div>
              </div>

            <div ref={scrollRef} className="max-h-[28svh] space-y-4 overflow-y-auto px-5 py-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <p
                    className={`max-w-[84%] whitespace-pre-wrap rounded-[2px] px-3 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-accent text-background'
                        : isLight
                          ? 'border-l border-accent/45 bg-black/[0.035] text-black/72'
                          : 'border-l border-accent/45 bg-white/[0.045] text-white/78'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
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
                    className={`rounded-full border px-3 py-2 text-left text-[10px] uppercase tracking-[0.12em] transition hover:border-accent/50 hover:text-accent ${
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
                  className={`max-h-24 min-h-11 flex-1 resize-none rounded-full border px-4 py-3 text-sm outline-none transition focus:border-accent ${
                    isLight
                      ? 'border-black/10 bg-white/55 text-black placeholder:text-black/30'
                      : 'border-white/10 bg-white/[0.035] text-white placeholder:text-white/30'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-background transition hover:bg-white hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="size-4" aria-hidden="true" />
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
