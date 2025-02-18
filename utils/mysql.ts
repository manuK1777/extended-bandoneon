import mysql from 'mysql2/promise';

export async function getConnection() {
  return await mysql.createConnection(process.env.DATABASE_URL!);
}

export default getConnection;
