"use client";

import { useState } from "react";
import { IconUsers, IconHistory, IconMenu2, IconChevronRight } from "@tabler/icons-react";
import MemberCard from "@/components/MemberCard";

// Public /team roster — current/former switcher. Client component fed pre-grouped data from
// the server (getCurrentTeamsWithMembers() / getFormerTeamsWithMembers(), both already shaped
// as [{ id, name, members: [...] }] — see lib/teamMembers.js). A sidebar nav (collapsible on
// mobile) lets a visitor jump straight to one current team or one former team's roster instead
// of scrolling past every other group first — but only appears at all once there's something to
// switch between, same "don't show UI with nothing to switch to" instinct as Hero's
// single-slide carousel.
export default function TeamRoster({ currentTeams, formerTeams }) {
  const hasFormerTeams = formerTeams.length > 0;
  const showCurrentSubList = currentTeams.length > 1;
  const showNav = hasFormerTeams || showCurrentSubList;

  const [view, setView] = useState({ kind: "current", teamId: null });
  const [navOpen, setNavOpen] = useState(false);

  const groups = view.kind === "former" ? formerTeams : currentTeams;
  const visibleGroups = view.teamId ? groups.filter((g) => g.id === view.teamId) : groups;

  function selectView(next) {
    setView(next);
    setNavOpen(false);
  }

  function isActive(kind, teamId) {
    return view.kind === kind && view.teamId === teamId;
  }

  return (
    <div className={showNav ? "grid gap-8 md:grid-cols-[220px_1fr]" : ""}>
      {showNav && (
        <div>
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className="mb-3 flex w-full items-center justify-between rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground md:hidden"
          >
            <span className="flex items-center gap-2">
              <IconMenu2 size={16} /> Jump to a team
            </span>
            <IconChevronRight size={16} className={navOpen ? "rotate-90 transition" : "transition"} />
          </button>

          <nav className={`${navOpen ? "block" : "hidden"} space-y-1 md:block`}>
            <button
              type="button"
              onClick={() => selectView({ kind: "current", teamId: null })}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                isActive("current", null) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-alt"
              }`}
            >
              <IconUsers size={16} /> Current teams
            </button>
            {showCurrentSubList &&
              currentTeams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectView({ kind: "current", teamId: t.id })}
                  className={`ml-6 flex w-full items-center rounded-lg px-3 py-1.5 text-left text-sm ${
                    isActive("current", t.id) ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-surface-alt"
                  }`}
                >
                  {t.name}
                </button>
              ))}

            {hasFormerTeams && (
              <>
                <button
                  type="button"
                  onClick={() => selectView({ kind: "former", teamId: null })}
                  className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    isActive("former", null) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-alt"
                  }`}
                >
                  <IconHistory size={16} /> Former teams
                </button>
                {formerTeams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectView({ kind: "former", teamId: t.id })}
                    className={`ml-6 flex w-full items-center rounded-lg px-3 py-1.5 text-left text-sm ${
                      isActive("former", t.id) ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-surface-alt"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>
      )}

      <div className="space-y-12">
        {visibleGroups.length === 0 ? (
          <p className="text-muted">No members in this group.</p>
        ) : (
          visibleGroups.map((group) => (
            <div key={group.id}>
              <h2 className="text-lg font-semibold text-foreground">{group.name}</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member) => (
                  <MemberCard key={member.id} member={member} className="bg-surface" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
