import { buildPageMetadata } from "@/lib/seo";

// page.js is a client component ("use client", for useCart()) — metadata exports only work from
// a server component, so this sibling layout carries it instead. noIndex: a personal cart state,
// never appropriate to surface in search results.
export async function generateMetadata() {
  return buildPageMetadata({ title: "Cart", path: "/cart", noIndex: true });
}

export default function CartLayout({ children }) {
  return children;
}
