'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';

// Generic helper to get authenticated user and client
async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

// Generic helper for standard user-bound table updates
async function performUpdate(id: string, updateData: Record<string, any>, extraResponse: Record<string, any> = {}) {
  const { supabase, user } = await getAuthContext();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/');
  return { success: true, ...extraResponse };
}

export async function checkBookExists(googleId?: string, title?: string, author?: string) {
  const { supabase, user } = await getAuthContext();
  if (!user) return { exists: false, status: null };

  if (googleId) {
    const { data } = await supabase
      .from('books')
      .select('id, status, times_read')
      .eq('user_id', user.id)
      .eq('google_id', googleId)
      .maybeSingle();

    if (data) return { exists: true, status: data.status, id: data.id };
  }

  if (title && author) {
    const { data } = await supabase
      .from('books')
      .select('id, status, times_read')
      .eq('user_id', user.id)
      .eq('title', title)
      .eq('author', author)
      .maybeSingle();

    if (data) return { exists: true, status: data.status, id: data.id };
  }

  return { exists: false, status: null, id: null };
}

export async function checkMultipleBooksExist(books: Array<{ google_id?: string; title?: string; author?: string }>) {
  const { supabase, user } = await getAuthContext();
  if (!user) return books.map(() => ({ exists: false, status: null }));

  const googleIds = books.map(b => b.google_id).filter(Boolean) as string[];
  let existingBooks: Array<{ status: string; times_read: number; google_id?: string; title?: string; author?: string }> = [];

  if (googleIds.length > 0) {
    const { data } = await supabase
      .from('books')
      .select('status, times_read, google_id, title, author')
      .eq('user_id', user.id)
      .in('google_id', googleIds);

    if (data) existingBooks = data;
  }

  return books.map(book => {
    let match = book.google_id ? existingBooks.find(eb => eb.google_id === book.google_id) : undefined;
    if (!match && book.title && book.author) {
      match = existingBooks.find(eb => eb.title === book.title && eb.author === book.author);
    }

    return {
      exists: !!match,
      status: match?.status || null
    };
  });
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

export async function saveBookToVault(book: BookData): Promise<{ success: boolean; error?: string; reRead?: boolean }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { success: false, error: "Not authenticated" };

  let existingBook: { id: string; status: string; times_read: number; google_id?: string } | null = null;

  if (book.google_id) {
    const { data } = await supabase
      .from('books')
      .select('id, status, times_read, google_id')
      .eq('user_id', user.id)
      .eq('google_id', book.google_id)
      .maybeSingle();

    existingBook = data;
  }

  if (!existingBook && book.title && book.author) {
    const { data } = await supabase
      .from('books')
      .select('id, status, times_read')
      .eq('user_id', user.id)
      .eq('title', book.title)
      .eq('author', book.author)
      .maybeSingle();

    existingBook = data;
  }

  if (existingBook) {
    if (existingBook.status === 'to-read' || existingBook.status === 'reading') {
      return { success: false, error: "Book already in your library" };
    }

    if (existingBook.status === 'finished') {
      return performUpdate(existingBook.id, {
        times_read: (existingBook.times_read || 1) + 1,
        status: 'to-read',
        current_page: 0,
        started_at: null,
        completed_at: null
      }, { reRead: true });
    }
  }

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
    total_pages: book.total_pages || 0,
    hidden_from_profile: false
  };

  if (book.google_id) {
    insertData.google_id = book.google_id;
  }

  const { error } = await supabase.from('books').insert([insertData]);
  if (error) return { success: false, error: error.message };

  revalidatePath('/');
  return { success: true };
}

export async function updateBookStatus(id: string, status: string) {
  const { supabase, user } = await getAuthContext();
  if (!user) return { success: false, error: "Not authenticated" };

  const updateData: { status: string; started_at?: string; completed_at?: string; hidden_from_profile?: boolean } = { status };

  if (status === 'reading') {
    updateData.started_at = new Date().toISOString();

    // CRITICAL: Move any other book with status 'reading' for THIS USER back to 'to-read'
    await supabase
      .from('books')
      .update({ status: 'to-read' })
      .eq('status', 'reading')
      .eq('user_id', user.id)
      .neq('id', id);
  }

  if (status === 'finished') {
    updateData.completed_at = new Date().toISOString();
    updateData.hidden_from_profile = false; // By default, finished books are public
  }

  return performUpdate(id, updateData);
}

export async function deleteBook(id: string) {
  const { supabase, user } = await getAuthContext();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/');
  return { success: true };
}

export async function updateProgress(id: string, page: number) {
  return performUpdate(id, { current_page: page });
}

export async function updateTotalPages(id: string, totalPages: number) {
  if (totalPages < 0) return { success: false, error: "Total pages must be a positive number" };
  return performUpdate(id, { total_pages: totalPages });
}

export async function updateBookCount(id: string, newCount: number) {
  return performUpdate(id, {
    times_read: newCount,
    status: 'to-read',
    current_page: 0,
    started_at: null,
    completed_at: null
  });
}

export async function updateNotes(id: string, notes: string) {
  return performUpdate(id, { notes });
}

export async function toggleBookVisibility(id: string) {
  const { supabase, user } = await getAuthContext();
  if (!user) return { success: false, error: "Not authenticated" };

  // Get current visibility state
  const { data: book } = await supabase
    .from('books')
    .select('hidden_from_profile')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!book) return { success: false, error: "Book not found" };

  return performUpdate(id, { hidden_from_profile: !book.hidden_from_profile });
}
