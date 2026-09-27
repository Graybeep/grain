// WCAG 2.x contrast ratio, plus a lightness nudge that repairs failing text colors.

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string): boolean {
  return HEX.test(value.trim());
}

function toRgb(hex: string): [number, number, number] {
  const m = HEX.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Invalid hex color: ${hex}`);
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export const MIN_TEXT_CONTRAST = 4.5;

/**
 * Moves `fg` toward black or white (whichever gives more contrast against `bg`)
 * in small steps until the pair reaches `target`. Returns the adjusted hex.
 */
export function adjustForContrast(fg: string, bg: string, target = MIN_TEXT_CONTRAST): string {
  if (contrastRatio(fg, bg) >= target) return toHex(toRgb(fg));
  const towardWhite = contrastRatio("#ffffff", bg) > contrastRatio("#000000", bg);
  const goal: [number, number, number] = towardWhite ? [255, 255, 255] : [0, 0, 0];
  const start = toRgb(fg);
  for (let step = 1; step <= 50; step++) {
    const t = step / 50;
    const mixed = start.map((v, i) => v + (goal[i]! - v) * t) as [number, number, number];
    const candidate = toHex(mixed);
    if (contrastRatio(candidate, bg) >= target) return candidate;
  }
  return toHex(goal);
}
