"use client";

import { useActionState, useEffect, useMemo } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";
import { QuantityInput } from "@/components/site/QuantityInput";
import { createOrderAction, type OrderState } from "@/lib/actions/orders";
import { AntiSpamFields } from "@/components/site/AntiSpamFields";

export interface CommandeProduit {
  id: string;
  name: string;
  unit: string | null;
}

export interface CommandeCustomer {
  name: string;
  phone: string;
  address: string | null;
}

const initialState: OrderState = {};

export function CommandeClient({
  products,
  customer,
}: {
  products: CommandeProduit[];
  customer?: CommandeCustomer | null;
}) {
  const { cart, setQty, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(createOrderAction, initialState);

  const lignes = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === id);
        return product ? { ...product, qty } : null;
      })
      .filter((l): l is CommandeProduit & { qty: number } => l !== null);
  }, [cart, products]);

  useEffect(() => {
    if (state.success) {
      clearCart();
    }
    // clearCart ne doit se déclencher qu'à la confirmation d'une nouvelle demande
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div>
      {state.success && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-green p-4 font-semibold text-white">
          <CheckCircle2 /> Demande de devis envoyée — nous vous recontacterons rapidement avec un devis.
        </div>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-[22px] font-bold">Panier</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Indiquez les quantités souhaitées pour chaque produit : nous vous répondons avec un devis.
            Aucun paiement en ligne.
          </p>
          {lignes.length === 0 && (
            <p className="mt-3 text-sm text-ink-soft">
              Aucun produit. Ajoutez des produits depuis la page Produits.
            </p>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {lignes.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-egbm bg-white p-3 shadow-sm"
              >
                <div className="min-w-0 text-sm font-medium">{l.name}</div>
                <div className="flex items-center gap-3">
                  <QuantityInput
                    value={l.qty}
                    onChange={(quantity) => setQty(l.id, quantity)}
                    unit={l.unit}
                    label={l.name}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(l.id, 0)}
                    aria-label={`Retirer ${l.name} de la demande`}
                    className="rounded p-1.5 text-rust hover:bg-rust/10"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-[22px] font-bold">Vos informations</h2>
          <form action={formAction} className="mt-3 flex flex-col gap-3">
            <AntiSpamFields />
            <input type="hidden" name="panier" value={JSON.stringify(cart)} />
            <input
              name="nom"
              required
              defaultValue={customer?.name ?? ""}
              placeholder="Nom complet"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            <input
              name="entreprise"
              placeholder="Nom de l'entreprise (facultatif)"
              autoComplete="organization"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            <input
              name="tel"
              required
              defaultValue={customer?.phone ?? ""}
              placeholder="Téléphone"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            <input
              name="adresse"
              defaultValue={customer?.address ?? ""}
              placeholder="Adresse de livraison"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            <textarea
              name="message"
              rows={3}
              placeholder="Message complémentaire (facultatif)"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            {state.error && (
              <p className="text-sm font-medium text-rust-dark" role="alert">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending || lignes.length === 0}
              className="rounded-md bg-rust py-3 font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Envoi..." : "Envoyer la demande de devis"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
