'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type ProfileType = 'photography' | 'art' | null;

interface ProfileContextType {
    profile: ProfileType;
    setProfile: (profile: ProfileType) => void;
    toggleProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfileState] = useState<ProfileType>(null);
    const pathname = usePathname();

    // Set profile based on URL on initial load and navigation
    useEffect(() => {
        if (pathname.startsWith('/photography')) {
            setProfileState('photography');
        } else if (pathname.startsWith('/art')) {
            setProfileState('art');
        } else if (pathname === '/') {
            // Stay as null for the global entry page
            setProfileState(null);
        }
    }, [pathname]);

    const setProfile = (newProfile: ProfileType) => {
        setProfileState(newProfile);
    };

    const toggleProfile = () => {
        setProfileState((prev) => (prev === 'photography' ? 'art' : 'photography'));
    };

    return (
        <ProfileContext.Provider value={{ profile, setProfile, toggleProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
