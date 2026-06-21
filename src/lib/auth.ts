import bcrypt from 'bcryptjs';
import { query } from './db';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: { id: number; username: string; is_admin: number };
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  const users = await query`SELECT id, username, email, password, is_admin FROM users WHERE username = ${username}`;

  if (users.length === 0) {
    return { success: false, error: 'Invalid username or password' };
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return { success: false, error: 'Invalid username or password' };
  }

  return { success: true, user: { id: user.id, username: user.username, is_admin: user.is_admin } };
}

export async function signupUser(username: string, password: string): Promise<AuthResult> {
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const existing = await query`SELECT id FROM users WHERE username = ${username}`;

  if (existing.length > 0) {
    return { success: false, error: 'Username already taken' };
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = await query`
    INSERT INTO users (username, password) VALUES (${username}, ${hashed})
    RETURNING id, username, is_admin
  `;

  return { success: true, user: { id: result[0].id, username: result[0].username, is_admin: result[0].is_admin } };
}
