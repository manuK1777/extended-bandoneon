import { createConnection, closeConnection } from './connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const db = {
  async query<T>(sql: string, values?: (string | number | boolean | null)[]): Promise<T[]> {
    const connection = await createConnection();
    try {
      // Use query for SELECT statements instead of execute
      const [rows] = await connection.query<(T & RowDataPacket)[]>(sql, values);
      return rows as T[];
    } finally {
      await closeConnection(connection);
    }
  },
  
  async execute(sql: string, values?: (string | number | boolean | null)[]): Promise<ResultSetHeader> {
    const connection = await createConnection();
    try {
      const [result] = await connection.execute<ResultSetHeader>(sql, values);
      return result;
    } finally {
      await closeConnection(connection);
    }
  }
};
