'use client';

import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type ProfileType = 'photography' | 'art' | null;

interface ProfileContextType {
    profile: ProfileType;
    setProfile: (profile: ProfileType) => void;
    toggleProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function getProfileFromPath(pathname: string): ProfileType {
    if (pathname.startsWith('/photography')) return 'photography';
    if (pathname.startsWith('/art')) return 'art';
    return null;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profileOverride, setProfileOverride] = useState<ProfileType>(null);
    const pathname = usePathname();
    const routeProfile = useMemo(() => getProfileFromPath(pathname), [pathname]);
    const profile = routeProfile ?? profileOverride;

    const setProfile = (newProfile: ProfileType) => {
        setProfileOverride(newProfile);
    };

    const toggleProfile = () => {
        setProfileOverride(profile === 'photography' ? 'art' : 'photography');
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
