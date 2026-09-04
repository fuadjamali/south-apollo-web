import { notFound } from "next/navigation";
import { getHeroSlide } from "@/lib/heroSlides";
import HeroSlideForm from "@/components/HeroSlideForm";
import { updateHeroSlideAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHeroSlidePage({ params }) {
  const { id } = await params;
  const slide = await getHeroSlide(Number(id));

  if (!slide) {
    notFound();
  }

  const boundUpdate = updateHeroSlideAction.bind(null, slide.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit slide</h1>
        <HeroSlideForm slide={slide} action={boundUpdate} submitLabel="Save changes" />
      </div>
    </div>
  );
}
