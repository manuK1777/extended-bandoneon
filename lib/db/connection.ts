import mysql from 'mysql2/promise';

// Create a global pool variable that will be reused across requests
let pool: mysql.Pool | null = null;

export async function getConnectionPool() {
  if (pool) {
    return pool; // Return existing pool if already created
  }

  try {
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
    if (!connectionUrl) {
      throw new Error('Database URL not found in environment variables');
    }

    // We need to use the public URL in both environments because:
    // - Development: Running locally, outside Railway's network
    // - Production: Running on Vercel, also outside Railway's network
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Attempting to parse connection URL...');
    
    try {
      const url = new URL(connectionUrl);
      console.log('Connection URL format valid');
      console.log('Database host:', url.hostname);
      console.log('Using port:', url.port || '3306');
      console.log('Database name:', url.pathname.substring(1));
    } catch (urlError) {
      console.error('Failed to parse URL:', urlError);
      throw urlError;
    }

    console.log('Creating connection pool...');
    // Create a connection pool with appropriate settings
    pool = mysql.createPool({
      uri: connectionUrl,
      connectionLimit: 10, // Adjust based on your application needs
      queueLimit: 0,
      waitForConnections: true
    });
    
    // Test the pool with a ping
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('Pool created and tested successfully');
    
    return pool;
  } catch (error) {
    console.error('Failed to create database connection pool:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV,
      hasUrl: !!(process.env.MYSQL_URL || process.env.DATABASE_URL)
    });
    throw error;
  }
}

// For backward compatibility and legacy code
export async function createConnection() {
  const pool = await getConnectionPool();
  return pool.getConnection();
}

// Helper function to safely close a connection
export async function closeConnection(connection: mysql.PoolConnection | mysql.Connection) {
  try {
    if ('release' in connection) {
      // It's a pool connection
      connection.release();
    } else {
      // It's a regular connection (for backward compatibility)
      await connection.end();
    }
  } catch (error) {
    console.error('Error closing connection:', error);
  }
}
