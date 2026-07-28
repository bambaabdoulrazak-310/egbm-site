import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/entreprise/LoginForm";

export const metadata: Metadata = {
  title: "Connexion — Espace Entreprise",
};

export default async function ConnexionPage() {
  const session = await getSession();
  if (session) {
    redirect("/espace-entreprise");
  }

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
          <h1 className="font-display text-2xl font-extrabold">Espace Entreprise</h1>
          <p className="text-xs text-ink-soft">Accès réservé au personnel autorisé</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
