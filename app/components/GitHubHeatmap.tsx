"use client";

import { useMemo } from "react";

export default function GitHubHeatmap() {
  const weeks = 52;
  const daysPerWeek = 7;

  const cells = useMemo(() => {
    const data: number[] = [];
    // Seeded pseudo-random to produce a consistent contribution graph
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < weeks * daysPerWeek; i++) {
      const v = rand();
      // More weight to middle range
      if (v < 0.28) data.push(0);
      else if (v < 0.52) data.push(1);
      else if (v < 0.74) data.push(2);
      else if (v < 0.9) data.push(3);
      else data.push(4);
    }
    return data;
  }, []);

  const levelColors: Record<number, string> = {
    0: "rgba(var(--accent-rgb), 0.04)",
    1: "rgba(var(--accent-rgb), 0.18)",
    2: "rgba(var(--accent-rgb), 0.38)",
    3: "rgba(var(--accent-rgb), 0.62)",
    4: "rgba(var(--accent-rgb), 0.88)",
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="github-heatmap-wrapper">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm text-[var(--text-muted)] mono">1,248 contributions in the last year</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mono">
          Less
          {[0,1,2,3,4].map(l => (
            <div key={l} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: levelColors[l] }} />
          ))}
          More
        </div>
      </div>
      
      {/* Month labels */}
      <div className="flex gap-0 mb-1 ml-5">
        {months.map((m, i) => (
          <div key={i} className="text-[9px] text-[var(--text-muted)] mono" style={{ width: `${100/12}%` }}>{m}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-[2px] overflow-hidden">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <div key={i} className="text-[8px] text-[var(--text-muted)] mono h-[11px] flex items-center">{d}</div>
          ))}
        </div>
        
        {/* Weeks */}
        {Array.from({ length: weeks }).map((_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-[2px]">
            {Array.from({ length: daysPerWeek }).map((_, dayIdx) => {
              const cellIdx = weekIdx * daysPerWeek + dayIdx;
              const level = cells[cellIdx] || 0;
              return (
                <div
                  key={dayIdx}
                  className="w-[11px] h-[11px] rounded-[2px] transition-all duration-300 hover:scale-150 hover:ring-1 hover:ring-white/30"
                  style={{
                    background: levelColors[level],
                    animationDelay: `${cellIdx * 3}ms`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
