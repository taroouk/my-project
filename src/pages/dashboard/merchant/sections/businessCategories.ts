export const BUSINESS_CATEGORIES = [
  { value: 'salon', en: 'Salon / Barbershop', ar: 'صالون / حلاقة' },
  { value: 'spa', en: 'Spa', ar: 'سبا' },
  { value: 'clinic', en: 'Clinic', ar: 'عيادة' },
  { value: 'gym', en: 'Gym / Fitness', ar: 'نادي / لياقة' },
  { value: 'beauty', en: 'Beauty & Makeup', ar: 'تجميل ومكياج' },
  { value: 'nails', en: 'Nails', ar: 'أظافر' },
  { value: 'home', en: 'Home Services', ar: 'خدمات منزلية' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
] as const;

export type BusinessCategoryValue = (typeof BUSINESS_CATEGORIES)[number]['value'];

/**
 * If the stored value is not one of the predefined values, treat it as "other" with custom text.
 */
export const splitBusinessCategory = (raw: any): { value: BusinessCategoryValue; custom: string } => {
  const s = String(raw || '').trim();
  if (!s) return { value: 'salon', custom: '' };

  const isKnown = BUSINESS_CATEGORIES.some((c) => c.value === s);
  return { value: (isKnown ? (s as BusinessCategoryValue) : 'other'), custom: isKnown ? '' : s };
};

export const joinBusinessCategory = (value: string, custom: string) => {
  if (String(value).toLowerCase() === 'other') return String(custom || '').trim();
  return String(value || '').trim();
};
