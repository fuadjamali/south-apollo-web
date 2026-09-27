import HealthPackageForm from "@/components/HealthPackageForm";
import { createPackageAction } from "../actions";

export default function NewHealthPackagePage() {
  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add package</h1>
        <HealthPackageForm action={createPackageAction} submitLabel="Create package" />
      </div>
    </div>
  );
}
