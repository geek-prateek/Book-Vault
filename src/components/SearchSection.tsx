// src/components/SearchSection.tsx
'use client';
import { useState } from 'react';
import { searchGoogleBooks } from '@/lib/books';
import { saveBookToVault, checkBookExists } from '@/lib/actions';
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
  // Per-book category selection - each book has its own category
  const [bookCategories, setBookCategories] = useState<Record<string, string>>({});
  const [bookStatuses, setBookStatuses] = useState<Record<string, { exists: boolean; status: string | null }>>({});

  const categories = ['Tech', 'Self-Help', 'Fiction', 'Business', 'Health', 'General', 'Uncategorized'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
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
    for (const book of books) {
      const check = await checkBookExists(book.google_id, book.title, book.author);
      statusMap[book.google_id] = check;
    }
    setBookStatuses(statusMap);
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
              className="w-full p-2 md:p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-10 text-sm md:text-base"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors whitespace-nowrap"
          >
            Search
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
                <div key={book.google_id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-w-0">
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
                        <p className="text-xs text-gray-500 mt-1">{book.total_pages} pages</p>
                      ) : (
                        <div className="mt-2">
                          <label className="text-xs text-gray-400 block mb-1">Total Pages:</label>
                          <input 
                            type="number" 
                            placeholder="Enter total pages"
                            min="0"
                            className="w-full p-2 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            id={`total-pages-${book.google_id}`}
                          />
                        </div>
                      )}
                      
                      <input 
                        type="text" 
                        placeholder="Paste PDF link here (optional)"
                        className="w-full mt-3 p-2 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        id={`link-${book.google_id}`}
                      />

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                        <select 
                          value={bookCategories[book.google_id] || 'Uncategorized'}
                          onChange={(e) => {
                            setBookCategories(prev => ({
                              ...prev,
                              [book.google_id]: e.target.value
                            }));
                          }}
                          className="bg-gray-800 text-white text-sm p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 flex-shrink-0"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        
                        {showSaveButton ? (
                          <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                            onClick={async () => {
                              const linkInput = document.getElementById(`link-${book.google_id}`) as HTMLInputElement;
                              const totalPagesInput = document.getElementById(`total-pages-${book.google_id}`) as HTMLInputElement;
                              const category = bookCategories[book.google_id] || 'Uncategorized';
                              const totalPages = totalPagesInput?.value ? parseInt(totalPagesInput.value) : (book.total_pages || 0);
                              await handleSave(book, linkInput?.value || '', category, totalPages);
                            }}
                          >
                            {status === 'finished' ? 'Add for Re-read' : 'Save to Vault'}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400 italic text-center sm:text-left">
                            {status === 'reading' ? 'Currently reading' : 'Already in library'}
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