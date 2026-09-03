import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/** The public face: marketing chrome around the landing page and the docs. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
