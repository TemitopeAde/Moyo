'use client';

import { getCloudinaryPreviewUrl, getImagePreviewSrcSet, isVideoUrl } from '@/lib/mediaUrl';

type GalleryMediaProps = {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
    previewWidth?: number;
    previewHeight?: number;
};

export function isVideoMedia(src: string) {
    return isVideoUrl(src);
}

export default function GalleryMedia({
    src,
    alt,
    className = 'h-full w-full object-cover',
    sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw',
    previewWidth = 900,
    previewHeight,
}: GalleryMediaProps) {
    if (isVideoMedia(src)) {
        return (
            <div className="relative h-full w-full bg-black">
                <video
                    src={src}
                    className={className}
                    preload="none"
                    muted
                    playsInline
                    aria-label={alt}
                />
                <span className="image-overlay-chip absolute bottom-2 left-2 border px-2 py-1 text-[8px] uppercase tracking-[0.18em]">
                    Video
                </span>
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={getCloudinaryPreviewUrl(src, { width: previewWidth, height: previewHeight })}
            srcSet={getImagePreviewSrcSet(src, [
                Math.max(240, Math.round(previewWidth / 2)),
                previewWidth,
                Math.round(previewWidth * 1.5),
            ])}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            sizes={sizes}
            draggable={false}
        />
    );
}
