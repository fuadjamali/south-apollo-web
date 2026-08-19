import { getHeroInfo } from "@/lib/heroInfo";
import HeroInfoForm from "@/components/HeroInfoForm";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const hero = await getHeroInfo();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Hero</h1>
        <p className="mt-1 text-sm text-muted">
          The top banner shown at the very top of the home page.
        </p>

        <HeroInfoForm hero={hero} />
      </div>
    </div>
  );
}
