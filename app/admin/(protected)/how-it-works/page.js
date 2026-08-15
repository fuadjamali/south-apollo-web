import { getSteps } from "@/lib/howItWorks";
import { deleteStepAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminHowItWorksPage() {
  const steps = await getSteps();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">How It Works</h1>
            <p className="mt-1 text-sm text-muted">
              Shown in the "How it works" section on the home page, numbered in this order.
              Changes appear on the live site immediately.
            </p>
          </div>
          <a
            href="/admin/how-it-works/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add step
          </a>
        </div>

        {steps.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No steps yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="text-sm text-muted">
                      {step.description || "—"} · order {step.display_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/how-it-works/${step.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteStepAction}>
                    <input type="hidden" name="id" value={step.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${step.title}"? This can't be undone.`}
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
