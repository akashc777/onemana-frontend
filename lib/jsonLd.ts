/**
 * Serialise a value for injection into a <script type="application/ld+json"> block.
 *
 * WHY THIS IS NOT JUST JSON.stringify. Inside a <script> element the browser is
 * looking for the closing tag before it parses anything as JSON, and
 * JSON.stringify does not escape "<" or "/". So a string containing
 *
 *   </script><script>alert(1)</script>
 *
 * ends the JSON-LD block early and everything after it runs as script. On this
 * site the affected values (a post title, excerpt or author) are admin-authored
 * and rendered on the same origin that holds the admin session token, so the
 * consequence of one careless or malicious value is script execution where it
 * matters most.
 *
 * Escaping "<" as \u003c makes the sequence unrecognisable to the HTML parser
 * while remaining exactly equivalent JSON — consumers (Google, validators) see
 * the identical value. "&" and line separators are escaped for the same reason:
 * they are the other characters that change meaning depending on where the text
 * is embedded.
 *
 * Use this anywhere a value is serialised into an inline script. Never call
 * JSON.stringify directly for that.
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    // U+2028/U+2029 are valid in JSON strings but are line terminators in
    // JavaScript, so an unescaped one is a syntax error in the emitted script.
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
