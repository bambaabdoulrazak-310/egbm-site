"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  ExternalLink,
  FileText,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  ShieldCheck,
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
  ["/espace-entreprise/facturation", "Facturation", FileText],
  ["/espace-entreprise/mon-compte", "Mon compte", KeyRound],
];

interface Props {
  userName: string;
  role: "ADMINISTRATEUR" | "GESTIONNAIRE";
}

export function EntrepriseNav({ userName, role }: Props) {
  const pathname = usePathname();
  const items = [
    ...BASE_ITEMS,
    ...(role === "ADMINISTRATEUR"
      ? ([["/espace-entreprise/utilisateurs", "Utilisateurs", Users]] as const)
      : []),
  ];

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col bg-ink p-4 text-bg-alt md:flex print:hidden">
        <div className="mb-2 flex items-center gap-2 font-display text-2xl font-extrabold text-white">
          <Image src="/logo.jpg" alt="Logo EGBM" width={32} height={32} className="rounded-full object-cover" />
          EGBM
        </div>
        <Link
          href="/"
          target="_blank"
          className="mb-4 flex items-center gap-1.5 text-xs text-bg-alt hover:text-white"
        >
          <ExternalLink size={13} /> Voir le site client
        </Link>
        <div className="mb-4 rounded-md bg-black/20 p-2 text-xs">
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
                background: pathname === href ? "#128A4C" : "transparent",
                color: pathname === href ? "white" : undefined,
              }}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
            <LogOut size={16} /> Déconnexion
          </button>
        </form>
      </aside>

      <div className="flex items-center gap-1 overflow-x-auto bg-ink p-2 md:hidden print:hidden">
        <Link
          href="/"
          target="_blank"
          className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs text-bg-alt"
        >
          <ExternalLink size={14} /> Site
        </Link>
        {items.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs text-white"
            style={{ background: pathname === href ? "#128A4C" : "transparent" }}
          >
            <Icon size={14} /> {label}
          </Link>
        ))}
        <form action={logoutAction}>
          <button className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs text-bg-alt">
            <LogOut size={14} /> Quitter
          </button>
        </form>
      </div>
    </>
  );
}
