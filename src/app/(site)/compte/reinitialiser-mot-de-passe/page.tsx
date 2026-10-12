import type { Metadata } from "next";
import { CustomerResetPasswordForm } from "@/components/site/CustomerResetPasswordForm";

export const metadata: Metadata = { title: "Nouveau mot de passe — Mon compte" };

export default async function CompteReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col">
      <h1 className="font-display text-3xl font-extrabold">Nouveau mot de passe</h1>
      <div className="mt-6 rounded-lg border border-border-egbm bg-cream p-6">
        {token ? (
          <CustomerResetPasswordForm token={token} />
        ) : (
          <p className="text-sm font-medium text-rust-dark">Lien de réinitialisation invalide.</p>
        )}
      </div>
    </div>
  );
}
