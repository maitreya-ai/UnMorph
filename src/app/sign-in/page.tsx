import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandPanel } from "@/components/auth/brand-panel";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to UnMorph to register, protect and verify images.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-nb-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <div className="relative flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div aria-hidden className="absolute inset-0 -z-0 bg-grid opacity-60" />
        <div className="relative flex items-center justify-between">
          <Logo className="lg:invisible" />
          <Link
            href="/"
            className="group inline-flex nb-press-sm items-center gap-1.5 border-2 border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[14px] font-bold text-nb-black"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>

        <main className="relative flex flex-1 items-center justify-center py-12">
          <SignInForm />
        </main>

        <p className="relative text-center font-mono text-[11px] tracking-[0.05em] text-nb-muted uppercase">
          Protected by World ID · Records on Arkiv · Storage on 0G
        </p>
      </div>
    </div>
  );
}
