import DeleteButton from "./DeleteButton";
import ReadingButton from "./ReadingButton";
import RandomizerButton from "./RandomizerButton";
import VisibilityToggle from "./VisibilityToggle";
import { getMyLibrary } from "@/lib/fetchBooks";

export default async function Library() {
    const books = await getMyLibrary();
    
    // Logic: If it's not finished and not currently being read, put it in the Waiting List
    const toRead = books.filter(b => b.status !== 'finished' && b.status !== 'reading');
    const finished = books.filter(b => b.status === 'finished');

    const categories = Array.from(new Set(toRead.map(b => b.category).filter(Boolean)));
  
    return (
      <div className="space-y-8 overflow-hidden">
        {/* SECTION: TO READ */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-400">The Waiting List</h3>
            <RandomizerButton bookIds={toRead.map(b => b.id)} />
          </div>
          {toRead.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No books in the waitlist.</p>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {toRead.map(book => (
                 <div key={book.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition gap-3 overflow-hidden min-w-0">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <img 
                        src={book.cover_url || '/placeholder-book.png'} 
                        alt={book.title}
                        className="w-10 h-14 md:w-12 md:h-16 object-cover rounded flex-shrink-0" 
                      />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        {book.category && (
                          <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest block mb-1">
                            {book.category}
                          </span>
                        )}
                        <span className="text-white font-medium text-sm md:text-base block truncate">{book.title}</span>
                        {book.author && (
                          <span className="text-xs text-gray-400 block truncate">{book.author}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <ReadingButton bookId={book.id} currentStatus={book.status} />
                        <DeleteButton bookId={book.id} />
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: FINISHED */}
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-400">Completed Books</h3>
          {finished.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No completed books yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {finished.map((book) => {
                // Calculate Reading Speed
                let pagesPerDay = 0;
                if (book.started_at && book.completed_at) {
                  const start = new Date(book.started_at).getTime();
                  const end = new Date(book.completed_at).getTime();
                  const diffInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
                  pagesPerDay = Math.round((book.total_pages * (book.times_read || 1)) / diffInDays);
                }

                return (
                  <div key={book.id} className="relative group bg-gray-900/40 p-3 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                    <div className="relative">
                      <img 
                        src={book.cover_url || '/placeholder-book.png'} 
                        alt={book.title}
                        className="w-full h-40 object-cover rounded shadow-lg" 
                      />
                      {book.times_read > 1 && (
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {book.times_read}x
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold text-white truncate">{book.title}</p>
                      
                      {/* Speed Estimator Badge */}
                      {pagesPerDay > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-400 font-medium">
                          <span className="bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            ⚡ {pagesPerDay} pages/day
                          </span>
                        </div>
                      )}
                      
                      {book.completed_at && (
                        <p className="text-[9px] text-gray-500">
                          Finished: {new Date(book.completed_at).toLocaleDateString()}
                        </p>
                      )}

                      {book.notes && (
                        <details className="mt-2">
                          <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-white transition">
                            View Notes
                          </summary>
                          <p className="text-[10px] text-gray-500 mt-1 italic bg-black/20 p-2 rounded leading-relaxed">
                            {book.notes}
                          </p>
                        </details>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      <VisibilityToggle bookId={book.id} isHidden={book.hidden_from_profile || false} />
                      <DeleteButton bookId={book.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}