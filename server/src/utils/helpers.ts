import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export function generateId(): string {
  return uuidv4();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function isValidImageType(mimetype: string): boolean {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  return allowed.includes(mimetype);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}
