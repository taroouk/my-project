import React from 'react';
import { Building2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'جاري التحميل...', 
  fullScreen = false 
}) => {
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-4">
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto animate-pulse`}>
            <Building2 className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
          </div>
          
          {/* Spinning Ring */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-purple-200 dark:border-purple-800 border-t-purple-600 rounded-full animate-spin mx-auto`}></div>
        </div>
        
        {/* Loading Text */}
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-300 font-medium animate-pulse`}>
          {text}
        </p>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;