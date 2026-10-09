import { indianStates } from "./states";

/**
 * A buyer's GSTIN and state, checked before they are printed on a tax invoice.
 *
 * WHY. The checkout sent whatever was typed, and the backend does not check it
 * at checkout either: the invoice was issued with it, and only the monthly
 * GSTR-1 export found it unusable and set the invoice aside as an exception
 * (isValidGSTIN in onemana-backend gstr1.go). By then the buyer held an invoice
 * they could not claim input tax credit on, which is the only reason anyone
 * types a GSTIN here.
 *
 * The state matters as much. A registered buyer's place of supply is the state
 * their GSTIN is registered in, and the first two digits say which. A different
 * state on the form puts CGST and SGST on the invoice where IGST was due, or the
 * other way round.
 */

// A regular taxpayer's GSTIN: state code, PAN (five letters, four digits, a
// letter), entity number, the letter Z, and a check character.
const SHAPE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** The 15th character the GST network derives from the first 14 (Luhn mod 36). */
export function gstinCheckChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const product = ALPHABET.indexOf(first14[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return ALPHABET[(36 - (sum % 36)) % 36];
}

/** Upper case, without the spaces a pasted GSTIN often carries. */
export function normaliseGstin(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

/** True for a well-formed GSTIN whose check character is right. Catches most typos. */
export function isValidGstin(raw: string): boolean {
  const g = normaliseGstin(raw);
  return SHAPE.test(g) && gstinCheckChar(g.slice(0, 14)) === g[14];
}

export type IndianBilling =
  | { ok: true; gstin: string; state: string; stateCode: string }
  | { ok: false; error: string };

/**
 * The GSTIN and state to send with an Indian order, or what to tell the buyer.
 *
 * No GSTIN is fine: a sale to a person, invoiced without one. With a valid one,
 * a state left empty is taken from it, and a different state is refused. A
 * GSTIN whose state code is not in our list (97, Other Territory, for one) is
 * accepted with the state as chosen.
 */
export function checkIndianBilling(rawGstin: string, stateName: string): IndianBilling {
  const gstin = normaliseGstin(rawGstin);
  const chosen = indianStates.find((s) => s.name === stateName);
  if (!gstin) return { ok: true, gstin: "", state: stateName, stateCode: chosen?.code ?? "" };
  if (!isValidGstin(gstin)) {
    return {
      ok: false,
      error: "That GSTIN does not look right. Check it against your GST registration, or leave it empty to buy without one.",
    };
  }
  const registered = indianStates.find((s) => s.code === gstin.slice(0, 2));
  if (!registered) return { ok: true, gstin, state: stateName, stateCode: chosen?.code ?? "" };
  if (chosen && chosen.code !== registered.code) {
    return {
      ok: false,
      error: `That GSTIN is registered in ${registered.name}, but the state chosen is ${chosen.name}. Your invoice must name the state your GSTIN is registered in.`,
    };
  }
  return { ok: true, gstin, state: registered.name, stateCode: registered.code };
}
