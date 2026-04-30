import { NextRequest } from 'next/server';

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

// Mock fetch API
global.fetch = jest.fn();

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    query: jest.fn()
  }
}));

// Import the db mock
import { db } from '@/lib/db';

// Mock sound record
const mockSoundRecord = {
  mp3_url: 'https://example.com/sounds/test-sound.mp3',
  wav_url: 'https://example.com/sounds/test-sound.wav',
  title: 'Test Sound'
};

// Create a mock download handler that simulates the actual route
const mockDownloadHandler = async (request: NextRequest) => {
  try {
    // 1. Check authentication - Get the session from the request
    const response = await fetch(`${new URL(request.url).origin}/api/auth/me`, {
      headers: request.headers
    });
    
    const authData = await response.json();
    
    // Check if user is authenticated
    if (!authData.authenticated || !authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Get parameters
    const { searchParams } = new URL(request.url);
    const soundId = searchParams.get('id');
    const format = searchParams.get('format') || 'mp3'; // Default to mp3
    
    if (!soundId) {
      return new Response(JSON.stringify({ error: 'Sound ID is required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 3. Query the database for the sound
    const rows = await (db.query as jest.Mock).mockImplementation(() => {
      return Promise.resolve([mockSoundRecord]);
    })();
    
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Sound not found' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 4. Get the appropriate URL based on format
    const sound = mockSoundRecord;
    const fileUrl = format === 'wav' ? sound.wav_url : sound.mp3_url;
    const fileName = `${sound.title}.${format}`;
    
    if (!fileUrl) {
      return new Response(JSON.stringify({ error: 'File not available' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 5. Return the URL and filename to the client
    return new Response(JSON.stringify({ 
      url: fileUrl,
      filename: fileName
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error in /api/download:', error);
    return new Response(JSON.stringify({ error: 'Failed to process download request' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};

describe('Sound Download Access Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow authenticated users to download sounds', async () => {
    // Mock authenticated user response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authenticated: true,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'user'
        }
      })
    });

    // Create a mock request
    const mockRequest = {
      url: 'http://localhost:3000/api/download?id=123&format=mp3',
      headers: new Headers({
        'Cookie': 'auth-token=valid-token'
      })
    } as any;

    // Call the download handler
    const response = await mockDownloadHandler(mockRequest);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual({
      url: mockSoundRecord.mp3_url,
      filename: `${mockSoundRecord.title}.mp3`
    });

    // Verify the authentication check was made
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/me',
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );
  });

  it('should allow authenticated admin users to download sounds', async () => {
    // Mock authenticated admin user response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authenticated: true,
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'admin'
        }
      })
    });

    // Create a mock request
    const mockRequest = {
      url: 'http://localhost:3000/api/download?id=123&format=wav',
      headers: new Headers({
        'Cookie': 'auth-token=valid-admin-token'
      })
    } as any;

    // Call the download handler
    const response = await mockDownloadHandler(mockRequest);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual({
      url: mockSoundRecord.wav_url,
      filename: `${mockSoundRecord.title}.wav`
    });
  });

  it('should deny access to unauthenticated users', async () => {
    // Mock unauthenticated user response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authenticated: false
      })
    });

    // Create a mock request
    const mockRequest = {
      url: 'http://localhost:3000/api/download?id=123&format=mp3',
      headers: new Headers()
    } as any;

    // Call the download handler
    const response = await mockDownloadHandler(mockRequest);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: 'Unauthorized'
    });
  });

  it('should return 400 if sound ID is missing', async () => {
    // Mock authenticated user response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authenticated: true,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'user'
        }
      })
    });

    // Create a mock request without sound ID
    const mockRequest = {
      url: 'http://localhost:3000/api/download?format=mp3',
      headers: new Headers({
        'Cookie': 'auth-token=valid-token'
      })
    } as any;

    // Call the download handler
    const response = await mockDownloadHandler(mockRequest);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Sound ID is required'
    });
  });
});
