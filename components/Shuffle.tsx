'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

type ShuffleProps = {
    text: string;
    className?: string;
    style?: CSSProperties;
    tag?: keyof Pick<React.JSX.IntrinsicElements, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'>;
    duration?: number;
    stagger?: number;
    scrambleCharset?: string;
    triggerOnce?: boolean;
    triggerOnHover?: boolean;
    respectReducedMotion?: boolean;
    textAlign?: CSSProperties['textAlign'];
    onShuffleComplete?: () => void;
};

const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function Shuffle({
    text,
    className = '',
    style,
    tag = 'p',
    duration = 0.55,
    stagger = 0.035,
    scrambleCharset = defaultCharset,
    triggerOnce = true,
    triggerOnHover = true,
    respectReducedMotion = true,
    textAlign = 'center',
    onShuffleComplete,
}: ShuffleProps) {
    const ref = useRef<HTMLElement | null>(null);
    const frameRef = useRef<number | null>(null);
    const hasPlayedRef = useRef(false);
    const [displayText, setDisplayText] = useState(text);

    const characters = useMemo(() => Array.from(displayText), [displayText]);
    const finalCharacters = useMemo(() => Array.from(text), [text]);

    const shouldReduceMotion = useCallback(() => {
        return (
            respectReducedMotion &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
    }, [respectReducedMotion]);

    const stopAnimation = useCallback(() => {
        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
    }, []);

    const runShuffle = useCallback(() => {
        stopAnimation();

        if (shouldReduceMotion()) {
            setDisplayText(text);
            onShuffleComplete?.();
            return;
        }

        const startedAt = performance.now();
        const durationMs = Math.max(80, duration * 1000);
        const staggerMs = Math.max(0, stagger * 1000);
        const totalMs = durationMs + staggerMs * finalCharacters.length;

        const tick = (now: number) => {
            const elapsed = now - startedAt;
            const next = finalCharacters.map((finalChar, index) => {
                if (finalChar.trim() === '') return finalChar;

                const localElapsed = elapsed - index * staggerMs;
                if (localElapsed >= durationMs) return finalChar;
                if (localElapsed < 0) return scrambleCharset[index % scrambleCharset.length] || finalChar;

                const progress = localElapsed / durationMs;
                if (progress > 0.72) return finalChar;

                const charIndex = Math.floor((now / 42 + index * 7) % scrambleCharset.length);
                return scrambleCharset[charIndex] || finalChar;
            });

            setDisplayText(next.join(''));

            if (elapsed < totalMs) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                frameRef.current = null;
                setDisplayText(text);
                onShuffleComplete?.();
            }
        };

        frameRef.current = requestAnimationFrame(tick);
    }, [duration, finalCharacters, onShuffleComplete, scrambleCharset, shouldReduceMotion, stagger, stopAnimation, text]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;
                if (triggerOnce && hasPlayedRef.current) return;
                hasPlayedRef.current = true;
                runShuffle();
            },
            { threshold: 0.35 }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
            stopAnimation();
        };
    }, [runShuffle, stopAnimation, triggerOnce]);

    const handleMouseEnter = () => {
        if (!triggerOnHover || !hasPlayedRef.current) return;
        runShuffle();
    };

    const content = (
        <span aria-hidden="true" className="inline-flex max-w-full flex-wrap justify-center">
            {characters.map((character, index) => (
                <span
                    key={`${character}-${index}`}
                    className="inline-block min-w-[0.56em] text-center leading-none"
                >
                    {character === ' ' ? '\u00A0' : character}
                </span>
            ))}
        </span>
    );

    const sharedProps = {
        className,
        style: { textAlign, ...style },
        onMouseEnter: handleMouseEnter,
        'aria-label': text,
    };

    if (tag === 'h1') return <h1 ref={ref as React.RefObject<HTMLHeadingElement | null>} {...sharedProps}>{content}</h1>;
    if (tag === 'h2') return <h2 ref={ref as React.RefObject<HTMLHeadingElement | null>} {...sharedProps}>{content}</h2>;
    if (tag === 'h3') return <h3 ref={ref as React.RefObject<HTMLHeadingElement | null>} {...sharedProps}>{content}</h3>;
    if (tag === 'h4') return <h4 ref={ref as React.RefObject<HTMLHeadingElement | null>} {...sharedProps}>{content}</h4>;
    if (tag === 'h5') return <h5 ref={ref as React.RefObject<HTMLHeadingElement | null>} {...sharedProps}>{content}</h5>;
    if (tag === 'h6') return <h6 ref={ref as React.RefObject<HTMLHeadingElement | null>} {...sharedProps}>{content}</h6>;
    if (tag === 'span') return <span ref={ref as React.RefObject<HTMLSpanElement | null>} {...sharedProps}>{content}</span>;

    return <p ref={ref as React.RefObject<HTMLParagraphElement | null>} {...sharedProps}>{content}</p>;
}
