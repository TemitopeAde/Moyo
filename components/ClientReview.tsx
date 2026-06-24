'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const reviews = [
    {
        name: 'Adaora N.',
        session: 'Portrait Session',
        quote: 'The images felt cinematic without losing who I am. Every frame carried presence, patience, and a kind of quiet honesty.',
    },
    {
        name: 'Tomiwa A.',
        session: 'Editorial Shoot',
        quote: 'Moyo understood the feeling before the first frame. The final edits looked refined, intimate, and completely intentional.',
    },
    {
        name: 'Kemi O.',
        session: 'Brand Portraits',
        quote: 'He made the whole session feel calm and exact. I left with photographs that finally matched how I wanted my work to be seen.',
    },
];

export default function ClientReview() {
    const [activeReview, setActiveReview] = useState(0);
    const review = reviews[activeReview];

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveReview((current) => (current + 1) % reviews.length);
        }, 5200);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <section className="relative z-10 bg-background px-6 pb-24 md:px-12 md:pb-32">
            <motion.aside
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="glass relative mx-auto -mt-12 max-w-5xl overflow-hidden rounded-sm px-6 py-8 shadow-2xl shadow-black/20 sm:px-8 md:-mt-20 md:px-12 md:py-10 lg:px-14"
            >
                <div className="absolute right-6 top-6 text-accent/15 md:right-10 md:top-8">
                    <Quote aria-hidden="true" className="h-16 w-16 md:h-24 md:w-24" strokeWidth={1} />
                </div>

                <div className="relative grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end md:gap-12">
                    <div className="space-y-5 border-b border-foreground/10 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-10">
                        <div className="flex gap-1.5 text-accent" aria-label="Five star review">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star key={index} className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
                            ))}
                        </div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-foreground/30 md:tracking-[0.45em]">
                            Client Review
                        </p>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={review.name}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <p className="font-heading text-2xl italic leading-tight text-foreground sm:text-3xl">
                                    {review.name}
                                </p>
                                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-foreground/35">
                                    {review.session}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center gap-2 pt-2" aria-label="Review carousel position">
                            {reviews.map((item, index) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setActiveReview(index)}
                                    aria-label={`Show review from ${item.name}`}
                                    aria-current={index === activeReview}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${index === activeReview
                                        ? 'w-8 bg-accent'
                                        : 'w-1.5 bg-foreground/20 hover:bg-foreground/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.blockquote
                            key={review.quote}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-2xl font-heading text-2xl font-light leading-snug text-foreground sm:text-3xl md:text-4xl"
                        >
                            &quot;{review.quote}&quot;
                        </motion.blockquote>
                    </AnimatePresence>
                </div>
            </motion.aside>
        </section>
    );
}
