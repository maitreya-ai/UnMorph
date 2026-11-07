"use client";

import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ConnectWallet } from "@/components/ConnectWallet";
import { dashboardSections, scrollToSection } from "@/components/dashboard/dashboard-nav";
import { mockUser } from "@/lib/mock-data";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-nb-black bg-nb-surface">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="UnMorph home" className="lg:hidden">
          <LogoMark size={30} />
        </Link>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
          <span className="hidden font-mono text-[12px] tracking-[0.05em] text-nb-muted uppercase sm:inline">
            {mockUser.workspace}
          </span>
          <span aria-hidden className="hidden font-mono text-nb-muted sm:inline">
            /
          </span>
          <span className="truncate font-heading text-[16px] font-bold text-nb-black">
            Image verification
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <ConnectWallet />
          <button
            type="button"
            aria-label="Notifications"
            className="relative hidden size-10 nb-press-sm place-items-center border-[3px] border-nb-black bg-nb-surface text-nb-black sm:grid"
          >
            <Bell className="size-4" strokeWidth={2.25} />
            <span className="absolute -top-1.5 -right-1.5 size-3 border-2 border-nb-black bg-nb-pink" />
          </button>
          <Link
            href="/"
            aria-label="Sign out"
            className="grid size-10 nb-press-sm place-items-center border-[3px] border-nb-black bg-nb-surface text-nb-black lg:hidden"
          >
            <LogOut className="size-4" strokeWidth={2.25} />
          </Link>
        </div>
      </div>

      {/* mobile section chips */}
      <nav
        aria-label="Dashboard sections"
        className="flex [scrollbar-width:none] gap-2.5 overflow-x-auto border-t-2 border-nb-black px-4 py-3 sm:px-6 lg:hidden"
      >
        {dashboardSections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="inline-flex shrink-0 items-center gap-1.5 border-2 border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[13px] font-bold text-nb-black shadow-nb-sm"
          >
            <Icon className="size-3.5" strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
