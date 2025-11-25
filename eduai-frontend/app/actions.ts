'use server';

import { neon } from '@neondatabase/serverless';

export async function addToWaitlist(formData: FormData) {
  console.log('addToWaitlist server action called'); // Debug log
  const email = formData.get('email');
  console.log('Email from formData:', email); // Debug log
  
  // Basic validation
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.log('Validation failed for email:', email); // Debug log
    throw new Error('Invalid email address');
  }

  try {
    console.log(`Attempting to add ${email} to Neon DB...`); // Debug log
    
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    console.log('Connected to Neon database'); // Debug log

    // Create table if not exists (Safety check)
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Table check/creation completed'); // Debug log

    // Insert the email
    // ON CONFLICT DO NOTHING handles duplicates silently
    await sql`INSERT INTO waitlist (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
    console.log("Successfully inserted into DB"); // Debug log
    
    return { success: true, message: 'Successfully added to waitlist' };
  } catch (error) {
    console.error('Database error in addToWaitlist:', error);
    throw new Error('Failed to add email to waitlist. Please try again.');
  }
}