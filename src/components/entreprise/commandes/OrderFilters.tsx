import Link from "next/link";
import { ORDER_STATUSES, SOURCE_LABELS, STATUS_LABELS } from "@/lib/order-workflow";
import type { OrderFilters as Filters } from "@/lib/order-list";

const field = "rounded-md border border-border-egbm bg-white p-2 text-sm";

// Formulaire GET : la recherche et les filtres sont dans l'adresse (aucun script nécessaire).
export function OrderFilters({ tab, filters }: { tab: string; filters: Filters }) {
  const withStatus = tab === "clients" || tab === "historique";
  const statusOptions: Array<[string, string]> =
    tab === "historique"
      ? [
          ["actives", "Livrées et annulées"],
          ["LIVREE", STATUS_LABELS.LIVREE],
          ["ANNULEE", STATUS_LABELS.ANNULEE],
        ]
      : [
          ["actives", "En cours (confirmées)"],
          ["toutes", "Tous les statuts"],
          ...ORDER_STATUSES.map((s) => [s, STATUS_LABELS[s]] as [string, string]),
        ];

  return (
    <form method="get" className="mt-4 grid gap-2 rounded-lg border border-border-egbm bg-white p-3 shadow-sm md:grid-cols-6">
      <input type="hidden" name="onglet" value={tab} />
      <input
        type="search"
        name="q"
        defaultValue={filters.q}
        placeholder="Référence, client, produit, responsable…"
        aria-label="Rechercher"
        className={`${field} md:col-span-2`}
      />
      {withStatus && (
        <select name="statut" defaultValue={filters.statut} aria-label="Statut" className={field}>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
      <select name="type" defaultValue={filters.type} aria-label="Type de commande" className={field}>
        <option value="">Tous les types</option>
        {Object.entries(SOURCE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 text-xs text-ink-soft">
        Du
        <input type="date" name="du" defaultValue={filters.du} className={`${field} flex-1`} />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-ink-soft">
        Au
        <input type="date" name="au" defaultValue={filters.au} className={`${field} flex-1`} />
      </label>
      {tab === "clients" && (
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="retard" value="1" defaultChecked={filters.retard} />
          Commandes en retard uniquement
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
