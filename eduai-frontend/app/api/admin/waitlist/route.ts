import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const client = await pool.connect();

  try {
    // Direct query - No password check
    const { rows } = await client.query(`
      SELECT * FROM waitlist 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ data: rows }, { status: 200 });

  } catch (error) {
    console.error('Admin Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}