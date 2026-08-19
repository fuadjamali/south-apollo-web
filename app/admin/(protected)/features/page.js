import { MODULE_GROUPS } from "@/lib/moduleSettings";
import { PLAN, ALL_MODULES, getModuleStates, isModuleInTier } from "@/lib/plan";
import { getContactInfo } from "@/lib/contactInfo";
import FeatureToggleRow from "@/components/FeatureToggleRow";
import BulkFeatureToggle from "@/components/BulkFeatureToggle";
import { updateContactInfoFeatureAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FeatureConfigPage() {
  const [moduleStates, contactInfo] = await Promise.all([getModuleStates(), getContactInfo()]);
  // "All" toggle reads as on only when every module this plan includes is actually on — a
  // plan-locked module (never true in moduleStates) doesn't count against it, since the bulk
  // toggle can't unlock those either.
  const allEnabled =
    ALL_MODULES.every((moduleName) => !isModuleInTier(moduleName) || moduleStates[moduleName]) &&
    contactInfo.enabled;

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Feature Config</h1>
            <p className="mt-1 text-sm text-muted">
              Turn individual features on or off across the site. Everything here is capped by
              the <span className="font-semibold capitalize">{PLAN}</span> plan — a feature
              outside the current plan can&apos;t be switched on from here, only ones already
              included can be switched off.
            </p>
          </div>
          <BulkFeatureToggle allEnabled={allEnabled} />
        </div>

        <div className="mt-6 space-y-6">
          {MODULE_GROUPS.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </h2>
              <div className="mt-1 divide-y divide-border border-t border-border">
                {group.modules.map((mod) => {
                  const enabled = moduleStates[mod.key] ?? false;
                  const locked = !isModuleInTier(mod.key);
                  return (
                    <FeatureToggleRow
                      key={mod.key}
                      moduleKey={mod.key}
                      label={mod.label}
                      enabled={enabled}
                      locked={locked}
                    />
                  );
                })}
                {/* Backed by contact_info.enabled (lib/contactInfo.js), not module_settings —
                    same field /admin/contact edits — so it's added here manually rather than
                    through MODULE_GROUPS. Only meaningful in the Core group. */}
                {group.label === "Core" && (
                  <FeatureToggleRow
                    label="Contact Us"
                    enabled={contactInfo.enabled}
                    locked={false}
                    action={updateContactInfoFeatureAction}
                    hiddenFields={{}}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
