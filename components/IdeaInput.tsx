"use client";

import { useState } from "react";
import { ServerUnavailable } from "./ServerUnavailable";

interface IdeaInputProps { examples: string[]; onStart: (idea: string) => Promise<void> }

export function IdeaInput({ examples, onStart }: IdeaInputProps) {
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [serverUnavailable, setServerUnavailable] = useState(false);

  async function submit() {
    if (idea.trim().length < 12) { setServerUnavailable(false); setError("Give us at least one concrete sentence to argue with."); return; }
    setBusy(true); setError(""); setServerUnavailable(false);
    try { await onStart(idea.trim()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start the studio."); setServerUnavailable(true); setBusy(false); }
  }

  return <div className="idea-composer">
    <label htmlFor="idea">Your rough idea</label>
    <textarea id="idea" value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="A tool that helps…" rows={5} />
    <div className="idea-chips" aria-label="Example ideas">
      {examples.map((example) => <button className="chip" type="button" key={example} onClick={() => setIdea(example)}>{example}</button>)}
    </div>
    {error && !serverUnavailable && <p className="inline-error" role="alert">{error}</p>}
    {serverUnavailable && <ServerUnavailable compact onRetry={() => void submit()} />}
    <button className="primary-button" type="button" disabled={busy} onClick={() => void submit()}>{busy ? "Opening the studio…" : "Start the argument"}<span>→</span></button>
  </div>;
}
