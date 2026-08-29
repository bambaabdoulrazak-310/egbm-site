"use client";

import { useActionState, useEffect, useMemo } from "react";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";
import { formatFCFA } from "@/lib/catalog";
import { createOrderAction, type OrderState } from "@/lib/actions/orders";
import { AntiSpamFields } from "@/components/site/AntiSpamFields";

export interface CommandeProduit {
  id: string;
  name: string;
  price: number;
}

const initialState: OrderState = {};

export function CommandeClient({ products }: { products: CommandeProduit[] }) {
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

  const total = lignes.reduce((sum, l) => sum + l.price * l.qty, 0);

  useEffect(() => {
    if (state.success) {
      clearCart();
    }
    // clearCart ne doit se déclencher qu'à la confirmation d'une nouvelle commande
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div>
      {state.success && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-green p-4 font-semibold text-white">
          <CheckCircle2 /> Commande envoyée — nous vous contacterons pour confirmation.
        </div>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-[22px] font-bold">Panier</h2>
          {lignes.length === 0 && (
            <p className="mt-2 text-sm text-ink-soft">
              Aucun article. Ajoutez des produits depuis la page Produits.
            </p>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {lignes.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-md border border-border-egbm bg-cream p-3"
              >
                <div className="text-sm font-medium">{l.name}</div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Diminuer">
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-mono">{l.qty}</span>
                  <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Augmenter">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {lignes.length > 0 && (
            <div className="mt-4 flex justify-between font-mono font-semibold">
              <span>Total</span>
              <span>{formatFCFA(total)}</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-[22px] font-bold">Vos informations</h2>
          <form action={formAction} className="mt-3 flex flex-col gap-3">
            <AntiSpamFields />
            <input type="hidden" name="panier" value={JSON.stringify(cart)} />
            <input
              name="nom"
              required
              placeholder="Nom complet"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            <input
              name="tel"
              required
              placeholder="Téléphone"
              className="rounded-md border border-border-egbm bg-white p-3"
            />
            <input
              name="adresse"
              placeholder="Adresse de livraison"
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
              {pending ? "Envoi..." : "Envoyer la commande"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
