import SearchSection from '@/components/SearchSection';
import Library from '@/components/Library';
import FocusDesk from '@/components/FocusDesk';
import { Suspense } from 'react';
import StatsDashboard from '@/components/StatsDashboard';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="max-w-6xl mx-auto p-3 md:p-4 lg:p-8 min-h-screen w-full min-w-0">
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white italic tracking-tighter">Readaly</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <a 
              href="/profile/edit"
              className="text-xs md:text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors px-3 py-1.5 rounded-lg border border-blue-900 hover:bg-blue-900/30 whitespace-nowrap"
            >
              Public Profile
            </a>
            <form action="/auth/signout" method="post">
              <button 
                type="submit"
                className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-gray-900 whitespace-nowrap"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
        <SearchSection />
        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12"><div className="h-24 md:h-32 bg-gray-900 animate-pulse rounded-2xl"></div></div>}>
          <StatsDashboard />
        </Suspense>
      </header>

      <section className="mb-8 md:mb-16 min-w-0">
        <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-blue-400">Focus Mode</h2>
        <Suspense fallback={<div className="p-4 md:p-8 bg-blue-900/20 border border-blue-500/30 rounded-3xl animate-pulse"><div className="h-48"></div></div>}>
          <FocusDesk />
        </Suspense>
      </section>

      <section className="min-w-0">
        <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-green-400">Your Library</h2>
        <Suspense fallback={<div className="space-y-6 md:space-y-8"><div className="h-48 md:h-64 bg-gray-900 animate-pulse rounded-xl"></div></div>}>
          <Library />
        </Suspense>
      </section>
    </main>
  );
}