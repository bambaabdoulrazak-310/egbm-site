import { CheckCircle2 } from "lucide-react";

export function Stamp({ label = "EGBM · KORHOGO" }: { label?: string }) {
  return (
    <div className="inline-flex -rotate-3 items-center gap-1.5 rounded-full border-2 border-rust px-3 py-1 font-mono text-[11px] font-semibold text-rust">
      <CheckCircle2 size={13} /> {label}
    </div>
  );
}
