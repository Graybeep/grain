import type { BrandSpec } from "../lib/client/types";
import { TokenPreview } from "./TokenPreview";

export function LaunchPanel({ spec, onShare }: { spec: BrandSpec; onShare?: () => void }) {
  if (!spec.launch) return <div className="empty-card">The launch kit will appear after its final Guardian pass.</div>;
  return <section className="stage-content"><header className="panel-heading launch-heading"><div><span className="eyebrow">08 · launch kit</span><h1>Ready to leave the studio.</h1><p>One coherent system, from strategy to first post.</p></div>{onShare && <button className="primary-button" onClick={onShare}>Share kit <span>↗</span></button>}</header>
    <TokenPreview spec={spec} />
    <div className="launch-copy"><article className="panel" data-trace-field="launch.heroHeadline"><span className="eyebrow">Hero copy</span><h2>{spec.launch.heroHeadline}</h2><p>{spec.launch.heroSub}</p></article><article className="panel" data-trace-field="launch.pitch"><span className="eyebrow">Elevator pitch</span><p className="pitch">{spec.launch.pitch}</p></article></div>
    <div className="social-posts">{spec.launch.socialPosts.map((post) => <article className="panel" key={post.platform}><span className="eyebrow">{post.platform}</span><p>{post.text}</p></article>)}</div>
  </section>;
}
