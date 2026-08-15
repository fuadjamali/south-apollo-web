import { getPhotos } from "@/lib/gallery";
import siteConfig from "@/config/site";

export const revalidate = 3600;

export const metadata = {
  title: "Gallery",
  description: siteConfig.gallery?.subheading,
};

export default async function GalleryPage() {
  const { gallery } = siteConfig;

  if (!gallery) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="mt-2 text-muted">Nothing here yet.</p>
      </div>
    );
  }

  const photos = await getPhotos();

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
