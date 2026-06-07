import type { CSSProperties } from "react";

type SkillLogoSpec = {
  glyph: string;
  label: string;
  primary: string;
  secondary: string;
  shape?: "cube" | "orb" | "diamond";
};

const skillLogoSpecs: Record<string, SkillLogoSpec> = {
  python: { glyph: "Py", label: "Python", primary: "#3776ab", secondary: "#ffd43b", shape: "orb" },
  typescript: { glyph: "TS", label: "TypeScript", primary: "#3178c6", secondary: "#9fd5ff", shape: "cube" },
  java: { glyph: "J", label: "Java", primary: "#f89820", secondary: "#5382a1", shape: "orb" },
  "c++": { glyph: "C++", label: "C++", primary: "#00599c", secondary: "#8bd3ff", shape: "diamond" },
  r: { glyph: "R", label: "R", primary: "#276dc3", secondary: "#9ac7ff", shape: "orb" },
  pytorch: { glyph: "PT", label: "PyTorch", primary: "#ee4c2c", secondary: "#ffb19f", shape: "orb" },
  tensorflow: { glyph: "TF", label: "TensorFlow", primary: "#ff6f00", secondary: "#ffc107", shape: "cube" },
  "scikit-learn": { glyph: "SK", label: "Scikit-learn", primary: "#f7931e", secondary: "#3499cd", shape: "diamond" },
  xgboost: { glyph: "XG", label: "XGBoost", primary: "#3fb950", secondary: "#b7f7c8", shape: "cube" },
  shap: { glyph: "SH", label: "SHAP", primary: "#7c3aed", secondary: "#f472b6", shape: "diamond" },
  transformers: { glyph: "HF", label: "Transformers", primary: "#ffcc33", secondary: "#ff7a00", shape: "orb" },
  opencv: { glyph: "CV", label: "OpenCV", primary: "#5c3ee8", secondary: "#00d084", shape: "orb" },
  nltk: { glyph: "NL", label: "NLTK", primary: "#2563eb", secondary: "#67e8f9", shape: "cube" },
  "next.js": { glyph: "N", label: "Next.js", primary: "#f8fafc", secondary: "#111827", shape: "orb" },
  react: { glyph: "Re", label: "React", primary: "#61dafb", secondary: "#0f172a", shape: "orb" },
  fastapi: { glyph: "API", label: "FastAPI", primary: "#009688", secondary: "#8ff5df", shape: "diamond" },
  flask: { glyph: "Fl", label: "Flask", primary: "#e5e7eb", secondary: "#64748b", shape: "cube" },
  tailwind: { glyph: "TW", label: "Tailwind", primary: "#38bdf8", secondary: "#22d3ee", shape: "cube" },
  docker: { glyph: "Do", label: "Docker", primary: "#2496ed", secondary: "#9ed8ff", shape: "cube" },
  aws: { glyph: "AWS", label: "AWS", primary: "#ff9900", secondary: "#fbd38d", shape: "diamond" },
  mongodb: { glyph: "Mg", label: "MongoDB", primary: "#47a248", secondary: "#b7f7c8", shape: "orb" },
  postgresql: { glyph: "PG", label: "PostgreSQL", primary: "#336791", secondary: "#9cc8ff", shape: "orb" },
  git: { glyph: "Git", label: "Git", primary: "#f05032", secondary: "#ffb4a5", shape: "diamond" },
};

export default function SkillLogo3D({ skill }: { skill: string }) {
  const spec = skillLogoSpecs[skill.toLowerCase()] ?? {
    glyph: skill.slice(0, 2),
    label: skill,
    primary: "#58a6ff",
    secondary: "#bc8cff",
    shape: "cube",
  };

  return (
    <span
      className={`skill-logo-3d skill-logo-3d--${spec.shape ?? "cube"}`}
      aria-label={`${spec.label} 3D logo`}
      style={{
        "--skill-logo-primary": spec.primary,
        "--skill-logo-secondary": spec.secondary,
      } as CSSProperties}
    >
      <span className="skill-logo-3d__shadow" />
      <span className="skill-logo-3d__body">
        <span className="skill-logo-3d__shine" />
        <span className="skill-logo-3d__glyph">{spec.glyph}</span>
      </span>
    </span>
  );
}
