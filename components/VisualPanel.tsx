import type { BrandSpec } from "../lib/client/types";
import { TokenPreview } from "./TokenPreview";

export function VisualPanel({ spec }: { spec: BrandSpec }) {
  const visual = spec.visual;
  if (!visual) return <div className="empty-card">Visual identity appears after the Visualize stage completes.</div>;

  return <section className="stage-content visual-panel">
    <header className="panel-heading"><span className="eyebrow">06 · visual identity</span><h1>Make the strategy visible.</h1><p>The mockups are evidence, not decoration: every token is constrained by the selected direction and voice.</p></header>
    <TokenPreview spec={spec} />
    <div className="visual-rationale-grid">
      <article className="panel visual-brief" data-trace-field="visual.logoBrief"><span className="eyebrow">Logo brief</span><p>{visual.logoBrief}</p></article>
      <article className="panel" data-trace-field="visual.shapeLanguage"><span className="eyebrow">Shape language</span><p>{visual.shapeLanguage}</p></article>
      <article className="panel" data-trace-field="visual.imageryStyle"><span className="eyebrow">Imagery style</span><p>{visual.imageryStyle}</p></article>
      <article className="panel visual-avoid" data-trace-field="visual.avoid"><span className="eyebrow">Do not drift into</span><ul>{visual.avoid.map((item) => <li key={item}><span>×</span>{item}</li>)}</ul></article>
    </div>
    <article className="panel contrast-panel" data-trace-field="visual.contrastChecks">
      <header><div><span className="eyebrow">Accessibility evidence</span><h2>Contrast checks</h2></div><b>{visual.contrastChecks.filter((check) => check.pass).length}/{visual.contrastChecks.length} pass</b></header>
      <div className="contrast-list">{visual.contrastChecks.map((check) => <div key={`${check.fg}-${check.bg}`}>
        <span className="contrast-swatch" style={{ background: check.bg }}><i style={{ background: check.fg }} /></span>
        <span><strong>{check.fg} on {check.bg}</strong><small>WCAG ratio {check.ratio.toFixed(2)}:1</small></span>
        <em className={check.pass ? "pass" : "fail"}>{check.pass ? "Pass" : "Fail"}</em>
      </div>)}</div>
    </article>
  </section>;
}
