'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { socialLinks } from '@/lib/socialLinks';

export default function SocialLinks() {
    return (
        <div className="fixed bottom-12 right-12 z-[100] flex flex-col items-center gap-8 mix-blend-difference hidden md:flex">
            <div className="flex flex-col gap-6">
                {socialLinks.map((link) => (
                    <motion.a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 0.4, x: 0 }}
                        whileHover={{ opacity: 1, scale: 1.1 }}
                        className="text-white hover:text-accent transition-colors"
                        aria-label={link.name}
                    >
                        {link.icon}
                    </motion.a>
                ))}
            </div>
            <div className="h-24 w-[1px] bg-white/20" />
        </div>
    );
}
