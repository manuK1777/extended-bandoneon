import { db } from '../index';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  expires_timestamp?: number; // UTC timestamp in milliseconds
  used: boolean;
  created_at?: Date;
}

// Create a password reset token for a user
export async function createPasswordResetToken(userId: string, expiresInHours = 1): Promise<PasswordReset> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const id = uuidv4();
  
  // Calculate expiration date (shorter expiry for security)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (expiresInHours * 60 * 60 * 1000));
  
  // Store the expiration timestamp in milliseconds since epoch (UTC)
  const expiresAtTimestamp = expiresAt.getTime();
  
  console.log('Creating password reset token:', {
    userId,
    now: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    expiresAtTimestamp
  });
  
  // Delete any existing unused tokens for this user
  await db.execute(
    'DELETE FROM password_resets WHERE user_id = ? AND used = FALSE',
    [userId]
  );
  
  // Store both the formatted date and the UTC timestamp
  await db.execute(
    'INSERT INTO password_resets (id, user_id, token, expires_at, expires_timestamp, used) VALUES (?, ?, ?, ?, ?, FALSE)',
    [id, userId, token, expiresAt.toISOString().slice(0, 19).replace('T', ' '), expiresAtTimestamp]
  );
  
  return {
    id,
    user_id: userId,
    token,
    expires_at: expiresAt,
    expires_timestamp: expiresAtTimestamp,
    used: false
  };
}

// Find a password reset by token
export async function findPasswordResetByToken(token: string): Promise<PasswordReset | null> {
  const resets = await db.query<PasswordReset>(
    'SELECT * FROM password_resets WHERE token = ? AND used = FALSE',
    [token]
  );
  
  if (resets.length === 0) {
    return null;
  }
  
  const resetToken = resets[0];
  
  // Convert expires_at to a proper Date object if it's not already
  if (!(resetToken.expires_at instanceof Date)) {
    resetToken.expires_at = new Date(resetToken.expires_at);
  }
  
  // If we have a timestamp, use it for more accurate expiration checks
  if (!resetToken.expires_timestamp) {
    console.warn('Token found without expires_timestamp, falling back to expires_at');
    // For older tokens without the timestamp, we'll still use the Date
    resetToken.expires_timestamp = resetToken.expires_at.getTime();
  }
  
  return resetToken;
}

// Mark a password reset token as used
export async function markPasswordResetAsUsed(id: string): Promise<void> {
  await db.execute(
    'UPDATE password_resets SET used = TRUE WHERE id = ?',
    [id]
  );
}

// Clean up expired and used tokens
export async function cleanupPasswordResetTokens(): Promise<void> {
  const now = new Date();
  
  await db.execute(
    'DELETE FROM password_resets WHERE expires_at < ? OR used = TRUE',
    [now.toISOString().slice(0, 19).replace('T', ' ')]
  );
}

// Check if user has recent password reset attempts (rate limiting)
export async function hasRecentPasswordResetAttempt(userId: string, minutesAgo = 5): Promise<boolean> {
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - minutesAgo);
  
  const resets = await db.query<PasswordReset>(
    'SELECT * FROM password_resets WHERE user_id = ? AND created_at > ?',
    [userId, cutoffTime.toISOString().slice(0, 19).replace('T', ' ')]
  );
  
  return resets.length > 0;
}
