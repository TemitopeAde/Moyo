'use client';

import { useEffect, useRef } from 'react';

export default function SessionTracker() {
    const hasNotified = useRef(false);

    useEffect(() => {
        const notifySession = async () => {
            // Simple check to prevent duplicate notifications in the same session (SPA navigation)
            // Ideally use cookies/localStorage for stricter once-per-visit
            const sessionKey = 'session_notified_' + new Date().toDateString();
            if (sessionStorage.getItem(sessionKey)) return;

            if (hasNotified.current) return;
            hasNotified.current = true;

            try {
                await fetch('/api/notify-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAgent: navigator.userAgent,
                        timestamp: Date.now(),
                        path: window.location.pathname
                    })
                });
                sessionStorage.setItem(sessionKey, 'true');
            } catch (err) {
                console.error('Session tracking failed', err);
            }
        };

        notifySession();
    }, []);

    return null;
}
