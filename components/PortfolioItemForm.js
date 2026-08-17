import ImageFileInput from "@/components/ImageFileInput";
import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function PortfolioItemForm({ action, item, submitLabel, aiEnabled = false }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <ImageFileInput
        name="imageFile"
        label="Image"
        currentImage={item?.image}
        required={!item}
        helpText={item ? undefined : "Required."}
      />

      <div>
        <label className="block text-sm font-medium text-foreground">Project name</label>
        <input
          type="text"
          name="name"
          defaultValue={item?.name}
          placeholder="e.g. Riverside Apartments"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          id="portfolio-description"
          name="description"
          rows={3}
          defaultValue={item?.description}
          placeholder="Short description of the project"
          className={fieldClass}
        />
        {aiEnabled && (
          <AIAssistantButton targetId="portfolio-description" fieldLabel="portfolio project description" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Display order</label>
        <input
          type="number"
          name="displayOrder"
          defaultValue={item?.display_order ?? 0}
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
          href="/admin/portfolio"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
