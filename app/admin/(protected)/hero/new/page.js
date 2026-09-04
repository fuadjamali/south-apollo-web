import HeroSlideForm from "@/components/HeroSlideForm";
import { createHeroSlideAction } from "../actions";

export default async function NewHeroSlidePage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add slide</h1>
        <HeroSlideForm action={createHeroSlideAction} submitLabel="Create slide" />
      </div>
    </div>
  );
}
