import { Router } from 'express';
import { Lead } from '../../models/Lead.js';
import { leadStatusSchema } from '../../schemas/post.schema.js';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/auth.js';
import { sendCsv } from '../../services/csv.js';

export const leads = Router();

leads.get('/', async (req, res, next) => {
  try {
    const { status, source, q, limit, offset } = req.query;
    const { rows, total } = await Lead.list({ status, source, q, limit, offset });
    res.json({ success: true, leads: rows, total });
  } catch (err) {
    next(err);
  }
});

// Export before /:id, or Express matches "export.csv" as an id.
leads.get('/export.csv', async (_req, res, next) => {
  try {
    sendCsv(res, `cyberclaims-leads-${new Date().toISOString().slice(0, 10)}.csv`, await Lead.all(), [
      'id', 'created_at', 'source', 'status', 'full_name', 'email', 'phone', 'country',
      'amount_lost', 'platform_name', 'platform_website', 'first_transaction',
      'last_transaction', 'message', 'locale', 'ip_address',
    ]);
  } catch (err) {
    next(err);
  }
});

leads.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'No such lead.' });
    res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
});

leads.patch('/:id', validate(leadStatusSchema), async (req, res, next) => {
  try {
    const ok = await Lead.setStatus(req.params.id, req.body.status);
    if (!ok) return res.status(404).json({ success: false, message: 'No such lead.' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GDPR erasure. Admin-only, and a hard DELETE.
 *
 * A lead row holds how much money someone lost, to which platform, and when. When a
 * person exercises their right to erasure, "we set a flag" is not erasure.
 */
leads.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const ok = await Lead.remove(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'No such lead.' });
    console.warn(`GDPR erasure: lead #${req.params.id} deleted by ${req.admin.email}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
