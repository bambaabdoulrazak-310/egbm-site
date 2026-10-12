import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { CustomerRegisterForm } from "@/components/site/CustomerRegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

function isSafeRedirect(path: string | undefined): path is string {
  return !!path && path.startsWith("/compte");
}

export default async function CompteInscriptionPage({
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
      <h1 className="font-display text-3xl font-extrabold">Créer un compte</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Suivez l&apos;historique et le statut de vos commandes.
      </p>
      <div className="mt-6 rounded-lg border border-border-egbm bg-cream p-6">
        <CustomerRegisterForm redirectTo={safeRedirect} />
      </div>
    </div>
  );
}
