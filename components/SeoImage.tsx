import Image, { type ImageProps } from 'next/image';

type SeoImageProps = Omit<ImageProps, 'alt'> & {
  alt: string;
};

export default function SeoImage({ alt, decoding = 'async', ...props }: SeoImageProps) {
  return <Image {...props} alt={alt} decoding={decoding} />;
}
