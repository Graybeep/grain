import type { Critique, Direction } from "../lib/client/types";

const SCORE_LABELS: Record<keyof Critique["scores"], string> = { audienceFit: "Fit", distinctiveness: "Distinct", credibility: "Credible", clarity: "Clear" };
export function DirectionCard({ direction, critiques, selected, onChoose }: { direction: Direction; critiques: Critique[]; selected: boolean; onChoose: () => void }) {
  const scores = critiques.length ? Object.keys(SCORE_LABELS).map((key) => {
    const scoreKey = key as keyof Critique["scores"];
    return { label: SCORE_LABELS[scoreKey], value: critiques.reduce((sum, critique) => sum + critique.scores[scoreKey], 0) / critiques.length };
  }) : [];
  return <article className={`direction-card ${selected ? "selected" : ""}`}>
    <header><span className="direction-letter">{direction.id}</span><span className="axis">{direction.axis.replace("-", " ")}</span></header>
    <h2>{direction.label}</h2><p className="positioning">{direction.positioning}</p>
    <div className="trait-list">{direction.traits.map((trait) => <span key={trait.name}>{trait.name}</span>)}</div>
    <dl><div><dt>The wedge</dt><dd>{direction.differentiator}</dd></div><div><dt>The promise</dt><dd>{direction.valueProp}</dd></div></dl>
    {scores.length > 0 && <div className="score-grid">{scores.map((score) => <div key={score.label}><span>{score.label}<b>{score.value.toFixed(1)}</b></span><i><em style={{ width: `${score.value * 20}%` }} /></i></div>)}</div>}
    <div className="critics">{critiques.map((critique) => <details key={critique.perspective}><summary>{critique.perspective.replace("-", " ")} <span>+</span></summary><p>{critique.strongestPoint}</p><ul>{critique.objections.map((objection) => <li key={objection}>{objection}</li>)}</ul></details>)}</div>
    <button className={selected ? "chosen-button" : "choose-button"} onClick={onChoose}>{selected ? "Chosen direction ✓" : "Choose this direction"}</button>
  </article>;
}

