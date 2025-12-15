import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM expenses ORDER BY id DESC LIMIT 5');
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('DB Test Error:', err);
    return NextResponse.json({ error: 'DB connection failed' }, { status: 500 });
  }
}
