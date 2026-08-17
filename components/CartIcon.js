"use client";

import { IconShoppingCart } from "@tabler/icons-react";
import { useCart } from "@/components/CartContext";

export default function CartIcon({ className = "" }) {
  const { count, hydrated } = useCart();

  return (
    <a
      href="/cart"
      aria-label="View cart"
      className={`relative inline-flex items-center rounded-full border border-border p-2 text-foreground hover:bg-surface-alt ${className}`}
    >
      <IconShoppingCart size={18} />
      {hydrated && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </a>
  );
}
