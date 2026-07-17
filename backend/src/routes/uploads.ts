import { randomUUID } from 'crypto';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { msg } from '../i18n';
import { authenticate, authorize } from '../middleware/auth';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    cb(null, randomUUID() + (EXT[file.mimetype] ?? ''));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new Error(msg.invalidFileType));
      return;
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

uploadsRouter.post(
  '/',
  authenticate,
  authorize('seller'),
  (req, res, next) => {
    upload.single('image')(req, res, (err: unknown) => {
      if (err) {
        res.status(400).json({ message: err instanceof Error ? err.message : msg.invalidRequest });
        return;
      }
      if (!req.file) {
        res.status(400).json({ message: msg.fileRequired });
        return;
      }
      res.status(201).json({ url: `/uploads/${req.file.filename}` });
    });
    void next;
  },
);
