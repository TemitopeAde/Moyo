import { socialLinks } from '@/lib/socialLinks';
import { defaultDescription, siteName, siteUrl } from '@/lib/seo';

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

type JsonLdObject = { [key: string]: JsonLdValue | undefined };

type ArtworkSchemaInput = {
  id: string | number;
  title: string;
  image?: string;
  description?: string;
  url?: string;
  medium?: string;
  dimensions?: string;
  dateCreated?: string;
  artform?: string;
  category?: string;
};

type CreativeWorkPageInput = {
  id: string;
  name: string;
  description: string;
  url: string;
  about?: JsonLdObject | JsonLdObject[];
  hasPart?: JsonLdObject[];
};

export function absoluteUrl(value = '') {
  if (!value) return siteUrl;

  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

function canonicalExternalUrl(value: string) {
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return value;
  }
}

export const personId = `${siteUrl}/#person`;
export const websiteId = `${siteUrl}/#website`;

export const sameAsProfiles = socialLinks.map((link) => canonicalExternalUrl(link.href));

export const personSchema: JsonLdObject = {
  '@type': 'Person',
  '@id': personId,
  name: 'Moyo Ayaworan',
  alternateName: 'Ijabiken Moyosoreoluwa',
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'Legal name',
    value: 'Ijabiken Moyosoreoluwa',
  },
  jobTitle: ['Photographer', 'Visual Artist', 'Creative Director'],
  hasOccupation: [
    { '@type': 'Occupation', name: 'Photographer' },
    { '@type': 'Occupation', name: 'Visual Artist' },
    { '@type': 'Occupation', name: 'Creative Director' },
  ],
  url: siteUrl,
  sameAs: sameAsProfiles,
  mainEntityOfPage: websiteId,
};

export const websiteSchema: JsonLdObject = {
  '@type': 'WebSite',
  '@id': websiteId,
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  publisher: { '@id': personId },
  author: { '@id': personId },
  inLanguage: 'en',
};

export function createRootJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema, websiteSchema],
  };
}

export function createVisualArtworkSchema(input: ArtworkSchemaInput): JsonLdObject {
  const url = absoluteUrl(input.url || '');
  const image = input.image ? absoluteUrl(input.image) : undefined;

  return {
    '@type': 'VisualArtwork',
    '@id': `${url}#artwork-${input.id}`,
    name: input.title,
    url,
    image,
    description: input.description || input.category,
    creator: { '@id': personId },
    artist: { '@id': personId },
    artform: input.artform,
    artMedium: input.medium,
    size: input.dimensions,
    dateCreated: input.dateCreated,
    genre: input.category,
    isPartOf: url,
  };
}

export function createCreativeWorkPageSchema(input: CreativeWorkPageInput) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personSchema,
      {
        '@type': ['WebPage', 'CollectionPage', 'CreativeWork'],
        '@id': `${absoluteUrl(input.url)}#webpage`,
        name: input.name,
        description: input.description,
        url: absoluteUrl(input.url),
        isPartOf: { '@id': websiteId },
        author: { '@id': personId },
        creator: { '@id': personId },
        publisher: { '@id': personId },
        about: input.about,
        hasPart: input.hasPart,
        mainEntity: input.hasPart?.length
          ? {
              '@type': 'ItemList',
              itemListElement: input.hasPart.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: { '@id': item['@id'] },
              })),
            }
          : undefined,
        inLanguage: 'en',
      },
      ...(input.hasPart || []),
    ],
  };
}

export function JsonLd({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
