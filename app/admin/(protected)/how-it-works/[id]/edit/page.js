import { notFound } from "next/navigation";
import { getStep } from "@/lib/howItWorks";
import HowItWorksStepForm from "@/components/HowItWorksStepForm";
import DeleteButton from "@/components/DeleteButton";
import { updateStepAction, deleteStepAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHowItWorksStepPage({ params }) {
  const { id } = await params;
  const step = await getStep(id);

  if (!step) {
    notFound();
  }

  const boundUpdate = updateStepAction.bind(null, step.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit step</h1>
        <HowItWorksStepForm action={boundUpdate} step={step} submitLabel="Save changes" />

        <form action={deleteStepAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={step.id} />
          <DeleteButton
            confirmMessage={`Delete "${step.title}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this step
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
