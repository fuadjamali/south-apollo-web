import Logo from "@/components/Logo";
import CheckoutForm from "@/components/CheckoutForm";
import { getActiveMemberSession } from "@/lib/memberSession";
import { getBusinessInfo } from "@/lib/businessInfo";
import { buildPageMetadata } from "@/lib/seo";

// noIndex: a mid-purchase form page, not a landing page — nothing here is worth ranking for,
// and indexing it risks surfacing an empty/broken cart state to search visitors who never
// actually started a purchase.
export async function generateMetadata() {
  return buildPageMetadata({ title: "Checkout", path: "/checkout", noIndex: true });
}

export default async function CheckoutPage() {
  const [member, business] = await Promise.all([getActiveMemberSession(), getBusinessInfo()]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {business.name}
          </a>
          <a href="/cart" className="text-sm font-medium hover:text-muted">
            &larr; Back to cart
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted">
          This site doesn&apos;t take payment online — place your order below and we&apos;ll be
          in touch to arrange payment.
        </p>

        <CheckoutForm member={member} />
      </main>
    </div>
  );
}
