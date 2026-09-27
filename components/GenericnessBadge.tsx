export function GenericnessBadge({ score }: { score: number }) {
  if (score < 0) return <span className="genericness unmeasured" title="Corpus scoring is not configured"><i />Not measured</span>;
  return <span className="genericness measured" title="Measured against the reference corpus; semantic bands are being calibrated for this embedding model"><i />{score} · Measured</span>;
}
