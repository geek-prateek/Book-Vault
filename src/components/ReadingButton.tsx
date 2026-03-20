"use client";

import { useState, useEffect } from 'react';
import { updateBookStatus } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function ReadingButton({ bookId, currentStatus }: any) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStartReading = async () => {
    setIsUpdating(true);
    const result = await updateBookStatus(bookId, 'reading');
    setIsUpdating(false);
    
    if (result.success) {
      toast.success("Focus mode activated!");
    } else {
      toast.error(result.error || "Failed to start reading");
    }
  };

  if (!isMounted) {
    return <div className="w-20 h-8 bg-gray-800 animate-pulse rounded-lg" />;
  }

  if (currentStatus === 'reading') {
    return <span className="text-blue-400 text-sm italic font-medium">Focusing...</span>;
  }

  return (
    <button 
      onClick={handleStartReading}
      disabled={isUpdating}
      className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
    >
      {isUpdating ? 'Starting...' : (
        <>
          <span className="sm:hidden">Start</span>
          <span className="hidden sm:inline">Start Reading</span>
        </>
      )}
    </button>
  );
}