import { notFound } from "next/navigation";
import { getDiscountCode } from "@/lib/discountCodes";
import DiscountCodeForm from "@/components/DiscountCodeForm";
import DeleteButton from "@/components/DeleteButton";
import { updateDiscountCodeAction, deleteDiscountCodeAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDiscountCodePage({ params }) {
  const { id } = await params;
  const discountCode = await getDiscountCode(id);

  if (!discountCode) {
    notFound();
  }

  const boundUpdate = updateDiscountCodeAction.bind(null, discountCode.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit discount code</h1>
        <DiscountCodeForm
          action={boundUpdate}
          discountCode={discountCode}
          submitLabel="Save changes"
        />

        <form action={deleteDiscountCodeAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={discountCode.id} />
          <DeleteButton
            confirmMessage={`Delete code "${discountCode.code}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this code
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
