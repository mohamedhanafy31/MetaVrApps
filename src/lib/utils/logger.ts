import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

export type LogEvent = {
  ts: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  tag: string;
  data?: Record<string, unknown> | string | null;
};

export function writeLog(event: LogEvent) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    const line = JSON.stringify(event) + '\n';
    fs.appendFileSync(LOG_FILE, line, { encoding: 'utf8' });
  } catch (err) {
    // Fallback to console if file write fails
    console.error('[logger] write failed', err, event);
  }
}

export function info(tag: string, data?: Record<string, unknown> | string | null) {
  writeLog({ ts: new Date().toISOString(), level: 'info', tag, data });
}

export function warn(tag: string, data?: Record<string, unknown> | string | null) {
  writeLog({ ts: new Date().toISOString(), level: 'warn', tag, data });
}

export function error(tag: string, data?: Record<string, unknown> | string | null) {
  writeLog({ ts: new Date().toISOString(), level: 'error', tag, data });
}

export function debug(tag: string, data?: Record<string, unknown> | string | null) {
  writeLog({ ts: new Date().toISOString(), level: 'debug', tag, data });
}
