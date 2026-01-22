import { useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  /** Can be a full URL or a Storage path like: merchant_id/logo.png */
  logoUrl?: string | null;
  /** Background color for fallback avatar */
  brandColor?: string;
  /** Text shown if no logo */
  fallbackText?: string;
  /** Size in px (defaults to 48) */
  size?: number;
  /** Extra class names on the outer container */
  className?: string;
  /** Tailwind classes for the border (optional) */
  borderClassName?: string;
  /** Bucket name (default: merchant-logos) */
  bucket?: string;
  /** Optional cache-bust key for forcing image refresh (e.g. after upload) */
  cacheBustKey?: string;
};

const DEFAULT_BUCKET = 'merchant-logos';

/**
 * Convert whatever is stored (full URL OR storage path) to a browser-usable src.
 */
export const toLogoSrc = (raw: string, bucket = DEFAULT_BUCKET) => {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;

  // Supabase public bucket URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(v);
  return data?.publicUrl || '';
};

export default function LogoAvatar({
  logoUrl,
  brandColor = '#6366F1',
  fallbackText = 'M',
  size = 48,
  className = '',
  borderClassName = '',
  bucket = DEFAULT_BUCKET,
  cacheBustKey,
}: Props) {
  const src = useMemo(() => {
    const raw = String(logoUrl || '').trim();
    if (!raw) return '';
    return toLogoSrc(raw, bucket);
  }, [logoUrl, bucket]);

  // user requested pattern:
  // key={toLogoSrc(logoUrl) + '?v=' + String(Date.now()).slice(-6)}
  const imgKey = useMemo(() => {
    if (!src) return '';
    if (cacheBustKey) return cacheBustKey;
    return `${src}?v=${String(Date.now()).slice(-6)}`;
  }, [src, cacheBustKey]);

  const px = `${size}px`;

  if (src) {
    return (
      <div
        className={`overflow-hidden rounded-2xl flex items-center justify-center ${borderClassName} ${className}`}
        style={{ width: px, height: px }}
      >
        <img
          key={imgKey}
          src={src}
          alt="logo"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl flex items-center justify-center text-white font-black shadow-xl ${borderClassName} ${className}`}
      style={{ width: px, height: px, backgroundColor: brandColor }}
    >
      {String(fallbackText || 'M').charAt(0).toUpperCase()}
    </div>
  );
}
