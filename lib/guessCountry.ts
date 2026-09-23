/**
 * The checkout's first guess at the buyer's country.
 *
 * WHY. The form opened on India, with State and GSTIN below it, for buyers
 * who are mostly in the US. One who did not notice was invoiced as an Indian
 * customer, with GST, and the form read as though it was not meant for them.
 *
 * The time zone is the best signal a browser gives without asking: it
 * follows where the machine is, not which English it speaks. The language's
 * region comes next ("en-GB"), and the United States last, because most
 * buyers are there and a wrong India costs a wrong tax invoice while a wrong
 * US costs nothing. The buyer can always change it.
 */
const ZONES: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Phoenix": "US", "America/Anchorage": "US", "America/Detroit": "US", "America/Boise": "US",
  "America/Indiana/Indianapolis": "US", "Pacific/Honolulu": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA",
  "America/Mexico_City": "MX", "America/Sao_Paulo": "BR",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Amsterdam": "NL",
  "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Zurich": "CH", "Europe/Stockholm": "SE", "Europe/Warsaw": "PL",
  "Asia/Singapore": "SG", "Asia/Dubai": "AE", "Asia/Tokyo": "JP", "Asia/Karachi": "PK", "Asia/Dhaka": "BD", "Asia/Colombo": "LK",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Perth": "AU", "Pacific/Auckland": "NZ",
  "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "Africa/Johannesburg": "ZA",
}

export function guessCountry(timeZone: string | undefined, languages: readonly string[], known: ReadonlySet<string>): string {
  const byZone = timeZone ? ZONES[timeZone] : undefined
  if (byZone && known.has(byZone)) return byZone
  for (const lang of languages) {
    const region = lang.split("-")[1]?.toUpperCase()
    if (region && region.length === 2 && known.has(region)) return region
  }
  return "US"
}
