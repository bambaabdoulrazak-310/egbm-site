import type { Metadata } from "next";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/entreprise/ResetPasswordForm";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe — Espace Entreprise" };

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-alt px-5">
      <div className="w-full max-w-sm rounded-lg border border-border-egbm bg-cream p-6">
        <div className="mb-4 flex flex-col items-center">
          <Image
            src="/logo.jpg"
            alt="Logo EGBM"
            width={56}
            height={56}
            className="mb-2 rounded-full object-cover"
          />
          <h1 className="font-display text-2xl font-extrabold">Nouveau mot de passe</h1>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm font-medium text-rust-dark">Lien de réinitialisation invalide.</p>
        )}
      </div>
    </div>
  );
}
