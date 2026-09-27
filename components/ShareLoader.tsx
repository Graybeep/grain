"use client";

import { useEffect, useState } from "react";
import { getRun } from "../lib/client/api";
import type { BrandSpec } from "../lib/client/types";
import { ShareKit } from "./ShareKit";

export function ShareLoader({ id }: { id: string }) {
  const [spec, setSpec] = useState<BrandSpec | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void getRun(id).then(setSpec).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load this kit.")); }, [id]);
  if (!spec) return <main className="boot-screen"><span className="brand-mark">G</span><p>{error || "Opening the brand kit…"}</p></main>;
  return <ShareKit spec={spec} />;
}

