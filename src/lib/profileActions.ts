'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';

// Type definitions
export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  youtube_url: string | null;
  created_at: string;
}

export interface ConqueredBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  category: string;
  completed_at: string | null;
  times_read: number;
}

export interface ProfileStats {
  totalBooksRead: number;
  totalPagesRead: number;
  topCategories: { category: string; count: number }[];
  weeklyVolume: { week: string; pages: number }[];
  conqueredBooks: ConqueredBook[];
  deepFocusScore: number;
  badge: { name: string; tier: string; emoji: string };
}

export interface ProfileData {
  profile: UserProfile;
  stats: ProfileStats;
}

// Badge tier calculation
function getBadge(totalBooksRead: number): { name: string; tier: string; emoji: string } {
  if (totalBooksRead >= 50) return { name: 'Sage', tier: 'legendary', emoji: '🧙' };
  if (totalBooksRead >= 25) return { name: 'Scholar', tier: 'epic', emoji: '🎓' };
  if (totalBooksRead >= 10) return { name: 'Bookworm', tier: 'rare', emoji: '🐛' };
  if (totalBooksRead >= 3) return { name: 'Reader', tier: 'uncommon', emoji: '📖' };
  if (totalBooksRead >= 1) return { name: 'Starter', tier: 'common', emoji: '🌱' };
  return { name: 'Newcomer', tier: 'none', emoji: '👋' };
}

// Compute pages read per week over last 12 weeks
function computeWeeklyVolume(books: { completed_at: string | null; total_pages: number; times_read: number; status: string }[]): { week: string; pages: number }[] {
  const now = new Date();
  const weeks: { week: string; pages: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const label = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const pagesThisWeek = books
      .filter(b => {
        if (!b.completed_at || b.status !== 'finished') return false;
        const completedDate = new Date(b.completed_at);
        return completedDate >= weekStart && completedDate < weekEnd;
      })
      .reduce((sum, b) => sum + (b.total_pages || 0) * (b.times_read || 1), 0);

    weeks.push({ week: label, pages: pagesThisWeek });
  }

  return weeks;
}

/**
 * Gets the profile for the currently authenticated user.
 * Useful for the profile editing page.
 */
export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { profile: null };

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { profile: data as UserProfile | null };
}

/**
 * Updates the currently logged in user's profile.
 */
export async function updateMyProfile(updateData: {
  username: string;
  display_name: string;
  bio: string;
  linkedin_url?: string;
  github_url?: string;
  youtube_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "Not authenticated" };

  // Format username (lowercase, strictly alphanumeric/dashes)
  const formattedUsername = updateData.username.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (formattedUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters long." };
  }

  // Check if username is already taken by someone else
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', formattedUsername)
    .maybeSingle();

  if (existingUser && existingUser.id !== user.id) {
    return { success: false, error: "Username is already taken." };
  }

  // Upsert the profile
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: formattedUsername,
      display_name: updateData.display_name,
      bio: updateData.bio,
      linkedin_url: updateData.linkedin_url || null,
      github_url: updateData.github_url || null,
      youtube_url: updateData.youtube_url || null,
    });

  if (error) return { success: false, error: error.message };

  revalidatePath('/profile/edit');
  revalidatePath(`/${formattedUsername}`);
  
  return { success: true, username: formattedUsername };
}

/**
 * Gets a public profile and aggregates its reading statistics.
 */
export async function getPublicProfile(username: string): Promise<{ profile: UserProfile | null; stats: ProfileStats | null }> {
  const supabase = await createClient();
  
  // 1. Fetch the user profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  if (!profile) return { profile: null, stats: null };

  // 2. Fetch all books for this user (full data for Shelf + stats)
  const { data: books } = await supabase
    .from('books')
    .select('id, title, author, cover_url, category, completed_at, times_read, status, total_pages, hidden_from_profile, started_at')
    .eq('user_id', profile.id);

  const emptyStats: ProfileStats = {
    totalBooksRead: 0,
    totalPagesRead: 0,
    topCategories: [],
    weeklyVolume: computeWeeklyVolume([]),
    conqueredBooks: [],
    deepFocusScore: 0,
    badge: getBadge(0),
  };

  if (!books) {
    return { profile: profile as UserProfile, stats: emptyStats };
  }

  // 3. Aggregate stats
  let totalBooksRead = 0;
  let totalPagesRead = 0;
  const categoryCounts: Record<string, number> = {};
  const conqueredBooks: ConqueredBook[] = [];
  let totalBooksAdded = books.length;
  let booksFinished = 0;

  books.forEach(book => {
    if (book.status === 'finished' || (book.times_read && book.times_read > 0)) {
      totalBooksRead += (book.times_read || 1);
      totalPagesRead += (book.total_pages || 0) * (book.times_read || 1);
      booksFinished++;
      
      const cat = book.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Only add non-hidden books to the conquered list
      if (!book.hidden_from_profile) {
        conqueredBooks.push({
          id: (book as any).id || '', // Ensure ID is captured (adding as any to bypass TS if needed, but 'id' should be there)
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          category: cat,
          completed_at: book.completed_at,
          times_read: book.times_read || 1,
        });
      }
    }
  });

  // Sort conquered books by completed_at desc
  conqueredBooks.sort((a, b) => {
    if (!a.completed_at) return 1;
    if (!b.completed_at) return -1;
    return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
  });

  // Sort categories by highest count — return ALL categories
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Deep Focus Score: % of finished books that used focus mode (had started_at set)
  const focusedBooks = books.filter(b => b.status === 'finished' && b.started_at).length;
  const deepFocusScore = totalBooksAdded > 0 ? Math.round((booksFinished / totalBooksAdded) * 100) : 0;

  // Weekly volume
  const weeklyVolume = computeWeeklyVolume(books);

  return {
    profile: profile as UserProfile,
    stats: {
      totalBooksRead,
      totalPagesRead,
      topCategories,
      weeklyVolume,
      conqueredBooks,
      deepFocusScore,
      badge: getBadge(totalBooksRead),
    }
  };
}
