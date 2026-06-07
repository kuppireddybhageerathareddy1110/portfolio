import React, { ReactNode } from "react";

export interface SkillCardProps {
  category: string;
  children: ReactNode;
  icon?: ReactNode;
}

/**
 * SkillCard – a premium glass‑styled container for a skill category.
 * Utilises the global `.glass-card` class for glassmorphism and adds
 * subtle hover lift with a smooth transition.
 */
export default function SkillCard({ category, children, icon }: SkillCardProps) {
  return (
    <div className="glass-card p-6 rounded-xl border border-[#30363d] transition-transform hover:scale-[1.02] duration-300 mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-xl text-[#3fb950]">{icon}</span>}
        <h3 className="font-semibold text-lg text-[#e6edf3] capitalize">{category}</h3>
      </div>
      {children}
    </div>
  );
}
