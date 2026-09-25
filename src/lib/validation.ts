/*
 * Field validation — one rule set for every ECHO form.
 *
 * Each rule takes the raw field value and answers a single question: is this
 * good to submit? They are deliberately shape checks only, so a tick never
 * blocks a save on its own; the existing submit gates stay where they are.
 *
 * A rule must tolerate whatever the field legitimately holds, otherwise it
 * paints a red tick on a correct value:
 *   - mobile tolerates the +91 prefix the rest of the portal already stores
 *   - PAN, IFSC and GSTIN are matched case-insensitively, since all three
 *     identifiers are case-insensitive in law and users type them in lower case
 *   - surrounding whitespace is ignored, because values get trimmed on save
 */

const DIGITS = /\D/g;

/* 10 digits, with an optional 91 country prefix. */
export const isMobile = (value: string): boolean => {
  const d = value.replace(DIGITS, "");
  return d.length === 10 || (d.length === 12 && d.startsWith("91"));
};

/* 12 digits, numeric only. */
export const isAadhaar = (value: string): boolean => /^\d{12}$/.test(value.trim());

/* 4 letters, a literal 0, then 6 alphanumerics. */
export const isIfsc = (value: string): boolean =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim().toUpperCase());

/* 5 letters, 4 digits, 1 letter. */
export const isPan = (value: string): boolean =>
  /^[A-Z]{5}\d{4}[A-Z]$/.test(value.trim().toUpperCase());

/* 2 state digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, Z, 1 alphanumeric. */
export const isGstin = (value: string): boolean =>
  /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(value.trim().toUpperCase());

/* One @, a dot in the domain, no spaces. */
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/* Confirmation pair — both fields hold the same digits. */
export const accountMatches = (account: string, confirm: string): boolean => confirm === account;
