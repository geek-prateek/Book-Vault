import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
  } catch (err) {
    // Suppress AuthApiError if sign out fails due to token issues
    console.warn('Caught error during sign out');
  }

  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}