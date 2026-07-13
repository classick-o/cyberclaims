import { Router } from 'express';
import { pingDatabase } from '../../config/database.js';

const router = Router();

// Returns whether we're up, and nothing else.
//
// TBSBV's equivalent leaks DB_HOST, DB_USER, DB_NAME, the password's length and its
// first three characters — to anyone who asks. It's been in production since the
// comment saying "remove after DB is working" was written. Don't add fields here.
router.get('/', async (_req, res) => {
  try {
    await pingDatabase();
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

export default router;
