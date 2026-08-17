import ImageFileInput from "@/components/ImageFileInput";
import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

const TYPES = ["News", "Event"];

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function NewsEventForm({ action, item, submitLabel, aiEnabled = false }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Type</label>
          <select
            name="type"
            required
            defaultValue={item?.type || "News"}
            className={fieldClass}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Published date</label>
          <input
            type="date"
            name="publishedDate"
            defaultValue={toDateInputValue(item?.published_date) || toDateInputValue(new Date())}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={item?.title}
          className={fieldClass}
        />
        {item && (
          <p className="mt-1 text-xs text-muted">
            Currently at <code>/news-events/{item.slug}</code> — changing the title changes the
            URL.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Summary</label>
        <textarea
          id="newsevent-summary"
          name="summary"
          rows={2}
          defaultValue={item?.summary}
          placeholder="Short summary shown on the listing page"
          className={fieldClass}
        />
        {aiEnabled && (
          <AIAssistantButton targetId="newsevent-summary" fieldLabel="news/event summary" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          id="newsevent-description"
          name="description"
          rows={6}
          defaultValue={item?.description}
          placeholder="Full details. Leave a blank line between paragraphs."
          className={fieldClass}
        />
        {aiEnabled && (
          <AIAssistantButton
            targetId="newsevent-description"
            fieldLabel="news/event description"
          />
        )}
      </div>

      <ImageFileInput name="imageFile" label="Image" currentImage={item?.image} />

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Event details — only used when Type is "Event"
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Event date</label>
            <input
              type="date"
              name="eventDate"
              defaultValue={toDateInputValue(item?.event_date)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Event location</label>
            <input
              type="text"
              name="eventLocation"
              defaultValue={item?.event_location}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/news-events"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
