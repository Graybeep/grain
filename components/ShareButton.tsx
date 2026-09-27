"use client";

import { useState } from "react";

export function ShareButton({ path }: { path: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
    }
  }

  return <button className="primary-button" type="button" onClick={() => void copyLink()} aria-live="polite">
    {state === "copied" ? "Link copied" : state === "error" ? "Copy failed" : "Copy share link"}<span>{state === "copied" ? "✓" : "↗"}</span>
  </button>;
}

