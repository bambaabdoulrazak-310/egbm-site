import { CartProvider } from "@/components/site/CartProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StripeDivider } from "@/components/site/StripeDivider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <StripeDivider />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
      <Footer />
    </CartProvider>
  );
}
