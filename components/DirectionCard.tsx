"use client";

import { useEffect, useState } from "react";
import type { Critique, Direction } from "../lib/client/types";

const SCORE_LABELS: Record<keyof Critique["scores"], string> = { audienceFit: "Fit", distinctiveness: "Distinct", credibility: "Credible", clarity: "Clear" };
interface DirectionCardProps { direction: Direction; critiques: Critique[]; selected: boolean; savedEdits?: Partial<Direction>; selecting: boolean; onChoose: () => void; onSave: (edits: Partial<Direction>) => void }
export function DirectionCard({ direction, critiques, selected, savedEdits, selecting, onChoose, onSave }: DirectionCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    label: savedEdits?.label ?? direction.label,
    positioning: savedEdits?.positioning ?? direction.positioning,
    differentiator: savedEdits?.differentiator ?? direction.differentiator,
    valueProp: savedEdits?.valueProp ?? direction.valueProp,
  });
  useEffect(() => {
    setDraft({ label: savedEdits?.label ?? direction.label, positioning: savedEdits?.positioning ?? direction.positioning, differentiator: savedEdits?.differentiator ?? direction.differentiator, valueProp: savedEdits?.valueProp ?? direction.valueProp });
  }, [direction, savedEdits]);
  const scores = critiques.length ? Object.keys(SCORE_LABELS).map((key) => {
    const scoreKey = key as keyof Critique["scores"];
    return { label: SCORE_LABELS[scoreKey], value: critiques.reduce((sum, critique) => sum + critique.scores[scoreKey], 0) / critiques.length };
  }) : [];
  return <article className={`direction-card ${selected ? "selected" : ""}`}>
    <header><span className="direction-letter">{direction.id}</span><span className="axis">{direction.axis.replace("-", " ")}</span></header>
    {editing ? <div className="direction-editor"><label>Direction label<input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} /></label><label>Positioning<textarea rows={4} value={draft.positioning} onChange={(event) => setDraft({ ...draft, positioning: event.target.value })} /></label></div> : <><h2 data-trace-field="directions">{draft.label}</h2><p className="positioning" data-trace-field="directions">{draft.positioning}</p></>}
    <div className="trait-list">{direction.traits.map((trait) => <span key={trait.name}>{trait.name}</span>)}</div>
    {editing ? <div className="direction-editor"><label>The wedge<textarea rows={3} value={draft.differentiator} onChange={(event) => setDraft({ ...draft, differentiator: event.target.value })} /></label><label>The promise<textarea rows={3} value={draft.valueProp} onChange={(event) => setDraft({ ...draft, valueProp: event.target.value })} /></label></div> : <dl data-trace-field="directions"><div><dt>The wedge</dt><dd>{draft.differentiator}</dd></div><div><dt>The promise</dt><dd>{draft.valueProp}</dd></div></dl>}
    {scores.length > 0 && <div className="score-grid">{scores.map((score) => <div key={score.label}><span>{score.label}<b>{score.value.toFixed(1)}</b></span><i><em style={{ width: `${score.value * 20}%` }} /></i></div>)}</div>}
    <div className="critics">{critiques.map((critique) => <details key={critique.perspective}><summary>{critique.perspective.replace("-", " ")} <span>+</span></summary><p>{critique.strongestPoint}</p><ul>{critique.objections.map((objection) => <li key={objection}>{objection}</li>)}</ul></details>)}</div>
    {selected ? <div className="direction-actions">{editing ? <><button className="choose-button" disabled={selecting} onClick={() => setEditing(false)}>Cancel</button><button className="chosen-button" disabled={selecting} onClick={() => { onSave(draft); setEditing(false); }}>{selecting ? "Saving…" : "Save edits"}</button></> : <><button className="chosen-button" disabled>Chosen ✓</button><button className="choose-button" onClick={() => setEditing(true)}>Edit direction</button></>}</div> : <button className="choose-button" disabled={selecting} onClick={onChoose}>{selecting ? "Choosing…" : "Choose this direction"}</button>}
  </article>;
}
