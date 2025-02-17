import mysql from 'mysql2/promise';

export async function createConnection() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    return connection;
  } catch (error) {
    console.error('Failed to create database connection:', error);
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
