import { getHeroSlides, getHeroSettings } from "@/lib/heroSlides";
import { deleteHeroSlideAction, reorderHeroSlidesAction, toggleHeroSlideActiveAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import NavReorderableList from "@/components/NavReorderableList";
import HeroHeightForm from "@/components/HeroHeightForm";
import { IconPhoto, IconVideo } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const [slides, heroSettings] = await Promise.all([getHeroSlides(), getHeroSettings()]);

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Hero</h1>
            <p className="mt-1 text-sm text-muted">
              The banner shown at the very top of the home page. One slide behaves exactly like a
              single hero always has; two or more play as a sliding carousel automatically. Drag
              the handle (or use the arrows) to reorder — changes save immediately.
            </p>
          </div>
          <a
            href="/admin/hero/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add slide
          </a>
        </div>

        <div className="mt-6">
          <HeroHeightForm settings={heroSettings} />
        </div>

        {slides.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No slides yet — add one to show the hero banner.</p>
        ) : (
          <div className="mt-6">
            <NavReorderableList
              items={slides.map((slide) => ({ ...slide, label: slide.heading }))}
              parentId={null}
              reorderAction={reorderHeroSlidesAction}
            >
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-alt">
                      {slide.media_type === "video" ? (
                        slide.background_video ? (
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          <video src={slide.background_video} className="h-full w-full object-cover" muted />
                        ) : (
                          <IconVideo className="absolute inset-0 m-auto text-muted" size={20} />
                        )
                      ) : slide.background_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slide.background_image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <IconPhoto className="absolute inset-0 m-auto text-muted" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {slide.heading.length > 60 ? `${slide.heading.slice(0, 60)}…` : slide.heading}
                      </p>
                      <p className="text-sm text-muted">
                        {slide.media_type === "video" ? "Video" : "Image"}
                        {!slide.active && " · Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleHeroSlideActiveAction}>
                      <input type="hidden" name="id" value={slide.id} />
                      <input type="hidden" name="active" value={slide.active ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                          slide.active
                            ? "border-green-600/40 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                            : "border-border text-muted hover:bg-surface-alt"
                        }`}
                      >
                        {slide.active ? "Active" : "Inactive"}
                      </button>
                    </form>
                    <a
                      href={`/admin/hero/${slide.id}/edit`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                    >
                      Edit
                    </a>
                    <form action={deleteHeroSlideAction}>
                      <input type="hidden" name="id" value={slide.id} />
                      <DeleteButton
                        confirmMessage={`Delete this slide? This can't be undone.`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                      />
                    </form>
                  </div>
                </div>
              ))}
            </NavReorderableList>
          </div>
        )}
      </div>
    </div>
  );
}
