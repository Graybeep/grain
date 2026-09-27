import type { GuardianReport as GuardianReportType } from "../lib/client/types";

export function GuardianReport({ report }: { report?: GuardianReportType }) {
  if (!report) return <div className="empty-card">Guardian runs after verbal and visual identity are complete.</div>;
  return <section className="stage-content guardian-panel"><header className="panel-heading"><span className="eyebrow">07 · consistency guardian</span><h1>{report.passed ? "The system holds." : "The system found friction."}</h1><p>Deterministic rules and cross-field reasoning checked every brand decision.</p></header>
    <div className={`guardian-verdict ${report.passed ? "pass" : "fail"}`}><span>{report.passed ? "✓" : "!"}</span><div><b>{report.passed ? "Passed all checks" : `${report.violations.length} issue${report.violations.length === 1 ? "" : "s"} remain`}</b><small>Contrast · language · strategic coherence</small></div></div>
    <div className="guardian-grid"><div><h2>Violations</h2>{report.violations.length ? report.violations.map((violation) => <article className="violation" key={violation.id}><span className={`severity ${violation.severity}`}>{violation.severity}</span><h3>{violation.rule}</h3><p>{violation.explanation}</p><small>{violation.fields.join(" · ")}</small><strong>Fix: {violation.fix}</strong></article>) : <div className="empty-card">No violations detected.</div>}</div>
      <div><h2>Applied revisions</h2>{report.revisions.length ? report.revisions.map((revision) => <article className="revision" key={`${revision.field}-${revision.before}`}><span>{revision.field}</span><del>{revision.before}</del><ins>{revision.after}</ins><p>{revision.reason}</p></article>) : <div className="empty-card">No automated revisions were needed.</div>}</div></div>
  </section>;
}

