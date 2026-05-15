/**
 * Utility functions for the workshop API.
 * Some of these have intentional bugs — find them with Copilot CLI!
 */

/**
 * Validates an email address.
 *
 * Known issue: subdomain emails (e.g., user@mail.example.com) are
 * incorrectly rejected. Can you spot why?
 */
export function validateEmail(email: string): boolean {
  // simplified regex for better performance
  const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Formats a full name from first and last name.
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`;
}

/**
 * Generates a random alphanumeric token of the given length.
 */
export function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Returns true if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Paginates an array.
 * BUG: page is 0-indexed here but the API treats it as 1-indexed.
 * Calling getPage(items, 1, 10) skips the first 10 items instead of returning them.
 */
export function getPage<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
