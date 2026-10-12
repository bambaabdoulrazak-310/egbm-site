import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { CustomerLoginForm } from "@/components/site/CustomerLoginForm";

export const metadata: Metadata = { title: "Connexion — Mon compte" };

function isSafeRedirect(path: string | undefined): path is string {
  return !!path && path.startsWith("/compte");
}

export default async function CompteConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const safeRedirect = isSafeRedirect(redirectTo) ? redirectTo : "/compte";

  const session = await getCustomerSession();
  if (session) {
    redirect(safeRedirect);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col">
      <h1 className="font-display text-3xl font-extrabold">Mon compte</h1>
      <p className="mt-1 text-sm text-ink-soft">Connectez-vous pour suivre vos commandes.</p>
      <div className="mt-6 rounded-lg border border-border-egbm bg-cream p-6">
        <CustomerLoginForm redirectTo={safeRedirect} />
      </div>
    </div>
  );
}
