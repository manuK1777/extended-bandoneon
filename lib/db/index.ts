import { getConnectionPool } from './connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const db = {
  async query<T>(sql: string, values?: (string | number | boolean | null)[]): Promise<T[]> {
    console.log('Executing database query...');
    const pool = await getConnectionPool();
    const [rows] = await pool.query<(T & RowDataPacket)[]>(sql, values);
    return rows as T[];
  },
  
  async execute(sql: string, values?: (string | number | boolean | null)[]): Promise<ResultSetHeader> {
    console.log('Executing database mutation...');
    const pool = await getConnectionPool();
    const [result] = await pool.execute<ResultSetHeader>(sql, values);
    return result;
  }
};
