"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPost, updatePost, deletePost, getPostById } from "@/lib/blog";

function readForm(formData) {
  return {
    title: formData.get("title")?.toString().trim() || "",
    excerpt: formData.get("excerpt")?.toString().trim() || "",
    body: formData.get("body")?.toString().trim() || "",
    image: formData.get("image")?.toString().trim() || "",
    publishedDate: formData.get("publishedDate")?.toString().trim() || undefined,
  };
}

export async function createPostAction(formData) {
  const data = readForm(formData);
  if (!data.title) return;

  const slug = await createPost(data);

  // Revalidate immediately rather than waiting for /blog's ISR window.
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePostAction(id, formData) {
  const data = readForm(formData);
  if (!data.title) return;

  const oldPost = await getPostById(id);
  const newSlug = await updatePost(id, data);

  revalidatePath("/blog");
  revalidatePath(`/blog/${newSlug}`);
  if (oldPost && oldPost.slug !== newSlug) {
    // The title changed enough to change the slug — the old URL is now a 404,
    // so make sure any cached copy of it is dropped too.
    revalidatePath(`/blog/${oldPost.slug}`);
  }
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePostAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const slug = await deletePost(id);

  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
