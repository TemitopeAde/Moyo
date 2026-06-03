'use client';

import { useEffect, useRef } from 'react';

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
    const cursorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
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
    }, []);

    return (
        <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
            <span className="custom-cursor__halo" />
            <span className="custom-cursor__stroke" />
            <span className="custom-cursor__dot" />
        </div>
    );
}
