"use client";

import { formatFCFA } from "@/lib/catalog";
import { updateOrderStatusAction } from "@/lib/actions/orders";

export interface AdminOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  createdAt: Date;
  status: "NOUVELLE" | "EN_COURS" | "LIVREE";
  total: number;
  items: Array<{ productName: string; quantity: number }>;
}

function StatusSelect({ order }: { order: AdminOrder }) {
  return (
    <form action={updateOrderStatusAction}>
      <input type="hidden" name="id" value={order.id} />
      <select
        name="status"
        defaultValue={order.status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-border-egbm p-1.5 text-sm"
      >
        <option value="NOUVELLE">Nouvelle</option>
        <option value="EN_COURS">En cours</option>
        <option value="LIVREE">Livrée</option>
      </select>
    </form>
  );
}

export function AdminCommandesClient({ orders }: { orders: AdminOrder[] }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">Commandes reçues</h1>
      <div className="mt-5 flex flex-col gap-3">
        {orders.length === 0 && <p className="text-ink-soft">Aucune commande pour le moment.</p>}
        {orders.map((c) => (
          <div key={c.id} className="rounded-lg border border-border-egbm bg-cream p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{c.clientName}</div>
                <div className="text-xs text-ink-soft">
                  {c.clientPhone} · {c.createdAt.toISOString().slice(0, 10)}
                </div>
              </div>
              <StatusSelect order={c} />
            </div>
            <ul className="mt-2 text-sm text-ink-soft">
              {c.items.map((it, i) => (
                <li key={i}>
                  {it.quantity} × {it.productName}
                </li>
              ))}
            </ul>
            <div className="mt-2 font-mono font-semibold">{formatFCFA(c.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
