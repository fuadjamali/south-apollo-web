import { notFound } from "next/navigation";
import { getItemById } from "@/lib/newsEvents";
import NewsEventForm from "@/components/NewsEventForm";
import DeleteButton from "@/components/DeleteButton";
import { updateItemAction, deleteItemAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditNewsEventPage({ params }) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  const boundUpdate = updateItemAction.bind(null, item.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit news / event</h1>
        <NewsEventForm action={boundUpdate} item={item} submitLabel="Save changes" />

        <form action={deleteItemAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={item.id} />
          <DeleteButton
            confirmMessage={`Delete "${item.title}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this item
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
