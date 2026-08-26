"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatFCFA } from "@/lib/catalog";
import { numberToFrenchWords } from "@/lib/numberToWords";
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
  prixBrut: number;
  remise: number;
  prixNet: number;
}

const TYPES = [
  ["FACTURE", "Facture"],
  ["PROFORMA", "Proforma"],
  ["DEVIS", "Devis"],
] as const;

const initialState: DocumentFormState = {};

function round(n: number) {
  return Math.round(n);
}

export function AdminFacturationClient({
  products,
  documents,
  nextNumberHints,
}: {
  products: FactProduit[];
  documents: GeneratedDocument[];
  nextNumberHints: Record<(typeof TYPES)[number][0], string>;
}) {
  const [type, setType] = useState<(typeof TYPES)[number][0]>("FACTURE");
  const [number, setNumber] = useState(nextNumberHints.FACTURE);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [objet, setObjet] = useState("");
  const [vatApplicable, setVatApplicable] = useState(true);
  const [validityDays, setValidityDays] = useState("15");
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [state, formAction, pending] = useActionState(generateDocumentAction, initialState);

  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClientName("");
      setClientContact("");
      setClientAddress("");
      setObjet("");
      setLignes([]);
    }
  }, [state.success]);

  const changeType = (value: (typeof TYPES)[number][0]) => {
    setType(value);
    setNumber(nextNumberHints[value]);
  };

  const addLigne = () => {
    const prod = products[0];
    setLignes((l) => [
      ...l,
      { productId: prod?.id ?? "", qty: 1, prixBrut: prod?.price ?? 0, remise: 0, prixNet: prod?.price ?? 0 },
    ]);
  };
  const updateLigne = (i: number, patch: Partial<Ligne>) =>
    setLignes((l) => l.map((ln, idx) => (idx === i ? { ...ln, ...patch } : ln)));
  const removeLigne = (i: number) => setLignes((l) => l.filter((_, idx) => idx !== i));

  const setLigneBrutOrRemise = (i: number, patch: { prixBrut?: number; remise?: number }) => {
    setLignes((l) =>
      l.map((ln, idx) => {
        if (idx !== i) return ln;
        const next = { ...ln, ...patch };
        next.prixNet = round(next.prixBrut * (1 - next.remise / 100));
        return next;
      })
    );
  };

  const sousTotal = lignes.reduce((s, l) => s + l.qty * l.prixNet, 0);
  const tva = vatApplicable ? round(sousTotal * 0.18) : 0;
  const total = sousTotal + tva;
  const validityDaysNum = Number(validityDays) || 0;

  const linesPayload = JSON.stringify(
    lignes.map((l) => ({
      productId: l.productId,
      productName: products.find((p) => p.id === l.productId)?.name ?? "",
      qty: l.qty,
      prixBrut: l.prixBrut,
      remise: l.remise,
      prixNet: l.prixNet,
    }))
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl print:hidden">Facturation</h1>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <form action={formAction} className="rounded-lg border border-border-egbm bg-cream p-4 print:hidden">
          <input type="hidden" name="lines" value={linesPayload} />
          <input type="hidden" name="type" value={type} />
          <div className="mb-3 flex gap-2">
            {TYPES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeType(value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  type === value ? "bg-green text-white" : "bg-bg-alt text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="text-xs font-semibold text-ink-soft">N° du document</label>
          <input
            name="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-border-egbm p-2 font-mono text-sm"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
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
          <input
            name="clientAddress"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Adresse du client"
            className="mt-2 w-full rounded-md border border-border-egbm p-2"
          />
          <input
            name="objet"
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            placeholder="Objet (ex: Achat de tableau & markers)"
            className="mt-2 w-full rounded-md border border-border-egbm p-2"
          />

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                name="vatApplicable"
                checked={vatApplicable}
                onChange={(e) => setVatApplicable(e.target.checked)}
              />
              TVA 18% applicable
            </label>
            <label className="flex items-center gap-1.5">
              Validité (jours)
              <input
                type="number"
                name="validityDays"
                min={0}
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-16 rounded-md border border-border-egbm p-1"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {lignes.map((l, i) => (
              <div key={i} className="grid grid-cols-2 items-center gap-2 md:grid-cols-12">
                <select
                  value={l.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    updateLigne(i, { productId: e.target.value });
                    setLigneBrutOrRemise(i, { prixBrut: prod?.price ?? 0 });
                  }}
                  className="col-span-2 rounded-md border border-border-egbm p-2 text-sm md:col-span-4"
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
                  title="Quantité"
                  className="col-span-1 w-full rounded-md border border-border-egbm p-2 text-sm md:col-span-1"
                />
                <input
                  type="number"
                  min={0}
                  value={l.prixBrut}
                  onChange={(e) => setLigneBrutOrRemise(i, { prixBrut: Number(e.target.value) || 0 })}
                  placeholder="PU Brut"
                  title="Prix unitaire brut"
                  className="col-span-1 w-full rounded-md border border-border-egbm p-2 text-sm md:col-span-2"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={l.remise}
                  onChange={(e) => setLigneBrutOrRemise(i, { remise: Number(e.target.value) || 0 })}
                  placeholder="Remise %"
                  title="Remise (%)"
                  className="col-span-1 w-full rounded-md border border-border-egbm p-2 text-sm md:col-span-1"
                />
                <input
                  type="number"
                  min={0}
                  value={l.prixNet}
                  onChange={(e) => updateLigne(i, { prixNet: Number(e.target.value) || 0 })}
                  placeholder="PU Net"
                  title="Prix unitaire net (modifiable)"
                  className="col-span-1 w-full rounded-md border border-border-egbm p-2 text-sm md:col-span-2"
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
              <span>{vatApplicable ? "TVA (18%)" : "TVA"}</span>
              <span>{vatApplicable ? formatFCFA(tva) : "Non facturée"}</span>
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

        <div id="facture-preview" className="rounded-lg border border-border-egbm bg-paper p-5 text-[13px] leading-snug print:border-0 print:p-0 print:text-xs">
          <div className="flex items-start justify-between border-b-2 border-ink pb-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.jpg" alt="Logo EGBM" width={44} height={44} className="rounded-full object-cover" />
              <div>
                <div className="font-display text-xl font-extrabold">E.G.B.M.</div>
                <div className="text-[11px] font-semibold">ENTREPRISE GENERALE BAMBA MAMADOU — SARL</div>
                <div className="text-[10px] text-ink-soft">
                  Génie civil · Distribution agro-chimie · Appareils de traitement & pièces détachées ·
                  Matériels industriels · Fournitures de bureau · Prestations de services
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center font-display text-2xl font-extrabold tracking-wide">
            {TYPES.find(([v]) => v === type)?.[1].toUpperCase()}
          </div>

          <div className="mt-2 flex justify-between font-mono text-xs">
            <span>DATE : {new Date().toLocaleDateString("fr-FR")}</span>
            <span>N° {number || "—"}</span>
          </div>

          <div className="mt-3 text-sm">
            <div className="font-semibold">DOIT :</div>
            <div className="font-bold uppercase">{clientName || "—"}</div>
            {clientAddress && <div>Adresse : {clientAddress}</div>}
            {clientContact && <div>Contact : {clientContact}</div>}
          </div>
          {objet && (
            <div className="mt-2 text-sm">
              <span className="font-semibold">OBJET :</span> {objet}
            </div>
          )}

          <table className="mt-3 w-full border-collapse text-xs">
            <thead>
              <tr className="border-y border-ink text-left">
                <th className="py-1 pr-1">N°</th>
                <th className="py-1 pr-1">Désignation</th>
                <th className="py-1 pr-1 text-right">Qtés</th>
                <th className="py-1 pr-1 text-right">PU Brut</th>
                <th className="py-1 pr-1 text-right">Remise</th>
                <th className="py-1 pr-1 text-right">PU Net</th>
                <th className="py-1 text-right">Prix Total</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => {
                const prod = products.find((p) => p.id === l.productId);
                return (
                  <tr key={i} className="border-b border-border-egbm">
                    <td className="py-1 pr-1">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-1 pr-1">{prod?.name}</td>
                    <td className="py-1 pr-1 text-right font-mono">{l.qty}</td>
                    <td className="py-1 pr-1 text-right font-mono">{l.prixBrut.toLocaleString("fr-FR")}</td>
                    <td className="py-1 pr-1 text-right font-mono">{l.remise}%</td>
                    <td className="py-1 pr-1 text-right font-mono">{l.prixNet.toLocaleString("fr-FR")}</td>
                    <td className="py-1 text-right font-mono">{(l.qty * l.prixNet).toLocaleString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-2 flex flex-col items-end font-mono text-xs">
            <div className="flex w-48 justify-between">
              <span>MONTANT HT</span>
              <span>{sousTotal.toLocaleString("fr-FR")}</span>
            </div>
            <div className="flex w-48 justify-between">
              <span>TVA 18%</span>
              <span>{vatApplicable ? tva.toLocaleString("fr-FR") : "NON FACTUREE"}</span>
            </div>
            <div className="flex w-48 justify-between border-t border-ink pt-0.5 font-bold">
              <span>TOTAL TTC</span>
              <span>{total.toLocaleString("fr-FR")}</span>
            </div>
          </div>

          {total > 0 && (
            <p className="mt-3 text-xs italic">
              Arrêté la présente {TYPES.find(([v]) => v === type)?.[1].toLowerCase()} à la somme de :{" "}
              {numberToFrenchWords(total)} ({total.toLocaleString("fr-FR")}) Francs CFA
            </p>
          )}
          {validityDaysNum > 0 && (type === "PROFORMA" || type === "DEVIS") && (
            <p className="mt-1 text-xs italic">Cette offre est valable pour {validityDaysNum} Jours</p>
          )}

          <div className="mt-8 flex justify-end">
            <div className="flex flex-col items-center gap-1 text-xs">
              <span className="font-semibold">Le Directeur</span>
              <Image src="/stamp-egbm.jpg" alt="Cachet EGBM" width={130} height={80} className="object-contain" />
            </div>
          </div>

          <div className="mt-6 border-t border-border-egbm pt-2 text-center text-[9px] text-ink-soft">
            <div>
              Siège social Korhogo Qt Lognon — BP 739 Kgo — Tél 08 47 85 37 / 05 92 52 53 — Email :
              egbm2011@yahoo.fr — Capital 1 000 000
            </div>
            <div>RC : CI-KGO-2011-B-176 — CC 1112544 L / CB 03534180000 BNI — Centre d&apos;imposition de Soba — RSI</div>
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
