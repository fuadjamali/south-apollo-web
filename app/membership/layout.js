import { buildPageMetadata } from "@/lib/seo";

// page.js is a client component ("use client", for the status-lookup form's local state) —
// metadata exports only work from a server component, so this sibling layout carries it
// instead. Indexable: the page itself is a static empty lookup form, no personal data in the
// URL or SSR'd HTML (the result comes back via a client-side POST).
export async function generateMetadata() {
  return buildPageMetadata({
    title: "Membership",
    description: "Check your membership status.",
    path: "/membership",
  });
}

export default function MembershipLayout({ children }) {
  return children;
}
