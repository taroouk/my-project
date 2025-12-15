import DashboardLayout from "../../dashboard/layouts/Dashboardlayout";
import {
  Store,
  Users,
  Gift,
  Globe,
  PlusCircle,
} from "lucide-react";

const MerchantDashboard = () => {
  return (
    <DashboardLayout title="Merchant Dashboard" role="merchant">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Employees" value="—" icon={<Users />} />
        <StatCard title="Loyalty Offers" value="—" icon={<Gift />} />
        <StatCard title="Websites" value="—" icon={<Globe />} />
        <StatCard title="Branches" value="—" icon={<Store />} />
      </div>

      {/* Actions */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard title="Add Employee" />
          <ActionCard title="Create Loyalty Offer" />
          <ActionCard title="Build Website" />
        </div>
      </section>

      {/* Empty State */}
      <section className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-10 text-center border border-purple-100 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your business is not set up yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
          Start by adding your company details, employees, and first loyalty
          campaign. Everything will appear here once you begin.
        </p>

        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition">
          <PlusCircle size={20} />
          Start Setup
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

const ActionCard = ({ title }: { title: string }) => (
  <button className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition border border-gray-100 dark:border-gray-700">
    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
      {title}
    </h4>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This section will be activated once data is added
    </p>
  </button>
);

export default MerchantDashboard;
