import { getPhotos } from "@/lib/gallery";
import { deletePhotoAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const photos = await getPhotos();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gallery</h1>
            <p className="mt-1 text-sm text-muted">
              The 3 most recent photos show on the home page; the full set is at /gallery.
              Changes appear on the live site immediately.
            </p>
          </div>
          <a
            href="/admin/gallery/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add photo
          </a>
        </div>

        {photos.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No photos yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image}
                    alt=""
                    className="h-14 w-20 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {photo.caption || "(no caption)"}
                    </p>
                    <p className="text-sm text-muted">
                      Added {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/gallery/${photo.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deletePhotoAction}>
                    <input type="hidden" name="id" value={photo.id} />
                    <DeleteButton
                      confirmMessage={`Delete this photo${photo.caption ? ` ("${photo.caption}")` : ""}? This can't be undone.`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
