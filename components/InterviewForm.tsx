"use client";

import { useState } from "react";
import type { Interview } from "../lib/client/types";

export function InterviewForm({ interview, onSubmit }: { interview: Interview; onSubmit: (answers: Record<string, string>) => Promise<void> }) {
  const [answers, setAnswers] = useState(interview.answers);
  const [busy, setBusy] = useState(false);
  return <section className="panel stage-content"><header className="panel-heading"><span className="eyebrow">01 · sharpen the brief</span><h1>The questions that change the answer.</h1><p>We only ask what creates a meaningful fork in the road.</p></header>
    <div className="question-list">{interview.questions.map((item, index) => <label key={item.id} className="question-card"><span>0{index + 1}</span><strong>{item.question}</strong><small>{item.whyItMatters}</small><textarea rows={3} value={answers[item.id] ?? ""} onChange={(event) => setAnswers({ ...answers, [item.id]: event.target.value })} /></label>)}</div>
    <button className="primary-button" disabled={busy} onClick={() => { setBusy(true); void onSubmit(answers).finally(() => setBusy(false)); }}>{busy ? "Saving…" : "Commit answers"}<span>→</span></button>
  </section>;
}

