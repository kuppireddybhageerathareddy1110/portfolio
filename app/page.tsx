"use client";

import Image from "next/image";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Download,
  GitBranch,
  Github,
  Mail,
  Menu,
  Moon,
  Network,
  Shuffle,
  Sparkles,
  Sun,
  Terminal,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  ["skills", "#skills"],
  ["flows", "#workflows"],
  ["git log", "#experience"],
  ["repos", "#projects"],
  ["badges", "#badges"],
  ["contact", "#contact"]
];

const roles = [
  "AI Engineer",
  "Data Scientist",
  "Full-Stack Developer",
  "Java HPC Explorer",
  "NLP and Computer Vision Builder"
];

const skills = {
  languages: ["Python", "TypeScript", "JavaScript", "Java", "C++", "R"],
  ai_ml: ["TensorFlow", "PyTorch", "Scikit-learn", "XGBoost", "SHAP", "Optuna", "Transformers", "OpenCV", "NLTK"],
  web_stack: ["Next.js", "React", "FastAPI", "Flask", "Django", "Tailwind CSS"],
  data_cloud: ["Pandas", "NumPy", "MongoDB", "MySQL", "PostgreSQL", "AWS", "Oracle Cloud", "Docker"]
};

const chessRoles = [
  ["♔", "King", "Python", "The foundation that anchors the board."],
  ["♕", "Queen", "AutoML + SHAP", "Fast, flexible, and powerful in every direction."],
  ["♖", "Rook", "FastAPI + Flask", "Straight-line backend force for production APIs."],
  ["♗", "Bishop", "TensorFlow + PyTorch", "Deep learning moves through diagonal complexity."],
  ["♘", "Knight", "Java HPC + Linux", "Unconventional moves for systems problems."],
  ["♙", "Pawn", "Git + Docker", "Small disciplined steps that ship real work."]
];

const experience = [
  {
    hash: "a17f4d2",
    title: "Built AutoML-STUDIO",
    meta: "flagship project | live deployment",
    desc: "An AutoML workspace with explainability, model comparison, and a polished ML workflow for tabular experiments.",
    tags: ["AutoML", "SHAP", "Python", "Netlify"]
  },
  {
    hash: "c49b9e1",
    title: "AI and data science portfolio",
    meta: "VIT-AP University | 2022-2026",
    desc: "B.Tech CSE foundation with applied work across NLP, computer vision, cloud architecture, and data visualization.",
    tags: ["CGPA 8.87", "NLP", "CV", "Cloud"]
  },
  {
    hash: "e31d8aa",
    title: "Production-minded full-stack practice",
    meta: "53 repositories | open source profile",
    desc: "Reusable APIs, dashboards, model demos, and deployment-ready applications across modern web and AI stacks.",
    tags: ["Next.js", "FastAPI", "MongoDB", "Docker"]
  }
];

const projects = [
  {
    title: "AutoML-STUDIO",
    desc: "A model-building cockpit for data upload, AutoML runs, metrics, explainability, and deployment handoff.",
    lang: "Python",
    color: "#3fb950",
    tags: ["AutoML", "SHAP", "Optuna"],
    href: "https://automl-studio.netlify.app",
    featured: true
  },
  {
    title: "Medical Chatbot",
    desc: "Healthcare assistant using NLP retrieval patterns and a clean conversational interface for medical Q&A.",
    lang: "Python",
    color: "#58a6ff",
    tags: ["NLP", "Flask", "LLM"]
  },
  {
    title: "Sentiment Analysis",
    desc: "Text classification workflow with preprocessing, feature extraction, model evaluation, and explainable output.",
    lang: "Jupyter",
    color: "#bc8cff",
    tags: ["NLTK", "Sklearn", "Pandas"]
  },
  {
    title: "Drowsiness Detection",
    desc: "Computer vision safety project that tracks eye state and attention signals from live video.",
    lang: "Python",
    color: "#e3b341",
    tags: ["OpenCV", "CV", "Safety"]
  },
  {
    title: "Gas Detection System",
    desc: "IoT-style monitoring concept for risk detection, alerting, and environment safety workflows.",
    lang: "C++",
    color: "#f85149",
    tags: ["IoT", "Sensors", "Alerts"]
  },
  {
    title: "Data Visualization Lab",
    desc: "Exploratory dashboards and notebooks turning messy datasets into readable decision stories.",
    lang: "R",
    color: "#ff7b72",
    tags: ["Tableau", "R", "EDA"]
  }
];

const badges = [
  ["Applied Data Science with Python", "/applied-data-science-with-python-level-2.png"],
  ["AWS Cloud Architecting", "/aws-academy-graduate-aws-academy-cloud-architecting.png"],
  ["Data Visualization with R", "/data-visualization-with-r.png"],
  ["Deep Learning with TensorFlow", "/deep-learning-using-tensorflow.png"],
  ["Oracle Cloud Data Science", "/oci-data-science.png"],
  ["Creative Technology", "/adobe-express.png"]
];

const workflowStages = [
  {
    icon: Activity,
    label: "ingest",
    title: "Live Signals",
    metric: "168 cells",
    desc: "GitHub contribution feed, project activity, model runs, and repo updates flow into one activity stream."
  },
  {
    icon: Network,
    label: "cluster",
    title: "Skill Graph",
    metric: "4 clusters",
    desc: "AI, backend, frontend, and cloud tools stay connected around Python-first engineering workflows."
  },
  {
    icon: GitBranch,
    label: "ship",
    title: "Deploy Loop",
    metric: "53 repos",
    desc: "Experiments become APIs, dashboards, explainability reports, and portfolio-ready production demos."
  }
];

function useTypedWords(words: string[]) {
  const [wordIndex, setWordIndex] = useState(0);
  const [slice, setSlice] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const atEnd = slice === current.length;
    const atStart = slice === 0;
    const delay = deleting ? 38 : atEnd ? 1100 : 72;
    const timer = window.setTimeout(() => {
      if (!deleting && atEnd) {
        setDeleting(true);
        return;
      }
      if (deleting && atStart) {
        setDeleting(false);
        setWordIndex((value) => (value + 1) % words.length);
        return;
      }
      setSlice((value) => value + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [deleting, slice, wordIndex, words]);

  return words[wordIndex].slice(0, slice);
}

function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    const points = Array.from({ length: 86 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00062,
      vy: (Math.random() - 0.5) * 0.00062,
      size: index % 7 === 0 ? 2.1 : index % 4 === 0 ? 1.55 : 1.05,
      hue: index % 5 === 0 ? "cyan" : index % 3 === 0 ? "purple" : "green"
    }));
    let mouse = { x: 0.5, y: 0.35, active: false };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.32, 0, width * 0.5, height * 0.32, Math.max(width, height) * 0.7);
      gradient.addColorStop(0, "rgba(63,185,80,.045)");
      gradient.addColorStop(0.5, "rgba(88,166,255,.018)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      points.forEach((point, index) => {
        if (mouse.active) {
          const dx = point.x - mouse.x;
          const dy = point.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18 && dist > 0.001) {
            point.vx += (dx / dist) * 0.000012;
            point.vy += (dy / dist) * 0.000012;
          }
        }

        point.x += point.vx;
        point.y += point.vy;
        point.vx *= 0.995;
        point.vy *= 0.995;
        if (point.x < 0 || point.x > 1) point.vx *= -1;
        if (point.y < 0 || point.y > 1) point.vy *= -1;
        point.x = Math.max(0.01, Math.min(0.99, point.x));
        point.y = Math.max(0.01, Math.min(0.99, point.y));

        const px = point.x * width;
        const py = point.y * height;
        ctx.beginPath();
        ctx.arc(px, py, point.size, 0, Math.PI * 2);
        ctx.fillStyle =
          point.hue === "cyan"
            ? "rgba(88,166,255,.52)"
            : point.hue === "purple"
              ? "rgba(188,140,255,.44)"
              : "rgba(63,185,80,.48)";
        ctx.fill();

        for (let j = index + 1; j < points.length; j += 1) {
          const other = points[j];
          const ox = other.x * width;
          const oy = other.y * height;
          const dist = Math.hypot(px - ox, py - oy);
          if (dist < 152) {
            const alpha = 0.18 * (1 - dist / 152);
            ctx.strokeStyle = index % 4 === 0 ? `rgba(88,166,255,${alpha})` : `rgba(63,185,80,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(ox, oy);
            ctx.stroke();
          }
        }
      });
    };

    const move = (event: MouseEvent) => {
      mouse = { x: event.clientX / width, y: event.clientY / height, active: true };
    };

    const leave = () => {
      mouse.active = false;
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className="background-canvas" aria-hidden="true" />;
}

function ContributionGrid() {
  const fallbackCells = useMemo(() => {
    return Array.from({ length: 168 }, (_, index) => {
      const wave = Math.sin(index * 0.41) + Math.cos(index * 0.17);
      const count = Math.max(0, Math.round((wave + 2 + (index % 11 === 0 ? 1 : 0)) * 3));
      return { level: Math.max(0, Math.min(4, Math.ceil(count / 3))), count, date: "" };
    });
  }, []);
  const [cells, setCells] = useState(fallbackCells);
  const [total, setTotal] = useState(1248);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadContributions() {
      try {
        const response = await fetch("https://github-contributions-api.jogruber.de/v4/kuppireddybhageerathareddy1110?y=last", {
          cache: "no-store"
        });
        if (!response.ok) return;
        const payload = await response.json();
        const contributions = Array.isArray(payload.contributions) ? payload.contributions.slice(-168) : [];
        if (!contributions.length || cancelled) return;
        const nextCells = contributions.map((item: { count?: number; date?: string }) => {
          const count = Number(item.count ?? 0);
          return {
            count,
            date: item.date ?? "",
            level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4
          };
        });
        setCells(nextCells);
        setTotal(Number(payload.total?.lastYear ?? nextCells.reduce((sum: number, item: { count: number }) => sum + item.count, 0)));
        setLive(true);
      } catch {
        setLive(false);
      }
    }

    loadContributions();
    return () => {
      cancelled = true;
    };
  }, []);

  const peak = Math.max(1, ...cells.map((cell) => cell.count));
  const last14 = cells.slice(-14);

  return (
    <div className="contribution-card">
      <div className="panel-top">
        <span>
          <strong>{total.toLocaleString()}</strong> contributions in the last year
        </span>
        <span>{live ? "live GitHub feed" : "fallback graph"} · kuppireddybhageerathareddy1110</span>
      </div>
      <div className="contrib-grid" aria-label="GitHub contribution style activity graph">
        {cells.map((cell, index) => (
          <span
            key={`${cell.date}-${index}`}
            className={`contrib-cell level-${cell.level}`}
            title={cell.date ? `${cell.date}: ${cell.count} contributions` : `${cell.count} contributions`}
          />
        ))}
      </div>
      <div className="contrib-bars" aria-label="Recent GitHub contribution bars">
        {last14.map((cell, index) => (
          <span key={`${cell.date}-bar-${index}`} style={{ "--h": `${Math.max(10, (cell.count / peak) * 100)}%` } as React.CSSProperties} />
        ))}
      </div>
      <div className="legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`contrib-cell level-${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function SkillGraph() {
  const nodes = [
    { name: "Python", x: 50, y: 50, color: "green", cluster: "Core" },
    { name: "TensorFlow", x: 25, y: 28, color: "purple", cluster: "AI" },
    { name: "PyTorch", x: 74, y: 28, color: "purple", cluster: "AI" },
    { name: "FastAPI", x: 23, y: 69, color: "cyan", cluster: "Backend" },
    { name: "Next.js", x: 78, y: 67, color: "cyan", cluster: "Frontend" },
    { name: "SHAP", x: 50, y: 80, color: "amber", cluster: "Explainability" },
    { name: "Docker", x: 50, y: 18, color: "red", cluster: "Cloud" },
    { name: "MongoDB", x: 14, y: 48, color: "green", cluster: "Data" },
    { name: "AWS", x: 86, y: 49, color: "red", cluster: "Cloud" }
  ];

  return (
    <div className="skill-map">
      <div className="skill-map-head">
        <span>moving graph</span>
        <strong>clusters: AI / Web / Cloud / Explainability</strong>
      </div>
      <svg viewBox="0 0 100 100" role="img" aria-label="Animated clustered skill graph">
        <defs>
          <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="cluster cluster-ai">
          <ellipse cx="49" cy="28" rx="32" ry="17" />
          <text x="49" y="10">AI cluster</text>
        </g>
        <g className="cluster cluster-web">
          <ellipse cx="50" cy="68" rx="37" ry="19" />
          <text x="50" y="95">workflow cluster</text>
        </g>
        <g className="cluster cluster-cloud">
          <ellipse cx="68" cy="34" rx="31" ry="28" />
        </g>
        {nodes.slice(1).map((node, index) => (
          <line
            key={node.name}
            className="graph-edge"
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            style={{ "--edge-delay": `${index * 0.18}s` } as React.CSSProperties}
          />
        ))}
        <path className="graph-orbit" d="M 22 50 C 30 11, 72 11, 82 50 C 72 91, 30 91, 22 50 Z" />
        {nodes.map((node, index) => (
          <g
            key={node.name}
            className={`node node-${node.color}`}
            transform={`translate(${node.x} ${node.y})`}
            style={{ "--node-delay": `${index * 0.12}s` } as React.CSSProperties}
          >
            <circle r="6" />
            <text y="-9">{node.name}</text>
            <title>{node.cluster}</title>
          </g>
        ))}
      </svg>
      <div className="cluster-legend">
        {["AI models", "API layer", "Frontend", "Cloud ops"].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Plot3D() {
  const points = [
    { x: 18, y: 68, z: 0.35, label: "EDA" },
    { x: 30, y: 48, z: 0.55, label: "features" },
    { x: 43, y: 38, z: 0.86, label: "AutoML" },
    { x: 58, y: 30, z: 0.72, label: "SHAP" },
    { x: 72, y: 24, z: 0.94, label: "deploy" },
    { x: 82, y: 44, z: 0.62, label: "monitor" },
    { x: 65, y: 62, z: 0.48, label: "API" },
    { x: 40, y: 70, z: 0.4, label: "UI" }
  ];

  return (
    <div className="plot-card">
      <div className="panel-top">
        <span>
          <strong>3D plot</strong> model workflow surface
        </span>
        <span>accuracy x explainability x deployability</span>
      </div>
      <div className="plot-stage" aria-label="Animated 3D workflow plot">
        <div className="plot-cube">
          <span className="axis axis-x">x</span>
          <span className="axis axis-y">y</span>
          <span className="axis axis-z">z</span>
          {points.map((point, index) => (
            <i
              key={point.label}
              title={point.label}
              style={
                {
                  "--px": `${point.x}%`,
                  "--py": `${point.y}%`,
                  "--pz": point.z,
                  "--delay": `${index * 0.16}s`
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RealtimeWorkflowPanel() {
  return (
    <div className="workflow-panel">
      {workflowStages.map(({ icon: Icon, label, title, metric, desc }, index) => (
        <article key={title} style={{ "--step": index } as React.CSSProperties}>
          <div className="workflow-icon">
            <Icon size={18} />
          </div>
          <div>
            <span>{label}</span>
            <h3>{title}</h3>
            <strong>{metric}</strong>
            <p>{desc}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ChessBoard() {
  return (
    <span className="mini-board" aria-hidden="true">
      {Array.from({ length: 64 }, (_, index) => (
        <span key={index} className={(Math.floor(index / 8) + index) % 2 ? "dark" : "light"} />
      ))}
    </span>
  );
}

export default function Home() {
  const typedRole = useTypedWords(roles);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [shuffled, setShuffled] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const visibleProjects = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? projects
        : projects.filter((project) =>
            project.tags.some((tag) => tag.toLowerCase().includes(activeFilter.toLowerCase()))
          );
    return shuffled ? [...filtered].reverse() : filtered;
  }, [activeFilter, shuffled]);

  return (
    <>
      <BackgroundCanvas />
      <FloatingChessPieces />
      {!booted && (
        <div className="preloader">
          <p>[ OK ] Starting kernel bhageeratha-5.15.0...</p>
          <p>[ OK ] Loading ml_stack.ko tensorflow pytorch xgboost...</p>
          <p>[ OK ] Mounting /dev/portfolio on /home/bhageeratha...</p>
          <p>[ OK ] Welcome to Bhageeratha&apos;s Dev Environment</p>
          <span />
        </div>
      )}

      <a href="#contact" className="hire-link">
        $ hire --me
      </a>
      <aside className="side-rail" aria-label="Chess navigation">
        {["♔", "♕", "♖", "♗", "♘", "♙"].map((piece, index) => (
          <a key={piece} href={["#hero", "#skills", "#experience", "#projects", "#badges", "#contact"][index]}>
            {piece}
          </a>
        ))}
      </aside>

      <nav className="nav">
        <a href="#hero" className="brand" aria-label="Bhageeratha portfolio home">
          <Image src="/bhageeratha_profile.jpg" alt="" width={30} height={30} />
          <span className="brand-green">bhageeratha</span>
          <span>@</span>
          <span className="brand-blue">portfolio</span>
          <span>:~$</span>
        </a>

        <div className="nav-links">
          {navItems.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="icon-button menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      )}

      <main>
        <section id="hero" className="hero section">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <div className="avatar-block">
                <div className="avatar-ring" />
                <Image src="/bhageeratha_profile.jpg" alt="Bhageeratha Reddy" width={116} height={116} priority />
                <span />
              </div>
              <p className="terminal-comment">// Hello, World! Let&apos;s build intelligent systems.</p>
              <h1>
                Kuppireddy
                <br />
                <em>Bhageeratha Reddy</em>
                <ChessBoard />
              </h1>
              <p className="typed-line">
                <span>{typedRole}</span>
                <b />
              </p>
              <div className="chips">
                {["AI Engineer", "Data Scientist", "Full-Stack Dev", "Java HPC", "NLP", "Computer Vision"].map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <div className="hero-actions">
                <a className="button primary" href="#projects">
                  <Code2 size={16} />
                  View Repos
                </a>
                <a className="button" href="/resume_bhagi.pdf" target="_blank" rel="noreferrer">
                  <Download size={16} />
                  Resume
                </a>
                <a className="button" href="https://github.com/kuppireddybhageerathareddy1110" target="_blank" rel="noreferrer">
                  <Github size={16} />
                  GitHub
                </a>
              </div>
            </div>

            <div className="hero-console">
              <div className="terminal-panel">
                <div className="terminal-bar">
                  <i />
                  <i />
                  <i />
                  <span>bhageeratha@arch - bash - 90x24</span>
                </div>
                <div className="terminal-body">
                  <p>
                    <b>bhageeratha@arch</b>:<span>~/</span>$ python3 -c &quot;import me; me.introduce()&quot;
                  </p>
                  <p className="ok">✓ Loaded: tensorflow, pytorch, xgboost, lightgbm, shap, optuna</p>
                  <p className="info">→ Name : Kuppireddy Bhageeratha Reddy</p>
                  <p className="info">→ Role : AI Engineer | Full-Stack Dev | Java HPC</p>
                  <p className="info">→ Focus: NLP, Deep Learning, AutoML, Computer Vision</p>
                  <p className="ok">✓ Flagship: AutoML-STUDIO - live @ automl-studio.netlify.app</p>
                  <p className="ok">✓ CGPA 8.87 - VIT-AP University 2022-2026 - 53 repos</p>
                  <p className="prompt">
                    <b>bhageeratha@arch</b>:<span>~/</span>$ deploy --portfolio --nextjs
                  </p>
                </div>
              </div>
              <ContributionGrid />
            </div>
          </div>
        </section>

        <section className="lotm-section" aria-label="The Fool chess strategy visual">
          <div className="wrap lotm-frame">
            <div className="lotm-image">
              <Image src="/lotm-fool-chess.png" alt="The Fool playing chess in a cathedral-inspired scene" fill sizes="(max-width: 980px) 100vw, 1120px" priority />
              <div className="lotm-orbit">
                {["♔", "♕", "♖", "♗", "♘", "♙"].map((piece, index) => (
                  <span key={piece} style={{ "--i": index } as React.CSSProperties}>
                    {piece}
                  </span>
                ))}
              </div>
            </div>
            <div className="lotm-copy">
              <p>$ strategy --from-lotm --mode=chess</p>
              <h2>The Fool&apos;s Board</h2>
              <span>
                
              </span>
            </div>
          </div>
        </section>

        <section className="chess-strip" aria-label="Chess skill roles">
          <div className="wrap chess-grid">
            {chessRoles.map(([piece, role, title, desc]) => (
              <article key={role}>
                <strong>{piece}</strong>
                <span>{role}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section">
          <div className="wrap">
            <SectionHeading icon="♕" command="$ ls -la ~/skills/ | tree" title="Skills & Stack" />
            <div className="skills-layout">
              <div className="file-tree">
                <p>
                  <span className="cyan">bhageeratha@arch</span>:<span className="cyan">~/skills</span>$ tree .
                </p>
                {Object.entries(skills).map(([folder, items]) => (
                  <div key={folder} className="tree-group">
                    <p>
                      ├── <span className="cyan">{folder}/</span>
                    </p>
                    {items.map((item, index) => (
                      <p key={item}>
                        │ {index === items.length - 1 ? "└──" : "├──"} <span>{item}</span>
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <SkillGraph />
            </div>
          </div>
        </section>

        <section id="workflows" className="section">
          <div className="wrap">
            <SectionHeading icon="â™›" command="$ watch -n 1 ./workflow_activity.sh" title="Realtime Workflows" />
            <div className="workflow-layout">
              <RealtimeWorkflowPanel />
              <ContributionGrid />
              <Plot3D />
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="wrap">
            <SectionHeading icon="♖" command="$ git log --oneline --graph career" title="Experience Timeline" />
            <div className="git-log">
              <div className="log-head">
                <span>commit graph</span>
                <span>branch: main</span>
                <span>status: building</span>
              </div>
              {experience.map((item) => (
                <article key={item.hash} className="commit">
                  <div className="commit-rail">
                    <span />
                    <i />
                  </div>
                  <div>
                    <code>{item.hash}</code>
                    <h3>{item.title}</h3>
                    <p className="commit-meta">{item.meta}</p>
                    <p>{item.desc}</p>
                    <div className="tags">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="wrap">
            <SectionHeading icon="♗" command="$ gh repo list --topic ai" title="Repository Board" />
            <div className="project-controls">
              {["all", "NLP", "AutoML", "CV", "IoT"].map((filter) => (
                <button key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>
                  {filter}
                </button>
              ))}
              <button className="shuffle" onClick={() => setShuffled((value) => !value)}>
                <Shuffle size={14} />
                shuffle
              </button>
            </div>
            <div className="project-grid">
              {visibleProjects.map((project) => (
                <article key={project.title} className={project.featured ? "project-card featured" : "project-card"}>
                  <div className="project-visual">
                    <span style={{ color: project.color }}>{project.featured ? "♕" : "♗"}</span>
                    <i />
                  </div>
                  <div className="project-body">
                    <p className="project-lang">
                      <span style={{ background: project.color }} />
                      {project.lang}
                    </p>
                    <h3>{project.title}</h3>
                    <p>{project.desc}</p>
                    <div className="tags">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <a href={project.href ?? "https://github.com/kuppireddybhageerathareddy1110"} target="_blank" rel="noreferrer">
                    open repo <ArrowUpRight size={14} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="badges" className="section">
          <div className="wrap">
            <SectionHeading icon="♘" command="$ open ~/certifications" title="Badges & Credentials" />
            <div className="badge-grid">
              {badges.map(([name, src]) => (
                <article key={name} className="badge-card">
                  <Image src={src} alt={name} width={130} height={130} loading="eager" unoptimized />
                  <h3>{name}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="wrap contact-grid">
            <div>
              <SectionHeading icon="♙" command="$ ./connect.sh" title="Contact" />
              <p className="contact-copy">
                Available for AI engineering, data science, full-stack product work, and research-heavy builds where the model has to meet the user interface cleanly.
              </p>
              <div className="contact-actions">
                <a className="button primary" href="mailto:bhageerathareddykuppireddy@gmail.com">
                  <Mail size={16} />
                  Email
                </a>
                <a className="button" href="https://github.com/kuppireddybhageerathareddy1110" target="_blank" rel="noreferrer">
                  <Github size={16} />
                  GitHub
                </a>
              </div>
            </div>
            <div className="terminal-panel contact-terminal">
              <div className="terminal-bar">
                <i />
                <i />
                <i />
                <span>contact.sh</span>
              </div>
              <div className="terminal-body">
                <p>$ chmod +x connect.sh</p>
                <p className="ok">✓ email: bhageerathareddykuppireddy@gmail.com</p>
                <p className="ok">✓ github: /kuppireddybhageerathareddy1110</p>
                <p className="info">→ response_mode: direct, technical, collaborative</p>
                <p className="prompt">$ status --open-to-work</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function FloatingChessPieces() {
  const pieces = ["♜", "♞", "♛", "♘", "♝", "♚", "♟", "♗", "♖", "♕", "♙", "♜", "♞", "♝"];

  return (
    <div className="floating-chess" aria-hidden="true">
      {pieces.map((piece, index) => (
        <span
          key={`${piece}-${index}`}
          style={
            {
              "--x": `${4 + ((index * 13) % 92)}%`,
              "--delay": `-${(index * 1.9) % 18}s`,
              "--duration": `${18 + (index % 7) * 3}s`,
              "--size": `${1.1 + (index % 5) * 0.22}rem`,
              "--drift": `${index % 2 === 0 ? 38 : -38}px`
            } as React.CSSProperties
          }
        >
          {piece}
        </span>
      ))}
    </div>
  );
}

function SectionHeading({ icon, command, title }: { icon: string; command: string; title: string }) {
  return (
    <header className="section-heading">
      <p>{command}</p>
      <h2>
        <span>{icon}</span>
        {title}
      </h2>
    </header>
  );
}
