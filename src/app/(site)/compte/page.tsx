import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireCustomerSession } from "@/lib/customer-auth-guard";
import { customerLogoutAction } from "@/lib/actions/customer-auth";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/catalog";

export const metadata: Metadata = { title: "Mon compte" };

const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours de traitement",
  LIVREE: "Livrée",
};

const STATUS_CLASSES: Record<string, string> = {
  NOUVELLE: "bg-safety text-ink",
  EN_COURS: "bg-rust text-white",
  LIVREE: "bg-green text-white",
};

export default async function ComptePage() {
  const session = await requireCustomerSession();

  const orders = await prisma.order.findMany({
    where: { customerId: session.sub },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">Mon compte</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {session.name} · {session.email}
          </p>
        </div>
        <form action={customerLogoutAction}>
          <button className="flex items-center gap-1.5 rounded-md border border-border-egbm bg-cream px-3 py-2 text-sm font-semibold">
            <LogOut size={15} /> Déconnexion
          </button>
        </form>
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">Mes commandes</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Vous n&apos;avez pas encore passé de commande.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border-egbm bg-cream p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="text-xs text-ink-soft">
                  Commande du {o.createdAt.toISOString().slice(0, 10)}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[o.status]}`}
                >
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
              <ul className="mt-2 text-sm text-ink-soft">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.quantity} × {it.productName}
                  </li>
                ))}
              </ul>
              <div className="mt-2 font-mono font-semibold">{formatFCFA(o.total)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
