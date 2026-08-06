/**
 * PII Scrubber Middleware / Utility
 * Scrubs sensitive Personally Identifiable Information (PII) from user text.
 */

export function scrubPII(text: string): { scrubbedText: string; scrubbed: boolean } {
  let original = text;

  // Phone numbers (e.g. +1 234-567-8900, 9876543210, 123-456-7890)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  // Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // SSN / Aadhaar / National ID patterns (e.g. 123-45-6789 or 1234 5678 9012)
  const nationalIdRegex = /\b\d{3}-\d{2}-\d{4}\b|\b\d{4}\s?\d{4}\s?\d{4}\b/g;

  let scrubbedText = text
    .replace(emailRegex, '[REDACTED EMAIL]')
    .replace(phoneRegex, '[REDACTED PHONE]')
    .replace(nationalIdRegex, '[REDACTED ID]');

  return {
    scrubbedText,
    scrubbed: scrubbedText !== original
  };
}
