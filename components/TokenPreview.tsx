import type { BrandSpec } from "../lib/client/types";

export function TokenPreview({ spec }: { spec: BrandSpec }) {
  if (!spec.visual || !spec.verbal) return <div className="empty-card">Visual tokens will appear after the brand is shaped.</div>;
  const colors = Object.fromEntries(spec.visual.palette.map((color) => [color.role, color.hex]));
  const style = {
    "--preview-primary": colors.primary ?? "#171717",
    "--preview-secondary": colors.secondary ?? "#666",
    "--preview-accent": colors.accent ?? "#e8793a",
    "--preview-bg": colors.bg ?? "#f7f3ea",
    "--preview-text": colors.text ?? "#171717",
  } as React.CSSProperties;
  return <div className="token-preview" style={style}>
    <div className="preview-browser"><div className="browser-bar"><i /><i /><i /><span>{spec.verbal.chosenName.toLowerCase()}.studio</span></div><div className="preview-nav"><b>{spec.verbal.chosenName}</b><span>Manifesto&nbsp;&nbsp; Work&nbsp;&nbsp; Contact</span></div><main><span className="preview-kicker">{spec.directions?.find((item) => item.id === spec.selection?.directionId)?.label}</span><h2>{spec.verbal.tagline.text}</h2><p>{spec.verbal.oneLiner}</p><button>Begin here <span>↗</span></button></main><div className="preview-orbit">✦</div></div>
    <div className="social-card"><span className="social-logo">{spec.verbal.chosenName}</span><h3>{spec.verbal.messageHierarchy.primary}</h3><span className="social-arrow">↘</span><small>BRAND NOTE / 001</small></div>
    <div className="token-strip"><span>{spec.visual.fontPairingId}</span><div>{spec.visual.palette.map((color) => <i key={`${color.role}-${color.hex}`} title={`${color.name}: ${color.hex}`} style={{ background: color.hex }} />)}</div></div>
  </div>;
}

