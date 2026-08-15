const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function GalleryPhotoForm({ action, photo, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Image path or URL</label>
        <input
          type="text"
          name="image"
          required
          defaultValue={photo?.image}
          placeholder="/images/portfolio-1.jpg"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          A local path under <code>public/</code> (upload the file yourself first) or a full
          external image URL.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Caption</label>
        <input
          type="text"
          name="caption"
          defaultValue={photo?.caption}
          placeholder="Short caption shown under the photo"
          className={fieldClass}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/gallery"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
