'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';

export async function checkBookExists(googleId?: string, title?: string, author?: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { exists: false, status: null };
  }

  let existingBook: { id: string; status: string; times_read: number } | null = null;

  if (googleId) {
    const { data, error } = await supabase
      .from('books')
      .select('id, status, times_read')
      .eq('user_id', user.id)
      .eq('google_id', googleId)
      .limit(1)
      .maybeSingle();
    
    // If error is not "not found", log it but continue
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking book by google_id:', error);
    }
    
    existingBook = data;
  }

  if (!existingBook && title && author) {
    const { data, error } = await supabase
      .from('books')
      .select('id, status, times_read')
      .eq('user_id', user.id)
      .eq('title', title)
      .eq('author', author)
      .limit(1)
      .maybeSingle();
    
    // If error is not "not found", log it but continue
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking book by title/author:', error);
    }
    
    existingBook = data;
  }

  return {
    exists: !!existingBook,
    status: existingBook?.status || null,
    id: existingBook?.id || null
  };
}

interface BookData {
  title: string;
  author: string;
  cover_url?: string;
  pdf_url?: string;
  category?: string;
  google_id?: string;
  total_pages?: number;
}

export async function saveBookToVault(book: BookData) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check for duplicates: existing book with same google_id or title+author for this user
  let existingBooks: Array<{ id: string; status: string; times_read: number; google_id?: string }> = [];
  
  if (book.google_id) {
    const { data: byGoogleId, error: googleIdError } = await supabase
      .from('books')
      .select('id, status, times_read, google_id')
      .eq('user_id', user.id)
      .eq('google_id', book.google_id)
      .limit(1);
    
    // If column doesn't exist, the error will be caught, but we'll fall back to title/author check
    if (googleIdError) {
      console.warn('google_id column may not exist, falling back to title/author check:', googleIdError.message);
    } else if (byGoogleId && byGoogleId.length > 0) {
      existingBooks = byGoogleId;
    }
  }
  
  // Also check by title + author if no google_id match or if google_id column doesn't exist
  if (existingBooks.length === 0) {
    const { data: byTitleAuthor, error: titleAuthorError } = await supabase
      .from('books')
      .select('id, status, times_read')
      .eq('user_id', user.id)
      .eq('title', book.title)
      .eq('author', book.author)
      .limit(1);
    
    if (titleAuthorError) {
      console.error('Error checking book by title/author:', titleAuthorError);
    } else if (byTitleAuthor && byTitleAuthor.length > 0) {
      existingBooks = byTitleAuthor;
    }
  }

  if (existingBooks && existingBooks.length > 0) {
    const existing = existingBooks[0];
    
    // If book exists in 'to-read' or 'reading', don't allow duplicate
    if (existing.status === 'to-read' || existing.status === 'reading') {
      return { success: false, error: "Book already in your library" };
    }
    
    // If book exists in 'finished', increment times_read and reset to 'to-read'
    if (existing.status === 'finished') {
      const { error } = await supabase
        .from('books')
        .update({
          times_read: (existing.times_read || 1) + 1,
          status: 'to-read',
          current_page: 0,
          started_at: null,
          completed_at: null
        })
        .eq('id', existing.id)
        .eq('user_id', user.id);
      
      if (error) {
        return { success: false, error: error.message };
      }
      revalidatePath('/');
      return { success: true, reRead: true };
    }
  }

  // Insert new book
  // Only include google_id if it exists (to avoid errors if column doesn't exist yet)
  const insertData: Record<string, unknown> = {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url || null,
    pdf_url: book.pdf_url || null,
    category: book.category || 'Uncategorized',
    user_id: user.id,
    status: 'to-read',
    current_page: 0,
    times_read: 1,
    total_pages: book.total_pages || 0
  };
  
  // Only add google_id if it's provided (and column exists)
  if (book.google_id) {
    insertData.google_id = book.google_id;
  }
  
  const { error } = await supabase
    .from('books')
    .insert([insertData]);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/');
  return { success: true };
}

export async function updateBookStatus(id: string, status: string) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const updateData: { status: string; started_at?: string; completed_at?: string } = { status };
  
  if (status === 'reading') {
    updateData.started_at = new Date().toISOString();
    
    // CRITICAL: Move any other book with status 'reading' for THIS USER back to 'to-read'
    await supabase
      .from('books')
      .update({ status: 'to-read' })
      .eq('status', 'reading')
      .eq('user_id', user.id)
      .neq('id', id); // Don't update the book we're about to set to reading
  } 
  
  if (status === 'finished') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user can only update their own books

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteBook(id: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user can only delete their own books

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/'); 
  return { success: true };
}

export async function updateProgress(id: string, page: number) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from('books')
    .update({ current_page: page })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/');
  return { success: true };
}

export async function updateTotalPages(id: string, totalPages: number) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  if (totalPages < 0) {
    return { success: false, error: "Total pages must be a positive number" };
  }

  const { error } = await supabase
    .from('books')
    .update({ total_pages: totalPages })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/');
  return { success: true };
}

export async function updateBookCount(id: string, newCount: number) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from('books')
    .update({ 
      times_read: newCount,
      status: 'to-read',
      current_page: 0,
      started_at: null,
      completed_at: null
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function updateNotes(id: string, notes: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from('books')
    .update({ notes })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/');
  return { success: true };
}
