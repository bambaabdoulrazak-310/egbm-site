"use client";

import { useState } from "react";

// Champ piège invisible pour un humain (les robots le remplissent souvent) +
// horodatage du rendu du formulaire (un envoi trop rapide trahit un robot).
export function AntiSpamFields() {
  const [ts] = useState(() => Date.now());

  return (
    <>
      <input type="hidden" name="ts" value={ts} />
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: 0, height: 0, overflow: "hidden" }}
      >
        <label>
          Site web
          <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  );
}
