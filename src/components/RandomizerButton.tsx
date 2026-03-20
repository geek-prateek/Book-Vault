'use client';

import { useState } from 'react';
import { updateBookStatus } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function RandomizerButton({ bookIds }: { bookIds: string[] }) {
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleRandomize = async () => {
    if (bookIds.length === 0) {
      toast.error("No books in waiting list to randomize");
      return;
    }

    setIsRandomizing(true);
    
    // Pick a random book ID
    const randomIndex = Math.floor(Math.random() * bookIds.length);
    const randomBookId = bookIds[randomIndex];
    
    // Start reading the random book
    const result = await updateBookStatus(randomBookId, 'reading');
    setIsRandomizing(false);
    
    if (result.success) {
      toast.success("🎲 Random book selected! Focus mode activated.");
    } else {
      toast.error(result.error || "Failed to select random book");
    }
  };

  if (bookIds.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleRandomize}
      disabled={isRandomizing}
      className="flex items-center gap-1.5 sm:gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      title="Pick a random book from your waiting list"
    >
      <span>🎲</span>
      <span className="hidden sm:inline">{isRandomizing ? 'Selecting...' : 'Randomize'}</span>
    </button>
  );
}

