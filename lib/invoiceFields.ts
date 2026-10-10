/**
 * The optional invoice details a buyer outside India may add at checkout
 * (owner decision D2, 11 Oct 2026): a company abroad expenses a purchase only
 * when the invoice names it, its address and its tax number.
 *
 * The tax number is asked for by the name it has where the buyer is, the
 * same label the invoice prints it under (onemana-backend
 * services/invoice/pdf.go TaxIDLabel).
 */
const VAT = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB",
]);

export function taxIdLabel(country: string): string {
  const c = country.toUpperCase();
  if (VAT.has(c)) return "VAT number";
  if (c === "SG") return "Tax number (UEN)";
  if (c === "AU") return "ABN";
  return "Tax ID";
}
