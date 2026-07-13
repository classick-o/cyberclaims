// Image upload: accept, verify, re-encode, store.
//
// Three defences, in order:
//   1. multer keeps the file in memory with a hard size cap — nothing untrusted ever
//      touches the disk under a name we didn't choose.
//   2. file-type sniffs the actual magic bytes. An extension is a claim, not evidence;
//      `payload.php.jpg` is a real technique.
//   3. sharp RE-ENCODES to WebP. This is the one that matters: it rebuilds the image
//      from decoded pixels, so any polyglot payload, EXIF-smuggled script or appended
//      archive simply does not survive into the stored file.
//
// Filenames are random. The original name is kept in the database for the librarian,
// never on disk — a user-controlled path is a directory-traversal invitation.

import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { env } from '../config/env.js';

const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const WIDTHS = [480, 960, 1600];

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
}).single('file');

/** Turns multer's error codes into the { field, message } shape the admin renders. */
export function handleUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `That image is larger than ${env.MAX_UPLOAD_MB} MB.`
        : 'Upload failed.';
    return res.status(400).json({ success: false, errors: [{ field: 'file', message }] });
  }
  next(err);
}

export async function processImage(buffer, originalName) {
  const sniffed = await fileTypeFromBuffer(buffer);
  if (!sniffed || !ACCEPTED.has(sniffed.mime)) {
    const err = new Error('That file is not an image we can process (JPEG, PNG, WebP, AVIF or GIF).');
    err.status = 400;
    err.field = 'file';
    throw err;
  }

  const now = new Date();
  const dir = join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'));
  await mkdir(join(env.UPLOAD_DIR, dir), { recursive: true });

  const id = randomBytes(8).toString('hex');
  // .rotate() with no argument applies the EXIF orientation and then discards the
  // EXIF block — which is also where GPS coordinates live. Photos of a scam victim's
  // screen should not ship their home address to the internet.
  const { width = 0, height = 0 } = await sharp(buffer, { animated: false }).rotate().metadata();

  // Never upscale — but never truncate either. A 1200px source gets 480/960/1200,
  // not 480/960: capping at the second-largest step would mean the biggest file we
  // serve is smaller than the file we were given, and a hero cover on a wide screen
  // would be a 960px image stretched to fill it.
  const targets = [...new Set(WIDTHS.filter((w) => w < width).concat(Math.min(width, Math.max(...WIDTHS))))]
    .filter((w) => w > 0)
    .sort((a, b) => a - b);

  const variants = {};
  let largest = null;
  let bytes = 0;

  for (const w of targets) {
    const out = await sharp(buffer, { animated: false })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const rel = `/uploads/${dir.replace(/\\/g, '/')}/${id}-${w}.webp`;
    await writeFile(join(env.UPLOAD_DIR, dir, `${id}-${w}.webp`), out);

    variants[w] = rel;
    largest = rel; // targets is ascending, so this ends up as the biggest
    bytes = out.length;
  }

  return {
    filename: originalName,
    path: largest,
    variants,
    mime: 'image/webp',
    width: Math.min(width, Math.max(...WIDTHS)),
    height: Math.round(height * (Math.min(width, Math.max(...WIDTHS)) / (width || 1))),
    bytes,
  };
}
