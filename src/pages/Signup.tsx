import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Store, User, ArrowRight, Loader2, Phone, MapPin } from "lucide-react";

type Role = "merchant" | "customer";

type Country = {
  code: string;
  name: string;
  flag: string;
  phoneCode: string; // includes +
  maxLen?: number;   // rough max digits for national number
};

type RegionOption = { value: string; label: string };

const COUNTRIES: Country[] = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", phoneCode: "+966", maxLen: 9 },
  { code: "EG", name: "Egypt", flag: "🇪🇬", phoneCode: "+20", maxLen: 10 },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", phoneCode: "+971", maxLen: 9 },
  { code: "QA", name: "Qatar", flag: "🇶🇦", phoneCode: "+974", maxLen: 8 },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", phoneCode: "+965", maxLen: 8 },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", phoneCode: "+973", maxLen: 8 },
  { code: "OM", name: "Oman", flag: "🇴🇲", phoneCode: "+968", maxLen: 8 },
  { code: "JO", name: "Jordan", flag: "🇯🇴", phoneCode: "+962", maxLen: 9 },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", phoneCode: "+961", maxLen: 8 },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", phoneCode: "+964", maxLen: 10 },
  { code: "MA", name: "Morocco", flag: "🇲🇦", phoneCode: "+212", maxLen: 9 },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", phoneCode: "+216", maxLen: 8 },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", phoneCode: "+213", maxLen: 9 },
  { code: "LY", name: "Libya", flag: "🇱🇾", phoneCode: "+218", maxLen: 9 },
  { code: "SD", name: "Sudan", flag: "🇸🇩", phoneCode: "+249", maxLen: 9 },
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1", maxLen: 10 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44", maxLen: 10 },
  { code: "DE", name: "Germany", flag: "🇩🇪", phoneCode: "+49", maxLen: 11 },
  { code: "FR", name: "France", flag: "🇫🇷", phoneCode: "+33", maxLen: 9 },
  { code: "IT", name: "Italy", flag: "🇮🇹", phoneCode: "+39", maxLen: 10 },
  { code: "ES", name: "Spain", flag: "🇪🇸", phoneCode: "+34", maxLen: 9 },
  { code: "TR", name: "Turkey", flag: "🇹🇷", phoneCode: "+90", maxLen: 10 },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "+91", maxLen: 10 },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", phoneCode: "+92", maxLen: 10 },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", phoneCode: "+880", maxLen: 10 },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", phoneCode: "+62", maxLen: 11 },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", phoneCode: "+60", maxLen: 10 },
  { code: "SG", name: "Singapore", flag: "🇸🇬", phoneCode: "+65", maxLen: 8 },
  { code: "CN", name: "China", flag: "🇨🇳", phoneCode: "+86", maxLen: 11 },
  { code: "JP", name: "Japan", flag: "🇯🇵", phoneCode: "+81", maxLen: 10 },
  { code: "KR", name: "South Korea", flag: "🇰🇷", phoneCode: "+82", maxLen: 10 },
  { code: "AU", name: "Australia", flag: "🇦🇺", phoneCode: "+61", maxLen: 9 },
  { code: "CA", name: "Canada", flag: "🇨🇦", phoneCode: "+1", maxLen: 10 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phoneCode: "+55", maxLen: 11 },
  { code: "MX", name: "Mexico", flag: "🇲🇽", phoneCode: "+52", maxLen: 10 },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", phoneCode: "+27", maxLen: 9 },
];

const REGIONS: Record<string, RegionOption[]> = {
  SA: [
    { value: "riyadh", label: "Riyadh" },
    { value: "makkah", label: "Makkah" },
    { value: "madinah", label: "Madinah" },
    { value: "eastern", label: "Eastern Province" },
    { value: "qassim", label: "Al-Qassim" },
    { value: "asir", label: "Asir" },
    { value: "tabuk", label: "Tabuk" },
    { value: "hail", label: "Hail" },
    { value: "jazan", label: "Jazan" },
    { value: "najran", label: "Najran" },
    { value: "al-bahah", label: "Al-Bahah" },
    { value: "al-jouf", label: "Al-Jouf" },
    { value: "northern-borders", label: "Northern Borders" },
  ],
  EG: [
    { value: "cairo", label: "Cairo" },
    { value: "giza", label: "Giza" },
    { value: "alexandria", label: "Alexandria" },
    { value: "dakahlia", label: "Dakahlia" },
    { value: "sharqia", label: "Sharqia" },
    { value: "gharbia", label: "Gharbia" },
    { value: "menoufia", label: "Menoufia" },
    { value: "beheira", label: "Beheira" },
    { value: "kafr-el-sheikh", label: "Kafr El Sheikh" },
    { value: "faiyum", label: "Faiyum" },
    { value: "beni-suef", label: "Beni Suef" },
    { value: "minya", label: "Minya" },
    { value: "assiut", label: "Assiut" },
    { value: "sohag", label: "Sohag" },
    { value: "qena", label: "Qena" },
    { value: "luxor", label: "Luxor" },
    { value: "aswan", label: "Aswan" },
    { value: "suez", label: "Suez" },
    { value: "ismailia", label: "Ismailia" },
    { value: "port-said", label: "Port Said" },
    { value: "north-sinai", label: "North Sinai" },
    { value: "south-sinai", label: "South Sinai" },
    { value: "red-sea", label: "Red Sea" },
    { value: "matrouh", label: "Matrouh" },
    { value: "new-valley", label: "New Valley" },
  ],
  AE: [
    { value: "dubai", label: "Dubai" },
    { value: "abu-dhabi", label: "Abu Dhabi" },
    { value: "sharjah", label: "Sharjah" },
    { value: "ajman", label: "Ajman" },
    { value: "ras-al-khaimah", label: "Ras Al Khaimah" },
    { value: "fujairah", label: "Fujairah" },
    { value: "umm-al-quwain", label: "Umm Al Quwain" },
  ],
};

function normalizeDigits(input: string) {
  // keep only digits
  return input.replace(/\D+/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [role, setRole] = useState<Role>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [country, setCountry] = useState<string>("SA");
  const [region, setRegion] = useState<string>(""); // for dropdown regions OR custom
  const [customRegion, setCustomRegion] = useState<string>(""); // when country not in REGIONS

  const [phone, setPhone] = useState<string>("");
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === country) || COUNTRIES[0],
    [country]
  );

  const regionOptions = useMemo(() => REGIONS[country] || null, [country]);

  const fullPhone = useMemo(() => {
    const digits = normalizeDigits(phone);
    return `${selectedCountry.phoneCode}${digits}`.trim();
  }, [phone, selectedCountry.phoneCode]);

  const phoneMaxLen = selectedCountry.maxLen ?? 12;

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!isValidEmail(email)) return "Please enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!agreed) return "Please agree to terms.";
    const digits = normalizeDigits(phone);
    if (!digits) return "Phone number is required.";
    if (digits.length < 7) return "Phone number is too short.";
    if (digits.length > phoneMaxLen) return `Phone number is too long (max ${phoneMaxLen} digits).`;

    // region logic
    if (regionOptions) {
      if (!region) return "Please select a region.";
    } else {
      // optional but recommended for non-supported countries
      if (!customRegion.trim()) return "Please type your region/state.";
    }

    return "";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);

    try {
      const finalRegion = regionOptions ? region : customRegion.trim();

      const result = await signUp(email.trim(), password, role, {
        full_name: fullName.trim(),
        phone: fullPhone, // ✅ always includes country code
        country,
        region: finalRegion || undefined, // ✅ no null
      });

      if ((result as any)?.error) {
        setError((result as any).error);
        return;
      }

      const sessionExists = (result as any)?.data?.session != null;

      if (!sessionExists) {
        setInfo("Account created! Please check your email to confirm your account, then login.");
        // no long delay
        setTimeout(() => {
          navigate(role === "merchant" ? "/login/merchant" : "/login/customer", { replace: true });
        }, 500);
        return;
      }

      navigate(role === "merchant" ? "/merchant/setup" : "/dashboard/customer", { replace: true });
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6" dir="ltr">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            S
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">CREATE ACCOUNT</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
            {role === "merchant" ? "Merchant Workspace" : "Customer Account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-xs font-bold border border-emerald-100">
            {info}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* ROLE */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === "customer"
                  ? "border-purple-600 bg-purple-50 text-purple-600"
                  : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
              }`}
            >
              <User size={20} />
              <span className="font-black text-[10px] uppercase">Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("merchant")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === "merchant"
                  ? "border-purple-600 bg-purple-50 text-purple-600"
                  : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
              }`}
            >
              <Store size={20} />
              <span className="font-black text-[10px] uppercase">Merchant</span>
            </button>
          </div>

          {/* INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold"
            />

            <input
              required
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold"
            />

            {/* REGION */}
            {regionOptions ? (
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <select
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold appearance-none"
                >
                  <option value="" disabled>
                    Select Region
                  </option>
                  {regionOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                required
                placeholder="Region / State"
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold"
              />
            )}

            {/* COUNTRY + PHONE */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={country}
                onChange={(e) => {
                  const next = e.target.value;
                  setCountry(next);
                  setRegion("");        // reset dropdown region
                  setCustomRegion("");  // reset custom region
                }}
                className="bg-gray-50 px-4 py-3 rounded-xl font-bold outline-none border-2 border-transparent focus:border-purple-600"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.phoneCode})
                  </option>
                ))}
              </select>

              <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 rounded-xl border-2 border-transparent focus-within:border-purple-600 px-4 py-3">
                <Phone size={16} className="text-gray-300" />
                <span className="font-black text-gray-700 text-sm">{selectedCountry.phoneCode}</span>
                <span className="text-gray-200">|</span>
                <input
                  required
                  inputMode="numeric"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => {
                    const digits = normalizeDigits(e.target.value);
                    setPhone(digits.slice(0, phoneMaxLen));
                  }}
                  className="flex-1 bg-transparent outline-none font-bold"
                />
              </div>

              <p className="md:col-span-3 text-[10px] font-bold text-gray-400">
                Full phone will be saved as: <span className="text-gray-700">{fullPhone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="agreed"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <label htmlFor="agreed" className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              I agree to terms and conditions
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-sm tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>CREATE ACCOUNT <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
