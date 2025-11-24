import { NextResponse } from "next/server";
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW() as time");
    return NextResponse.json({
      connected: true,
      time: result.rows[0].time,
    });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
