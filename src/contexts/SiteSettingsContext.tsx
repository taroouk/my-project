// src/contexts/SiteSettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

/* =======================
   Types
======================= */

export type Language = 'ar' | 'en';

export interface Plan {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  yearlyPrice: number;
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn: string[];
  popular?: boolean;
  color: string;
  icon?: React.ReactNode;
  iconName?: string;
}

export interface SiteSettings {
  language: Language;

  branding: {
    siteName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    headingFont: string;
    bodyFont: string;
  };

  contact: {
    phone: string;
    email: string;
    address: string;
    addressEn: string;
    whatsapp: string;
    supportEmail: string;
  };

  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };

  footer: {
    copyrightText: string;
    companyLink: string;
  };

  platform: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    emailNotifications: boolean;
    autoBackup: boolean;
  };

  plans: Plan[];
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  setLanguage: (lang: Language) => void;

  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  updateBranding: (branding: Partial<SiteSettings['branding']>) => void;
  updateContact: (contact: Partial<SiteSettings['contact']>) => void;
  updateSocial: (social: Partial<SiteSettings['social']>) => void;
  updateFooter: (footer: Partial<SiteSettings['footer']>) => void;
  updatePlatform: (platform: Partial<SiteSettings['platform']>) => void;

  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;

  resetSettings: () => void;
}

/* =======================
   Default Settings
======================= */

const defaultSettings: SiteSettings = {
  language: 'ar',

  branding: {
    siteName: 'Servly',
    logoUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#FFFFFF',
    headingFont: 'Cairo',
    bodyFont: 'Cairo',
  },

  contact: {
    phone: '+20 100 123 4567',
    email: 'info@servly.com',
    address: 'القاهرة، مصر',
    addressEn: 'Cairo, Egypt',
    whatsapp: '+20 100 123 4567',
    supportEmail: 'support@servly.com',
  },

  social: {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#',
    youtube: '#',
  },

  footer: {
    copyrightText: '© 2024 Servly. جميع الحقوق محفوظة.',
    companyLink: 'https://servly.com',
  },

  platform: {
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    autoBackup: true,
  },

  plans: [
    {
      id: 'starter',
      name: 'المبتدئ',
      nameEn: 'Starter',
      price: 99,
      yearlyPrice: 990,
      description: 'مثالي للشركات الصغيرة',
      descriptionEn: 'Perfect for small businesses',
      features: [
        'إدارة حتى 10 موظفين',
        'نظام نقاط الولاء الأساسي',
        'موقع إلكتروني واحد',
        'دعم فني أساسي',
        'تقارير شهرية',
      ],
      featuresEn: [
        'Manage up to 10 employees',
        'Basic loyalty points system',
        'One website',
        'Basic technical support',
        'Monthly reports',
      ],
      color: 'from-blue-500 to-purple-600',
      iconName: 'Star',
    },
  ],
};

/* =======================
   Context
======================= */

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

/* =======================
   Provider
======================= */

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));

    // Apply branding CSS variables
    document.documentElement.style.setProperty('--primary-color', settings.branding.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.branding.secondaryColor);
    document.documentElement.style.setProperty('--heading-font', settings.branding.headingFont);
    document.documentElement.style.setProperty('--body-font', settings.branding.bodyFont);

    // Apply language + direction
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings]);

  /* ========= Language ========= */

  const setLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  /* ========= Updates ========= */

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateBranding = (branding: Partial<SiteSettings['branding']>) => {
    setSettings(prev => ({ ...prev, branding: { ...prev.branding, ...branding } }));
  };

  const updateContact = (contact: Partial<SiteSettings['contact']>) => {
    setSettings(prev => ({ ...prev, contact: { ...prev.contact, ...contact } }));
  };

  const updateSocial = (social: Partial<SiteSettings['social']>) => {
    setSettings(prev => ({ ...prev, social: { ...prev.social, ...social } }));
  };

  const updateFooter = (footer: Partial<SiteSettings['footer']>) => {
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, ...footer } }));
  };

  const updatePlatform = (platform: Partial<SiteSettings['platform']>) => {
    setSettings(prev => ({ ...prev, platform: { ...prev.platform, ...platform } }));
  };

  const addPlan = (plan: Plan) => {
    setSettings(prev => ({ ...prev, plans: [...prev.plans, plan] }));
  };

  const updatePlan = (id: string, plan: Partial<Plan>) => {
    setSettings(prev => ({
      ...prev,
      plans: prev.plans.map(p => (p.id === id ? { ...p, ...plan } : p)),
    }));
  };

  const deletePlan = (id: string) => {
    setSettings(prev => ({
      ...prev,
      plans: prev.plans.filter(p => p.id !== id),
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        setLanguage,
        updateSettings,
        updateBranding,
        updateContact,
        updateSocial,
        updateFooter,
        updatePlatform,
        addPlan,
        updatePlan,
        deletePlan,
        resetSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

/* =======================
   Hook
======================= */

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
};
