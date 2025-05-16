export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  const { name, email } = await request.json();

  // Check if the user already exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
  }

  if (findError && findError.code !== 'PGRST116') {
    // If there's a database error that's not related to "no rows found," return an error
    return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 });
  }

  // Insert new user with name and email.
  const { error } = await supabase.from('users').insert([
    { name, email },
  ]);

  if (error) {
    return NextResponse.json({ error: 'Failed to register. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
