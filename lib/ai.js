import { isModuleEnabled } from "@/lib/plan";
import { getAISettings } from "@/lib/aiSettings";

// Plain fetch to the Claude Messages API rather than adding the @anthropic-ai/sdk dependency
// for what's essentially one call — matches the pragmatic style of the rest of lib/ (e.g.
// lib/blob.js does the same thing for Vercel Blob's REST surface where it needs to).
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5-20250929";

// Whether the "Write with AI" button should even render — checked by every page that decides
// whether to pass aiEnabled to a form. Two independent gates: the deployment's pricing tier
// (fixed per client, set via PLAN) and the admin's own on/off toggle (self-serve, to turn API
// spend off without losing the configured key) — see /admin/ai-settings.
export async function isAIAssistantEnabled() {
  if (!isModuleEnabled("ai")) return false;
  const settings = await getAISettings();
  return settings.enabled;
}

export async function generateContent({ instruction, existingText, fieldLabel, businessContext }) {
  const settings = await getAISettings();
  if (!settings.enabled) {
    throw new Error("The AI content assistant is turned off. Enable it under Settings → AI Assistant.");
  }

  const apiKey = settings.api_key || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI content assistant isn't configured — add an API key under Settings → AI Assistant."
    );
  }
  if (!instruction?.trim()) {
    throw new Error("Tell the assistant what you'd like written.");
  }

  const prompt = [
    `You are helping write website copy for a small business${businessContext ? `: ${businessContext}` : "."}.`,
    `You're writing content for a "${fieldLabel}" field.`,
    existingText?.trim()
      ? `The current text in that field is:\n"""\n${existingText.trim()}\n"""\nThe user's instruction may ask you to rewrite, extend, or replace this.`
      : "That field is currently empty.",
    `User's instruction: ${instruction.trim()}`,
    "Reply with ONLY the finished field content — no preamble, no markdown formatting, no quotation marks around it, no explanation of what you did.",
  ].join("\n\n");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) {
    throw new Error("The assistant didn't return any content — try rephrasing your instruction.");
  }
  return text;
}
