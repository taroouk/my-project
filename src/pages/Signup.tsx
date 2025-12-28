import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Store,
  User,
  ArrowRight,
  Loader2,
  Moon,
  Sun,
  CheckCircle2,
  ShieldCheck,
  Globe2,
  Phone as PhoneIcon,
} from "lucide-react";

type Role = "merchant" | "customer";

type Country = {
  code: string; // ISO2
  name: string;
  dial: string; // E.164 calling code, with +
  regions?: readonly string[];
};

const flagEmoji = (iso2: string) => {
  const code = (iso2 || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (code.charCodeAt(0) - 65), A + (code.charCodeAt(1) - 65));
};

const COUNTRIES: readonly Country[] = [
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "AS", name: "American Samoa", dial: "+1" },
  { code: "AD", name: "Andorra", dial: "+376" },
  { code: "AO", name: "Angola", dial: "+244" },
  { code: "AI", name: "Anguilla", dial: "+1" },
  { code: "AG", name: "Antigua & Barbuda", dial: "+1" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AW", name: "Aruba", dial: "+297" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "BS", name: "Bahamas", dial: "+1" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "BB", name: "Barbados", dial: "+1" },
  { code: "BY", name: "Belarus", dial: "+375" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "BZ", name: "Belize", dial: "+501" },
  { code: "BJ", name: "Benin", dial: "+229" },
  { code: "BM", name: "Bermuda", dial: "+1" },
  { code: "BT", name: "Bhutan", dial: "+975" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BA", name: "Bosnia & Herzegovina", dial: "+387" },
  { code: "BW", name: "Botswana", dial: "+267" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "BN", name: "Brunei", dial: "+673" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "BF", name: "Burkina Faso", dial: "+226" },
  { code: "BI", name: "Burundi", dial: "+257" },
  { code: "KH", name: "Cambodia", dial: "+855" },
  { code: "CM", name: "Cameroon", dial: "+237" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CV", name: "Cape Verde", dial: "+238" },
  { code: "KY", name: "Cayman Islands", dial: "+1" },
  { code: "CF", name: "Central African Republic", dial: "+236" },
  { code: "TD", name: "Chad", dial: "+235" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "KM", name: "Comoros", dial: "+269" },
  { code: "CG", name: "Congo (Republic)", dial: "+242" },
  { code: "CD", name: "Congo (DRC)", dial: "+243" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "CI", name: "Côte d’Ivoire", dial: "+225" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "CU", name: "Cuba", dial: "+53" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "CZ", name: "Czechia", dial: "+420" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "DJ", name: "Djibouti", dial: "+253" },
  { code: "DM", name: "Dominica", dial: "+1" },
  { code: "DO", name: "Dominican Republic", dial: "+1" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "EG", name: "Egypt", dial: "+20", regions: ["Cairo", "Giza", "Alexandria", "Delta", "Upper Egypt", "Suez Canal", "Sinai"] as const },
  { code: "SV", name: "El Salvador", dial: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dial: "+240" },
  { code: "ER", name: "Eritrea", dial: "+291" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "SZ", name: "Eswatini", dial: "+268" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FJ", name: "Fiji", dial: "+679" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "GF", name: "French Guiana", dial: "+594" },
  { code: "PF", name: "French Polynesia", dial: "+689" },
  { code: "GA", name: "Gabon", dial: "+241" },
  { code: "GM", name: "Gambia", dial: "+220" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "GI", name: "Gibraltar", dial: "+350" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "GL", name: "Greenland", dial: "+299" },
  { code: "GD", name: "Grenada", dial: "+1" },
  { code: "GP", name: "Guadeloupe", dial: "+590" },
  { code: "GU", name: "Guam", dial: "+1" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "GN", name: "Guinea", dial: "+224" },
  { code: "GW", name: "Guinea-Bissau", dial: "+245" },
  { code: "GY", name: "Guyana", dial: "+592" },
  { code: "HT", name: "Haiti", dial: "+509" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IR", name: "Iran", dial: "+98" },
  { code: "IQ", name: "Iraq", dial: "+964" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JM", name: "Jamaica", dial: "+1" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "KI", name: "Kiribati", dial: "+686" },
  { code: "KP", name: "Korea (North)", dial: "+850" },
  { code: "KR", name: "Korea (South)", dial: "+82" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "KG", name: "Kyrgyzstan", dial: "+996" },
  { code: "LA", name: "Laos", dial: "+856" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LB", name: "Lebanon", dial: "+961" },
  { code: "LS", name: "Lesotho", dial: "+266" },
  { code: "LR", name: "Liberia", dial: "+231" },
  { code: "LY", name: "Libya", dial: "+218" },
  { code: "LI", name: "Liechtenstein", dial: "+423" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MO", name: "Macao", dial: "+853" },
  { code: "MG", name: "Madagascar", dial: "+261" },
  { code: "MW", name: "Malawi", dial: "+265" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "MV", name: "Maldives", dial: "+960" },
  { code: "ML", name: "Mali", dial: "+223" },
  { code: "MT", name: "Malta", dial: "+356" },
  { code: "MH", name: "Marshall Islands", dial: "+692" },
  { code: "MQ", name: "Martinique", dial: "+596" },
  { code: "MR", name: "Mauritania", dial: "+222" },
  { code: "MU", name: "Mauritius", dial: "+230" },
  { code: "YT", name: "Mayotte", dial: "+262" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "FM", name: "Micronesia", dial: "+691" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "MN", name: "Mongolia", dial: "+976" },
  { code: "ME", name: "Montenegro", dial: "+382" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "MZ", name: "Mozambique", dial: "+258" },
  { code: "MM", name: "Myanmar", dial: "+95" },
  { code: "NA", name: "Namibia", dial: "+264" },
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NC", name: "New Caledonia", dial: "+687" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "NI", name: "Nicaragua", dial: "+505" },
  { code: "NE", name: "Niger", dial: "+227" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "MK", name: "North Macedonia", dial: "+389" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "PS", name: "Palestine", dial: "+970" },
  { code: "PA", name: "Panama", dial: "+507" },
  { code: "PG", name: "Papua New Guinea", dial: "+675" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "PE", name: "Peru", dial: "+51" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "PR", name: "Puerto Rico", dial: "+1" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "RE", name: "Réunion", dial: "+262" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "RW", name: "Rwanda", dial: "+250" },
  { code: "KN", name: "Saint Kitts & Nevis", dial: "+1" },
  { code: "LC", name: "Saint Lucia", dial: "+1" },
  { code: "VC", name: "Saint Vincent & Grenadines", dial: "+1" },
  { code: "WS", name: "Samoa", dial: "+685" },
  { code: "SM", name: "San Marino", dial: "+378" },
  { code: "ST", name: "São Tomé & Príncipe", dial: "+239" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", regions: ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Qassim", "Asir", "Tabuk", "Hail", "Jazan", "Najran", "Northern Borders", "Al Bahah", "Al Jawf"] as const },
  { code: "SN", name: "Senegal", dial: "+221" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "SC", name: "Seychelles", dial: "+248" },
  { code: "SL", name: "Sierra Leone", dial: "+232" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "SB", name: "Solomon Islands", dial: "+677" },
  { code: "SO", name: "Somalia", dial: "+252" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "SD", name: "Sudan", dial: "+249" },
  { code: "SR", name: "Suriname", dial: "+597" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "SY", name: "Syria", dial: "+963" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "TJ", name: "Tajikistan", dial: "+992" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "TG", name: "Togo", dial: "+228" },
  { code: "TO", name: "Tonga", dial: "+676" },
  { code: "TT", name: "Trinidad & Tobago", dial: "+1" },
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "TM", name: "Turkmenistan", dial: "+993" },
  { code: "TC", name: "Turks & Caicos Islands", dial: "+1" },
  { code: "UG", name: "Uganda", dial: "+256" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", regions: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] as const },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
  { code: "VU", name: "Vanuatu", dial: "+678" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "YE", name: "Yemen", dial: "+967" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" },
] as const;

const DEFAULT_REGIONS = ["Central", "North", "South", "East", "West"] as const;

const normalizeDigits = (v: string) => (v || "").replace(/[^\d]/g, "");

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("customer");

  const [country, setCountry] = useState<string>("SA");
  const [region, setRegion] = useState<string>("");
  const [phoneLocal, setPhoneLocal] = useState<string>("");

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const selectedCountry = useMemo<Country>(() => {
    return COUNTRIES.find((c) => c.code === country) ?? COUNTRIES.find((c) => c.code === "SA") ?? COUNTRIES[0];
  }, [country]);

  const regions = useMemo<readonly string[]>(() => {
    const r = selectedCountry?.regions;
    return (r && r.length ? r : DEFAULT_REGIONS) as readonly string[];
  }, [selectedCountry]);

  useEffect(() => {
    if (!region) return;
    if (!regions.includes(region)) setRegion("");
  }, [regions, region]);

  const fullPhone = useMemo(() => {
    const local = normalizeDigits(phoneLocal);
    return `${selectedCountry?.dial ?? ""}${local}`.trim();
  }, [phoneLocal, selectedCountry]);

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: "bg-[#030712] text-slate-100",
        card: "bg-[#020617]/80 border-slate-800",
        card2: "bg-slate-950/40 border-slate-800",
        muted: "text-slate-400",
        input:
          "bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20",
        chipOn: "border-indigo-500 bg-indigo-500/15 text-indigo-200",
        chipOff: "border-slate-800 bg-slate-900/30 text-slate-400 hover:bg-slate-900/50",
        btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
        btnSoft: "bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 border border-slate-800",
        danger: "bg-rose-950/30 text-rose-200 border-rose-900/40",
        ok: "bg-emerald-950/25 text-emerald-200 border-emerald-900/40",
        badge: "bg-slate-900/50 text-slate-200 border-slate-800",
      };
    }
    return {
      page: "bg-[#F8F9FD] text-gray-900",
      card: "bg-white border-gray-100",
      card2: "bg-white border-gray-100",
      muted: "text-gray-500",
      input:
        "bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:ring-purple-200/40",
      chipOn: "border-purple-600 bg-purple-50 text-purple-600",
      chipOff: "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100",
      btn: "bg-purple-600 hover:bg-purple-700 text-white",
      btnSoft: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-100",
      danger: "bg-red-50 text-red-600 border-red-100",
      ok: "bg-emerald-50 text-emerald-700 border-emerald-100",
      badge: "bg-gray-50 text-gray-700 border-gray-100",
    };
  }, [isDarkMode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to terms.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const result = await signUp(email.trim(), password, role, {
        full_name: fullName.trim(),
        phone: fullPhone,
        country: selectedCountry.code,
        region: region,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      const sessionExists = (result?.data as any)?.session != null;

      if (!sessionExists) {
        setInfo("Account created! Please check your email to confirm your account, then login.");
        setTimeout(() => navigate("/login", { replace: true }), 800);
        return;
      }

      if (role === "merchant") {
        navigate("/merchant/setup", { replace: true });
      } else {
        navigate("/dashboard/customer", { replace: true });
      }
    } catch (_err: any) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${ui.page} flex items-center justify-center p-6`} dir="ltr">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`w-full ${ui.card} rounded-[2.75rem] shadow-2xl border overflow-hidden`}>
          <div className={`p-8 md:p-10 border-b ${isDarkMode ? "border-slate-800" : "border-gray-100"} relative`}>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`absolute right-6 top-6 p-3 rounded-2xl transition-all ${ui.btnSoft}`}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl"
                style={{ backgroundColor: isDarkMode ? "#4F46E5" : "#7C3AED" }}
              >
                S
              </div>
              <div>
                <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Create account
                </h2>
                <p className={`mt-2 text-[10px] font-black uppercase tracking-[0.26em] ${ui.muted}`}>
                  Customer & Merchant • Unified onboarding
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {error && <div className={`p-4 rounded-2xl mb-6 text-xs font-bold border ${ui.danger}`}>{error}</div>}
            {info && <div className={`p-4 rounded-2xl mb-6 text-xs font-bold border ${ui.ok}`}>{info}</div>}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                    role === "customer" ? ui.chipOn : ui.chipOff
                  }`}
                >
                  <User size={18} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("merchant")}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                    role === "merchant" ? ui.chipOn : ui.chipOff
                  }`}
                >
                  <Store size={18} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Merchant</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Full name</label>
                  <input
                    required
                    placeholder="e.g. Ahmed Ali"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`mt-2 w-full px-5 py-4 rounded-2xl border outline-none font-bold focus:ring-4 ${ui.input}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Email</label>
                  <input
                    required
                    type="email"
                    placeholder="you@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-2 w-full px-5 py-4 rounded-2xl border outline-none font-bold focus:ring-4 ${ui.input}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-2 w-full px-5 py-4 rounded-2xl border outline-none font-bold focus:ring-4 ${ui.input}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Country</label>
                  <div className="mt-2 relative">
                    <Globe2
                      size={16}
                      className={`absolute left-5 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={`w-full pl-12 pr-5 py-4 rounded-2xl border outline-none font-black focus:ring-4 ${ui.input}`}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {flagEmoji(c.code)} {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className={`mt-2 w-full px-5 py-4 rounded-2xl border outline-none font-black focus:ring-4 ${ui.input}`}
                  >
                    <option value="">Select region</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Phone number</label>

                  <div className="mt-2 flex gap-3">
                    <div className={`flex items-center gap-2 px-4 py-4 rounded-2xl border ${ui.badge}`}>
                      <span className="text-lg">{flagEmoji(selectedCountry.code)}</span>
                      <span className="text-[12px] font-black tracking-widest">{selectedCountry.dial}</span>
                    </div>

                    <div className="flex-1 relative">
                      <PhoneIcon
                        size={16}
                        className={`absolute left-5 top-1/2 -translate-y-1/2 ${
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                      />
                      <input
                        required
                        inputMode="numeric"
                        placeholder="e.g. 5xxxxxxxx"
                        value={phoneLocal}
                        onChange={(e) => setPhoneLocal(normalizeDigits(e.target.value))}
                        className={`w-full pl-12 pr-5 py-4 rounded-2xl border outline-none font-bold focus:ring-4 ${ui.input}`}
                      />
                    </div>
                  </div>

                  <p className={`mt-2 text-[10px] font-bold ${ui.muted}`}>
                    We will store it as:{" "}
                    <span className={isDarkMode ? "text-slate-200" : "text-gray-700"}>{fullPhone || "-"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="agreed"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={isDarkMode ? "w-4 h-4 accent-indigo-600" : "w-4 h-4 accent-purple-600"}
                />
                <label htmlFor="agreed" className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>
                  I agree to terms and conditions
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreed}
                className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.28em] transition-all flex items-center justify-center gap-3 disabled:opacity-70 ${ui.btn}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    Create account <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className={`pt-1 text-center text-[11px] font-bold ${ui.muted}`}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={`underline underline-offset-4 ${isDarkMode ? "text-indigo-300" : "text-purple-600"}`}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className={`h-full ${ui.card2} rounded-[2.75rem] border shadow-2xl overflow-hidden`}>
            <div className={`p-8 border-b ${isDarkMode ? "border-slate-800" : "border-gray-100"}`}>
              <p className={`text-[10px] font-black uppercase tracking-[0.26em] ${ui.muted}`}>Live preview</p>
              <h3 className={`mt-2 text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Your profile card
              </h3>
            </div>

            <div className="p-8 space-y-6">
              <div
                className={`rounded-[2.25rem] border p-8 shadow-sm ${
                  isDarkMode ? "bg-slate-950/30 border-slate-800" : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Account type</p>
                    <div className="mt-2 inline-flex items-center gap-2">
                      <span
                        className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                          role === "merchant" ? ui.chipOn : ui.badge
                        }`}
                      >
                        {role}
                      </span>
                      <span
                        className={`px-4 py-2 rounded-2xl border ${ui.badge} text-[10px] font-black uppercase tracking-widest`}
                      >
                        {selectedCountry.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={18} />
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        isDarkMode ? "text-emerald-200" : "text-emerald-600"
                      }`}
                    >
                      Preview
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Name</p>
                  <p className={`mt-2 text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {fullName.trim() || "Your Name"}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className={`rounded-2xl border p-4 ${ui.badge}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Phone</p>
                    <p className={`mt-2 text-sm font-black ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                      {fullPhone || "-"}
                    </p>
                  </div>

                  <div className={`rounded-2xl border p-4 ${ui.badge}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Region</p>
                    <p className={`mt-2 text-sm font-black ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                      {region || "-"}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-6 rounded-2xl border p-4 flex items-center justify-between gap-3"
                  style={{ borderColor: isDarkMode ? "rgba(99,102,241,0.35)" : "rgba(124,58,237,0.25)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow"
                      style={{ backgroundColor: isDarkMode ? "#4F46E5" : "#7C3AED" }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Next step</p>
                      <p className={`text-sm font-black ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                        {role === "merchant" ? "Store setup" : "Customer dashboard"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={18} className={isDarkMode ? "text-indigo-300" : "text-purple-600"} />
                </div>
              </div>

              <div className={`rounded-[2.25rem] border p-7 ${ui.badge}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Tip</p>
                <p className={`mt-2 text-sm font-bold leading-relaxed ${ui.muted}`}>
                  Your country code is locked to your selection, so the stored phone is always consistent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
