import { notFound } from "next/navigation";
import { getPhoto } from "@/lib/gallery";
import GalleryPhotoForm from "@/components/GalleryPhotoForm";
import DeleteButton from "@/components/DeleteButton";
import { updatePhotoAction, deletePhotoAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditGalleryPhotoPage({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  if (!photo) {
    notFound();
  }

  const boundUpdate = updatePhotoAction.bind(null, photo.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit photo</h1>
        <GalleryPhotoForm action={boundUpdate} photo={photo} submitLabel="Save changes" />

        <form action={deletePhotoAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={photo.id} />
          <DeleteButton
            confirmMessage={`Delete this photo${photo.caption ? ` ("${photo.caption}")` : ""}? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this photo
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
