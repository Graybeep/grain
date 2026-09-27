import type { TrailEntry } from "../lib/client/types";

export function DecisionTrail({ entries, open, focusedField, onClose }: { entries: TrailEntry[]; open: boolean; focusedField: string | null; onClose: () => void }) {
  return <aside className={`decision-trail ${open ? "open" : ""}`} aria-label="Decision trail">
    <header><div><span className="eyebrow">Provenance</span><h2>Decision trail</h2></div><button onClick={onClose} aria-label="Close decision trail">×</button></header>
    <p>{focusedField ? <>Showing evidence for <b>{focusedField}</b>.</> : "Nothing here appeared by magic. Follow each decision back to its evidence."}</p>
    <div className="trail-list">{entries.length ? entries.map((entry, index) => { const matches = !focusedField || entry.field === focusedField || entry.field.startsWith(`${focusedField}.`) || focusedField.startsWith(`${entry.field}.`); return <article className={focusedField ? (matches ? "focused" : "muted") : ""} key={`${entry.field}-${index}`}><span className="trail-stage">{entry.stage}</span><h3>{entry.field}</h3><p>{entry.reason}</p><small>Based on {entry.basedOn.join(", ")}</small></article>; }) : <div className="empty-card">The trail will fill as stages complete.</div>}</div>
  </aside>;
}
