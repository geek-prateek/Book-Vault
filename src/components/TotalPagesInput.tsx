'use client';
import { useState } from 'react';
import { updateTotalPages } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function TotalPagesInput({ bookId, currentTotalPages }: { bookId: string; currentTotalPages?: number }) {
  const [totalPages, setTotalPages] = useState(() => currentTotalPages?.toString() || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBlur = async () => {
    const pagesNum = parseInt(totalPages);
    if (isNaN(pagesNum) || pagesNum < 0) {
      setTotalPages(currentTotalPages?.toString() || '');
      return;
    }

    if (pagesNum !== currentTotalPages) {
      setIsUpdating(true);
      const result = await updateTotalPages(bookId, pagesNum);
      setIsUpdating(false);
      
      if (result.success) {
        toast.success("Total pages updated", { duration: 2000 });
      } else {
        toast.error(result.error || "Failed to update total pages");
        setTotalPages(currentTotalPages?.toString() || '');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-400 whitespace-nowrap">Total pages:</label>
      <input 
        type="number" 
        value={totalPages}
        onChange={(e) => setTotalPages(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Enter total pages"
        min="0"
        disabled={isUpdating}
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
      />
    </div>
  );
}

