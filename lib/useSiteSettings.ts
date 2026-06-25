'use client';

import { useEffect, useState } from 'react';
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from '@/lib/siteSettings';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => setSettings(mergeSiteSettings(data.content?.settings)))
      .catch(() => null);
  }, []);

  return settings;
}
