"use server";

import { revalidatePath } from "next/cache";
import { setModuleEnabled } from "@/lib/moduleSettings";
import { setContactInfoEnabled } from "@/lib/contactInfo";
import { ALL_MODULES, isModuleInTier } from "@/lib/plan";

export async function updateFeatureAction(prevState, formData) {
  const moduleName = formData.get("module")?.toString();
  const enabled = formData.get("enabled") === "on";

  if (!ALL_MODULES.includes(moduleName)) {
    return { error: "Unknown feature." };
  }
  // Defense-in-depth: the toggle is already disabled client-side for a module outside this
  // deployment's plan, but a plan-locked module must never become enabled via a direct action
  // call either.
  if (enabled && !isModuleInTier(moduleName)) {
    return { error: "This feature isn't included in the current plan." };
  }

  await setModuleEnabled(moduleName, enabled);

  // A toggled module can affect the home page, admin nav, and both proxy.js route allowlists —
  // revalidate broadly rather than trying to enumerate every affected path.
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  return { success: `${moduleName} ${enabled ? "enabled" : "disabled"}.` };
}

// Contact Us is backed by contact_info.enabled (lib/contactInfo.js), the same field
// /admin/contact edits, not module_settings — kept as one source of truth so the two entry
// points can never disagree with each other.
export async function updateContactInfoFeatureAction(prevState, formData) {
  const enabled = formData.get("enabled") === "on";

  await setContactInfoEnabled(enabled);

  revalidatePath("/", "layout");
  revalidatePath("/admin/contact");

  return { success: `Contact Us ${enabled ? "enabled" : "disabled"}.` };
}

// Turn every feature on or off in one click. Enabling skips any module outside the current
// plan's tier — same "off-only, capped at plan" rule as the individual toggles — so this can
// never unlock something the deployment isn't paying for.
export async function setAllFeaturesAction(prevState, formData) {
  const enabled = formData.get("enabled") === "on";

  await Promise.all([
    ...ALL_MODULES.filter((moduleName) => !enabled || isModuleInTier(moduleName)).map(
      (moduleName) => setModuleEnabled(moduleName, enabled)
    ),
    setContactInfoEnabled(enabled),
  ]);

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  return { success: `All features turned ${enabled ? "on" : "off"}.` };
}
