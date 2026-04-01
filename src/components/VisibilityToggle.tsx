'use client';

import { useState, useTransition } from 'react';
import { toggleBookVisibility } from '@/lib/actions';
import toast from 'react-hot-toast';

interface VisibilityToggleProps {
  bookId: string;
  isHidden: boolean;
}

export default function VisibilityToggle({ bookId, isHidden }: VisibilityToggleProps) {
  const [hidden, setHidden] = useState(isHidden);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBookVisibility(bookId);
      if (result.success) {
        setHidden(!hidden);
        toast.success(hidden ? 'Book visible on profile' : 'Book hidden from profile');
      } else {
        toast.error(result.error || 'Failed to update visibility');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={hidden ? 'Hidden from public profile' : 'Visible on public profile'}
      className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${
        hidden
          ? 'text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
          : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
      } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      {isPending ? '...' : hidden ? 'Private' : 'Public'}
    </button>
  );
}
