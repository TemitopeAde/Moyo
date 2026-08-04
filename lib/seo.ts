import type { Metadata } from 'next';

export const siteUrl = 'https://ijabikenmoyo.com';
export const siteName = 'Ijabiken Moyo';
export const defaultDescription =
  'Visual storytelling across photography and fine art. Two practices. One vision.';
export const defaultOgImage = '/homepage-desktop.jpg';

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = path || '/';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName,
      images: [
        {
          url: defaultOgImage,
          width: 2560,
          height: 1707,
          alt: siteName,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [defaultOgImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
  };
}
