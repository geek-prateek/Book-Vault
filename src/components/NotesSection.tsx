'use client';

import { useState, useEffect, useRef } from 'react';
import { updateNotes } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function NotesSection({ bookId, initialNotes }: { bookId: string; initialNotes?: string }) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save after 1 second of no typing
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't auto-save if notes haven't changed from initial
    if (notes === (initialNotes || "")) {
      return;
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      const result = await updateNotes(bookId, notes);
      setIsSaving(false);
      
      if (result.success) {
        toast.success("Notes auto-saved", { duration: 2000 });
      } else {
        toast.error("Failed to save notes");
      }
    }, 1000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, bookId, initialNotes]);

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    const result = await updateNotes(bookId, notes);
    setIsSaving(false);
    
    if (result.success) {
      toast.success("Notes saved");
    } else {
      toast.error("Failed to save notes");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-blue-300">Active Reading Notes</label>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
          <button 
            onClick={handleManualSave}
            disabled={isSaving}
            className="text-[10px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded border border-blue-500/30 transition disabled:opacity-50"
          >
            Save Now
          </button>
        </div>
      </div>
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Capture key ideas, quotes, or questions here... (Auto-saves after 1 second)"
        className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 focus:border-blue-500 outline-none transition resize-none"
      />
    </div>
  );
}

