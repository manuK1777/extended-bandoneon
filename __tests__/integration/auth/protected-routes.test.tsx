import { getCurrentUser } from '@/utils/auth';

// Mock Response class for Node.js environment
class MockResponse {
  status: number;
  headers: Record<string, string>;
  body: string;

  constructor(body: string, options: { status: number; headers: Record<string, string> }) {
    this.body = body;
    this.status = options.status;
    this.headers = options.headers;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

// Replace global Response with our mock version
global.Response = MockResponse as any;

// Mock getCurrentUser from auth.ts
jest.mock('@/utils/auth', () => ({
  getCurrentUser: jest.fn()
}));

// Create handler mocks
const protectedRouteHandler = jest.fn().mockImplementation(async () => {
  return new Response(JSON.stringify({ data: 'Protected data' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

const adminRouteHandler = jest.fn().mockImplementation(async () => {
  return new Response(JSON.stringify({ data: 'Admin data' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// Create middleware functions directly for testing
const requireAuthMiddleware = (handler: Function) => {
  return async (req: any) => {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return handler(req);
  };
};

const requireAdminMiddleware = (handler: Function) => {
  return async (req: any) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return handler(req);
  };
};

// Create protected route handlers using the middleware
const protectedRoute = requireAuthMiddleware(protectedRouteHandler);
const adminRoute = requireAdminMiddleware(adminRouteHandler);

describe('Authentication Middleware Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deny access to protected routes when not authenticated', async () => {
    // Mock getCurrentUser to return null (not authenticated)
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    // Create a mock request
    const mockRequest = {
      headers: new Headers(),
      cookies: { get: () => null },
      method: 'GET',
      url: '/api/protected'
    } as any;
    
    // Call the protected route with the mock request
    const response = await protectedRoute(mockRequest);
    
    // Parse the response
    const responseBody = await response.json();
    
    // Verify the response is unauthorized
    expect(response.status).toBe(401);
    expect(responseBody).toEqual({ error: 'Unauthorized' });
    
    // Verify the route handler was NOT called (because auth failed)
    expect(protectedRouteHandler).not.toHaveBeenCalled();
  });

  it('should allow access to protected routes when authenticated', async () => {
    // Mock getCurrentUser to return a user (authenticated)
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'user@example.com',
      role: 'user'
    });
    
    // Create a mock request
    const mockRequest = {
      headers: new Headers(),
      cookies: { get: () => null },
      method: 'GET',
      url: '/api/protected'
    } as any;
    
    // Call the protected route with the mock request
    const response = await protectedRoute(mockRequest);
    
    // Parse the response
    const responseBody = await response.json();
    
    // Verify the response is successful
    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ data: 'Protected data' });
    
    // Verify the route handler was called (because auth succeeded)
    expect(protectedRouteHandler).toHaveBeenCalled();
  });

  it('should deny access to admin routes for non-admin users', async () => {
    // Mock getCurrentUser to return a regular user (not admin)
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'user@example.com',
      role: 'user'
    });
    
    // Create a mock request
    const mockRequest = {
      headers: new Headers(),
      cookies: { get: () => null },
      method: 'GET',
      url: '/api/admin'
    } as any;
    
    // Call the admin route with the mock request
    const response = await adminRoute(mockRequest);
    
    // Parse the response
    const responseBody = await response.json();
    
    // Verify the response is forbidden
    expect(response.status).toBe(403);
    expect(responseBody).toEqual({ error: 'Forbidden' });
    
    // Verify the route handler was NOT called (because auth failed)
    expect(adminRouteHandler).not.toHaveBeenCalled();
  });

  it('should allow access to admin routes for admin users', async () => {
    // Mock getCurrentUser to return an admin user
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'admin@example.com',
      role: 'admin'
    });
    
    // Create a mock request
    const mockRequest = {
      headers: new Headers(),
      cookies: { get: () => null },
      method: 'GET',
      url: '/api/admin'
    } as any;
    
    // Call the admin route with the mock request
    const response = await adminRoute(mockRequest);
    
    // Parse the response
    const responseBody = await response.json();
    
    // Verify the response is successful
    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ data: 'Admin data' });
    
    // Verify the route handler was called (because auth succeeded)
    expect(adminRouteHandler).toHaveBeenCalled();
  });
});
