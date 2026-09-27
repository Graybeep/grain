import type { IdeaBrief } from "../lib/client/types";

export function IdeaBriefPanel({ idea }: { idea: IdeaBrief }) {
  return <section className="stage-content idea-brief-panel">
    <header className="panel-heading"><span className="eyebrow">01 · interrogate the idea</span><h1>The hunch, made explicit.</h1><p>The studio separated the actual problem from assumptions that still need proving.</p></header>
    <div className="brief-grid">
      <article className="panel brief-problem" data-trace-field="idea"><span className="eyebrow">Problem</span><h2>{idea.problem}</h2></article>
      <article className="panel" data-trace-field="idea.targetUser"><span className="eyebrow">First customer</span><p className="brief-lead">{idea.targetUser}</p></article>
      <article className="panel" data-trace-field="idea.context"><span className="eyebrow">Context</span><p>{idea.context}</p></article>
      <BriefList title="Constraints" values={idea.constraints} field="idea.constraints" />
      <BriefList title="Assumptions to attack" values={idea.assumptions} field="idea.assumptions" numbered />
      <BriefList title="Open questions" values={idea.openQuestions} field="idea.openQuestions" numbered />
    </div>
  </section>;
}

function BriefList({ title, values, field, numbered = false }: { title: string; values: string[]; field: string; numbered?: boolean }) {
  return <article className="panel brief-list" data-trace-field={field}><span className="eyebrow">{title}</span>{values.length ? <ol className={numbered ? "numbered" : "plain"}>{values.map((value, index) => <li key={value}><span>{numbered ? String(index + 1).padStart(2, "0") : "—"}</span>{value}</li>)}</ol> : <p className="muted-copy">Nothing recorded yet.</p>}</article>;
}

