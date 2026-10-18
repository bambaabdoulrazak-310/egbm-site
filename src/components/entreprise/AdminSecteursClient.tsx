"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteSectorAction,
  moveSectorAction,
  saveSectorAction,
  toggleSectorActiveAction,
  type SectorFormState,
} from "@/lib/actions/sectors";
import { SECTOR_ICONS, SECTOR_ICON_KEYS } from "@/lib/sector-icons";
import { SectorIcon } from "@/components/site/SectorIcon";

export interface AdminSector {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  icon: string;
  link: string | null;
  active: boolean;
  productCount: number;
}

const initialState: SectorFormState = {};

function SectorRow({
  sector,
  index,
  total,
  onEdit,
}: {
  sector: AdminSector;
  index: number;
  total: number;
  onEdit: () => void;
}) {
  const [deleteState, deleteAction, deleting] = useActionState(deleteSectorAction, initialState);

  return (
    <div className="rounded-lg border border-border-egbm bg-white shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col">
          <form action={moveSectorAction}>
            <input type="hidden" name="id" value={sector.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={index === 0}
              aria-label="Monter"
              className="rounded p-0.5 text-ink-soft hover:text-ink disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
          </form>
          <form action={moveSectorAction}>
            <input type="hidden" name="id" value={sector.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={index === total - 1}
              aria-label="Descendre"
              className="rounded p-0.5 text-ink-soft hover:text-ink disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
          </form>
        </div>

        <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface">
          {sector.photoUrl ? (
            <Image src={sector.photoUrl} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <SectorIcon name={sector.icon} size={26} className="text-rust" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{sector.name}</span>
            {!sector.active && (
              <span className="rounded bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                Masqué
              </span>
            )}
          </div>
          <div className="text-xs text-ink-soft">
            {sector.productCount} produit{sector.productCount > 1 ? "s" : ""} · /produits?categorie=
            {sector.slug}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <form action={toggleSectorActiveAction}>
            <input type="hidden" name="id" value={sector.id} />
            <button
              type="submit"
              aria-label={sector.active ? "Masquer du site" : "Afficher sur le site"}
              title={sector.active ? "Masquer du site" : "Afficher sur le site"}
              className="rounded p-1.5 text-ink-soft hover:text-ink"
            >
              {sector.active ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </form>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Modifier"
            className="rounded p-1.5 text-ink-soft hover:text-ink"
          >
            <Pencil size={17} />
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={sector.id} />
            <button
              type="submit"
              disabled={deleting}
              aria-label="Supprimer"
              className="rounded p-1.5 disabled:opacity-50"
            >
              <Trash2 size={17} className="text-rust" />
            </button>
          </form>
        </div>
      </div>
      {deleteState.error && (
        <p className="mt-2 text-sm font-medium text-rust-dark" role="alert">
          {deleteState.error}
        </p>
      )}
    </div>
  );
}

export function AdminSecteursClient({ sectors }: { sectors: AdminSector[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminSector | null>(null);
  const [state, formAction, pending] = useActionState(saveSectorAction, initialState);

  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowForm(false);
      setEditing(null);
    }
  }, [state.success]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">Secteurs d&apos;activité</h1>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
            } else {
              setEditing(null);
              setShowForm(true);
            }
          }}
          className="flex items-center gap-1.5 rounded-md bg-rust hover:bg-rust-dark px-4 py-2 font-semibold text-white"
        >
          <Plus size={16} /> Nouveau secteur
        </button>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Ces secteurs s&apos;affichent sur l&apos;accueil, dans le pied de page et comme filtres de
        la page Produits. Un secteur avec photo apparaît en grande carte, sans photo en carte
        compacte.
      </p>

      {showForm && (
        <form
          key={editing?.id ?? "new"}
          action={formAction}
          className="mt-4 grid gap-3 rounded-lg border border-border-egbm bg-white shadow-sm p-4 md:grid-cols-3"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <input
            name="name"
            defaultValue={editing?.name}
            placeholder="Nom du secteur"
            required
            className="rounded-md border border-border-egbm p-2 md:col-span-2"
          />
          <select
            name="icon"
            defaultValue={editing?.icon ?? "Package"}
            aria-label="Icône"
            className="rounded-md border border-border-egbm p-2"
          >
            {SECTOR_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                Icône : {SECTOR_ICONS[key].label}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            defaultValue={editing?.description ?? ""}
            placeholder="Description courte (affichée sur l'accueil)"
            rows={2}
            className="rounded-md border border-border-egbm p-2 md:col-span-3"
          />
          <label className="flex flex-col gap-1 text-sm text-ink-soft md:col-span-3">
            Lien personnalisé (facultatif)
            <input
              name="link"
              defaultValue={editing?.link ?? ""}
              placeholder="Ex. /catalogues : la carte ouvre cette page au lieu des produits"
              className="rounded-md border border-border-egbm p-2 text-ink"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 md:col-span-3">
            {editing?.photoUrl && (
              <Image
                src={editing.photoUrl}
                alt=""
                width={56}
                height={40}
                className="h-10 w-14 rounded-md object-cover"
              />
            )}
            <label className="flex items-center gap-1.5 text-sm text-ink-soft">
              Photo (jpg/png/webp) :
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                className="text-sm"
              />
            </label>
            {editing?.photoUrl && (
              <label className="flex items-center gap-1.5 text-sm text-ink-soft">
                <input type="checkbox" name="removePhoto" /> Retirer la photo
              </label>
            )}
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="active" defaultChecked={editing?.active ?? true} />{" "}
              Visible sur le site
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:col-span-3">
            {state.error && <span className="text-sm font-medium text-rust-dark">{state.error}</span>}
            <button
              type="submit"
              disabled={pending}
              className="ml-auto rounded-md bg-rust px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {sectors.length === 0 && (
          <p className="text-sm text-ink-soft">Aucun secteur pour le moment.</p>
        )}
        {sectors.map((s, i) => (
          <SectorRow
            key={s.id}
            sector={s}
            index={i}
            total={sectors.length}
            onEdit={() => {
              setEditing(s);
              setShowForm(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
