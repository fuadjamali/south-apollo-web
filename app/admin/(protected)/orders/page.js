import { getOrders } from "@/lib/orders";
import { formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Fulfilled: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

function formatDate(date) {
  return new Date(date).toLocaleString();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Placed via the site&apos;s shopping cart. No online payment is collected — follow up
          with each customer to arrange payment, then update the status.
        </p>

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <a
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4 hover:bg-surface-alt"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {order.order_number}{" "}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {order.customer_name}
                    {order.member_name && (
                      <span className="ml-1.5 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium">
                        Member
                      </span>
                    )}{" "}
                    · {order.item_count} item
                    {order.item_count === 1 ? "" : "s"} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(order.subtotal - order.discount_amount)}
                  </p>
                  {order.discount_amount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {order.discount_code} applied
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
