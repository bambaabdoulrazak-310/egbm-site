import Link from "next/link";
import { ORDER_STATUSES, SOURCE_LABELS, STATUS_LABELS } from "@/lib/order-workflow";
import { DELIVERY_LABELS, SUPPLIER_LABELS, SUPPLIER_STATUSES } from "@/lib/supplier-workflow";
import type { OrderFilters as Filters } from "@/lib/order-list";

const field = "rounded-md border border-border-egbm bg-white p-2 text-sm";

function statusOptionsFor(tab: string): Array<[string, string]> {
  switch (tab) {
    case "historique":
      return [
        ["actives", "Livrées/reçues et annulées"],
        ["LIVREE", STATUS_LABELS.LIVREE],
        ["ANNULEE", STATUS_LABELS.ANNULEE],
      ];
    case "fournisseurs":
      return [
        ["actives", "En cours"],
        ["toutes", "Tous les statuts"],
        ...SUPPLIER_STATUSES.map((s) => [s, SUPPLIER_LABELS[s]] as [string, string]),
      ];
    case "livraisons":
      return [
        ["actives", "Prévues et en cours"],
        ["PREVUE", DELIVERY_LABELS.PREVUE],
        ["EN_COURS", DELIVERY_LABELS.EN_COURS],
        ["PARTIELLE", "Partielles"],
        ["EFFECTUEE", DELIVERY_LABELS.EFFECTUEE],
        ["ANNULEE", DELIVERY_LABELS.ANNULEE],
        ["toutes", "Toutes"],
      ];
    default:
      return [
        ["actives", "En cours (confirmées)"],
        ["toutes", "Tous les statuts"],
        ...ORDER_STATUSES.map((s) => [s, STATUS_LABELS[s]] as [string, string]),
      ];
  }
}

// Formulaire GET : la recherche et les filtres sont dans l'adresse (aucun script nécessaire).
export function OrderFilters({ tab, filters }: { tab: string; filters: Filters }) {
  const withType = tab === "clients" || tab === "historique";
  const withRetard = tab !== "historique";
  const placeholder =
    tab === "fournisseurs"
      ? "Référence, fournisseur, produit, responsable…"
      : tab === "livraisons"
        ? "Commande, client, produit, responsable…"
        : "Référence, client, fournisseur, produit, responsable…";

  return (
    <form
      method="get"
      className="mt-4 grid gap-2 rounded-lg border border-border-egbm bg-white p-3 shadow-sm md:grid-cols-6"
    >
      <input type="hidden" name="onglet" value={tab} />
      <input
        type="search"
        name="q"
        defaultValue={filters.q}
        placeholder={placeholder}
        aria-label="Rechercher"
        className={`${field} md:col-span-2`}
      />
      <select name="statut" defaultValue={filters.statut} aria-label="Statut" className={field}>
        {statusOptionsFor(tab).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {withType && (
        <select name="type" defaultValue={filters.type} aria-label="Type de commande" className={field}>
          <option value="">Tous les types</option>
          {Object.entries(SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
      <label className="flex items-center gap-1.5 text-xs text-ink-soft">
        Du
        <input type="date" name="du" defaultValue={filters.du} className={`${field} flex-1`} />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-ink-soft">
        Au
        <input type="date" name="au" defaultValue={filters.au} className={`${field} flex-1`} />
      </label>
      {withRetard && (
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="retard" value="1" defaultChecked={filters.retard} />
          {tab === "livraisons" ? "Livraisons en retard uniquement" : "En retard uniquement"}
        </label>
      )}
      <div className="flex gap-2 md:col-span-2 md:justify-end">
        <button type="submit" className="rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href={`/espace-entreprise/commandes?onglet=${tab}`}
          className="rounded-md border border-border-egbm px-4 py-2 text-sm font-semibold"
        >
          Réinitialiser
        </Link>
      </div>
    </form>
  );
}
