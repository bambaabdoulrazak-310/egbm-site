"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Eye, EyeOff, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/catalog";
import {
  deleteCatalogueAction,
  saveCatalogueAction,
  toggleCatalogueActiveAction,
  type CatalogueFormState,
} from "@/lib/actions/catalogues";

export interface AdminCatalogue {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  coverUrl: string | null;
  active: boolean;
  createdAt: string;
}

const initialState: CatalogueFormState = {};
const MAX_PDF_BYTES = 100 * 1024 * 1024;
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

function CatalogueForm({
  editing,
  onDone,
}: {
  editing: AdminCatalogue | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveCatalogueAction, initialState);
  const [file, setFile] = useState({
    url: editing?.fileUrl ?? "",
    name: editing?.fileName ?? "",
    size: editing?.fileSize ?? 0,
  });
  const [cover, setCover] = useState(editing?.coverUrl ?? "");
  // Champs contrôlés : une erreur du serveur ne doit pas effacer la saisie.
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [active, setActive] = useState(editing?.active ?? true);
  const [progress, setProgress] = useState<number | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  async function onPdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setUploadError("");
    if (picked.type !== "application/pdf") {
      setUploadError("Le fichier doit être un PDF.");
      return;
    }
    if (picked.size > MAX_PDF_BYTES) {
      setUploadError("Le fichier dépasse 100 Mo.");
      return;
    }
    setProgress(0);
    try {
      const blob = await upload(`catalogues/${crypto.randomUUID()}-${picked.name}`, picked, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      setFile({ url: blob.url, name: picked.name, size: picked.size });
    } catch {
      setUploadError("Échec de l'envoi du PDF. Réessayez.");
    } finally {
      setProgress(null);
    }
  }

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setUploadError("");
    if (!COVER_TYPES.includes(picked.type)) {
      setUploadError("La couverture doit être une image jpg, png ou webp.");
      return;
    }
    setCoverBusy(true);
    try {
      const blob = await upload(`catalogues/covers/${crypto.randomUUID()}-${picked.name}`, picked, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      setCover(blob.url);
    } catch {
      setUploadError("Échec de l'envoi de l'image. Réessayez.");
    } finally {
      setCoverBusy(false);
    }
  }

  const uploading = progress !== null || coverBusy;

  return (
    <form
      action={formAction}
      className="mt-4 grid gap-3 rounded-lg border border-border-egbm bg-white p-4 shadow-sm md:grid-cols-2"
    >
      <input type="hidden" name="id" value={editing?.id ?? ""} />
      <input type="hidden" name="fileUrl" value={file.url} />
      <input type="hidden" name="fileName" value={file.name} />
      <input type="hidden" name="fileSize" value={file.size} />
      <input type="hidden" name="coverUrl" value={cover} />

      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du catalogue"
        required
        className="rounded-md border border-border-egbm p-2 md:col-span-2"
      />
      <textarea
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (facultative)"
        rows={2}
        className="rounded-md border border-border-egbm p-2 md:col-span-2"
      />

      <div className="rounded-md border border-dashed border-border-egbm p-3">
        <div className="text-sm font-semibold">Fichier PDF *</div>
        {file.url ? (
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
            <FileText size={16} className="shrink-0 text-rust" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0">· {formatFileSize(file.size)}</span>
          </div>
        ) : (
          <p className="mt-1 text-xs text-ink-soft">Aucun fichier ajouté.</p>
        )}
        <label className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          {file.url ? "Remplacer :" : "Choisir :"}
          <input type="file" accept="application/pdf" onChange={onPdfChange} className="text-sm" />
        </label>
        {progress !== null && (
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Envoi en cours… {progress} %
          </div>
        )}
      </div>

      <div className="rounded-md border border-dashed border-border-egbm p-3">
        <div className="text-sm font-semibold">Image de couverture (facultative)</div>
        {cover && (
          <div className="mt-1 flex items-center gap-2">
            <Image src={cover} alt="" width={48} height={64} className="h-16 w-12 rounded object-cover" />
            <button
              type="button"
              onClick={() => setCover("")}
              className="text-xs font-semibold text-rust hover:underline"
            >
              Retirer
            </button>
          </div>
        )}
        <label className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          {cover ? "Remplacer :" : "Choisir :"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onCoverChange}
            className="text-sm"
          />
        </label>
        {coverBusy && (
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Envoi de l&apos;image…
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />{" "}
          Visible sur le site
        </label>
        {(uploadError || state.error) && (
          <span className="text-sm font-medium text-rust-dark" role="alert">
            {uploadError || state.error}
          </span>
        )}
        <button
          type="submit"
          disabled={pending || uploading || !file.url}
          className="ml-auto rounded-md bg-rust px-4 py-2 font-semibold text-white hover:bg-rust-dark disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export function AdminCataloguesClient({ catalogues }: { catalogues: AdminCatalogue[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCatalogue | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">Catalogues</h1>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
            } else {
              setEditing(null);
              setShowForm(true);
            }
          }}
          className="flex items-center gap-1.5 rounded-md bg-rust px-4 py-2 font-semibold text-white hover:bg-rust-dark"
        >
          <Plus size={16} /> Nouveau catalogue
        </button>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Ajoutez vos catalogues au format PDF : ils apparaissent sur la page publique « Catalogues »,
        où les visiteurs peuvent les consulter et les télécharger.
      </p>

      {showForm && (
        <CatalogueForm
          key={editing?.id ?? "new"}
          editing={editing}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="mt-5 flex flex-col gap-3">
        {catalogues.length === 0 && (
          <p className="text-sm text-ink-soft">Aucun catalogue pour le moment.</p>
        )}
        {catalogues.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border-egbm bg-white p-3 shadow-sm"
          >
            <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-surface">
              {c.coverUrl ? (
                <Image src={c.coverUrl} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <FileText size={22} className="text-rust" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{c.title}</span>
                {!c.active && (
                  <span className="rounded bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                    Masqué
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-ink-soft">
                {c.fileName} · {formatFileSize(c.fileSize)} · {c.createdAt.slice(0, 10)}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <form action={toggleCatalogueActiveAction}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  aria-label={c.active ? "Masquer du site" : "Afficher sur le site"}
                  title={c.active ? "Masquer du site" : "Afficher sur le site"}
                  className="rounded p-1.5 text-ink-soft hover:text-ink"
                >
                  {c.active ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setEditing(c);
                  setShowForm(true);
                }}
                aria-label="Modifier"
                className="rounded p-1.5 text-ink-soft hover:text-ink"
              >
                <Pencil size={17} />
              </button>
              <form action={deleteCatalogueAction}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" aria-label="Supprimer" className="rounded p-1.5">
                  <Trash2 size={17} className="text-rust" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
