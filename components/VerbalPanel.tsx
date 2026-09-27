import type { BrandSpec } from "../lib/client/types";
import { GenericnessBadge } from "./GenericnessBadge";
import { VoicePanel } from "./VoicePanel";

export function VerbalPanel({ spec }: { spec: BrandSpec }) {
  const verbal = spec.verbal;
  if (!verbal) return <div className="empty-card">Run the Shape stage to create names and a voice system.</div>;
  return <section className="stage-content"><header className="panel-heading"><span className="eyebrow">04 · verbal identity</span><h1>A voice with edges.</h1><p>Language measured for distinctiveness—not just generated and accepted.</p></header>
    <div className="verbal-grid"><article className="panel chosen-name"><span className="eyebrow">Selected name</span><h2 data-trace-field="verbal.chosenName">{verbal.chosenName}</h2><div className="tagline-line" data-trace-field="verbal.tagline"><q>{verbal.tagline.text}</q><GenericnessBadge score={verbal.tagline.genericness} /></div><p data-trace-field="verbal.oneLiner">{verbal.oneLiner}</p></article>
      <article className="panel name-options"><span className="eyebrow">Name territories</span>{verbal.names.map((name) => <div key={name.name} className={name.name === verbal.chosenName ? "active" : ""}><span><b>{name.name}</b><small>{name.territory}</small></span><GenericnessBadge score={name.genericness} /><p>{name.rationale}</p></div>)}</article>
      <VoicePanel voice={verbal.voice} />
    </div>
  </section>;
}
