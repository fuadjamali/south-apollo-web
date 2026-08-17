"use server";

import { createOrder } from "@/lib/orders";
import { getActiveMemberSession } from "@/lib/memberSession";

export async function placeOrderAction(prevState, formData) {
  // Derived from the session cookie server-side, never from the submitted form — a guest
  // could otherwise attach their order to any member account just by editing a hidden field.
  const session = await getActiveMemberSession();
  const memberAccountId = session?.id || null;

  const customerName = formData.get("customerName")?.toString().trim() || "";
  const customerEmail = formData.get("customerEmail")?.toString().trim() || "";
  const customerPhone = formData.get("customerPhone")?.toString().trim() || "";
  const customerAddress = formData.get("customerAddress")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";
  const discountCode = formData.get("discountCode")?.toString().trim() || "";
  const cartJson = formData.get("cart")?.toString() || "[]";

  if (!customerName || !customerEmail) {
    return { error: "Name and email are required." };
  }

  let cartItems;
  try {
    cartItems = JSON.parse(cartJson);
  } catch {
    return { error: "Something went wrong reading your cart. Please try again." };
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  const items = cartItems.map((item) => ({
    productId: item.productId,
    name: item.name,
    unitPrice: Number(item.unitPrice) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  try {
    const order = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      notes,
      items,
      memberAccountId,
      discountCode,
    });
    return { success: true, orderNumber: order.orderNumber };
  } catch (err) {
    return { error: err.message || "Couldn't place your order. Please try again." };
  }
}
