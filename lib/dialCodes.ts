// Country calling codes for the checkout's phone field.
//
// Razorpay's payment window asks for a mobile number and, with none given,
// opens on India's +91. A buyer in Ohio then retypes a number in the wrong
// country's format at the moment of paying. Starting our phone field with the
// buyer's own code, and handing the number to Razorpay, opens its window in
// the right country, often already filled.
//
// The markets OneCamp sells to, not the whole world: a country missing here
// simply gets no prefix, which is what every country got before.
const DIAL: Record<string, string> = {
  US: "1", CA: "1", GB: "44", IE: "353", AU: "61", NZ: "64", IN: "91",
  DE: "49", FR: "33", NL: "31", BE: "32", LU: "352", CH: "41", AT: "43",
  ES: "34", PT: "351", IT: "39", GR: "30", SE: "46", NO: "47", DK: "45",
  FI: "358", IS: "354", PL: "48", CZ: "420", SK: "421", HU: "36", RO: "40",
  BG: "359", HR: "385", SI: "386", EE: "372", LV: "371", LT: "370", UA: "380",
  TR: "90", IL: "972", AE: "971", SA: "966", QA: "974", KW: "965", BH: "973",
  OM: "968", EG: "20", ZA: "27", NG: "234", KE: "254", SG: "65", MY: "60",
  ID: "62", PH: "63", TH: "66", VN: "84", JP: "81", KR: "82", HK: "852",
  TW: "886", PK: "92", BD: "880", LK: "94", NP: "977", BR: "55", MX: "52",
  AR: "54", CL: "56", CO: "57", PE: "51",
}

/** "+1 " for "US"; "" for a country not listed. Pure. */
export function dialPrefix(country: string): string {
  const d = DIAL[country.toUpperCase()]
  return d ? `+${d} ` : ""
}

/**
 * The phone field's value after the country changes: the new country's
 * prefix when the field is empty or holds only the previous prefix, and what
 * the buyer typed otherwise. Pure.
 */
export function phoneForCountry(current: string, previousCountry: string, nextCountry: string): string {
  const cur = current.trim()
  if (cur === "" || cur === dialPrefix(previousCountry).trim()) return dialPrefix(nextCountry)
  return current
}

/** The number to prefill in the payment window, or "" when only a prefix was left. Pure. */
export function contactForCheckout(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 7 ? phone.trim() : ""
}
