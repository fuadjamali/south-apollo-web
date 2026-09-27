import {
  IconCircleCheck,
  IconStar,
  IconBolt,
  IconHeart,
  IconShieldCheck,
  IconTarget,
  IconHeartbeat,
  IconDroplet,
  IconRibbonHealth,
  IconAmbulance,
  IconMicroscope,
  IconDeviceLaptop,
  IconBriefcase,
  IconHeartHandshake,
  IconStethoscope,
  IconQuote,
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
  return { kind: "structured", data: parseStructured(body) };
}

// Everything that isn't one of the shapes above: ordinary prose, read for the light structure
// admins write without thinking of it as markup — the same in English and Bangla:
//   a short first line of a block with more lines under it ("Apollo Vision 2050") -> sub-title
//   "Area — what it covers" lines                                                -> icon cards
//   a line wrapped in quotes (“…”)                                              -> feature quote
//   anything else                                                                -> paragraph
// The first paragraph becomes a larger lead when there's more than one.
const DASH_ITEM = /^(.{2,70}?)\s+[—–]\s+(.+)$/;
const QUOTE_LINE = /^[“"](.+)[”"]$/;
const ENDS_LIKE_SENTENCE = /[.!?।:;,]$/;

function parseStructured(body) {
  const nodes = [];
  const push = (node) => {
    const last = nodes[nodes.length - 1];
    if (node.type === "features" && last?.type === "features") last.items.push(...node.items);
    else nodes.push(node);
  };
  for (const block of splitBlocks(body)) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let paragraph = [];
    const flush = () => {
      if (paragraph.length) push({ type: "para", text: paragraph.join("\n") });
      paragraph = [];
    };
    lines.forEach((line, i) => {
      const dash = line.match(DASH_ITEM);
      const quote = line.match(QUOTE_LINE);
      if (quote) {
        flush();
        push({ type: "quote", text: quote[1].trim() });
      } else if (dash) {
        flush();
        push({ type: "features", items: [{ label: dash[1].trim(), text: dash[2].trim() }] });
      } else if (i === 0 && lines.length > 1 && line.length <= 70 && !ENDS_LIKE_SENTENCE.test(line)) {
        push({ type: "title", text: line });
      } else {
        paragraph.push(line);
      }
    });
    flush();
  }
  const paragraphs = nodes.filter((n) => n.type === "para");
  if (paragraphs.length > 1 && nodes[0]?.type === "para") nodes[0] = { ...nodes[0], type: "lead" };
  return nodes;
}

// A medical icon per feature card, picked from its label (English or Bangla) — the list of
// future-plan areas is free text, so this matches on the words rather than a fixed position.
const MEDICAL_ICONS = [
  [/cardi|heart|হৃদ|কার্ডি|হার্ট/i, IconHeartbeat],
  [/kidney|dialysis|কিডনি|ডায়ালাইসিস/i, IconDroplet],
  [/cancer|onco|ক্যান্সার/i, IconRibbonHealth],
  [/emergency|trauma|ইমার্জেন্সি|জরুরি|ট্রমা/i, IconAmbulance],
  [/diagnos|lab|রোগনির্ণয়|ডায়াগনস্টিক|ল্যাব/i, IconMicroscope],
  [/digital|online|ডিজিটাল|অনলাইন/i, IconDeviceLaptop],
  [/corporate|কর্পোরেট/i, IconBriefcase],
  [/integrated|care|সমন্বিত|সেবা/i, IconHeartHandshake],
];
const featureIcon = (label) => (MEDICAL_ICONS.find(([re]) => re.test(label)) || [null, IconStethoscope])[1];

function StructuredBody({ nodes, onImage = false, wide = true }) {
  const muted = onImage ? "text-white/85" : "text-muted";
  return (
    <div className="text-left">
      {nodes.map((node, i) => {
        if (node.type === "lead") {
          return (
            <p key={i} className={`mt-5 max-w-4xl whitespace-pre-line text-lg leading-relaxed ${onImage ? "text-white" : "text-foreground/85"}`}>
              {node.text}
            </p>
          );
        }
        if (node.type === "para") {
          return (
            <p key={i} className={`mt-4 max-w-4xl whitespace-pre-line leading-relaxed ${muted}`}>
              {node.text}
            </p>
          );
        }
        if (node.type === "title") {
          return (
            <h3 key={i} className={`mt-12 flex items-center gap-3 text-xl font-bold sm:text-2xl ${onImage ? "text-white" : ""}`}>
              <span className="h-7 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              {node.text}
            </h3>
          );
        }
        if (node.type === "quote") {
          return (
            <blockquote
              key={i}
              className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl bg-primary px-8 py-10 text-center text-lg font-medium leading-relaxed text-primary-foreground shadow-lg sm:px-14 sm:text-xl"
            >
              <IconQuote size={64} className="absolute -left-2 -top-2 opacity-15" aria-hidden="true" />
              {node.text}
            </blockquote>
          );
        }
        // features
        return (
          <div key={i} className={`mt-6 grid gap-4 ${wide ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
            {node.items.map((item) => {
              const Icon = featureIcon(item.label);
              return (
                <div
                  key={item.label}
                  className={
                    onImage
                      ? "rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-md"
                      : "rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  }
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={24} stroke={1.75} aria-hidden="true" />
                  </div>
                  <h4 className={`mt-4 font-semibold leading-snug ${onImage ? "text-white" : ""}`}>{item.label}</h4>
                  <p className={`mt-1 text-sm leading-relaxed ${muted}`}>{item.text}</p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Splits structured content for the image layout: the opening prose sits beside the image, and
// everything from the first sub-title, card grid or quote onward runs full width underneath,
// where cards and a long read have room. Bodies with no such break keep it all beside the image.
function splitIntro(nodes) {
  const cut = nodes.findIndex((n, i) => i > 0 && n.type !== "para");
  return cut === -1 ? [nodes, []] : [nodes.slice(0, cut), nodes.slice(cut)];
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
  if (content.kind === "structured") {
    return <StructuredBody nodes={content.data} onImage={onImage} wide={!compact} />;
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

// Small label + heading + accent rule, shared by every layout below.
function SectionHeading({ heading, eyebrow, onImage = false, center = false }) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            onImage ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}
        >
          <IconHeartbeat size={16} aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${onImage ? "" : "text-foreground"}`}>
        {heading}
      </h2>
      <span className={`mt-4 block h-1 w-16 rounded-full bg-accent ${center ? "mx-auto" : ""}`} aria-hidden="true" />
    </div>
  );
}

// Three layouts depending on data.image_position: no image is a centered heading over the
// content; "left"/"right" is an image+text grid — the opening prose beside the photo, and any
// sub-titled sections, card grid or quote running full width underneath (see splitIntro);
// "behind" reuses the hero section's full-bleed-background pattern — object-contain/object-bottom
// below sm:, object-cover/center from sm: up, plus the overlay/text-style scrim, with the image
// at a fixed 45% opacity so a long body doesn't read as visual noise over it.
// `eyebrow` is the small label above the heading and `badge` the floating card on the photo (both
// optional, passed by app/page.js); `tinted` gives the section a soft surface band so two of
// these in a row read as separate sections. `sectionStyle` carries the Home Page Layout `order`
// value; `maxW` is the Fill-toggle width class used by the image+text grid.
export default function ImageTextSection({
  id,
  data,
  sectionStyle,
  maxW = "max-w-6xl",
  eyebrow,
  badge,
  tinted = false,
}) {
  const content = resolveContent(data.body);
  const textMaxW = content.kind === "timeline" ? "max-w-3xl" : "max-w-5xl";
  const band = tinted ? "bg-gradient-to-b from-surface-alt to-background" : "";

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
        <div className={`relative mx-auto ${textMaxW} px-6 py-20 ${textStyle.heading}`}>
          <SectionHeading heading={data.heading} eyebrow={eyebrow} onImage center />
          {renderContent(content, { onImage: true })}
        </div>
      </section>
    );
  }

  if (data.image) {
    const imageRight = data.image_position === "right";
    const [intro, rest] = content.kind === "structured" ? splitIntro(content.data) : [null, null];
    return (
      <section id={id} className={band} style={sectionStyle}>
        <div className={`mx-auto ${maxW} px-6 py-20`}>
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
            <div className={`relative ${imageRight ? "md:order-2" : ""}`}>
              {/* Offset tinted frame behind the photo — a soft clinical accent, not a border. */}
              <div
                className={`absolute -bottom-4 h-full w-full rounded-3xl bg-primary/10 ${imageRight ? "-left-4" : "-right-4"}`}
                aria-hidden="true"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt={data.heading} className="relative w-full rounded-3xl object-cover shadow-xl" />
              {badge && (
                <div
                  className={`absolute -bottom-6 flex items-center gap-3 rounded-2xl bg-surface px-5 py-3 shadow-lg ring-1 ring-border ${
                    imageRight ? "right-6" : "left-6"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <IconStethoscope size={22} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">{badge}</span>
                </div>
              )}
            </div>
            <div className={imageRight ? "md:order-1" : ""}>
              <SectionHeading heading={data.heading} eyebrow={eyebrow} />
              {intro ? <StructuredBody nodes={intro} wide={false} /> : renderContent(content, { compact: true })}
            </div>
          </div>
          {rest && rest.length > 0 && (
            <div className="mt-8">
              <StructuredBody nodes={rest} />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={band} style={sectionStyle}>
      <div className={`mx-auto ${textMaxW} px-6 py-20`}>
        <SectionHeading heading={data.heading} eyebrow={eyebrow} center />
        {renderContent(content)}
      </div>
    </section>
  );
}
