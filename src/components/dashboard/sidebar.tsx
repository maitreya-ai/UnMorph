"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import {
  comingSoon,
  dashboardSections,
  scrollToSection,
} from "@/components/dashboard/dashboard-nav";
import { useActiveSection } from "@/hooks/use-active-section";
import { mockUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const IDS = dashboardSections.map((s) => s.id);

/** Workspace rail: white slab, 4px rule, yellow active block — the reference docs sidebar. */
export function Sidebar() {
  const active = useActiveSection(IDS, "dash-overview", "-12% 0px -78% 0px");
  const pct = Math.round((mockUser.quota.used / mockUser.quota.limit) * 100);

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r-4 border-nb-black bg-nb-surface lg:flex">
      <div className="flex h-[72px] shrink-0 items-center border-b-4 border-nb-black px-5">
        <Logo size={28} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
        <div className="flex items-center gap-3 border-[3px] border-nb-black bg-nb-yellow-light px-3 py-2.5 shadow-nb-sm">
          <span className="grid size-9 shrink-0 place-items-center border-2 border-nb-black bg-nb-black font-mono text-[12px] font-bold text-nb-yellow">
            RM
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-heading text-[14px] font-bold text-nb-black">
              {mockUser.workspace}
            </span>
            <span className="block font-mono text-[11px] text-nb-muted uppercase">
              {mockUser.plan}
            </span>
          </span>
        </div>

        <nav aria-label="Dashboard" className="mt-7">
          <p className="px-1 font-mono text-[11px] tracking-[0.15em] text-nb-muted uppercase">
            Workspace
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {dashboardSections.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(id);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-3 border-2 px-3 py-2 font-heading text-[15px] font-bold transition-[background-color,border-color,box-shadow] duration-100",
                      isActive
                        ? "border-nb-black bg-nb-yellow text-nb-black shadow-nb-sm"
                        : "border-transparent text-nb-black hover:border-nb-black hover:bg-nb-bg",
                    )}
                  >
                    <Icon className="size-4.5" strokeWidth={2.25} />
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 px-1 font-mono text-[11px] tracking-[0.15em] text-nb-muted uppercase">
            Coming soon
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {comingSoon.map(({ label, icon: Icon }) => (
              <li key={label}>
                <span
                  aria-disabled
                  className="flex cursor-not-allowed items-center gap-3 border-2 border-transparent px-3 py-2 font-heading text-[15px] font-bold text-nb-muted"
                >
                  <Icon className="size-4.5" strokeWidth={2.25} />
                  {label}
                  <span className="ml-auto border-2 border-nb-black bg-nb-bg-warm px-1.5 font-mono text-[10px] text-nb-black uppercase">
                    Soon
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <div className="border-[3px] border-nb-black bg-nb-black p-4 text-nb-white shadow-nb-pink">
            <p className="font-mono text-[11px] tracking-[0.1em] text-nb-white/70 uppercase">
              Monthly verifications
            </p>
            <p className="mt-1 font-display text-[22px] leading-tight font-extrabold">
              {mockUser.quota.used}
              <span className="font-mono text-[13px] font-normal text-nb-white/60">
                {" "}
                / {mockUser.quota.limit.toLocaleString("en-US")}
              </span>
            </p>
            <div className="mt-3 h-4 border-2 border-nb-white bg-nb-black">
              <div className="h-full bg-nb-yellow" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center border-[3px] border-nb-black bg-nb-pink font-mono text-[13px] font-bold text-nb-black">
              {mockUser.initials}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-heading text-[14px] font-bold text-nb-black">
                {mockUser.name}
              </span>
              <span className="block truncate font-mono text-[11px] text-nb-muted">
                {mockUser.email}
              </span>
            </span>
            <Link
              href="/"
              aria-label="Sign out"
              className="grid size-9 shrink-0 nb-press-sm place-items-center border-2 border-nb-black bg-nb-surface text-nb-black"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
