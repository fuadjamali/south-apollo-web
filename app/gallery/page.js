import { getPhotosPage, getAllTags, getAllPhotoMonths } from "@/lib/gallery";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 3600;

export async function generateMetadata() {
  const headings = await getSectionHeadings();
  return { title: "Gallery", description: headings.gallery.subheading };
}

export default async function GalleryPage() {
  const [headings, firstPage, allTags, allMonths] = await Promise.all([
    getSectionHeadings(),
    getPhotosPage(),
    getAllTags(),
    getAllPhotoMonths(),
  ]);
  const { gallery } = headings;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">{gallery.heading}</h1>
      <p className="mt-2 text-center text-muted">{gallery.subheading}</p>

      {firstPage.photos.length === 0 ? (
        <p className="mt-10 text-center text-muted">No photos yet.</p>
      ) : (
        <div className="mt-10">
          <GalleryGrid
            initialPhotos={firstPage.photos}
            initialNextCursor={firstPage.nextCursor}
            allTags={allTags}
            allMonths={allMonths}
          />
        </div>
      )}
    </div>
  );
}
