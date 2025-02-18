import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '24h';

export interface JWTPayload {
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  try {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: TOKEN_EXPIRY,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

// Utility function to validate admin credentials
export function validateAdminCredentials(username: string, password: string): boolean {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error('Admin credentials not properly configured in environment variables');
    return false;
  }
  
  return username === process.env.ADMIN_USERNAME && 
         password === process.env.ADMIN_PASSWORD;
}
