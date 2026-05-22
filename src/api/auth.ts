import express, { Request, Response, NextFunction } from 'express';
import { validateEmail, generateToken } from '../utils';
import { users, sessions, revokeUserSessions } from '../store';

const router = express.Router();

/**
 * Middleware that verifies a Bearer token and attaches userId to res.locals.
 * Export for use in other routers (e.g. users).
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || !sessions[token]) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (Date.now() > sessions[token].expiresAt) {
    delete sessions[token];
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  res.locals.userId = sessions[token].userId;
  next();
}

/**
 * POST /auth/login
 * Missing: rate limiting (Issue #7 — implement to prevent brute force)
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const user = users.find(u => u.email === email);

  // Missing: no rate limiting — brute force is possible
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(32);
  sessions[token] = {
    userId: user.id,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  res.json({ token });
});

/**
 * POST /auth/logout
 */
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token && sessions[token]) {
    delete sessions[token];
  }

  res.status(204).send();
});

/**
 * GET /auth/me
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === res.locals.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _password, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
