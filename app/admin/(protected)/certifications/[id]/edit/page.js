import { notFound } from "next/navigation";
import { getCertification } from "@/lib/certifications";
import CertificationForm from "@/components/CertificationForm";
import DeleteButton from "@/components/DeleteButton";
import { updateCertificationAction, deleteCertificationAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCertificationPage({ params }) {
  const { id } = await params;
  const certification = await getCertification(id);

  if (!certification) {
    notFound();
  }

  const boundUpdate = updateCertificationAction.bind(null, certification.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit certification</h1>
        <CertificationForm
          action={boundUpdate}
          certification={certification}
          submitLabel="Save changes"
        />

        <form action={deleteCertificationAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={certification.id} />
          <DeleteButton
            confirmMessage={`Delete "${certification.name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this certification
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
