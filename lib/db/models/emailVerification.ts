import { db } from '../index';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user';
import crypto from 'crypto';

export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at?: Date;
}

// Create a verification token for a user
export async function createVerificationToken(userId: string, expiresInHours = 24): Promise<EmailVerification> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const id = uuidv4();
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  // Delete any existing tokens for this user
  await db.execute(
    'DELETE FROM email_verifications WHERE user_id = ?',
    [userId]
  );
  
  // Insert the new token
  await db.execute(
    'INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, token, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
  );
  
  return {
    id,
    user_id: userId,
    token,
    expires_at: expiresAt
  };
}

// Find a verification by token
export async function findVerificationByToken(token: string): Promise<EmailVerification | null> {
  const verifications = await db.query<EmailVerification>(
    'SELECT * FROM email_verifications WHERE token = ?',
    [token]
  );
  
  return verifications.length > 0 ? verifications[0] : null;
}

// Verify a user's email
export async function verifyUserEmail(userId: string): Promise<void> {
  const now = new Date();
  
  await db.execute(
    'UPDATE users SET email_verified = TRUE, email_verified_at = ? WHERE id = ?',
    [now.toISOString().slice(0, 19).replace('T', ' '), userId]
  );
  
  // Clean up the verification token
  await db.execute(
    'DELETE FROM email_verifications WHERE user_id = ?',
    [userId]
  );
}

// Delete an expired verification token
export async function deleteVerification(id: string): Promise<void> {
  await db.execute(
    'DELETE FROM email_verifications WHERE id = ?',
    [id]
  );
}

// Clean up expired tokens
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  
  await db.execute(
    'DELETE FROM email_verifications WHERE expires_at < ?',
    [now.toISOString().slice(0, 19).replace('T', ' ')]
  );
}
