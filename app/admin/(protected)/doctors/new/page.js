import DoctorForm from "@/components/DoctorForm";
import { getSpecialties } from "@/lib/doctors";
import { createDoctorAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewDoctorPage() {
  const specialties = await getSpecialties();
  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add doctor</h1>
        <DoctorForm action={createDoctorAction} specialties={specialties} submitLabel="Create doctor" />
      </div>
    </div>
  );
}
