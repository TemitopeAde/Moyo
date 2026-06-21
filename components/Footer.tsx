'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import { socialLinks } from '@/lib/socialLinks';

export default function Footer() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    return (
        <footer className="border-t border-foreground/5 bg-background py-16 font-body md:py-24">
            <div className="container mx-auto px-6 md:px-12">
                <div className="mb-16 flex flex-col items-start justify-between gap-12 md:mb-24 md:flex-row md:gap-16">
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/brand/moyo-logo.png"
                                alt="Ijabiken Moyo"
                                width={160}
                                height={160}
                                className="theme-logo h-14 w-14 object-contain transition-opacity duration-300 hover:opacity-80 md:h-[70px] md:w-[70px]"
                            />
                        </Link>
                        <p className="text-foreground/30 text-xs tracking-widest uppercase max-w-[200px] leading-relaxed whitespace-pre-line">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 md:w-auto md:grid-cols-3 md:gap-16 lg:gap-24">
                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/20 block font-medium">{t('common.studio')}</span>
                            <ul className="space-y-4 text-[10px] tracking-widest uppercase text-foreground/60">
                                <li><Link href="/" className="hover:text-accent transition-colors">{t('common.about')}</Link></li>
                                <li><Link href="/photography" className="hover:text-accent transition-colors">{t('common.photography')}</Link></li>
                                <li><Link href="/art" className="hover:text-accent transition-colors">{t('common.fineArt')}</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/20 block font-medium">{t('common.follow')}</span>
                            <div className="flex gap-4">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.name}
                                        className="text-foreground/60 hover:text-accent transition-colors"
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/20 block font-medium">{t('common.contact')}</span>
                            <p className="text-[10px] tracking-widest uppercase text-foreground/60 leading-relaxed">
                                ijabkenm@gmail.com <br />
                                +2348148192201
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-6 border-t border-foreground/5 pt-10 md:flex-row md:gap-8 md:pt-12">
                    <p className="text-center text-[9px] uppercase tracking-[0.24em] text-foreground/20 md:text-left md:tracking-[0.4em]">
                        © 2026 IJABIKEN MOYO. {t('footer.rights')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-[9px] uppercase tracking-[0.24em] text-foreground/20 md:gap-8 md:tracking-[0.4em]">
                        <a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
