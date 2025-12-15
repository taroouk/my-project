import DashboardLayout from "../../dashboard/layouts/Dashboardlayout";
import {
  Gift,
  Star,
  Wallet,
  History,
  PlusCircle,
} from "lucide-react";

const CustomerDashboard = () => {
  return (
    <DashboardLayout title="Customer Dashboard" role="customer">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Loyalty Points" value="—" icon={<Star />} />
        <StatCard title="Active Offers" value="—" icon={<Gift />} />
        <StatCard title="Wallet" value="—" icon={<Wallet />} />
        <StatCard title="History" value="—" icon={<History />} />
      </div>

      {/* Main Section */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Your Offers
        </h2>

        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You don’t have any active offers yet
          </p>
          <span className="text-sm text-gray-400">
            Offers from merchants will appear here
          </span>
        </div>
      </section>

      {/* Empty State */}
      <section className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-10 text-center border border-purple-100 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Servly
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
          Start earning loyalty points by interacting with merchants and
          redeeming exclusive offers directly from your dashboard.
        </p>

        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition">
          <PlusCircle size={20} />
          Explore Merchants
        </button>
      </section>
    </DashboardLayout>
  );
};

/* ---------- Components ---------- */

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: JSX.Element;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="text-purple-600">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white">
      {value}
    </div>
  </div>
);

export default CustomerDashboard;
