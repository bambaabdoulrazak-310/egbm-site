"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(productId)}
      disabled={disabled}
      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-rust py-3 font-semibold text-white disabled:opacity-50 md:w-auto md:px-8"
    >
      <Plus size={16} /> Ajouter à la commande
    </button>
  );
}
