// src/components/SearchSection.tsx
'use client';
import { useState } from 'react';
import { searchGoogleBooks } from '@/lib/books';
import { saveBookToVault, checkBookExists, checkMultipleBooksExist } from '@/lib/actions';
import toast from 'react-hot-toast';

interface BookResult {
  google_id: string;
  title: string;
  author: string;
  cover_url?: string;
  total_pages?: number;
}

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Per-book category selection - each book has its own category
  const [bookCategories, setBookCategories] = useState<Record<string, string>>({});
  const [bookStatuses, setBookStatuses] = useState<Record<string, { exists: boolean; status: string | null }>>({});

  const categories = ['Tech', 'Self-Help', 'Fiction', 'Business', 'Health', 'General', 'Uncategorized'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    
    setIsSearching(true);
    try {
      const books = await searchGoogleBooks(query);
      setResults(books);
      
      // Initialize categories for each book (default to 'Uncategorized')
      const initialCategories: Record<string, string> = {};
      books.forEach((book: BookResult) => {
        initialCategories[book.google_id] = 'Uncategorized';
      });
      setBookCategories(initialCategories);
      
      // Check which books already exist in the library
      const statusMap: Record<string, { exists: boolean; status: string | null }> = {};
      const minimalBooks = books.map((b: BookResult) => ({ google_id: b.google_id, title: b.title, author: b.author }));
      const checks = await checkMultipleBooksExist(minimalBooks);
      
      books.forEach((book: BookResult, idx: number) => {
        statusMap[book.google_id] = checks[idx];
      });
      setBookStatuses(statusMap);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search for books");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (book: BookResult, pdfUrl: string, category: string, totalPages?: number) => {
    const result = await saveBookToVault({
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      pdf_url: pdfUrl,
      category: category || 'Uncategorized',
      google_id: book.google_id,
      total_pages: totalPages !== undefined ? totalPages : (book.total_pages || 0)
    });
  
    if (result.success) {
      if (result.reRead) {
        toast.success("Book added for a re-read!");
      } else {
        toast.success("Book added to your focused library!");
      }
      // Update the status map
      setBookStatuses(prev => ({
        ...prev,
        [book.google_id]: { exists: true, status: 'to-read' }
      }));
    } else {
      toast.error(result.error || "Failed to save book");
    }
  };
  
  return (
    <div>
      <section>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-8 relative">
          <div className="flex-1 relative">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for books..."
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 pr-10 text-sm md:text-base transition-all"
            />
            {query && (
              <button 
                type="button"
                onClick={() => { 
                  setQuery(""); 
                  setResults([]); 
                  setBookStatuses({});
                }}
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-lg md:text-xl"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-lg transition-all whitespace-nowrap min-w-[120px] flex items-center justify-center disabled:opacity-50"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Search"}
          </button>
        </form>
        
        {results.length > 0 && (
          <div className="space-y-4 overflow-hidden">
            {results.map((book) => {
              const bookStatus = bookStatuses[book.google_id];
              const exists = bookStatus?.exists;
              const status = bookStatus?.status;
              const showSaveButton = !exists || status === 'finished';
              
              return (
                <div key={book.google_id} className="p-6 bg-black border border-gray-800 rounded-2xl transition-all hover:border-emerald-500/20">
                  <div className="flex gap-4 min-w-0">
                    <img 
                      src={book.cover_url || '/placeholder-book.png'} 
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-bold text-white text-sm md:text-base truncate">{book.title}</h3>
                      <p className="text-xs md:text-sm text-gray-400 truncate">{book.author}</p>
                      {book.total_pages && book.total_pages > 0 ? (
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-2">{book.total_pages} pages</p>
                      ) : (
                        <div className="mt-4">
                          <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2">Total Pages:</label>
                          <input 
                            type="number" 
                            placeholder="Enter total pages"
                            min="0"
                            className="w-full p-2.5 text-xs bg-gray-950 border border-gray-800 rounded text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                            id={`total-pages-${book.google_id}`}
                          />
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2">PDF Access (Optional):</label>
                        <input 
                          type="text" 
                          placeholder="Paste URL..."
                          className="w-full p-2.5 text-xs bg-gray-950 border border-gray-800 rounded text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/30 transition-all"
                          id={`link-${book.google_id}`}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block">Collection</label>
                          <select 
                            value={bookCategories[book.google_id] || 'Uncategorized'}
                            onChange={(e) => {
                              setBookCategories(prev => ({
                                ...prev,
                                [book.google_id]: e.target.value
                              }));
                            }}
                            className="bg-gray-950 text-white text-[10px] font-bold uppercase tracking-widest p-2.5 rounded border border-gray-800 focus:outline-none focus:border-emerald-500/30"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        {showSaveButton ? (
                          <button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded transition-all whitespace-nowrap self-end"
                            onClick={async () => {
                              const linkInput = document.getElementById(`link-${book.google_id}`) as HTMLInputElement;
                              const totalPagesInput = document.getElementById(`total-pages-${book.google_id}`) as HTMLInputElement;
                              const category = bookCategories[book.google_id] || 'Uncategorized';
                              const totalPages = totalPagesInput?.value ? parseInt(totalPagesInput.value) : (book.total_pages || 0);
                              await handleSave(book, linkInput?.value || '', category, totalPages);
                            }}
                          >
                            {status === 'finished' ? 'Re-read' : 'Devour'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest italic text-center sm:text-right self-end mb-2">
                            {status === 'reading' ? 'Devouring...' : 'In Library'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}