import { POST } from '@/app/api/auth/login/route';
import { authenticateUser, generateToken } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/utils/auth', () => ({
  authenticateUser: jest.fn(),
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

describe('Login API Route', () => {
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

  it('should return 401 for invalid credentials', async () => {
    // Mock request
    const req = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'wrong-password'
      })
    } as unknown as NextRequest;

    // Mock authenticateUser to return null (invalid credentials)
    (authenticateUser as jest.Mock).mockResolvedValue(null);

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
    expect(authenticateUser).toHaveBeenCalledWith('test@example.com', 'wrong-password');
  });

  it('should return user data and set cookie for valid credentials', async () => {
    // Mock request
    const req = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'correct-password'
      })
    } as unknown as NextRequest;

    // Mock successful authentication
    const mockUser = { 
      id: '123', 
      email: 'test@example.com', 
      role: 'user' 
    };
    (authenticateUser as jest.Mock).mockResolvedValue(mockUser);
    (generateToken as jest.Mock).mockReturnValue('mock-token');

    await POST(req);
    
    // Verify response was called with correct data
    expect(NextResponse.json).toHaveBeenCalled();
    const jsonCallArgs = (NextResponse.json as jest.Mock).mock.calls[0];
    expect(jsonCallArgs[0]).toEqual({
      success: true,
      message: 'Successfully logged in',
      user: mockUser
    });

    // Verify cookie was set
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

  it('should handle errors during login process', async () => {
    // Mock request
    const req = {
      json: jest.fn().mockRejectedValue(new Error('Request parsing error'))
    } as unknown as NextRequest;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: 'Internal server error',
        details: 'Request parsing error'
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
        password: 'password'
      })
    } as unknown as NextRequest;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Authentication not properly configured' },
      { status: 500 }
    );
  });
});
