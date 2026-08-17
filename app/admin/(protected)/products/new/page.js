import ProductForm from "@/components/ProductForm";
import { createProductAction } from "../actions";
import { isAIAssistantEnabled } from "@/lib/ai";

export default async function NewProductPage() {
  const aiEnabled = await isAIAssistantEnabled();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add product</h1>
        <ProductForm
          action={createProductAction}
          submitLabel="Create product"
          aiEnabled={aiEnabled}
        />
      </div>
    </div>
  );
}
