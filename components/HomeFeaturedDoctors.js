"use client";

import { useEffect, useState } from "react";

function pick(row, field, locale) {
  const en = row[`${field}_en`];
  const bn = row[`${field}_bn`];
  return locale === "bn" ? bn || en : en || bn;
}

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// One per department first, so the strip shows the breadth of the directory rather than four
// cardiologists; topped up from the rest if there are fewer departments than slots. `candidates`
// is expected pre-shuffled so repeat calls surface a different set.
function featuredFrom(candidates, count) {
  const seen = new Set();
  const picked = [];
  for (const d of candidates) {
    if (picked.length === count) break;
    if (seen.has(d.specialty_id)) continue;
    seen.add(d.specialty_id);
    picked.push(d);
  }
  for (const d of candidates) {
    if (picked.length === count) break;
    if (!picked.includes(d)) picked.push(d);
  }
  return picked;
}

// Home-page doctor photo strip: 4 shown on desktop, 2 on mobile (the last 2 hidden via CSS).
// Server-rendered deterministically (first 4 in list order) so there's real markup with no JS,
// then reshuffled to a fresh random 4 right after mount — every visit shows different faces
// instead of the same doctors every time. The mount-time reshuffle (not computed during the
// initial render) is deliberate: doing it during render would make the very first paint random
// too and mismatch the server-rendered HTML.
export default function HomeFeaturedDoctors({ candidates, locale }) {
  const [featured, setFeatured] = useState(() => featuredFrom(candidates, 4));

  // Randomizes only after hydration so the server-rendered markup isn't mismatched by
  // client-only randomness; reshuffles once per mount, not on every prop change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFeatured(featuredFrom(shuffled(candidates), 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (featured.length === 0) return null;

  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-4 lg:mr-0">
      {featured.map((d, i) => (
        <a
          key={d.id}
          href={`/doctors?q=${encodeURIComponent(pick(d, "name", locale) || "")}`}
          className={`group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md ${i >= 2 ? "hidden sm:block" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.photo}
            alt={pick(d, "name", locale)}
            loading="lazy"
            className="aspect-square w-full object-cover object-top transition group-hover:scale-[1.02]"
          />
          <div className="p-3">
            <p className="text-sm font-semibold leading-snug">{pick(d, "name", locale)}</p>
            {pick(d, "specialty", locale) && (
              <p className="mt-0.5 text-xs text-primary">{pick(d, "specialty", locale)}</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
