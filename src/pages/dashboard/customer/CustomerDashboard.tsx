// src/pages/dashboard/customer/CustomerDashboard.tsx
import React from 'react';
import { User, Star, Gift, LogOut } from 'lucide-react';

interface CustomerDashboardProps {
  onClose: () => void | Promise<void>;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onClose }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-blue-100 dark:border-gray-700 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Customer
          </h1>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button className="flex items-center space-x-2 w-full p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
            <Gift className="w-5 h-5 text-purple-600" />
            <span>My Loyalty</span>
          </button>
          <button className="flex items-center space-x-2 w-full p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>My Ratings</span>
          </button>
        </nav>

        <button
          onClick={onClose}
          className="flex items-center space-x-2 w-full p-3 m-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 transition-colors text-red-600 dark:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Customer Dashboard</h2>
          <span className="text-gray-600 dark:text-gray-400">Welcome, Customer</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">My Profile</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>

          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold text-gray-900 dark:text-white">My Ratings</span>
            </div>
            <div className="text-2xl font-bold">0/5</div>
          </div>

          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Loyalty Points</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        {/* Placeholder Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Recent Activities Placeholder
          </div>
          <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-lg backdrop-blur-xl h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Subscriptions Placeholder
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
