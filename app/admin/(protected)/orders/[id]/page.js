import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { formatCurrency } from "@/lib/currency";
import DeleteButton from "@/components/DeleteButton";
import { updateOrderStatusAction, deleteOrderAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["Pending", "Confirmed", "Fulfilled", "Cancelled"];

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const boundUpdateStatus = updateOrderStatusAction.bind(null, order.id);

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{order.order_number}</h1>
          <a href="/admin/orders" className="text-sm font-medium text-muted hover:underline">
            &larr; Back to orders
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Customer</p>
            <p className="mt-1 text-sm text-foreground">
              {order.customer_name}
              {order.member_name && (
                <span className="ml-1.5 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium">
                  Member account
                </span>
              )}
            </p>
            <p className="text-sm text-muted">{order.customer_email}</p>
            {order.customer_phone && <p className="text-sm text-muted">{order.customer_phone}</p>}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Delivery address
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">
              {order.customer_address || "—"}
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Notes</p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{order.notes}</p>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Items</p>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name} × {item.quantity} @ {formatCurrency(item.unit_price)}
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.line_total)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-border pt-3">
            <div className="flex justify-between text-sm text-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount ({order.discount_code})</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.subtotal - order.discount_amount)}</span>
            </div>
          </div>
        </div>

        <form action={boundUpdateStatus} className="mt-6 flex items-end gap-3 border-t border-border pt-6">
          <div>
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select
              name="status"
              defaultValue={order.status}
              className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Update status
          </button>
        </form>

        <form action={deleteOrderAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={order.id} />
          <DeleteButton
            confirmMessage={`Delete order ${order.order_number}? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this order
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
