/**
 * Helper functions for string manipulation
 */

/**
 * Convert Vietnamese string to slug (URL-friendly format)
 * @param str - Input string (Vietnamese or English)
 * @returns Slugified string
 */
export function slugify(str: string): string {
  if (!str) return '';

  // Convert to lowercase
  str = str.toLowerCase();

  // Remove accents/diacritics from Vietnamese
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace đ with d
  str = str.replace(/đ/g, 'd');
  str = str.replace(/Đ/g, 'd');

  // Remove invalid chars
  str = str.replace(/[^a-z0-9\s-]/g, '');

  // Replace whitespace with -
  str = str.replace(/\s+/g, '-');

  // Replace multiple - with single -
  str = str.replace(/-+/g, '-');

  // Trim - from start and end
  str = str.replace(/^-+|-+$/g, '');

  return str;
}

/**
 * Generate unique slug with timestamp
 * @param title - Blog title
 * @returns Unique slug
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = slugify(title);
  const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
  return `${baseSlug}-${timestamp}`;
}

/**
 * Truncate string to max length
 * @param str - Input string
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
