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
  email_verified?: boolean;
  email_verified_at?: Date;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
  email_verified?: boolean;
  email_verified_at?: Date;
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
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
  return userWithoutPassword;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return await bcrypt.compare(password, user.hashed_password);
}

export function sanitizeUser(user: User): UserWithoutPassword {
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
    email_verified: user.email_verified,
    email_verified_at: user.email_verified_at
  };
  return userWithoutPassword;
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(newPassword, salt);
  
  const now = new Date();
  
  await db.execute(
    'UPDATE users SET hashed_password = ?, updated_at = ? WHERE id = ?',
    [hashed_password, now.toISOString().slice(0, 19).replace('T', ' '), userId]
  );
}
