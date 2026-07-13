import { Router } from 'express';
import { Category, Author } from '../../models/Taxonomy.js';
import { categorySchema, authorSchema } from '../../schemas/post.schema.js';
import { validate } from '../../middleware/validate.js';
import { slugify } from '../../services/content.js';
import { invalidateContent } from '../../services/contentCache.js';

export const categories = Router();

categories.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, categories: await Category.list(req.query.locale ?? 'en') });
  } catch (err) {
    next(err);
  }
});

const withSlugs = (translations) =>
  Object.fromEntries(
    Object.entries(translations).map(([locale, t]) => [
      locale,
      { name: t.name, slug: slugify(t.slug || t.name) },
    ])
  );

categories.post('/', validate(categorySchema), async (req, res, next) => {
  try {
    const id = await Category.create({ ...req.body, translations: withSlugs(req.body.translations) });
    invalidateContent();
    res.status(201).json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

categories.put('/:id', validate(categorySchema), async (req, res, next) => {
  try {
    await Category.update(req.params.id, { ...req.body, translations: withSlugs(req.body.translations) });
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

categories.delete('/:id', async (req, res, next) => {
  try {
    await Category.remove(req.params.id);
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export const authors = Router();

authors.get('/', async (_req, res, next) => {
  try {
    res.json({ success: true, authors: await Author.list() });
  } catch (err) {
    next(err);
  }
});

authors.post('/', validate(authorSchema), async (req, res, next) => {
  try {
    const id = await Author.create(req.body);
    invalidateContent();
    res.status(201).json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

authors.put('/:id', validate(authorSchema), async (req, res, next) => {
  try {
    await Author.update(req.params.id, req.body);
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authors.delete('/:id', async (req, res, next) => {
  try {
    await Author.remove(req.params.id);
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
