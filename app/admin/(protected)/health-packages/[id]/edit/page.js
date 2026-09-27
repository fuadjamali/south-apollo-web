import { notFound } from "next/navigation";
import { getPackage } from "@/lib/healthPackages";
import HealthPackageForm from "@/components/HealthPackageForm";
import DeleteButton from "@/components/DeleteButton";
import { updatePackageAction, deletePackageAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHealthPackagePage({ params }) {
  const { id } = await params;
  const pkg = await getPackage(id);

  if (!pkg) {
    notFound();
  }

  const boundUpdate = updatePackageAction.bind(null, pkg.id);

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit package</h1>
        <HealthPackageForm action={boundUpdate} pkg={pkg} submitLabel="Save changes" />

        <form action={deletePackageAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={pkg.id} />
          <DeleteButton
            confirmMessage={`Delete "${pkg.name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this package
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
