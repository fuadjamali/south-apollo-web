import HowItWorksStepForm from "@/components/HowItWorksStepForm";
import { createStepAction } from "../actions";

export default function NewHowItWorksStepPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add step</h1>
        <HowItWorksStepForm action={createStepAction} submitLabel="Create step" />
      </div>
    </div>
  );
}
