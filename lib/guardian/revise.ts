import { BrandSpec, type Revision } from "@/lib/schema/brandSpec";

// Only free-text leaves may be rewritten by Guardian; structure, ids and scores never change.
const REVISABLE = [
  /^verbal\.tagline\.text$/,
  /^verbal\.oneLiner$/,
  /^verbal\.messageHierarchy\.primary$/,
  /^verbal\.messageHierarchy\.supporting\[\d+\]$/,
  /^verbal\.voice\.(principles|do|dont|samples)\[\d+\]$/,
  /^visual\.(shapeLanguage|imageryStyle|logoBrief)$/,
  /^visual\.avoid\[\d+\]$/,
  /^launch\.(heroHeadline|heroSub|pitch)$/,
  /^launch\.socialPosts\[\d+\]\.text$/,
];

function parsePath(path: string): (string | number)[] {
  return path.split(".").flatMap((part) => {
    const m = /^(\w+)((?:\[\d+\])*)$/.exec(part);
    if (!m) return [part];
    const idx = [...(m[2] ?? "").matchAll(/\[(\d+)\]/g)].map((x) => Number(x[1]));
    return [m[1]!, ...idx];
  });
}

/**
 * Applies revisions to allow-listed string fields. Returns the new spec and the
 * revisions actually applied (unknown paths and non-string leaves are skipped).
 */
export function applyRevisions(input: BrandSpec, revisions: Revision[]): { spec: BrandSpec; applied: Revision[] } {
  const spec = structuredClone(input) as unknown as Record<string, unknown>;
  const applied: Revision[] = [];

  for (const rev of revisions) {
    if (!REVISABLE.some((re) => re.test(rev.field))) continue;
    const keys = parsePath(rev.field);
    let node: unknown = spec;
    for (const k of keys.slice(0, -1)) {
      node = node && typeof node === "object" ? (node as Record<string | number, unknown>)[k] : undefined;
    }
    const last = keys[keys.length - 1]!;
    if (!node || typeof node !== "object") continue;
    const parent = node as Record<string | number, unknown>;
    const current = parent[last];
    if (typeof current !== "string") continue;
    parent[last] = rev.after;
    applied.push({ ...rev, before: current });
  }

  return { spec: BrandSpec.parse(spec), applied };
}
