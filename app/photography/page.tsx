'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import PhotographyGrid from '@/components/PhotographyGrid';
import NewsletterForm from '@/components/NewsletterForm';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import DigitalProducts from '@/components/DigitalProducts';
import { useProfile } from '@/context/ProfileContext';

export default function PhotographyPage() {
    const { setProfile } = useProfile();

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <Hero profileType="photography" />

            <PhotographyGrid />

            <AboutSection profileType="photography" />

            <DigitalProducts />

            <BookingForm />

            <section className="py-40 bg-background flex flex-col items-center border-t border-white/5">
                <NewsletterForm profileType="photography" />
            </section>

            <Footer />
        </main>
    );
}
