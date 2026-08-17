import { notFound } from "next/navigation";
import { getBookingService } from "@/lib/bookingServices";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminBookingServiceDetailPage({ params }) {
  const { id } = await params;
  const service = await getBookingService(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {service.name}
            {!service.active && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Inactive
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/booking-services/${service.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/booking-services"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to services
            </a>
          </div>
        </div>

        {service.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt=""
            className="mt-6 h-32 w-48 rounded-lg border border-border object-cover"
          />
        )}

        <DetailField label="Description" value={service.description} className="mt-6" />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <DetailField label="Duration" value={`${service.duration_minutes} min`} />
          <DetailField label="Price" value={service.price} />
          <DetailField label="Display order" value={service.display_order} />
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(service.created_at).toLocaleString()} · Updated{" "}
          {new Date(service.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
