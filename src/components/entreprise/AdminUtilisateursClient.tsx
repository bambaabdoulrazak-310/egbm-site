"use client";

import { useActionState, useEffect, useRef } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { inviteUserAction, revokeUserAction, type UserFormState } from "@/lib/actions/users";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMINISTRATEUR" | "GESTIONNAIRE";
}

const initialState: UserFormState = {};

export function AdminUtilisateursClient({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(inviteUserAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">
        Utilisateurs &amp; autorisations
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Donne l&apos;accès à l&apos;espace entreprise à d&apos;autres personnes. Elles pourront gérer
        produits, publications, commandes et factures, mais ne pourront pas inviter d&apos;autres
        utilisateurs (réservé à l&apos;Administrateur).
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 grid gap-3 rounded-lg border border-border-egbm bg-cream p-4 md:grid-cols-4"
      >
        <input name="nom" required placeholder="Nom complet" className="rounded-md border border-border-egbm p-2" />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-md border border-border-egbm p-2"
        />
        <input
          name="motdepasse"
          type="text"
          required
          minLength={8}
          placeholder="Mot de passe temporaire"
          className="rounded-md border border-border-egbm p-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-1.5 rounded-md bg-green px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          <UserPlus size={16} /> Autoriser
        </button>
        {state.error && <p className="text-sm font-medium text-rust-dark md:col-span-4">{state.error}</p>}
      </form>

      <div className="mt-5 flex flex-col gap-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-lg border border-border-egbm bg-cream p-3"
          >
            <div>
              <div className="font-semibold">{u.name}</div>
              <div className="text-xs text-ink-soft">
                {u.email} · {u.role === "ADMINISTRATEUR" ? "Administrateur" : "Gestionnaire"}
              </div>
            </div>
            {u.id !== currentUserId && u.role !== "ADMINISTRATEUR" && (
              <form action={revokeUserAction}>
                <input type="hidden" name="id" value={u.id} />
                <button type="submit" aria-label="Révoquer">
                  <Trash2 size={16} className="text-rust" />
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
