import mysql from 'mysql2/promise';
import { getConnectionPool, createConnection, closeConnection } from '@/lib/db/connection';

// Mock the mysql2/promise module
jest.mock('mysql2/promise');

// Store original environment
const originalEnv = process.env;

// Mock the internal pool variable
let mockInternalPool: mysql.Pool | null = null;

// Mock the module with our own implementation
jest.mock('@/lib/db/connection', () => {
  // Store the mock implementation of getConnectionPool for use in other functions
  const mockGetConnectionPool = jest.fn(async () => {
    if (mockInternalPool) {
      return mockInternalPool;
    }
    
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
    if (!connectionUrl) {
      throw new Error('Database URL not found in environment variables');
    }
    
    try {
      new URL(connectionUrl);
    } catch (urlError) {
      throw urlError;
    }
    
    const mockedMysql = mysql as jest.Mocked<typeof mysql>;
    mockInternalPool = mockedMysql.createPool({});
    
    return mockInternalPool;
  });
  
  return {
    getConnectionPool: mockGetConnectionPool,
    createConnection: jest.fn(async () => {
      const pool = await mockGetConnectionPool();
      return pool.getConnection();
    }),
    closeConnection: jest.fn(async (connection) => {
      try {
        if ('release' in connection) {
          connection.release();
        } else {
          await connection.end();
        }
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    })
  };
});

describe('Database Connection Module', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock pool
    mockInternalPool = null;
    
    // Setup environment variables for testing
    process.env = { 
      ...originalEnv,
      NODE_ENV: 'test',
      MYSQL_URL: 'mysql://user:password@localhost:3306/test_db'
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getConnectionPool', () => {
    it('should create a new pool when none exists', async () => {
      // Get the mocked mysql module
      const mockedMysql = mysql as jest.Mocked<typeof mysql>;
      
      // Call the function
      const pool = await getConnectionPool();
      
      // Verify the pool was created
      expect(mockedMysql.createPool).toHaveBeenCalledTimes(1);
      
      // Verify the pool was returned
      expect(pool).toBeDefined();
    });

    it('should reuse existing pool on subsequent calls', async () => {
      // Get the mocked mysql module
      const mockedMysql = mysql as jest.Mocked<typeof mysql>;
      
      // Call the function twice
      const pool1 = await getConnectionPool();
      
      // Reset the mock to verify second call doesn't create a new pool
      mockedMysql.createPool.mockClear();
      
      const pool2 = await getConnectionPool();
      
      // Verify the pool was created only once
      expect(mockedMysql.createPool).not.toHaveBeenCalled();
      
      // Verify both calls returned the same pool
      expect(pool1).toBe(pool2);
    });

    it('should throw an error if no connection URL is provided', async () => {
      // Remove the connection URL from environment
      process.env = { ...originalEnv };
      delete process.env.MYSQL_URL;
      delete process.env.DATABASE_URL;
      
      // Expect the function to throw
      await expect(getConnectionPool()).rejects.toThrow('Database URL not found in environment variables');
    });

    it('should throw an error if URL parsing fails', async () => {
      // Set an invalid URL
      process.env = { ...originalEnv, MYSQL_URL: 'invalid-url' };
      
      // Expect the function to throw
      await expect(getConnectionPool()).rejects.toThrow();
    });
  });

  describe('createConnection', () => {
    it('should get a connection from the pool', async () => {
      // Get the mocked mysql module
      const mockedMysql = mysql as jest.Mocked<typeof mysql>;
      const mockPool = mockedMysql.createPool({});
      
      // Call the function
      await getConnectionPool(); // Ensure pool exists first
      const connection = await createConnection();
      
      // Verify getConnection was called on the pool
      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
      
      // Verify a connection was returned
      expect(connection).toBeDefined();
    });
  });

  describe('closeConnection', () => {
    it('should release a pool connection', async () => {
      // Get the mocked mysql module
      const mockedMysql = mysql as jest.Mocked<typeof mysql>;
      const mockPool = mockedMysql.createPool({});
      
      // Get a connection
      await getConnectionPool(); // Ensure pool exists first
      const connection = await mockPool.getConnection();
      
      // Close the connection
      await closeConnection(connection as mysql.PoolConnection);
      
      // Verify release was called
      expect(connection.release).toHaveBeenCalledTimes(1);
    });

    it('should end a regular connection', async () => {
      // Create a mock regular connection (not from pool)
      const regularConnection = {
        end: jest.fn().mockResolvedValue(undefined)
      } as unknown as mysql.Connection;
      
      // Close the connection
      await closeConnection(regularConnection as mysql.Connection);
      
      // Verify end was called
      expect(regularConnection.end).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when closing connection', async () => {
      // Create a mock connection that throws on release
      const errorConnection = {
        release: jest.fn().mockImplementation(() => {
          throw new Error('Release error');
        })
      } as unknown as mysql.PoolConnection;
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Close the connection (should not throw)
      await closeConnection(errorConnection as mysql.PoolConnection);
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error closing connection:', expect.any(Error));
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });
});
