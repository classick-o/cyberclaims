// Media helpers. Deliberately free of any backend import, so a prerendered page can
// use them without dragging mysql2 into its build.

/** srcset from the WebP variants sharp produced at upload. */
export function srcset(variants: Record<string, string> | null | undefined): string | undefined {
  if (!variants) return undefined;
  return Object.entries(variants)
    .map(([width, path]) => `${path} ${width}w`)
    .join(', ');
}

/** The smallest variant — enough for a thumbnail or a blurred backdrop. */
export function smallest(
  variants: Record<string, string> | null | undefined,
  fallback: string
): string {
  if (!variants) return fallback;
  const widths = Object.keys(variants)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  return widths.length ? variants[String(widths[0])] : fallback;
}
