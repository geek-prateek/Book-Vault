'use client';
import { useState } from 'react';
import { updateBookStatus } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function FinishButton({ bookId }: { bookId: string }) {
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinish = async () => {
    setIsFinishing(true);
    const result = await updateBookStatus(bookId, 'finished');
    setIsFinishing(false);
    
    if (result.success) {
      toast.success("🎉 Book completed! Great work!");
    } else {
      toast.error(result.error || "Failed to mark as finished");
    }
  };

  return (
    <button 
      onClick={handleFinish}
      disabled={isFinishing}
      className="border border-green-600 text-green-600 px-4 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-green-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
    >
      {isFinishing ? 'Finishing...' : (
        <>
          <span className="sm:hidden">Done!</span>
          <span className="hidden sm:inline">Done Reading!</span>
        </>
      )}
    </button>
  );
}