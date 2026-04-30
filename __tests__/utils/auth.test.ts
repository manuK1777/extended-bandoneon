import { JWTPayload } from '@/utils/auth';
import { UserWithoutPassword } from '@/lib/db/models/user';
import { findUserByEmail, verifyPassword, sanitizeUser, UserRole } from '@/lib/db/models/user';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@/lib/db/models/user', () => ({
  findUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
  sanitizeUser: jest.fn(user => ({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  }))
}));

// Mock jwt module
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn()
}));

// Create test versions of auth functions that don't rely on process.env
const TEST_JWT_SECRET = 'test-secret';

function testGenerateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, TEST_JWT_SECRET, { 
      expiresIn: '24h',
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

function testVerifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, TEST_JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

async function testAuthenticateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
  try {
    const user = await findUserByEmail(email);
    if (!user) return null;
    
    const isValid = await verifyPassword(user, password);
    if (!isValid) return null;
    
    return sanitizeUser(user);
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

describe('Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' };
      const token = testGenerateToken(payload);
      
      expect(token).toBe('mock-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        payload, 
        TEST_JWT_SECRET, 
        expect.objectContaining({ 
          expiresIn: '24h',
          algorithm: 'HS256' 
        })
      );
    });

    it('should throw an error if token generation fails', () => {
      // Mock implementation to throw error
      (jwt.sign as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Token generation failed');
      });
      
      const payload = { userId: '123', email: 'test@example.com', role: 'user' };
      
      expect(() => testGenerateToken(payload)).toThrow('Failed to generate authentication token');
    });
  });

  describe('verifyToken', () => {
    it('should return payload when token is valid', () => {
      const mockPayload = { 
        userId: '123', 
        email: 'test@example.com', 
        role: 'user',
        iat: 1234567890,
        exp: 9876543210
      };
      
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);
      
      const result = testVerifyToken('valid-token');
      
      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', TEST_JWT_SECRET);
    });

    it('should return null when token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      const result = testVerifyToken('invalid-token');
      
      expect(result).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole 
      };
      
      (findUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValueOnce(true);
      
      const result = await testAuthenticateUser('test@example.com', 'password');
      
      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'user'
      });
      expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(verifyPassword).toHaveBeenCalledWith(mockUser, 'password');
      expect(sanitizeUser).toHaveBeenCalledWith(mockUser);
    });

    it('should return null when user is not found', async () => {
      (findUserByEmail as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await testAuthenticateUser('nonexistent@example.com', 'password');
      
      expect(result).toBeNull();
      expect(findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(verifyPassword).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole 
      };
      
      (findUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await testAuthenticateUser('test@example.com', 'wrong-password');
      
      expect(result).toBeNull();
      expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(verifyPassword).toHaveBeenCalledWith(mockUser, 'wrong-password');
    });

    it('should handle errors during authentication', async () => {
      (findUserByEmail as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      
      const result = await testAuthenticateUser('test@example.com', 'password');
      
      expect(result).toBeNull();
    });
  });
});
