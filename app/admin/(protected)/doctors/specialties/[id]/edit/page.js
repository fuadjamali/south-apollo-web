import { notFound } from "next/navigation";
import { getSpecialty } from "@/lib/doctors";
import DoctorSpecialtyForm from "@/components/DoctorSpecialtyForm";
import { updateSpecialtyAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditDoctorSpecialtyPage({ params }) {
  const { id } = await params;
  const specialty = await getSpecialty(id);

  if (!specialty) {
    notFound();
  }

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit specialty</h1>
        <DoctorSpecialtyForm
          action={updateSpecialtyAction.bind(null, specialty.id)}
          specialty={specialty}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
