// AdminDashboard.tsx
import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface AdminDashboardProps {
  onClose: () => void | Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { dbUser, role } = useAuth(); // ناخد بيانات المستخدم والـ role من Context
  const [language, setLanguage] = useState<'ar' | 'en'>('en');

  const t = {
    ar: {
      dashboard: 'لوحة التحكم',
      users: 'المستخدمين',
      merchants: 'التجار',
      bookings: 'الحجوزات',
      services: 'الخدمات',
      logout: 'تسجيل الخروج',
      welcome: 'مرحباً',
      userEmail: 'البريد الإلكتروني',
    },
    en: {
      dashboard: 'Dashboard',
      users: 'Users',
      merchants: 'Merchants',
      bookings: 'Bookings',
      services: 'Services',
      logout: 'Logout',
      welcome: 'Welcome',
      userEmail: 'Email',
    },
  }[language];

  if (!dbUser || role !== 'admin') {
    return <p className="p-6 text-red-600">Access Denied</p>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <header className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h1 className="text-2xl font-bold">{t.dashboard}</h1>
        <div className="flex gap-3 items-center">
          <button onClick={toggleDarkMode}>{isDarkMode ? <Sun /> : <Moon />}</button>
          <select value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')} className="border rounded px-2 py-1">
            <option value="ar">AR</option>
            <option value="en">EN</option>
          </select>
          <button onClick={onClose} className="text-red-600 font-semibold">{t.logout}</button>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t.welcome}, {dbUser.full_name || dbUser.email}</h2>
          <p>{t.userEmail}: {dbUser.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="font-bold mb-2">{t.users}</h2>
            <p>Manage all users</p>
          </div>
          <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="font-bold mb-2">{t.merchants}</h2>
            <p>Manage all merchants</p>
          </div>
          <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="font-bold mb-2">{t.bookings}</h2>
            <p>View and manage bookings</p>
          </div>
          <div className={`p-4 rounded shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="font-bold mb-2">{t.services}</h2>
            <p>Manage services & subscriptions</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
