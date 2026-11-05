"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";
import { QuantityInput } from "@/components/site/QuantityInput";

// Fiche produit : quantité souhaitée (avec l'unité du produit) puis ajout à la demande de devis.
export function AddToCartButton({
  productId,
  productName,
  unit,
}: {
  productId: string;
  productName: string;
  unit?: string | null;
}) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function handleAdd() {
    addToCart(productId, qty);
    setAdded(true);
    setQty(1);
    setResetKey((k) => k + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 4000);
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:max-w-xs">
      <div>
        <div className="mb-1.5 text-sm font-semibold">Quantité souhaitée</div>
        <QuantityInput key={resetKey} value={qty} onChange={setQty} unit={unit} label={productName} />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className={`flex w-full items-center justify-center gap-1.5 rounded-md py-3 font-semibold text-white transition-colors ${
          added ? "bg-green" : "bg-rust hover:bg-rust-dark"
        }`}
      >
        {added ? (
          <>
            <Check size={16} /> Ajouté à la demande de devis
          </>
        ) : (
          <>
            <ShoppingCart size={16} /> Ajouter à ma demande de devis
          </>
        )}
      </button>
      {added && (
        <Link
          href="/commande"
          className="flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
        >
          Voir ma demande de devis <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
