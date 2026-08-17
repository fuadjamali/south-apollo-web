import { getAISettings } from "@/lib/aiSettings";
import AISettingsForm from "@/components/AISettingsForm";

export const dynamic = "force-dynamic";

function maskKey(key) {
  if (!key) return null;
  return key.length > 10 ? `${key.slice(0, 10)}...${key.slice(-4)}` : "••••••••";
}

export default async function AdminAISettingsPage() {
  const settings = await getAISettings();
  const hasEnvFallback = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
        <p className="mt-1 text-sm text-muted">
          Configure the API key powering &quot;Write with AI&quot; and turn the feature on or
          off, without needing an env var change or redeploy.
        </p>

        <AISettingsForm
          enabled={settings.enabled}
          maskedKey={maskKey(settings.api_key)}
          hasEnvFallback={hasEnvFallback}
        />
      </div>
    </div>
  );
}
