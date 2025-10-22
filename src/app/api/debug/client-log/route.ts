import { NextRequest, NextResponse } from 'next/server';
import { writeLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { event = 'client.log', details = {} } = body || {};
    await writeLog(String(event), { from: 'client', ...details });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await writeLog('client.log.error', { error: String(err) });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
