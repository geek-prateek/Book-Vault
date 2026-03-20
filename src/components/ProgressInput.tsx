'use client';
import { useState } from 'react';
import { updateProgress } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function ProgressInput({ bookId, currentPage, totalPages }: { bookId: string; currentPage?: number; totalPages?: number }) {
  // Use currentPage as initial value, but allow local editing
  const [page, setPage] = useState(() => currentPage?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);
  
  // Update local state when currentPage changes and input is not focused
  const displayValue = isFocused ? page : (currentPage?.toString() || page);

  const handleBlur = async () => {
    setIsFocused(false);
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 0) {
      setPage(currentPage?.toString() || '');
      return;
    }
    
    if (totalPages && pageNum > totalPages) {
      toast.error(`Page number cannot exceed ${totalPages}`);
      setPage(currentPage?.toString() || '');
      return;
    }

    if (pageNum !== currentPage) {
      const result = await updateProgress(bookId, pageNum);
      if (result.success) {
        toast.success("Progress updated", { duration: 2000 });
      } else {
        toast.error("Failed to update progress");
        setPage(currentPage?.toString() || '');
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
      <input 
        type="number" 
        value={displayValue}
        onChange={(e) => {
          setIsFocused(true);
          setPage(e.target.value);
        }}
        onFocus={() => { setIsFocused(true); }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Page number"
        min="0"
        max={totalPages || undefined}
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:border-blue-500"
      />
      {totalPages && (
        <span className="text-sm text-gray-400">/ {totalPages}</span>
      )}
    </div>
  );
}

