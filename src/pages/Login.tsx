import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Store, User, ArrowRight, Loader2, LogIn } from "lucide-react";

type Role = "merchant" | "customer";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, refreshUser, user, dbUser, dbLoaded, role, loading } = useAuth();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("customer");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: "bg-[#030712] text-white",
        card: "bg-[#020617] border-slate-800",
        input: "bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500",
        muted: "text-slate-400",
        chipOn: "border-indigo-500 bg-indigo-500/15 text-indigo-200",
        chipOff: "border-slate-800 bg-slate-900/30 text-slate-400 hover:bg-slate-900/50",
        btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
      };
    }
    return {
      page: "bg-[#F8F9FD] text-gray-900",
      card: "bg-white border-gray-100",
      input: "bg-gray-50 border-transparent focus:border-purple-600 text-gray-900 placeholder:text-gray-400",
      muted: "text-gray-500",
      chipOn: "border-purple-600 bg-purple-50 text-purple-600",
      chipOff: "border-gray-50 bg-gray-50 text-gray-400 hover:bg-gray-100",
      btn: "bg-purple-600 hover:bg-purple-700 text-white",
    };
  }, [isDarkMode]);

  const isSetupComplete = useMemo(() => {
    const metadataComplete = user?.user_metadata?.setup_complete === true;
    const dbComplete = (dbUser as any)?.setup_complete === true || !!(dbUser as any)?.store_slug;
    const sessionComplete = localStorage.getItem("servly_setup_done") === "true";
    return metadataComplete || dbComplete || sessionComplete;
  }, [user, dbUser]);

  // ✅ After login: redirect based on DB role (best), then metadata, then selectedRole (UI)
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!dbLoaded) return;

    const activeRole = (role || dbUser?.role || (user.user_metadata?.role as any) || selectedRole) as
      | "admin"
      | "merchant"
      | "customer";

    if (activeRole === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    if (activeRole === "merchant") {
      navigate(isSetupComplete ? "/merchant" : "/merchant/setup", { replace: true });
      return;
    }

    navigate("/dashboard/customer", { replace: true });
  }, [user, dbLoaded, role, dbUser, selectedRole, navigate, isSetupComplete, loading]);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");
  setInfo("");

  try {
    const { error: signInErr } = await signIn(email.trim(), password);

    if (signInErr) {
      setError(signInErr.message || "Invalid credentials.");
      return;
    }

    // ✅ حل نهائي: حدّث session + dbUser فورًا قبل التحويل
    await refreshUser();

    // ✅ اختار الدور الحقيقي (DB أولاً) ثم metadata ثم اختيار UI
    const activeRole = (role || dbUser?.role || (user?.user_metadata?.role as any) || selectedRole) as
      | "admin"
      | "merchant"
      | "customer";

    if (activeRole === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    if (activeRole === "merchant") {
      const metadataComplete = user?.user_metadata?.setup_complete === true;
      const dbComplete = (dbUser as any)?.setup_complete === true || !!(dbUser as any)?.store_slug;
      const sessionComplete = localStorage.getItem("servly_setup_done") === "true";
      const setupDone = metadataComplete || dbComplete || sessionComplete;

      navigate(setupDone ? "/merchant" : "/merchant/setup", { replace: true });
      return;
    }

    navigate("/dashboard/customer", { replace: true });
  } catch (_err: any) {
    setError("Connection error. Please try again.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className={`min-h-screen ${ui.page} flex items-center justify-center p-6`} dir="ltr">
      <div className={`max-w-xl w-full ${ui.card} rounded-[2.5rem] shadow-xl p-8 md:p-10 border`}>
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4"
            style={{ backgroundColor: isDarkMode ? "#4F46E5" : "#7C3AED" }}
          >
            <LogIn />
          </div>
          <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            LOGIN
          </h2>
          <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.25em] ${ui.muted}`}>
            One page for Customer & Merchant
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl mb-6 text-xs font-bold border ${isDarkMode ? "bg-rose-950/30 text-rose-200 border-rose-900/40" : "bg-red-50 text-red-600 border-red-100"}`}>
            {error}
          </div>
        )}

        {info && (
          <div className={`p-4 rounded-xl mb-6 text-xs font-bold border ${isDarkMode ? "bg-emerald-950/25 text-emerald-200 border-emerald-900/40" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
            {info}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Selector (UI only) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole("customer")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === "customer" ? ui.chipOn : ui.chipOff}`}
            >
              <User size={20} />
              <span className="font-black text-[10px] uppercase">Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("merchant")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === "merchant" ? ui.chipOn : ui.chipOff}`}
            >
              <Store size={20} />
              <span className="font-black text-[10px] uppercase">Merchant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-5 py-3 rounded-xl border-2 outline-none font-bold ${ui.input}`}
            />

            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-5 py-3 rounded-xl border-2 outline-none font-bold ${ui.input}`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${ui.btn}`}
          >
            {submitting ? <Loader2 className="animate-spin" /> : <>LOGIN <ArrowRight size={18} /></>}
          </button>

          <div className={`pt-2 text-center text-[11px] font-bold ${ui.muted}`}>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className={`underline underline-offset-4 ${isDarkMode ? "text-indigo-300" : "text-purple-600"}`}
            >
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
