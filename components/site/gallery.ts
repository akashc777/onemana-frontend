/**
 * Where each card sits, so every row of the gallery is full: rows of three on
 * a wide screen, with a last row of four when three would leave one alone (or
 * two halves when it would leave two), and in two columns the first card
 * wide when the count is odd. Literal classes, so Tailwind keeps them.
 */
export function gallerySpans(n: number): string[] {
  const wide = Array.from({ length: n }, () => "lg:col-span-4");
  if (n % 3 === 1 && n >= 4) for (let i = n - 4; i < n; i++) wide[i] = "lg:col-span-3";
  if (n % 3 === 2) for (let i = n - 2; i < n; i++) wide[i] = "lg:col-span-6";
  return wide.map((w, i) => (n % 2 === 1 && i === 0 ? `${w} sm:col-span-2` : w));
}
