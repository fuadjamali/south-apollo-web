import DoctorSpecialtyForm from "@/components/DoctorSpecialtyForm";
import { createSpecialtyAction } from "../../actions";

export default function NewDoctorSpecialtyPage() {
  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add specialty</h1>
        <DoctorSpecialtyForm action={createSpecialtyAction} submitLabel="Create specialty" />
      </div>
    </div>
  );
}
