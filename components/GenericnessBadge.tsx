export function GenericnessBadge({ score }: { score: number }) {
  if (score < 0) return <span className="genericness unmeasured" title="Corpus scoring is not configured"><i />Not measured</span>;
  const band = score >= 70 ? "Generic" : score >= 50 ? "Familiar" : "Distinct";
  return <span className={`genericness ${band.toLowerCase()}`} title="Compared with the reference corpus"><i />{score} · {band}</span>;
}
