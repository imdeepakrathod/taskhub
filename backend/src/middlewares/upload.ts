import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import multer from 'multer'

import { BadRequestError } from '../common/errors/httpErrors.js'

// Ensure local uploads directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Storage engine: stores files with randomized unique filenames on disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

// Allowed MIME types whitelist: images, docs, pdfs, sheets, archives
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents & text
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
])

export const uploadAttachment = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new BadRequestError(
          'Unsupported file type. Only images, PDFs, office documents, and zip archives are allowed.',
          'INVALID_FILE_TYPE',
        ),
      )
    }
  },
})
