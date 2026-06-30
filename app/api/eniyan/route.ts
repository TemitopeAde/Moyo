import { NextResponse } from 'next/server';
import { ENIYAN_GUIDED_LINKS, ENIYAN_KNOWLEDGE } from '@/lib/eniyanKnowledge';

export const runtime = 'nodejs';

type IncomingMessage = {
  role?: unknown;
  content?: unknown;
};

type PageContext = {
  title?: unknown;
  path?: unknown;
  visibleText?: unknown;
  language?: unknown;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SITE_MAP = [
  'Home and profile switcher: /',
  'Fine art overview: /art',
  'Fine art works: /art/works',
  'Art shop: /art/shop',
  'Art commissions: /art/commissions',
  'Art exhibitions: /art/exhibitions',
  'Art about page: /art/about',
  'Art newsletter: /art/newsletter',
  'Photography overview: /photography',
  'Photography portfolio: /photography/portfolio',
  'Photography bookings: /photography/bookings',
  'Client gallery access: /photography/client-gallery',
  'Photography about page: /photography/about',
  'Photography newsletter: /photography/newsletter',
].join('\n');

const LANGUAGE_NAMES: Record<string, string> = {
  EN: 'English',
  FR: 'French',
  ES: 'Spanish',
  DE: 'German',
  PT: 'Portuguese',
  AR: 'Arabic',
  ZH: 'Chinese',
  YO: 'Yoruba',
  IG: 'Igbo',
  HA: 'Hausa',
};

function cleanText(value: unknown, maxLength = 1200) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';
}

function normalizeMessages(messages: unknown) {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((message: IncomingMessage) => {
      const role = message.role === 'user' ? 'user' : 'model';
      const text = cleanText(message.content, 1600);

      if (!text) return null;
      return {
        role,
        parts: [{ text }],
      };
    })
    .filter(Boolean)
    .slice(-10);
}

function pagePrompt(page: PageContext | undefined) {
  const title = cleanText(page?.title, 160);
  const path = cleanText(page?.path, 160);
  const visibleText = cleanText(page?.visibleText, 900);
  const languageCode = cleanText(page?.language, 10).toUpperCase();
  const language = LANGUAGE_NAMES[languageCode] || 'English';

  return [
    'Current visitor context:',
    `Title: ${title || 'Unknown'}`,
    `Path: ${path || 'Unknown'}`,
    `Selected site language: ${language}`,
    visibleText ? `Visible page text: ${visibleText}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildFallbackReply(messages: unknown) {
  const normalized = normalizeMessages(messages);
  const latest = normalized.at(-1)?.parts?.[0]?.text?.toLowerCase() || '';

  if (latest.includes('book') || latest.includes('shoot') || latest.includes('session') || latest.includes('photo')) {
    return `I can help with that. For photography bookings, go to ${ENIYAN_GUIDED_LINKS.bookings}. You can choose the kind of session and send an inquiry from there.`;
  }

  if (latest.includes('portfolio') || latest.includes('work') || latest.includes('recent')) {
    return `To browse photography work, visit ${ENIYAN_GUIDED_LINKS.photographyPortfolio}. For fine art pieces, visit ${ENIYAN_GUIDED_LINKS.artWorks}. I can also point you to commissions at ${ENIYAN_GUIDED_LINKS.artCommissions}.`;
  }

  if (latest.includes('shop') || latest.includes('buy') || latest.includes('print') || latest.includes('art')) {
    return `For available artwork and products, start at ${ENIYAN_GUIDED_LINKS.artShop}. If you want something custom, ${ENIYAN_GUIDED_LINKS.artCommissions} is the better next step.`;
  }

  if (latest.includes('gallery') || latest.includes('client')) {
    return `Client galleries live at ${ENIYAN_GUIDED_LINKS.clientGallery}. You will need the access details connected to your gallery.`;
  }

  if (latest.includes('newsletter') || latest.includes('updates')) {
    return `For updates, join the photography newsletter at ${ENIYAN_GUIDED_LINKS.photographyNewsletter} or the art newsletter at ${ENIYAN_GUIDED_LINKS.artNewsletter}.`;
  }

  return `I can help you move around the site. Try ${ENIYAN_GUIDED_LINKS.photographyPortfolio} for image work, ${ENIYAN_GUIDED_LINKS.bookings} to book a shoot, ${ENIYAN_GUIDED_LINKS.artShop} to buy art, or ${ENIYAN_GUIDED_LINKS.artCommissions} for custom work.`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = (await req.json()) as { messages?: unknown; page?: PageContext };
    const contents = normalizeMessages(body.messages);

    if (!contents.length) {
      return NextResponse.json({ error: 'Send a message for Eniyan to answer.' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ reply: buildFallbackReply(body.messages), mode: 'guided' });
    }

    const systemInstruction = [
      "You are Eniyan, a warm, concise AI assistant for Ijabiken Moyo's photography and fine art website.",
      'Eniyan means person/human in Yoruba; keep the tone human, helpful, and elegant.',
      'Help visitors navigate the site, choose services, book photography sessions, find portfolios, shop art, commission artwork, join newsletters, and understand next steps.',
      'When useful, mention exact internal paths from the site map. Do not invent pages.',
      'You cannot complete payments or access private galleries for the user, but you can guide them to the right page.',
      'Language rule: reply in the same language the visitor uses in their latest message. If the latest message is too short or unclear, reply in the selected site language from the visitor context.',
      'If the visitor switches language mid-chat, switch with them.',
      'Keep replies under 90 words unless the visitor asks for detail.',
      '',
      'Knowledge base:',
      ENIYAN_KNOWLEDGE,
      '',
      'Site map:',
      SITE_MAP,
      '',
      pagePrompt(body.page),
    ].join('\n');

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          maxOutputTokens: 260,
        },
      }),
    });

    const data = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      console.error('[eniyan] Gemini error', data.error?.message || data);
      return NextResponse.json({ reply: buildFallbackReply(body.messages), mode: 'guided' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();

    if (!reply) {
      return NextResponse.json({ error: 'Eniyan did not receive a usable Gemini response.' }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[eniyan] Unexpected error', error);
    return NextResponse.json({ error: 'Eniyan is unavailable right now.' }, { status: 500 });
  }
}
