// src/components/StatsDashboard.tsx
import { getMyLibrary } from '@/lib/fetchBooks';

function getBooksSubtext(count: number): string {
  if (count === 0) return "Your first awaits!";
  if (count === 1) return "Great start!";
  if (count >= 5 && count < 10) return "Nice momentum!";
  if (count >= 10) return "Impressive!";
  return "Keep going!";
}

function getPagesSubtext(pages: number): string {
  if (pages === 0) return "Every page counts";
  if (pages >= 1000) return "You're on fire!";
  return "Every page counts";
}

export default async function StatsDashboard() {
  const books = await getMyLibrary();
  const finishedBooks = books.filter(b => b.status === 'finished');

  const totalBooks = finishedBooks.length;
  const totalPages = finishedBooks.reduce((acc, book) => {
    return acc + (book.total_pages * (book.times_read || 1));
  }, 0);

  const currentYear = new Date().getFullYear();
  const booksThisYear = finishedBooks.filter(book => {
    if (!book.completed_at) return false;
    return new Date(book.completed_at).getFullYear() === currentYear;
  }).length;

  const categoryCounts = finishedBooks.reduce((acc: Record<string, number>, book) => {
    const cat = book.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCategory = Object.keys(categoryCounts).reduce((a, b) =>
    categoryCounts[a] > categoryCounts[b] ? a : b,
    ""
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 md:mb-8">
      {/* Card 1: Books Completed */}
      <div className="bg-blue-900/10 border border-blue-500/20 p-3 md:p-4 rounded-xl text-center">
        <p className="text-blue-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">Books Completed</p>
        <h4 className="text-xl md:text-2xl font-bold text-white mt-1">{totalBooks}</h4>
        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{getBooksSubtext(totalBooks)}</p>
      </div>

      {/* Card 2: Pages Read */}
      <div className="bg-green-900/10 border border-green-500/20 p-3 md:p-4 rounded-xl text-center">
        <p className="text-green-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">Pages Read</p>
        <h4 className="text-xl md:text-2xl font-bold text-white mt-1">{totalPages.toLocaleString()}</h4>
        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{getPagesSubtext(totalPages)}</p>
      </div>

      {/* Card 3: This Year + Top Interest */}
      <div className="col-span-2 md:col-span-1 bg-purple-900/10 border border-purple-500/20 p-3 md:p-4 rounded-xl text-center">
        <p className="text-purple-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">{currentYear} · {topCategory || "Reading"}</p>
        <h4 className="text-xl md:text-2xl font-bold text-white mt-1">{booksThisYear} <span className="text-sm font-normal text-gray-500">books</span></h4>
        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
          {booksThisYear === 0 ? "Start your year strong!" : "This year"}
        </p>
      </div>
    </div>
  );
}
