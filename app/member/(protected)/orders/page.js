import { getMemberSession } from "@/lib/memberSession";
import { getOrdersForMember } from "@/lib/orders";
import { formatCurrency } from "@/lib/currency";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Fulfilled: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

export default async function MemberOrdersPage() {
  const [session, { locale, t }] = await Promise.all([getMemberSession(), getT()]);
  const orders = await getOrdersForMember(session.id);

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{t("member.myOrders")}</h1>
          <a
            href="/member/account"
            className="text-sm font-medium text-muted hover:underline"
          >
            &larr; {t("member.backToAccount")}
          </a>
        </div>

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            {t("member.noOrders")}{" "}
            <a href="/#products" className="text-accent hover:underline">
              {t("member.browseProducts")}
            </a>
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold text-foreground">
                  {order.order_number}{" "}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status]}`}
                  >
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </p>
                <p className="text-sm text-muted">
                  {t(order.item_count === 1 ? "member.itemOne" : "member.itemMany", {
                    count: order.item_count,
                  })}{" "}
                  · {formatDate(order.created_at, locale, { year: "numeric", month: "short", day: "numeric" })} ·{" "}
                  {formatCurrency(order.subtotal)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
