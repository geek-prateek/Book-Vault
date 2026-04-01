'use client';

import { useEffect, useState } from 'react';

interface PulseChartProps {
  weeklyVolume: { week: string; pages: number }[];
}

export default function PulseChart({ weeklyVolume }: PulseChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxPages = Math.max(...weeklyVolume.map(w => w.pages), 1);
  const totalPages = weeklyVolume.reduce((sum, w) => sum + w.pages, 0);

  // SVG dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points for the line
  const points = weeklyVolume.map((w, i) => ({
    x: padding.left + (i / (weeklyVolume.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (w.pages / maxPages) * chartHeight,
    pages: w.pages,
    week: w.week,
  }));

  // Create SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area path (fill below line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.15))' }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={width - padding.right}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke="#1f2937"
            strokeWidth="1"
            strokeDasharray={ratio === 0 ? "none" : "4 4"}
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => (
          <text
            key={i}
            x={padding.left - 8}
            y={padding.top + chartHeight * (1 - ratio) + 4}
            textAnchor="end"
            fill="#6b7280"
            fontSize="10"
            fontFamily="var(--font-geist-mono)"
          >
            {Math.round(maxPages * ratio)}
          </text>
        ))}

        {/* Area fill */}
        {totalPages > 0 && (
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            opacity={animated ? 1 : 0}
            style={{ transition: 'opacity 1s ease-out' }}
          />
        )}

        {/* Line */}
        {totalPages > 0 && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={animated ? 'none' : '2000'}
            strokeDashoffset={animated ? '0' : '2000'}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        )}

        {/* Data points */}
        {totalPages > 0 && points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={animated ? (p.pages > 0 ? 3.5 : 2) : 0}
              fill={p.pages > 0 ? '#10b981' : '#1f2937'}
              stroke={p.pages > 0 ? '#064e3b' : '#111827'}
              strokeWidth="1.5"
              style={{ transition: `r 0.5s ease-out ${i * 0.05}s` }}
            />
            {p.pages > 0 && (
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fill="#10b981"
                fontSize="9"
                fontWeight="800"
                fontFamily="var(--font-geist-mono)"
                opacity={animated ? 1 : 0}
                style={{ transition: `opacity 0.5s ease-out ${i * 0.05 + 0.3}s` }}
              >
                {p.pages}
              </text>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          i % 2 === 0 && (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="9"
              fontFamily="var(--font-geist-mono)"
            >
              {weeklyVolume[i].week}
            </text>
          )
        ))}
      </svg>
    </div>
  );
}
