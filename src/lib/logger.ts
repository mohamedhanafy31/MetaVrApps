import { promises as fs } from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

async function ensureLogDir(): Promise<void> {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch {}
}

export async function writeLog(event: string, details: Record<string, unknown> = {}): Promise<void> {
  try {
    await ensureLogDir();
    const entry = {
      ts: new Date().toISOString(),
      event,
      ...details,
    };
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('writeLog error', err);
  }
}

export const LOGGER_PATHS = { LOG_DIR, LOG_FILE };
