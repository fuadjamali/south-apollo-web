import GalleryPhotoForm from "@/components/GalleryPhotoForm";
import { createPhotoAction } from "../actions";

export default function NewGalleryPhotoPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add photo</h1>
        <GalleryPhotoForm action={createPhotoAction} submitLabel="Add photo" />
      </div>
    </div>
  );
}
