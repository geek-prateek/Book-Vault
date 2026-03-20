// src/components/FocusDesk.tsx
// NO 'use client' here! 
import { getMyLibrary } from '@/lib/fetchBooks';
import FinishButton from './FinishButton';
import ProgressInput from './ProgressInput';
import NotesSection from './NotesSection';
import TotalPagesInput from './TotalPagesInput';

export default async function FocusDesk() {
  const allBooks = await getMyLibrary();
  const currentRead = allBooks.find(b => b.status === 'reading');
  
  if (!currentRead) return null;

  const hasTotalPages = currentRead.total_pages && currentRead.total_pages > 0;
  const progress = hasTotalPages
    ? Math.round((currentRead.current_page / currentRead.total_pages) * 100) 
    : 0;

  return (
    <div className="mb-12 p-4 md:p-8 bg-blue-900/20 border border-blue-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center min-w-0">
        <img 
          src={currentRead.cover_url || '/placeholder-book.png'} 
          alt={currentRead.title}
          className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-lg shadow-2xl flex-shrink-0 mx-auto md:mx-0" 
        />
        <div className="flex-1 w-full min-w-0">
          <h3 className="text-lg md:text-2xl font-bold text-white mb-4 break-words hyphens-auto">{currentRead.title}</h3>
          
          {/* Show total pages input if not set */}
          {!hasTotalPages && (
            <div className="mb-4">
              <TotalPagesInput 
                bookId={currentRead.id} 
                currentTotalPages={currentRead.total_pages}
              />
            </div>
          )}
          
          {/* Progress Bar UI - Only show if total pages is set */}
          {hasTotalPages && (
            <>
              <div className="mt-4 mb-2 flex justify-between text-xs md:text-sm text-blue-300">
                <span>Progress: {progress}%</span>
                <span>{currentRead.current_page || 0} / {currentRead.total_pages} pages</span>
              </div>
              <div className="w-full bg-gray-700 h-2 md:h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </>
          )}
  
          {/* Input to update progress */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            <ProgressInput 
              bookId={currentRead.id} 
              currentPage={currentRead.current_page}
              totalPages={currentRead.total_pages}
            />
            <FinishButton bookId={currentRead.id} />
          </div>
        </div>
      </div>
      <NotesSection key={currentRead.id} bookId={currentRead.id} initialNotes={currentRead.notes} />
    </div>
  );
}