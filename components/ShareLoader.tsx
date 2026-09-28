"use client";

import { useCallback, useEffect, useState } from "react";
import { getRun } from "../lib/client/api";
import type { BrandSpec } from "../lib/client/types";
import { ShareKit } from "./ShareKit";
import { ServerUnavailable } from "./ServerUnavailable";

export function ShareLoader({ id }: { id: string }) {
  const [spec, setSpec] = useState<BrandSpec | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try { setSpec(await getRun(id)); }
    catch (cause: unknown) { setError(cause instanceof Error ? cause.message : "Unable to load this kit."); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (!spec) return error
    ? <main><ServerUnavailable onRetry={() => void load()} /></main>
    : <main className="boot-screen"><span className="brand-mark">G</span><p>Opening the brand kit…</p></main>;
  return <ShareKit spec={spec} />;
}
