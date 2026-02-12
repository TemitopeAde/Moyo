'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';

export default function PhotographyNewsletterPage() {
    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
                <NewsletterForm profileType="photography" />
            </div>
            <Footer />
        </main>
    );
}
