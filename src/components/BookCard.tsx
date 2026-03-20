'use client'; // This is okay here because it's just the UI card
import { updateBookStatus } from '@/lib/actions';

export default function BookCard({ book }: { book: any }) {
  return (
    <div className="p-4 border rounded-xl flex justify-between items-center">
      <div>
        <h3 className="font-bold">{book.title}</h3>
        <p className="text-gray-500">{book.author}</p>
      </div>
      
      <button 
        onClick={() => updateBookStatus(book.id, 'reading')}
        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm"
      >
        Set to Focus
      </button>
    </div>
  );
}