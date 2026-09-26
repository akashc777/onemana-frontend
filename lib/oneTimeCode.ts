// The six-digit codes the account emails send.

export const CODE_LENGTH = 6;

/**
 * The code in whatever was typed or pasted: digits only, at most six.
 *
 * WHY THE SLICE IS HERE AND NOT maxLength. The field used maxLength={6}, and the
 * browser applies it to a paste before onChange sees the text. A code copied
 * from an email with a space in front (" 123456", as several mail clients copy
 * it) was cut to " 12345" and then lost the space, leaving five digits and a
 * button that would not enable. Dropping the non-digits first keeps all six.
 */
export function onlyCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
}
