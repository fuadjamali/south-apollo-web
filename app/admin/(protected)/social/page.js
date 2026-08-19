import { getSocialSettings } from "@/lib/socialSettings";
import SocialSettingsForm from "@/components/SocialSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSocialPage() {
  const settings = await getSocialSettings();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Social &amp; WhatsApp</h1>
        <p className="mt-1 text-sm text-muted">
          The WhatsApp number/messages and social icon links shown on the home page.
        </p>

        <SocialSettingsForm settings={settings} />
      </div>
    </div>
  );
}
