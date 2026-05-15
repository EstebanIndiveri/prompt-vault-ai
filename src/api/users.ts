import express from 'express';
import { validateEmail } from '../utils';
import { getPage } from '../utils';
import { users, incrementNextId, revokeUserSessions } from '../store';
import { authenticateToken } from './auth';

const router = express.Router();

/**
 * GET /users
 * BUG: when the users array is empty, this throws instead of returning [].
 * Reproducir: vaciar el array `users` y llamar GET /users.
 */
router.get('/', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const firstUser = users[0]?.name ?? 'none';
  console.log(`Fetching users, first user: ${firstUser}`);

  const paginated = getPage(users, page, pageSize);
  res.json(paginated);
});

/**
 * GET /users/:id
 */
router.get('/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _password, ...safeUser } = user;
  res.json(safeUser);
});

/**
 * POST /users
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'email is required' });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'password is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const newUser = { id: incrementNextId(), name: name.trim(), email, role: role || 'user', password };
    users.push(newUser);

    const { password: _password, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /users/:id
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  revokeUserSessions(id);
  users.splice(index, 1);
  res.status(204).send();
});

export default router;
