import mysql from 'mysql2/promise';

export async function createConnection() {
  try {
    let connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
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

    console.log('Creating connection...');
    const connection = await mysql.createConnection(connectionUrl);
    console.log('Connection created, testing with ping...');

    // Test the connection
    await connection.ping();
    console.log('Ping successful, connection is working');
    
    return connection;
  } catch (error) {
    console.error('Failed to create database connection:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV,
      hasUrl: !!(process.env.MYSQL_URL || process.env.DATABASE_URL)
    });
    throw error;
  }
}

// Helper function to safely close a connection
export async function closeConnection(connection: mysql.Connection) {
  try {
    await connection.end();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
