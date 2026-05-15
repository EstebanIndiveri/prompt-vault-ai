/**
 * Shared in-memory store for users and sessions.
 * Both auth and users modules operate on the same state.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string; // In production: use bcrypt
}

export interface Session {
  userId: number;
  expiresAt: number;
}

export const users: User[] = [
  { id: 1, name: 'Ana García',       email: 'ana@example.com',         role: 'admin', password: 'password123' },
  { id: 2, name: 'Carlos López',     email: 'carlos@example.com',      role: 'user',  password: 'securepass'  },
  { id: 3, name: 'María Rodríguez',  email: 'maria@sub.example.com',   role: 'user',  password: 'maria123'    },
];

export let nextId = 4;
export function incrementNextId(): number {
  return nextId++;
}

export const sessions: Record<string, Session> = {};

/** Removes all active sessions belonging to a given user. */
export function revokeUserSessions(userId: number): void {
  for (const token of Object.keys(sessions)) {
    if (sessions[token].userId === userId) {
      delete sessions[token];
    }
  }
}
