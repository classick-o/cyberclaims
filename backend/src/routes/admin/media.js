import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Router } from 'express';
import { Media } from '../../models/Media.js';
import { env } from '../../config/env.js';
import { uploadImage, handleUploadErrors, processImage } from '../../middleware/upload.js';
import { invalidateContent } from '../../services/contentCache.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, locale = 'en' } = req.query;
    res.json({ success: true, media: await Media.list({ limit, offset, locale }) });
  } catch (err) {
    next(err);
  }
});

router.post('/', uploadImage, handleUploadErrors, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: [{ field: 'file', message: 'Choose an image to upload.' }],
      });
    }

    const processed = await processImage(req.file.buffer, req.file.originalname);
    const id = await Media.create({
      ...processed,
      alt: req.body.alt ?? null,
      locale: req.body.locale ?? 'en',
    });

    res.status(201).json({ success: true, media: await Media.findById(id) });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({
        success: false,
        errors: [{ field: err.field ?? 'file', message: err.message }],
      });
    }
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    await Media.setAlt(req.params.id, req.body.locale ?? 'en', String(req.body.alt ?? '').slice(0, 500));
    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const media = await Media.remove(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'No such image.' });

    // Delete the row first, then the files. If a file is already gone, that's fine —
    // an orphaned row would be worse than an orphaned file (a broken <img> on a live
    // article vs. a few stray KB on disk).
    for (const rel of Object.values(media.variants ?? {})) {
      await unlink(join(env.UPLOAD_DIR, rel.replace(/^\/uploads\//, ''))).catch(() => {});
    }

    invalidateContent();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
