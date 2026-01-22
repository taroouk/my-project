import { useState } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

// CONTEXTS
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";

// PAGES & COMPONENTS
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import LandingPage from "./components/LandingPage";

// ✅ Store pages
import StoreFront from "./pages/store/StoreFront";
import Stores from "./pages/store/Stores"; // ✅ NEW

import SetupStore from "./pages/dashboard/merchant/setup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/dashboard/customer/CustomerDashboard";
import MerchantDashboard from "./pages/dashboard/merchant/MerchantDashboard";

// GUARDS
import RequireAdmin from "./routes/RequireAdmin";
import RoleGuard from "./routes/RoleGuard";
import CartPage from "./pages/cart/CartPage";

function App() {
  const { user, dbUser, role, loading, dbLoaded } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<"ar" | "en">("en");

  const LoadingScreen = () => (
    <div
      className={`h-screen flex items-center justify-center ${
        isDarkMode ? "bg-[#030712] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-black uppercase tracking-[0.3em] animate-pulse text-indigo-600">
          Servly
        </p>
        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
          Synchronizing Workspace...
        </p>
      </div>
    </div>
  );

  const isSetupComplete = () => {
    const metadataComplete = user?.user_metadata?.setup_complete === true;
    const dbComplete = dbUser?.setup_complete === true || !!dbUser?.store_slug;
    const sessionComplete = localStorage.getItem("servly_setup_done") === "true";
    return metadataComplete || dbComplete || sessionComplete;
  };

  if (loading) return <LoadingScreen />;
  if (location.pathname === "/" && user && !dbLoaded) return <LoadingScreen />;

  const HomePageRedirect = () => {
    if (!user) {
      return (
        <LandingPage
          language={language}
          setLanguage={setLanguage}
          onGetStarted={() => navigate("/signup")}
          // ✅ one unified login page
          onCustomerLogin={() => navigate("/login")}
          onMerchantLogin={() => navigate("/login")}
        />
      );
    }

    if (!dbLoaded) return <LoadingScreen />;

    const activeRole = role || dbUser?.role || (user.user_metadata?.role as any);

    if (activeRole === "admin") return <Navigate to="/admin" replace />;

    if (activeRole === "merchant") {
      return isSetupComplete() ? (
        <Navigate to="/merchant" replace />
      ) : (
        <Navigate to="/merchant/setup" replace />
      );
    }

    if (activeRole === "customer") return <Navigate to="/dashboard/customer" replace />;

    return <Navigate to="/unauthorized" replace />;
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePageRedirect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        

        {/* ✅ Public Store Directory + Store Page */}
        <Route path="/stores" element={<Stores />} />        {/* ✅ NEW */}
        <Route path="/s/:slug" element={<StoreFront />} />   {/* ✅ existing */}
        <Route path="/cart" element={<CartPage />} />


        {/* Admin Auth (optional separate) */}
        <Route path="/login/admin" element={<AdminLogin />} />

        {/* Merchant */}
        <Route
          path="/merchant/setup"
          element={
            <RoleGuard allowedRoles={["merchant", "admin"]}>
              {isSetupComplete() ? <Navigate to="/merchant" replace /> : <SetupStore />}
            </RoleGuard>
          }
        />

        <Route
          path="/merchant/*"
          element={
            <RoleGuard allowedRoles={["merchant", "admin"]}>
              {isSetupComplete() ? <MerchantDashboard /> : <Navigate to="/merchant/setup" replace />}
            </RoleGuard>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        {/* Customer */}
        <Route
          path="/dashboard/customer/*"
          element={
            <RoleGuard allowedRoles={["customer", "admin"]}>
              <CustomerDashboard />
            </RoleGuard>
          }
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="h-screen flex flex-col items-center justify-center bg-white text-center px-6" dir="ltr">
              <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 text-4xl font-bold italic shadow-inner">
                !
              </div>
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-gray-900 italic">Access Denied</h2>
              <p className="text-gray-500 mb-8 font-bold max-w-sm">
                Your account doesn't have the necessary permissions to view this dashboard.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-black text-white px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs"
              >
                Back to Home
              </button>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;