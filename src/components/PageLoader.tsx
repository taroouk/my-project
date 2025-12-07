import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

interface PageLoaderProps {
  children: React.ReactNode;
  loadingText?: string;
  minLoadTime?: number;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  children, 
  loadingText = 'جاري تحميل الصفحة...', 
  minLoadTime = 800 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  if (isLoading) {
    return <LoadingSpinner size="large" text={loadingText} fullScreen />;
  }

  return <>{children}</>;
};

export default PageLoader;