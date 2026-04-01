'use client';

import { useEffect, useState } from 'react';

interface DNAChartProps {
  categories: { category: string; count: number }[];
}

const barColors = [
  { from: '#10b981', to: '#059669' },  // Emerald
  { from: '#0d9488', to: '#0f766e' },  // Teal
  { from: '#06b6d4', to: '#0891b2' },  // Cyan
  { from: '#475569', to: '#334155' },  // Slate/Steel
  { from: '#10b981', to: '#059669' },  // Emerald (Repeat shades)
  { from: '#0d9488', to: '#0f766e' },  // Teal (Repeat shades)
  { from: '#06b6d4', to: '#0891b2' },  // Cyan (Repeat shades)
  { from: '#475569', to: '#334155' },  // Slate/Steel (Repeat shades)
];

export default function DNAChart({ categories }: DNAChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm text-center bg-black/40 rounded-2xl border border-gray-800/50">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No DNA Profile</p>
        <p className="text-gray-600 text-xs mt-2">Genre data builds as books are completed.</p>
      </div>
    );
  }

  const maxCount = categories[0].count;
  const totalBooks = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-4">
      {categories.map((cat, idx) => {
        const percentage = Math.round((cat.count / totalBooks) * 100);
        const barWidth = Math.max(8, Math.round((cat.count / maxCount) * 100));
        const colors = barColors[idx % barColors.length];

        return (
          <div key={idx} className="group/bar">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="font-semibold text-gray-200 group-hover/bar:text-white transition-colors text-sm md:text-base">
                {cat.category}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white font-black text-sm">{cat.count}</span>
                <span className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">books</span>
              </div>
            </div>
            <div className="w-full bg-gray-950 border border-gray-800/50 h-3 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"
                style={{
                  width: animated ? `${barWidth}%` : '0%',
                  background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                  transition: `width 1s ease-out ${idx * 0.15}s`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
