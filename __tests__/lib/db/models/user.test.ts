import { 
  findUserByEmail, 
  findUserById, 
  createUser, 
  verifyPassword, 
  sanitizeUser,
  UserRole
} from '@/lib/db/models/user';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    query: jest.fn(),
    execute: jest.fn()
  }
}));

jest.mock('bcryptjs');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}));

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole 
      };
      
      (db.query as jest.Mock).mockResolvedValue([mockUser]);
      
      const result = await findUserByEmail('test@example.com');
      
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
      );
    });

    it('should return null when user not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);
      
      const result = await findUserByEmail('nonexistent@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole 
      };
      
      (db.query as jest.Mock).mockResolvedValue([mockUser]);
      
      const result = await findUserById('123');
      
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['123']
      );
    });

    it('should return null when user not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);
      
      const result = await findUserById('nonexistent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user and return it without password', async () => {
      // Mock bcrypt functions
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('mock-salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      
      // Mock database operations
      (db.execute as jest.Mock).mockResolvedValue({});
      
      const mockUser = { 
        id: 'mock-uuid', 
        email: 'new@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' 
      };
      
      (db.query as jest.Mock).mockResolvedValue([mockUser]);
      
      const result = await createUser('new@example.com', 'password123');
      
      // Verify password hashing
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mock-salt');
      
      // Verify user creation
      expect(db.execute).toHaveBeenCalledWith(
        'INSERT INTO users (id, email, hashed_password, role) VALUES (?, ?, ?, ?)',
        ['mock-uuid', 'new@example.com', 'hashed-password', 'user']
      );
      
      // Verify user retrieval
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['mock-uuid']
      );
      
      // Verify returned user has no password
      expect(result).toEqual({
        id: 'mock-uuid',
        email: 'new@example.com',
        role: 'user'
      });
      expect(result).not.toHaveProperty('hashed_password');
    });

    it('should throw error if user creation fails', async () => {
      // Mock bcrypt functions
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('mock-salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      
      // Mock database operations
      (db.execute as jest.Mock).mockResolvedValue({});
      (db.query as jest.Mock).mockResolvedValue([]); // No user found after creation
      
      await expect(createUser('new@example.com', 'password123'))
        .rejects.toThrow('Failed to create user');
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password is valid', async () => {
      const user = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole 
      };
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await verifyPassword(user, 'correct-password');
      
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed-password');
    });

    it('should return false when password is invalid', async () => {
      const user = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole 
      };
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const result = await verifyPassword(user, 'wrong-password');
      
      expect(result).toBe(false);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const user = { 
        id: '123', 
        email: 'test@example.com', 
        hashed_password: 'hashed-password',
        role: 'user' as UserRole,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const result = sanitizeUser(user);
      
      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'user',
        created_at: user.created_at,
        updated_at: user.updated_at
      });
      expect(result).not.toHaveProperty('hashed_password');
    });
  });
});
