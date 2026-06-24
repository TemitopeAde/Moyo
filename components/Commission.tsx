'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function Commission() {
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);
    const steps = [
        { title: t('commissionsPage.step1Title'), description: t('commissionsPage.step1Description') },
        { title: t('commissionsPage.step2Title'), description: t('commissionsPage.step2Description') },
        { title: t('commissionsPage.step3Title'), description: t('commissionsPage.step3Description') },
        { title: t('commissionsPage.step4Title'), description: t('commissionsPage.step4Description') },
    ];

    return (
        <section id="commission" className="py-24 bg-neutral-900 text-white">
            <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <span className="text-accent text-xs tracking-widest uppercase block mb-8">{t('commissionsPage.bespoke')}</span>
                    <h2 className="text-4xl md:text-5xl font-heading mb-16">{t('commissionsPage.processTitle')}</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <p className="text-neutral-400 font-body leading-relaxed mb-8">
                                {translateText('For collectors and brands seeking unique visual narratives, Moyo offers commissioned art pieces tailored to specific spaces and stories.')}
                            </p>
                            <button className="px-8 py-3 border border-white/20 hover:bg-accent hover:text-black hover:border-accent transition-all duration-300 text-xs uppercase tracking-widest">
                                {t('artExhibitionsPage.exploreArchive')}
                            </button>
                        </div>

                        <div className="space-y-8">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <span className="text-accent font-heading text-lg">0{idx + 1}</span>
                                    <div>
                                        <h3 className="text-xl font-heading mb-1">{step.title}</h3>
                                        <p className="text-sm text-neutral-500 font-body">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
