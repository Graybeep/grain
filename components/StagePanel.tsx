import type { BrandSpec, Direction, Stage } from "../lib/client/types";
import { BattleView } from "./BattleView";
import { GuardianReport } from "./GuardianReport";
import { IdeaBriefPanel } from "./IdeaBriefPanel";
import { InterviewForm } from "./InterviewForm";
import { LaunchPanel } from "./LaunchPanel";
import { StageTimer } from "./StageTimer";
import { VerbalPanel } from "./VerbalPanel";
import { VisualPanel } from "./VisualPanel";

interface Props { spec: BrandSpec; stage: Stage; busy: boolean; stageStartedAt: number | null; error: string | null; onRun: (stage: Stage) => void; onAnswers: (answers: Record<string, string>) => Promise<void>; onChoose: (direction: Direction, edits?: Partial<Direction>) => void }
export function StagePanel({ spec, stage, busy, stageStartedAt, error, onRun, onAnswers, onChoose }: Props) {
  const status = spec.stageStatus[stage];
  if (error) return <StateCard title="The argument hit a wall" body={error} action="Retry stage" onAction={() => onRun(stage)} />;
  if (busy || status === "running") return <div className="state-card loading-state"><span className="thinking-mark">G</span><h2>Pressure-testing {stage}…</h2><p>The studio is generating, challenging, and validating the output.</p><StageTimer startedAt={stageStartedAt} /><div className="thinking-line"><i /></div></div>;
  if (stage === "intake" && spec.idea && status === "done") return <IdeaBriefPanel idea={spec.idea} />;
  if (stage === "interview" && spec.interview) return <InterviewForm interview={spec.interview} onSubmit={onAnswers} />;
  if ((stage === "diverge" || stage === "battle") && spec.directions) return <BattleView spec={spec} onChoose={onChoose} />;
  if (stage === "shape" && spec.verbal) return <VerbalPanel spec={spec} />;
  if (stage === "visualize" && spec.visual) return <VisualPanel spec={spec} />;
  if (stage === "guardian" && spec.guardian) return <GuardianReport report={spec.guardian} />;
  if (stage === "launch" && spec.launch) return <LaunchPanel spec={spec} sharePath={`/share/${spec.id}`} />;
  const copy: Record<Stage, [string, string]> = {
    intake: ["Turn the hunch into a brief.", "We’ll expose assumptions, constraints, and the real problem hiding inside the pitch."],
    interview: ["Ask only what changes the answer.", "Up to three adaptive questions will sharpen the strategic fork."],
    diverge: ["Force three different futures.", "Each direction uses a distinct axis—no cosmetic variations."],
    battle: ["Invite the critics in.", "Target user, skeptic, and cliché hunter attack every direction."],
    shape: ["Build a verbal identity.", "Names and language are measured against a real corpus."],
    visualize: ["Turn traits into tokens.", "Palette, typography, imagery, and shape language become one system."],
    guardian: ["Try to break the system.", "Guardian checks coherence and revises serious violations once."],
    launch: ["Package what survived.", "Create a launch-ready hero, pitch, and social copy."],
  };
  return <StateCard title={copy[stage][0]} body={copy[stage][1]} action={`Run ${stage}`} onAction={() => onRun(stage)} />;
}

function StateCard({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="state-card"><span className="eyebrow">Next decision</span><h1>{title}</h1><p>{body}</p><button className="primary-button" onClick={onAction}>{action}<span>→</span></button></div>;
}
