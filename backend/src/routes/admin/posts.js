import { Router } from 'express';
import { Post } from '../../models/Post.js';
import { postSchema, statusSchema } from '../../schemas/post.schema.js';
import { validate } from '../../middleware/validate.js';
import { invalidateContent } from '../../services/contentCache.js';
import { asUserError } from '../../services/dbErrors.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, q, limit, offset } = req.query;
    const { rows, total } = await Post.listAdmin({ status, q, limit, offset });
    res.json({ success: true, posts: rows, total });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAdmin(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'No such post.' });
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(postSchema), async (req, res, next) => {
  try {
    const id = await Post.save(req.body);
    invalidateContent();
    res.status(201).json({ success: true, id });
  } catch (err) {
    next(asUserError(err));
  }
});

router.put('/:id', validate(postSchema), async (req, res, next) => {
  try {
    await Post.save({ ...req.body, id: Number(req.params.id) });
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(asUserError(err));
  }
});

// Publish / unpublish / archive. Separate from the editor's save so the list view can
// flip a post live without loading and re-submitting the whole body.
router.post('/:id/status', validate(statusSchema), async (req, res, next) => {
  try {
    await Post.setStatus(req.params.id, req.body.status);
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Post.remove(req.params.id);
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
