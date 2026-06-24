'use client';

type GalleryMediaProps = {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
};

const videoPattern = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function isVideoMedia(src: string) {
    return videoPattern.test(src);
}

export default function GalleryMedia({
    src,
    alt,
    className = 'h-full w-full object-cover',
    sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw',
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
                <span className="absolute bottom-2 left-2 border border-white/15 bg-black/60 px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-white/65">
                    Video
                </span>
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            sizes={sizes}
            draggable={false}
        />
    );
}
