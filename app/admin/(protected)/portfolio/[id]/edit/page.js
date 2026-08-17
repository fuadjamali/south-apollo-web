import { notFound } from "next/navigation";
import { getPortfolioItem } from "@/lib/portfolio";
import PortfolioItemForm from "@/components/PortfolioItemForm";
import DeleteButton from "@/components/DeleteButton";
import { updatePortfolioItemAction, deletePortfolioItemAction } from "../../actions";
import { isModuleEnabled } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function EditPortfolioItemPage({ params }) {
  const { id } = await params;
  const item = await getPortfolioItem(id);

  if (!item) {
    notFound();
  }

  const boundUpdate = updatePortfolioItemAction.bind(null, item.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit portfolio project</h1>
        <PortfolioItemForm
          action={boundUpdate}
          item={item}
          submitLabel="Save changes"
          aiEnabled={isModuleEnabled("ai")}
        />

        <form action={deletePortfolioItemAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={item.id} />
          <DeleteButton
            confirmMessage={`Delete "${item.name || "this project"}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this project
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
