import jwt, { type SignOptions } from 'jsonwebtoken';
import { findUserByEmail, verifyPassword, UserWithoutPassword, sanitizeUser } from '@/lib/db/models/user';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  options?: { expiresIn?: string }
) {
  try {
    const signOptions: SignOptions = {
      expiresIn: (options?.expiresIn ?? TOKEN_EXPIRY) as SignOptions['expiresIn'],
      // algorithm left as default (HS256) to avoid type mismatches across @types versions
    };
    return jwt.sign(payload, JWT_SECRET, signOptions);
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

// Verify JWT token - Node.js environment
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token: string): Promise<UserWithoutPassword | null> {
  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;
  
  try {
    const user = await findUserByEmail(payload.email);
    if (!user) return null;

    // Invalidate tokens issued before the user's last update (e.g., password change)
    // payload.iat is in seconds since epoch
    if (user.updated_at && payload.iat) {
      const updatedAtSec = Math.floor(new Date(user.updated_at).getTime() / 1000);
      const iatSec = typeof payload.iat === 'number' ? payload.iat : Number(payload.iat);
      if (Number.isFinite(iatSec) && iatSec < updatedAtSec) {
        console.warn('Token invalidated due to user update (likely password change)', {
          userId: user.id,
          iat: iatSec,
          updatedAt: updatedAtSec,
        });
        return null;
      }
    }

    return sanitizeUser(user);
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<UserWithoutPassword | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return null;
    
    return await getUserFromToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user is admin
export function isAdmin(user: UserWithoutPassword | null): boolean {
  return user?.role === 'admin';
}

// Authenticate user with email and password
export async function authenticateUser(email: string, password: string): Promise<{ user: UserWithoutPassword; emailVerified: boolean } | null> {
  try {
    const user = await findUserByEmail(email);
    if (!user) return null;
    
    const isValid = await verifyPassword(user, password);
    if (!isValid) return null;
    
    return {
      user: sanitizeUser(user),
      emailVerified: Boolean(user.email_verified)
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
