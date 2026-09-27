"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { OVERLAY_OPACITY_CLASSES, TEXT_STYLE_CLASSES } from "@/lib/overlaySettings";
import { useT } from "@/components/LocaleContext";

const AUTOPLAY_MS = 7000;

// Renders one slide's background — same image markup/reasoning app/page.js's hero section has
// always used (see the long object-contain/object-bottom comment this was lifted from), plus a
// video variant. `active` drives the Ken Burns pan/zoom (CSS class further down) and, for video,
// imperative play()/pause() so only the on-screen slide's video actually decodes/plays.
//
// `slide.focal_position` (0-100, lib/heroSlides.js's per-slide vertical anchor, editable in
// HeroSlideForm's live preview) drives object-position's Y axis on every object-cover render
// below — the mobile image, the desktop image, and video. It's applied as an inline style
// rather than a Tailwind object-position utility since those are fixed keywords, not arbitrary
// admin-chosen percentages. The one exception is the single-image-with-no-mobile-variant case's
// object-contain/object-bottom fallback below `sm:` — that's a fixed, deliberate anti-collision
// measure (a long heading previously overlapped a cropped-arbitrarily photo on phones), not a
// framing choice, so it stays untouched by the focal-position control.
function SlideMedia({ slide, active, reducedMotion }) {
  const videoRef = useRef(null);
  const focalStyle = { objectPosition: `center ${slide.focal_position ?? 50}%` };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  const kenBurnsClass = active && !reducedMotion ? "hero-slide-kenburns" : "";

  if (slide.media_type === "video" && slide.background_video) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        ref={videoRef}
        src={slide.background_video}
        muted
        loop
        playsInline
        preload={active ? "auto" : "none"}
        style={focalStyle}
        className={`h-full w-full object-cover ${kenBurnsClass}`}
      />
    );
  }

  if (!slide.background_image) return null;

  if (slide.background_image_mobile) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.background_image_mobile}
          alt=""
          style={focalStyle}
          className={`h-full w-full object-cover sm:hidden ${kenBurnsClass}`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.background_image}
          alt=""
          style={focalStyle}
          className={`hidden h-full w-full object-cover sm:block ${kenBurnsClass}`}
        />
      </>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.background_image}
      alt=""
      // A plain inline `style` would apply object-position at every size, including below
      // `sm:` where object-bottom needs to win untouched — so the focal position is threaded
      // through as a CSS variable instead, only consumed by the sm:+ arbitrary-value class,
      // leaving the mobile object-bottom utility alone.
      style={{ "--hero-focal": `center ${slide.focal_position ?? 50}%` }}
      className={`h-full w-full object-contain object-bottom sm:object-cover sm:[object-position:var(--hero-focal)] ${kenBurnsClass}`}
    />
  );
}

// The hero banner — one slide behaves exactly like the old single hero always did (no chrome at
// all, zero visual change); two or more play as an autoplaying carousel. `slides` is already
// filtered to active-only, in display order (lib/heroSlides.getActiveHeroSlides). `sectionMaxW`
// is the Home Page Layout Fill-width class, same as every other section on the page. `heightPx`
// (lib/heroSlides.js's getHeroSettings(), admin-editable at /admin/hero) fixes the section to an
// exact height instead of letting it follow its content — null/undefined keeps today's default
// (auto, content-driven) height.
export default function HeroCarousel({ slides, sectionMaxW, heightPx }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef(null);
  const multi = slides.length > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!multi || paused || hidden || reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [multi, paused, hidden, reducedMotion, slides.length]);

  function goTo(next) {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  }
  function handleKeyDown(e) {
    if (!multi) return;
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  }

  const slide = slides[index];
  // "auto" (the default, and the only option most admins ever pick) renders as "light" — white
  // text — since the fixed scrim below guarantees enough contrast for it on any photo. Left as
  // its own TEXT_STYLES entry so an admin can still explicitly force "dark" for a deliberately
  // light/pastel photo where white text would wash out.
  const heroStyle = slide.text_style === "dark" ? TEXT_STYLE_CLASSES.dark : TEXT_STYLE_CLASSES.light;
  const textAnimClass = reducedMotion ? "" : "hero-slide-text-enter";

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ order: -1, ...(heightPx ? { height: heightPx, minHeight: heightPx } : {}) }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @keyframes hero-kenburns { from { transform: scale(1); } to { transform: scale(1.08); } }
        .hero-slide-kenburns { animation: hero-kenburns ${AUTOPLAY_MS + 1500}ms ease-out forwards; }
        @keyframes hero-text-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .hero-slide-text-enter > * { animation: hero-text-enter 600ms ease-out both; }
        .hero-slide-text-enter > *:nth-child(2) { animation-delay: 90ms; }
        .hero-slide-text-enter > *:nth-child(3) { animation-delay: 180ms; }
        @keyframes hero-progress-fill { from { width: 0%; } to { width: 100%; } }
        .hero-progress-fill { animation: hero-progress-fill ${AUTOPLAY_MS}ms linear forwards; }
      `}</style>

      {/* Every active slide's media is kept mounted (not just the current one), crossfaded via
          opacity — the extra load is small for a handful of hero slides, and it means the next
          slide's asset never has to fetch on-transition (an eager, simpler stand-in for manual
          preloading). Video playback is still gated to the active slide only, see SlideMedia. */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 bg-gradient-to-br from-[#c7dcff] to-[#93b8f5] transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <SlideMedia slide={s} active={i === index} reducedMotion={reducedMotion} />
          {/* A fixed dark scrim guarantees enough contrast for the white heading text (below)
              on ANY photo, bright/busy ones included — text used to be stamped directly on the
              raw image with nothing darkening it, a real legibility bug on high-contrast
              photos. Black rather than a theme token deliberately: this is a photographic
              darkening treatment, not a themed UI surface, so it stays correct across all 8
              color themes and both light/dark mode instead of following them. */}
          <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
          {/* On top of that, the theme-color wash an admin configures per-slide (Hero Slide
              form's "overlay strength") — a secondary, subtle brand-color tint rather than the
              sole contrast mechanism. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${
              OVERLAY_OPACITY_CLASSES[s.overlay_strength] || OVERLAY_OPACITY_CLASSES.medium
            }`}
          />
        </div>
      ))}

      <div key={index} className={`relative mx-auto ${sectionMaxW} px-6 py-24 text-center`}>
        <h1
          className={`text-4xl font-extrabold tracking-tight sm:text-6xl ${heroStyle.heading} ${textAnimClass}`}
        >
          {slide.heading.includes(". ") ? (
            <>
              {slide.heading.slice(0, slide.heading.indexOf(". ") + 1)}
              <br />
              {slide.heading.slice(slide.heading.indexOf(". ") + 2)}
            </>
          ) : (
            slide.heading
          )}
        </h1>
        <div className={textAnimClass}>
          <p className={`mx-auto mt-6 max-w-2xl text-lg ${heroStyle.subheading}`}>{slide.subheading}</p>
        </div>
        <div className={`mt-8 flex justify-center gap-4 ${textAnimClass}`}>
          {slide.primary_cta_label && (
            <a
              href={slide.primary_cta_href || "#"}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {slide.primary_cta_label}
            </a>
          )}
          {slide.secondary_cta_label && (
            <a
              href={slide.secondary_cta_href || "#"}
              className={`rounded-full border px-6 py-3 text-sm font-semibold ${heroStyle.secondaryBtn}`}
            >
              {slide.secondary_cta_label}
            </a>
          )}
        </div>
      </div>

      {multi && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={t("hero.previousSlide")}
            className={`absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2 backdrop-blur transition hover:scale-105 ${
              heroStyle === TEXT_STYLE_CLASSES.light
                ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
                : "border-border bg-surface/70 text-foreground hover:bg-surface-alt"
            }`}
          >
            <IconChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={t("hero.nextSlide")}
            className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2 backdrop-blur transition hover:scale-105 ${
              heroStyle === TEXT_STYLE_CLASSES.light
                ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
                : "border-border bg-surface/70 text-foreground hover:bg-surface-alt"
            }`}
          >
            <IconChevronRight size={20} />
          </button>

          {/* Segmented progress indicator — each bar fills over the autoplay interval (paused,
              via CSS animation-play-state, whenever hover/visibility/reduced-motion has paused
              autoplay itself), and doubles as click-to-jump navigation. */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={t("hero.goToSlide", { number: i + 1 })}
                aria-current={i === index}
                className="h-1.5 w-8 overflow-hidden rounded-full bg-white/30"
              >
                <span
                  className="block h-full rounded-full bg-white"
                  style={{
                    width: i < index ? "100%" : i > index ? "0%" : undefined,
                    // Longhand animation-* properties only, never mixed with the `animation`
                    // shorthand on the same element — React warns (and can silently drop a
                    // later update) when a shorthand and one of its own longhands are both set
                    // across rerenders, which this span's props do every tick (index/paused
                    // change on every autoplay tick and every hover).
                    animationName:
                      i === index && !paused && !hidden && !reducedMotion ? "hero-progress-fill" : undefined,
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Announces the change for screen reader / assistive-tech users, who don't get the
          visual crossfade as a signal that content moved. */}
      <div aria-live="polite" className="sr-only">
        {multi
          ? t("hero.slideStatus", { number: index + 1, total: slides.length, heading: slide.heading })
          : ""}
      </div>
    </section>
  );
}
