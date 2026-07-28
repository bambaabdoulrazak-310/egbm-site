"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import Image from "next/image";
import { Stamp } from "@/components/site/Stamp";
import { formatFCFA } from "@/lib/catalog";
import { generateDocumentAction, type DocumentFormState } from "@/lib/actions/documents";

export interface FactProduit {
  id: string;
  name: string;
  price: number;
}

export interface GeneratedDocument {
  number: string;
  type: "FACTURE" | "PROFORMA" | "DEVIS";
  clientName: string;
  total: number;
}

interface Ligne {
  productId: string;
  qty: number;
  prix: number;
}

const TYPES = [
  ["FACTURE", "Facture"],
  ["PROFORMA", "Proforma"],
  ["DEVIS", "Devis"],
] as const;

const PREFIXES: Record<string, string> = { FACTURE: "FAC", PROFORMA: "PRO", DEVIS: "DEV" };

const initialState: DocumentFormState = {};

export function AdminFacturationClient({
  products,
  documents,
}: {
  products: FactProduit[];
  documents: GeneratedDocument[];
}) {
  const [type, setType] = useState<(typeof TYPES)[number][0]>("FACTURE");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [state, formAction, pending] = useActionState(generateDocumentAction, initialState);

  useEffect(() => {
    // Réinitialise le formulaire local une fois le document généré côté serveur.
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClientName("");
      setClientContact("");
      setLignes([]);
    }
  }, [state.success]);

  const addLigne = () =>
    setLignes((l) => [...l, { productId: products[0]?.id ?? "", qty: 1, prix: products[0]?.price ?? 0 }]);
  const updateLigne = (i: number, patch: Partial<Ligne>) =>
    setLignes((l) => l.map((ln, idx) => (idx === i ? { ...ln, ...patch } : ln)));
  const removeLigne = (i: number) => setLignes((l) => l.filter((_, idx) => idx !== i));

  const sousTotal = lignes.reduce((s, l) => s + l.qty * l.prix, 0);
  const tva = Math.round(sousTotal * 0.18);
  const total = sousTotal + tva;

  const linesPayload = JSON.stringify(
    lignes.map((l) => ({
      productId: l.productId,
      productName: products.find((p) => p.id === l.productId)?.name ?? "",
      qty: l.qty,
      prix: l.prix,
    }))
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl print:hidden">Facturation</h1>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <form action={formAction} className="rounded-lg border border-border-egbm bg-cream p-4 print:hidden">
          <input type="hidden" name="lines" value={linesPayload} />
          <div className="mb-3 flex gap-2">
            {TYPES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  type === value ? "bg-green text-white" : "bg-bg-alt text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />

          <div className="grid grid-cols-2 gap-2">
            <input
              name="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client"
              required
              className="rounded-md border border-border-egbm p-2"
            />
            <input
              name="clientContact"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="Contact"
              className="rounded-md border border-border-egbm p-2"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {lignes.map((l, i) => (
              <div key={i} className="grid grid-cols-2 items-center gap-2 md:grid-cols-12">
                <select
                  value={l.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    updateLigne(i, { productId: e.target.value, prix: prod?.price ?? 0 });
                  }}
                  className="col-span-2 rounded-md border border-border-egbm p-2 text-sm md:col-span-6"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) => updateLigne(i, { qty: Number(e.target.value) || 1 })}
                  placeholder="Qté"
                  className="col-span-1 w-full rounded-md border border-border-egbm p-2 text-sm md:col-span-2"
                />
                <input
                  type="number"
                  min={0}
                  value={l.prix}
                  onChange={(e) => updateLigne(i, { prix: Number(e.target.value) || 0 })}
                  placeholder="Prix"
                  className="col-span-1 w-full rounded-md border border-border-egbm p-2 text-sm md:col-span-3"
                />
                <button
                  type="button"
                  onClick={() => removeLigne(i)}
                  className="col-span-2 flex justify-center md:col-span-1"
                >
                  <Trash2 size={15} className="text-rust" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLigne}
              className="mt-1 flex items-center gap-1 text-sm text-rust"
            >
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-1 font-mono text-sm">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatFCFA(sousTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (18%)</span>
              <span>{formatFCFA(tva)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatFCFA(total)}</span>
            </div>
          </div>

          {state.error && <p className="mt-2 text-sm font-medium text-rust-dark">{state.error}</p>}

          <button
            type="submit"
            disabled={pending || lignes.length === 0 || !clientName}
            className="mt-4 w-full rounded-md bg-rust py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Génération..." : "Générer le document"}
          </button>
        </form>

        <div id="facture-preview" className="rounded-lg border border-border-egbm bg-paper p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.jpg" alt="Logo EGBM" width={40} height={40} className="rounded-full object-cover" />
              <div>
                <div className="font-display text-[22px] font-extrabold">EGBM</div>
                <div className="text-xs text-ink-soft">
                  Entreprise Générale Bamba Mamadou
                  <br />
                  Korhogo, Côte d&apos;Ivoire
                </div>
              </div>
            </div>
            <Stamp label={TYPES.find(([v]) => v === type)?.[1].toUpperCase() ?? type} />
          </div>
          <div className="mt-3 font-mono text-xs text-ink-soft">
            N° {PREFIXES[type]}-{new Date().getFullYear()}-??? (aperçu) ·{" "}
            {new Date().toISOString().slice(0, 10)}
          </div>
          <div className="mt-3 text-sm">
            <div className="font-semibold">Client :</div>
            <div>{clientName || "—"}</div>
            <div className="text-ink-soft">{clientContact}</div>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border-egbm">
                <th className="py-1 text-left">Article</th>
                <th className="py-1 text-right">Qté</th>
                <th className="py-1 text-right">P.U.</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => {
                const prod = products.find((p) => p.id === l.productId);
                return (
                  <tr key={i}>
                    <td className="py-1">{prod?.name}</td>
                    <td className="py-1 text-right">{l.qty}</td>
                    <td className="py-1 text-right font-mono">{l.prix.toLocaleString("fr-FR")}</td>
                    <td className="py-1 text-right font-mono">
                      {(l.qty * l.prix).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 flex flex-col items-end font-mono text-sm">
            <div>Sous-total : {formatFCFA(sousTotal)}</div>
            <div>TVA 18% : {formatFCFA(tva)}</div>
            <div className="font-bold">Total : {formatFCFA(total)}</div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 flex items-center gap-1.5 rounded-md border border-border-egbm px-3 py-1.5 text-sm font-semibold print:hidden"
          >
            <Printer size={15} /> Imprimer
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mt-6 print:hidden">
          <h2 className="font-display text-[22px] font-bold">Documents générés</h2>
          <div className="mt-2 flex flex-col gap-2">
            {documents.map((f) => (
              <div
                key={f.number}
                className="flex justify-between rounded-md border border-border-egbm bg-cream p-3 text-sm"
              >
                <span className="font-mono">
                  {f.number} — {TYPES.find(([v]) => v === f.type)?.[1]}
                </span>
                <span>{f.clientName}</span>
                <span className="font-mono">{formatFCFA(f.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
