import { CartProvider } from "@/components/site/CartProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";

// Le pied de page lit les secteurs en base : on évite qu'il soit figé au moment du build.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <PageShell>{children}</PageShell>
      <Footer />
    </CartProvider>
  );
}
