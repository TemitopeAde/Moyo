export function imageNameFromUrl(src = '') {
  if (!src) return '';

  try {
    const url = new URL(src, 'https://example.com');
    const filename = url.pathname.split('/').filter(Boolean).pop() || '';
    const withoutExtension = filename.replace(/\.[a-z0-9]+$/i, '');
    const withoutTimestamp = withoutExtension.replace(/^\d+[-_]?/, '');

    return withoutTimestamp
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

export function createImageAlt(...parts: Array<string | null | undefined>) {
  return parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' - ');
}

export function createSeoImageFilename(
  originalName: string,
  parts: Array<string | number | null | undefined>,
  index?: number
) {
  const extensionMatch = originalName.match(/\.[a-z0-9]+$/i);
  const extension = extensionMatch?.[0]?.toLowerCase() || '';
  const base = parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const fallback = (imageNameFromUrl(originalName) || 'moyo-image')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = typeof index === 'number' && index > 0 ? `-${index + 1}` : '';
  return `${base || fallback || 'moyo-image'}${suffix}${extension}`;
}
