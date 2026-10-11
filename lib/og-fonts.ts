// Inter weights for next/og ImageResponse cards (edge-safe remote fetch).
const INTER = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files";

export async function loadOgFonts() {
  const [regular, semibold, bold, extrabold] = await Promise.all([
    fetch(`${INTER}/inter-latin-400-normal.woff`).then((r) => r.arrayBuffer()),
    fetch(`${INTER}/inter-latin-600-normal.woff`).then((r) => r.arrayBuffer()),
    fetch(`${INTER}/inter-latin-700-normal.woff`).then((r) => r.arrayBuffer()),
    fetch(`${INTER}/inter-latin-800-normal.woff`).then((r) => r.arrayBuffer()),
  ]);

  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: extrabold, weight: 800 as const, style: "normal" as const },
  ];
}
/**
 * The rupee sign for the cards (site.md OG2). The fontsource files above are
 * latin only and have no U+20B9, and Satori reads TrueType, not the site's
 * woff2 subset, so the one glyph is fetched from the Google Fonts CSS API at
 * render time (text=₹, which a plain user agent is served as TrueType),
 * once per server instance. Nothing is committed: the repository is public.
 * Null when Google does not answer, and the card then writes "INR".
 */
let rupee: Promise<ArrayBuffer | null> | null = null;

export async function loadRupeeFont(): Promise<ArrayBuffer | null> {
  rupee ??= (async () => {
    try {
      const css = await fetch("https://fonts.googleapis.com/css2?family=Inter:wght@600&text=%E2%82%B9", {
        headers: { "User-Agent": "onemana-og/1.0" },
      }).then((r) => (r.ok ? r.text() : ""));
      const url = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/)?.[1];
      if (!url) return null;
      const res = await fetch(url);
      return res.ok ? await res.arrayBuffer() : null;
    } catch {
      return null;
    }
  })();
  const got = await rupee;
  if (!got) rupee = null; // try again on the next render
  return got;
}
