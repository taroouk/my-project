import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import {
  Coins,
  Plus,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Pencil,
  X,
  Save,
} from "lucide-react";

type EarnSource = "orders" | "bookings" | "both";
type Lang = "en" | "ar";

type LoyaltyProgram = {
  id: string;
  merchant_id: string;
  name: string | null;
  earn_source: EarnSource | string | null;
  amount_per_point: number | null;
  currency_code: string | null;
  is_active: boolean | null;
  is_default?: boolean | null;
  created_at?: string | null;
};

type LoyaltyTier = {
  id: string;
  program_id: string;
  name: string | null;
  rank: number | null;
  points_threshold?: number | null;
};

type LoyaltyReward = {
  id: string;
  program_id: string;
  title: string | null;
  points_cost: number | null;
  is_active: boolean | null;
  type: string | null;
};

type Toast = { type: "success" | "error"; message: string } | null;

function normalizeEarnSource(v: any): EarnSource {
  if (v === "orders" || v === "bookings" || v === "both") return v;
  return "both";
}

function friendlyErrorMessage(err: any): string {
  const msg = err?.message || err?.error_description || err?.hint || "Unknown error";

  if (typeof msg === "string") {
    const lower = msg.toLowerCase();

    if (msg.includes("violates check constraint") && msg.includes("earn_source")) {
      return "Earn points from must be one of: orders, bookings, both.";
    }

    // DB schema mismatch: update function references updated_at but table doesn't have it
    if (lower.includes('column "updated_at"') && lower.includes('does not exist')) {
      return (
        "Database schema mismatch: loyalty_programs has no updated_at column. Fix by either (1) adding updated_at column, " +
        "or (2) editing update_loyalty_program() to not set updated_at."
      );
    }

    // Reward type is required
    if (lower.includes('relation "loyalty_rewards"') && lower.includes('column "type"') && lower.includes("not-null")) {
      return "Reward type is required. Please choose a type (discount / free_service / other).";
    }

    if (lower.includes("permission denied")) {
      return "Permission denied. Make sure authenticated has SELECT/INSERT/UPDATE/DELETE privileges + RLS policies.";
    }
  }

  return msg;
}


export default function MerchantLoyaltySettings() {
  // Same dashboard language convention
  const [lang, setLang] = useState<Lang>(() => {
    const v = (localStorage.getItem("servly_lang") || "en").toLowerCase();
    return v === "ar" ? "ar" : "en";
  });

  // keep in sync if dashboard changes it
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "servly_lang") {
        const v = (e.newValue || "en").toLowerCase();
        setLang(v === "ar" ? "ar" : "en");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const t = useMemo(() => {
    const dict: Record<Lang, Record<string, string>> = {
      en: {
        loyaltySettings: "Loyalty Settings",
        subtitle: "Create loyalty programs, tiers, and rewards. Customers will pick from your programs.",
        refresh: "Refresh",
        yourPrograms: "Your Programs",
        noPrograms: "No programs yet. Create your first one.",
        active: "Active",
        inactive: "Inactive",
        earn: "Earn",
        perPoint: "/ point",
        deleteProgram: "Delete program",
        edit: "Edit",
        cancel: "Cancel",
        save: "Save",
        createNewProgram: "Create new program",
        programName: "Program name",
        earnPointsFrom: "Earn points from",
        dbAllowsOnly: "DB allows only: orders, bookings, both.",
        amountPerPoint: "Amount per point",
        create: "Create",
        selectProgramFirst: "Select a program first.",
        tiers: "Tiers",
        tiersHint: "Define levels like Silver/Gold/Platinum. Rank decides order.",
        noTiers: "No tiers yet.",
        addTier: "Add tier",
        name: "Name",
        rank: "Rank",
        pointsThreshold: "Points threshold",
        add: "Add",
        rewards: "Rewards",
        rewardsHint: "Define what customers can redeem using points (discounts, free service, etc.).",
        noRewards: "No rewards yet.",
        addReward: "Add reward",
        title: "Title",
        pointsCost: "Points cost",
        rewardType: "Reward type",
        discount: "Discount",
        freeService: "Free service",
        gift: "Gift",
        other: "Other",
        confirmDeleteProgram:
          "Are you sure you want to delete this program?\nAll tiers and rewards will be deleted.",
        confirmDeleteTier: "Are you sure you want to delete this tier?",
        confirmDeleteReward: "Are you sure you want to delete this reward?",
        programUpdated: "Program updated",
        tierUpdated: "Tier updated",
        rewardUpdated: "Reward updated",
        tierDeleted: "Tier deleted",
        rewardDeleted: "Reward deleted",
        programDeleted: "Program deleted",
        tierAdded: "Tier added",
        rewardAdded: "Reward added",
        programCreated: "Program created",
        editProgram: "Edit selected program",
        saveChanges: "Save changes",
      },
      ar: {
        loyaltySettings: "إعدادات الولاء",
        subtitle: "أنشئ برامج الولاء والمستويات والمكافآت. العملاء سيختارون من برامجك.",
        refresh: "تحديث",
        yourPrograms: "برامجك",
        noPrograms: "لا توجد برامج بعد. أنشئ أول برنامج.",
        active: "مفعل",
        inactive: "غير مفعل",
        earn: "كسب",
        perPoint: "لكل نقطة",
        deleteProgram: "حذف البرنامج",
        edit: "تعديل",
        cancel: "إلغاء",
        save: "حفظ",
        createNewProgram: "إنشاء برنامج جديد",
        programName: "اسم البرنامج",
        earnPointsFrom: "كسب النقاط من",
        dbAllowsOnly: "قاعدة البيانات تسمح فقط: orders, bookings, both.",
        amountPerPoint: "المبلغ لكل نقطة",
        create: "إنشاء",
        selectProgramFirst: "اختر برنامج أولاً.",
        tiers: "المستويات",
        tiersHint: "عرّف مستويات مثل Silver/Gold/Platinum. الترتيب يحدد العرض.",
        noTiers: "لا توجد مستويات بعد.",
        addTier: "إضافة مستوى",
        name: "الاسم",
        rank: "الترتيب",
        pointsThreshold: "حد النقاط",
        add: "إضافة",
        rewards: "المكافآت",
        rewardsHint: "عرّف ما يمكن للعميل استبداله بالنقاط (خصومات، خدمة مجانية، إلخ).",
        noRewards: "لا توجد مكافآت بعد.",
        addReward: "إضافة مكافأة",
        title: "العنوان",
        pointsCost: "تكلفة النقاط",
        rewardType: "نوع المكافأة",
        discount: "خصم",
        freeService: "خدمة مجانية",
        gift: "هدية",
        other: "أخرى",
        confirmDeleteProgram: "هل أنت متأكد من حذف هذا البرنامج؟\nسيتم حذف المستويات والمكافآت التابعة له.",
        confirmDeleteTier: "هل أنت متأكد من حذف هذا المستوى؟",
        confirmDeleteReward: "هل أنت متأكد من حذف هذه المكافأة؟",
        programUpdated: "تم تعديل البرنامج",
        tierUpdated: "تم تعديل المستوى",
        rewardUpdated: "تم تعديل المكافأة",
        tierDeleted: "تم حذف المستوى",
        rewardDeleted: "تم حذف المكافأة",
        programDeleted: "تم حذف البرنامج",
        tierAdded: "تم إضافة المستوى",
        rewardAdded: "تم إضافة المكافأة",
        programCreated: "تم إنشاء البرنامج",
        editProgram: "تعديل البرنامج المختار",
        saveChanges: "حفظ التغييرات",
      },
    };

    // supports {var} without replaceAll (TS target safe)
    return (key: string, vars?: Record<string, any>) => {
      let out = dict[lang][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.split(`{${k}}`).join(String(v));
        }
      }
      return out;
    };
  }, [lang]);

  const isRTL = lang === "ar";

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) ?? null,
    [programs, selectedProgramId]
  );

  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);

  // Create Program form (unchanged)
  const [newProgramName, setNewProgramName] = useState("My Loyalty Program");
  const [newEarnSource, setNewEarnSource] = useState<EarnSource>("both");
  const [newAmountPerPoint, setNewAmountPerPoint] = useState<number>(10);
  const [newProgramActive, setNewProgramActive] = useState(true);

  // Edit Program (new, does not affect create)
  const [editProgramOpen, setEditProgramOpen] = useState(false);
  const [editProgramName, setEditProgramName] = useState("");
  const [editEarnSource, setEditEarnSource] = useState<EarnSource>("both");
  const [editAmountPerPoint, setEditAmountPerPoint] = useState<number>(10);
  const [editProgramActive, setEditProgramActive] = useState(true);

  // Add Tier form (unchanged)
  const [tierName, setTierName] = useState("Silver");
  const [tierRank, setTierRank] = useState<number>(1);
  const [tierThreshold, setTierThreshold] = useState<number>(0);

  // Edit Tier
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingTierName, setEditingTierName] = useState("");
  const [editingTierRank, setEditingTierRank] = useState<number>(1);
  const [editingTierThreshold, setEditingTierThreshold] = useState<number>(0);

  // Add Reward form (unchanged)
  const [rewardTitle, setRewardTitle] = useState("EGP 50 Discount");
  const [rewardType, setRewardType] = useState<string>("discount");
  const [rewardCost, setRewardCost] = useState<number>(500);
  const [rewardActive, setRewardActive] = useState(true);

  // Edit Reward
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editingRewardTitle, setEditingRewardTitle] = useState("");
  const [editingRewardType, setEditingRewardType] = useState<string>("discount");
  const [editingRewardCost, setEditingRewardCost] = useState<number>(1);
  const [editingRewardActive, setEditingRewardActive] = useState(true);

  function showToast(tw: Toast) {
    setToast(tw);
    if (tw) setTimeout(() => setToast(null), 3500);
  }

  const earnSourceLabel = (v: EarnSource) => {
    if (v === "orders") return lang === "ar" ? "طلبات فقط" : "Orders only";
    if (v === "bookings") return lang === "ar" ? "حجوزات فقط" : "Bookings only";
    return lang === "ar" ? "طلبات + حجوزات" : "Orders + Bookings";
  };

  async function loadPrograms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const list = ((data ?? []) as LoyaltyProgram[]).map((p) => ({
        ...p,
        earn_source: normalizeEarnSource(p.earn_source),
      }));

      setPrograms(list);

      if (!selectedProgramId && list.length > 0) {
        setSelectedProgramId(list[0].id);
      } else if (selectedProgramId && !list.some((p) => p.id === selectedProgramId)) {
        setSelectedProgramId(list[0]?.id ?? null);
      }
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to load programs" });
    } finally {
      setLoading(false);
    }
  }

  async function loadProgramDetails(programId: string) {
    setLoading(true);
    try {
      const tiersRes = await supabase
        .from("loyalty_tiers")
        .select("*")
        .eq("program_id", programId)
        .order("rank", { ascending: true });

      if (tiersRes.error) throw tiersRes.error;

      const rewardsRes = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("program_id", programId)
        .order("points_cost", { ascending: true });

      if (rewardsRes.error) throw rewardsRes.error;

      setTiers((tiersRes.data ?? []) as LoyaltyTier[]);
      setRewards((rewardsRes.data ?? []) as LoyaltyReward[]);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to load program details" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      loadProgramDetails(selectedProgramId);
    } else {
      setTiers([]);
      setRewards([]);
    }
    setEditingTierId(null);
    setEditingRewardId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  // When selecting program, prepare edit defaults (no UI change unless edit opened)
  useEffect(() => {
    if (!selectedProgram) {
      setEditProgramOpen(false);
      return;
    }
    setEditProgramName(selectedProgram.name ?? "");
    setEditEarnSource(normalizeEarnSource(selectedProgram.earn_source));
    setEditAmountPerPoint(Number(selectedProgram.amount_per_point ?? 10));
    setEditProgramActive(Boolean(selectedProgram.is_active));
  }, [selectedProgram]);

  function validateCreateProgram(): string | null {
    const name = newProgramName.trim();
    if (!name) return lang === "ar" ? "اسم البرنامج مطلوب." : "Program name is required.";
    if (name.length < 2) return lang === "ar" ? "اسم البرنامج قصير جدًا." : "Program name is too short.";
    if (!Number.isFinite(newAmountPerPoint) || newAmountPerPoint <= 0) {
      return lang === "ar" ? "المبلغ لكل نقطة يجب أن يكون رقمًا موجبًا." : "Amount per point must be a positive number.";
    }
    return null;
  }

  async function onCreateProgram() {
    const v = validateCreateProgram();
    if (v) {
      showToast({ type: "error", message: v });
      return;
    }

    setLoading(true);
    try {
      // Currency removed from UI; keep constant to satisfy DB column if NOT NULL
      const currencyCode = "EGP";

      const res = await supabase.rpc("create_loyalty_program", {
        p_name: newProgramName.trim(),
        p_earn_source: newEarnSource,
        p_amount_per_point: newAmountPerPoint,
        p_currency_code: currencyCode,
        p_is_active: newProgramActive,
        p_is_default: false,
      });

      if (res.error) {
        // fallback if your RPC doesn't accept p_is_default
        const fallback = await supabase.rpc("create_loyalty_program", {
          p_name: newProgramName.trim(),
          p_earn_source: newEarnSource,
          p_amount_per_point: newAmountPerPoint,
          p_currency_code: currencyCode,
          p_is_active: newProgramActive,
        } as any);

        if (fallback.error) throw fallback.error;

        showToast({ type: "success", message: t("programCreated") });
        await loadPrograms();

        const newId = fallback.data as string | null;
        if (newId) setSelectedProgramId(newId);
        return;
      }

      showToast({ type: "success", message: t("programCreated") });
      await loadPrograms();

      const newId = res.data as string | null;
      if (newId) setSelectedProgramId(newId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to create program" });
    } finally {
      setLoading(false);
    }
  }

  async function onUpdateProgram() {
    if (!selectedProgramId) return;

    const name = editProgramName.trim();
    if (!name) {
      showToast({ type: "error", message: lang === "ar" ? "اسم البرنامج مطلوب." : "Program name is required." });
      return;
    }
    if (!Number.isFinite(editAmountPerPoint) || editAmountPerPoint <= 0) {
      showToast({
        type: "error",
        message: lang === "ar" ? "المبلغ لكل نقطة يجب أن يكون رقمًا موجبًا." : "Amount per point must be a positive number.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("update_loyalty_program", {
        p_program_id: selectedProgramId,
        p_name: name,
        p_earn_source: editEarnSource,
        p_amount_per_point: editAmountPerPoint,
        p_is_active: editProgramActive,
      });

      if (error) throw error;

      showToast({ type: "success", message: t("programUpdated") });
      setEditProgramOpen(false);
      await loadPrograms();
      await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to update program" });
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteProgram(programId: string) {
    const ok = window.confirm(t("confirmDeleteProgram"));
    if (!ok) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_loyalty_program", {
        p_program_id: programId,
      });

      if (error) throw error;

      showToast({ type: "success", message: t("programDeleted") });

      await loadPrograms();

      if (selectedProgramId === programId) {
        setSelectedProgramId(null);
        setTiers([]);
        setRewards([]);
      }
    } catch (e: any) {
      showToast({
        type: "error",
        message: friendlyErrorMessage(e) || "Failed to delete program",
      });
    } finally {
      setLoading(false);
    }
  }

  function validateTier(): string | null {
    if (!selectedProgramId) return t("selectProgramFirst");
    const n = tierName.trim();
    if (!n) return lang === "ar" ? "اسم المستوى مطلوب." : "Tier name is required.";
    if (!Number.isFinite(tierRank) || tierRank <= 0) return lang === "ar" ? "ترتيب المستوى يجب أن يكون >= 1." : "Tier rank must be >= 1.";
    if (!Number.isFinite(tierThreshold) || tierThreshold < 0)
      return lang === "ar" ? "حد النقاط يجب أن يكون >= 0." : "Points threshold must be >= 0.";
    return null;
  }

  async function onAddTier() {
    const v = validateTier();
    if (v) {
      showToast({ type: "error", message: v });
      return;
    }
    if (!selectedProgramId) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("add_loyalty_tier", {
        p_program_id: selectedProgramId,
        p_name: tierName.trim(),
        p_rank: tierRank,
        p_points_threshold: tierThreshold,
      });

      if (error) throw error;

      showToast({ type: "success", message: t("tierAdded") });
      await loadProgramDetails(selectedProgramId);

      setTierRank((prev) => prev + 1);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to add tier" });
    } finally {
      setLoading(false);
    }
  }

  function startEditTier(tier: LoyaltyTier) {
    setEditingTierId(tier.id);
    setEditingTierName(tier.name ?? "");
    setEditingTierRank(Number(tier.rank ?? 1));
    setEditingTierThreshold(Number((tier as any).points_threshold ?? 0));
  }

  async function onUpdateTier() {
    if (!editingTierId) return;

    const name = editingTierName.trim();
    if (!name) {
      showToast({ type: "error", message: lang === "ar" ? "اسم المستوى مطلوب." : "Tier name is required." });
      return;
    }
    if (!Number.isFinite(editingTierRank) || editingTierRank <= 0) {
      showToast({ type: "error", message: lang === "ar" ? "ترتيب المستوى يجب أن يكون >= 1." : "Tier rank must be >= 1." });
      return;
    }
    if (!Number.isFinite(editingTierThreshold) || editingTierThreshold < 0) {
      showToast({ type: "error", message: lang === "ar" ? "حد النقاط يجب أن يكون >= 0." : "Points threshold must be >= 0." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("update_loyalty_tier", {
        p_tier_id: editingTierId,
        p_name: name,
        p_rank: editingTierRank,
        p_points_threshold: editingTierThreshold,
      });

      if (error) throw error;

      showToast({ type: "success", message: t("tierUpdated") });
      setEditingTierId(null);
      if (selectedProgramId) await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to update tier" });
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteTier(tierId: string) {
    const ok = window.confirm(t("confirmDeleteTier"));
    if (!ok) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_loyalty_tier", {
        p_tier_id: tierId,
      });

      if (error) throw error;

      showToast({ type: "success", message: t("tierDeleted") });
      setEditingTierId(null);
      if (selectedProgramId) await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to delete tier" });
    } finally {
      setLoading(false);
    }
  }

  function validateReward(): string | null {
    if (!selectedProgramId) return t("selectProgramFirst");
    const rt = rewardTitle.trim();
    if (!rt) return lang === "ar" ? "عنوان المكافأة مطلوب." : "Reward title is required.";
    if (!Number.isFinite(rewardCost) || rewardCost <= 0)
      return lang === "ar" ? "تكلفة النقاط يجب أن تكون رقمًا موجبًا." : "Points cost must be a positive number.";
    if (!rewardType) return lang === "ar" ? "نوع المكافأة مطلوب." : "Reward type is required.";
    return null;
  }

  async function onAddReward() {
    const v = validateReward();
    if (v) {
      showToast({ type: "error", message: v });
      return;
    }
    if (!selectedProgramId) return;

    setLoading(true);
    try {
      // Try safe RPC first (security definer).
      let res = await supabase.rpc("add_loyalty_reward", {
        p_program_id: selectedProgramId,
        p_title: rewardTitle.trim(),
        p_points_cost: rewardCost,
        p_is_active: rewardActive,
        // reward type is required in DB (loyalty_rewards.type)
        p_type: rewardType || "discount",
      } as any);

      // If your RPC does not accept p_type, fallback to direct insert (requires RLS permissions).
      if (res.error && String(res.error.message || "").toLowerCase().includes("function") && String(res.error.message || "").toLowerCase().includes("does not exist")) {
        res = await supabase.from("loyalty_rewards").insert({
          program_id: selectedProgramId,
          title: rewardTitle.trim(),
          points_cost: rewardCost,
          is_active: rewardActive,
          type: rewardType || "discount",
        } as any);
      }

      if (res.error) throw res.error;


      showToast({ type: "success", message: t("rewardAdded") });
      await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to add reward" });
    } finally {
      setLoading(false);
    }
  }

  function startEditReward(r: LoyaltyReward) {
    setEditingRewardId(r.id);
    setEditingRewardTitle(r.title ?? "");
    setEditingRewardType((r as any).type ?? "discount");
    setEditingRewardCost(Number(r.points_cost ?? 1));
    setEditingRewardActive(Boolean(r.is_active));
  }

  async function onUpdateReward() {
    if (!editingRewardId) return;

    const title = editingRewardTitle.trim();
    if (!title) {
      showToast({ type: "error", message: lang === "ar" ? "عنوان المكافأة مطلوب." : "Reward title is required." });
      return;
    }
    if (!Number.isFinite(editingRewardCost) || editingRewardCost <= 0) {
      showToast({
        type: "error",
        message: lang === "ar" ? "تكلفة النقاط يجب أن تكون رقمًا موجبًا." : "Points cost must be a positive number.",
      });
      return;
    }

    setLoading(true);
    try {
      // Try safe RPC first (security definer).
      let res = await supabase.rpc("update_loyalty_reward", {
        p_reward_id: editingRewardId,
        p_title: title,
        p_points_cost: editingRewardCost,
        p_is_active: editingRewardActive,
        p_type: editingRewardType || "discount",
      } as any);

      // If your RPC does not accept p_type, fallback to direct update (requires RLS permissions).
      if (res.error && String(res.error.message || "").toLowerCase().includes("function") && String(res.error.message || "").toLowerCase().includes("does not exist")) {
        res = await supabase
          .from("loyalty_rewards")
          .update({
            title,
            points_cost: editingRewardCost,
            is_active: editingRewardActive,
            type: editingRewardType || "discount",
          } as any)
          .eq("id", editingRewardId);
      }

      if (res.error) throw res.error;

      showToast({ type: "success", message: t("rewardUpdated") });
      setEditingRewardId(null);
      if (selectedProgramId) await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to update reward" });
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteReward(rewardId: string) {
    const ok = window.confirm(t("confirmDeleteReward"));
    if (!ok) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_loyalty_reward", {
        p_reward_id: rewardId,
      });

      if (error) throw error;

      showToast({ type: "success", message: t("rewardDeleted") });
      setEditingRewardId(null);
      if (selectedProgramId) await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: friendlyErrorMessage(e) || "Failed to delete reward" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Coins className="h-6 w-6" />
            {t("loyaltySettings")}
          </h1>
          <p className="text-sm opacity-80 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPrograms()}
            className="px-3 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4" />
            {t("refresh")}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`mt-4 p-3 rounded-lg border flex items-start gap-2 ${
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 mt-0.5" />
          )}
          <div className="text-sm">{toast.message}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* LEFT: Programs list + create */}
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">{t("yourPrograms")}</h2>

          <div className="mt-3 space-y-2">
            {programs.length === 0 && <div className="text-sm opacity-70">{t("noPrograms")}</div>}

            {programs.map((p) => {
              const es = normalizeEarnSource(p.earn_source);
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg border ${
                    selectedProgramId === p.id
                      ? "border-black/40 dark:border-white/40"
                      : "border-black/10 dark:border-white/10"
                  }`}
                >
                  <button onClick={() => setSelectedProgramId(p.id)} className="w-full text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{p.name ?? "Untitled Program"}</div>
                      <div className="text-xs opacity-70">{p.is_active ? t("active") : t("inactive")}</div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {t("earn")}: {earnSourceLabel(es)} • {p.amount_per_point ?? "-"} {t("perPoint")}
                    </div>
                  </button>

                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedProgramId(p.id);
                        setEditProgramOpen(true);
                      }}
                      className="text-xs hover:underline inline-flex items-center gap-1"
                      disabled={loading}
                      title={t("edit")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t("edit")}
                    </button>

                    <button
                      onClick={() => onDeleteProgram(p.id)}
                      className="text-xs text-red-500 hover:underline inline-flex items-center gap-1"
                      disabled={loading}
                      title={t("deleteProgram")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("deleteProgram")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit selected program (new) */}
          {selectedProgram && editProgramOpen && (
            <div className="mt-5 pt-4 border-t">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">{t("editProgram")}</h3>
                <button
                  onClick={() => setEditProgramOpen(false)}
                  className="text-xs hover:underline inline-flex items-center gap-1 opacity-80"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("cancel")}
                </button>
              </div>

              <label className="block text-xs opacity-70 mt-3">{t("programName")}</label>
              <input
                value={editProgramName}
                onChange={(e) => setEditProgramName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
              />

              <label className="block text-xs opacity-70 mt-3">{t("earnPointsFrom")}</label>
              <select
                value={editEarnSource}
                onChange={(e) => setEditEarnSource(e.target.value as EarnSource)}
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
              >
                <option value="orders">{lang === "ar" ? "طلبات فقط" : "Orders only"}</option>
                <option value="bookings">{lang === "ar" ? "حجوزات فقط" : "Bookings only"}</option>
                <option value="both">{lang === "ar" ? "طلبات + حجوزات" : "Orders + Bookings"}</option>
              </select>
              <p className="text-[11px] opacity-60 mt-1">{t("dbAllowsOnly")}</p>

              <label className="block text-xs opacity-70 mt-3">{t("amountPerPoint")}</label>
              <input
                type="number"
                value={editAmountPerPoint}
                onChange={(e) => setEditAmountPerPoint(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                min={1}
                step="1"
              />

              <label className="flex items-center gap-2 mt-3 text-sm">
                <input
                  type="checkbox"
                  checked={editProgramActive}
                  onChange={(e) => setEditProgramActive(e.target.checked)}
                />
                {t("active")}
              </label>

              <button
                onClick={onUpdateProgram}
                disabled={loading}
                className="mt-4 w-full px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {t("saveChanges")}
              </button>
            </div>
          )}

          {/* Create section (kept same) */}
          <div className="mt-5 pt-4 border-t">
            <h3 className="font-semibold text-sm">{t("createNewProgram")}</h3>

            <label className="block text-xs opacity-70 mt-3">{t("programName")}</label>
            <input
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
              placeholder="e.g. VIP Points"
            />

            <label className="block text-xs opacity-70 mt-3">{t("earnPointsFrom")}</label>
            <select
              value={newEarnSource}
              onChange={(e) => setNewEarnSource(e.target.value as EarnSource)}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
            >
              <option value="orders">{lang === "ar" ? "طلبات فقط" : "Orders only"}</option>
              <option value="bookings">{lang === "ar" ? "حجوزات فقط" : "Bookings only"}</option>
              <option value="both">{lang === "ar" ? "طلبات + حجوزات" : "Orders + Bookings"}</option>
            </select>
            <p className="text-[11px] opacity-60 mt-1">{t("dbAllowsOnly")}</p>

            <label className="block text-xs opacity-70 mt-3">{t("amountPerPoint")}</label>
            <input
              type="number"
              value={newAmountPerPoint}
              onChange={(e) => setNewAmountPerPoint(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
              min={1}
              step="1"
            />

            <label className="flex items-center gap-2 mt-3 text-sm">
              <input
                type="checkbox"
                checked={newProgramActive}
                onChange={(e) => setNewProgramActive(e.target.checked)}
              />
              {t("active")}
            </label>

            <button
              onClick={onCreateProgram}
              disabled={loading}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("create")}
            </button>
          </div>
        </div>

        {/* MIDDLE: Tiers */}
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">{t("tiers")}</h2>
          <p className="text-xs opacity-70 mt-1">{t("tiersHint")}</p>

          {!selectedProgram ? (
            <div className="mt-4 text-sm opacity-70">{t("selectProgramFirst")}</div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {tiers.length === 0 && <div className="text-sm opacity-70">{t("noTiers")}</div>}
                {tiers.map((tier) => {
                  const isEditing = editingTierId === tier.id;
                  return (
                    <div key={tier.id} className="p-3 rounded-lg border">
                      {!isEditing ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{tier.name ?? "Tier"}</div>
                            <div className="text-xs opacity-70">
                              {t("rank")}: {tier.rank ?? "-"}
                            </div>
                          </div>
                          {"points_threshold" in tier && (
                            <div className="text-xs opacity-70 mt-1">
                              {t("pointsThreshold")}: {(tier as any).points_threshold ?? 0}
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => startEditTier(tier)}
                              className="text-xs hover:underline inline-flex items-center gap-1"
                              disabled={loading}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {t("edit")}
                            </button>
                            <button
                              onClick={() => onDeleteTier(tier.id)}
                              className="text-xs text-red-500 hover:underline inline-flex items-center gap-1"
                              disabled={loading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {lang === "ar" ? "حذف" : "Delete"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs opacity-70">{t("name")}</label>
                              <input
                                value={editingTierName}
                                onChange={(e) => setEditingTierName(e.target.value)}
                                className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs opacity-70">{t("rank")}</label>
                              <input
                                type="number"
                                value={editingTierRank}
                                onChange={(e) => setEditingTierRank(Number(e.target.value))}
                                className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                                min={1}
                                step="1"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs opacity-70">{t("pointsThreshold")}</label>
                              <input
                                type="number"
                                value={editingTierThreshold}
                                onChange={(e) => setEditingTierThreshold(Number(e.target.value))}
                                className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                                min={0}
                                step="1"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={onUpdateTier}
                              className="text-xs hover:underline inline-flex items-center gap-1"
                              disabled={loading}
                            >
                              <Save className="h-3.5 w-3.5" />
                              {t("save")}
                            </button>
                            <button
                              onClick={() => setEditingTierId(null)}
                              className="text-xs hover:underline inline-flex items-center gap-1 opacity-80"
                              disabled={loading}
                            >
                              <X className="h-3.5 w-3.5" />
                              {t("cancel")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t">
                <h3 className="font-semibold text-sm">{t("addTier")}</h3>

                <label className="block text-xs opacity-70 mt-3">{t("name")}</label>
                <input
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                  placeholder="Silver"
                />

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs opacity-70">{t("rank")}</label>
                    <input
                      type="number"
                      value={tierRank}
                      onChange={(e) => setTierRank(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                      min={1}
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs opacity-70">{t("pointsThreshold")}</label>
                    <input
                      type="number"
                      value={tierThreshold}
                      onChange={(e) => setTierThreshold(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                      min={0}
                      step="1"
                    />
                  </div>
                </div>

                <button
                  onClick={onAddTier}
                  disabled={loading}
                  className="mt-4 w-full px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t("add")}
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Rewards */}
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">{t("rewards")}</h2>
          <p className="text-xs opacity-70 mt-1">{t("rewardsHint")}</p>

          {!selectedProgram ? (
            <div className="mt-4 text-sm opacity-70">{t("selectProgramFirst")}</div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {rewards.length === 0 && <div className="text-sm opacity-70">{t("noRewards")}</div>}
                {rewards.map((r) => {
                  const isEditing = editingRewardId === r.id;
                  return (
                    <div key={r.id} className="p-3 rounded-lg border">
                      {!isEditing ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{r.title ?? "Reward"}</div>
                            <div className="text-xs opacity-70">{r.is_active ? t("active") : t("inactive")}</div>
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {t("pointsCost")}: {r.points_cost ?? 0}
                          </div>

                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => startEditReward(r)}
                              className="text-xs hover:underline inline-flex items-center gap-1"
                              disabled={loading}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {t("edit")}
                            </button>
                            <button
                              onClick={() => onDeleteReward(r.id)}
                              className="text-xs text-red-500 hover:underline inline-flex items-center gap-1"
                              disabled={loading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {lang === "ar" ? "حذف" : "Delete"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="block text-xs opacity-70">{t("title")}</label>
                          <input
                            value={editingRewardTitle}
                            onChange={(e) => setEditingRewardTitle(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                          />

                          <label className="block text-xs opacity-70 mt-3">{t("pointsCost")}</label>
                          <input
                            type="number"
                            value={editingRewardCost}
                            onChange={(e) => setEditingRewardCost(Number(e.target.value))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                            min={1}
                            step="1"
                          />

                          <label className="flex items-center gap-2 mt-3 text-sm">
                            <input
                              type="checkbox"
                              checked={editingRewardActive}
                              onChange={(e) => setEditingRewardActive(e.target.checked)}
                            />
                            {t("active")}
                          </label>

                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={onUpdateReward}
                              className="text-xs hover:underline inline-flex items-center gap-1"
                              disabled={loading}
                            >
                              <Save className="h-3.5 w-3.5" />
                              {t("save")}
                            </button>
                            <button
                              onClick={() => setEditingRewardId(null)}
                              className="text-xs hover:underline inline-flex items-center gap-1 opacity-80"
                              disabled={loading}
                            >
                              <X className="h-3.5 w-3.5" />
                              {t("cancel")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t">
                <h3 className="font-semibold text-sm">{t("addReward")}</h3>

                <label className="block text-xs opacity-70 mt-3">{t("title")}</label>
                <input
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                  placeholder="EGP 50 Discount"
                />

                 <label className="block text-xs opacity-70 mt-3">{t("rewardType")}</label>
                 <select
                   value={rewardType}
                   onChange={(e) => setRewardType(e.target.value)}
                   className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                 >
                   <option value="discount">{t("discount")}</option>
                   <option value="free_service">{t("freeService")}</option>
                   <option value="gift">{t("gift")}</option>
                   <option value="other">{t("other")}</option>
                 </select>

                <label className="block text-xs opacity-70 mt-3">{t("pointsCost")}</label>
                <input
                  type="number"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                  min={1}
                  step="1"
                />

                <label className="flex items-center gap-2 mt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={rewardActive}
                    onChange={(e) => setRewardActive(e.target.checked)}
                  />
                  {t("active")}
                </label>

                <button
                  onClick={onAddReward}
                  disabled={loading}
                  className="mt-4 w-full px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t("add")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}