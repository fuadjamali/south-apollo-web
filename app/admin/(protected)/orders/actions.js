"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateOrderStatus, deleteOrder } from "@/lib/orders";

export async function updateOrderStatusAction(id, formData) {
  const status = formData.get("status")?.toString() || "";
  await updateOrderStatus(id, status);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function deleteOrderAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteOrder(id);

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
