import Logo from "@/components/Logo";
import TestimonialForm from "@/components/TestimonialForm";
import { getActiveMemberSession } from "@/lib/memberSession";
import siteConfig from "@/config/site";

export const dynamic = "force-dynamic";

export default async function LeaveAReviewPage() {
  const member = await getActiveMemberSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {siteConfig.business.name}
          </a>
          <a href="/#reviews" className="text-sm font-medium hover:text-muted">
            &larr; Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-3xl font-bold">Leave us a review</h1>
        <p className="mt-2 text-muted">
          Tell us about your experience — we read every one, and approved reviews are shown
          publicly on the site.
        </p>

        <TestimonialForm member={member} />
      </main>
    </div>
  );
}
