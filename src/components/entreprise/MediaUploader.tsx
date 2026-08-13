"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Film, Loader2, Plus, X } from "lucide-react";

export interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
}

interface PendingItem {
  key: string;
  uploading: boolean;
  error?: string;
  item?: MediaItem;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export function MediaUploader({ initialMedia = [] }: { initialMedia?: MediaItem[] }) {
  const [pending, setPending] = useState<PendingItem[]>(
    initialMedia.map((item, i) => ({ key: `initial-${i}`, uploading: false, item }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const resolvedMedia = pending
    .filter((p): p is PendingItem & { item: MediaItem } => !!p.item)
    .map((p) => p.item);
  const isUploading = pending.some((p) => p.uploading);

  const handleFiles = async (files: FileList) => {
    const newEntries = Array.from(files).map((file) => ({
      key: `${Date.now()}-${Math.random()}`,
      file,
    }));

    setPending((prev) => [
      ...prev,
      ...newEntries.map((e) => ({ key: e.key, uploading: true })),
    ]);

    await Promise.all(
      newEntries.map(async ({ key, file }) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setPending((prev) =>
            prev.map((p) => (p.key === key ? { ...p, uploading: false, error: "Format non supporté" } : p))
          );
          return;
        }
        try {
          const blob = await upload(`products/${crypto.randomUUID()}-${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/blob-upload",
          });
          const type: MediaItem["type"] = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
          setPending((prev) =>
            prev.map((p) => (p.key === key ? { key, uploading: false, item: { url: blob.url, type } } : p))
          );
        } catch {
          setPending((prev) =>
            prev.map((p) => (p.key === key ? { ...p, uploading: false, error: "Échec de l'envoi" } : p))
          );
        }
      })
    );
  };

  const removeItem = (key: string) => {
    setPending((prev) => prev.filter((p) => p.key !== key));
  };

  return (
    <div className="md:col-span-5">
      <input type="hidden" name="media" value={JSON.stringify(resolvedMedia)} />
      <div className="mb-1 text-sm text-ink-soft">Photos / vidéos</div>
      <div className="flex flex-wrap gap-2">
        {pending.map((p) => (
          <div
            key={p.key}
            className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border-egbm bg-bg-alt"
          >
            {p.uploading ? (
              <Loader2 size={20} className="animate-spin text-ink-soft" />
            ) : p.error ? (
              <span className="px-1 text-center text-[10px] text-rust-dark">{p.error}</span>
            ) : p.item?.type === "IMAGE" ? (
              <Image src={p.item.url} alt="" fill className="object-cover" />
            ) : (
              <Film size={22} className="text-ink-soft" />
            )}
            {!p.uploading && (
              <button
                type="button"
                onClick={() => removeItem(p.key)}
                aria-label="Retirer"
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink/70 text-white"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}

        <label
          htmlFor={inputId}
          className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border-egbm text-ink-soft hover:border-rust hover:text-rust"
        >
          <Plus size={20} />
          <span className="text-[10px]">Ajouter</span>
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </div>
      {isUploading && <p className="mt-1 text-xs text-ink-soft">Envoi en cours…</p>}
    </div>
  );
}
