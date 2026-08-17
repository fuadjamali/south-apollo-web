import BlogPostForm from "@/components/BlogPostForm";
import { createPostAction } from "../actions";
import { isAIAssistantEnabled } from "@/lib/ai";

export default async function NewBlogPostPage() {
  const aiEnabled = await isAIAssistantEnabled();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add blog post</h1>
        <BlogPostForm action={createPostAction} submitLabel="Create post" aiEnabled={aiEnabled} />
      </div>
    </div>
  );
}
