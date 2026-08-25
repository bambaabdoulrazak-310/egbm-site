"use client";

import { useRef } from "react";
import { Bell } from "lucide-react";
import { toggleNotifyByEmailAction } from "@/lib/actions/account";

export function NotifyToggle({ initialValue }: { initialValue: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={toggleNotifyByEmailAction}
      className="mt-4 flex max-w-sm items-center justify-between gap-3 rounded-lg border border-border-egbm bg-cream p-4"
    >
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-ink-soft" />
        <div>
          <div className="text-sm font-semibold">Notifications par email</div>
          <p className="text-xs text-ink-soft">
            Recevoir un email pour chaque nouvelle commande, demande de devis ou message de contact.
          </p>
        </div>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          name="notifyByEmail"
          defaultChecked={initialValue}
          onChange={() => formRef.current?.requestSubmit()}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-border-egbm transition-colors peer-checked:bg-green" />
        <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </label>
    </form>
  );
}
