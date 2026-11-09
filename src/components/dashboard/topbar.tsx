"use client";

import Link from "next/link";
import { Bell, ChevronRight, LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ConnectWallet } from "@/components/ConnectWallet";
import { dashboardSections, scrollToSection } from "@/components/dashboard/dashboard-nav";
import { mockUser } from "@/lib/mock-data";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-nb-black bg-nb-bg">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="UnMorph home" className="lg:hidden">
          <LogoMark size={26} />
        </Link>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13.5px]">
          <span className="hidden text-nb-muted uppercase sm:inline">{mockUser.workspace}</span>
          <ChevronRight className="hidden size-3.5 text-nb-black/40 sm:inline" />
          <span className="font-heading font-bold text-nb-black uppercase">
            Image verification
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ConnectWallet />
          <button
            type="button"
            aria-label="Notifications"
            className="nb-press-sm relative hidden size-9 place-items-center border-[3px] border-nb-black bg-nb-surface text-nb-black sm:grid"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 border border-nb-black bg-nb-pink" />
          </button>
          <Link
            href="/"
            aria-label="Sign out"
            className="nb-press-sm grid size-9 place-items-center border-[3px] border-nb-black bg-nb-surface text-nb-black lg:hidden"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </div>

      {/* mobile section chips */}
      <nav
        aria-label="Dashboard sections"
        className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden"
      >
        {dashboardSections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="inline-flex shrink-0 items-center gap-1.5 border-[2px] border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[12px] font-bold text-nb-black uppercase"
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
