import { STATUS_CLASSES, STATUS_LABELS, type OrderStatusValue } from "@/lib/order-workflow";

export function StatusBadge({ status }: { status: OrderStatusValue }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function LateBadge({ days }: { days: number }) {
  if (days <= 0) return null;
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-rust/15 px-2.5 py-0.5 text-xs font-bold text-rust-dark">
      Retard de {days} jour{days > 1 ? "s" : ""}
    </span>
  );
}
