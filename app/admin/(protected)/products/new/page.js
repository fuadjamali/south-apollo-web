import ProductForm from "@/components/ProductForm";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add product</h1>
        <ProductForm action={createProductAction} submitLabel="Create product" />
      </div>
    </div>
  );
}
