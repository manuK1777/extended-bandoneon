import { POST } from '@/app/api/auth/register/route';
import { findUserByEmail, createUser } from '@/lib/db/models/user';
import { generateToken } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/db/models/user', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn()
}));

jest.mock('@/utils/auth', () => ({
  generateToken: jest.fn()
}));

// Mock NextResponse
const mockCookieSet = jest.fn();
const mockJsonResponse = {
  cookies: {
    set: mockCookieSet
  }
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      return {
        ...mockJsonResponse,
        ...data,
        status: options?.status
      };
    })
  }
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Register API Route', () => {
  // Store original environment variables
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Use object assignment instead of directly modifying process.env properties
    process.env = { 
      ...originalEnv,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test'
    };
  });
  
  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should return 400 for invalid request body', async () => {
    // Mock request with invalid body
    const req = {
      json: jest.fn().mockResolvedValue({
        // Missing password
        email: 'test@example.com'
      })
    } as unknown as NextRequest;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  });

  it('should return 409 if email is already in use', async () => {
    // Mock request
    const req = {
      json: jest.fn().mockResolvedValue({
        email: 'existing@example.com',
        password: 'password123'
      })
    } as unknown as NextRequest;

    // Mock findUserByEmail to return an existing user
    (findUserByEmail as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'existing@example.com',
      role: 'user'
    });

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Email already in use' },
      { status: 409 }
    );
    expect(findUserByEmail).toHaveBeenCalledWith('existing@example.com');
    expect(createUser).not.toHaveBeenCalled();
  });

  it('should create user and set cookie for valid registration', async () => {
    // Mock request
    const req = {
      json: jest.fn().mockResolvedValue({
        email: 'new@example.com',
        password: 'password123'
      })
    } as unknown as NextRequest;

    // Mock user doesn't exist yet
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    
    // Mock successful user creation
    const mockUser = { 
      id: '456', 
      email: 'new@example.com', 
      role: 'user' 
    };
    (createUser as jest.Mock).mockResolvedValue(mockUser);
    (generateToken as jest.Mock).mockReturnValue('mock-token');

    await POST(req);
    
    // Verify user creation
    expect(findUserByEmail).toHaveBeenCalledWith('new@example.com');
    expect(createUser).toHaveBeenCalledWith('new@example.com', 'password123');
    
    // Verify response was called with correct data
    expect(NextResponse.json).toHaveBeenCalled();
    const jsonCallArgs = (NextResponse.json as jest.Mock).mock.calls[0];
    expect(jsonCallArgs[0]).toEqual({
      success: true,
      message: 'Registration successful',
      user: mockUser
    });

    // Verify token generation and cookie setting
    expect(generateToken).toHaveBeenCalledWith({
      userId: '456',
      email: 'new@example.com',
      role: 'user'
    });
    
    expect(mockCookieSet).toHaveBeenCalledWith(
      'auth_token',
      'mock-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24
      })
    );
  });

  it('should handle errors during registration process', async () => {
    // Mock request
    const req = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'password123'
      })
    } as unknown as NextRequest;

    // Mock user doesn't exist
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    
    // Mock error during user creation
    (createUser as jest.Mock).mockRejectedValue(new Error('Database error'));

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: 'Internal server error',
        details: 'Database error'
      }),
      { status: 500 }
    );
  });

  it('should return error if JWT_SECRET is not configured', async () => {
    // Remove JWT_SECRET
    delete process.env.JWT_SECRET;

    // Mock request
    const req = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'password123'
      })
    } as unknown as NextRequest;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Authentication not properly configured' },
      { status: 500 }
    );
  });
});
