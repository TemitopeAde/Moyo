'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300 group"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-white/60 group-hover:text-gold transition-colors" />
            ) : (
                <Moon className="w-5 h-5 text-black/60 group-hover:text-gold transition-colors" />
            )}
        </button>
    );
}
