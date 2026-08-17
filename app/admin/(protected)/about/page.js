import { getAboutInfo } from "@/lib/aboutInfo";
import { updateAboutInfoAction } from "./actions";
import { isModuleEnabled } from "@/lib/plan";
import AIAssistantButton from "@/components/AIAssistantButton";

export const dynamic = "force-dynamic";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default async function AdminAboutPage() {
  const about = await getAboutInfo();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">About Us section</h1>
        <p className="mt-1 text-sm text-muted">
          Shown on the home page. Changes appear on the live site immediately.
        </p>

        <form action={updateAboutInfoAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Heading</label>
            <input
              type="text"
              name="heading"
              defaultValue={about.heading}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Body</label>
            <textarea
              id="about-body"
              name="body"
              rows={6}
              defaultValue={about.body}
              className={fieldClass}
            />
            {isModuleEnabled("ai") && (
              <AIAssistantButton targetId="about-body" fieldLabel="About Us body text" />
            )}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
