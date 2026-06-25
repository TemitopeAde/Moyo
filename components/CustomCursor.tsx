'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const interactiveSelector = [
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'label',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])',
    '[data-cursor]',
].join(',');

const textSelector = [
    'input',
    'textarea',
    'select',
    '[contenteditable="true"]',
].join(',');

export default function CustomCursor() {
    const pathname = usePathname();
    const isDisabled = pathname.startsWith('/admin') || pathname.startsWith('/photography/client-gallery');
    const cursorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isDisabled) {
            document.documentElement.classList.remove('custom-cursor-enabled');
            return;
        }

        const cursor = cursorRef.current;
        if (!cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        let frame = 0;
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;

        document.documentElement.classList.add('custom-cursor-enabled');

        const setCursorState = (target: EventTarget | null) => {
            const element = target instanceof Element ? target : null;
            const isInteractive = Boolean(element?.closest(interactiveSelector));
            const isText = Boolean(element?.closest(textSelector));

            cursor.classList.toggle('is-interactive', isInteractive);
            cursor.classList.toggle('is-text', isText);
        };

        const move = (event: PointerEvent) => {
            targetX = event.clientX;
            targetY = event.clientY;
            cursor.classList.add('is-visible');
            setCursorState(event.target);
        };

        const hide = () => {
            cursor.classList.remove('is-visible');
        };

        const handlePointerOver = (event: PointerEvent) => {
            setCursorState(event.target);
        };

        const animate = () => {
            currentX += (targetX - currentX) * 0.22;
            currentY += (targetY - currentY) * 0.22;
            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            frame = window.requestAnimationFrame(animate);
        };

        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerover', handlePointerOver, { passive: true });
        window.addEventListener('pointerleave', hide);
        window.addEventListener('blur', hide);
        frame = window.requestAnimationFrame(animate);

        return () => {
            document.documentElement.classList.remove('custom-cursor-enabled');
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerover', handlePointerOver);
            window.removeEventListener('pointerleave', hide);
            window.removeEventListener('blur', hide);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, [isDisabled]);

    if (isDisabled) return null;

    return (
        <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
            <svg
                className="custom-cursor__icon"
                width="34"
                height="34"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    className="custom-cursor__click-mark custom-cursor__click-mark--one"
                    d="M39 6V15"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    className="custom-cursor__click-mark custom-cursor__click-mark--two"
                    d="M52 16L45.5 22.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    className="custom-cursor__click-mark custom-cursor__click-mark--three"
                    d="M56 32H47"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    className="custom-cursor__hand-fill"
                    d="M20.4 53.1L12.7 34.9C11.8 32.8 12.7 30.4 14.8 29.5C16.7 28.7 18.8 29.4 20 31L23.3 35.7V13.6C23.3 11.1 25.3 9.1 27.8 9.1C30.3 9.1 32.3 11.1 32.3 13.6V27.7C33 26.4 34.4 25.5 36 25.5C38.1 25.5 39.8 27 40.1 29C40.8 27.8 42.1 27 43.6 27C45.9 27 47.7 28.8 47.7 31.1V33.2C48.4 32.5 49.4 32.1 50.5 32.1C52.8 32.1 54.6 33.9 54.6 36.2V44.4C54.6 53.3 47.4 60.5 38.5 60.5H33.1C27.6 60.5 22.6 57.6 20.4 53.1Z"
                    fill="currentColor"
                />
                <path
                    className="custom-cursor__hand-stroke"
                    d="M23.3 35.7V13.6C23.3 11.1 25.3 9.1 27.8 9.1C30.3 9.1 32.3 11.1 32.3 13.6V35.4M32.3 28.4C32.6 26.8 34.1 25.5 36 25.5C38.3 25.5 40.1 27.3 40.1 29.6V36.2M40.1 30.8C40.3 28.7 41.8 27 43.6 27C45.9 27 47.7 28.8 47.7 31.1V37.5M47.7 34.8C48.4 33.2 49.5 32.1 50.5 32.1C52.8 32.1 54.6 33.9 54.6 36.2V44.4C54.6 53.3 47.4 60.5 38.5 60.5H33.1C27.6 60.5 22.6 57.6 20.4 53.1L12.7 34.9C11.8 32.8 12.7 30.4 14.8 29.5C16.7 28.7 18.8 29.4 20 31L23.3 35.7Z"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
