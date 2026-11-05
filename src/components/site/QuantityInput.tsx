"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export const MAX_QUANTITY = 100000;

// Quantité souhaitée pour une demande de devis : on peut taper un nombre ou utiliser − / +.
// Minimum 1, sans plafond lié au stock ; l'unité du produit (sac, tonne…) s'affiche à côté.
export function QuantityInput({
  value,
  onChange,
  unit,
  label,
}: {
  value: number;
  onChange: (quantity: number) => void;
  unit?: string | null;
  label: string;
}) {
  const [text, setText] = useState(String(value));

  function commit(quantity: number) {
    const clamped = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity) || 1));
    setText(String(clamped));
    onChange(clamped);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex shrink-0 items-center rounded-md border border-border-egbm bg-white">
        <button
          type="button"
          onClick={() => commit(value - 1)}
          disabled={value <= 1}
          aria-label={`Diminuer la quantité : ${label}`}
          className="px-2 py-2 text-ink disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
            setText(digits);
            const n = parseInt(digits, 10);
            if (n > 0) onChange(Math.min(n, MAX_QUANTITY));
          }}
          onBlur={() => commit(parseInt(text, 10))}
          aria-label={`Quantité : ${label}`}
          className="w-12 border-x border-border-egbm bg-white py-1.5 text-center text-sm font-semibold outline-none focus:bg-surface"
        />
        <button
          type="button"
          onClick={() => commit(value + 1)}
          disabled={value >= MAX_QUANTITY}
          aria-label={`Augmenter la quantité : ${label}`}
          className="px-2 py-2 text-ink disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
      {unit && <span className="text-xs text-ink-soft">{unit}</span>}
    </div>
  );
}
