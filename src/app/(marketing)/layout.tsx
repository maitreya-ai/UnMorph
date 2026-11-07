import { Footer } from "@/components/landing/footer";
import { SiteNav } from "@/components/nav/site-nav";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <SiteNav />
      <main className="relative overflow-x-clip">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
