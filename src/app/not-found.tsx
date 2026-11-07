import type { Metadata } from "next";
import { SiteNav } from "@/components/nav/site-nav";
import { NotFoundView } from "@/components/not-found/not-found-view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteNav pageLabel="404 · Not verified" />
      <NotFoundView />
    </>
  );
}
