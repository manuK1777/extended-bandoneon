import { db } from '@/lib/db';

/**
 * Sanitizes a tag string for database storage.
 * - Converts to lowercase
 * - Removes leading/trailing whitespace
 * - Normalizes internal spaces (replaces multiple spaces with single space)
 * - Removes special characters except spaces and hyphens
 * @param tag Raw tag string
 * @returns Sanitized tag string
 */
export function sanitizeTag(tag: string): string {
  if (!tag) return '';
  
  // Convert to lowercase and trim
  let sanitized = tag.toLowerCase().trim();
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove all special characters except alphanumeric, spaces, and hyphens
  sanitized = sanitized.replace(/[^a-z0-9\s-]/g, '');
  
  return sanitized;
}

/**
 * Processes a comma-separated string of tags into an array of sanitized tags
 * @param tagsString Comma-separated string of tags
 * @returns Array of sanitized tags
 */
export function processTags(tagsString: string): string[] {
  if (!tagsString) return [];
  
  // Split by comma and handle potential whitespace around commas
  const tags = tagsString.split(/\s*,\s*/);
  
  // Process each tag and filter out empty ones
  return tags
    .map(tag => sanitizeTag(tag))
    .filter(tag => tag.length > 0);
}

/**
 * Gets all tags for a soundpack
 * @param soundpackId The ID of the soundpack
 * @returns Array of tag strings
 */
export async function getSoundpackTags(soundpackId: number): Promise<string[]> {
  const tags = await db.query<{ tag: string }>(
    `SELECT h.tag
     FROM hashtags h
     JOIN entity_hashtags eh ON h.id = eh.hashtag_id
     WHERE eh.entity_id = ? AND eh.entity_type = 'soundpack'`,
    [soundpackId]
  );

  return tags.map(t => t.tag);
}
