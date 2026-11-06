"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createSupplierOrderAction, type SupplierActionState } from "@/lib/actions/supplier-orders";

interface ProductOption {
  id: string;
  name: string;
  unit: string | null;
}

interface Line {
  key: number;
  productId: string;
  quantity: string;
}

const field = "w-full rounded-md border border-border-egbm bg-white p-2.5 text-sm";

export function SupplierOrderForm({
  products,
  users,
  defaultResponsibleId,
}: {
  products: ProductOption[];
  users: Array<{ id: string; name: string }>;
  defaultResponsibleId: string;
}) {
  const [state, setState] = useState<SupplierActionState>({});
  const [pending, startTransition] = useTransition();
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", quantity: "1" }]);
  const [nextKey, setNextKey] = useState(2);
  // Pas de balise <form> : la saisie reste affichée si le serveur renvoie une erreur.
  const [info, setInfo] = useState({
    supplierName: "",
    supplierContact: "",
    notes: "",
    expectedDate: "",
    responsibleId: defaultResponsibleId,
  });
  const bind = (name: keyof typeof info) => ({
    name,
    value: info[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setInfo((s) => ({ ...s, [name]: e.target.value })),
  });

  function update(key: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function submit() {
    if (!info.supplierName.trim()) {
      setState({ error: "Veuillez indiquer le nom du fournisseur." });
      return;
    }
    const payload = lines
      .filter((l) => l.productId && Number(l.quantity) > 0)
      .map((l) => ({ productId: l.productId, quantity: Math.floor(Number(l.quantity)) }));
    const data = new FormData();
    for (const [key, value] of Object.entries(info)) data.set(key, value);
    data.set("lines", JSON.stringify(payload));
    startTransition(async () => {
      const result = await createSupplierOrderAction({}, data);
      if (result) setState(result);
    });
  }

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-bold">Fournisseur</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input {...bind("supplierName")} placeholder="Nom du fournisseur" className={field} />
            <input {...bind("supplierContact")} placeholder="Contact (téléphone, e-mail — facultatif)" className={field} />
          </div>
          <textarea {...bind("notes")} rows={2} placeholder="Observations (facultatif)" className={`${field} mt-3`} />
        </section>

        <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-bold">Produits à approvisionner</h2>
          <div className="mt-3 flex flex-col gap-2">
            {lines.map((l) => {
              const unit = products.find((p) => p.id === l.productId)?.unit;
              return (
                <div key={l.key} className="flex flex-wrap items-center gap-2">
                  <select
                    value={l.productId}
                    onChange={(e) => update(l.key, { productId: e.target.value })}
                    aria-label="Produit"
                    className={`${field} min-w-[200px] flex-1`}
                  >
                    <option value="">Choisir un produit…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={l.quantity}
                    onChange={(e) => update(l.key, { quantity: e.target.value })}
                    aria-label="Quantité"
                    className={`${field} w-24`}
                  />
                  <span className="w-12 text-xs text-ink-soft">{unit ?? ""}</span>
                  <button
                    type="button"
                    onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== l.key) : ls))}
                    aria-label="Retirer la ligne"
                    className="rounded p-1.5 text-rust hover:bg-rust/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setLines((ls) => [...ls, { key: nextKey, productId: "", quantity: "1" }]);
              setNextKey((k) => k + 1);
            }}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-rust"
          >
            <Plus size={15} /> Ajouter un produit
          </button>
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-border-egbm bg-white p-4 shadow-sm lg:self-start">
        <h2 className="font-display text-lg font-bold">Suivi</h2>
        <label className="text-xs text-ink-soft">
          Date de réception prévue (facultatif)
          <input type="date" {...bind("expectedDate")} className={`${field} mt-1`} />
        </label>
        <label className="text-xs text-ink-soft">
          Employé responsable
          <select {...bind("responsibleId")} className={`${field} mt-1`}>
            <option value="">Aucun</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        {state.error && (
          <p className="text-sm font-medium text-rust-dark" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-rust py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Enregistrement..." : "Créer la commande fournisseur"}
        </button>
        <p className="text-xs text-ink-soft">La commande est créée en brouillon ; vous l&apos;enverrez ensuite au fournisseur.</p>
      </section>
    </div>
  );
}
