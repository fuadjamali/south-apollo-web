import ImageFileInput from "@/components/ImageFileInput";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function GalleryPhotoForm({ action, photo, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <ImageFileInput
        name="imageFile"
        label="Image"
        currentImage={photo?.image}
        required={!photo}
        cropAspectRatio={photo?.aspect_ratio || "16:9"}
        cropRatioKeys={["9:16", "16:9"]}
        aspectRatioFieldName="aspectRatio"
        helpText={
          photo
            ? "Choose a file to replace it, or leave blank to keep it. Crop to Portrait or Landscape in the next step — whichever you pick is respected on the gallery page."
            : "Required. Crop to Portrait or Landscape in the next step — whichever you pick is respected on the gallery page. Compressed automatically on upload."
        }
      />

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

      <div>
        <label className="block text-sm font-medium text-foreground">
          Caption <span className="font-normal text-muted">(বাংলা, optional — blank shows the English caption)</span>
        </label>
        <input
          type="text"
          name="captionBn"
          lang="bn"
          defaultValue={photo?.translations?.bn?.caption || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Tags</label>
        <input
          type="text"
          name="tags"
          defaultValue={(photo?.tags || []).join(", ")}
          placeholder="wedding, outdoor, summer"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          Comma-separated. Shown as filter chips on the gallery page.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Photo date</label>
        <input
          type="date"
          name="takenAt"
          defaultValue={photo?.taken_at ? String(photo.taken_at).slice(0, 10) : ""}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          Optional — when the photo was actually taken, if different from today. Used for the
          gallery&apos;s date filter and sorting; falls back to the upload date if left blank.
        </p>
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
