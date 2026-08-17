import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import ProductForm from "@/components/ProductForm";
import DeleteButton from "@/components/DeleteButton";
import { updateProductAction, deleteProductAction } from "../../actions";
import { isAIAssistantEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, aiEnabled] = await Promise.all([getProduct(id), isAIAssistantEnabled()]);

  if (!product) {
    notFound();
  }

  const boundUpdate = updateProductAction.bind(null, product.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit product</h1>
        <ProductForm
          action={boundUpdate}
          product={product}
          submitLabel="Save changes"
          aiEnabled={aiEnabled}
        />

        <form action={deleteProductAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={product.id} />
          <DeleteButton
            confirmMessage={`Delete "${product.name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this product
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
