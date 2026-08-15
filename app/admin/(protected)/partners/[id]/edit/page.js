import { notFound } from "next/navigation";
import { getPartner } from "@/lib/partners";
import PartnerForm from "@/components/PartnerForm";
import DeleteButton from "@/components/DeleteButton";
import { updatePartnerAction, deletePartnerAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPartnerPage({ params }) {
  const { id } = await params;
  const partner = await getPartner(id);

  if (!partner) {
    notFound();
  }

  const boundUpdate = updatePartnerAction.bind(null, partner.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit partner</h1>
        <PartnerForm action={boundUpdate} partner={partner} submitLabel="Save changes" />

        <form action={deletePartnerAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={partner.id} />
          <DeleteButton
            confirmMessage={`Delete "${partner.name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this partner
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
