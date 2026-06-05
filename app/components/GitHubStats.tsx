"use client";

import { useEffect, useState } from "react";
import AnimatedCounter from "./AnimatedCounter";
import GitHubHeatmap from "./GitHubHeatmap";
import { GitBranch, Users, Code, Calendar, Flame, Star, Activity, TrendingUp } from "lucide-react";

interface GitHubStatsProps {
  theme: "chess" | "knight" | "poet" | "king";
}

interface ProfileData {
  followers: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
}

interface RepoData {
  name: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  description: string | null;
  fork: boolean;
}

// Map themes to custom color palettes for github-readme-stats widgets
const themeColors = {
  chess: {
    bg: "0a0c10",
    text: "e6edf3",
    title: "3fb950",
    icon: "58a6ff",
    border: "30363d",
  },
  knight: {
    bg: "111215",
    text: "f5f5f7",
    title: "ff4a4a",
    icon: "8f9ca6",
    border: "3c3e46",
  },
  poet: {
    bg: "12100f",
    text: "f3ece4",
    title: "e3a95d",
    icon: "dec1a0",
    border: "4d3e34",
  },
  king: {
    bg: "110826",
    text: "fcf9f2",
    title: "ffd700",
    icon: "f472b6",
    border: "573b90",
  },
};

export default function GitHubStats({ theme }: GitHubStatsProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [repos, setRepos] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);

  // Fallbacks if GitHub API limits request or fails
  const fallbacks: ProfileData = {
    followers: 12,
    public_repos: 53,
    public_gists: 2,
    created_at: "2022-09-12T00:00:00Z",
  };

  useEffect(() => {
    const username = "kuppireddybhageerathareddy1110";
    
    // Fetch profile
    const profilePromise = fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("GitHub API failed");
        return res.json();
      })
      .then((data) => {
        setProfile({
          followers: data.followers || fallbacks.followers,
          public_repos: data.public_repos || fallbacks.public_repos,
          public_gists: data.public_gists || fallbacks.public_gists,
          created_at: data.created_at || fallbacks.created_at,
        });
      })
      .catch(() => {
        setProfile(fallbacks);
      });

    // Fetch repos for language breakdown & stars
    const reposPromise = fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
      .then((res) => {
        if (!res.ok) throw new Error("Repos API failed");
        return res.json();
      })
      .then((data: RepoData[]) => {
        setRepos(data.filter(r => !r.fork).slice(0, 100));
        const stars = data.reduce((sum: number, r: RepoData) => sum + (r.stargazers_count || 0), 0);
        setTotalStars(stars);
      })
      .catch(() => {
        setRepos([]);
        setTotalStars(8);
      });

    Promise.all([profilePromise, reposPromise]).then(() => setLoading(false));
  }, []);

  const currentColors = themeColors[theme] || themeColors.chess;
  const cardQuery = `username=kuppireddybhageerathareddy1110&show_icons=true&bg_color=${currentColors.bg}&title_color=${currentColors.title}&icon_color=${currentColors.icon}&text_color=${currentColors.text}&border_color=${currentColors.border}&hide_rank=false&count_private=true`;
  const langQuery = `username=kuppireddybhageerathareddy1110&layout=compact&bg_color=${currentColors.bg}&title_color=${currentColors.title}&icon_color=${currentColors.icon}&text_color=${currentColors.text}&border_color=${currentColors.border}&hide_progress=false`;
  const streakQuery = `user=kuppireddybhageerathareddy1110&background=${currentColors.bg}&border=${currentColors.border}&stroke=${currentColors.title}&ring=${currentColors.title}&fire=${currentColors.icon}&currStreakNum=${currentColors.text}&sideNums=${currentColors.text}&currStreakLabel=${currentColors.title}&sideLabels=${currentColors.icon}&dates=${currentColors.text}`;

  const statsUrl = `https://github-readme-stats.vercel.app/api?${cardQuery}`;
  const langUrl = `https://github-readme-stats.vercel.app/api/top-langs/?${cardQuery}&layout=compact`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?${streakQuery}`;

  const creationYear = profile ? new Date(profile.created_at).getFullYear() : 2022;

  // Compute language breakdown from repos
  const langBreakdown = repos.reduce<Record<string, number>>((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const langColors: Record<string, string> = {
    Python: "#3572A5",
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Java: "#b07219",
    "C++": "#f34b7d",
    R: "#198CE7",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Jupyter: "#DA5B0B",
    "Jupyter Notebook": "#DA5B0B",
  };

  const totalLangRepos = Object.values(langBreakdown).reduce((s, c) => s + c, 0) || 1;
  const topLangs = Object.entries(langBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Recent activity from repos
  const recentRepos = repos.slice(0, 5);

  return (
    <div className="w-full space-y-8">
      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="stat-card flex flex-col justify-center items-center">
          <div className="p-2.5 rounded-lg bg-[rgba(var(--accent-rgb),0.06)] text-[var(--accent)] mb-2">
            <GitBranch size={20} />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-[#161b22] animate-pulse rounded" />
          ) : (
            <AnimatedCounter end={profile?.public_repos || fallbacks.public_repos} label="Repositories" />
          )}
        </div>

        <div className="stat-card flex flex-col justify-center items-center">
          <div className="p-2.5 rounded-lg bg-[rgba(var(--accent-rgb),0.06)] text-[var(--accent)] mb-2">
            <Users size={20} />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-[#161b22] animate-pulse rounded" />
          ) : (
            <AnimatedCounter end={profile?.followers || fallbacks.followers} label="Followers" />
          )}
        </div>

        <div className="stat-card flex flex-col justify-center items-center">
          <div className="p-2.5 rounded-lg bg-[rgba(var(--accent-rgb),0.06)] text-[var(--accent)] mb-2">
            <Star size={20} />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-[#161b22] animate-pulse rounded" />
          ) : (
            <AnimatedCounter end={totalStars} label="Total Stars" />
          )}
        </div>

        <div className="stat-card flex flex-col justify-center items-center">
          <div className="p-2.5 rounded-lg bg-[rgba(var(--accent-rgb),0.06)] text-[var(--accent)] mb-2">
            <Calendar size={20} />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-[#161b22] animate-pulse rounded" />
          ) : (
            <AnimatedCounter end={creationYear} label="Active Since" suffix="" duration={1200} />
          )}
        </div>
      </div>

      {/* GitHub heat contribution map */}
      <GitHubHeatmap />

      {/* Live Language Breakdown Bar */}
      {topLangs.length > 0 && (
        <div className="github-lang-breakdown">
          <div className="flex items-center gap-2 mb-3">
            <Code size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold">Language Distribution</span>
            <span className="text-[10px] mono text-[var(--text-muted)] ml-auto">LIVE FROM REPOS</span>
          </div>
          {/* Stacked bar */}
          <div className="github-lang-bar">
            {topLangs.map(([lang, count]) => (
              <div
                key={lang}
                className="github-lang-segment"
                style={{
                  width: `${(count / totalLangRepos) * 100}%`,
                  backgroundColor: langColors[lang] || "var(--accent)",
                }}
                title={`${lang}: ${Math.round((count / totalLangRepos) * 100)}%`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {topLangs.map(([lang, count]) => (
              <div key={lang} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: langColors[lang] || "var(--accent)" }}
                />
                <span className="text-[var(--text-muted)]">{lang}</span>
                <span className="mono text-[var(--text-muted)] opacity-60">{Math.round((count / totalLangRepos) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      {recentRepos.length > 0 && (
        <div className="github-activity-feed">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold">Recent Activity</span>
            <span className="text-[10px] mono text-[var(--text-muted)] ml-auto">
              <TrendingUp size={12} className="inline mr-1" />
              LIVE FEED
            </span>
          </div>
          <div className="space-y-2">
            {recentRepos.map((repo, i) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="github-activity-item"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="github-activity-dot" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{repo.name}</div>
                    {repo.description && (
                      <div className="text-[11px] text-[var(--text-muted)] truncate">{repo.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {repo.language && (
                    <span className="text-[10px] mono px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[var(--accent)]">
                      <Star size={11} /> {repo.stargazers_count}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* SVG Live stats widgets + Streak */}
      <div className="grid md:grid-cols-2 gap-5 pt-2">
        <div className="flex flex-col items-center justify-center p-4 border border-[var(--border)] bg-[var(--bg-2)] rounded-xl relative group transition-all duration-300 hover:border-[var(--accent)] overflow-hidden">
          <div className="text-[10px] mono text-[var(--text-muted)] absolute top-2 right-2 tracking-widest px-2 py-0.5 border border-white/5 rounded-full bg-black/40 z-10">
            LIVE WIDGET
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={statsUrl}
            alt="Bhageeratha's Live GitHub Stats"
            className="max-w-full rounded-md shadow-md select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col items-center justify-center p-4 border border-[var(--border)] bg-[var(--bg-2)] rounded-xl relative group transition-all duration-300 hover:border-[var(--accent)] overflow-hidden">
          <div className="text-[10px] mono text-[var(--text-muted)] absolute top-2 right-2 tracking-widest px-2 py-0.5 border border-white/5 rounded-full bg-black/40 z-10">
            LIVE WIDGET
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={langUrl}
            alt="Bhageeratha's Live Language Stats"
            className="max-w-full rounded-md shadow-md select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Streak Stats Widget */}
      <div className="flex flex-col items-center justify-center p-4 border border-[var(--border)] bg-[var(--bg-2)] rounded-xl relative group transition-all duration-300 hover:border-[var(--accent)] overflow-hidden">
        <div className="text-[10px] mono text-[var(--text-muted)] absolute top-2 right-2 tracking-widest px-2 py-0.5 border border-white/5 rounded-full bg-black/40 z-10 flex items-center gap-1">
          <Flame size={10} /> STREAK
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={streakUrl}
          alt="Bhageeratha's GitHub Streak"
          className="max-w-full rounded-md shadow-md select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
