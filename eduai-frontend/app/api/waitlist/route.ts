import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// This is an API route handler, not a server action
// Server actions should be in app/actions.ts
export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const { email } = await request.json();

    // Basic validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Create table if not exists (Safety check)
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert the email
    await client.query(`
      INSERT INTO waitlist (email) 
      VALUES ($1) 
      ON CONFLICT (email) DO NOTHING
    `, [email]);

    return NextResponse.json({ message: "Successfully added to waitlist" }, { status: 200 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  } finally {
    client.release();
  }
}