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