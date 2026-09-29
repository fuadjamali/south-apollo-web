"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  IconStethoscope,
  IconX,
  IconSend,
  IconPhone,
  IconCalendarPlus,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react";
import { useLocale, useT } from "@/components/LocaleContext";
import { buildIndex, searchDoctors, suggestSpecialties, FINDER_PROBLEMS } from "@/lib/doctorSearch";

// Site-wide "Find a Doctor" chat bubble — a scripted quick-reply chat over the same keyword
// search /doctors itself uses (lib/doctorSearch.js), presented as a back-and-forth conversation.
// It is NOT a real AI: nothing typed here is sent anywhere except the doctor directory fetch
// below, there's no LLM call, and the dictionary copy (lib/i18n/dictionaries) deliberately
// avoids the word "AI" so a patient doesn't mistake a keyword match for medical advice — see the
// disclaimer line rendered under the greeting.
//
// The directory (doctors + specialties + hotline) is fetched lazily from /api/doctors-directory
// the first time a visitor opens the panel, not on every page load — this widget is mounted
// site-wide (components/SiteFooter.js), and most visitors on most pages will never open it.

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

// Monotonic id for React keys — messages are only ever appended, never reordered, so a simple
// counter (not crypto.randomUUID) is plenty and needs no import.
let seq = 0;
const nextId = () => (seq += 1);

const MAX_RESULTS_SHOWN = 3;
// Presentation-only pause before a reply appears — the search itself is already done
// synchronously by the time this fires. Long enough to read as "thinking", short enough not to
// feel slow.
const TYPING_DELAY_MS = 500;

function MiniDoctorCard({ doctor, locale, t, hotline }) {
  const name = pick(doctor, "name", locale);
  const specialty = pick(doctor, "specialty", locale);
  const degrees = pick(doctor, "degrees", locale);
  const phone = doctor.serial_phone || hotline;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-2.5">
      {doctor.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={doctor.photo} alt={name} loading="lazy" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-xs font-bold text-primary">
          {initials(doctor.name_en || name)}
        </div>
      )}
      {/* Never truncated — a patient needs the full name, department and degrees to actually
          pick a doctor, so this wraps to as many lines as it needs rather than clipping with
          an ellipsis (the card just grows taller). */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[13px] font-semibold leading-snug">{name}</p>
        {specialty && <p className="text-xs font-medium leading-snug text-primary">{specialty}</p>}
        {degrees && <p className="whitespace-pre-line text-xs leading-snug text-muted">{degrees}</p>}
      </div>
      <div className="flex shrink-0 gap-1">
        <a
          href={`/doctors/book?doctor=${doctor.id}`}
          aria-label={`${t("doctors.book")} — ${name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground hover:brightness-90"
        >
          <IconCalendarPlus size={15} aria-hidden="true" />
        </a>
        {phone && (
          <a
            href={telHref(phone)}
            aria-label={`${t("doctors.callSerial")} — ${name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary/10"
          >
            <IconPhone size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function BotBubble({ children }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <IconStethoscope size={15} aria-hidden="true" />
      </div>
      <div className="min-w-0 max-w-[92%] rounded-2xl rounded-tl-sm bg-surface-alt px-3.5 py-2.5 text-sm">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
        {children}
      </div>
    </div>
  );
}

export default function DoctorChatWidget() {
  const locale = useLocale();
  const t = useT();
  // The /doctors page (and its booking flow) already *is* this same search, full-size — a
  // second copy floating on top of it would just be clutter, so the bubble skips those pages.
  const pathname = usePathname();
  const onFinderPage = pathname?.startsWith("/doctors");
  const [open, setOpen] = useState(false);
  // idle: never fetched · loading: fetch in flight · ready: directory loaded · error: fetch failed
  const [status, setStatus] = useState("idle");
  const [directory, setDirectory] = useState(null); // { doctors, specialties, hotline, index }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);

  function loadDirectory() {
    setStatus("loading");
    fetch("/api/doctors-directory")
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((data) => {
        setDirectory({ ...data, index: buildIndex(data.doctors) });
        setStatus("ready");
        setMessages([{ id: nextId(), from: "bot", kind: "greeting" }]);
      })
      .catch(() => setStatus("error"));
  }

  // Fetches on first open, not via an effect watching `open` — this is a plain response to the
  // click that revealed the panel, not a sync-with-external-system effect.
  function handleBubbleClick() {
    if (!open && status === "idle") loadDirectory();
    setOpen((v) => !v);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Clears on unmount so a reply for a closed/gone widget never lands.
  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  // Quick-reply chips for the greeting — only ones that actually lead to a doctor, same
  // liveProblems logic as components/DoctorFinder.js.
  const problems = useMemo(() => {
    if (!directory) return [];
    return FINDER_PROBLEMS.map((p) => ({ ...p, label: locale === "bn" ? p.bn : p.en })).filter((p) => {
      const { results, loose } = searchDoctors(directory.index, p.label);
      return results.length > 0 && !loose;
    });
  }, [directory, locale]);

  function ask(query) {
    const text = query.trim();
    if (!text || !directory) return;

    setMessages((m) => [...m, { id: nextId(), from: "user", text }]);
    setInput("");
    setTyping(true);

    // The lookup runs now (it's instant either way); only the reveal is delayed.
    const { results, loose } = searchDoctors(directory.index, text);
    const suggestions = suggestSpecialties(directory.specialties, text);

    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          from: "bot",
          kind: results.length ? "results" : "empty",
          results: results.slice(0, MAX_RESULTS_SHOWN),
          moreCount: Math.max(0, results.length - MAX_RESULTS_SHOWN),
          query: text,
          suggestion: suggestions[0] || null,
          loose,
        },
      ]);
    }, TYPING_DELAY_MS);
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(input);
  }

  if (onFinderPage) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-x-4 bottom-24 z-30 mx-auto flex h-[min(32rem,calc(100vh-8rem))] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <p className="flex items-center gap-2 font-semibold">
              <IconStethoscope size={18} aria-hidden="true" />
              {t("doctorChat.title")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("doctorChat.close")}
              className="rounded-full p-1 hover:bg-white/15"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {status === "loading" && (
              <BotBubble>
                <span className="inline-flex gap-1" aria-label={t("doctorChat.typing")}>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </span>
              </BotBubble>
            )}

            {status === "error" && (
              <BotBubble>
                <p>{t("doctorChat.loadError")}</p>
                <button
                  type="button"
                  onClick={loadDirectory}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-surface"
                >
                  <IconRefresh size={13} aria-hidden="true" />
                  {t("doctorChat.retry")}
                </button>
              </BotBubble>
            )}

            {messages.map((m) => {
              if (m.from === "user") return <UserBubble key={m.id}>{m.text}</UserBubble>;

              if (m.kind === "greeting") {
                return (
                  <BotBubble key={m.id}>
                    <p>{t("doctorChat.greeting")}</p>
                    <p className="mt-2 text-xs text-muted">{t("doctorChat.disclaimer")}</p>
                    {problems.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {problems.map((p) => (
                          <button
                            key={p.q}
                            type="button"
                            onClick={() => ask(p.label)}
                            className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </BotBubble>
                );
              }

              if (m.kind === "empty") {
                return (
                  <BotBubble key={m.id}>
                    <p>{t("doctors.empty")}</p>
                    {directory?.hotline && (
                      <a
                        href={telHref(directory.hotline)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-90"
                      >
                        <IconPhone size={13} aria-hidden="true" />
                        {t("doctors.callHotline", { number: directory.hotline })}
                      </a>
                    )}
                  </BotBubble>
                );
              }

              // "results"
              return (
                <BotBubble key={m.id}>
                  {m.suggestion && (
                    <p className="mb-2">
                      {t("doctorChat.suggestion", { specialty: pick(m.suggestion, "name", locale) })}
                    </p>
                  )}
                  <p className="font-medium">
                    {m.results.length + m.moreCount === 1
                      ? t("doctorChat.resultsOne")
                      : t("doctorChat.results", { count: m.results.length + m.moreCount })}
                  </p>
                  {m.loose && <p className="mt-1 text-xs text-muted">{t("doctors.looseMatch")}</p>}
                  <div className="mt-2 space-y-2">
                    {m.results.map((d) => (
                      <MiniDoctorCard key={d.id} doctor={d} locale={locale} t={t} hotline={directory?.hotline} />
                    ))}
                  </div>
                  {m.moreCount > 0 && (
                    <a
                      href={`/doctors?q=${encodeURIComponent(m.query)}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {t("doctorChat.moreResults", { count: m.moreCount })}
                      <IconArrowRight size={13} aria-hidden="true" />
                    </a>
                  )}
                </BotBubble>
              );
            })}

            {typing && (
              <BotBubble>
                <span className="inline-flex gap-1" aria-label={t("doctorChat.typing")}>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </span>
              </BotBubble>
            )}
          </div>

          {/* Composer + persistent escape hatches */}
          <div className="shrink-0 border-t border-border p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("doctorChat.placeholder")}
                disabled={status !== "ready"}
                className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status !== "ready" || !input.trim()}
                aria-label={t("doctorChat.send")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
              >
                <IconSend size={16} aria-hidden="true" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-xs">
              <a href="/doctors" className="font-medium text-primary hover:underline">
                {t("doctorChat.viewAll")}
              </a>
              {directory?.hotline && (
                <a href={telHref(directory.hotline)} className="flex items-center gap-1 text-muted hover:text-foreground">
                  <IconPhone size={13} aria-hidden="true" />
                  {directory.hotline}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleBubbleClick}
        aria-expanded={open}
        aria-label={open ? t("doctorChat.close") : t("doctorChat.bubbleLabel")}
        className="fixed bottom-6 right-[10.5rem] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover"
      >
        {open ? <IconX size={24} /> : <IconStethoscope size={26} />}
      </button>
    </>
  );
}
