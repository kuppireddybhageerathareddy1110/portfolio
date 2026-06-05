"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ArrowUpRight, 
  Download, 
  GitBranch, 
  Mail, 
  Menu, 
  X, 
  Code2, 
  Brain, 
  Zap,
  Crown,
  Shield,
  BookOpen,
  Compass
} from "lucide-react";
import { toast } from "sonner";
import HeroScene from "./components/HeroScene";
import SkillsOrb from "./components/SkillsOrb";
import Playground3D from "./components/Playground3D";
import ProjectPreview3D from "./components/ProjectPreview3D";
import ContributionGlobe from "./components/ContributionGlobe";
import BackgroundCanvas from "./components/BackgroundCanvas";
import ParallaxCard from "./components/ParallaxCard";
import ProfilePokerCard from "./components/ProfilePokerCard";
import FloatingChess from "./components/FloatingChess";
import ScrollProgress from "./components/ScrollProgress";
import GitHubStats from "./components/GitHubStats";
import Reveal from "./components/Reveal";
import LazyCanvas from "./components/LazyCanvas";

const navItems = [
  { label: "skills", href: "#skills" },
  { label: "workflows", href: "#workflows" },
  { label: "experience", href: "#experience" },
  { label: "impact", href: "#impact" },
  { label: "projects", href: "#projects" },
  { label: "3d lab", href: "#lab" },
  { label: "contact", href: "#contact" },
];

const roles = [
  "AI Engineer",
  "Data Scientist",
  "Full-Stack Developer",
  "NLP & CV Builder",
  "AutoML Architect",
];

const skills = {
  languages: ["Python", "TypeScript", "Java", "C++", "R"],
  ai_ml: ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost", "SHAP", "Transformers", "OpenCV", "NLTK"],
  web: ["Next.js", "React", "FastAPI", "Flask", "Tailwind"],
  infra: ["Docker", "AWS", "MongoDB", "PostgreSQL", "Git"],
};

const experience = [
  {
    hash: "a17f4d2",
    title: "Built AutoML-STUDIO",
    meta: "Flagship Project • 2024",
    desc: "Production AutoML platform with full EDA, model training, SHAP explainability, Optuna tuning, and one-click deployment. Live at automl-studio.netlify.app",
    tags: ["AutoML", "SHAP", "FastAPI", "Next.js"],
  },
  {
    hash: "c49b9e1",
    title: "B.Tech Computer Science",
    meta: "VIT-AP University • 2022 — 2026",
    desc: "CGPA 8.87. Applied research in NLP, Computer Vision, Cloud Architecture and Data Visualization. 50+ open source repositories.",
    tags: ["CS", "AI/ML", "HPC", "8.87 CGPA"],
  },
  {
    hash: "e31d8aa",
    title: "Production AI & Full-Stack",
    meta: "53 Repositories • Open Source",
    desc: "Built reusable APIs, intelligent dashboards, model demos, and production-grade applications using modern web + AI stacks.",
    tags: ["Next.js", "FastAPI", "Docker", "ML Ops"],
  },
];

const projects = [
  {
    title: "AutoML-STUDIO",
    desc: "Full-stack AutoML cockpit. Upload data, run experiments, get SHAP explanations, tune with Optuna, deploy instantly.",
    lang: "Python + TS",
    color: "#3fb950",
    tags: ["AutoML", "SHAP", "Optuna", "FastAPI"],
    href: "https://automl-studio.netlify.app",
    type: "automl",
    featured: true,
  },
  {
    title: "Medical Chatbot",
    desc: "Context-aware medical Q&A using SBERT + BioBERT embeddings with clean conversational UI and retrieval patterns.",
    lang: "Python",
    color: "#58a6ff",
    tags: ["NLP", "BioBERT", "Flask", "LLM"],
    href: "https://github.com/kuppireddybhageerathareddy1110/bot1",
    type: "nlp",
  },
  {
    title: "Sentiment Analysis Engine",
    desc: "Explainable text classification pipeline with preprocessing, feature importance, and live prediction dashboard.",
    lang: "Python",
    color: "#bc8cff",
    tags: ["NLTK", "Sklearn", "LIME"],
    href: "https://github.com/kuppireddybhageerathareddy1110/mm",
    type: "nlp",
  },
  {
    title: "Drowsiness Detection",
    desc: "Real-time computer vision system tracking eye state and attention using OpenCV for safety applications.",
    lang: "Python",
    color: "#e3b341",
    tags: ["OpenCV", "CV", "Safety"],
    href: "https://github.com/kuppireddybhageerathareddy1110",
    type: "cv",
  },
  {
    title: "Gas Detection IoT",
    desc: "Sensor-driven risk monitoring system with alerting logic, environment analytics and C++ embedded logic.",
    lang: "C++",
    color: "#f85149",
    tags: ["IoT", "Sensors", "Embedded"],
    href: "https://github.com/kuppireddybhageerathareddy1110",
    type: "default",
  },
  {
    title: "Text-to-Image AI",
    desc: "Multimodal diffusion research — realistic and consistent text-to-image generation using transformer architecture.",
    lang: "PyTorch",
    color: "#bc8cff",
    tags: ["Diffusion", "Multimodal", "Research"],
    href: "https://github.com/kuppireddybhageerathareddy1110/Towards-Realistic-and-Consistent-Text-to-Image-Generation-with-Multimodal-AI",
    type: "cv",
  },
];

const badges = [
  {
    title: "Applied Data Science with Python",
    issuer: "IBM Skills Network",
    image: "/applied-data-science-with-python-level-2.png",
  },
  {
    title: "AWS Academy Cloud Architecting",
    issuer: "AWS Academy",
    image: "/aws-academy-graduate-aws-academy-cloud-architecting.png",
  },
  {
    title: "Deep Learning using TensorFlow",
    issuer: "IBM Skills Network",
    image: "/deep-learning-using-tensorflow.png",
  },
  {
    title: "Data Visualization with R",
    issuer: "IBM Skills Network",
    image: "/data-visualization-with-r.png",
  },
  {
    title: "Oracle Cloud Infrastructure Data Science",
    issuer: "Oracle Certified Professional",
    image: "/oci-data-science.png",
  },
  {
    title: "Adobe Express",
    issuer: "Adobe",
    image: "/adobe-express.png",
  },
];

export default function Portfolio() {
  const [theme, setTheme] = useState<"chess" | "knight" | "poet" | "king">("chess");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booted, setBooted] = useState(false);
  const [showResume, setShowResume] = useState(false);

  // Boot preloader
  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 1650);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase())));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 850));

    toast.success("Message received. I'll get back to you soon.", {
      description: "Thanks for reaching out!",
      duration: 4000,
    });

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className={`theme-${theme} theme-container min-h-screen overflow-x-hidden relative`}>
      <ScrollProgress />
      <BackgroundCanvas />
      <FloatingChess theme={theme} />

      {/* Preloader */}
      {!booted && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0c10] flex flex-col items-center justify-center gap-3 font-mono text-[#3fb950] text-sm">
          <div>[ OK ] Starting kernel bhageeratha-5.15.0...</div>
          <div>[ OK ] Loading ml_stack.ko threejs fiber drei...</div>
          <div>[ OK ] Mounting /dev/portfolio on /home/bhageeratha...</div>
          <div>[ OK ] Welcome to Bhageeratha&apos;s 3D Dev Environment</div>
          <div className="w-64 h-1 bg-[#1a1f28] rounded mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3fb950] to-[#58a6ff] animate-[progress_1.6s_ease_forwards]" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#hero" className="nav-logo">
            <span className="accent">bhageeratha</span>
            <span className="text-[#8b949e]">@</span>
            <span>portfolio</span>
            <span className="text-[#8b949e] ml-1">:~$</span>
          </a>

          <div className="nav-links hidden md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <a 
              href="https://github.com/kuppireddybhageerathareddy1110" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary hidden sm:flex items-center gap-2 text-sm"
            >
              <GitBranch size={15} /> GitHub
            </a>
            <a href="#contact" className="hire-btn hidden sm:inline-flex">
              $ hire --me
            </a>
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden p-2 text-[#8b949e] hover:text-white"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#30363d] bg-[#12151c] px-6 py-6 flex flex-col gap-1 text-sm">
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="py-2.5 text-[#8b949e] hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a 
              href="https://github.com/kuppireddybhageerathareddy1110" 
              target="_blank" 
              className="py-2.5 flex items-center gap-2 text-[#8b949e]"
            >
              <GitBranch size={16} /> GitHub
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="profile-lockup">
              <Image src="/bhageeratha_profile.jpg" alt="Kuppireddy Bhageeratha Reddy" width={96} height={96} priority />
              <div>
                <div className="mono text-xs text-[#3fb950]">online / available</div>
                <div className="text-sm text-[#8b949e]">AI Engineer Portfolio</div>
              </div>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#30363d] px-3 py-1 text-xs text-[#8b949e] mono">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
              OPEN TO OPPORTUNITIES • 2026
            </div>

            <h1>
              Kuppireddy<br />
              <span className="name">Bhageeratha Reddy</span>
            </h1>

            <div className="hero-subtitle">
              {roles[0]} <span className="text-[#58a6ff]">•</span> {roles[1]}
            </div>

            <p className="hero-desc">
              I build intelligent systems that combine deep learning, production APIs, and beautiful interfaces. 
              Passionate about AutoML, NLP, Computer Vision, and making complex models usable.
            </p>

            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                <Code2 size={17} /> View Projects
              </a>
              <a 
                href="https://github.com/kuppireddybhageerathareddy1110" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
              >
                <GitBranch size={17} /> GitHub (53 repos)
              </a>
              <a 
                href="#contact" 
                className="btn btn-secondary flex items-center gap-2"
              >
                <Mail size={17} /> Get in touch
              </a>
              <button 
                onClick={() => setShowResume(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={17} /> Resume
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-[#8b949e] mono">
              <div>VIT-AP • CGPA 8.87</div>
              <div className="w-px h-3 bg-[#30363d]" />
              <div>AutoML-STUDIO live</div>
            </div>

            <div className="term">
              <div className="term-bar">
                <span className="td td-r" />
                <span className="td td-y" />
                <span className="td td-g" />
                <span className="term-title">~/portfolio/boot.sh</span>
              </div>
              <div className="term-body">
                <span className="tp">bhageeratha@portfolio</span><span className="tsym">:</span><span className="tpath">~/ai-lab</span><span className="tsym">$</span> npm run build<br />
                <span className="to to-ok">[OK] Next.js + Three.js portfolio compiled</span>
                <span className="to to-i">[INFO] AutoML, NLP, CV, cloud systems loaded</span>
                <span className="to to-ok">[READY] open to AI engineering opportunities</span>
              </div>
            </div>
          </div>

          {/* 3D HERO SCENE */}
          <div className="relative">
            <HeroScene theme={theme} />
          </div>
        </div>
      </section>

      {/* ABOUT / INTRO */}
      <section className="section max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
            <div className="max-w-2xl">
              <div className="section-tag">WHO I AM</div>
              <h2 className="section-title mb-6">I turn data into <span>deployed intelligence</span>.</h2>
              <p className="text-lg text-[#8b949e] leading-relaxed">
                Data Scientist and AI Engineer with a strong foundation in building end-to-end intelligent systems. 
                I love the intersection of research-grade models and polished, production-ready products. 
                Currently exploring advanced AutoML workflows, multimodal models, and 3D visualization of ML pipelines.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <ProfilePokerCard />
            </div>
          </div>
        </Reveal>
      </section>

      {/* SKILLS */}
      <section id="skills" className="section bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">$ ls ~/skills</div>
              <h2 className="section-title">Skills &amp; Stack</h2>
            </div>

            <div className="skills-grid mb-8">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category} className="skill-card card-hover">
                  <h3 className="capitalize">{category.replace("_", " ")}</h3>
                  <div className="skill-tags">
                    {items.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 3D SKILLS ORB — THE STAR FEATURE */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <span className="text-sm text-[#8b949e] mono">INTERACTIVE 3D ORBITAL SYSTEM</span>
                  <div className="text-xl font-semibold tracking-tight">Skill Graph • Drag to explore</div>
                </div>
                <div className="text-xs text-[#8b949e] mono hidden md:block">Powered by React Three Fiber</div>
              </div>
              <SkillsOrb theme={theme} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* WORKFLOWS + 3D */}
      <section id="workflows" className="section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">$ watch -n 1 ./ml_pipeline.sh</div>
              <h2 className="section-title">Realtime Workflows</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {[
                { icon: Brain, title: "Ingest & EDA", desc: "Live data pipelines feeding into statistical profiling and feature engineering." },
                { icon: Zap, title: "Train & Explain", desc: "AutoML + SHAP. Every model is interpretable by default." },
                { icon: Code2, title: "Ship & Monitor", desc: "FastAPI → Docker → Cloud. Dashboards, alerts, and continuous evaluation." },
              ].map((item, idx) => (
                <div key={idx} className="glass p-7 rounded-2xl border border-[#30363d]">
                  <div className="w-10 h-10 rounded-xl bg-[#3fb950]/10 text-[#3fb950] flex items-center justify-center mb-5">
                    <item.icon size={20} />
                  </div>
                  <div className="font-semibold text-xl mb-2">{item.title}</div>
                  <p className="text-[#8b949e] text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* 3D Playground teaser */}
            <div className="text-center mb-6">
              <span className="mono text-xs tracking-[3px] text-[#3fb950]">NEW</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="section">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="section-header text-center">
              <div className="section-tag">GIT LOG — CAREER</div>
              <h2 className="section-title">Experience &amp; Milestones</h2>
            </div>

            <div className="timeline">
              {experience.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot mono">{exp.hash.slice(0, 4)}</div>
                  <div className="timeline-content">
                    <h3>{exp.title}</h3>
                    <div className="timeline-meta">{exp.meta}</div>
                    <p className="text-[#8b949e] mb-4 leading-relaxed">{exp.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map((tag, i) => (
                        <span key={i} className="text-xs mono px-3 py-px border border-[#30363d] rounded-full text-[#8b949e]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* GLOBAL IMPACT & GITHUB LIVE */}
      <section id="impact" className="section bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 items-start">
              <div>
                <div className="section-header">
                  <div className="section-tag">$ git log --global --oneline | wc -l</div>
                  <h2 className="section-title">Global Impact</h2>
                  <p className="max-w-md text-[#8b949e] mt-2">1,248+ contributions across 6 continents. Drag the globe to explore where the work is happening.</p>
                </div>
                <div className="relative mt-6">
                  <ContributionGlobe />
                </div>
              </div>

              <div>
                <div className="section-header">
                  <div className="section-tag">$ curl -s https://api.github.com/users/kuppireddybhageerathareddy1110</div>
                  <h2 className="section-title">GitHub Live Dashboard</h2>
                  <p className="max-w-md text-[#8b949e] mt-2">Live metrics, repository status, and language breakdown synced from active code repositories.</p>
                </div>
                <GitHubStats theme={theme} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROJECTS — WITH 3D PREVIEWS */}
      <section id="projects" className="section bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="section-header flex flex-col md:flex-row md:items-end md:justify-between gap-y-4">
              <div>
                <div className="section-tag">$ gh repo list --topic ai --limit 12</div>
                <h2 className="section-title">Featured Repositories</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "AutoML", "NLP", "CV", "IoT"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`mono text-xs px-4 py-1.5 rounded-full border transition ${
                      activeFilter === filter 
                        ? "bg-[#3fb950] text-[#0a0c10] border-[#3fb950]" 
                        : "border-[#30363d] hover:border-[#3fb950] text-[#8b949e]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="projects-grid">
              {filteredProjects.map((project, index) => (
                <div key={index} className="project-card group card-hover">
                  <ProjectPreview3D type={project.type} color={project.color} />
                  
                  <div className="project-body">
                    <div className="flex items-center justify-between mb-2">
                      <div className="project-title">{project.title}</div>
                      {project.featured && (
                        <div className="text-[10px] px-2.5 py-px rounded bg-[#3fb950]/10 text-[#3fb950] mono">FLAGSHIP</div>
                      )}
                    </div>

                    <p className="project-desc">{project.desc}</p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#30363d]">
                      <div className="project-tags">
                        {project.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="project-tag">{tag}</span>
                        ))}
                      </div>
                      <a 
                        href={project.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#3fb950] hover:underline flex items-center gap-1 text-xs mono font-medium"
                      >
                        OPEN <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3D LAB — THE HIGHLIGHT */}
      <section id="lab" className="section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">$ ./3d_lab --interactive --mode=full</div>
              <h2 className="section-title">3D Design Lab</h2>
              <p className="max-w-md text-[#8b949e] mt-2">Fully interactive Three.js experiences. Orbit, zoom, switch modes. This is what modern portfolios can feel like.</p>
            </div>

            <div className="lab-feature">
              <div className="lab-feature-image relative overflow-hidden h-[260px] min-h-[260px] w-full">
                <ParallaxCard src="/lotm-fool-chess.png" alt="Chess themed project artwork" />
              </div>
              <div>
                <div className="section-tag">FEATURED VISUAL</div>
                <h3>Chess AI concept board</h3>
                <p>
                  Visual asset from the source portfolio folder, paired with the interactive Three.js lab below.
                </p>
              </div>
            </div>

            <Playground3D />
          </Reveal>
        </div>
      </section>

      {/* BADGES */}
      <section className="section max-w-5xl mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">$ cat ~/.credentials</div>
              <h2 className="section-title">Certifications &amp; Badges</h2>
            </div>

            <div className="badges-grid">
              {badges.map((badge, i) => (
                <div key={i} className="badge-card">
                  <Image src={badge.image} alt={`${badge.title} badge`} width={92} height={92} />
                  <div>
                    <h3>{badge.title}</h3>
                    <p>{badge.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section border-t border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">$ ./connect.sh --open</div>
              <h2 className="section-title">Let&apos;s build something<br />intelligent together.</h2>
            </div>

            <div className="contact-grid">
              {/* Form */}
              <div>
                <form onSubmit={handleSubmit} className="contact-form">
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                  <textarea 
                    placeholder="Tell me about the project or opportunity..." 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required 
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="form-btn disabled:opacity-70"
                  >
                    {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                  </button>
                </form>
                <p className="text-[10px] text-[#8b949e] mt-3 mono">This is a live demo — messages are simulated and not stored.</p>
              </div>

              {/* Info */}
              <div className="space-y-8 pt-2">
                <div>
                  <div className="text-sm text-[#8b949e] mb-2">DIRECT</div>
                  <a href="mailto:bhageerathareddykuppireddy@gmail.com" className="block text-2xl font-medium hover:text-[#3fb950] transition-colors">
                    bhageerathareddykuppireddy@gmail.com
                  </a>
                </div>

                <div>
                  <div className="text-sm text-[#8b949e] mb-2">SOCIAL &amp; CODE</div>
                  <div className="space-y-3">
                    <a href="https://github.com/kuppireddybhageerathareddy1110" target="_blank" className="flex items-center gap-3 text-lg hover:text-[#3fb950] group">
                      <GitBranch size={21} /> <span>github.com/kuppireddybhageerathareddy1110</span>
                      <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition" size={15} />
                    </a>
                    <a href="https://automl-studio.netlify.app" target="_blank" className="flex items-center gap-3 text-lg hover:text-[#3fb950] group">
                      <Code2 size={21} /> <span>AutoML-STUDIO — Live Demo</span>
                      <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition" size={15} />
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#30363d]">
                  <div className="text-xs text-[#8b949e] leading-relaxed">
                    Available for AI engineering roles, research collaborations, 
                    consulting on production ML systems, and interesting side quests.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Resume Modal */}
      {showResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setShowResume(false)}>
          <div className="bg-[#12151c] border border-[#30363d] rounded-2xl w-full max-w-2xl p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="mono text-[#3fb950] text-sm">$ cat ~/resume.pdf</div>
                <h3 className="text-2xl font-semibold">Kuppireddy Bhageeratha Reddy — Resume</h3>
              </div>
              <button onClick={() => setShowResume(false)} className="text-[#8b949e] hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-[#8b949e]">
              <div className="glass p-4 rounded-xl">
                <div className="font-semibold text-white mb-1">Education</div>
                <div>B.Tech Computer Science • VIT-AP University • CGPA 8.87 (2022-2026)</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <div className="font-semibold text-white mb-1">Key Projects</div>
                <div>AutoML-STUDIO (Flagship), Medical Chatbot, Sentiment Analysis, Drowsiness Detection, Text-to-Image AI</div>
              </div>
              <div className="glass p-4 rounded-xl">
                <div className="font-semibold text-white mb-1">Core Strengths</div>
                <div>PyTorch • TensorFlow • SHAP • FastAPI • Next.js • Docker • AWS • OpenCV • NLP</div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <a href="#contact" onClick={() => setShowResume(false)} className="btn btn-primary flex-1 justify-center">Hire me for your next project</a>
              <a href="/resume_bhagi.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1 justify-center">
                <Download size={16} /> Open resume
              </a>
            </div>
            <p className="text-[10px] text-[#8b949e] mt-4 text-center mono">Download available on request • 3D portfolio experience included</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-9 text-center text-xs text-[#8b949e] mono">
        <div className="max-w-7xl mx-auto px-6">
          © {new Date().getFullYear()} Kuppireddy Bhageeratha Reddy • Built with Next.js + Three.js • 
          <a href="https://github.com/kuppireddybhageerathareddy1110" className="hover:text-white ml-1">Source on GitHub</a>
        </div>
      </footer>

      {/* Floating Theme Switcher */}
      <div className="theme-switcher">
        {[
          { id: "chess" as const, label: "Chess", icon: Compass },
          { id: "knight" as const, label: "Knight", icon: Shield },
          { id: "poet" as const, label: "Poet", icon: BookOpen },
          { id: "king" as const, label: "King", icon: Crown },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                toast.success(`Switched to ${t.label} Theme`, {
                  description: `Enjoy the custom 3D models and layout style!`,
                  duration: 2000,
                });
              }}
              className={`theme-btn ${theme === t.id ? "active" : ""}`}
              aria-label={`Switch to ${t.label} theme`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
