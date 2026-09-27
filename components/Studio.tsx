"use client";

import { useState } from "react";
import { useBrandRun } from "../hooks/useBrandRun";
import type { Direction } from "../lib/client/types";
import { DecisionTrail } from "./DecisionTrail";
import { StagePanel } from "./StagePanel";
import { StageRail } from "./StageRail";

export function Studio({ id, replayGolden }: { id: string; replayGolden: boolean }) {
  const run = useBrandRun(id, replayGolden);
  const [trailOpen, setTrailOpen] = useState(false);
  if (!run.spec) return <main className="boot-screen"><span className="brand-mark">G</span><p>{run.error ?? "Loading the argument…"}</p>{run.error && <button className="secondary-button" onClick={() => void run.refresh()}>Try again</button>}</main>;
  const choose = (direction: Direction) => void run.selectDirection({ directionId: direction.id });
  return <main className="studio-shell">
    <StageRail statuses={run.spec.stageStatus} active={run.activeStage} completed={run.completed} onSelect={run.setActiveStage} />
    <div className="studio-main"><header className="studio-topbar"><div><span className="run-dot" /> Run / {run.spec.id.slice(0, 8)}</div>{replayGolden && <span className="replay-pill">Golden replay</span>}<button className="trail-toggle" onClick={() => setTrailOpen(true)}>Decision trail <span>{run.spec.trail.length}</span></button></header>
      <StagePanel spec={run.spec} stage={run.activeStage} busy={run.busyStage === run.activeStage} error={run.error} onRun={(stage) => void run.execute(stage)} onAnswers={run.answerInterview} onChoose={choose} />
    </div>
    <DecisionTrail entries={run.spec.trail} open={trailOpen} onClose={() => setTrailOpen(false)} />
    {trailOpen && <button className="trail-backdrop" aria-label="Close decision trail" onClick={() => setTrailOpen(false)} />}
  </main>;
}

