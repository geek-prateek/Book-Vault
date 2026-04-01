import { getPublicProfile } from '@/lib/profileActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PulseChart from '@/components/PulseChart';
import DNAChart from '@/components/DNAChart';
import VisibilityToggle from '@/components/VisibilityToggle';
import { createClient } from '@/lib/supabase-server';

export const revalidate = 60;

// Badge tier color map
// Refined palette colors
const badgeColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  legendary: { bg: 'bg-emerald-500/10', border: 'border-emerald-400/30', text: 'text-emerald-300', glow: 'shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]' },
  epic: { bg: 'bg-emerald-500/10', border: 'border-emerald-400/30', text: 'text-emerald-300', glow: 'shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]' },
  rare: { bg: 'bg-slate-700/30', border: 'border-slate-500/40', text: 'text-slate-200', glow: '' },
  uncommon: { bg: 'bg-slate-800/40', border: 'border-slate-600/40', text: 'text-slate-300', glow: '' },
  common: { bg: 'bg-gray-900/40', border: 'border-gray-700/50', text: 'text-gray-400', glow: '' },
  none: { bg: 'bg-gray-900/20', border: 'border-gray-800', text: 'text-gray-500', glow: '' },
};

export default async function PublicProfilePage({ params }: { params: any }) {
  const resolvedParams = await Promise.resolve(params);
  const username = resolvedParams.username;

  const { profile, stats } = await getPublicProfile(username);
  
  // Check if current user is the owner
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile?.id;

  if (!profile || !stats) {
    notFound();
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  const colors = badgeColors[stats.badge.tier] || badgeColors.none;
  const featuredBooks = stats.conqueredBooks.slice(0, 3);
  const restBooks = stats.conqueredBooks.slice(3);
  const hasSocialLinks = profile.linkedin_url || profile.github_url || profile.youtube_url;

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-black">
      {/* Top Nav */}
      <div className="flex justify-between items-center mb-12">
        <Link href="/" className="text-xl font-bold text-white hover:opacity-80 transition tracking-tighter italic">
          readaly
        </Link>
        <Link href="/profile/edit" className="text-sm font-medium text-gray-300 hover:text-white bg-gray-900 px-5 py-2.5 rounded-full border border-gray-700 hover:border-gray-500 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500">
          Create Yours
        </Link>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 1: THE HEADER
          ═══════════════════════════════════════════ */}
      <section className="mb-12 md:mb-16">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 md:p-10 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Avatar - Sophisticated emerald gradient */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-5xl md:text-6xl font-serif font-black ring-4 ring-gray-900 flex-shrink-0 transition-transform duration-500 group-hover:scale-105">
              {profile.display_name ? profile.display_name[0].toUpperCase() : profile.username[0].toUpperCase()}
            </div>

            <div className="flex-1 text-center md:text-left">
              {/* Name + Badge */}
              <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {profile.display_name || `@${profile.username}`}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest font-bold border ${colors.bg} ${colors.border} ${colors.text} ${colors.glow} transition-shadow`}>
                  {stats.badge.name}
                </span>
              </div>

              <p className="text-emerald-500 font-mono text-xs mb-4 inline-block bg-emerald-500/5 px-3 py-1 rounded border border-emerald-500/10">
                @{profile.username}
              </p>

              {profile.bio ? (
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mb-4 font-normal">{profile.bio}</p>
              ) : (
                <p className="text-gray-600 text-sm italic mb-4">No bio yet.</p>
              )}

              <div className="flex items-center gap-4 justify-center md:justify-start text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                <span>Joined {joinDate}</span>
                <span className="w-1 h-1 rounded-full bg-gray-800" />
                <span>{stats.totalBooksRead} books conquered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: THE PULSE
          ═══════════════════════════════════════════ */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">📈</span> The Pulse
        </h2>

        {/* Hero metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Total Knowledge Volume */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Knowledge Volume</h3>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              {stats.totalPagesRead.toLocaleString()}
            </p>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mt-2">Pages Devoured</p>
          </div>

          {/* Books Conquered */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Conquered</h3>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              {stats.totalBooksRead}
            </p>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mt-2">Books Finished</p>
          </div>

          {/* Deep Focus Score */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/20 transition-colors">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Deep Focus</h3>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              {stats.deepFocusScore}%
            </p>
            <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mt-2">Completion Rate</p>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 md:p-8">
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Pages Read per Week</h3>
          <PulseChart weeklyVolume={stats.weeklyVolume} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: THE SHELF
          ═══════════════════════════════════════════ */}
      <section className="mb-12 md:mb-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">The Shelf</h2>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stats.conqueredBooks.length} conquered</span>
        </div>

        {stats.conqueredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm text-center bg-gray-900/40 rounded-2xl border border-gray-800/50">
            <span className="text-5xl mb-4 grayscale opacity-40">📭</span>
            <p className="text-gray-400 font-medium">The shelf is waiting to be filled.</p>
            <p className="text-gray-600 text-xs mt-1">Conquered books will appear here.</p>
          </div>
        ) : (
          <>
            {featuredBooks.length > 0 && (
              <div className="mb-12">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.3em] mb-6">✦ Featured</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {featuredBooks.map((book, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-950 border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center group hover:border-emerald-500/20 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10 flex flex-col items-center text-center">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-24 h-36 object-cover rounded-lg shadow-xl shadow-black/50 mb-4 transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-24 h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl shadow-black/50 mb-4 flex items-center justify-center text-gray-600 text-3xl">
                            📖
                          </div>
                        )}
                        <h4 className="text-white font-bold text-sm line-clamp-2 mb-1">{book.title}</h4>
                        <p className="text-gray-500 text-xs mb-3">{book.author}</p>
                        <span className="text-[9px] text-emerald-500 uppercase font-bold tracking-widest bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                          {book.category}
                        </span>
                        {book.times_read > 1 && (
                          <span className="mt-2 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {book.times_read}x read
                          </span>
                        )}
                        {isOwner && (
                          <div className="mt-3">
                            <VisibilityToggle bookId={book.id} isHidden={false} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest of conquered books */}
            {restBooks.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mb-6">All Conquered</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {restBooks.map((book, idx) => (
                    <div key={idx} className="group relative">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-32 md:h-36 object-cover rounded-lg shadow-md shadow-black/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-32 md:h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md flex items-center justify-center text-gray-600 text-2xl">
                          📖
                        </div>
                      )}
                      {book.times_read > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          {book.times_read}x
                        </span>
                      )}
                      {/* Hover tooltip */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-[10px] font-semibold line-clamp-2 leading-tight">{book.title}</p>
                        <p className="text-gray-400 text-[9px]">{book.author}</p>
                      </div>
                      {isOwner && (
                        <div className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <VisibilityToggle bookId={book.id} isHidden={false} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: THE DNA
          ═══════════════════════════════════════════ */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 tracking-tight">The Reading DNA</h2>
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 md:p-8">
          <DNAChart categories={stats.topCategories} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: THE CONNECT
          ═══════════════════════════════════════════ */}
      {hasSocialLinks && (
        <section className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-2xl">🔗</span> The Connect
          </h2>
          <div className="flex flex-wrap gap-4">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl px-6 py-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-gray-300 group-hover:text-white font-medium text-sm transition-colors">LinkedIn</span>
              </a>
            )}
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl px-6 py-4 hover:border-gray-500/40 hover:bg-gray-500/5 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span className="text-gray-300 group-hover:text-white font-medium text-sm transition-colors">GitHub</span>
              </a>
            )}
            {profile.youtube_url && (
              <a
                href={profile.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl px-6 py-4 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-gray-300 group-hover:text-white font-medium text-sm transition-colors">YouTube</span>
              </a>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 border-t border-gray-900">
        <p className="text-gray-600 text-xs">
          Built with <Link href="/" className="text-indigo-500 hover:text-indigo-400 transition-colors">readaly</Link> · Share your reading journey
        </p>
      </footer>
    </main>
  );
}
