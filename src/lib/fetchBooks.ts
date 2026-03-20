// src/lib/fetchBooks.ts
import { createClient } from './supabase-server';

export async function getMyLibrary() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id) // CRITICAL: Only fetch books for this user
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching library:", error);
    return [];
  }
  return data || [];
}