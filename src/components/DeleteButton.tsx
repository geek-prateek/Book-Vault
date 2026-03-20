"use client";

import { deleteBook } from '@/lib/actions';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DeleteButton({ bookId }: { bookId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Use toast.promise for better UX
    const deletePromise = deleteBook(bookId);
    
    toast.promise(
      deletePromise,
      {
        loading: 'Removing book...',
        success: 'Book removed from vault',
        error: (err) => err.error || 'Failed to remove book',
      }
    );

    setIsDeleting(true);
    const result = await deletePromise;
    setIsDeleting(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-gray-500 hover:text-red-500 transition-colors p-2 disabled:opacity-50"
      title="Remove from Library"
      aria-label="Delete book"
    >
      {isDeleting ? "..." : "✕"}
    </button>
  );
}