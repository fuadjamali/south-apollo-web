import { getPhotos } from "@/lib/gallery";
import { getSectionHeadings } from "@/lib/sectionHeadings";

export const revalidate = 3600;

export async function generateMetadata() {
  const headings = await getSectionHeadings();
  return { title: "Gallery", description: headings.gallery.subheading };
}

export default async function GalleryPage() {
  const [headings, photos] = await Promise.all([getSectionHeadings(), getPhotos()]);
  const { gallery } = headings;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">{gallery.heading}</h1>
      <p className="mt-2 text-center text-muted">{gallery.subheading}</p>

      {photos.length === 0 ? (
        <p className="mt-10 text-center text-muted">No photos yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-xl border border-border shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* Admin-editable image source — plain <img>, same reasoning as products/blog. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image}
                  alt={photo.caption || ""}
                  className="h-full w-full object-cover"
                />
              </div>
              {photo.caption && (
                <figcaption className="p-3 text-sm text-muted">{photo.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
