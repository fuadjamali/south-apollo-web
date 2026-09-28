import { getPhotosPage, getAllTags, getAllPhotoMonths, getRecentPhotos } from "@/lib/gallery";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import GalleryGrid from "@/components/GalleryGrid";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";

export const revalidate = 3600;

export async function generateMetadata() {
  const { locale, t } = await getT();
  const [headings, [recentPhoto]] = await Promise.all([
    getSectionHeadings(locale),
    getRecentPhotos(1),
  ]);
  return buildPageMetadata({
    title: t("pages.gallery"),
    description: headings.gallery.subheading,
    path: "/gallery",
    image: recentPhoto?.image,
  });
}

export default async function GalleryPage() {
  const { locale, t } = await getT();
  const [headings, firstPage, allTags, allMonths] = await Promise.all([
    getSectionHeadings(locale),
    getPhotosPage({ locale }),
    getAllTags(),
    getAllPhotoMonths(),
  ]);
  const { gallery } = headings;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">{gallery.heading}</h1>
      <p className="mt-2 text-center text-muted">{gallery.subheading}</p>

      {firstPage.photos.length === 0 ? (
        <p className="mt-10 text-center text-muted">{t("gallery.empty")}</p>
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
