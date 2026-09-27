import type { BrandSpec } from "../lib/client/types";
import { GenericnessBadge } from "./GenericnessBadge";

export function VerbalPanel({ spec }: { spec: BrandSpec }) {
  const verbal = spec.verbal;
  if (!verbal) return <div className="empty-card">Run the Shape stage to create names and a voice system.</div>;
  return <section className="stage-content"><header className="panel-heading"><span className="eyebrow">04 · verbal identity</span><h1>A voice with edges.</h1><p>Language measured for distinctiveness—not just generated and accepted.</p></header>
    <div className="verbal-grid"><article className="panel chosen-name"><span className="eyebrow">Selected name</span><h2 data-trace-field="verbal.chosenName">{verbal.chosenName}</h2><div className="tagline-line" data-trace-field="verbal.tagline"><q>{verbal.tagline.text}</q><GenericnessBadge score={verbal.tagline.genericness} /></div><p data-trace-field="verbal.oneLiner">{verbal.oneLiner}</p></article>
      <article className="panel name-options"><span className="eyebrow">Name territories</span>{verbal.names.map((name) => <div key={name.name} className={name.name === verbal.chosenName ? "active" : ""}><span><b>{name.name}</b><small>{name.territory}</small></span><GenericnessBadge score={name.genericness} /><p>{name.rationale}</p></div>)}</article>
      <article className="panel voice-card" data-trace-field="verbal.voice"><span className="eyebrow">Voice rules</span><div className="voice-columns"><div><h3>Do this</h3>{verbal.voice.do.map((item) => <p key={item}>↗ {item}</p>)}</div><div><h3>Never this</h3>{verbal.voice.dont.map((item) => <p key={item}>× {item}</p>)}</div></div><blockquote>“{verbal.voice.samples[0]}”</blockquote></article>
    </div>
  </section>;
}
