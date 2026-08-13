"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaItem } from "@/lib/catalog";

export function ProductGallery({
  media,
  productName,
}: {
  media: MediaItem[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const current = media[active];

  if (media.length === 0) {
    return <div className="aspect-square rounded-lg bg-bg-alt" />;
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border border-border-egbm bg-bg-alt">
        {current.type === "IMAGE" ? (
          <div className="relative h-full w-full">
            <Image src={current.url} alt={productName} fill className="object-cover" />
          </div>
        ) : (
          <video src={current.url} controls className="h-full w-full object-cover" />
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {media.map((m, i) => (
            <button
              key={m.url}
              onClick={() => setActive(i)}
              className="relative h-16 w-16 overflow-hidden rounded-md border-2"
              style={{ borderColor: i === active ? "#E8681E" : "#CDC4AE" }}
            >
              {m.type === "IMAGE" ? (
                <Image src={m.url} alt="" fill className="object-cover" />
              ) : (
                <video src={m.url} className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
