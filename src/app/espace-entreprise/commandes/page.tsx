import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getOrderSummary } from "@/lib/order-stats";
import {
  getClientOrders,
  getHistory,
  getOrdersToConfirm,
  parseFilters,
} from "@/lib/order-list";
import { formatDateFr } from "@/lib/order-workflow";
import { getSupplierHistory, getSupplierOrders, getSupplierStats } from "@/lib/supplier-list";
import { getDeliveries, getDeliveryStats } from "@/lib/delivery-list";
import {
  DeliveriesTable,
  StatCards,
  SupplierOrdersTable,
} from "@/components/entreprise/commandes/SupplierTables";
import { OrderSummaryCards } from "@/components/entreprise/commandes/OrderSummaryCards";
import { OrderFilters } from "@/components/entreprise/commandes/OrderFilters";
import { OrdersTable } from "@/components/entreprise/commandes/OrdersTable";
import { EventLog } from "@/components/entreprise/commandes/EventLog";
import { QuickConfirm } from "@/components/entreprise/commandes/OrderActions";

export const metadata: Metadata = { title: "Commandes — Espace Entreprise" };
export const revalidate = 0;

const TABS: Array<[key: string, label: string]> = [
  ["clients", "Commandes clients"],
  ["fournisseurs", "Commandes fournisseurs"],
  ["livraisons", "Livraisons"],
  ["historique", "Historique"],
];

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawTab = Array.isArray(params.onglet) ? params.onglet[0] : params.onglet;
  const tab = TABS.some(([k]) => k === rawTab) ? (rawTab as string) : "clients";
  const filters = parseFilters(params);

  const summary = await getOrderSummary();

  // « À confirmer » : demandes du site pas encore confirmées (affichées seulement avec le statut par défaut).
  const showToConfirm = tab === "clients" && !filters.retard && filters.statut === "actives";
  const [toConfirm, clientOrders, history, supplierOrders, supplierStats, supplierHistory, deliveries, deliveryStats] =
    await Promise.all([
      showToConfirm ? getOrdersToConfirm(filters) : Promise.resolve([]),
      tab === "clients" ? getClientOrders(filters) : Promise.resolve([]),
      tab === "historique" ? getHistory(filters) : Promise.resolve(null),
      tab === "fournisseurs" ? getSupplierOrders(filters) : Promise.resolve([]),
      tab === "fournisseurs" ? getSupplierStats() : Promise.resolve(null),
      tab === "historique" ? getSupplierHistory(filters) : Promise.resolve([]),
      tab === "livraisons" ? getDeliveries(filters) : Promise.resolve([]),
      tab === "livraisons" ? getDeliveryStats() : Promise.resolve(null),
    ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">Suivi des commandes</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/espace-entreprise/commandes/fournisseurs/nouvelle"
            className="flex items-center gap-1.5 rounded-md border border-rust px-4 py-2 font-semibold text-rust hover:bg-rust/10"
          >
            <Plus size={16} /> Commande fournisseur
          </Link>
          <Link
            href="/espace-entreprise/commandes/nouvelle"
            className="flex items-center gap-1.5 rounded-md bg-rust px-4 py-2 font-semibold text-white hover:bg-rust-dark"
          >
            <Plus size={16} /> Nouvelle commande
          </Link>
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">Commandes clients</p>

      {/* La clé force la mise à jour immédiate des indicateurs après une action (le polling couvre le reste). */}
      <OrderSummaryCards key={JSON.stringify(summary)} initial={summary} />

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border-egbm" aria-label="Onglets du suivi">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/espace-entreprise/commandes?onglet=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === key ? "border-rust text-rust" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "clients" && (
        <section>
          {showToConfirm && toConfirm.length > 0 && (
            <div className="mt-5 rounded-lg border-2 border-safety bg-white p-4 shadow-sm">
              <h2 className="font-display text-lg font-bold">
                À confirmer ({toConfirm.length})
              </h2>
              <p className="text-xs text-ink-soft">
                Demandes reçues du site : elles entrent dans le suivi une fois confirmées.
              </p>
              <ul className="mt-3 divide-y divide-border-egbm/60">
                {toConfirm.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link
                        href={`/espace-entreprise/commandes/${o.id}`}
                        className="font-semibold hover:underline"
                      >
                        <span className="font-mono text-rust">{o.reference ?? "—"}</span> · {o.clientName}
                      </Link>
                      {o.clientCompany && <span className="text-sm text-ink-soft"> ({o.clientCompany})</span>}
                      <div className="text-xs text-ink-soft">
                        {o.items.map((it) => `${it.quantity} × ${it.name}`).join(" · ")} · reçue le{" "}
                        {formatDateFr(o.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <QuickConfirm orderId={o.id} />
                      <Link
                        href={`/espace-entreprise/commandes/${o.id}`}
                        className="rounded-md border border-border-egbm px-3 py-1.5 text-sm font-semibold"
                      >
                        Ouvrir
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <OrderFilters tab={tab} filters={filters} />
          <OrdersTable
            rows={clientOrders}
            empty={filters.retard ? "Aucune commande en retard." : "Aucune commande ne correspond à ces critères."}
          />
        </section>
      )}

      {tab === "historique" && history && (
        <section>
          <OrderFilters tab={tab} filters={filters} />
          <h2 className="mt-5 font-display text-xl font-bold">Commandes terminées ou annulées</h2>
          <OrdersTable rows={history.orders} empty="Aucune commande terminée ou annulée pour le moment." />
          <h2 className="mt-8 font-display text-xl font-bold">Commandes fournisseurs reçues ou annulées</h2>
          <SupplierOrdersTable
            rows={supplierHistory}
            empty="Aucune commande fournisseur reçue ou annulée pour le moment."
          />
          <h2 className="mt-8 font-display text-xl font-bold">Journal des modifications</h2>
          <p className="text-xs text-ink-soft">
            Les 100 derniers événements enregistrés. Les commandes antérieures au suivi n&apos;ont pas
            d&apos;événements enregistrés.
          </p>
          <EventLog events={history.events} />
        </section>
      )}

      {tab === "fournisseurs" && supplierStats && (
        <section>
          <StatCards
            items={[
              { label: "Fournisseurs en cours", value: supplierStats.enCours },
              { label: "Brouillons à envoyer", value: supplierStats.aEnvoyer },
              { label: "En attente de réception", value: supplierStats.attenteReception },
              { label: "Reçues partiellement", value: supplierStats.partielles },
              { label: "En retard", value: supplierStats.enRetard, alert: true, href: "?onglet=fournisseurs&retard=1" },
              { label: "Reçues", value: supplierStats.recues },
            ]}
          />
          <OrderFilters tab={tab} filters={filters} />
          <SupplierOrdersTable
            rows={supplierOrders}
            empty={
              filters.retard
                ? "Aucune commande fournisseur en retard."
                : "Aucune commande fournisseur ne correspond à ces critères."
            }
          />
        </section>
      )}

      {tab === "livraisons" && deliveryStats && (
        <section>
          <StatCards
            items={[
              { label: "Livraisons prévues", value: deliveryStats.prevues, href: "?onglet=livraisons&statut=PREVUE" },
              { label: "En cours", value: deliveryStats.enCours, href: "?onglet=livraisons&statut=EN_COURS" },
              { label: "Partielles", value: deliveryStats.partielles, href: "?onglet=livraisons&statut=PARTIELLE" },
              { label: "Terminées", value: deliveryStats.terminees, href: "?onglet=livraisons&statut=EFFECTUEE" },
              { label: "En retard", value: deliveryStats.enRetard, alert: true, href: "?onglet=livraisons&retard=1" },
            ]}
          />
          <OrderFilters tab={tab} filters={filters} />
          <DeliveriesTable
            rows={deliveries}
            empty={
              filters.retard
                ? "Aucune livraison en retard."
                : "Aucune livraison ne correspond à ces critères. Les livraisons se prévoient depuis la fiche d'une commande."
            }
          />
        </section>
      )}
    </div>
  );
}
