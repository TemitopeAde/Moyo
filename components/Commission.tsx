'use client';

export default function Commission() {
    const steps = [
        { title: 'The Vision', description: 'Initial consultation to align on concept, mood, and scale.' },
        { title: 'The Proposal', description: 'Detailed brief including timeline, budget, and creative direction.' },
        { title: 'The Creation', description: 'Regular updates throughout the artistic process.' },
        { title: 'The Delivery', description: 'Final artwork installation or digital handover.' },
    ];

    return (
        <section id="commission" className="py-24 bg-neutral-900 text-white">
            <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <span className="text-accent text-xs tracking-widest uppercase block mb-8">Bespoke Art</span>
                    <h2 className="text-4xl md:text-5xl font-heading mb-16">Commission Process</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <p className="text-neutral-400 font-body leading-relaxed mb-8">
                                For collectors and brands seeking unique visual narratives, Moyo offers commissioned art pieces tailored to specific spaces and stories.
                            </p>
                            <button className="px-8 py-3 border border-white/20 hover:bg-accent hover:text-black hover:border-accent transition-all duration-300 text-xs uppercase tracking-widest">
                                Request Catalog
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
