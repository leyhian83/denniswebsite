/** Formatting helpers for prices, areas and property attributes. */

export function formatPrice(value: number | undefined): string {
  if (value == null || value === 0) return "";
  return "RM " + new Intl.NumberFormat("en-MY", {
    maximumFractionDigits: 0,
  }).format(value);
}

/** "RM 1,180,000" — no decimals. Short form used in cards. */
export function formatPriceShort(value: number | undefined): string {
  return formatPrice(value);
}

/** Compact thousands label, e.g. 1.18M, 780K — for dense spots. */
export function formatPriceCompact(value: number | undefined): string {
  if (value == null || value === 0) return "";
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `RM${m.toFixed(m >= 10 ? 1 : 2)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `RM${k.toFixed(k >= 100 ? 0 : 1)}K`;
  }
  return `RM${value.toLocaleString()}`;
}

export function formatSqFt(value: number | undefined): string {
  return value ? `${value.toLocaleString()} sq ft` : "";
}

/** Title-case a slug into a readable label, e.g. "klcc" -> "KLCC". */
export function slugToTitle(slug: string): string {
  const words = slug.split("-");
  const result = words
    .map((w) => {
      if (!w) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
  // Preserve common acronyms
  return result
    .replace(/\bKlcc\b/g, "KLCC")
    .replace(/\bTtdi\b/g, "TTDI")
    .replace(/\bPju\b/gi, "PJU")
    .replace(/\bMrt\b/g, "MRT");
}

/** Format an ISO date into a readable "Jun 2025" label. */
export function formatMonthYear(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
}
