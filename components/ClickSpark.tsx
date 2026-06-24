'use client';

import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';

type Spark = {
    x: number;
    y: number;
    angle: number;
    startTime: number;
};

type ClickSparkProps = {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
    easing?: 'linear' | 'ease-in' | 'ease-in-out' | 'ease-out' | string;
    extraScale?: number;
    children: ReactNode;
};

export default function ClickSpark({
    sparkColor = '#fff',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = 'ease-out',
    extraScale = 1,
    children,
}: ClickSparkProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sparksRef = useRef<Spark[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        let resizeTimeout: number | undefined;

        const resizeCanvas = () => {
            const { width, height } = parent.getBoundingClientRect();
            const pixelRatio = window.devicePixelRatio || 1;
            const nextWidth = Math.max(1, Math.round(width * pixelRatio));
            const nextHeight = Math.max(1, Math.round(height * pixelRatio));

            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
            }
        };

        const handleResize = () => {
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(resizeCanvas, 100);
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(parent);
        resizeCanvas();

        return () => {
            observer.disconnect();
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
        };
    }, []);

    const easeFunc = useCallback(
        (t: number) => {
            switch (easing) {
                case 'linear':
                    return t;
                case 'ease-in':
                    return t * t;
                case 'ease-in-out':
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default:
                    return t * (2 - t);
            }
        },
        [easing]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        let animationId: number;

        const draw = (timestamp: number) => {
            const pixelRatio = window.devicePixelRatio || 1;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.save();
            context.scale(pixelRatio, pixelRatio);

            sparksRef.current = sparksRef.current.filter((spark) => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) return false;

                const progress = elapsed / duration;
                const eased = easeFunc(progress);
                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);
                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                context.strokeStyle = sparkColor;
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();

                return true;
            });

            context.restore();
            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize]);

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const now = performance.now();
        const newSparks = Array.from({ length: sparkCount }, (_, index) => ({
            x,
            y,
            angle: (2 * Math.PI * index) / sparkCount,
            startTime: now,
        }));

        sparksRef.current.push(...newSparks);
    };

    return (
        <div className="relative min-h-screen w-full" onClick={handleClick}>
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[60] block select-none"
            />
            {children}
        </div>
    );
}
