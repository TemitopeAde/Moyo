'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

const subscribe = () => () => undefined;
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(subscribe, getMountedSnapshot, getServerSnapshot);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="group inline-flex h-12 w-12 items-center justify-center rounded-md border border-transparent transition-colors duration-300 hover:border-foreground/10 hover:bg-white/10"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-white/60 group-hover:text-accent transition-colors" />
            ) : (
                <Moon className="w-5 h-5 text-black/60 group-hover:text-accent transition-colors" />
            )}
        </button>
    );
}
