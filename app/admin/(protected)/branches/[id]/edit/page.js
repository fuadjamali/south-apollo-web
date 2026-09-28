import { notFound } from "next/navigation";
import { getBranch } from "@/lib/branches";
import BranchForm from "@/components/BranchForm";
import DeleteButton from "@/components/DeleteButton";
import { updateBranchAction, deleteBranchAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBranchPage({ params }) {
  const { id } = await params;
  const branch = await getBranch(id);
  if (!branch) notFound();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit branch</h1>
        <BranchForm action={updateBranchAction.bind(null, branch.id)} branch={branch} submitLabel="Save changes" />

        <form action={deleteBranchAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={branch.id} />
          <DeleteButton
            confirmMessage={`Delete "${branch.name_en}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this branch
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
