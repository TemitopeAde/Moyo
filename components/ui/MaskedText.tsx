'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MaskedLineProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
}

export function MaskedLine({ children, delay = 0, duration = 0.7 }: MaskedLineProps) {
    return (
        <div className="overflow-hidden">
            <motion.div
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                    duration,
                    delay,
                    ease: [0.22, 1, 0.36, 1], // Moreli exact easing
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

export function MaskedText({
    lines,
    delayStart = 0.35,
    stagger = 0.09,
    duration = 0.7,
    className = ""
}: {
    lines: string[];
    delayStart?: number;
    stagger?: number;
    duration?: number;
    className?: string;
}) {
    return (
        <span className={className}>
            {lines.map((line, i) => (
                <MaskedLine
                    key={i}
                    delay={delayStart + i * stagger}
                    duration={duration}
                >
                    <span className="block">{line}</span>
                </MaskedLine>
            ))}
        </span>
    );
}
