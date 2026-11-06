// Règles du suivi des commandes, partagées entre le serveur (validation) et l'interface (affichage).
// NOUVELLE = en attente de confirmation · EN_COURS = en préparation · LIVREE = terminée.

export type OrderStatusValue =
  | "NOUVELLE"
  | "CONFIRMEE"
  | "EN_COURS"
  | "EN_LIVRAISON"
  | "LIVREE"
  | "ANNULEE";

export type OrderSourceValue = "SITE" | "MANUELLE" | "DEVIS";

export type OrderEventTypeValue =
  | "CREEE"
  | "CONFIRMEE"
  | "PREPARATION"
  | "EXPEDIEE"
  | "LIVREE"
  | "ANNULEE"
  | "REACTIVEE"
  | "DATE_MODIFIEE"
  | "RESPONSABLE_MODIFIE";

export const ORDER_STATUSES: OrderStatusValue[] = [
  "NOUVELLE",
  "CONFIRMEE",
  "EN_COURS",
  "EN_LIVRAISON",
  "LIVREE",
  "ANNULEE",
];

export const STATUS_LABELS: Record<OrderStatusValue, string> = {
  NOUVELLE: "En attente de confirmation",
  CONFIRMEE: "Confirmée",
  EN_COURS: "En préparation",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export const STATUS_CLASSES: Record<OrderStatusValue, string> = {
  NOUVELLE: "bg-safety text-ink",
  CONFIRMEE: "bg-blue-100 text-blue-900",
  EN_COURS: "bg-rust text-white",
  EN_LIVRAISON: "bg-ink text-white",
  LIVREE: "bg-green text-white",
  ANNULEE: "bg-surface text-ink-soft",
};

export const SOURCE_LABELS: Record<OrderSourceValue, string> = {
  SITE: "Site web",
  MANUELLE: "Saisie manuelle",
  DEVIS: "Devis converti",
};

export const EVENT_LABELS: Record<OrderEventTypeValue, string> = {
  CREEE: "Commande créée",
  CONFIRMEE: "Commande confirmée",
  PREPARATION: "Préparation commencée",
  EXPEDIEE: "Expédition effectuée",
  LIVREE: "Livraison terminée",
  ANNULEE: "Commande annulée",
  REACTIVEE: "Commande réactivée",
  DATE_MODIFIEE: "Date prévue modifiée",
  RESPONSABLE_MODIFIE: "Responsable modifié",
};

// Transitions autorisées pour un utilisateur autorisé (hors réactivation, réservée à l'administrateur).
// On peut avancer, annuler, ou revenir d'une étape en cas d'erreur (le retour est enregistré dans la chronologie).
export const TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  NOUVELLE: ["CONFIRMEE", "ANNULEE"],
  CONFIRMEE: ["EN_COURS", "ANNULEE"],
  EN_COURS: ["EN_LIVRAISON", "LIVREE", "CONFIRMEE", "ANNULEE"],
  EN_LIVRAISON: ["LIVREE", "EN_COURS", "ANNULEE"],
  LIVREE: [],
  ANNULEE: [],
};

// Ordre du déroulement normal d'une commande (sert à repérer un retour en arrière).
const STATUS_RANK: Record<OrderStatusValue, number> = {
  NOUVELLE: 0,
  CONFIRMEE: 1,
  EN_COURS: 2,
  EN_LIVRAISON: 3,
  LIVREE: 4,
  ANNULEE: 5,
};

// Retour à une étape précédente (ex. « En livraison » → « En préparation »).
export function isBackward(from: OrderStatusValue | null, to: OrderStatusValue | null): boolean {
  if (!from || !to || to === "ANNULEE" || from === "ANNULEE") return false;
  return STATUS_RANK[to] < STATUS_RANK[from];
}

// Statut vers lequel repart une commande réactivée par l'administrateur.
export const REACTIVATION_TARGET: OrderStatusValue = "CONFIRMEE";

// Événement enregistré lorsqu'on arrive à un statut donné.
export const EVENT_FOR_STATUS: Record<OrderStatusValue, OrderEventTypeValue> = {
  NOUVELLE: "CREEE",
  CONFIRMEE: "CONFIRMEE",
  EN_COURS: "PREPARATION",
  EN_LIVRAISON: "EXPEDIEE",
  LIVREE: "LIVREE",
  ANNULEE: "ANNULEE",
};

// Une justification est exigée pour annuler (et pour réactiver, voir l'action serveur).
// Libellé d'un événement de la chronologie (un retour en arrière n'est pas présenté comme une avancée).
export function eventLabel(
  type: OrderEventTypeValue,
  from: OrderStatusValue | null,
  to: OrderStatusValue | null
): string {
  if (type !== "REACTIVEE" && isBackward(from, to) && to) {
    return `Retour au statut « ${STATUS_LABELS[to]} »`;
  }
  return EVENT_LABELS[type];
}

export const NOTE_REQUIRED_FOR: OrderStatusValue[] = ["ANNULEE"];

export function isTerminal(status: OrderStatusValue): boolean {
  return status === "LIVREE" || status === "ANNULEE";
}

export function isStatus(value: string): value is OrderStatusValue {
  return (ORDER_STATUSES as string[]).includes(value);
}

export function canTransition(from: OrderStatusValue, to: OrderStatusValue): boolean {
  return TRANSITIONS[from].includes(to);
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Début du jour courant (UTC) : les dates prévues sont enregistrées à minuit UTC.
export function startOfToday(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Nombre de jours de retard (0 si la commande n'est pas en retard).
export function daysLate(
  expectedDate: Date | null,
  status: OrderStatusValue,
  now: Date = new Date()
): number {
  if (!expectedDate || isTerminal(status)) return 0;
  const diff = startOfToday(now).getTime() - expectedDate.getTime();
  return diff > 0 ? Math.floor(diff / DAY_MS) : 0;
}

export function isLate(expectedDate: Date | null, status: OrderStatusValue, now?: Date): boolean {
  return daysLate(expectedDate, status, now) > 0;
}

// "2026-11-20" (champ date) -> Date à minuit UTC ; null si invalide.
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function formatDateFr(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTimeFr(date: Date): string {
  return date.toLocaleString("fr-FR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
