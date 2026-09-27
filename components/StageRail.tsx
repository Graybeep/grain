import { STAGES, type Stage, type StageStatus } from "../lib/client/types";

interface StageRailProps { statuses: Record<Stage, StageStatus>; active: Stage; completed: number; onSelect: (stage: Stage) => void }
const LABELS: Record<Stage, string> = { intake: "Interrogate", interview: "Question", diverge: "Diverge", battle: "Battle", shape: "Name & voice", visualize: "Visualize", guardian: "Guardian", launch: "Launch" };

export function StageRail({ statuses, active, completed, onSelect }: StageRailProps) {
  return <aside className="stage-rail">
    <div className="rail-brand"><span className="brand-mark">G</span><div><b>Grain</b><small>adversarial studio</small></div></div>
    <div className="rail-progress"><span>{completed}/8 decisions made</span><div><i style={{ width: `${completed * 12.5}%` }} /></div></div>
    <nav aria-label="Brand stages">{STAGES.map((stage, index) => <button key={stage} onClick={() => onSelect(stage)} className={`stage-step ${active === stage ? "active" : ""}`} aria-current={active === stage ? "step" : undefined}>
      <span className={`stage-node ${statuses[stage]}`}>{statuses[stage] === "done" ? "✓" : index + 1}</span>
      <span><b>{LABELS[stage]}</b><small>{statuses[stage]}</small></span>
    </button>)}</nav>
    <p className="rail-note">Every decision leaves a trail.</p>
  </aside>;
}

