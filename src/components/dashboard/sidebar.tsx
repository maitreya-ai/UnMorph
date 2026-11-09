"use client";

import Link from "next/link";
import { motion } from "motion/react";
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

export function Sidebar() {
  const active = useActiveSection(IDS, "dash-overview", "-12% 0px -78% 0px");
  const pct = Math.round((mockUser.quota.used / mockUser.quota.limit) * 100);

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r-[3px] border-nb-black bg-nb-surface px-4 py-5 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <div className="mt-6 flex items-center gap-3 border-[3px] border-nb-black bg-nb-yellow px-3 py-2.5 shadow-nb-sm">
        <span className="grid size-8 place-items-center border-[2px] border-nb-black bg-nb-black font-heading text-[12px] font-bold text-nb-yellow">
          RM
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-bold text-nb-black">
            {mockUser.workspace}
          </span>
          <span className="block text-[11.5px] font-medium text-nb-black/70 uppercase">
            {mockUser.plan}
          </span>
        </span>
      </div>

      <nav aria-label="Dashboard" className="mt-6">
        <p className="px-3 font-heading text-[11px] font-bold tracking-[0.16em] text-nb-muted uppercase">
          Workspace
        </p>
        <ul className="mt-2 space-y-1.5">
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
                    "relative flex items-center gap-3 border-[2px] px-3 py-2 font-heading text-[13px] font-bold uppercase transition-colors",
                    isActive
                      ? "border-nb-black bg-nb-yellow text-nb-black"
                      : "border-transparent text-nb-muted hover:border-nb-black hover:bg-nb-bg hover:text-nb-black",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 -z-10 border-[2px] border-nb-black bg-nb-yellow"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className="relative size-4" />
                  <span className="relative">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-3 font-heading text-[11px] font-bold tracking-[0.16em] text-nb-muted uppercase">
          Coming soon
        </p>
        <ul className="mt-2 space-y-1.5">
          {comingSoon.map(({ label, icon: Icon }) => (
            <li key={label}>
              <span className="flex cursor-not-allowed items-center gap-3 border-[2px] border-transparent px-3 py-2 font-heading text-[13px] font-bold text-nb-muted/60 uppercase">
                <Icon className="size-4" />
                {label}
                <span className="ml-auto border-[2px] border-nb-black/40 bg-nb-bg px-1.5 py-px text-[10px] font-bold text-nb-muted">
                  Soon
                </span>
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-4">
        <div className="border-[3px] border-nb-black bg-nb-black p-4 text-nb-bg shadow-nb-sm">
          <p className="text-[12px] text-nb-bg/60 uppercase">Monthly verifications</p>
          <p className="mt-1 font-heading text-[16px] font-bold">
            {mockUser.quota.used}{" "}
            <span className="font-normal text-nb-bg/50">
              / {mockUser.quota.limit.toLocaleString("en-US")}
            </span>
          </p>
          <div className="mt-3 h-2 border border-nb-bg/40 bg-nb-bg/10">
            <div className="h-full bg-nb-green" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="grid size-9 place-items-center border-[2px] border-nb-black bg-nb-lavender font-heading text-[12px] font-bold text-nb-black">
            {mockUser.initials}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-bold text-nb-black">
              {mockUser.name}
            </span>
            <span className="block truncate text-[11.5px] text-nb-muted">{mockUser.email}</span>
          </span>
          <Link
            href="/"
            aria-label="Sign out"
            className="grid size-8 place-items-center border-[2px] border-nb-black text-nb-black transition-colors hover:bg-nb-pink"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
