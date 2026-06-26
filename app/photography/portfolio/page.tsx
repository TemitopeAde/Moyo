'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PhotographyGrid from '@/components/PhotographyGrid';
import Footer from '@/components/Footer';
import { useProfile } from '@/context/ProfileContext';

export default function PhotographyPortfolioPage() {
    const { setProfile } = useProfile();

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-16 sm:pt-20 md:pt-24">
                <PhotographyGrid />
            </div>
            <Footer />
        </main>
    );
}
