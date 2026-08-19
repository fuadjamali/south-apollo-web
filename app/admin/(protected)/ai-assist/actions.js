"use server";

import { generateContent } from "@/lib/ai";
import { isModuleEnabled } from "@/lib/plan";
import { getBusinessInfo } from "@/lib/businessInfo";

export async function generateAIContentAction(prevState, formData) {
  // Server-side check regardless of whether the calling form already hides the button for
  // this deployment's plan — the same defense-in-depth reasoning as every other gated action.
  if (!(await isModuleEnabled("ai"))) {
    return { error: "The AI content assistant isn't included in this site's plan." };
  }

  const instruction = formData.get("instruction")?.toString() || "";
  const existingText = formData.get("existingText")?.toString() || "";
  const fieldLabel = formData.get("fieldLabel")?.toString() || "this field";
  const business = await getBusinessInfo();
  const businessContext = `${business.name} — ${business.description}`;

  try {
    const content = await generateContent({ instruction, existingText, fieldLabel, businessContext });
    return { content };
  } catch (err) {
    return { error: err.message || "Couldn't generate content. Please try again." };
  }
}
