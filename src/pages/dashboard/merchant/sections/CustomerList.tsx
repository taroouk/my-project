// === CustomerList.tsx (UPDATED) ===
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useMerchantLang } from "../../../dashboard/merchant/useMerchantLang";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase } from "../../../../lib/supabaseClient";
import { Search, RefreshCcw } from "lucide-react";

type DBUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  loyalty_points?: number | null;
};

type CustomerRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  total_bookings: number;
  last_visit: string | null;
};

export default function CustomerList() {
  const { user } = useAuth() as any;
  const { isDarkMode } = useTheme();
  const { t, dir } = useMerchantLang();

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: "min-h-screen bg-[#0B1220] text-slate-100",
        card: "bg-slate-950/40 border border-slate-900/60 rounded-3xl",
        muted: "text-slate-400",
        title: "text-slate-50",
        input:
          "w-full bg-slate-950/30 border border-slate-900/60 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40",
        btn: "rounded-2xl font-black text-xs uppercase tracking-widest px-5 py-3 transition",
        btnGhost: "bg-slate-900/30 border border-slate-800 text-slate-200 hover:bg-slate-900/50",
        tableWrap: "border border-slate-900/60 rounded-3xl overflow-hidden",
        th: "bg-slate-950/50 text-slate-200",
        tr: "border-slate-900/60",
      };
    }
    return {
      page: "min-h-screen bg-[#F8FAFC] text-slate-900",
      card: "bg-white border border-slate-100 rounded-3xl shadow-sm",
      muted: "text-slate-500",
      title: "text-slate-900",
      input:
        "w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20",
      btn: "rounded-2xl font-black text-xs uppercase tracking-widest px-5 py-3 transition",
      btnGhost: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
      tableWrap: "border border-slate-100 rounded-3xl overflow-hidden bg-white",
      th: "bg-slate-50 text-slate-700",
      tr: "border-slate-100",
    };
  }, [isDarkMode]);

  const fetchCRM = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          merchant_id,
          customer_id,
          status,
          created_at,
          customer:users!bookings_customer_id_fkey (
            id,
            full_name,
            email,
            phone,
            role,
            loyalty_points
          )
        `
        )
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const agg: Record<
        string,
        {
          user: DBUser;
          total: number;
          last: string | null;
        }
      > = {};

      for (const r of (bookingsData || []) as any[]) {
        const cid = r.customer_id as string | null;
        const cu: DBUser | null = r.customer ?? null; // alias customer من join
        if (!cid) continue;

        // إذا الـ RLS مخفية بيانات العميل (customer null) هنكمل برقم الـ customer_id علشان الداتا تبان
        const safeCustomer: DBUser =
          cu ||
          ({
            id: cid,
            email: null,
            full_name: `Customer ${String(cid).slice(0, 6)}`,
            phone: null,
            role: "customer",
            loyalty_points: 0,
          } as DBUser);

        // لو عندنا role فعلاً ومش customer، ساعتها بس نتجاهل
        if (cu && cu.role !== "customer") continue;

        if (!agg[cid]) {
          agg[cid] = { user: safeCustomer, total: 0, last: null };
        }

        agg[cid].total += 1;
        const created = r.created_at as string | null;
        if (created) {
          if (!agg[cid].last) agg[cid].last = created;
          else if (new Date(created) > new Date(agg[cid].last!)) agg[cid].last = created;
        }
      }

      const list: CustomerRow[] = Object.values(agg)
        .map(({ user: cu, total, last }) => ({
          id: cu.id,
          full_name: (cu.full_name || t("Customer", "عميل")) as any,
          email: cu.email || "",
          phone: cu.phone || "",
          loyalty_points: Number(cu.loyalty_points || 0),
          total_bookings: total,
          last_visit: last,
        }))
        .sort((a, b) => new Date(b.last_visit || 0 as any).getTime() - new Date(a.last_visit || 0 as any).getTime());

      setRows(list);
    } catch (err: any) {
      console.error("fetchCRM error:", err?.message || err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    if (!qn) return rows;
    return rows.filter((r) => {
      const hay = [r.full_name, r.email, r.phone, r.id].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(qn);
    });
  }, [rows, q]);

  return (
    <div className={ui.page} dir={dir}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className={`${ui.card} p-6`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className={`text-2xl font-black ${ui.title}`}>{t("Customers", "العملاء")}</h2>
              <p className={`mt-1 text-sm ${ui.muted}`}>
                {t("Your customers list based on bookings.", "قائمة العملاء بناءً على الحجوزات.")}
              </p>
            </div>

            <button onClick={fetchCRM} className={`${ui.btn} ${ui.btnGhost}`}>
              <span className="inline-flex items-center gap-2">
                <RefreshCcw size={16} />
                {t("Refresh", "تحديث")}
              </span>
            </button>
          </div>

          <div className="mt-6 relative">
            <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${ui.muted}`} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${ui.input} pl-11`}
              placeholder={t("Search customers...", "ابحث في العملاء...")}
            />
          </div>
        </div>

        <div className={ui.tableWrap}>
          <table className="w-full text-sm">
            <thead className={ui.th}>
              <tr>
                <th className="text-left px-4 py-3">{t("Name", "الاسم")}</th>
                <th className="text-left px-4 py-3">{t("Email", "البريد")}</th>
                <th className="text-left px-4 py-3">{t("Phone", "الهاتف")}</th>
                <th className="text-left px-4 py-3">{t("Points", "النقاط")}</th>
                <th className="text-left px-4 py-3">{t("Bookings", "الحجوزات")}</th>
                <th className="text-left px-4 py-3">{t("Last visit", "آخر زيارة")}</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className={`border-t ${ui.tr}`}>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-3">
                      <div className="w-5 h-5 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className={`text-xs font-black uppercase tracking-widest ${ui.muted}`}>
                        {t("Loading...", "جاري التحميل...")}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr className={`border-t ${ui.tr}`}>
                  <td colSpan={6} className={`px-4 py-10 text-center ${ui.muted}`}>
                    {t("No customers found.", "لا يوجد عملاء.")}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className={`border-t ${ui.tr}`}>
                    <td className="px-4 py-3 font-black">{c.full_name}</td>
                    <td className="px-4 py-3">{c.email || "-"}</td>
                    <td className="px-4 py-3">{c.phone || "-"}</td>
                    <td className="px-4 py-3 font-black">{c.loyalty_points}</td>
                    <td className="px-4 py-3">{c.total_bookings}</td>
                    <td className="px-4 py-3">{c.last_visit ? new Date(c.last_visit).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
