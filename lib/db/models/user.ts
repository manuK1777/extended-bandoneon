import { db } from '../index';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  hashed_password: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await db.query<User>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return users.length > 0 ? users[0] : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await db.query<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return users.length > 0 ? users[0] : null;
}

export async function createUser(email: string, password: string, role: UserRole = 'user'): Promise<UserWithoutPassword> {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(password, salt);
  
  const id = uuidv4();
  
  await db.execute(
    'INSERT INTO users (id, email, hashed_password, role) VALUES (?, ?, ?, ?)',
    [id, email, hashed_password, role]
  );
  
  const user = await findUserById(id);
  if (!user) {
    throw new Error('Failed to create user');
  }
  
  // Return user without password
  const { hashed_password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return await bcrypt.compare(password, user.hashed_password);
}

export function sanitizeUser(user: User): UserWithoutPassword {
  const { hashed_password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
