import { supabase } from './supabaseClient';

const DEFAULT_LOGO_BUCKET = 'merchant-logos';

/**
 * Converts a stored logo reference into a usable <img src>.
 * - If value is already an absolute URL, it is returned as-is.
 * - Otherwise it is treated as a path/key in Supabase Storage bucket.
 */
export const toLogoSrc = (value?: string | null, bucket: string = DEFAULT_LOGO_BUCKET) => {
  const v = (value || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;

  const { data } = supabase.storage.from(bucket).getPublicUrl(v);
  return data?.publicUrl || '';
};
