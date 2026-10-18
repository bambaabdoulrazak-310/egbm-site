import { CartProvider } from "@/components/site/CartProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <PageShell>{children}</PageShell>
      <Footer />
    </CartProvider>
  );
}
