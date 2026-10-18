"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  ExternalLink,
  FileText,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

const BASE_ITEMS: Array<[href: string, label: string, Icon: typeof LayoutDashboard]> = [
  ["/espace-entreprise", "Tableau de bord", LayoutDashboard],
  ["/espace-entreprise/produits", "Produits", Package],
  ["/espace-entreprise/publications", "Publications", Newspaper],
  ["/espace-entreprise/realisations", "Réalisations", Trophy],
  ["/espace-entreprise/commandes", "Commandes", ClipboardList],
  ["/espace-entreprise/demandes", "Demandes", Inbox],
  ["/espace-entreprise/avis", "Avis", Star],
  ["/espace-entreprise/facturation", "Facturation", FileText],
  ["/espace-entreprise/mon-compte", "Mon compte", KeyRound],
];

const NEW_ORDERS_POLL_MS = 20_000;

interface Props {
  userName: string;
  role: "ADMINISTRATEUR" | "GESTIONNAIRE";
}

export function EntrepriseNav({ userName, role }: Props) {
  const pathname = usePathname();
  const [newOrders, setNewOrders] = useState(0);
  const items = [
    ...BASE_ITEMS,
    // Réservé à l'administrateur principal : gestion des secteurs et des comptes.
    ...(role === "ADMINISTRATEUR"
      ? ([
          ["/espace-entreprise/secteurs", "Secteurs", Layers],
          ["/espace-entreprise/utilisateurs", "Utilisateurs", Users],
        ] as const)
      : []),
  ];

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch("/api/orders/new-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setNewOrders(data.count);
      } catch {
        // silencieux : la pastille n'est pas critique
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, NEW_ORDERS_POLL_MS);
    window.addEventListener("focus", fetchCount);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", fetchCount);
    };
  }, [pathname]);

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col bg-night p-4 text-white/80 md:flex print:hidden">
        <div className="mb-2 flex items-center gap-2 font-display text-2xl font-extrabold text-white">
          <Image src="/logo.jpg" alt="Logo EGBM" width={32} height={32} className="rounded-full object-cover" />
          EGBM
        </div>
        <Link
          href="/"
          target="_blank"
          className="mb-4 flex items-center gap-1.5 text-xs text-white/80 hover:text-white"
        >
          <ExternalLink size={13} /> Voir le site client
        </Link>
        <div className="mb-4 rounded-md bg-white/10 p-2 text-xs">
          <div className="font-semibold text-white">{userName}</div>
          <div className="mt-0.5 flex items-center gap-1">
            <ShieldCheck size={12} /> {role === "ADMINISTRATEUR" ? "Administrateur" : "Gestionnaire"}
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              style={{
                background: pathname === href ? "#E8681E" : "transparent",
                color: pathname === href ? "white" : undefined,
              }}
            >
              <Icon size={16} /> {label}
              {href === "/espace-entreprise/commandes" && newOrders > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {newOrders}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
            <LogOut size={16} /> Déconnexion
          </button>
        </form>
      </aside>

      <div className="flex items-center gap-1 overflow-x-auto bg-night p-2 md:hidden print:hidden">
        <Link
          href="/"
          target="_blank"
          className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs text-white/80"
        >
          <ExternalLink size={14} /> Site
        </Link>
        {items.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className="relative flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs text-white"
            style={{ background: pathname === href ? "#E8681E" : "transparent" }}
          >
            <Icon size={14} /> {label}
            {href === "/espace-entreprise/commandes" && newOrders > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {newOrders}
              </span>
            )}
          </Link>
        ))}
        <form action={logoutAction}>
          <button className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs text-white/80">
            <LogOut size={14} /> Quitter
          </button>
        </form>
      </div>
    </>
  );
}
