// src/components/StatsDashboard.tsx
import { getMyLibrary } from '@/lib/fetchBooks';

export default async function StatsDashboard() {
  const books = await getMyLibrary();
  
  // Filter for only finished books
  const finishedBooks = books.filter(b => b.status === 'finished');
  
  // Calculate Totals
  const totalBooks = finishedBooks.length;
  
  // Sum of (total_pages * times_read) for all finished books
  const totalPages = finishedBooks.reduce((acc, book) => {
    return acc + (book.total_pages * (book.times_read || 1));
  }, 0);

  const categoryCounts = finishedBooks.reduce((acc: Record<string, number>, book) => {
    const cat = book.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.keys(categoryCounts).reduce((a, b) => 
    categoryCounts[a] > categoryCounts[b] ? a : b, 
    "None"
  );

  const topCount = categoryCounts[topCategory] || 0;
  // Books finished this year (2026)
  const currentYear = new Date().getFullYear();
  const booksThisYear = finishedBooks.filter(book => {
    if (!book.completed_at) return false;
    return new Date(book.completed_at).getFullYear() === currentYear;
  }).length;

  const booksWithDates = finishedBooks.filter(b => b.started_at && b.completed_at);
const totalDaysSpent = booksWithDates.reduce((acc, b) => {
  const diff = new Date(b.completed_at).getTime() - new Date(b.started_at).getTime();
  return acc + (Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1);
}, 0);

const avgPace = totalDaysSpent > 0 ? Math.round(totalPages / totalDaysSpent) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-12">
      <div className="bg-blue-900/10 border border-blue-500/20 p-4 md:p-6 rounded-2xl text-center">
        <p className="text-blue-400 text-xs md:text-sm font-medium uppercase tracking-wider">Books Completed</p>
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-2">{totalBooks}</h4>
      </div>

      <div className="bg-green-900/10 border border-green-500/20 p-4 md:p-6 rounded-2xl text-center">
        <p className="text-green-400 text-xs md:text-sm font-medium uppercase tracking-wider">Total Pages Read</p>
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-2">{totalPages.toLocaleString()}</h4>
      </div>

      <div className="bg-purple-900/10 border border-purple-500/20 p-4 md:p-6 rounded-2xl text-center">
        <p className="text-purple-400 text-xs md:text-sm font-medium uppercase tracking-wider">Goal {currentYear}</p>
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-2">{booksThisYear} <span className="text-sm md:text-lg text-gray-500">books</span></h4>
      </div>

      <div className="bg-orange-900/10 border border-orange-500/20 p-4 md:p-6 rounded-2xl text-center">
        <p className="text-orange-400 text-xs md:text-sm font-medium uppercase tracking-wider">Average Pace</p>
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-2">{avgPace} <span className="text-sm md:text-lg text-gray-500">pg/day</span></h4>
      </div>

      <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 md:p-6 rounded-2xl text-center">
        <p className="text-yellow-400 text-xs md:text-sm font-medium uppercase tracking-wider">Top Interest</p>
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-2 truncate">{topCategory}</h4>
        <p className="text-xs text-gray-500 mt-1">{topCount} books completed</p>
      </div>
    </div>
  );
}