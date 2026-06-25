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
                <div className="mb-16 flex flex-col items-center justify-between gap-14 text-center md:mb-24 md:flex-row md:items-start md:gap-16 md:text-left">
                    <div className="flex w-full max-w-[240px] flex-col items-center gap-5 md:w-[260px] md:items-start md:gap-6">
                        <Link href="/" className="-mb-3 -mt-4 inline-flex h-16 w-16 items-center justify-center overflow-visible md:-mb-4 md:-mt-5 md:h-[76px] md:w-[76px]">
                            <Image
                                src="/brand/moyo-logo.png"
                                alt="Ijabiken Moyo"
                                width={160}
                                height={160}
                                className="theme-logo h-full w-full object-contain transition-opacity duration-300 hover:opacity-80"
                            />
                        </Link>
                        <p className="max-w-[220px] text-xs uppercase leading-relaxed tracking-widest text-foreground/30 whitespace-pre-line">
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
                                ijabikenm@gmail.com <br />
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
