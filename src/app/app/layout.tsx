import type { Metadata } from "next";
import { AppNav, AppTopBar } from "@/components/app/AppNav";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `App · ${site.name}`,
};

/**
 * The application shell. No marketing chrome: a chain-status bar, the section
 * rail, and the page.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-sky">
      <AppTopBar />
      <div className="mx-auto grid max-w-[1500px] md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-line md:block">
          <AppNav />
        </aside>
        <main className="min-w-0 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
