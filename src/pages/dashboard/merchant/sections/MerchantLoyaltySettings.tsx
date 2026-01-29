import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Coins, Plus, RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";

type LoyaltyProgram = {
  id: string;
  merchant_id: string;
  name: string | null;
  earn_source: string | null; // 'amount' | 'order' | 'booking' ...
  amount_per_point: number | null;
  currency_code: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  // optional: لو انت ضفته
  is_default?: boolean | null;
};

type LoyaltyTier = {
  id: string;
  program_id: string;
  name: string | null;
  rank: number | null;
  points_threshold?: number | null; // optional column
};

type LoyaltyReward = {
  id: string;
  program_id: string;
  title: string | null;
  points_cost: number | null;
  is_active: boolean | null;
};

type Toast = { type: "success" | "error"; message: string } | null;

export default function MerchantLoyaltySettings() {
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

  // Create Program form
  const [newProgramName, setNewProgramName] = useState("My Loyalty Program");
  const [newEarnSource, setNewEarnSource] = useState<"orders" | "bookings" | "both">("both");
  const [newAmountPerPoint, setNewAmountPerPoint] = useState<number>(10);
  const [newOrdersAmountPerPoint, setNewOrdersAmountPerPoint] = useState<number>(10);
  const [newBookingsAmountPerPoint, setNewBookingsAmountPerPoint] = useState<number>(10);
  const [newProgramActive, setNewProgramActive] = useState(true);

  // Add Tier form
  const [tierName, setTierName] = useState("Silver");
  const [tierRank, setTierRank] = useState<number>(1);
  const [tierThreshold, setTierThreshold] = useState<number>(0);

  // Add Reward form
  const [rewardTitle, setRewardTitle] = useState("EGP 50 Discount");
  const [rewardCost, setRewardCost] = useState<number>(500);
  const [rewardActive, setRewardActive] = useState(true);

  function showToast(t: Toast) {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 3500);
  }

  async function loadPrograms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("loyalty_programs")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const list = (data ?? []) as LoyaltyProgram[];
      setPrograms(list);

      // auto select first
      if (!selectedProgramId && list.length > 0) {
        setSelectedProgramId(list[0].id);
      } else if (selectedProgramId && !list.some((p) => p.id === selectedProgramId)) {
        setSelectedProgramId(list[0]?.id ?? null);
      }
    } catch (e: any) {
      showToast({ type: "error", message: e?.message ?? "Failed to load programs" });
    } finally {
      setLoading(false);
    }
  }

  async function loadProgramDetails(programId: string) {
    setLoading(true);
    try {
      // tiers
      const tiersRes = await supabase
        .from("loyalty_tiers")
        .select("*")
        .eq("program_id", programId)
        .order("rank", { ascending: true });

      if (tiersRes.error) throw tiersRes.error;

      // rewards
      const rewardsRes = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("program_id", programId)
        .order("points_cost", { ascending: true });

      if (rewardsRes.error) throw rewardsRes.error;

      setTiers((tiersRes.data ?? []) as LoyaltyTier[]);
      setRewards((rewardsRes.data ?? []) as LoyaltyReward[]);
    } catch (e: any) {
      showToast({ type: "error", message: e?.message ?? "Failed to load program details" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  async function onCreateProgram() {
    setLoading(true);
    try {
      // RPC: create_loyalty_program
      const { data, error } = await supabase.rpc("create_loyalty_program", {
        p_name: newProgramName,
        p_earn_source: newEarnSource,
        p_amount_per_point: newEarnSource === "both" ? (newOrdersAmountPerPoint || newBookingsAmountPerPoint || newAmountPerPoint) : newAmountPerPoint,
        p_is_active: newProgramActive,
        p_is_default: false, // لو العمود موجود، تمام. لو مش موجود في DB عندك، هنشيل السطر ده.
      });

      // لو DB ما فيهاش is_default و الـ RPC متسجل من غيره، هيرجع error هنا
      if (error) {
        // fallback: جرّب بدون is_default لو الـ function signature عندك مختلف
        const fallback = await supabase.rpc("create_loyalty_program", {
          p_name: newProgramName,
          p_earn_source: newEarnSource,
          p_amount_per_point: newEarnSource === "both" ? (newOrdersAmountPerPoint || newBookingsAmountPerPoint || newAmountPerPoint) : newAmountPerPoint,
          p_is_active: newProgramActive,
        } as any);
        if (fallback.error) throw fallback.error;

        showToast({ type: "success", message: "Program created" });
        await loadPrograms();
        setSelectedProgramId(fallback.data as string);
        return;
      }

      showToast({ type: "success", message: "Program created" });
      await loadPrograms();
      setSelectedProgramId(data as string);
    } catch (e: any) {
      showToast({ type: "error", message: e?.message ?? "Failed to create program" });
    } finally {
      setLoading(false);
    }
  }

  async function onAddTier() {
    if (!selectedProgramId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("add_loyalty_tier", {
        p_program_id: selectedProgramId,
        p_name: tierName,
        p_rank: tierRank,
        p_points_threshold: tierThreshold,
      });
      if (error) throw error;

      showToast({ type: "success", message: "Tier added" });
      await loadProgramDetails(selectedProgramId);
      // smart next rank
      setTierRank((prev) => prev + 1);
    } catch (e: any) {
      showToast({ type: "error", message: e?.message ?? "Failed to add tier" });
    } finally {
      setLoading(false);
    }
  }

  async function onAddReward() {
    if (!selectedProgramId) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("add_loyalty_reward", {
        p_program_id: selectedProgramId,
        p_title: rewardTitle,
        p_points_cost: rewardCost,
        p_is_active: rewardActive,
      });
      if (error) throw error;

      showToast({ type: "success", message: "Reward added" });
      await loadProgramDetails(selectedProgramId);
    } catch (e: any) {
      showToast({ type: "error", message: e?.message ?? "Failed to add reward" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Coins className="h-6 w-6" />
            Loyalty Settings
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Create loyalty programs, tiers, and rewards. Customers will pick from your programs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPrograms()}
            className="px-3 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
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
          <h2 className="font-semibold">Your Programs</h2>

          <div className="mt-3 space-y-2">
            {programs.length === 0 && (
              <div className="text-sm opacity-70">No programs yet. Create your first one.</div>
            )}

            {programs.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProgramId(p.id)}
                className={`w-full text-left p-3 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 ${
                  selectedProgramId === p.id ? "border-black/40 dark:border-white/40" : "border-black/10 dark:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{p.name ?? "Untitled Program"}</div>
                  <div className="text-xs opacity-70">{p.is_active ? "Active" : "Inactive"}</div>
                </div>
                <div className="text-xs opacity-70 mt-1">
                  Earn: {p.earn_source ?? "-"} • {p.amount_per_point ?? "-"} {p.currency_code ?? "EGP"} / point
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t">
            <h3 className="font-semibold text-sm">Create new program</h3>

            <label className="block text-xs opacity-70 mt-3">Program name</label>
            <input
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
              placeholder="e.g. VIP Points"
            />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs opacity-70">Earn source</label>
                <select
                  value={newEarnSource}
                  onChange={(e) => setNewEarnSource(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                >
                  <option value="orders">orders</option>
                  <option value="bookings">bookings</option>
                  <option value="both">both</option>
                  
                </select>
              </div>
            </div>

            {newEarnSource !== "both" && (


              <>


                <label className="block text-xs opacity-70 mt-3">Amount per point</label>


                <input


                  type="number"


                  value={newAmountPerPoint}


                  onChange={(e) => setNewAmountPerPoint(Number(e.target.value))}


                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"


                  min={0}


                  step="1"


                />


              </>


            )}



            {newEarnSource === "both" && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs opacity-70">Orders amount per point</label>
                  <input
                    type="number"
                    value={newOrdersAmountPerPoint}
                    onChange={(e) => setNewOrdersAmountPerPoint(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                    min={0}
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-xs opacity-70">Bookings amount per point</label>
                  <input
                    type="number"
                    value={newBookingsAmountPerPoint}
                    onChange={(e) => setNewBookingsAmountPerPoint(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                    min={0}
                    step="1"
                  />
                </div>
              </div>
            )}
<label className="flex items-center gap-2 mt-3 text-sm">
              <input
                type="checkbox"
                checked={newProgramActive}
                onChange={(e) => setNewProgramActive(e.target.checked)}
              />
              Active
            </label>

            <button
              onClick={onCreateProgram}
              disabled={loading}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        {/* MIDDLE: Tiers */}
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Tiers</h2>
          <p className="text-xs opacity-70 mt-1">
            Define levels like Silver/Gold/Platinum. Rank decides order.
          </p>

          {!selectedProgram ? (
            <div className="mt-4 text-sm opacity-70">Select a program first.</div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {tiers.length === 0 && <div className="text-sm opacity-70">No tiers yet.</div>}
                {tiers.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t.name ?? "Tier"}</div>
                      <div className="text-xs opacity-70">Rank: {t.rank ?? "-"}</div>
                    </div>
                    {"points_threshold" in t && (
                      <div className="text-xs opacity-70 mt-1">Threshold: {t.points_threshold ?? 0} pts</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t">
                <h3 className="font-semibold text-sm">Add tier</h3>

                <label className="block text-xs opacity-70 mt-3">Name</label>
                <input
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                  placeholder="Silver"
                />

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs opacity-70">Rank</label>
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
                    <label className="block text-xs opacity-70">Points threshold</label>
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
                  Add tier
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Rewards */}
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Rewards</h2>
          <p className="text-xs opacity-70 mt-1">
            Define what customers can redeem using points (discounts, free service, etc.).
          </p>

          {!selectedProgram ? (
            <div className="mt-4 text-sm opacity-70">Select a program first.</div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {rewards.length === 0 && <div className="text-sm opacity-70">No rewards yet.</div>}
                {rewards.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{r.title ?? "Reward"}</div>
                      <div className="text-xs opacity-70">{r.is_active ? "Active" : "Inactive"}</div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">Cost: {r.points_cost ?? 0} pts</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t">
                <h3 className="font-semibold text-sm">Add reward</h3>

                <label className="block text-xs opacity-70 mt-3">Title</label>
                <input
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                  placeholder="EGP 50 Discount"
                />

                <label className="block text-xs opacity-70 mt-3">Points cost</label>
                <input
                  type="number"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
                  min={0}
                  step="1"
                />

                <label className="flex items-center gap-2 mt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={rewardActive}
                    onChange={(e) => setRewardActive(e.target.checked)}
                  />
                  Active
                </label>

                <button
                  onClick={onAddReward}
                  disabled={loading}
                  className="mt-4 w-full px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add reward
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
