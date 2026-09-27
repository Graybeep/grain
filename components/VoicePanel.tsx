import type { Verbal } from "../lib/client/types";

export function VoicePanel({ voice }: { voice: Verbal["voice"] }) {
  return <article className="panel voice-card" data-trace-field="verbal.voice">
    <span className="eyebrow">Voice system</span>
    <div className="voice-principles">{voice.principles.map((principle, index) => <div key={principle}><span>0{index + 1}</span><p>{principle}</p></div>)}</div>
    <div className="voice-columns"><div><h3>Do this</h3>{voice.do.map((item) => <p key={item}>↗ {item}</p>)}</div><div><h3>Never this</h3>{voice.dont.map((item) => <p key={item}>× {item}</p>)}</div></div>
    <div className="voice-samples"><span className="eyebrow">In practice</span>{voice.samples.map((sample) => <blockquote key={sample}>“{sample}”</blockquote>)}</div>
  </article>;
}

