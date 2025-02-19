import mysql from 'mysql2/promise';

export async function createConnection() {
  try {
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
    if (!connectionUrl) {
      throw new Error('MYSQL_URL or DATABASE_URL environment variable is not set');
    }

    const connection = await mysql.createConnection(connectionUrl);

    // Test the connection
    await connection.ping();
    
    return connection;
  } catch (error) {
    console.error('Failed to create database connection:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV,
      hasUrl: !!process.env.MYSQL_URL || !!process.env.DATABASE_URL
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
