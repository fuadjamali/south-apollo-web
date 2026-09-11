import LegalPageView from "@/components/LegalPageView";
import { getLegalPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getLegalPage("privacy-policy");
  return buildPageMetadata({
    title: page?.title || "Privacy Policy",
    description: page?.body ? page.body.slice(0, 160) : undefined,
    path: "/privacy-policy",
    // Not yet filled in/published — the page itself renders "Page not available" (200, not
    // 404), so at minimum it shouldn't be offered as a search result until there's real content.
    noIndex: !page?.enabled,
  });
}

export default function PrivacyPolicyPage() {
  return <LegalPageView slug="privacy-policy" />;
}
