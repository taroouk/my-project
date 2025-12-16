// src/pages/dashboard/merchant/MerchantDashboard.tsx
import React from 'react';
import { Box, Users, Star, Zap, Gift, LogOut } from 'lucide-react';

interface MerchantDashboardProps {
  onClose?: () => void | Promise<void>;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onClose }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-purple-100 dark:border-gray-700 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Merchant
          </h1>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button className="flex items-center space-x-2 w-full p-3 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Customers</span>
          </button>

          <button className="flex items-center space-x-2 w-full p-3 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Ratings</span>
          </button>

          <button className="flex items-center space-x-2 w-full p-3 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors">
            <Zap className="w-5 h-5 text-purple-600" />
            <span>Plans</span>
          </button>

          <button className="flex items-center space-x-2 w-full p-3 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors">
            <Gift className="w-5 h-5 text-purple-600" />
            <span>Loyalty</span>
          </button>
        </nav>

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center space-x-2 w-full p-3 m-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 transition-colors text-red-600 dark:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Merchant Dashboard</h2>
          <span className="text-gray-600 dark:text-gray-400">Welcome, Merchant</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Total Customers</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>

          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Ratings</span>
            </div>
            <div className="text-2xl font-bold">0/5</div>
          </div>

          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Plans</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>

          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Loyalty</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Orders Table Placeholder
          </div>
          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Plans Overview Placeholder
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;
