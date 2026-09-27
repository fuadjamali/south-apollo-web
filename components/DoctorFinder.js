"use client";

import { useMemo, useState } from "react";
import {
  IconSearch,
  IconX,
  IconStethoscope,
  IconClock,
  IconDoor,
  IconCash,
  IconPhone,
  IconSparkles,
  IconVideo,
  IconCalendarPlus,
} from "@tabler/icons-react";
import { useLocale, useT } from "@/components/LocaleContext";
import { buildIndex, searchDoctors, suggestSpecialties, FINDER_PROBLEMS } from "@/lib/doctorSearch";

// Picks the current language's value, falling back to the other one so a doctor whose Bangla
// (or English) text hasn't been entered yet still shows something.
function pick(row, field, locale) {
  const en = row[`${field}_en`];
  const bn = row[`${field}_bn`];
  return locale === "bn" ? bn || en : en || bn;
}

function telHref(number) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

function initials(name) {
  const words = (name || "").replace(/^(prof\.?|dr\.?)\s+/gi, "").split(/\s+/).filter(Boolean);
  return words.slice(-2).map((w) => w[0]).join("").toUpperCase();
}

function DoctorCard({ doctor, locale, t, hotline }) {
  const name = pick(doctor, "name", locale);
  const specialty = pick(doctor, "specialty", locale);
  const schedule = pick(doctor, "schedule", locale);
  const expertise = pick(doctor, "expertise", locale);
  const phone = doctor.serial_phone || hotline;

  return (
    <article className="@container flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex gap-4">
        {doctor.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doctor.photo}
            alt={name}
            loading="lazy"
            className="h-28 w-[5.6rem] shrink-0 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-28 w-[5.6rem] shrink-0 items-center justify-center rounded-xl bg-surface-alt text-2xl font-bold text-primary">
            {initials(doctor.name_en || name)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">{name}</h3>
          {pick(doctor, "degrees", locale) && (
            <p className="mt-1 whitespace-pre-line text-sm text-muted">{pick(doctor, "degrees", locale)}</p>
          )}
          {pick(doctor, "designation", locale) && (
            <p className="mt-1 whitespace-pre-line text-sm">{pick(doctor, "designation", locale)}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {specialty && (
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                {specialty}
              </span>
            )}
            {doctor.telehealth && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-600/10 px-3 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                <IconVideo size={14} aria-hidden="true" />
                {t("doctors.telehealth")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-1.5 text-sm">
        {expertise && (
          <p className="text-muted">
            <span className="font-semibold text-foreground">{t("doctors.expertise")}:</span> {expertise}
          </p>
        )}
        {schedule && (
          <p className="flex gap-2">
            <IconClock size={18} className="mt-px shrink-0 text-primary" aria-label={t("doctors.schedule")} />
            <span className="whitespace-pre-line">{schedule}</span>
          </p>
        )}
        {(doctor.room || doctor.fee) && (
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
            {doctor.room && (
              <span className="inline-flex items-center gap-1.5">
                <IconDoor size={18} className="text-primary" aria-hidden="true" />
                {t("doctors.room", { room: doctor.room })}
              </span>
            )}
            {doctor.fee && (
              <span className="inline-flex items-center gap-1.5">
                <IconCash size={18} className="text-primary" aria-hidden="true" />
                {t("doctors.fee", { amount: doctor.fee.toLocaleString("en-US") })}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Both ways to get a serial, always side by side: request one online, or call. */}
      <div className={`mt-4 grid grid-cols-1 gap-2 ${phone ? "@[22rem]:grid-cols-2" : ""}`}>
        <a
          href={`/doctors/book?doctor=${doctor.id}`}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-2.5 text-center text-sm font-semibold text-accent-foreground hover:brightness-90"
        >
          <IconCalendarPlus size={16} aria-hidden="true" />
          {t("doctors.book")}
        </a>
        {phone && (
          <a
            href={telHref(phone)}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-primary px-3 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/10"
            aria-label={`${t("doctors.callSerial")} ${phone}`}
          >
            <IconPhone size={16} aria-hidden="true" />
            {t("doctors.callSerial")}
          </a>
        )}
      </div>
    </article>
  );
}

export default function DoctorFinder({ doctors, specialties, initialQuery = "", hotline }) {
  const locale = useLocale();
  const t = useT();
  const [query, setQuery] = useState(initialQuery);
  const [problem, setProblem] = useState(null);
  const [specialtyId, setSpecialtyId] = useState(null);

  const index = useMemo(() => buildIndex(doctors), [doctors]);
  // Only specialties (and helper problems) that lead to at least one doctor — no dead ends.
  const liveSpecialties = useMemo(
    () => {
      const counts = new Map();
      for (const d of doctors) counts.set(d.specialty_id, (counts.get(d.specialty_id) || 0) + 1);
      // Busiest departments first, so the most-needed ones are the first chips a patient sees.
      return specialties
        .filter((s) => counts.has(s.id))
        .sort((a, b) => counts.get(b.id) - counts.get(a.id) || a.name_en.localeCompare(b.name_en));
    },
    [specialties, doctors]
  );
  const liveProblems = useMemo(
    () =>
      FINDER_PROBLEMS.filter((p) => {
        const { results, loose } = searchDoctors(index, p.q);
        return results.length > 0 && !loose;
      }),
    [index]
  );

  const activeQuery = problem ? problem.q : query;
  const { results, loose } = searchDoctors(index, activeQuery, specialtyId);
  const suggestions = suggestSpecialties(liveSpecialties, activeQuery);

  function updateQuery(value) {
    setQuery(value);
    setProblem(null);
    try {
      const url = new URL(window.location.href);
      if (value.trim()) url.searchParams.set("q", value.trim());
      else url.searchParams.delete("q");
      window.history.replaceState(null, "", url);
    } catch {}
  }

  function chooseProblem(p) {
    setProblem(problem?.q === p.q ? null : p);
    setQuery("");
    setSpecialtyId(null);
  }

  const chip = (active) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-surface hover:border-primary hover:text-primary"
    }`;

  if (doctors.length === 0) {
    return <p className="py-10 text-center text-muted">{t("doctors.noDoctors")}</p>;
  }

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <IconSearch
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          aria-label={t("doctors.searchLabel")}
          placeholder={t("doctors.searchPlaceholder")}
          className="w-full rounded-full border border-border bg-surface py-3.5 pl-12 pr-12 text-base shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => updateQuery("")}
            aria-label={t("doctors.clear")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:bg-surface-alt"
          >
            <IconX size={18} />
          </button>
        )}
      </div>

      {/* Finder helper */}
      {liveProblems.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <IconStethoscope size={20} className="text-primary" aria-hidden="true" />
            {t("doctors.helperTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("doctors.helperIntro")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {liveProblems.map((p) => (
              <button
                key={p.q}
                type="button"
                onClick={() => chooseProblem(p)}
                aria-pressed={problem?.q === p.q}
                className={chip(problem?.q === p.q)}
              >
                {locale === "bn" ? p.bn : p.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested specialty for what was typed / tapped */}
      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm">
          <IconSparkles size={18} className="text-primary" aria-hidden="true" />
          <span className="font-semibold text-primary">{t("doctors.suggested")}</span>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpecialtyId(specialtyId === s.id ? null : s.id)}
              className="rounded-full bg-surface px-3 py-1 font-semibold text-primary hover:underline"
            >
              {pick(s, "name", locale)}
            </button>
          ))}
        </div>
      )}

      {/* Specialty filter */}
      {liveSpecialties.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSpecialtyId(null)} className={chip(!specialtyId)}>
            {t("doctors.allSpecialties")}
          </button>
          {liveSpecialties.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpecialtyId(specialtyId === s.id ? null : s.id)}
              aria-pressed={specialtyId === s.id}
              className={chip(specialtyId === s.id)}
            >
              {pick(s, "name", locale)}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {results.length === 1 ? t("doctors.countOne") : t("doctors.count", { count: results.length })}
        {loose && results.length > 0 && <> · {t("doctors.looseMatch")}</>}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted">{t("doctors.empty")}</p>
          {hotline && (
            <a
              href={telHref(hotline)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-90"
            >
              <IconPhone size={16} aria-hidden="true" />
              {t("doctors.callHotline", { number: hotline })}
            </a>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((d) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              locale={locale}
              t={t}
              hotline={hotline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
