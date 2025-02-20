import { createConnection, closeConnection } from './connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const db = {
  async query<T extends RowDataPacket>(sql: string, values?: (string | number | boolean | null)[]): Promise<T[]> {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<T[]>(sql, values);
      return rows;
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
