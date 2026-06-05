"use client";

import { useState } from "react";
import Image from "next/image";
import { Crown, Sparkles } from "lucide-react";

export default function ProfilePokerCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="poker-card-perspective"
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => { if (e.key === "Enter") setIsFlipped(!isFlipped); }}
      role="button"
      tabIndex={0}
      aria-label="Flip profile card"
    >
      <div className={`poker-card ${isFlipped ? "poker-card--flipped" : ""}`}>
        {/* FRONT — King Poker Card with Profile Photo */}
        <div className="poker-card__face poker-card__front">
          {/* Card corner symbols */}
          <div className="poker-corner poker-corner--tl">
            <span className="poker-rank">K</span>
            <span className="poker-suit">♠</span>
          </div>
          <div className="poker-corner poker-corner--br">
            <span className="poker-rank">K</span>
            <span className="poker-suit">♠</span>
          </div>

          {/* Decorative gold border lines */}
          <div className="poker-border-glow" />

          {/* Central portrait */}
          <div className="poker-portrait">
            <div className="poker-portrait-ring">
              <Image
                src="/bhageeratha_profile.jpg"
                alt="Kuppireddy Bhageeratha Reddy"
                width={180}
                height={180}
                className="poker-portrait-img"
                priority
              />
            </div>
            {/* Crown above */}
            <div className="poker-crown">
              <Crown size={28} />
            </div>
          </div>

          {/* Name plate */}
          <div className="poker-nameplate">
            <div className="poker-name">Bhageeratha</div>
            <div className="poker-title-text">AI Engineer</div>
          </div>

          {/* Shimmer overlay */}
          <div className="poker-shimmer" />

          {/* Floating sparkles */}
          <Sparkles className="poker-sparkle poker-sparkle--1" size={14} />
          <Sparkles className="poker-sparkle poker-sparkle--2" size={10} />
          <Sparkles className="poker-sparkle poker-sparkle--3" size={12} />
        </div>

        {/* BACK — Royal Pattern */}
        <div className="poker-card__face poker-card__back">
          <div className="poker-back-pattern">
            <div className="poker-back-inner">
              <div className="poker-back-diamond">♦</div>
              <div className="poker-back-text">PORTFOLIO</div>
              <div className="poker-back-year">2026</div>
            </div>
          </div>
        </div>
      </div>

      <div className="poker-hint mono">Click to flip</div>
    </div>
  );
}
