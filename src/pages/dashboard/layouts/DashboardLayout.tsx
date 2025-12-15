// src/pages/dashboard/layouts/DashboardLayout.tsx
import { ReactNode } from "react";
import { LogOut, LayoutDashboard, User, Store } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  role: "admin" | "merchant" | "customer";
  children: ReactNode;
}

const DashboardLayout = ({ title, role, children }: Props) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/landing");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold">
          Servly
          <p className="text-sm opacity-80 capitalize">{role} panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition">
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          {role === "admin" && (
            <>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition">
                <User size={20} />
                Users
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition">
                <Store size={20} />
                Merchants
              </button>
            </>
          )}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 capitalize">
            Welcome to your {role} dashboard
          </p>
        </header>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
