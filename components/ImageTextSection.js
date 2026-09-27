import {
  IconCircleCheck,
  IconStar,
  IconBolt,
  IconHeart,
  IconShieldCheck,
  IconTarget,
} from "@tabler/icons-react";
import { OVERLAY_OPACITY_CLASSES, TEXT_STYLE_CLASSES } from "@/lib/overlaySettings";

// Shared home-page renderer for a singleton "image + heading + body" section — used by the
// about, vision-mission, and history blocks in app/page.js, which render identically off their
// own Postgres row (lib/aboutInfo.js, lib/visionMissionInfo.js, lib/historyInfo.js). Three real
// call sites, not a speculative abstraction — see components/ImageTextSectionForm.js for the
// admin-side counterpart these rows are edited through.
//
// Content-shape detection: rather than adding admin fields for "is this a timeline" or "is this
// a feature list," the three parsers below pattern-match the plain body text itself and upgrade
// it to a richer layout only when it actually has that shape — anything else falls through to an
// ordinary paragraph, so an admin never has to opt into anything or learn a markup syntax.
//   admin types plain text -> 3 parsers try to match its shape -> cards / timeline / icon list / plain paragraph
//
// The matched shape is orthogonal to the outer layout (no image / left-right / behind), decided
// separately below by data.image_position.

function splitBlocks(body) {
  return (body || "")
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

// "Our Mission ... Our Vision ..." (or reversed — real content on this site has Vision first) —
// exactly two blocks, one starting "Our vision", the other "Our mission", case-insensitive.
// Anything else (wrong block count, missing either prefix) falls through to the next parser.
// The Bangla body (translations.bn.body) gets the same treatment: "আমাদের ভিশন" / "আমাদের মিশন"
// (or রূপকল্প / লক্ষ্য), with the Bangla words as the card labels.
const VISION_PREFIX = /^(our vision\b|আমাদের (ভিশন|রূপকল্প))/i;
const MISSION_PREFIX = /^(our mission\b|আমাদের (মিশন|লক্ষ্য))/i;

function splitMissionVision(body) {
  const blocks = splitBlocks(body);
  if (blocks.length !== 2) return null;
  const visionIndex = blocks.findIndex((b) => VISION_PREFIX.test(b));
  const missionIndex = blocks.findIndex((b) => MISSION_PREFIX.test(b));
  if (visionIndex === -1 || missionIndex === -1) return null;
  const label = (text, prefixRe, english) => {
    const matched = text.match(prefixRe)[1];
    return /^our /i.test(matched) ? english : matched;
  };
  return blocks.map((text, i) => ({
    label: i === visionIndex ? label(text, VISION_PREFIX, "Our Vision") : label(text, MISSION_PREFIX, "Our Mission"),
    text,
  }));
}

// Loose "<date-ish text ending in a year>: " prefix — "August 5, 2024:", "End of Feb-2026:",
// "Early 2025:" all qualify, deliberately not tied to one date format.
const TIMELINE_PREFIX = /^(.{2,60}?(?:19|20)\d{2})\s*:\s*([\s\S]*)$/;
// "Short Label: what it means" — checked after the timeline prefix, so a dated block is never
// double-claimed by the feature-list parser (a date is itself a short label followed by a colon).
const FEATURE_PREFIX = /^([^:\n]{1,50}):\s*([\s\S]*)$/;

// Finds the longest run of `minLength`+ consecutive blocks matching `prefixRe`, and splits the
// body around it into {before, items, after}. Only the first/longest qualifying run is used — a
// body isn't expected to contain two separate timelines or feature lists.
function findRun(blocks, prefixRe, minLength) {
  let bestStart = -1;
  let bestLength = 0;
  let runStart = -1;
  for (let i = 0; i <= blocks.length; i++) {
    const matches = i < blocks.length && prefixRe.test(blocks[i]);
    if (matches) {
      if (runStart === -1) runStart = i;
    } else {
      const runLength = runStart === -1 ? 0 : i - runStart;
      if (runLength >= minLength && runLength > bestLength) {
        bestStart = runStart;
        bestLength = runLength;
      }
      runStart = -1;
    }
  }
  if (bestStart === -1) return null;
  return {
    before: blocks.slice(0, bestStart),
    items: blocks.slice(bestStart, bestStart + bestLength).map((b) => {
      const m = b.match(prefixRe);
      return { label: m[1].trim(), text: m[2].trim() };
    }),
    after: blocks.slice(bestStart + bestLength),
  };
}

// Two or more consecutive dated blocks -> a connected vertical timeline, everything before/after
// kept as intro/outro paragraphs. History's typical shape.
function parseTimeline(body) {
  const run = findRun(splitBlocks(body), TIMELINE_PREFIX, 2);
  if (!run) return null;
  return { before: run.before, after: run.after, milestones: run.items };
}

// Three or more consecutive "Label: text" blocks -> an icon list (6 icons, cycled by index — not
// tied to the label text, since labels are free-form). Requires 3+ specifically so it never fires
// on Vision & Mission's exact 2-block shape, which splitMissionVision already owns. About's
// typical shape.
function parseFeatureList(body) {
  const run = findRun(splitBlocks(body), FEATURE_PREFIX, 3);
  if (!run) return null;
  return { before: run.before, after: run.after, features: run.items };
}

function resolveContent(body) {
  const missionVision = splitMissionVision(body);
  if (missionVision) return { kind: "missionVision", data: missionVision };
  const timeline = parseTimeline(body);
  if (timeline) return { kind: "timeline", data: timeline };
  const featureList = parseFeatureList(body);
  if (featureList) return { kind: "featureList", data: featureList };
  return { kind: "plain", data: body };
}

// `onImage` swaps the normal theme-tinted card surface for a translucent white-on-blur
// treatment — the theme surface tint reads muddy layered over a photo, white glass reads
// correctly regardless of which color theme or light/dark mode is active. `compact` stacks a
// multi-column shape (cards, feature list) to one column — used when this content is rendering
// inside the narrower half of a left/right image+text grid rather than a full-width section.

function MissionVisionCards({ items, onImage, compact }) {
  const cardClass = onImage
    ? "rounded-xl border border-white/25 bg-white/15 p-6 backdrop-blur-md"
    : "rounded-xl border border-border bg-surface p-6 shadow-sm";
  const labelClass = onImage ? "text-white" : "text-foreground";
  const textClass = onImage ? "text-white/85" : "text-muted";
  return (
    <div className={`grid gap-6 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
      {items.map((item) => (
        <div key={item.label} className={cardClass}>
          <h3 className={`text-lg font-semibold ${labelClass}`}>{item.label}</h3>
          <p className={`mt-2 whitespace-pre-line ${textClass}`}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function Timeline({ before, after, milestones, onImage }) {
  const paraClass = onImage ? "text-white/90" : "text-muted";
  const cardClass = onImage
    ? "rounded-xl border border-white/25 bg-white/15 p-4 backdrop-blur-md"
    : "rounded-xl border border-border bg-surface p-4 shadow-sm";
  const dateClass = onImage ? "text-white" : "text-foreground";
  const bodyClass = onImage ? "text-white/85" : "text-muted";
  const lineClass = onImage ? "bg-white/30" : "bg-border";
  const dotClass = onImage ? "border-white bg-white/30" : "border-primary bg-primary/20";

  return (
    <div>
      {before.map((p, i) => (
        <p key={`before-${i}`} className={`mb-4 whitespace-pre-line ${paraClass}`}>
          {p}
        </p>
      ))}
      <div className="mx-auto max-w-2xl">
        {milestones.map((milestone, index) => (
          <div key={`${milestone.label}-${index}`} className="relative pb-8 pl-8 last:pb-0">
            {index < milestones.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[7px] top-4 h-[calc(100%-1rem)] w-px ${lineClass}`}
              />
            )}
            <span
              aria-hidden
              className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 ${dotClass}`}
            />
            <div className={cardClass}>
              <p className={`text-sm font-semibold ${dateClass}`}>{milestone.label}</p>
              <p className={`mt-1 whitespace-pre-line ${bodyClass}`}>{milestone.text}</p>
            </div>
          </div>
        ))}
      </div>
      {after.map((p, i) => (
        <p key={`after-${i}`} className={`mt-4 whitespace-pre-line ${paraClass}`}>
          {p}
        </p>
      ))}
    </div>
  );
}

const FEATURE_ICONS = [IconCircleCheck, IconStar, IconBolt, IconHeart, IconShieldCheck, IconTarget];

function FeatureList({ before, after, features, onImage, compact }) {
  const cardClass = onImage
    ? "rounded-xl border border-white/25 bg-white/15 p-6 backdrop-blur-md"
    : "rounded-xl border border-border bg-surface p-6 shadow-sm";
  const paraClass = onImage ? "text-white/90" : "text-muted";
  const labelClass = onImage ? "text-white" : "text-foreground";
  const bodyClass = onImage ? "text-white/85" : "text-muted";
  const iconWrapClass = onImage ? "bg-white/20 text-white" : "bg-primary text-primary-foreground";

  return (
    <div>
      {before.map((p, i) => (
        <p key={`before-${i}`} className={`mb-4 whitespace-pre-line ${paraClass}`}>
          {p}
        </p>
      ))}
      <div className={`grid gap-6 ${compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {features.map((feature, index) => {
          const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
          return (
            <div key={`${feature.label}-${index}`} className={cardClass}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrapClass}`}>
                <Icon size={22} stroke={1.75} />
              </div>
              <h3 className={`mt-3 font-semibold ${labelClass}`}>{feature.label}</h3>
              <p className={`mt-1 text-sm whitespace-pre-line ${bodyClass}`}>{feature.text}</p>
            </div>
          );
        })}
      </div>
      {after.map((p, i) => (
        <p key={`after-${i}`} className={`mt-4 whitespace-pre-line ${paraClass}`}>
          {p}
        </p>
      ))}
    </div>
  );
}

function renderContent(content, { onImage = false, compact = false } = {}) {
  if (content.kind === "plain") {
    return (
      <p className={`mt-4 whitespace-pre-line ${onImage ? "text-white/85" : "text-muted"}`}>
        {content.data}
      </p>
    );
  }
  return (
    <div className="mt-8">
      {content.kind === "missionVision" && (
        <MissionVisionCards items={content.data} onImage={onImage} compact={compact} />
      )}
      {content.kind === "timeline" && <Timeline {...content.data} onImage={onImage} />}
      {content.kind === "featureList" && (
        <FeatureList {...content.data} onImage={onImage} compact={compact} />
      )}
    </div>
  );
}

// Three layouts depending on data.image_position: no image is the original centered
// text-only treatment; "left"/"right" is an in-flow image+text grid (image always first/on top
// below md:, so there's no collision risk to design around regardless of body length); "behind"
// reuses the hero section's exact full-bleed-background pattern — object-contain/object-bottom
// below sm:, object-cover/center from sm: up, plus the overlay/text-style scrim — since it
// carries the identical risk hero's own single-image fallback was built to avoid (a long body
// pushing text into an image cropped by an arbitrary uploaded aspect ratio). A first version of
// the hero mobile image used object-cover for this and it visibly overlapped real content once
// the heading grew — object-contain avoids that regardless of section height. The image itself
// renders at a fixed 45% opacity on top of the overlay scrim — full-strength behind a long
// timeline or card grid reads as visual noise, not a backdrop.
// `sectionStyle` is a passthrough for app/page.js's Home Page Layout `order` value (see that
// file's sectionOrder comment) — applied to whichever root <section> below actually renders,
// same as every other reorderable section on the page. `maxW` is the same file's Fill-toggle
// width class (see its sectionMaxW comment) — only used by the image+text grid layout below; the
// text-only layouts (no image, and the "behind" full-bleed one) keep their own max-w regardless
// of Fill, widened from the plain-paragraph max-w-4xl once a parser matches and the content needs
// more room than a single paragraph column (max-w-5xl for cards/feature-list, max-w-3xl for the
// narrower vertical timeline).
export default function ImageTextSection({ id, data, sectionStyle, maxW = "max-w-6xl" }) {
  const content = resolveContent(data.body);
  const textMaxW =
    content.kind === "plain"
      ? "max-w-4xl"
      : content.kind === "timeline"
        ? "max-w-3xl"
        : "max-w-5xl";

  if (data.image && data.image_position === "behind") {
    const overlayClass = OVERLAY_OPACITY_CLASSES[data.overlay_strength] || OVERLAY_OPACITY_CLASSES.medium;
    const textStyle = TEXT_STYLE_CLASSES[data.text_style] || TEXT_STYLE_CLASSES.auto;
    return (
      <section id={id} className="relative isolate overflow-hidden" style={sectionStyle}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#c7dcff] to-[#93b8f5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt=""
            className="h-full w-full object-contain object-bottom opacity-45 sm:object-cover sm:object-center"
          />
          <div className={`absolute inset-0 ${overlayClass}`} />
        </div>
        <div className={`relative mx-auto ${textMaxW} px-6 py-20 text-center`}>
          <h2 className={`text-3xl font-bold ${textStyle.heading}`}>{data.heading}</h2>
          {renderContent(content, { onImage: true })}
        </div>
      </section>
    );
  }

  if (data.image) {
    return (
      <section id={id} className={`mx-auto ${maxW} px-6 py-20`} style={sectionStyle}>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className={data.image_position === "right" ? "md:order-2" : ""}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt="" className="w-full rounded-2xl object-cover" />
          </div>
          <div className={data.image_position === "right" ? "md:order-1" : ""}>
            <h2 className="text-3xl font-bold">{data.heading}</h2>
            {renderContent(content, { compact: true })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={`mx-auto ${textMaxW} px-6 py-20 text-center`} style={sectionStyle}>
      <h2 className="text-3xl font-bold">{data.heading}</h2>
      {renderContent(content)}
    </section>
  );
}
