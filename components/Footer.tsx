'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

import { FaInstagram, FaBehance, FaVimeoV } from 'react-icons/fa';

export default function Footer() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    return (
        <footer className="py-24 bg-background border-t border-white/5 font-body">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-heading text-white tracking-tight">MOYO<span className="text-gold">.</span></h3>
                        <p className="text-white/30 text-xs tracking-widest uppercase max-w-[200px] leading-relaxed whitespace-pre-line">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 block font-medium">{t('common.studio')}</span>
                            <ul className="space-y-4 text-[10px] tracking-widest uppercase text-white/60">
                                <li><Link href="/" className="hover:text-gold transition-colors">{t('common.about')}</Link></li>
                                <li><Link href="/photography" className="hover:text-gold transition-colors">{t('common.photography')}</Link></li>
                                <li><Link href="/art" className="hover:text-gold transition-colors">{t('common.fineArt')}</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 block font-medium">{t('common.follow')}</span>
                            <div className="flex gap-4">
                                <a href="#" className="text-white/60 hover:text-gold transition-colors"><FaInstagram size={18} /></a>
                                <a href="#" className="text-white/60 hover:text-gold transition-colors"><FaBehance size={18} /></a>
                                <a href="#" className="text-white/60 hover:text-gold transition-colors"><FaVimeoV size={18} /></a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 block font-medium">{t('common.contact')}</span>
                            <p className="text-[10px] tracking-widest uppercase text-white/60 leading-relaxed">
                                studio@ijabikenmoyo.com <br />
                                +31 (0) 20 123 4567
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-white/20">
                        © 2026 IJABIKEN MOYO. {t('footer.rights')}
                    </p>
                    <div className="flex gap-8 text-[9px] tracking-[0.4em] uppercase text-white/20">
                        <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
