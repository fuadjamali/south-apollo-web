import { OVERLAY_OPACITY_CLASSES, TEXT_STYLE_CLASSES } from "@/lib/overlaySettings";

// Shared home-page renderer for a singleton "image + heading + body" section — used by the
// about, vision-mission, and history blocks in app/page.js, which render identically off their
// own Postgres row (lib/aboutInfo.js, lib/visionMissionInfo.js, lib/historyInfo.js). Three real
// call sites, not a speculative abstraction — see components/ImageTextSectionForm.js for the
// admin-side counterpart these rows are edited through.
//
// Three layouts depending on data.image_position: no image is the original centered
// text-only treatment; "left"/"right" is an in-flow image+text grid (image always first/on top
// below md:, so there's no collision risk to design around regardless of body length); "behind"
// reuses the hero section's exact full-bleed-background pattern — object-contain/object-bottom
// below sm:, object-cover/center from sm: up, plus the overlay/text-style scrim — since it
// carries the identical risk hero's own single-image fallback was built to avoid (a long body
// pushing text into an image cropped by an arbitrary uploaded aspect ratio). A first version of
// the hero mobile image used object-cover for this and it visibly overlapped real content once
// the heading grew — object-contain avoids that regardless of section height.
// `sectionStyle` is a passthrough for app/page.js's Home Page Layout `order` value (see that
// file's sectionOrder comment) — applied to whichever root <section> below actually renders,
// same as every other reorderable section on the page. `maxW` is the same file's Fill-toggle
// width class (see its sectionMaxW comment) — only used by the image+text grid layout below;
// the text-only layouts (no image, and the "behind" full-bleed one) keep their own narrower
// max-w-4xl regardless of Fill, since a solid paragraph of body text reading edge-to-edge on a
// wide monitor is a readability regression, not a win, unlike a two-column image+text layout.
export default function ImageTextSection({ id, data, sectionStyle, maxW = "max-w-6xl" }) {
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
            className="h-full w-full object-contain object-bottom sm:object-cover sm:object-center"
          />
          <div className={`absolute inset-0 ${overlayClass}`} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className={`text-3xl font-bold ${textStyle.heading}`}>{data.heading}</h2>
          <p className={`mt-4 whitespace-pre-line ${textStyle.subheading}`}>{data.body}</p>
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
            <p className="mt-4 whitespace-pre-line text-muted">{data.body}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="mx-auto max-w-4xl px-6 py-20 text-center" style={sectionStyle}>
      <h2 className="text-3xl font-bold">{data.heading}</h2>
      <p className="mt-4 whitespace-pre-line text-muted">{data.body}</p>
    </section>
  );
}
