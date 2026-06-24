'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

const subscribe = () => () => undefined;
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const mounted = useSyncExternalStore(subscribe, getMountedSnapshot, getServerSnapshot);

    if (!mounted) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
                "group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors duration-300 hover:border-foreground/10 hover:bg-white/10",
                className
            )}
            aria-label={t('ui.toggleTheme')}
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground/60 transition-colors group-hover:text-accent" />
            ) : (
                <Moon className="h-5 w-5 text-foreground/60 transition-colors group-hover:text-accent" />
            )}
        </button>
    );
}
