import { notFound } from "next/navigation";
import { getPostById } from "@/lib/blog";
import BlogPostForm from "@/components/BlogPostForm";
import { updatePostAction, deletePostAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const boundUpdate = updatePostAction.bind(null, post.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit blog post</h1>
        <BlogPostForm action={boundUpdate} post={post} submitLabel="Save changes" />

        <form action={deletePostAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this post
          </button>
        </form>
      </div>
    </div>
  );
}
