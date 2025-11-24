import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

// Initialize the Pool outside the handler to take advantage of warm starts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const { email } = await request.json();

    // 1. Basic Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // 2. Setup Table (Best practice: Run this once in Neon SQL Editor, but this works for MVP)
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Insert Email (Handle duplicates gracefully)
    await client.query(`
      INSERT INTO waitlist (email) 
      VALUES ($1) 
      ON CONFLICT (email) DO NOTHING
    `, [email]);

    return NextResponse.json({ message: "You're on the list!" }, { status: 200 });

  } catch (error) {
    console.error('Neon DB Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    // Release the client back to the pool
    // In serverless, it's crucial to clean up, though the Pool handles the connection lifecycle.
    client.release();
  }
}