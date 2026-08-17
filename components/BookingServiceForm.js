import ImageFileInput from "@/components/ImageFileInput";
import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function BookingServiceForm({ action, service, submitLabel, aiEnabled = false }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={service?.name}
          placeholder="Service name"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          id="booking-service-description"
          name="description"
          rows={3}
          defaultValue={service?.description}
          placeholder="Short description"
          className={fieldClass}
        />
        {aiEnabled && (
          <AIAssistantButton
            targetId="booking-service-description"
            fieldLabel="booking service description"
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Duration (minutes)</label>
          <input
            type="number"
            name="durationMinutes"
            min="5"
            step="5"
            required
            defaultValue={service?.duration_minutes ?? 30}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Price label</label>
          <input
            type="text"
            name="price"
            defaultValue={service?.price}
            placeholder="£45"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Display order</label>
        <input
          type="number"
          name="displayOrder"
          defaultValue={service?.display_order ?? 0}
          className={fieldClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="booking-service-active"
          name="active"
          defaultChecked={service?.active ?? true}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="booking-service-active" className="text-sm font-medium text-foreground">
          Active (bookable on the public site)
        </label>
      </div>

      <ImageFileInput name="imageFile" label="Image" currentImage={service?.image} />

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/booking-services"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
