import { notFound } from "next/navigation";
import { getDoctor, getSpecialties } from "@/lib/doctors";
import DoctorForm from "@/components/DoctorForm";
import DeleteButton from "@/components/DeleteButton";
import { updateDoctorAction, deleteDoctorAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDoctorPage({ params }) {
  const { id } = await params;
  const [doctor, specialties] = await Promise.all([getDoctor(id), getSpecialties()]);

  if (!doctor) {
    notFound();
  }

  const boundUpdate = updateDoctorAction.bind(null, doctor.id);
  const label = doctor.name_en || doctor.name_bn;

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit doctor</h1>
        <DoctorForm action={boundUpdate} doctor={doctor} specialties={specialties} submitLabel="Save changes" />

        <form action={deleteDoctorAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={doctor.id} />
          <DeleteButton
            confirmMessage={`Delete "${label}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this doctor
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
