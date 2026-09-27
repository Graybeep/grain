"use client";

import { useState } from "react";
import { checkGuardian } from "../lib/client/api";
import type { BrandSpec, GuardianCheckResult } from "../lib/client/types";
import { GuardianReport } from "./GuardianReport";
import { LaunchPanel } from "./LaunchPanel";

export function ShareKit({ spec }: { spec: BrandSpec }) {
  const [tab, setTab] = useState<"kit" | "guardian">("kit");
  const [text, setText] = useState("");
  const [result, setResult] = useState<GuardianCheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function check() {
    setBusy(true); setError("");
    try { setResult(await checkGuardian(spec.id, text, "copy")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Guardian could not check this copy."); }
    finally { setBusy(false); }
  }
  return <main className="share-shell"><header className="share-nav"><a href="/" className="wordmark"><span className="brand-mark">G</span>Grain</a><div className="share-tabs"><button className={tab === "kit" ? "active" : ""} onClick={() => setTab("kit")}>Brand kit</button><button className={tab === "guardian" ? "active" : ""} onClick={() => setTab("guardian")}>Guardian check</button></div><span className="read-only">Read-only kit</span></header>
    {tab === "kit" ? <div className="share-content"><LaunchPanel spec={spec} /><GuardianReport report={spec.guardian} /></div> : <section className="guardian-check"><header className="panel-heading"><span className="eyebrow">Paste-check</span><h1>Does this still sound like us?</h1><p>Test draft copy against the strategy, voice, clichés, and length rules.</p></header><div className="guardian-workbench"><div><label htmlFor="check-copy">Draft copy</label><textarea id="check-copy" rows={12} value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste a headline, post, or paragraph…" /><button className="primary-button" onClick={() => void check()} disabled={busy || !text.trim()}>{busy ? "Checking…" : "Ask Guardian"}<span>→</span></button>{error && <p className="inline-error">{error}</p>}</div><div className="check-result">{result ? <><div className={`guardian-verdict ${result.passed ? "pass" : "fail"}`}><span>{result.passed ? "✓" : "!"}</span><div><b>{result.passed ? "On brand" : "Needs revision"}</b><small>{result.violations.length} violations</small></div></div>{result.violations.map((item) => <article className="violation" key={item.id}><span className={`severity ${item.severity}`}>{item.severity}</span><h3>{item.rule}</h3><p>{item.explanation}</p></article>)}{result.suggestedRewrite && <article className="rewrite"><span className="eyebrow">Suggested rewrite</span><p>{result.suggestedRewrite}</p></article>}</> : <div className="empty-card">Your verdict and suggested rewrite will appear here.</div>}</div></div></section>}
  </main>;
}

