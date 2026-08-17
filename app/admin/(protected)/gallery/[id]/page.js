import { notFound } from "next/navigation";
import { getPhoto } from "@/lib/gallery";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminGalleryDetailPage({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  if (!photo) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {photo.caption || "(no caption)"}
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/gallery/${photo.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/gallery"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to gallery
            </a>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image}
          alt=""
          className="mt-6 h-64 w-full rounded-lg border border-border object-cover"
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Caption" value={photo.caption} />
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(photo.created_at).toLocaleString()} · Updated{" "}
          {new Date(photo.updated_at).toLocaleString()}
        </p>

        <a
          href="/gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          View on site &rarr;
        </a>
      </div>
    </div>
  );
}
