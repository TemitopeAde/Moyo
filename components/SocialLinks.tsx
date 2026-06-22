'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { socialLinks } from '@/lib/socialLinks';

export default function SocialLinks() {
    return (
        <div className="fixed inset-x-0 bottom-5 z-[100] flex justify-center px-5 mix-blend-difference md:inset-x-auto md:bottom-12 md:right-12 md:px-0">
            <div className="flex items-center gap-6 rounded-full px-5 py-3 md:flex-col md:gap-6 md:px-4 md:py-5">
                {socialLinks.map((link) => (
                    <motion.a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 0.45, y: 0 }}
                        whileHover={{ opacity: 1, scale: 1.1 }}
                        className="text-sm text-white transition-colors hover:text-accent md:text-base"
                        aria-label={link.name}
                    >
                        {link.icon}
                    </motion.a>
                ))}
                <div className="hidden h-24 w-px bg-white/20 md:block" />
            </div>
        </div>
    );
}
