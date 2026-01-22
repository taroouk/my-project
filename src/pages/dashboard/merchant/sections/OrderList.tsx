import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../contexts/AuthContext";
import { RefreshCw } from "lucide-react";

type OrderItem = {
  id: string;
  item_type: "product" | "service";
  name_snapshot: string | null;
  quantity: number;
  price_snapshot: number;
};

type OrderRow = {
  id: string;
  invoice_id: string | null;
  customer_name: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

const OrderList = () => {
  const { user } = useAuth() as any;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          invoice_id,
          customer_name,
          amount,
          currency,
          status,
          created_at,
          order_items (
            id,
            item_type,
            name_snapshot,
            quantity,
            price_snapshot
          )
        `
        )
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data as OrderRow[]) || []);
      setLastRefreshAt(Date.now());
    } catch (err: any) {
      console.error("fetchOrders error:", err);
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: "delivered" | "cancelled") => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;

      fetchOrders();
    } catch (err: any) {
      alert(err?.message || "Failed to update order status");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // ✅ initial load only (NO auto refresh)
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const lastRefreshLabel = useMemo(() => {
    if (!lastRefreshAt) return "";
    return new Date(lastRefreshAt).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastRefreshAt]);

  const statusPill = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "pending")
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/40";
    if (s === "delivered" || s === "completed")
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900/40";
    if (s === "cancelled")
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900/40";
    return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-800";
  };

  const CardShell = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between
                    dark:border-slate-800 dark:bg-slate-950/40">
      {children}
    </div>
  );

  const Header = () => (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-black text-gray-900 dark:text-slate-100">Orders</div>
        {lastRefreshLabel ? (
          <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">
            Last update: <span className="text-gray-800 dark:text-slate-200">{lastRefreshLabel}</span>
          </div>
        ) : (
          <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">
            Manual refresh
          </div>
        )}
      </div>

      <button
        onClick={fetchOrders}
        disabled={loading}
        className="px-3 py-2 rounded-xl text-xs font-black border border-gray-200 bg-white text-gray-800
                   hover:bg-gray-50 active:scale-95 transition disabled:opacity-60
                   dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-900/40
                   flex items-center gap-2"
        title="Refresh"
        aria-label="Refresh"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Header />
        <div className="text-sm font-bold text-gray-600 dark:text-slate-400">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Header />
        <div className="text-sm font-bold text-rose-700 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Header />
        <div className="text-sm font-bold text-gray-600 dark:text-slate-400">No orders yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <Header />

      {orders.map((order) => {
        const firstItem = order.order_items?.[0];
        const s = (order.status || "").toLowerCase();

        return (
          <CardShell key={order.id}>
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-black text-gray-900 dark:text-slate-100 truncate">
                {order.invoice_id || "Order"}
              </div>

              <div className="text-xs font-bold text-gray-600 dark:text-slate-400 truncate">
                {order.customer_name || "Guest"}
              </div>

              {firstItem && (
                <div className="text-xs font-bold text-gray-800 dark:text-slate-300 truncate">
                  {firstItem.name_snapshot} × {firstItem.quantity}
                </div>
              )}
            </div>

            <div className="text-right space-y-2 shrink-0 pl-4">
              <div className="text-sm font-black text-gray-900 dark:text-slate-100">
                {order.amount} {order.currency}
              </div>

              <div className={`inline-flex items-center justify-center px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusPill(order.status)}`}>
                {order.status}
              </div>

              {s === "pending" && (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white
                               bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition"
                  >
                    Delivered
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "cancelled")}
                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white
                               bg-rose-600 hover:bg-rose-500 active:scale-95 transition"
                  >
                    Cancelled
                  </button>
                </div>
              )}
            </div>
          </CardShell>
        );
      })}
    </div>
  );
};

export default OrderList;
