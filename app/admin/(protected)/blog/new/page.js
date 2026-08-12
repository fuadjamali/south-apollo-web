import BlogPostForm from "@/components/BlogPostForm";
import { createPostAction } from "../actions";

export default function NewBlogPostPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add blog post</h1>
        <BlogPostForm action={createPostAction} submitLabel="Create post" />
      </div>
    </div>
  );
}
